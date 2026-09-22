# Fire TV + Google Calendar + Phone Web Control Project TODO

Last updated: 2026-09-22. User confirmed Google sign-in, display pairing, and live
calendar events working end to end in the browser display. Earlier verification
confirmed upcoming events across 29 calendars in the connection preview.

## Next implementation steps
- [x] Add a pairing-code entry form to the signed-in connection page
- [x] Register the shared display app with the backend and show its pairing code (verified in browser)
- [x] Implement secure device credential persistence (HttpOnly browser cookie; native SecureStore)
- [ ] Verify saved credentials after reopening the app on Fire TV
- [x] Add `CalendarScreen` and a Calendar navigation item to the shared TV/browser app
- [x] Fetch events using the paired device credential and group them by local date, with calendar names (verified in browser)
- [x] Add loading, empty, error, and refresh states; verify in the browser
- [ ] Verify loading, empty, error, and refresh states on Fire TV

The backend-to-browser display flow is verified. Browser persistence and status
handling have automated coverage; Fire TV device testing remains. Backend storage
is still in memory, so restarting the backend requires sign-in and pairing again.
The full phone control UI follows afterward. Keep Google tokens on the backend
and the development API key out of the display app.

## 1. Set up the project structure
- [x] Create a backend folder for API and Google Calendar integration
- [x] Create a web app folder for the phone-friendly control UI
- [x] Keep the Fire TV React Native app as the TV display app
- [x] Decide on the shared device registration flow

Structure and pairing design are documented in [docs/device-pairing.md](docs/device-pairing.md).
The backend now contains a local development API; the phone app still contains a
planning README. Implementation continues below.

## 2. Set up the backend
- [x] Create Node.js Express server
- [x] Add health endpoint
- [x] Add device registration endpoint
- [x] Add device control endpoint
- [x] Add calendar event fetch endpoint
- [x] Add error handling and logging
- [x] Add environment variables for Google OAuth and API keys

Local development API implemented; see [backend/README.md](backend/README.md).
Devices, Google tokens, and browser sessions are stored in memory. Pairing/control
support Google user sessions and a separate development-key account. Live Google
access is verified; restarting the backend still clears accounts, tokens, and devices.

## 3. Set up Google Calendar integration
- [x] Create a Google Cloud project
- [x] Enable Google Calendar API
- [x] Create OAuth client credentials
- [x] Configure redirect URIs
- [x] Set up Google login flow
- [x] Request calendar access scopes
- [x] Fetch upcoming events from `calendars/primary/events`
- [x] Include readable subsidiary/shared calendars and label events with their source calendar
- [x] Parse event fields: title, start, end, location, description
- [x] Filter upcoming events
- [x] Add refresh logic
- [x] Handle expired tokens
- [x] Verify live Google sign-in and event fetching after Cloud configuration

Live sign-in and a seven-day event fetch across 29 calendars are confirmed through
`http://localhost:3001/connect`. Backend tests cover multi-calendar fetching,
authentication, ownership, and token-refresh failures (24 tests passed on rerun).
The connection preview reloads events manually; automatic token refresh is tested
with simulated Google responses. TV polling and event caching remain in later
sections. Setup reference: [docs/google-calendar-setup.md](docs/google-calendar-setup.md).

## 4. Set up Fire TV app
- [x] Open the Fire TV React Native project
- [x] Install dependencies
- [x] Add a `CalendarScreen`
- [x] Fetch event data from backend (verified in shared browser display)
- [x] Display upcoming events in a TV-friendly list
- [x] Add large text and clear focus states
- [x] Add refresh button (browser verified)
- [x] Add loading and empty states (browser verified)
- [x] Add error handling for API failures (browser verified)

The Calendar screen opens with labeled sample events grouped by local date,
including all-day events and selectable details. List and focus styling are
implemented; Fire TV rendering and remote navigation still need device testing.
Pairing and live event fetching are verified end to end in the browser display.
Browser tests cover loading, empty results, refresh, stale events after network
failure, startup retry, and Google reauthorization without losing display pairing.
Native secure storage requires a rebuilt TV app and device verification.

## 5. Set up the phone web app
- [ ] Create a mobile-friendly web app
- [ ] Add login flow for Google
- [ ] Add device pairing or device selection
- [ ] Display event list
- [ ] Add buttons for refresh, view changes, and controls
- [ ] Add responsive design for phone screens
- [ ] Add a “TV view” status display
- [ ] Make sure the web app can talk to the backend

## 6. Set up device control flow
- [x] Add device registration to the shared TV/browser app (verified in browser; Fire TV testing pending)
- [x] Generate a device ID or pairing code (verified in browser display)
- [ ] Let the phone register a Fire TV device
- [x] Add API endpoints to update device state
- [ ] Add phone-side controls for:
  - [ ] set date range
  - [ ] set “today” or “week” view
  - [ ] refresh events
  - [ ] force a view update
- [ ] Show current device status in the web app

## 7. Fire TV UX design
- [ ] Design the main calendar screen
- [ ] Add event rows with title, date, and time
- [ ] Add focusable selection states
- [ ] Add detail screen for event details
- [ ] Add “no upcoming events” state
- [ ] Make navigation remote-friendly

## 8. Testing
- [x] Test Google auth flow (live sign-in and automated failure cases)
- [x] Test event fetch from Google Calendar (live multi-calendar preview)
- [x] Test backend API (automated integration tests)
- [x] Test Google sign-in, display pairing, and live events end to end in the browser (user confirmed 2026-09-22)
- [x] Test browser persistence, loading, empty, refresh, and network/Google-auth recovery with automated tests
- [ ] Test Fire TV app rendering
- [ ] Test web app responsiveness on phone
- [ ] Test phone-to-TV control flow
- [ ] Test no-network / expired-token cases
- [x] Test manual event loading in the connection preview
- [ ] Test refresh behavior end to end from phone to TV

## 9. Deployment
- [ ] Add durable storage for users, Google tokens, devices, and display settings before deployment
- [ ] Deploy backend to a host
- [ ] Deploy web app
- [ ] Configure CORS
- [ ] Configure environment variables in production
- [ ] Test production auth flow
- [ ] Test live data from Google Calendar
- [ ] Release Fire TV app build

## 10. Final polish
- [ ] Add loading skeletons
- [ ] Add proper error messages
- [ ] Add offline fallback
- [ ] Add event caching
- [x] Add the “pair device” flow (verified in browser; Fire TV testing pending)
- [ ] Add docs for setup and run steps
