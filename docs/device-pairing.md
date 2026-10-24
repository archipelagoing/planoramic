# Device pairing and control

Status: registration, claim, pairing polling, live calendar fetching, per-user ownership, and a physical Vega TV client are implemented. The backend still stores accounts and devices in memory. Vega credentials are session-only; the browser uses an HttpOnly display cookie and the separate Expo Android target uses SecureStore.

## App responsibilities

- The root Expo app provides the browser experience and the Android TV target.
- `vega/` contains the separate native client for Vega OS Fire TV devices.
- `backend/public/connect.html` handles Google sign-in and display-code pairing.
- `backend/` owns Google credentials, device links, calendar access, and display settings.
- A dedicated phone controller remains planned; its earlier notes are [archived](archive/phone-controller/README.md).

See [the backend API](../backend/README.md) and [Vega setup](../vega/README.md) for current behavior.

## Pairing sequence

1. On first launch, the TV requests a pairing session from the backend.
2. The backend returns a short, human-readable pairing code, an expiration time,
   and a separate secret for polling that session. The TV displays the code and
   the phone web app's address. The code expires after 10 minutes.
3. The user opens the phone app, signs in with Google, grants calendar access,
   and enters the code. The phone submits it using the user's authenticated session.
4. The backend atomically consumes the code and links the pending TV to that
   user. A used or expired code cannot pair another device.
5. The TV polls using its session secret. Once approved, it exchanges that secret
   for a device ID and a dedicated device credential, then keeps the credential for authenticated event requests. Storage differs
   by client; the Vega v1 currently keeps it in memory only. Device IDs alone never authorize requests.
6. Clients with persistent storage reuse their device credential on later launches.
   Vega v1 currently requires pairing again after an app restart. If the credential is
   revoked, the TV clears its linked state and starts pairing again.

Pairing codes and session secrets must be randomly generated. Limit code-entry
attempts and session creation. Credential issuance must tolerate a lost response
without allowing a code to be claimed twice. Google tokens remain on the backend;
the TV credential permits access only to that device's data and settings.

## Planned phone-to-TV display updates

The backend has endpoints for this planned controller flow. Vega v1 does not
yet poll or acknowledge remote display-state changes:

- While pairing, the TV checks its session every 5 seconds until it expires.
- Once linked, the TV fetches its display state every 15 seconds while active.
- The phone saves a desired view (`today`, `week`, or a date range) on the backend.
- A refresh request increments a stored revision, so the TV can detect it on its
  next poll. The backend controls calendar caching and Google refresh frequency;
  polling the TV state does not require fetching Google Calendar every time.
- The TV reports its last applied revision. The phone can distinguish a saved
  request from one the TV has applied and show its last check-in time.
- After network failures, clients back off and retry. The TV retains its last
  successful display with a stale-data indicator.

The device owner can unlink a TV from the phone app. Unlinking revokes its device
credential and removes its access to the owner's calendar. All phone control
requests must verify ownership of the selected device.

## Implementation order

1. Express server and health endpoint.
2. Google sign-in, authenticated phone sessions, and persistent storage.
3. Pairing session creation, claim, credential exchange, and expiry handling.
4. TV display-state polling and a phone device/settings screen.
5. Calendar event fetching, refresh requests, and unlinking.

Current development routes are documented in the backend README. Persistent
storage schemas remain to be implemented; per-user ownership is enforced in memory.
