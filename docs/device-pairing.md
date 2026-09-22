# Device pairing and control

Status: target design. The backend now implements in-memory registration, claim,
polling, control, acknowledgement, and revocation. Google browser sessions now
support per-user ownership and calendar access. The development API key accesses
a separate account for manual tests. Persistent storage, TV integration, and the
phone control UI are still pending.
See [the backend API](../backend/README.md) for routes and limitations.

## App responsibilities

- The existing Expo app at the repository root displays calendar content on TV.
  Its browser build previews that same display.
- The separate `web/` app handles Google sign-in, TV pairing, and phone controls.
- The `backend/` service owns Google credentials, device links, calendar access,
  and display settings.

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
   for a device ID and a dedicated device credential, then stores the credential
   locally. Device IDs alone never authorize requests.
6. On later launches, the TV uses its device credential. If the credential is
   revoked, the TV clears its linked state and starts pairing again.

Pairing codes and session secrets must be randomly generated. Limit code-entry
attempts and session creation. Credential issuance must tolerate a lost response
without allowing a code to be claimed twice. Google tokens remain on the backend;
the TV credential permits access only to that device's data and settings.

## Display updates

For the first version, use HTTP polling instead of a persistent connection:

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
