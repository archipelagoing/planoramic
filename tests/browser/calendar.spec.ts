import {test, expect, Page} from '@playwright/test';

test('real backend cookie restores a paired display in a new browser context', async ({
  page,
  browser,
  request,
}) => {
  const proxy = async (target: Page) =>
    target.route('http://localhost:3001/api/**', async route => {
      const response = await route.fetch({
        url: route.request().url().replace(':3001', ':8088'),
      });
      await route.fulfill({response});
    });
  await proxy(page);
  await page.goto('/');
  await page
    .getByRole('button', {name: 'Connect calendar', exact: true})
    .click();
  const code = page.getByText(/^[A-F0-9]{8}$/);
  await expect(code).toBeVisible();
  const claim = await request.post('/api/pairings/claim', {
    headers: {
      Authorization: 'Bearer browser-test-controller-key-with-32-characters',
    },
    data: {code: await code.textContent()},
  });
  expect(claim.status()).toBe(201);
  await expect(
    page.getByText('No upcoming events in the next seven days.'),
  ).toBeVisible({timeout: 10000});
  const stored = await page.context().storageState();
  expect(
    stored.cookies.find(cookie => cookie.name === 'planoramic_display')
      ?.httpOnly,
  ).toBe(true);
  expect(await page.evaluate(() => document.cookie)).not.toContain(
    'planoramic_display',
  );
  const reopened = await browser.newContext({storageState: stored});
  try {
    const restored = await reopened.newPage();
    await proxy(restored);
    await restored.goto('http://localhost:8088');
    await expect(
      restored.getByText('No upcoming events in the next seven days.'),
    ).toBeVisible();
  } finally {
    await reopened.close();
  }
});

async function calendarApi(page: Page, initiallyPaired = true) {
  const state = {
    paired: initiallyPaired,
    status: 200,
    code: '',
    offline: false,
    delay: false,
    events: [
      {
        id: 'event-1',
        calendarId: 'calendar-1',
        calendarName: 'Personal',
        title: 'Planning session',
        start: {dateTime: new Date().toISOString()},
        allDay: false,
        location: '',
        description: 'Agenda details',
      },
    ],
  };
  await page.route('http://localhost:3001/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    const headers = {
      'Access-Control-Allow-Origin': 'http://localhost:8088',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    };
    if (route.request().method() === 'OPTIONS')
      return route.fulfill({status: 204, headers});
    if (state.offline) return route.abort();
    let status = 200;
    let body: object = {};
    if (path === '/api/display/session') {
      if (route.request().method() === 'POST') state.paired = true;
      status = state.paired ? 200 : 401;
      body = state.paired
        ? {deviceId: 'test-device', deviceCredential: ''}
        : {error: {code: 'UNAUTHORIZED'}};
    } else if (path === '/api/devices/register') {
      body = {
        sessionId: 'pairing',
        sessionSecret: 'secret',
        pairingCode: 'ABCD1234',
        expiresAt: new Date(Date.now() + 600000).toISOString(),
      };
    } else if (path === '/api/pairings/pairing') {
      body = {
        status: 'paired',
        deviceId: 'test-device',
        deviceCredential: 'test-secret',
      };
    } else if (path === '/api/display/events') {
      if (state.delay) await new Promise(resolve => setTimeout(resolve, 1000));
      status = state.status;
      body =
        status === 200
          ? {events: state.events, calendarCount: 1}
          : {error: {code: state.code, message: 'Calendar unavailable'}};
      if (state.code === 'UNAUTHORIZED') state.paired = false;
    }
    await route.fulfill({status, headers, json: body});
  });
  return state;
}

test('dark TV focus is visible, keeps layout stable, and respects reduced motion', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({width: 1920, height: 1080});
  await page.emulateMedia({
    colorScheme: 'dark',
    reducedMotion: 'no-preference',
  });
  await calendarApi(page);
  await page.goto('/');
  const event = page.getByRole('button', {name: /Planning session/});
  await expect(event).toBeVisible();
  const before = await event.boundingBox();
  await event.focus();
  await expect(event).toHaveCSS('outline-color', 'rgb(255, 240, 242)');
  await expect
    .poll(async () => (await event.boundingBox())!.width)
    .toBeGreaterThan(before!.width);
  const focused = (await event.boundingBox())!;
  expect(focused.x).toBeGreaterThanOrEqual(0);
  expect(focused.x + focused.width).toBeLessThanOrEqual(1920);
  await page.keyboard.press('Enter');
  await expect(page.getByText('Agenda details', {exact: true})).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('tv-focus.png'),
    fullPage: true,
  });
  await page.emulateMedia({reducedMotion: 'reduce'});
  await expect(event).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  await expect(event).toHaveCSS('outline-color', 'rgb(255, 240, 242)');
});

test('pairing restores after reload and event details expand', async ({
  page,
}) => {
  await calendarApi(page, false);
  await page.goto('/');
  await page
    .getByRole('button', {name: 'Connect calendar', exact: true})
    .click();
  await expect(page.getByText('Planning session', {exact: true})).toBeVisible();
  await page.reload();
  await expect(page.getByText('Planning session', {exact: true})).toBeVisible();
  await page.getByRole('button', {name: /Planning session/}).click();
  await expect(page.getByText('Agenda details', {exact: true})).toBeVisible();
  expect(await page.evaluate(() => ({...localStorage}))).toEqual({});
});

test('loading, refresh, empty, and stale-data recovery', async ({page}) => {
  const state = await calendarApi(page);
  state.delay = true;
  await page.goto('/');
  await expect(page.getByText('Loading your calendars')).toBeVisible();
  await expect(page.getByText('Planning session', {exact: true})).toBeVisible();
  state.offline = true;
  await page.getByRole('button', {name: 'Refresh', exact: true}).click();
  await expect(page.getByRole('alert')).toContainText(
    'Showing previously loaded events',
  );
  await expect(page.getByText('Planning session', {exact: true})).toBeVisible();
  state.offline = false;
  state.events = [];
  await page.getByRole('button', {name: 'Refresh', exact: true}).click();
  await expect(
    page.getByText('No upcoming events in the next seven days.'),
  ).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('Google expiry keeps pairing and provides reconnect; revocation pairs again', async ({
  page,
}) => {
  const state = await calendarApi(page);
  state.status = 401;
  state.code = 'CALENDAR_REAUTH_REQUIRED';
  await page.goto('/');
  await expect(
    page.getByRole('button', {name: 'Reconnect Google'}),
  ).toBeVisible();
  await expect(
    page.getByText('Connect this display', {exact: true}),
  ).toHaveCount(0);
  state.status = 200;
  state.code = '';
  await page.getByRole('button', {name: 'Refresh', exact: true}).click();
  await expect(page.getByText('Planning session', {exact: true})).toBeVisible();
  state.status = 401;
  state.code = 'UNAUTHORIZED';
  await page.getByRole('button', {name: 'Refresh', exact: true}).click();
  await expect(
    page.getByText('Connect this display', {exact: true}),
  ).toBeVisible();
});

test('startup network failure can retry without losing pairing', async ({
  page,
}) => {
  const state = await calendarApi(page);
  state.offline = true;
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('Could not restore');
  state.offline = false;
  await page.getByRole('button', {name: 'Retry', exact: true}).click();
  await expect(page.getByText('Planning session', {exact: true})).toBeVisible();
});

for (const viewport of [
  {width: 1440, height: 900},
  {width: 390, height: 844},
]) {
  test(`calendar layout ${viewport.width}`, async ({page}, testInfo) => {
    await page.setViewportSize(viewport);
    await calendarApi(page);
    await page.goto('/');
    await expect(
      page.getByText('Planning session', {exact: true}),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath('calendar.png'),
      fullPage: true,
    });
  });
}

test('appearance follows system, persists overrides, and updates navigation', async ({
  page,
}) => {
  await page.emulateMedia({colorScheme: 'light'});
  await calendarApi(page);
  await page.goto('/');
  await expect(page.getByRole('radio', {name: 'System theme'})).toBeChecked();
  const lightBackground = await page
    .getByRole('heading', {name: 'Upcoming Events'})
    .evaluate(element => getComputedStyle(element).color);
  await page.getByRole('radio', {name: 'Dark theme'}).click();
  await expect(page.getByRole('radio', {name: 'Dark theme'})).toBeChecked();
  const darkBackground = await page
    .getByRole('heading', {name: 'Upcoming Events'})
    .evaluate(element => getComputedStyle(element).color);
  expect(darkBackground).not.toBe(lightBackground);
  await page.reload();
  await expect(page.getByRole('radio', {name: 'Dark theme'})).toBeChecked();
  await page.getByText('Settings', {exact: true}).click();
  await expect(page.getByRole('radio', {name: 'Dark theme'})).toBeChecked();
  await page.getByRole('radio', {name: 'System theme'}).click();
  await page.emulateMedia({colorScheme: 'dark'});
  await page.getByText('Calendar', {exact: true}).click();
  await expect(page.getByRole('heading', {name: 'Upcoming Events'})).toHaveCSS(
    'color',
    darkBackground,
  );
  await page.emulateMedia({colorScheme: 'light'});
  await expect(page.getByRole('heading', {name: 'Upcoming Events'})).toHaveCSS(
    'color',
    lightBackground,
  );
});

for (const mode of ['light', 'dark']) {
  for (const width of [1440, 390]) {
    test(`glass appearance ${mode} ${width}`, async ({page}, testInfo) => {
      await page.setViewportSize({width, height: 900});
      await calendarApi(page, false);
      await page.goto('/');
      const control = page.getByRole('radio', {
        name: `${mode === 'light' ? 'Light' : 'Dark'} theme`,
      });
      await control.click();
      await control.blur();
      await page.mouse.move(0, 0);
      const connect = page.getByRole('button', {
        name: 'Connect calendar',
        exact: true,
      });
      await expect(connect).toBeVisible();
      if (mode === 'dark') {
        const card = page.getByRole('button', {name: /Weekly planning/});
        await expect(card).toHaveCSS(
          'background-color',
          'rgba(255, 255, 255, 0.08)',
        );
        await expect(card).toHaveCSS('border-radius', '20px');
        await expect(card).toHaveCSS(
          'border-color',
          'rgba(255, 255, 255, 0.3)',
        );
        await expect(card).toHaveCSS('background-image', 'none');
        await expect(card).toHaveCSS(
          'box-shadow',
          'rgba(0, 0, 0, 0.1) 0px 8px 32px 0px, rgba(255, 255, 255, 0.5) 0px 1px 0px 0px inset, rgba(255, 255, 255, 0.1) 0px -1px 0px 0px inset, rgba(255, 255, 255, 0.7) 0px 0px 14px 7px inset',
        );
      }
      await expect(control).toHaveCSS('width', '48px');
      await expect(control).toHaveCSS('height', '48px');
      await expect(control).toHaveCSS('border-radius', '24px');
      await expect(
        page.getByRole('heading', {name: 'Upcoming Events'}),
      ).toHaveCSS('font-family', /Montserrat_500Medium/);
      expect(
        await page.evaluate(() =>
          document.fonts.check('16px Montserrat_500Medium'),
        ),
      ).toBe(true);
      await expect(page.getByText('PLANORAMIC', {exact: true})).toHaveCSS(
        'color',
        mode === 'dark' ? 'rgb(255, 146, 153)' : 'rgb(180, 35, 50)',
      );
      await expect(
        page.getByTestId('fireplace-background').locator('img'),
      ).toHaveJSProperty('naturalWidth', 1920);
      const backdrop = await page
        .getByTestId('fireplace-background')
        .boundingBox();
      expect(backdrop!.width).toBeLessThanOrEqual(width);
      expect(backdrop!.height).toBeLessThanOrEqual(900);
      const bounds = await connect.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      await expect(connect).toHaveCSS('backdrop-filter', 'blur(15px)');
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath('appearance.png'),
        fullPage: true,
      });
    });
  }
}
