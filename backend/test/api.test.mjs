import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {createApp} from '../src/app.mjs';
import {createCalendarClient} from '../src/calendar.mjs';
import {readConfig} from '../src/config.mjs';

const apiKey = 'test-controller-key-with-at-least-32-characters';
const config = readConfig({DEV_API_KEY: apiKey});
function setup(options = {}) {
  const logs = [];
  const app = createApp(config, {logger: line => logs.push(line), ...options});
  return {app, logs};
}
const auth = req => req.set('Authorization', `Bearer ${apiKey}`);
const display = req => req.set('Origin', config.displayOrigin);
async function register(app) {
  return (
    await request(app)
      .post('/api/devices/register')
      .send({name: 'Living room'})
      .expect(201)
  ).body;
}
async function pair(app) {
  const session = await register(app);
  await auth(request(app).post('/api/pairings/claim'))
    .send({code: session.pairingCode})
    .expect(201);
  const poll = () =>
    request(app)
      .get(`/api/pairings/${session.sessionId}`)
      .set('Authorization', `Bearer ${session.sessionSecret}`);
  const credentials = (await poll().expect(200)).body;
  assert.deepEqual((await poll().expect(200)).body, credentials);
  return {...session, ...credentials};
}

test('health, CORS, errors and logging do not expose request secrets', async () => {
  const {app, logs} = setup();
  await request(app)
    .get('/health')
    .set('Origin', config.webOrigin)
    .expect(200)
    .expect('Access-Control-Allow-Origin', config.webOrigin);
  await request(app).get('/missing?secret=never-log-me').expect(404);
  const malformed = await request(app)
    .post('/api/devices/register')
    .set('Content-Type', 'application/json')
    .send('{secret: never-log-me')
    .expect(400);
  assert.equal(malformed.body.error.code, 'INVALID_JSON');
  assert.ok(malformed.body.error.requestId);
  await request(app)
    .post('/api/devices/register')
    .send({name: 'x'.repeat(17000)})
    .expect(413);
  assert.ok(!logs.join('').includes('never-log-me'));
});

test('pair, control, poll, acknowledge and revoke with separate credentials', async () => {
  const {app, logs} = setup();
  const device = await pair(app);
  const base = `/api/devices/${device.deviceId}`;
  const tv = req =>
    req.set('Authorization', `Bearer ${device.deviceCredential}`);
  await request(app).get(`${base}/state`).expect(401);
  await auth(request(app).get(`${base}/state`)).expect(401);
  await tv(request(app).post(`${base}/control`))
    .send({view: 'today'})
    .expect(401);
  const control = await auth(request(app).post(`${base}/control`))
    .send({view: 'today', refresh: true})
    .expect(200);
  assert.equal(control.body.device.revision, 1);
  const state = await tv(request(app).get(`${base}/state`)).expect(200);
  assert.equal(state.body.device.settings.view, 'today');
  assert.ok(state.body.device.lastSeenAt);
  await tv(request(app).post(`${base}/ack`))
    .send({revision: 2})
    .expect(400);
  await tv(request(app).post(`${base}/ack`))
    .send({revision: 1})
    .expect(200);
  const stale = await tv(request(app).post(`${base}/ack`))
    .send({revision: 0})
    .expect(200);
  assert.equal(stale.body.device.appliedRevision, 1);
  const list = await auth(request(app).get('/api/devices')).expect(200);
  assert.equal(list.body.devices.length, 1);
  assert.ok(!JSON.stringify(list.body).includes(device.deviceCredential));
  await auth(request(app).post('/api/pairings/claim'))
    .send({code: device.pairingCode})
    .expect(409);
  await auth(request(app).delete(base)).expect(204);
  await tv(request(app).get(`${base}/state`)).expect(401);
  await request(app)
    .get(`/api/pairings/${device.sessionId}`)
    .set('Authorization', `Bearer ${device.sessionSecret}`)
    .expect(401);
  for (const secret of [
    apiKey,
    device.pairingCode,
    device.deviceCredential,
    device.sessionSecret,
  ])
    assert.ok(!logs.join('').includes(secret));
});

test('pending sessions expire and cannot be claimed', async () => {
  let clock = Date.now();
  const {app} = setup({now: () => clock});
  const session = await register(app);
  const poll = () =>
    request(app)
      .get(`/api/pairings/${session.sessionId}`)
      .set('Authorization', `Bearer ${session.sessionSecret}`);
  assert.equal((await poll().expect(200)).body.status, 'pending');
  clock += 600001;
  await auth(request(app).post('/api/pairings/claim'))
    .send({code: session.pairingCode})
    .expect(404);
  await poll().expect(410);
});

test('device credentials cannot access another device', async () => {
  const {app} = setup();
  const a = await pair(app);
  const b = await pair(app);
  await request(app)
    .get(`/api/devices/${b.deviceId}/events`)
    .set('Authorization', `Bearer ${a.deviceCredential}`)
    .expect(401);
});

test('browser pairing persists in an HttpOnly cookie and is revoked with the device', async () => {
  const {app, logs} = setup({
    calendar: async range => ({...range, events: [], calendarCount: 1}),
  });
  const device = await pair(app);
  const saved = await display(request(app).post('/api/display/session'))
    .set('Authorization', `Bearer ${device.deviceCredential}`)
    .send({deviceId: device.deviceId})
    .expect(200);
  const cookie = saved.headers['set-cookie'][0];
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Strict/);
  assert.match(cookie, /Path=\/api\/display/);
  assert.match(cookie, /Max-Age=31536000/);
  assert.equal(saved.body.deviceCredential, '');
  const restored = await display(request(app).get('/api/display/session'))
    .set('Cookie', cookie)
    .expect(200);
  assert.equal(restored.body.deviceId, device.deviceId);
  assert.equal(restored.body.deviceCredential, '');
  await display(request(app).get('/api/display/events'))
    .set('Cookie', cookie)
    .expect(200);
  await request(app)
    .get(`/api/devices/${device.deviceId}/state`)
    .set('Cookie', cookie)
    .expect(401);
  await auth(request(app).delete(`/api/devices/${device.deviceId}`)).expect(
    204,
  );
  const revoked = await display(request(app).get('/api/display/session'))
    .set('Cookie', cookie)
    .expect(401);
  assert.match(revoked.headers['set-cookie'][0], /Expires=Thu, 01 Jan 1970/);
  assert.ok(!logs.join('').includes(device.deviceCredential));
});

test('browser session rejects foreign origins, invalid credentials, and cookies after restart', async () => {
  const {app} = setup();
  const device = await pair(app);
  for (const origin of ['https://untrusted.example', config.webOrigin, '']) {
    await request(app)
      .post('/api/display/session')
      .set('Origin', origin)
      .set('Authorization', `Bearer ${device.deviceCredential}`)
      .send({deviceId: device.deviceId})
      .expect(403);
    await request(app)
      .get('/api/display/events')
      .set('Origin', origin)
      .expect(403);
  }
  await display(request(app).post('/api/display/session'))
    .set('Authorization', `Bearer ${apiKey}`)
    .send({deviceId: device.deviceId})
    .expect(401);
  const saved = await display(request(app).post('/api/display/session'))
    .set('Authorization', `Bearer ${device.deviceCredential}`)
    .send({deviceId: device.deviceId})
    .expect(200);
  const restarted = setup().app;
  await display(request(restarted).get('/api/display/session'))
    .set('Cookie', saved.headers['set-cookie'][0])
    .expect(401);
});

test('validation rejects malformed settings without changing state', async () => {
  const {app} = setup();
  const device = await pair(app);
  const url = `/api/devices/${device.deviceId}/control`;
  for (const invalid of [
    {},
    {view: 'bad'},
    {refresh: 'true'},
    {view: 'range', timeMin: 'bad'},
    {view: 'today', timeMin: 'bad'},
    {view: 'week', extra: 1},
  ]) {
    await auth(request(app).post(url)).send(invalid).expect(400);
  }
  const list = (await auth(request(app).get('/api/devices'))).body;
  assert.equal(list.devices[0].revision, 0);
  await auth(request(app).post(url))
    .send({
      view: 'range',
      timeMin: '2026-09-16T00:00:00Z',
      timeMax: '2026-09-17T00:00:00Z',
    })
    .expect(200);
});

test('calendar endpoint requires authentication and reports missing connection', async () => {
  const {app} = setup();
  await request(app).get('/api/calendar/events').expect(401);
  await auth(request(app).get('/api/calendar/events?timeMin=bad')).expect(400);
  const response = await auth(request(app).get('/api/calendar/events')).expect(
    503,
  );
  assert.equal(response.body.error.code, 'CALENDAR_NOT_CONNECTED');
});

test('calendar routes pass validated ranges to provider', async () => {
  const calls = [];
  const {app} = setup({
    calendar: async range => {
      calls.push(range);
      return {...range, events: [{id: 'sample'}]};
    },
  });
  const device = await pair(app);
  const range = {
    timeMin: '2026-09-16T00:00:00Z',
    timeMax: '2026-09-17T00:00:00Z',
  };
  const response = await request(app)
    .get(`/api/devices/${device.deviceId}/events`)
    .query(range)
    .set('Authorization', `Bearer ${device.deviceCredential}`)
    .expect(200);
  assert.deepEqual(calls, [range]);
  assert.equal(response.body.events[0].id, 'sample');
});

test('default calendar request sends seven days to Google and retains later events', async () => {
  const start = Date.parse('2026-09-16T15:00:00Z');
  const app = createApp(
    {...config, calendarToken: 'test-google-token'},
    {
      now: () => start,
      logger: () => {},
      calendarFetch: async url => {
        assert.equal(
          url.searchParams.get('timeMin'),
          '2026-09-16T15:00:00.000Z',
        );
        assert.equal(
          url.searchParams.get('timeMax'),
          '2026-09-23T15:00:00.000Z',
        );
        assert.equal(url.searchParams.get('singleEvents'), 'true');
        return Response.json({
          items: [
            {id: 'today', start: {dateTime: '2026-09-16T18:00:00Z'}},
            {id: 'tomorrow', start: {dateTime: '2026-09-17T18:00:00Z'}},
            {id: 'next-week', start: {dateTime: '2026-09-22T18:00:00Z'}},
          ],
        });
      },
    },
  );
  const response = await auth(request(app).get('/api/calendar/events')).expect(
    200,
  );
  assert.deepEqual(
    response.body.events.map(event => event.id),
    ['today', 'tomorrow', 'next-week'],
  );
});

test('registration is rate limited', async () => {
  const {app} = setup();
  for (let i = 0; i < 10; i++) await register(app);
  await request(app)
    .post('/api/devices/register')
    .send({name: 'Another TV'})
    .expect(429);
});

test('calendar client handles pagination, all-day events and cancellation', async () => {
  let count = 0;
  const client = createCalendarClient(
    {...config, calendarToken: 'google-secret'},
    async (url, options) => {
      assert.equal(options.headers.Authorization, 'Bearer google-secret');
      assert.equal(url.searchParams.get('singleEvents'), 'true');
      count++;
      if (count === 1)
        return Response.json({
          items: [
            {id: 'a', start: {date: '2026-09-16'}, end: {date: '2026-09-17'}},
          ],
          nextPageToken: 'page-two',
        });
      assert.equal(url.searchParams.get('pageToken'), 'page-two');
      return Response.json({
        items: [
          {id: 'cancelled', status: 'cancelled'},
          {
            id: 'b',
            summary: 'Meeting',
            start: {dateTime: '2026-09-16T12:00:00Z'},
          },
        ],
      });
    },
  );
  const result = await client({
    timeMin: '2026-09-16T00:00:00Z',
    timeMax: '2026-09-17T00:00:00Z',
  });
  assert.equal(result.events.length, 2);
  assert.equal(result.events[0].allDay, true);
  assert.equal(result.events[1].title, 'Meeting');
});

test('calendar upstream failures are sanitized', async () => {
  for (const [status, code] of [
    [401, 'CALENDAR_REAUTH_REQUIRED'],
    [403, 'CALENDAR_ACCESS_DENIED'],
    [500, 'CALENDAR_UPSTREAM_ERROR'],
  ]) {
    const client = createCalendarClient(
      {...config, calendarToken: 'secret'},
      async () => new Response('sensitive upstream error', {status}),
    );
    await assert.rejects(
      client({timeMin: 'a', timeMax: 'b'}),
      error => error.code === code && !error.message.includes('sensitive'),
    );
  }
  const client = createCalendarClient(
    {...config, calendarToken: 'secret'},
    async () => {
      throw new Error('sensitive');
    },
  );
  await assert.rejects(client({timeMin: 'a', timeMax: 'b'}), {
    code: 'CALENDAR_UNAVAILABLE',
  });
});

test('configuration rejects missing credentials, invalid ports and production mode', () => {
  assert.throws(() => readConfig({}), /DEV_API_KEY/);
  assert.throws(() => readConfig({DEV_API_KEY: apiKey, PORT: 'bad'}), /PORT/);
  assert.throws(
    () => readConfig({DEV_API_KEY: apiKey, NODE_ENV: 'production'}),
    /production/,
  );
});

test('combines all readable calendars, follows both pagination types, and sorts events', async () => {
  const visited = [];
  const range = {
    timeMin: '2026-09-17T00:00:00Z',
    timeMax: '2026-09-24T00:00:00Z',
  };
  const event = (id, date) => ({id, start: {dateTime: `${date}T12:00:00Z`}});
  const client = createCalendarClient(
    {...config, calendarToken: 'test', includeAllCalendars: true},
    async url => {
      if (url.pathname.endsWith('/calendarList')) {
        assert.equal(url.searchParams.get('minAccessRole'), 'reader');
        assert.equal(url.searchParams.get('showHidden'), 'true');
        if (!url.searchParams.has('pageToken'))
          return Response.json({
            items: [
              {id: 'main', summary: 'Personal', accessRole: 'owner'},
              {id: 'busy', accessRole: 'freeBusyReader'},
              {id: 'deleted', accessRole: 'owner', deleted: true},
            ],
            nextPageToken: 'calendars-2',
          });
        assert.equal(url.searchParams.get('pageToken'), 'calendars-2');
        return Response.json({
          items: [
            {
              id: 'school@example.test',
              summary: 'School',
              accessRole: 'reader',
              hidden: true,
              selected: false,
            },
          ],
        });
      }
      for (const [key, value] of Object.entries(range))
        assert.equal(url.searchParams.get(key), value);
      const id = decodeURIComponent(url.pathname.split('/').at(-2));
      visited.push(id);
      if (id === 'main')
        return Response.json({items: [event('same-id', '2026-09-22')]});
      assert.equal(id, 'school@example.test');
      if (!url.searchParams.has('pageToken'))
        return Response.json({
          items: [event('same-id', '2026-09-18')],
          nextPageToken: 'events-2',
        });
      assert.equal(url.searchParams.get('pageToken'), 'events-2');
      return Response.json({
        items: [
          {
            id: 'all-day',
            start: {date: '2026-09-17'},
            end: {date: '2026-09-18'},
          },
          {id: 'cancelled', status: 'cancelled'},
        ],
      });
    },
  );
  const result = await client(range);
  assert.equal(result.calendarCount, 2);
  assert.deepEqual(visited, [
    'main',
    'school@example.test',
    'school@example.test',
  ]);
  assert.deepEqual(
    result.events.map(value => [value.id, value.calendarName]),
    [
      ['all-day', 'School'],
      ['same-id', 'School'],
      ['same-id', 'Personal'],
    ],
  );
  assert.equal(result.events[0].allDay, true);
});

test('missing calendar-list permission asks the user to reconnect', async () => {
  const client = createCalendarClient(
    {...config, calendarToken: 'old-grant', includeAllCalendars: true},
    async () => new Response('', {status: 403}),
  );
  await assert.rejects(
    client({timeMin: 'a', timeMax: 'b'}),
    error =>
      error.code === 'CALENDAR_ACCESS_DENIED' &&
      error.message.includes('Reconnect'),
  );
});

test('a failed subsidiary calendar is not silently presented as a complete result', async () => {
  const client = createCalendarClient(
    {...config, calendarToken: 'test', includeAllCalendars: true},
    async url => {
      if (url.pathname.endsWith('/calendarList'))
        return Response.json({
          items: [
            {id: 'main', accessRole: 'owner'},
            {id: 'shared', accessRole: 'reader'},
          ],
        });
      return url.pathname.includes('/main/')
        ? Response.json({items: []})
        : new Response('', {status: 403});
    },
  );
  await assert.rejects(client({timeMin: 'a', timeMax: 'b'}), {
    code: 'CALENDAR_ACCESS_DENIED',
  });
});

test('display origin can register and use bearer credentials without opening cookie controls', async () => {
  const {app} = setup();
  await request(app)
    .options('/api/devices/register')
    .set('Origin', config.displayOrigin)
    .set('Access-Control-Request-Method', 'POST')
    .set('Access-Control-Request-Headers', 'Content-Type,Authorization')
    .expect(204)
    .expect('Access-Control-Allow-Origin', config.displayOrigin);
  const blocked = await request(app)
    .options('/api/devices/register')
    .set('Origin', 'https://untrusted.example')
    .set('Access-Control-Request-Method', 'POST')
    .expect(204);
  assert.equal(blocked.headers['access-control-allow-origin'], undefined);
  await request(app)
    .post('/auth/logout')
    .set('Origin', config.displayOrigin)
    .expect(403);
});
