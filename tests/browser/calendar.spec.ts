import {test, expect, Page} from '@playwright/test';

test('light color hierarchy keeps flame on identity and dark mode unchanged', async ({
  page,
}) => {
  await page.setViewportSize({width: 1440, height: 1000});
  await calendarApi(page);
  await page.goto('/');
  await setTheme(page, false);
  const title = page.getByRole('heading', {name: 'Upcoming Events'});
  const brand = page.getByText('PLANORAMIC', {exact: true});
  await expect(title).toHaveCSS('color', 'rgb(81, 70, 64)');
  await expect(title.locator('canvas')).toHaveCount(0);
  await expect(brand.locator('canvas')).toHaveCount(1);
  const sidebar = page.getByTestId('glass-sidebar');
  await expect(sidebar.locator('canvas')).toHaveCount(0);
  await expect(
    sidebar
      .getByRole('button', {name: 'Calendar', exact: true})
      .getByTestId('flame-icon'),
  ).toHaveCSS('color', 'rgb(173, 74, 48)');
  for (const today of await page.locator('.date-circle.today').all()) {
    await expect(today).toHaveCSS('background-color', 'rgb(173, 74, 48)');
    await expect(today).toHaveCSS('color', 'rgb(255, 255, 255)');
  }
  await setTheme(page, true);
  await expect(title.locator('canvas')).toHaveCount(1);
  await expect(sidebar.locator('canvas')).toHaveCount(1);
  await expect(brand).toHaveCSS('color', 'rgb(247, 154, 34)');
});

test('navigation collapses, persists, and keeps mobile drawer usable', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({width: 1440, height: 1000});
  await calendarApi(page, false);
  await page.goto('/');
  const sidebar = page.getByTestId('glass-sidebar');
  await expect(sidebar).toHaveCSS('width', /^(239|240)px$/);
  await page.getByRole('button', {name: 'Collapse navigation'}).click();
  await expect(sidebar).toHaveCSS('width', /^(71|72)px$/);
  await sidebar.getByRole('button', {name: 'Settings', exact: true}).click();
  await expect(
    page.getByRole('heading', {name: 'Settings', exact: true}).first(),
  ).toBeVisible();
  await page.screenshot({path: testInfo.outputPath('collapsed.png')});
  await page.reload();
  await expect(sidebar).toHaveCSS('width', /^(71|72)px$/);
  await page.getByRole('button', {name: 'Expand navigation'}).focus();
  await page.keyboard.press('Enter');
  await expect(sidebar).toHaveCSS('width', /^(239|240)px$/);
  await page.getByRole('button', {name: 'Collapse navigation'}).click();
  await page.setViewportSize({width: 390, height: 844});
  await page.getByRole('button', {name: 'Open navigation'}).click();
  await expect(sidebar).toHaveCSS('width', /^(239|240)px$/);
  await expect(
    page.getByRole('button', {name: 'Expand navigation'}),
  ).toHaveCount(0);
  await sidebar.getByRole('button', {name: 'Settings', exact: true}).click();
  await expect(
    page.getByRole('heading', {name: 'Settings', exact: true}).first(),
  ).toBeVisible();
});

for (const width of [1440, 390]) {
  test(`settings appearance and text sizing ${width}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({width, height: 1000});
    await calendarApi(page, false);
    await page.goto('/');
    await navigateTo(page, 'Settings');
    await expect(page.getByRole('combobox')).toHaveCount(0);
    await expect(
      page.getByRole('radiogroup', {name: 'Font'}).getByRole('radio'),
    ).toHaveCount(5);
    await page.getByRole('switch', {name: 'Show background image'}).check();
    await expect(
      page
        .getByTestId('calendar-background')
        .filter({visible: true})
        .filter({visible: true}),
    ).toBeVisible();
    await page.getByRole('switch', {name: 'Flame text'}).uncheck();
    await expect(
      page.getByRole('heading', {name: 'Settings', exact: true}).first(),
    ).not.toHaveCSS('-webkit-text-fill-color', 'rgba(0, 0, 0, 0)');
    const larger = page.getByRole('button', {name: 'Increase font size'});
    await larger.click();
    await larger.click();
    await larger.click();
    await expect(larger).toBeDisabled();
    await expect(page.getByTestId('font-size-value')).toHaveText('130%');
    await expect(
      page.getByRole('heading', {name: 'Settings', exact: true}).first(),
    ).toHaveCSS('font-size', '41.6px');
    for (const dark of [false, true]) {
      await setTheme(page, dark);
      await page.evaluate(() =>
        (document.activeElement as HTMLElement)?.blur(),
      );
      await page.mouse.move(0, 0);
      await page.screenshot({
        path: testInfo.outputPath(dark ? 'dark.png' : 'light.png'),
        fullPage: true,
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page.reload();
    await navigateTo(page, 'Settings');
    await expect(page.getByTestId('font-size-value')).toHaveText('130%');
    await page.getByRole('switch', {name: 'Show background image'}).uncheck();
    await expect(
      page
        .getByTestId('calendar-background')
        .filter({visible: true})
        .filter({visible: true}),
    ).toHaveCount(0);
    await navigateTo(page, 'Calendar');
    await expect(
      page.getByRole('heading', {name: 'Upcoming Events'}),
    ).toHaveCSS('font-size', '41.6px');
    await expect(page.locator('.week-calendar .fc').first()).toHaveCSS(
      'font-size',
      '16.9px',
    );
    await navigateTo(page, 'Settings');
    await page.getByRole('button', {name: 'Reset font size'}).click();
    await expect(page.getByTestId('font-size-value')).toHaveText('100%');
    await expect(
      page.getByRole('button', {name: 'Reset font size'}),
    ).toBeDisabled();
  });
}

async function setTheme(page: Page, dark: boolean) {
  const button = page.getByRole('button', {
    name: dark ? 'Switch to dark mode' : 'Switch to light mode',
    exact: true,
  });
  if (await button.count()) await button.click();
}

async function navigateTo(page: Page, name: string) {
  const menu = page.getByRole('button', {name: 'Open navigation'});
  const mobile = (page.viewportSize()?.width || 1440) < 700;
  if (mobile) await menu.click();
  const destination = page.getByRole('button', {name, exact: true});
  await destination.click();
  if (mobile) await expect(destination).not.toBeInViewport();
}

for (const width of [1440, 390]) {
  test(`compact calendar widgets and settings ${width}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({width, height: 1000});
    await calendarApi(page);
    await page.goto('/');
    const clock = page.getByTestId('header-clock');
    await expect(clock).toBeVisible();
    await expect(page.getByTestId('analog-clock')).toHaveCount(1);
    await expect(clock).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(clock).toHaveCSS('box-shadow', 'none');
    await expect(clock).toHaveCSS('border-top-width', '0px');
    await page.getByRole('radio', {name: 'Agenda', exact: true}).click();
    const month = page.getByTestId('mini-month');
    await expect(month).toBeVisible();
    await expect(month.getByLabel(/^Today,/)).toBeVisible();
    const bounds = await page.getByTestId('calendar-widgets').boundingBox();
    expect(bounds!.width).toBeLessThan(300);
    expect(bounds!.height).toBeLessThan(175);
    await expect(page.getByRole('combobox')).toHaveCount(0);
    await expect(page.getByRole('switch', {name: 'Flame text'})).toHaveCount(0);
    await page.clock.install();
    const hand = page.getByTestId('clock-minute-hand');
    const before = await hand.evaluate(
      node => getComputedStyle(node).transform,
    );
    await page.clock.fastForward(60000);
    await expect
      .poll(() => hand.evaluate(node => getComputedStyle(node).transform))
      .not.toBe(before);
    await expect(page.getByTestId('digital-clock')).toContainText(
      /\d{1,2}:\d{2}/,
    );
    for (const theme of ['Light', 'Dark']) {
      await setTheme(page, theme === 'Dark');
      await month.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: testInfo.outputPath(`${theme}.png`),
        fullPage: true,
      });
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width === 390)
      await page.getByRole('button', {name: 'Open navigation'}).click();
    await page.getByRole('button', {name: 'Settings', exact: true}).click();
    await expect(page.getByRole('radiogroup', {name: 'Font'})).toBeVisible();
    await expect(page.getByRole('switch', {name: 'Flame text'})).toBeVisible();
    await expect(
      page.getByRole('button', {name: 'Switch to light mode', exact: true}),
    ).toBeVisible();
  });
}

for (const width of [1440, 390]) {
  test(`workspace navigation filters and timer ${width}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({width, height: 1000});
    await calendarApi(page, false);
    await page.goto('/');
    await page.getByRole('radio', {name: 'Agenda', exact: true}).click();
    await expect(
      page.getByText('Weekly planning', {exact: true}),
    ).toBeVisible();
    const navigate = async (name: string) => {
      if (width === 390)
        await page.getByRole('button', {name: 'Open navigation'}).click();
      await page.getByRole('button', {name, exact: true}).click();
      if (width === 390)
        await expect(
          page.getByRole('button', {name, exact: true}),
        ).not.toBeInViewport();
    };
    await page
      .getByRole('radiogroup', {name: 'Calendar range'})
      .getByRole('radio', {name: 'Week', exact: true})
      .click();
    await expect(page.getByTestId('timed-week')).toBeVisible();
    await page.getByRole('radio', {name: 'Agenda', exact: true}).click();
    await navigate('Household');
    await page.getByRole('switch', {name: 'Show Work', exact: true}).click();
    await navigate('Calendar');
    await expect(page.getByText('Weekly planning', {exact: true})).toHaveCount(
      0,
    );
    await navigate('Brief');
    await expect(
      page.getByText('Dinner together', {exact: true}).filter({visible: true}),
    ).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath('brief.png'),
      fullPage: true,
    });
    await navigate('Household');
    await page.screenshot({
      path: testInfo.outputPath('household.png'),
      fullPage: true,
    });
    await page.reload();
    await page.getByRole('radio', {name: 'Agenda', exact: true}).click();
    await navigate('Household');
    await expect(
      page.getByRole('switch', {name: 'Show Work', exact: true}),
    ).not.toBeChecked();
    await page.getByRole('switch', {name: 'Show Work', exact: true}).click();
    await navigate('Pomo');
    await page.clock.install();
    await expect(page.getByTestId('pomo-time')).toHaveText('25:00');
    await page.getByRole('button', {name: 'Start', exact: true}).click();
    await page.clock.fastForward(5000);
    await expect(page.getByTestId('pomo-time')).toHaveText('24:55');
    await navigate('Brief');
    await page.clock.fastForward(5000);
    await navigate('Pomo');
    const seconds = (await page.getByTestId('pomo-time').innerText())
      .split(':')
      .map(Number);
    expect(seconds[0] * 60 + seconds[1]).toBeLessThanOrEqual(24 * 60 + 50);
    expect(seconds[0] * 60 + seconds[1]).toBeGreaterThan(24 * 60 + 30);
    await page.getByRole('button', {name: 'Pause', exact: true}).click();
    const paused = await page.getByTestId('pomo-time').innerText();
    await page.clock.fastForward(10000);
    await expect(page.getByTestId('pomo-time')).toHaveText(paused);
    await page.getByRole('button', {name: 'Start', exact: true}).click();
    await page.clock.fastForward(25 * 60 * 1000);
    await expect(page.getByTestId('pomo-time')).toHaveText('00:00');
    await expect(page.getByText('1 focus session completed')).toBeVisible();
    await page.clock.fastForward(10000);
    await expect(page.getByText('1 focus session completed')).toBeVisible();
    await page.getByRole('radio', {name: 'Short break', exact: true}).click();
    await expect(page.getByTestId('pomo-time')).toHaveText('05:00');
    await page.getByRole('button', {name: 'Decrease duration'}).click();
    await expect(page.getByTestId('pomo-time')).toHaveText('04:00');
    await page.getByRole('button', {name: 'Reset timer'}).click();
    await expect(page.getByTestId('pomo-time')).toHaveText('04:00');
    await page.screenshot({
      path: testInfo.outputPath('pomo.png'),
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

for (const width of [1440, 390]) {
  test(`background image preference persists ${width}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({width, height: 900});
    await calendarApi(page, false);
    await page.goto('/');
    await page.getByRole('radio', {name: 'Agenda', exact: true}).click();
    const navigate = async (name: string) => {
      if (width === 390)
        await page.getByRole('button', {name: 'Open navigation'}).click();
      await page.getByRole('button', {name, exact: true}).click();
    };
    await expect(
      page.getByTestId('calendar-background').filter({visible: true}),
    ).toBeVisible();
    await navigate('Settings');
    const toggle = page.getByRole('switch', {name: 'Show background image'});
    await expect(toggle).toBeChecked();
    await toggle.focus();
    await page.keyboard.press('Space');
    await expect(toggle).not.toBeChecked();
    await expect(page.getByTestId('app-background')).toHaveCount(0);
    await navigate('Calendar');
    for (const theme of ['Light', 'Dark']) {
      await setTheme(page, theme === 'Dark');
      await expect(
        page.getByTestId('calendar-background').filter({visible: true}),
      ).toHaveCount(0);
      await expect(page.getByTestId('app-background')).toHaveCount(0);
      await expect(
        page.getByText('Weekly planning', {exact: true}),
      ).toBeVisible();
      await page.screenshot({
        path: testInfo.outputPath(`${theme}.png`),
        fullPage: true,
      });
    }
    await page.reload();
    await page.getByRole('radio', {name: 'Agenda', exact: true}).click();
    await expect(
      page.getByRole('heading', {name: 'Upcoming Events'}),
    ).toBeVisible();
    await expect(
      page.getByTestId('calendar-background').filter({visible: true}),
    ).toHaveCount(0);
    await navigate('Settings');
    await expect(toggle).not.toBeChecked();
    await toggle.click();
    await expect(toggle).toBeChecked();
    await navigate('Calendar');
    await expect(
      page.getByTestId('calendar-background').filter({visible: true}),
    ).toBeVisible();
    await page.reload();
    await page.getByRole('radio', {name: 'Agenda', exact: true}).click();
    await expect(
      page.getByTestId('calendar-background').filter({visible: true}),
    ).toBeVisible();
  });
}

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
  await page.getByRole('radio', {name: 'Agenda', exact: true}).click();
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
    await restored.getByRole('radio', {name: 'Agenda', exact: true}).click();
    await expect(
      restored.getByText('No upcoming events in the next seven days.'),
    ).toBeVisible();
  } finally {
    for (const restored of reopened.pages()) {
      await restored.unrouteAll({behavior: 'wait'});
    }
    await reopened.close();
    await page.unrouteAll({behavior: 'wait'});
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
  await page.getByRole('radio', {name: 'Agenda', exact: true}).click();
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
  await page.getByRole('radio', {name: 'Agenda', exact: true}).click();
  await page
    .getByRole('button', {name: 'Connect calendar', exact: true})
    .click();
  await expect(page.getByText('Planning session', {exact: true})).toBeVisible();
  await page.reload();
  await page.getByRole('radio', {name: 'Agenda', exact: true}).click();
  await expect(page.getByText('Planning session', {exact: true})).toBeVisible();
  await page.getByRole('button', {name: /Planning session/}).click();
  await expect(page.getByText('Agenda details', {exact: true})).toBeVisible();
  expect(await page.evaluate(() => ({...localStorage}))).toEqual({});
});

test('loading, refresh, empty, and stale-data recovery', async ({page}) => {
  const state = await calendarApi(page);
  state.delay = true;
  await page.goto('/');
  await page.getByRole('radio', {name: 'Agenda', exact: true}).click();
  await expect(page.getByText('Loading your calendars')).toBeVisible();
  await expect(page.getByText('Planning session', {exact: true})).toBeVisible();
  state.offline = true;
  await page.getByRole('button', {name: 'Refresh', exact: true}).click();
  await expect(
    page
      .getByRole('alert')
      .filter({hasText: 'Showing previously loaded events'}),
  ).toBeVisible();
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
  await page.getByRole('radio', {name: 'Agenda', exact: true}).click();
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
  await page.getByRole('radio', {name: 'Agenda', exact: true}).click();
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
    await page.getByRole('radio', {name: 'Agenda', exact: true}).click();
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
  await page.getByRole('radio', {name: 'Agenda', exact: true}).click();
  await expect(
    page.getByRole('button', {name: 'Switch to dark mode', exact: true}),
  ).toBeVisible();
  const lightBackground = await page
    .getByRole('heading', {name: 'Upcoming Events'})
    .evaluate(element => getComputedStyle(element).color);
  await setTheme(page, true);
  await expect(
    page.getByRole('button', {name: 'Switch to light mode', exact: true}),
  ).toBeVisible();
  const darkBackground = await page
    .getByRole('heading', {name: 'Upcoming Events'})
    .evaluate(element => getComputedStyle(element).color);
  expect(darkBackground).not.toBe(lightBackground);
  await page.reload();
  await page.getByRole('radio', {name: 'Agenda', exact: true}).click();
  await expect(
    page.getByRole('button', {name: 'Switch to light mode', exact: true}),
  ).toBeVisible();
  await page.getByText('Settings', {exact: true}).click();
  await expect(
    page.getByRole('button', {name: 'Switch to light mode', exact: true}),
  ).toBeVisible();
  await page.emulateMedia({colorScheme: 'dark'});
  await page.getByText('Calendar', {exact: true}).click();
  await expect(page.getByRole('heading', {name: 'Upcoming Events'})).toHaveCSS(
    'color',
    darkBackground,
  );
  await page.emulateMedia({colorScheme: 'light'});
  await setTheme(page, false);
  await expect(page.getByRole('heading', {name: 'Upcoming Events'})).toHaveCSS(
    'color',
    lightBackground,
  );
});

for (const width of [1440, 390]) {
  test(`flame text preview ${width}`, async ({page}, testInfo) => {
    await page.setViewportSize({width, height: 900});
    await calendarApi(page, false);
    await page.goto('/');
    await page.getByRole('radio', {name: 'Agenda', exact: true}).click();
    const heading = page.getByText('PLANORAMIC', {exact: true}).filter({visible: true});
    const toggle = page.getByRole('switch', {name: 'Flame text'});
    await expect(heading).toHaveCSS(
      '-webkit-text-fill-color',
      'rgba(0, 0, 0, 0)',
    );
    await expect(heading).toHaveCSS('background-image', 'none');
    const pixels = await heading
      .locator('canvas')
      .evaluate((canvas: HTMLCanvasElement) => {
        const data = canvas
          .getContext('2d')!
          .getImageData(0, 0, canvas.width, canvas.height).data;
        let visible = 0;
        let clear = 0;
        const colors = new Set();
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 200) {
            visible++;
            colors.add(`${data[i]},${data[i + 1]},${data[i + 2]}`);
          }
          if (data[i + 3] === 0) clear++;
        }
        return {visible, clear, colors: colors.size};
      });
    expect(pixels.visible).toBeGreaterThan(100);
    expect(pixels.clear).toBeGreaterThan(pixels.visible);
    expect(pixels.colors).toBeGreaterThan(30);
    await expect(
      page.getByText('Weekly planning', {exact: true}),
    ).not.toHaveCSS('-webkit-text-fill-color', 'rgba(0, 0, 0, 0)');
    for (const theme of ['Dark', 'Light']) {
      await setTheme(page, theme === 'Dark');
      await expect(heading.locator('canvas')).toHaveCSS('filter', 'none');
      await expect(
        page
          .getByRole('heading', {name: /Wednesday, September/})
          .locator('canvas'),
      ).toHaveCount(0);
      await expect(
        page.getByText('10:00 AM', {exact: true}).locator('canvas'),
      ).toHaveCount(0);
      if (width === 1440) {
        await expect(page.getByTestId('glass-sidebar')).toHaveCSS(
          'backdrop-filter',
          'blur(18px)',
        );
        await expect(page.getByTestId('glass-sidebar')).toHaveCSS(
          'background-color',
          theme === 'Dark'
            ? 'rgba(24, 23, 22, 0.82)'
            : 'rgba(248, 247, 245, 0.62)',
        );
      }
      await page.getByRole('button', {name: /Switch to .* mode/}).blur();
      await page.mouse.move(0, 0);
      await page.screenshot({
        path: testInfo.outputPath(`${theme}.png`),
        fullPage: true,
      });
    }
    const bounds = await heading.boundingBox();
    await navigateTo(page, 'Settings');
    await toggle.uncheck();
    await navigateTo(page, 'Calendar');
    await expect(page.locator('[data-testid="flame-icon"] canvas')).toHaveCount(
      0,
    );
    await expect(
      page.getByText('10:00 AM', {exact: true}).locator('canvas'),
    ).toHaveCount(0);
    await expect(heading).not.toHaveCSS(
      '-webkit-text-fill-color',
      'rgba(0, 0, 0, 0)',
    );
    expect(await heading.boundingBox()).toEqual(bounds);
    await navigateTo(page, 'Settings');
    await toggle.check();
    await navigateTo(page, 'Calendar');
    await expect(heading).toHaveCSS(
      '-webkit-text-fill-color',
      'rgba(0, 0, 0, 0)',
    );
  });
}

for (const width of [1440, 390]) {
  test(`font picker updates app and persists ${width}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({width, height: 900});
    await calendarApi(page, false);
    await page.goto('/');
    await page.getByRole('radio', {name: 'Agenda', exact: true}).click();
    const picker = page.getByRole('radiogroup', {name: 'Font', exact: true});
    const labels: Record<string, string> = {
      instrument: 'Instrument Serif',
      garamond: 'Cormorant Garamond',
      infant: 'Cormorant Infant',
      'averia-light': 'Averia Light',
      montserrat: 'Montserrat',
    };
    for (const [id, family] of [
      ['instrument', 'InstrumentSerif_400Regular'],
      ['garamond', 'CormorantGaramond_500Medium'],
      ['infant', 'CormorantInfant_500Medium'],
      ['averia-light', 'AveriaSerifLibre_300Light'],
      ['montserrat', 'Montserrat_500Medium'],
    ]) {
      await navigateTo(page, 'Settings');
      await picker.getByRole('radio', {name: labels[id], exact: true}).click();
      await expect(
        picker.getByRole('radio', {name: labels[id], exact: true}),
      ).toBeChecked();
      await navigateTo(page, 'Calendar');
      await expect(
        page.getByRole('heading', {name: 'Upcoming Events'}),
      ).toHaveCSS('font-family', family);
      await expect(page.getByText('Weekly planning', {exact: true})).toHaveCSS(
        'font-family',
        family,
      );
      for (const text of [
        'PLANORAMIC',
        'Sample events · Preview',
        'Work · Studio',
      ]) {
        await expect(
          page.getByText(text, {exact: true}).filter({visible: true}),
        ).toHaveCSS('font-family', `${family}_Italic`);
      }
      for (const text of ['10:00 AM', 'Weekly planning']) {
        await expect(
          page.getByText(text, {exact: true}).filter({visible: true}),
        ).toHaveCSS('font-family', family);
        await expect(
          page.getByText(text, {exact: true}).filter({visible: true}),
        ).toHaveCSS('font-style', 'normal');
      }
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          font => document.fonts.check(`18px ${font}`),
          family,
        ),
      ).toBe(true);
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
    await navigateTo(page, 'Settings');
    await picker.getByRole('radio', {name: 'Averia Light'}).click();
    await page.reload();
    await page.getByRole('radio', {name: 'Agenda', exact: true}).click();
    await navigateTo(page, 'Settings');
    await expect(
      picker.getByRole('radio', {name: 'Averia Light'}),
    ).toBeChecked();
    await expect(picker.getByRole('radio')).toHaveCount(5);
    await page.evaluate(() =>
      localStorage.setItem('planoramic.font', 'averia'),
    );
    await page.reload();
    await page.getByRole('radio', {name: 'Agenda', exact: true}).click();
    await navigateTo(page, 'Settings');
    await expect(
      picker.getByRole('radio', {name: 'Averia Light'}),
    ).toBeChecked();
    await navigateTo(page, 'Calendar');
    await expect(
      page.getByRole('heading', {name: 'Upcoming Events'}),
    ).toHaveCSS('font-family', 'AveriaSerifLibre_300Light');
  });
}

for (const mode of ['light', 'dark']) {
  for (const width of [1440, 390]) {
    test(`glass appearance ${mode} ${width}`, async ({page}, testInfo) => {
      await page.setViewportSize({width, height: 900});
      await calendarApi(page, false);
      await page.goto('/');
      await page.getByRole('radio', {name: 'Agenda', exact: true}).click();
      await setTheme(page, mode === 'dark');
      const control = page.getByRole('button', {name: /Switch to .* mode/});
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
          'rgba(24, 22, 21, 0.42)',
        );
        await expect(card).toHaveCSS('border-radius', '18px');
        await expect(card).toHaveCSS(
          'backdrop-filter',
          'blur(20px) saturate(1.15)',
        );
        await expect(card).toHaveCSS(
          'border-color',
          'rgba(255, 255, 255, 0.14)',
        );
        await expect(card).toHaveCSS('background-image', 'none');
        await expect(card).toHaveCSS(
          'box-shadow',
          'rgba(0, 0, 0, 0.2) 0px 8px 24px 0px, rgba(255, 255, 255, 0.08) 0px 1px 0px 0px inset',
        );
      }
      await expect(control).toHaveCSS('width', '48px');
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
        mode === 'dark' ? 'rgb(247, 154, 34)' : 'rgb(173, 74, 48)',
      );
      await expect(
        page
          .getByTestId('calendar-background')
          .filter({visible: true})
          .locator('img'),
      ).toHaveJSProperty('naturalWidth', 687);
      const backdrop = await page
        .getByTestId('calendar-background')
        .filter({visible: true})
        .boundingBox();
      expect(backdrop!.width).toBeLessThanOrEqual(width);
      expect(backdrop!.height).toBeLessThanOrEqual(900);
      const bounds = await connect.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      await expect(connect).toHaveCSS(
        'backdrop-filter',
        mode === 'dark' ? 'blur(15px)' : 'blur(20px) saturate(1.2)',
      );
      if (mode === 'light') {
        const card = page.getByRole('button', {name: /Weekly planning/});
        await expect(card).toHaveCSS(
          'border-color',
          'rgba(255, 255, 255, 0.45)',
        );
        await expect(card).toHaveCSS(
          'background-image',
          /linear-gradient\(135deg/,
        );
        await expect(card).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
        await expect(card).toHaveCSS('border-radius', '18px');
        await expect(card).toHaveCSS(
          'backdrop-filter',
          'blur(8px) saturate(1.2) brightness(1.04)',
        );
        await expect(
          page.getByTestId('calendar-background').filter({visible: true}),
        ).toHaveCSS('filter', 'saturate(0.5) contrast(0.72) brightness(1.1)');
        await expect(page.getByText('10:00 AM', {exact: true})).toHaveCSS(
          'color',
          'rgb(57, 51, 48)',
        );
        await expect(control.locator('canvas')).toHaveCount(0);
      }
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
