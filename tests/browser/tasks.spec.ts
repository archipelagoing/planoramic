import {test, expect, Page} from '@playwright/test';

async function navigate(page: Page, name: string) {
  if ((page.viewportSize()?.width || 1440) < 700)
    await page.getByRole('button', {name: 'Open navigation'}).click();
  await page.getByRole('button', {name, exact: true}).click();
  if ((page.viewportSize()?.width || 1440) < 700)
    await expect(
      page.getByRole('button', {name, exact: true}),
    ).not.toBeInViewport();
}
for (const width of [1440, 390])
  test(`shared tasks, people, daily weather ${width}`, async ({
    page,
    browser,
  }, testInfo) => {
    test.setTimeout(90000);
    await page.setViewportSize({width, height: 1000});
    const remote = new Map<string, any>();
    let fail = false;
    const install = async (target: Page) => {
      await target.clock.setFixedTime(new Date('2026-09-22T12:00:00'));
      await target.route('https://api.open-meteo.com/**', route =>
        route.fulfill({
          json: {
            daily: {
              time: ['2026-09-22'],
              weather_code: [0],
              temperature_2m_max: [76],
              temperature_2m_min: [58],
            },
          },
        }),
      );
      await target.route('http://localhost:3001/api/**', async route => {
        const url = new URL(route.request().url());
        const headers = {
          'Access-Control-Allow-Origin': 'http://localhost:8088',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        };
        if (route.request().method() === 'OPTIONS')
          return route.fulfill({status: 204, headers});
        if (url.pathname.endsWith('/session'))
          return route.fulfill({
            headers,
            json: {
              deviceId: 'test',
              workspaceId: 'family',
              deviceCredential: '',
            },
          });
        if (url.pathname.endsWith('/task-calendars'))
          return route.fulfill({
            headers,
            json: {calendars: [{id: 'shared', name: 'Family calendar'}]},
          });
        if (url.pathname.endsWith('/tasks')) {
          if (route.request().method() === 'POST') {
            if (fail)
              return route.fulfill({
                headers,
                status: 503,
                json: {error: {message: 'Sync unavailable'}},
              });
            const body = route.request().postDataJSON();
            if (body.action === 'delete') {
              remote.delete(body.task.id);
              return route.fulfill({headers, json: {deleted: true}});
            }
            const saved = {
              ...body.task,
              calendarId: body.calendarId,
              synced: true,
            };
            remote.set(saved.id, saved);
            return route.fulfill({headers, json: saved});
          }
          return route.fulfill({headers, json: {tasks: [...remote.values()]}});
        }
        return route.fulfill({
          headers,
          json: {
            calendarCount: 1,
            events: [
              {
                id: 'event',
                calendarId: 'work',
                calendarName: 'Work',
                title: 'Planning',
                start: {dateTime: '2026-09-22T09:00:00'},
                end: {dateTime: '2026-09-22T10:00:00'},
                allDay: false,
                location: 'Office',
                description: '',
              },
            ],
          },
        });
      });
    };
    await install(page);
    await page.goto('/');
    await expect(
      page.locator('.day-weather').filter({hasText: '76° / 58°F'}),
    ).toBeVisible();
    await page
      .locator('.week-grid')
      .getByRole('button', {
        name: 'Select Tuesday, September 22, 2026',
        exact: true,
      })
      .click();
    await expect(
      page.getByRole('region', {name: 'Daily schedule'}),
    ).toBeVisible();
    await expect(page.locator('.week-day')).toHaveCount(1);
    await navigate(page, 'Household');
    await page.getByRole('textbox', {name: 'Person name'}).fill('Alice');
    await page.getByRole('radio', {name: 'Green', exact: true}).click();
    await page.getByRole('button', {name: 'Add person'}).click();
    await page
      .getByRole('radiogroup', {name: 'Calendar person'})
      .getByRole('radio', {name: 'Alice'})
      .click();
    await navigate(page, 'Calendar');
    await expect(
      page.locator('.fc-event').filter({hasText: 'Planning'}),
    ).toHaveCSS('border-left-color', 'rgb(83, 156, 130)');
    await navigate(page, 'Settings');
    await page.getByRole('button', {name: 'Choose calendar'}).click();
    await page
      .getByRole('radio', {name: 'Family calendar', exact: true})
      .click();
    await navigate(page, 'Tasks');
    await page.getByRole('textbox', {name: 'Task title'}).fill('School forms');
    await page.getByRole('textbox', {name: 'Due date'}).fill('2026-09-22');
    await page
      .getByRole('radiogroup', {name: 'Assigned person'})
      .getByRole('radio', {name: 'Alice'})
      .click();
    await page.getByRole('button', {name: 'Add task', exact: true}).click();
    await expect(
      page.getByText('Alice · 2026-09-22 · Synced', {exact: true}),
    ).toBeVisible();
    expect([...remote.values()][0].color).toBe('#539c82');
    fail = true;
    await page.getByRole('switch', {name: 'Complete School forms'}).click();
    await page.getByRole('radio', {name: 'Completed', exact: true}).click();
    await expect(page.getByText(/Sync pending/)).toBeVisible();
    await expect(page.getByRole('alert')).toContainText('Sync unavailable');
    fail = false;
    await page.getByRole('button', {name: 'Sync tasks'}).click();
    await expect(
      page.getByText('Alice · 2026-09-22 · Synced', {exact: true}),
    ).toBeVisible();
    expect([...remote.values()][0].completed).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath('tasks.png'),
      fullPage: true,
    });
    await page.reload();
    await navigate(page, 'Tasks');
    await page.getByRole('radio', {name: 'Completed', exact: true}).click();
    await expect(
      page.getByRole('switch', {name: 'Complete School forms'}),
    ).toBeChecked();
    const context = await browser.newContext({
      viewport: {width: 1440, height: 1000},
    });
    try {
      const other = await context.newPage();
      await install(other);
      await other.goto('/');
      await navigate(other, 'Settings');
      await other.getByRole('button', {name: 'Choose calendar'}).click();
      await other
        .getByRole('radio', {name: 'Family calendar', exact: true})
        .click();
      await navigate(other, 'Tasks');
      await other.getByRole('radio', {name: 'Completed', exact: true}).click();
      await expect(
        other.getByRole('switch', {name: 'Complete School forms'}),
      ).toBeChecked();
    } finally {
      await context.close();
    }
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', {name: 'Delete School forms'}).click();
    await expect(
      page.getByRole('switch', {name: 'Complete School forms'}),
    ).toHaveCount(0);
    expect(remote.size).toBe(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
