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
    const flame = page.getByRole('checkbox', {name: 'Flame text'});
    await expect(page.locator('h1')).toHaveCSS(
      '-webkit-text-fill-color',
      'rgba(0, 0, 0, 0)',
    );
    await flame.uncheck();
    await expect(page.locator('h1')).not.toHaveCSS(
      '-webkit-text-fill-color',
      'rgba(0, 0, 0, 0)',
    );
    await flame.check();
    const background = await page.evaluate(async () => {
      const style = getComputedStyle(document.body, '::before');
      const image = new Image();
      image.src = '/connect-assets/frosted1.png';
      await image.decode();
      return {
        source: style.backgroundImage,
        width: image.naturalWidth,
        height: image.naturalHeight,
      };
    });
    expect(background.source).toContain('/connect-assets/frosted1.png');
    expect(background.width).toBe(687);
    expect(background.height).toBe(1031);
    await expect(page.locator('#font-picker option')).toHaveCount(6);
    for (const selector of ['.intro', '#status', '.note']) {
      await expect(page.locator(selector)).toHaveCSS('font-style', 'italic');
    }
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
      await expect(page.locator('.icon canvas')).toHaveCount(3);
      await expect(page.locator('.event-time canvas')).toHaveCount(1);
      await expect(page.locator('.event-date canvas')).toHaveCount(1);
      await expect(page.locator('h1 canvas')).toHaveCSS(
        'filter',
        name === 'Dark' ? /drop-shadow/ : 'none',
      );
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
    const picker = page.getByRole('combobox', {name: 'Font', exact: true});
    for (const [id, family] of [
      ['instrument', 'Instrument Serif'],
      ['garamond', 'Cormorant Garamond'],
      ['infant', 'Cormorant Infant'],
      ['averia', 'Averia Serif Libre'],
      ['averia-light', 'Averia Serif Libre'],
    ]) {
      await picker.selectOption(id);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('h1')).toHaveCSS(
        'font-family',
        `"${family}", serif`,
      );
      await expect(page.locator('#pair-code')).toHaveCSS(
        'font-family',
        `"${family}", serif`,
      );
      expect(
        await page.evaluate(() => {
          const style = getComputedStyle(document.querySelector('h1')!);
          return document.fonts.check(
            `${style.fontStyle} ${style.fontWeight} 16px ${style.fontFamily}`,
          );
        }),
      ).toBe(true);
      await expect(page.locator('h1')).toHaveCSS(
        'font-style',
        id === 'averia' ? 'italic' : 'normal',
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath(`${id}.png`),
        fullPage: true,
      });
    }
    await page.reload();
    await expect(picker).toHaveValue('averia-light');
    await expect(page.locator('h1')).toHaveCSS('font-style', 'normal');
    await expect(page.locator('h1')).toHaveCSS('font-weight', '300');
  });
}
