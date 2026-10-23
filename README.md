# Hearth

A shared household calendar for Fire TV: see the day's plans, explore events with the remote, and keep the next appointment in view.

## Working v1

Hearth runs natively on a physical **Amazon Fire TV Stick HD (2nd generation), Vega OS 2.0**. The `vega/` application is the submission's TV target. It supports:

- Google Calendar sign-in on the companion browser connection page.
- An eight-character display pairing code on the TV.
- Live events from the signed-in account's readable personal and shared calendars.
- Today and Next 7 days views, source-calendar labels, and a next-event preview.
- D-pad navigation, selectable event details, Back, and manual refresh.
- Loading, empty, error, and previously loaded event states.

The existing Expo/browser application at the repository root has a broader feature set, including tasks, a timed week grid, weather, a basic daily Brief, and a focus timer. These browser features have not all been ported to Vega. Bedrock, Alexa+, and automated scheduling are future work; they are not part of the submitted v1.

## Architecture

```text
Google Calendar ← OAuth / Calendar API → Node.js backend
                                              ↑
                                  paired-device credential
                                              ↑
                                     Hearth on Vega OS
```

Google credentials remain on the backend. The TV uses a device-scoped credential to fetch its owner's events. The browser connection page handles Google sign-in and pairing.

## Run the Fire TV version

Prerequisites: Node.js 22.14 or newer, npm, Vega SDK 0.24.9914, and a registered Vega Fire TV with Developer Mode enabled. Use a Mac supported by this SDK or supported Linux environment. This target uses React Native 0.83 and a separate dependency installation from the root Expo app.

1. Configure and start the backend:

   ```sh
   cd backend
   npm ci
   cp .env.example .env
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   On first setup, put the generated value in `DEV_API_KEY` in `backend/.env`. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Register `http://localhost:3001/auth/google/callback` as the Google OAuth web client's redirect URI. Do not overwrite an existing working `.env`. See [Google setup](docs/google-calendar-setup.md).

   ```sh
   npm start
   ```

2. In another terminal, connect the TV and forward the backend port. Replace `TV_IP` with its local address:

   ```sh
   vega exec vda connect TV_IP:5555
   vega exec vda -s TV_IP:5555 reverse tcp:3001 tcp:3001
   ```

3. Build and install the native Vega application:

   ```sh
   cd vega
   npm ci
   npm run build:release -- --target armv7 --max-workers 2
   vega device install-app --packagePath build/armv7-release/planoramictv_armv7.vpkg --device TV_IP:5555
   vega device launch-app --appName com.archi.planoramic.main --device TV_IP:5555
   ```

   Run `cd vega` from the repository root. The package ID retains its original `planoramic` name for update compatibility; the product is branded Hearth. The release bundles JavaScript and does not require Metro.

4. Open `http://localhost:3001/connect` on the computer, sign in with Google, and enter the code displayed on the TV. The TV then loads live events. Keep the backend and port forwarding active.

Detailed TV instructions and recovery commands: [Vega README](vega/README.md). The [Android installation guide](docs/fire-tv-install-guide.md) applies to Fire OS/Android TV targets, not this Vega stick.

## Limitations

- This is a locally operated hackathon prototype, not a hosted production service.
- The Vega TV client keeps pairing credentials in memory. Closing/restarting it requires pairing again.
- The backend stores accounts, tokens, and devices in memory. Restarting it requires Google sign-in and pairing again.
- Calendar schedules are read-only in the Vega client. It does not create or reschedule events.
- The Vega client currently displays all readable calendar sources; it does not yet have source visibility controls.

## Browser application

From the repository root:

```sh
npm ci
npm run web
```

The browser client uses the same backend. Native Expo SecureStore persistence belongs to that separate Android target and is not implemented in the Vega client.

## Validation

```sh
npm test --prefix backend
npx tsc --noEmit
cd vega
./node_modules/.bin/tsc --noEmit
npm test -- --runInBand test/calendar.spec.ts
```

The new Vega API/date tests cover registration headers, paired credentials, unauthorized errors, cancellation, all-day dates, and local date boundaries. The app was built, installed, and used to load live calendars on the physical stick. See [todo.md](todo.md) for remaining device checks and scope.

## Hackathon development

The project includes an existing React Native TV/Expo foundation. Work during the submission window added Google Calendar integration, display pairing, the browser planning experience, and a separate working Vega OS client with build/install instructions. The native Vega calendar is the demonstrated Fire TV v1.

[Submission draft and recording outline](docs/v1-submission.md) · [License](LICENSE)
