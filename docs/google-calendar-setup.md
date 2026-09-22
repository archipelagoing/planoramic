# Connect Google Calendar locally

The backend implements Google sign-in, read-only event access, per-user device
ownership, and automatic access-token refresh. Google Cloud configuration must be
completed in your account before a live calendar can be fetched.

## 1. Configure Google Cloud

1. Open [Google Cloud Console](https://console.cloud.google.com/) and create or
   select a project for Planoramic.
2. In **APIs & Services → Library**, enable **Google Calendar API**.
3. Open **Google Auth Platform** (also reachable through **OAuth consent screen**).
   Configure the app name, support email, and contact email in **Branding**.
4. For a personal Gmail account, select **External** under **Audience**, keep the
   app in **Testing**, and add your Google email under **Test users**. A Workspace
   organization can use Internal when appropriate for its account policy.
5. Under **Data Access**, add these scopes:
   - `openid`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/calendar.events.readonly`
   - `https://www.googleapis.com/auth/calendar.calendarlist.readonly`
6. Under **Clients**, create an OAuth client with application type **Web application**.
   Add this exact **Authorized redirect URI**:

   ```text
   http://localhost:3001/auth/google/callback
   ```

   The backend performs the code exchange. No Google JavaScript client or API key
   is needed for this flow, and no Authorized JavaScript Origin is required.
7. Save the client ID and client secret locally in `backend/.env`:

   ```dotenv
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

   GOOGLE_CLIENT_SECRET=your-client-secret
   
   GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
   ```

Keep the existing `DEV_API_KEY`. Leave `GOOGLE_CALENDAR_ACCESS_TOKEN` empty when
using browser sign-in. Do not paste secrets into chat or commit `.env`.

See Google's [consent-screen setup](https://developers.google.com/workspace/guides/configure-oauth-consent)
and [web-server OAuth guide](https://developers.google.com/identity/protocols/oauth2/web-server).

## 2. Connect and check events

Restart the backend after editing `.env` (Node watch mode may not reload `.env`):

```sh
cd backend
npm run dev
```

1. Open [the connection page](http://localhost:3001/connect) on your computer.
   Use `localhost` consistently, including before sign-in; a cookie set on
   `127.0.0.1` will not accompany a callback to `localhost`.
2. Choose **Connect Google Calendar**, select your test account, and grant the
   requested read-only calendar access.
3. Google returns you to `/connect`. Choose **Load upcoming events** to see the
   next seven days across all readable calendars on your Google Calendar list,
   including subsidiary/shared calendars and hidden or unchecked calendars. Each
   event shows its source calendar. Calendars with only free/busy access are excluded.
   An empty result displays an empty-state message.
4. **Sign out** ends only that browser session. Paired TVs can continue fetching
   events. **Disconnect calendar** removes this backend's Google tokens and ends
   all local browser sessions for that account. Existing TVs cannot fetch calendar
   data until the same owner reconnects. To revoke Google's grant itself, remove
   Planoramic from your [Google account connections](https://myaccount.google.com/connections).

This connection page is a small local integration preview, not the future phone
control UI. Devices must be paired using the signed-in session to access that user's
calendar; devices claimed with `DEV_API_KEY` stay in a separate development account.

## Authentication and API behavior

If you connected before multi-calendar support was added, add the calendar-list
scope under **Google Auth Platform → Data Access**, restart the backend, and
connect Google again to grant the new permission. Merely refreshing an old access
token does not add permissions. The
[calendar list API](https://developers.google.com/workspace/calendar/api/v3/reference/calendarList/list)
requires calendar-list read access. Calendars from another account must be shared
with and added to the signed-in account's calendar list to be included.

- `GET /auth/google`: starts authorization with state, nonce, and PKCE protection.
- `GET /auth/google/callback`: exchanges a one-use code, verifies Google's ID token,
  checks calendar permission, stores credentials server-side, and creates a session.
- `GET /auth/me`: reports configuration, the signed-in user's ID/email, and connection
  status. It never returns Google tokens.
- `POST /auth/logout`: ends the current browser session.
- `POST /auth/disconnect`: clears this account's local Google credentials and sessions.
- Controller routes accept the signed-in session cookie, or the development key for
  the separate development account. Each user sees and controls only their own TVs.
- Browser requests from the phone app must use `credentials: 'include'`. Cookie-authenticated
  writes require an `Origin` matching `WEB_ORIGIN` or the configured backend origin.
- The session cookie is HttpOnly and SameSite=Lax, expires after 24 hours, and uses
  Secure when the callback is HTTPS. Login state expires after 10 minutes.
- Google tokens refresh before expiry. A calendar 401 triggers one refresh/retry.
  A revoked refresh token returns `CALENDAR_REAUTH_REQUIRED`; reconnect from `/connect`.
- Browser sessions, Google tokens, and devices are **in memory**. Restarting the
  backend clears them; reconnect and pair again afterward. Durable storage remains
  required before deployment. Cross-site deployments will also need a deliberate
  cookie/session configuration; this setup targets local development.

## Troubleshooting

| Symptom | Action |
| --- | --- |
| Google setup needed | Set both client credentials in `.env` and restart. |
| `redirect_uri_mismatch` | Match the Cloud client URI and `.env` exactly, including host, port, and path. |
| Access blocked for a test app | Add the signing-in email to the project's test users; check Workspace restrictions if applicable. |
| Calendar permission required | Reconnect and grant calendar event access. |
| Invalid OAuth state | Restart from `/connect` in the same browser using `localhost`; avoid multiple simultaneous sign-in tabs. |
| Calendar access denied | Check that Calendar API is enabled and that the selected account has access to the configured calendar. |
| Calendar reauthentication required | Reconnect Google. Testing-mode refresh tokens can expire after seven days for these scopes. |

The implementation is covered by tests with simulated Google responses. A live
Google sign-in and event fetch must still be checked after your Cloud setup.
