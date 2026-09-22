import {test, expect} from '@playwright/test';

for (const width of [1440, 390]) {
  test(`connection page typography, themes and pairing ${width}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({width, height: 1000});
    await page.route('**/auth/me', route =>
      route.fulfill({
        json: {
          configured: true,
          calendarConnected: true,
          user: {email: 'calendar@example.test'},
        },
      }),
    );
    await page.route('**/api/pairings/claim', async route => {
      expect(route.request().postDataJSON()).toEqual({code: 'ABCD1234'});
      await route.fulfill({status: 201, json: {}});
    });
    await page.route('**/api/calendar/events', route =>
      route.fulfill({
        json: {
          calendarCount: 1,
          events: [
            {
              title: 'Planning session',
              allDay: true,
              start: {date: '2026-09-23'},
              calendarName: 'Personal',
              location: '',
            },
          ],
        },
      }),
    );
    await page.goto('/connect');
    await expect(page.locator('#pair-code')).toBeVisible();
    await page.locator('#pair-code').fill('abcd1234');
    await page.getByRole('button', {name: 'Pair display', exact: true}).click();
    await expect(page.locator('#pair-feedback')).toContainText(
      'Display paired',
    );
    await page.getByRole('button', {name: 'Load upcoming events'}).click();
    await expect(page.locator('#events li')).toContainText('Planning session');
    for (const name of ['Dark', 'Light']) {
      await page.getByRole('button', {name: `${name} theme`}).click();
      await expect(page.locator('html')).toHaveAttribute(
        'data-theme',
        name.toLowerCase(),
      );
      await page.evaluate(() => document.fonts.ready);
      for (const selector of [
        'h1',
        'p.brand',
        '#pair-code',
        '#pair-submit',
        '#events li',
      ]) {
        await expect(page.locator(selector)).toHaveCSS(
          'font-family',
          /Montserrat/,
        );
        await expect(page.locator(selector)).toHaveCSS('font-weight', '500');
      }
      expect(
        await page.evaluate(() => document.fonts.check('500 16px Montserrat')),
      ).toBe(true);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath(`${name}.png`),
        fullPage: true,
      });
    }
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
}
