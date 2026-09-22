# Backend

Express API for local development of the TV display and phone controls. Requires
Node.js 22 or newer. Data lives in memory: devices, browser sessions, and Google
tokens are forgotten when the server restarts. Production startup is disabled until
persistent storage and deployment hardening exist. Google users have separate
calendars/devices; the development API key accesses a separate development account.

## Connect Google Calendar

Follow [Google Cloud setup](../docs/google-calendar-setup.md), configure the OAuth
client in `.env`, restart, and open `http://localhost:3001/connect`. The connection
page lets you sign in and load upcoming events before the phone app is built.

## Run

```sh
cd backend
npm install
cp .env.example .env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the generated value into `DEV_API_KEY` in `.env`, then run `npm run dev`.
The default address is `http://127.0.0.1:3001`. Check it with:

```sh
curl http://127.0.0.1:3001/health
```

Use `npm start` without watch mode, or `npm test` for API and calendar-client tests.
Tests use a fake Google provider and do not need Google credentials.

## API

Send JSON bodies with `Content-Type: application/json`. Authorized routes require
`Authorization: Bearer <credential>` for devices and development-key requests;
never put credentials in URLs. Controller routes also accept an HttpOnly Google
sign-in session cookie. Browser writes require an allowed `Origin`; cross-origin
phone requests must include credentials. The development key does not grant access
to Google users' devices or OAuth credentials.

| Method | Endpoint | Credential | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | None | Service status |
| POST | `/api/devices/register` | None | Start pairing with `{"name":"Living room"}` |
| POST | `/api/pairings/claim` | Development API key | Claim with `{"code":"<pairingCode>"}` |
| GET | `/api/pairings/:sessionId` | Session secret | Poll status and retrieve device credential |
| GET | `/api/devices` | Development API key | List devices and check-in status |
| POST | `/api/devices/:deviceId/control` | Development API key | Set view or request refresh |
| GET | `/api/devices/:deviceId/state` | Device credential | Fetch settings and revision; record check-in |
| POST | `/api/devices/:deviceId/ack` | Device credential | Report `{"revision":1}` after applying state |
| GET | `/api/calendar/events` | Development API key | Fetch configured calendar events |
| GET | `/api/devices/:deviceId/events` | Device credential | Fetch events for a paired TV |
| DELETE | `/api/devices/:deviceId` | Development API key | Unlink and revoke a TV |

Registration returns `sessionId`, `pairingCode`, `sessionSecret`, `expiresAt`, and
`pairingUrl`. Codes expire after 10 minutes and can only be claimed once. Polling
with the separate secret returns `{"status":"pending"}` until claimed; afterward
it returns `status`, `deviceId`, and `deviceCredential`. Polling returns the same
credential until session expiry to recover from a lost response. Store the device
credential before expiry. Unlinking invalidates both credentials.

The pairing URL points to the future phone app; that UI is not implemented yet.
Claim codes using a signed-in session to link a device to that Google user, or use
the development API key for manual testing in the separate development account.
All controller routes enforce account ownership. Never ship the development key
inside a phone app or TV bundle.

The browser display exchanges its paired bearer credential using
`POST /api/display/session` with `{ "deviceId": "..." }`. The backend stores the
credential in a one-year HttpOnly, SameSite=Strict cookie scoped to `/api/display`
(Secure when the backend origin uses HTTPS). `GET /api/display/session` restores
the device ID without exposing its credential, and `GET /api/display/events`
fetches its events. These routes require the configured display or backend Origin;
the browser uses credentialed fetches. They do not authorize controller actions.
An invalid or revoked device clears the cookie. Native displays retain bearer
credentials in Expo SecureStore. Restarting this in-memory backend invalidates
both browser and native pairings.

Control body examples:

```json
{"view":"today"}
```

```json
{"view":"week","refresh":true}
```

```json
{"view":"range","timeMin":"2026-09-16T00:00:00Z","timeMax":"2026-09-23T00:00:00Z"}
```

`{"refresh":true}` also works alone. Accepted updates increment `revision`; the TV
will poll every 15 seconds and acknowledge the applied revision. A control response
confirms state was saved, not that the TV applied it. The TV integration is still
to be built. `today` and `week` are view settings; the client supplies explicit
event-query bounds for its local time zone.

## Calendar connection

Event endpoints accept optional RFC3339 `timeMin` and `timeMax` query parameters
with timezone offsets. Bounds must increase and span at most 93 days. The default
is now through seven days from now. Responses contain `events`, `timeMin`, and
`timeMax`, and `calendarCount`; event fields are `id`, `calendarId`, `calendarName`, `title`, `start`, `end`, `allDay`, `location`, and
`description`. All-day dates remain dates and preserve Google's exclusive end date.
Render event titles/descriptions as untrusted text, not raw HTML.

For signed-in users and their paired TVs, the backend lists all readable calendars
(including hidden/unchecked calendars), fetches each calendar for the same date
range, and merges events in chronological order. It selects the owner's Google
tokens and automatically refreshes them. Identify an event by both `calendarId`
and `id`; copies on different calendars remain separate entries. A failed calendar
fetch fails the request instead of silently returning incomplete results.
Without `GOOGLE_CALENDAR_ACCESS_TOKEN`,
the separate development account returns HTTP 503 with `CALENDAR_NOT_CONNECTED`.
That optional manual token is never substituted for a user's OAuth credentials.
The adapter calls Google's
[events.list API](https://developers.google.com/calendar/api/v3/reference/events/list),
expands recurring events, follows pagination, and omits cancellations. Requests have
a 30-second total timeout and a 20-page bound per listing. No event cache is implemented yet.

Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` using
`.env.example`. OAuth sign-in requests read-only calendar event access and offline
refresh permission. Revoked credentials return `CALENDAR_REAUTH_REQUIRED`; reconnect
through `/connect`. Private calendar access requires OAuth authorization; a Google
API key alone cannot provide it. See the setup guide for auth routes and logout behavior.

## Configuration and errors

- `HOST` / `PORT`: default to `127.0.0.1:3001`. Use `HOST=0.0.0.0` when testing from
  a TV or phone on your trusted local network, using your computer's LAN address.
- `WEB_ORIGIN`: exact allowed browser origin; defaults to `http://localhost:5173`
  for the future phone app. Set `http://localhost:8081` for requests from the Expo
  browser preview. CORS does not replace authentication.
- `DEV_API_KEY`: required random controller credential of at least 32 characters.
- `GOOGLE_CALENDAR_ID`: defaults to `primary` for the development-key account only.
  Google sign-in sessions and their TVs automatically use all readable calendars.

Errors use `{"error":{"code":"...","message":"...","requestId":"..."}}`.
Responses include `X-Request-Id`. JSON logs contain route templates, status, timing,
and sanitized error codes without bodies, query strings, or credentials. JSON
payloads are limited to 16 KB. Registration and claims are limited to 10 requests
per minute per IP; API traffic is limited to 300 per minute per IP. The local server
does not trust forwarded proxy headers.

Next: verify live Google access, add durable device/token storage and calendar
caching, and build TV/phone clients. See [the pairing design](../docs/device-pairing.md).
