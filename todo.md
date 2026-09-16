# Fire TV + Google Calendar + Phone Web Control Project TODO

## 1. Set up the project structure
- [ ] Create a backend folder for API and Google Calendar integration
- [ ] Create a web app folder for the phone-friendly control UI
- [ ] Keep the Fire TV React Native app as the TV display app
- [ ] Decide on the shared device registration flow

## 2. Set up the backend
- [ ] Create Node.js Express server
- [ ] Add health endpoint
- [ ] Add device registration endpoint
- [ ] Add device control endpoint
- [ ] Add calendar event fetch endpoint
- [ ] Add error handling and logging
- [ ] Add environment variables for Google OAuth and API keys

## 3. Set up Google Calendar integration
- [ ] Create a Google Cloud project
- [ ] Enable Google Calendar API
- [ ] Create OAuth client credentials
- [ ] Configure redirect URIs
- [ ] Set up Google login flow
- [ ] Request calendar access scopes
- [ ] Fetch upcoming events from `calendars/primary/events`
- [ ] Parse event fields: title, start, end, location, description
- [ ] Filter upcoming events
- [ ] Add refresh logic
- [ ] Handle expired tokens

## 4. Set up Fire TV app
- [ ] Open the Fire TV React Native project
- [ ] Install dependencies
- [ ] Add a `CalendarScreen`
- [ ] Fetch event data from backend
- [ ] Display upcoming events in a TV-friendly list
- [ ] Add large text and clear focus states
- [ ] Add refresh button
- [ ] Add loading and empty states
- [ ] Add error handling for API failures

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
- [ ] Add device registration from Fire TV app
- [ ] Generate a device ID or pairing code
- [ ] Let the phone register a Fire TV device
- [ ] Add API endpoints to update device state
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
- [ ] Test Google auth flow
- [ ] Test event fetch from Google Calendar
- [ ] Test backend API
- [ ] Test Fire TV app rendering
- [ ] Test web app responsiveness on phone
- [ ] Test phone-to-TV control flow
- [ ] Test no-network / expired-token cases
- [ ] Test refresh behavior

## 9. Deployment
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
- [ ] Add the “pair device” flow
- [ ] Add docs for setup and run steps