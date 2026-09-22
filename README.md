# Planoramic

Your next seven days of Google Calendar events on one display. Events are grouped
by date, labeled by calendar, and expandable for details.

Planoramic is being built for Fire TV. For now, you can run it locally in a browser.
Google sign-in, display pairing, and live events work there; testing on Fire TV is
still pending. There isn't a hosted app or a ready-to-install TV release yet.

## Run it locally

You'll need **Node.js 22 or newer**, npm, and two terminal windows. To show your own
events, you'll also need a Google account and a Google Cloud OAuth client. You can
skip Google setup to explore the sample calendar.

### 1. Set up the backend

From the project folder, install the dependencies and create your local config:

```sh
npm install
cd backend
npm install
cp .env.example .env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This is first-time setup: keep your existing `backend/.env` if you've already
configured it. Put the generated value into `DEV_API_KEY` in that file.

For your own calendars, follow the [Google Calendar setup guide](docs/google-calendar-setup.md)
and fill in `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Keep these values in
`backend/.env`; they don't belong in the display app or in Git.

Start the backend from the same terminal:

```sh
npm start
```

Leave it running. The [connection page](http://localhost:3001/connect) should now open.

### 2. Open the display

In a second terminal, from the project folder:

```sh
npm run web
```

Open [localhost:8081](http://localhost:8081). On first launch, the Calendar screen
shows sample events. The backend must be running even when you're browsing samples.

Use `localhost` consistently for both pages. If Expo starts on a different port,
set `DISPLAY_ORIGIN` in `backend/.env` to that browser address and restart the backend.

### 3. Connect your calendar

1. On the display, select **Connect calendar** to get a pairing code.
2. Open [localhost:3001/connect](http://localhost:3001/connect) in another tab and
   choose **Connect Google Calendar**.
3. Sign in and allow read-only calendar access.
4. Enter the display's code and select **Pair display**.

Your events should appear on the display shortly. Codes expire after ten minutes;
the display requests a new one when needed.

## Using the calendar

Select an event to expand its details. Use **Refresh** to fetch the latest events;
the list doesn't automatically refresh yet. If a refresh fails, previously loaded
events stay visible with an error message.

Planoramic includes calendars you can read, including shared calendars and ones
you've hidden or unchecked in Google Calendar. There isn't a calendar picker yet.
Calendar access is read-only: Planoramic doesn't create or change your events.

Reopening the browser display keeps it paired, provided cookies are enabled.
**Restarting the backend still clears sign-ins and pairings**, so you'll need to
connect Google and pair again afterward. Persistent backend storage is planned.

Calendar is the working screen. Home, Movies, TV Shows, and Settings are placeholders,
and the separate phone control app hasn't been built yet.

## When something isn't working

| What you see | What to check |
| --- | --- |
| "Could not restore this display" or a connection error | Make sure the backend is running. Check [its health endpoint](http://localhost:3001/health), then retry. |
| Pairing doesn't survive a reload | Allow cookies, use `localhost` for both pages, and check whether the backend restarted. |
| Google asks you to reconnect | Sign in again on the connection page, then select **Refresh** on the display. |
| No upcoming events | Check the signed-in account and whether it has events in the next seven days. |
| Google rejects sign-in | Check the test user and redirect URI in the [Google setup troubleshooting guide](docs/google-calendar-setup.md#troubleshooting). |

## Working on Planoramic

The shared display app lives in `screens/` and `navigation/`. `backend/` handles
Google sign-in, calendar access, and pairing. `web/` currently contains plans for
the phone control app.

```sh
npm test --prefix backend    # API tests; no Google credentials needed
npm run test:web             # Browser tests; requires Chrome and free port 8088
npx tsc --noEmit             # Type checking
```

Browser tests use simulated calendar responses. They don't replace testing on a
Fire TV. Native builds use Expo SecureStore for pairing credentials and need to be
rebuilt when native dependencies change.

See the [task list](todo.md) for what's next, [backend docs](backend/README.md) for
API details, and [pairing design](docs/device-pairing.md) for the device flow.
