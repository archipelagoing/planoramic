import {test, expect} from '@playwright/test';

for (const width of [1440, 1280, 390]) {
  test(`timed week navigation, events, and appearance ${width}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({width, height: width === 1280 ? 720 : 1000});
    await page.clock.setFixedTime(new Date('2026-09-22T12:00:00'));
    const ranges: URL[] = [];
    let fail = false;
    await page.route('http://localhost:3001/api/**', async route => {
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
          json: {deviceId: 'test', deviceCredential: ''},
        });
      if (url.searchParams.has('timeMin')) {
        ranges.push(url);
        if (fail)
          return route.fulfill({
            headers,
            status: 503,
            json: {error: {message: 'Week unavailable'}},
          });
      }
      const base = {
        calendarId: 'work',
        calendarName: 'Work',
        location: 'Studio',
        description: 'Weekly priorities',
        allDay: false,
      };
      await route.fulfill({
        headers,
        json: {
          calendarCount: 1,
          events: [
            {
              ...base,
              id: '1',
              title: 'Planning session',
              color: '#345678',
              start: {dateTime: '2026-09-22T09:00:00'},
              end: {dateTime: '2026-09-22T11:00:00'},
            },
            {
              ...base,
              id: '2',
              title: 'Design review',
              start: {dateTime: '2026-09-22T10:00:00'},
              end: {dateTime: '2026-09-22T12:00:00'},
            },
            {
              ...base,
              id: '3',
              title: 'Team retreat',
              allDay: true,
              start: {date: '2026-09-23'},
              end: {date: '2026-09-25'},
            },
            {
              ...base,
              id: '4',
              title: 'Late shift',
              start: {dateTime: '2026-09-24T23:00:00'},
              end: {dateTime: '2026-09-25T02:00:00'},
            },
          ],
        },
      });
    });
    await page.goto('/');
    const grid = page.getByTestId('timed-week');
    await expect(grid).toBeVisible({timeout: 15000});
    await expect(page.locator('.week-day')).toHaveCount(7);
    await expect.poll(() => ranges.length).toBeGreaterThan(0);
    expect(ranges[0].searchParams.get('timeMin')).toContain('2026-09-21');
    expect(ranges[0].searchParams.get('timeMax')).toContain('2026-09-28');
    await expect(
      page.locator('.week-grid .date-circle[aria-current="date"]'),
    ).toHaveText('22');
    const planning = page
      .locator('.week-grid .fc-event')
      .filter({hasText: 'Planning session'});
    const review = page
      .locator('.week-grid .fc-event')
      .filter({hasText: 'Design review'});
    await expect(planning).toBeVisible();
    if (width >= 700) {
      await page.screenshot({path: testInfo.outputPath('fit.png')});
      await expect
        .poll(() =>
          page
            .locator('.week-grid .fc-scroller')
            .evaluateAll(nodes =>
                nodes.map(node => ({height: node.clientHeight, content: node.scrollHeight, width: node.clientWidth, contentWidth: node.scrollWidth})).filter(node => node.content > node.height + 2 || node.contentWidth > node.width + 2),
            ),
        )
        .toEqual([]);
      const gridBounds = await grid.boundingBox();
      expect(gridBounds!.y + gridBounds!.height).toBeLessThanOrEqual(
        width === 1280 ? 721 : 1001,
      );
      await expect(
        page.locator('.week-grid .fc-timegrid-slot-lane'),
      ).toHaveCount(12);
    }
    const a = (await planning.boundingBox())!;
    const b = (await review.boundingBox())!;
    expect(a.x + a.width).toBeLessThanOrEqual(b.x + 1);
    expect(b.y).toBeGreaterThan(a.y);
    await expect(
      page.locator('.week-grid .fc-event').filter({hasText: 'Team retreat'}),
    ).toHaveCount(1);
    await expect(
      page.locator('.week-grid .fc-event').filter({hasText: 'Late shift'}),
    ).toHaveCount(2);
    await planning.click();
    await expect(page.getByRole('dialog')).toContainText('Weekly priorities');
    await page.getByRole('button', {name: 'Close', exact: true}).click();
    await page.getByRole('button', {name: 'Next week', exact: true}).click();
    await expect
      .poll(() => ranges.at(-1)?.searchParams.get('timeMin'))
      .toContain('2026-09-28');
    await expect(planning).toHaveCount(0);
    await page
      .getByTestId('side-month')
      .getByRole('button', {
        name: 'Select Tuesday, September 22, 2026',
        exact: true,
      })
      .click();
    await expect(planning).toBeVisible();
    fail = true;
    await page
      .getByRole('radiogroup', {name: 'Schedule view'})
      .getByRole('radio', {name: 'Week', exact: true})
      .click();
    await page.getByRole('button', {name: 'Next week', exact: true}).click();
    await expect(grid.getByRole('alert')).toContainText('Week unavailable');
    fail = false;
    await page.getByRole('button', {name: 'Retry week'}).click();
    await expect(grid.getByRole('alert')).toHaveCount(0);
    await grid.getByRole('button', {name: 'Today', exact: true}).click();
    await expect(planning).toBeVisible();
    for (const mode of ['dark', 'light']) {
      const toggle = page.getByRole('button', {name: `Switch to ${mode} mode`});
      if (await toggle.count()) await toggle.click();
      await expect(planning).toHaveCSS(
        'border-left-color',
        mode === 'light' ? 'rgb(52, 86, 120)' : 'rgb(247, 154, 34)',
      );
      await expect(review).toHaveCSS(
        'border-left-color',
        mode === 'light' ? 'rgb(113, 104, 98)' : 'rgb(247, 154, 34)',
      );
      const current = page.getByRole('button', {
        name: `Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`,
      });
      await expect(current).toHaveCSS('border-radius', '24px');
      await page.mouse.move(0, 0);
      await page.screenshot({
        path: testInfo.outputPath(`${mode}.png`),
        fullPage: true,
      });
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.getByRole('combobox')).toHaveCount(0);
  });
}
