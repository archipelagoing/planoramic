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
