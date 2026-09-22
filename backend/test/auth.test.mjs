import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import request from 'supertest';
import {createApp} from '../src/app.mjs';
import {readConfig} from '../src/config.mjs';
import {ApiError} from '../src/errors.mjs';
import {
  createGoogleProvider,
  CALENDAR_SCOPE,
  CALENDAR_WRITE_SCOPE,
  CALENDAR_LIST_SCOPE,
} from '../src/google.mjs';

const config = readConfig({
  DEV_API_KEY: 'development-key-at-least-32-characters',
  GOOGLE_CLIENT_ID: 'test-id',
  GOOGLE_CLIENT_SECRET: 'test-secret',
});
function setup() {
  let clock = Date.now();
  let refreshError;
  let googleStatus = 200;
  let first401 = false;
  let refreshCount = 0;
  const calls = [];
  const exchanges = [];
  const authorizations = new Map();
  const provider = {
    authorizationUrl(data) {
      authorizations.set(data.state, data);
      return `https://accounts.google.com/test?state=${data.state}`;
    },
    async exchange({code, verifier, nonce}) {
      const authorization = [...authorizations.values()].find(
        item => item.nonce === nonce,
      );
      assert.equal(
        createHash('sha256').update(verifier).digest('base64url'),
        authorization.challenge,
      );
      exchanges.push(code);
      return {
        user: {id: `google:${code}`, email: `${code}@example.test`},
        tokens: {
          access_token: `access-${code}`,
          refresh_token: `refresh-${code}`,
          expiry_date: clock + 3600000,
        },
      };
    },
    async refresh(tokens) {
      refreshCount++;
      if (refreshError) throw refreshError;
      return {
        access_token: `renewed-${tokens.refresh_token}`,
        expiry_date: clock + 3600000,
      };
    },
  };
  const app = createApp(config, {
    now: () => clock,
    logger: () => {},
    googleProvider: provider,
    calendarFetch: async (url, options) => {
      if (url.pathname.endsWith('/calendarList'))
        return Response.json({
          items: [{id: 'primary', accessRole: 'owner', summary: 'Main'}],
        });
      calls.push(options.headers.Authorization);
      if (first401) {
        first401 = false;
        return new Response('', {status: 401});
      }
      return googleStatus === 200
        ? Response.json({items: []})
        : new Response('', {status: googleStatus});
    },
  });
  async function start(agent) {
    const response = await agent.get('/auth/google').expect(302);
    return new URL(response.headers.location).searchParams.get('state');
  }
  async function login(name, agent = request.agent(app)) {
    const state = await start(agent);
    const response = await agent
      .get('/auth/google/callback')
      .query({state, code: name})
      .expect(302);
    assert.equal(response.headers.location, '/connect');
    assert.ok(!response.text.includes(`access-${name}`));
    assert.ok(
      response.headers['set-cookie'].some(
        value => value.includes('HttpOnly') && value.includes('SameSite=Lax'),
      ),
    );
    return agent;
  }
  async function pair(agent) {
    const session = (
      await request(app)
        .post('/api/devices/register')
        .send({name: 'TV'})
        .expect(201)
    ).body;
    await agent
      .post('/api/pairings/claim')
      .set('Origin', config.backendOrigin)
      .send({code: session.pairingCode})
      .expect(201);
    return (
      await request(app)
        .get(`/api/pairings/${session.sessionId}`)
        .set('Authorization', `Bearer ${session.sessionSecret}`)
        .expect(200)
    ).body;
  }
  return {
    app,
    calls,
    exchanges,
    start,
    login,
    pair,
    advance: ms => {
      clock += ms;
    },
    setRefreshError: error => {
      refreshError = error;
    },
    set401: () => {
      first401 = true;
    },
    setGoogleStatus: status => {
      googleStatus = status;
    },
    refreshCount: () => refreshCount,
  };
}

test('authorization URL requests task-write offline access, state, nonce and PKCE', () => {
  const url = new URL(
    createGoogleProvider(config).authorizationUrl({
      state: 'state',
      nonce: 'nonce',
      challenge: 'challenge',
    }),
  );
  assert.equal(url.origin, 'https://accounts.google.com');
  for (const [key, value] of Object.entries({
    state: 'state',
    nonce: 'nonce',
    code_challenge: 'challenge',
    code_challenge_method: 'S256',
    access_type: 'offline',
    redirect_uri: config.googleRedirectUri,
  }))
    assert.equal(url.searchParams.get(key), value);
  assert.ok(url.searchParams.get('scope').split(' ').includes(CALENDAR_WRITE_SCOPE));
  assert.ok(
    url.searchParams.get('scope').split(' ').includes(CALENDAR_LIST_SCOPE),
  );
});

test('OAuth state is browser-bound, single-use and expires', async () => {
  const s = setup();
  const alice = request.agent(s.app);
  const state = await s.start(alice);
  await request(s.app)
    .get('/auth/google/callback')
    .query({state, code: 'alice'})
    .expect(400);
  await alice
    .get('/auth/google/callback')
    .query({state: 'wrong', code: 'alice'})
    .expect(400);
  await alice
    .get('/auth/google/callback')
    .query({state, code: 'alice'})
    .expect(302);
  await alice
    .get('/auth/google/callback')
    .query({state, code: 'alice'})
    .expect(400);
  assert.deepEqual(s.exchanges, ['alice']);
  const expired = await s.start(alice);
  s.advance(600001);
  await alice
    .get('/auth/google/callback')
    .query({state: expired, code: 'alice'})
    .expect(400);
});

test('denied consent and missing credentials produce actionable errors', async () => {
  const s = setup();
  const agent = request.agent(s.app);
  const state = await s.start(agent);
  const response = await agent
    .get('/auth/google/callback')
    .query({state, error: 'access_denied'})
    .expect(400);
  assert.equal(response.body.error.code, 'GOOGLE_CONSENT_DENIED');
  assert.equal(s.exchanges.length, 0);
  const app = createApp(readConfig({DEV_API_KEY: config.apiKey}), {
    logger: () => {},
  });
  await request(app).get('/auth/google').expect(503);
  const page = await request(app).get('/connect').expect(200);
  assert.ok(page.text.includes('Connect your calendar'));
});

test('each user can see and control only their own devices and calendar', async () => {
  const s = setup();
  const alice = await s.login('alice');
  const bob = await s.login('bob');
  const device = await s.pair(alice);
  const endpoint = `/api/devices/${device.deviceId}`;
  assert.equal(
    (await alice.get('/api/devices').expect(200)).body.devices.length,
    1,
  );
  assert.equal(
    (await bob.get('/api/devices').expect(200)).body.devices.length,
    0,
  );
  await bob
    .post(`${endpoint}/control`)
    .set('Origin', config.backendOrigin)
    .send({view: 'today'})
    .expect(404);
  await bob.delete(endpoint).set('Origin', config.backendOrigin).expect(404);
  await request(s.app)
    .delete(endpoint)
    .set('Authorization', `Bearer ${config.apiKey}`)
    .expect(404);
  await alice.get('/api/calendar/events').expect(200);
  await bob.get('/api/calendar/events').expect(200);
  await request(s.app)
    .get(`${endpoint}/events`)
    .set('Authorization', `Bearer ${device.deviceCredential}`)
    .expect(200);
  assert.deepEqual(s.calls, [
    'Bearer access-alice',
    'Bearer access-bob',
    'Bearer access-alice',
  ]);
  const me = (await alice.get('/auth/me')).body;
  assert.equal(me.user.email, 'alice@example.test');
  assert.ok(!JSON.stringify(me).includes('refresh-alice'));
});

test('cookie-authenticated writes require an allowed Origin', async () => {
  const s = setup();
  const agent = await s.login('alice');
  const device = await s.pair(agent);
  for (const origin of [undefined, 'https://attacker.example']) {
    const req = agent.post(`/api/devices/${device.deviceId}/control`);
    if (origin) req.set('Origin', origin);
    await req.send({view: 'today'}).expect(403);
  }
  await agent.post('/auth/logout').expect(403);
  await agent
    .post('/auth/disconnect')
    .set('Origin', 'https://attacker.example')
    .expect(403);
  await agent
    .post(`/api/devices/${device.deviceId}/control`)
    .set('Origin', config.webOrigin)
    .send({view: 'today'})
    .expect(200);
});

test('expired access tokens refresh automatically; a Google 401 retries once', async () => {
  const s = setup();
  const agent = await s.login('alice');
  s.advance(3600001);
  await Promise.all([
    agent.get('/api/calendar/events').expect(200),
    agent.get('/api/calendar/events').expect(200),
  ]);
  assert.equal(s.refreshCount(), 1);
  assert.ok(s.calls.every(value => value === 'Bearer renewed-refresh-alice'));
  s.set401();
  await agent.get('/api/calendar/events').expect(200);
  assert.equal(s.refreshCount(), 2);
  s.setGoogleStatus(401);
  const result = await agent.get('/api/calendar/events').expect(503);
  assert.equal(result.body.error.code, 'CALENDAR_REAUTH_REQUIRED');
});

test('revoked refresh token disconnects calendar; transient failures can retry', async () => {
  const s = setup();
  const agent = await s.login('alice');
  s.advance(3600001);
  s.setRefreshError(new ApiError(502, 'GOOGLE_REFRESH_FAILED', 'Try again.'));
  await agent.get('/api/calendar/events').expect(502);
  assert.equal((await agent.get('/auth/me')).body.calendarConnected, true);
  s.setRefreshError(
    new ApiError(503, 'CALENDAR_REAUTH_REQUIRED', 'Reconnect.'),
  );
  await agent.get('/api/calendar/events').expect(503);
  assert.equal((await agent.get('/auth/me')).body.calendarConnected, false);
  s.setRefreshError(undefined);
  await s.login('alice', agent);
  await agent.get('/api/calendar/events').expect(200);
});

test('logout ends browser session; disconnect also stops paired calendar access', async () => {
  const s = setup();
  const agent = await s.login('alice');
  const device = await s.pair(agent);
  const events = () =>
    request(s.app)
      .get(`/api/devices/${device.deviceId}/events`)
      .set('Authorization', `Bearer ${device.deviceCredential}`);
  await agent
    .post('/auth/logout')
    .set('Origin', config.backendOrigin)
    .expect(204);
  await agent.get('/api/calendar/events').expect(401);
  await events().expect(200);
  await s.login('alice', agent);
  await agent
    .post('/auth/disconnect')
    .set('Origin', config.backendOrigin)
    .expect(204);
  await agent.get('/api/calendar/events').expect(401);
  await events().expect(503);
});

test('browser sessions expire after one day', async () => {
  const s = setup();
  const agent = await s.login('alice');
  s.advance(86400001);
  await agent.get('/api/devices').expect(401);
});
