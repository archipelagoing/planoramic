# Fire TV + Google Calendar + Phone Web Control Project TODO

Last updated: 2026-09-22. User confirmed Google sign-in, display pairing, and live
calendar events working end to end in the browser display. Earlier verification
confirmed upcoming events across 29 calendars in the connection preview.

## Next implementation steps
- [x] Add a seven-day overview and glass month-at-a-glance panel with month navigation and date selection
- [x] Fetch full selected-month events for the month panel, respecting calendar visibility filters
- [x] Add live analog and digital clocks using device-local time
- [x] Replace starter sidebar sections with Brief, Household, and Pomo
- [x] Add Today/Week calendar views and persistent calendar-source visibility filters
- [x] Add a deterministic Brief with today's events and next upcoming timed event
- [x] Add a Pomo timer with focus/break modes, adjustable durations, pause/resume/reset, and session completion count (continues across tabs; resets on app reload)
- [ ] Verify the new sections and timer controls with the Fire TV remote
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


# Planoramic Hackathon TODO

Planoramic is an ambient household planning surface for Fire TV.

The goal is to turn the existing calendar display into an intelligent, multimodal home planning experience that combines:

- Fire TV for ambient visual information
- Alexa+ for voice interaction
- Fire TV remote for navigation and exploration
- Phone/web controls for configuration
- Amazon Bedrock for schedule intelligence
- Google Calendar as the underlying schedule source

## Hackathon Target

### Primary Track
- [ ] Fire TV

### Fire TV Priority Categories
- [ ] AI-enhanced viewing
- [ ] Multi-modal UX
- [ ] Family / household experience

### Additional Track
- [ ] Alexa+

### Mini Challenges
- [ ] AWS Builder
- [ ] Open Source

---

# P0: Make Fire TV Rock Solid

Do this before adding major new features.

## Fire TV Build

- [ ] Produce a working Fire TV build
- [ ] Install Planoramic on an actual Fire TV or supported Fire OS environment
- [ ] Verify Google Calendar events render correctly
- [ ] Verify backend is reachable from Fire TV
- [ ] Verify pairing flow on Fire TV
- [ ] Verify credentials persist after closing/reopening app
- [ ] Verify Expo SecureStore behavior on Fire TV
- [ ] Verify light theme
- [ ] Verify dark theme
- [ ] Verify system theme

## Remote Navigation

- [ ] Test every interactive element using only the Fire TV remote
- [ ] Verify D-pad Up
- [ ] Verify D-pad Down
- [ ] Verify D-pad Left
- [ ] Verify D-pad Right
- [ ] Verify Select
- [ ] Verify Back
- [ ] Add clearly visible focus states
- [ ] Make sure focus never becomes trapped
- [ ] Test rapid remote navigation
- [ ] Test long calendar lists
- [ ] Investigate React Native TV focus-loss behavior if encountered

## TV States

- [ ] Loading state
- [ ] Empty-calendar state
- [ ] Backend unavailable state
- [ ] Google authentication expired state
- [ ] No-network state
- [ ] Manual refresh
- [ ] Reconnect behavior
- [ ] Relaunch behavior

---

# P1: Planoramic Schedule Engine

Build deterministic schedule intelligence before using AI.

The application should calculate facts itself and give those facts to Bedrock.

## Calendar Normalization

- [ ] Normalize events from all connected calendars
- [ ] Normalize time zones
- [ ] Sort events chronologically
- [ ] Preserve calendar identity
- [ ] Preserve event ownership
- [ ] Handle all-day events
- [ ] Handle overlapping events
- [ ] Handle multi-day events

## Conflict Detection

Create schedule conflict detection.

Example:

```text
3:00 PM – 4:00 PM    Class
3:30 PM – 5:00 PM    Doctor

⚠ Schedule conflict
```

- [ ] Detect overlapping events
- [ ] Detect back-to-back events
- [ ] Calculate transition time
- [ ] Return structured conflict objects
- [ ] Add conflict indicator to TV UI

## Free-Time Detection

Calculate open windows between events.

Example:

```text
FREE TIME

11:30 AM – 1:00 PM
5:00 PM – 8:30 PM
```

- [ ] Calculate free windows
- [ ] Support minimum free-window duration
- [ ] Calculate longest free window
- [ ] Calculate morning availability
- [ ] Calculate afternoon availability
- [ ] Calculate evening availability
- [ ] Display free-time blocks visually

## Schedule Density

- [ ] Count events per day
- [ ] Calculate scheduled hours per day
- [ ] Identify busiest day
- [ ] Identify lightest day
- [ ] Detect unusually packed periods

---

# P2: Amazon Bedrock Integration

Goal: qualify for AWS Builder while adding genuinely useful intelligence.

## Backend

Add an AI service layer.

Suggested structure:

```text
backend/
  ai/
    bedrock.ts
    prompts.ts
    schemas.ts
```

Architecture:

```text
Google Calendar
      ↓
Planoramic Schedule Engine
      ↓
Normalized schedule facts
      ↓
Amazon Bedrock
      ↓
Structured insights
      ↓
Planoramic UI
```

- [ ] Configure AWS account/environment
- [ ] Configure Amazon Bedrock access
- [ ] Add AWS SDK dependency
- [ ] Store AWS credentials securely
- [ ] Create Bedrock service
- [ ] Add error handling
- [ ] Add request timeout
- [ ] Add fallback when AI is unavailable

## Structured AI Output

Do not return arbitrary paragraphs from the model.

Create a structured response such as:

```json
{
  "summary": "Tomorrow is busiest between 9 AM and 2 PM.",
  "alerts": [
    {
      "type": "tight_transition",
      "message": "Only 30 minutes between your interview and dentist appointment."
    }
  ],
  "free_windows": [
    {
      "start": "14:30",
      "end": "18:30"
    }
  ]
}
```

- [ ] Define output schema
- [ ] Validate model output
- [ ] Reject malformed responses
- [ ] Render structured responses with native Planoramic components

---

# P3: Planoramic Brief

Create the primary AI feature.

## Daily Brief

- [ ] Add "Planoramic Brief" card
- [ ] Generate today's summary
- [ ] Generate tomorrow's summary
- [ ] Show number of events
- [ ] Show conflicts
- [ ] Show tight transitions
- [ ] Show largest free window
- [ ] Show first event
- [ ] Show last event
- [ ] Show important schedule observations

Example:

```text
✦ PLANORAMIC BRIEF

Tuesday looks busy.

4 events
2 deadlines

⚠ Tight turnaround at 1:30 PM

✦ Best free block
3:30 – 6:00 PM

Tomorrow starts at 9:00 AM
```

## Weekly Brief

- [ ] Generate weekly summary
- [ ] Identify busiest day
- [ ] Identify lightest day
- [ ] Identify major conflicts
- [ ] Identify useful free periods
- [ ] Summarize upcoming weekend

---

# P4: Smart Context Cards

Turn AI/schedule information into visual objects rather than paragraphs.

## Card Types

- [ ] Schedule Conflict
- [ ] Leave Soon
- [ ] Free Time
- [ ] Busy Day
- [ ] Tomorrow Morning
- [ ] Tonight
- [ ] Weekend Overview
- [ ] First Event
- [ ] Last Event

Example:

```text
┌─────────────────────────────┐
│ ⚠ LEAVE SOON               │
│                             │
│ Dentist                     │
│ 2:30 PM                     │
│                             │
│ Starts in 42 minutes        │
└─────────────────────────────┘
```

- [ ] Make cards compatible with glassmorphism design system
- [ ] Make cards readable from TV distance
- [ ] Make important cards focusable
- [ ] Allow card expansion with remote

---

# P5: Alexa+ Integration

Goal: make Planoramic conversational.

Alexa should communicate with the Planoramic backend rather than directly manipulating the React Native application.

Architecture:

```text
Alexa+
   ↓
Planoramic MCP Server
   ↓
Planoramic Backend
   ↓
Calendar + Schedule Engine + Bedrock
```

## MCP Server

Suggested structure:

```text
backend/
  mcp/
    server.ts
    tools/
      schedule.ts
      freeTime.ts
      conflicts.ts
      display.ts
```

- [ ] Implement current MCP specification required by hackathon
- [ ] Implement Streamable HTTP transport
- [ ] Deploy MCP endpoint publicly
- [ ] Add authentication if required
- [ ] Test MCP requests independently

## Initial MCP Tools

Keep the first tool surface small.

- [ ] `get_schedule`
- [ ] `get_schedule_summary`
- [ ] `find_free_time`
- [ ] `find_conflicts`

Example interactions:

```text
"Alexa, what's happening tomorrow?"

"Alexa, when am I free Friday?"

"Alexa, do I have any conflicts this week?"

"Alexa, what's my busiest day?"
```

---

# P6: Alexa → Fire TV Control

This is the key multimodal feature.

Alexa should not only answer questions. Voice commands should affect what the user sees on the television.

## Device State

Create shared display state.

Example:

```json
{
  "view": "day",
  "date": "2026-09-25",
  "highlight": {
    "type": "free_time",
    "start": "14:00",
    "end": "17:00"
  }
}
```

- [ ] Store current display state
- [ ] Associate state with paired Fire TV
- [ ] Allow backend to update display state
- [ ] Allow Fire TV to receive state updates
- [ ] Decide between polling, WebSocket, or another push mechanism

## Display MCP Tools

- [ ] `show_today`
- [ ] `show_date`
- [ ] `show_week`
- [ ] `show_event`
- [ ] `highlight_free_time`
- [ ] `highlight_conflicts`
- [ ] `refresh_display`

Example:

```text
USER
"Alexa, show me Friday."

       ↓

Alexa+

       ↓

Planoramic MCP

       ↓

display state:
view = day
date = Friday

       ↓

Fire TV switches to Friday
```

---

# P7: Complete the Multimodal UX

The modalities should share state rather than behave like separate applications.

## Interaction Model

```text
VOICE
Intent / questions
      ↓
   Alexa+
      ↓
Planoramic Backend
      ↓
   Fire TV
Visual understanding
      ↓
Fire TV Remote
Detailed exploration
      ↓
Phone
Configuration
```

### Voice

Use for:

- [ ] Ask questions
- [ ] Jump to dates
- [ ] Find free time
- [ ] Find conflicts
- [ ] Request summaries
- [ ] Change TV views

### Fire TV

Use for:

- [ ] Ambient information
- [ ] Calendar visualization
- [ ] AI insights
- [ ] Conflict visualization
- [ ] Free-time visualization
- [ ] Household overview

### Fire TV Remote

Use for:

- [ ] Navigate days
- [ ] Navigate events
- [ ] Expand cards
- [ ] Inspect event details
- [ ] Switch views
- [ ] Dismiss/return

### Phone

Use for:

- [ ] Pair Fire TV
- [ ] Select device
- [ ] Select calendars
- [ ] Configure household
- [ ] Change date range
- [ ] Trigger refresh
- [ ] Change appearance
- [ ] Configure Planoramic

---

# P8: Phone → Fire TV Control

Complete the existing planned phone control experience.

- [ ] Build phone-friendly control interface
- [ ] Register/select paired Fire TV
- [ ] Show TV connection status
- [ ] Today button
- [ ] Tomorrow button
- [ ] Week button
- [ ] Date picker
- [ ] Refresh button
- [ ] Calendar filters
- [ ] Push selected view to TV
- [ ] Keep phone and TV state synchronized

---

# P9: Household Mode

Make the Fire TV placement meaningful by turning Planoramic into a shared household surface.

## Calendar Identity

- [ ] Preserve calendar owner/source
- [ ] Assign display identity
- [ ] Add household calendar filters
- [ ] Allow individual calendars to be shown/hidden

Example:

```text
HOUSEHOLD

Archi        ●
Mom          ●
Dad          ●
Family       ◇
School       □
```

## Household Questions

Support queries such as:

```text
"When is everyone free Saturday?"

"Does anyone have anything Thursday night?"

"Show only my calendar."

"Who has something tomorrow morning?"
```

- [ ] Find shared free time
- [ ] Find household conflicts
- [ ] Filter by person
- [ ] Filter by calendar
- [ ] Household weekly overview

---

# P10: Open Source Mini Challenge

Create something genuinely reusable from work Planoramic already needs.

## Recommended Project

Possible name:

```text
planoramic-tv-ui
```

or

```text
react-native-tv-focus-kit
```

Possible reusable components:

- [ ] `FocusableGlassCard`
- [ ] `TVButton`
- [ ] `TVList`
- [ ] `FocusRing`
- [ ] `RemoteNavigation`
- [ ] `TVSafeArea`
- [ ] `TenFootText`

## Repository Requirements

- [ ] Create separate public GitHub repository during hackathon window
- [ ] Add open-source license
- [ ] Add README
- [ ] Add installation instructions
- [ ] Add component examples
- [ ] Add screenshots/demo
- [ ] Use package inside Planoramic
- [ ] Document why the package was created
- [ ] Save repository URL for hackathon submission

## Optional Upstream Contribution

Investigate React Native TV / Fire TV issues encountered during development.

Potential contribution:

- [ ] Reproduce Fire TV focus-loss issue
- [ ] Create minimal reproduction
- [ ] Add regression test
- [ ] Investigate fix
- [ ] Submit upstream PR if appropriate

---

# P11: Production Backend

Do after core demo functionality works.

Current backend state is in-memory and should not be relied on for the final deployment.

- [ ] Deploy production backend
- [ ] Replace in-memory device storage
- [ ] Replace in-memory token storage
- [ ] Replace in-memory session storage
- [ ] Add durable device pairing
- [ ] Add event caching
- [ ] Add offline fallback
- [ ] Add backend logging
- [ ] Add basic monitoring
- [ ] Add rate limiting where appropriate
- [ ] Secure secrets
- [ ] Document deployment

---

# P12: Demo Experience

Build the demo deliberately rather than improvising it.

## Suggested Demo Flow

### 1. Establish Planoramic

Show Fire TV displaying the household calendar.

Explain:

> Planoramic turns the largest screen in the home into an ambient planning surface.

### 2. Show Calendar

Navigate with Fire TV remote.

Demonstrate:

- multiple calendars
- events
- remote navigation
- event details

### 3. Show AI

Open Planoramic Brief.

Demonstrate:

- schedule summary
- conflict detection
- free-time detection
- Bedrock-generated insight

### 4. Show Alexa

Say:

```text
"Alexa, what's going on tomorrow?"
```

Alexa answers.

Fire TV switches to tomorrow.

### 5. Demonstrate Multimodal UX

Say:

```text
"Alexa, when am I free?"
```

Alexa answers verbally.

Planoramic highlights the free period visually.

Use Fire TV remote to inspect the surrounding events.

### 6. Show Phone

Use phone interface to change the TV view.

Demonstrate that:

```text
Voice → intent
TV → understanding
Remote → exploration
Phone → configuration
```

### 7. Show Household Mode

Ask:

```text
"Alexa, when is everyone free Saturday?"
```

Show shared availability on Fire TV.

### 8. Mention Open Source

Show reusable React Native TV components extracted during development.

---

# P13: Hackathon Submission

## Documentation

- [ ] Update README
- [ ] Explain product problem
- [ ] Explain why Fire TV is appropriate
- [ ] Explain architecture
- [ ] Explain Google Calendar integration
- [ ] Explain Bedrock integration
- [ ] Explain Alexa+ integration
- [ ] Explain multimodal interaction model
- [ ] Explain household use case
- [ ] Document open-source contribution
- [ ] Add architecture diagram
- [ ] Add screenshots
- [ ] Add demo GIF/video where useful

## Submission Assets

- [ ] Final project description
- [ ] Architecture diagram
- [ ] Fire TV screenshots
- [ ] Alexa demo
- [ ] Bedrock demo
- [ ] Phone controller demo
- [ ] Open-source repository URL
- [ ] GitHub username
- [ ] Open-source contribution description
- [ ] AWS integration description
- [ ] Demo video
- [ ] Public repository
- [ ] Build/install instructions

---

# P14: Friction Log

Document development friction throughout the hackathon rather than reconstructing it at the end.

For every meaningful issue record:

```text
Date:

Task:

What I tried:

What I expected:

What happened:

Error / friction:

Documentation used:

Workaround:

What would have made this easier:
```

Especially document friction involving:

- [ ] Fire TV setup
- [ ] React Native TV
- [ ] D-pad/focus behavior
- [ ] Fire OS
- [ ] Amazon Bedrock
- [ ] AWS configuration
- [ ] Alexa+
- [ ] MCP
- [ ] Authentication
- [ ] Amazon documentation
- [ ] Deployment

---

# Stretch Goals

Only work on these once the core demo is solid.

## Natural-Language Event Creation

```text
"Alexa, add dinner with Mom Friday at seven."
```

- [ ] Add Google Calendar write scope
- [ ] Parse proposed event
- [ ] Show confirmation
- [ ] Require confirmation before
