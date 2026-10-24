# Hearth for Vega OS

This separate native target is for the physical Vega OS Fire TV Stick HD. The repository root remains the Expo/browser/Android TV application.

Current stage: a native calendar client with display-code pairing, Today/Next 7 days views, calendar visibility controls, source-calendar labels, event details, next-event preview, refresh, and loading/empty/error states. Additional sections provide a daily Brief, seven-day weather forecast, analog/digital clocks, and a focus/break Pomodoro timer. It uses the existing backend's paired-device endpoints. Google sign-in stays on the Mac connection page.

On 2026-10-23, the initial ARMv7 starter release built successfully, installed on `10.0.0.186:5555`, and `vega device is-app-running` confirmed `com.archi.planoramic.main` was running. The user confirmed its screen and remote navigation worked. The user subsequently confirmed live calendar pairing and rendering. The expanded ARMv7 release was built and installed on the same physical TV. Its sections still require user verification with the remote.

## Connect the calendar

Start the backend in another terminal:

```sh
cd /Users/archi/planoramic/backend
npm start
```

After the TV is connected, forward its local port to the Mac:

```sh
vega exec vda -s 10.0.0.186:5555 reverse tcp:3001 tcp:3001
```

Launch Hearth. On your Mac, open `http://localhost:3001/connect`, sign in with Google, and enter the eight-character pairing code shown on the TV. The TV polls every five seconds and loads the selected date range after pairing. It renews expired codes and retries interrupted polling. If Google needs reauthorization, reconnect Google on the Mac page and refresh the TV.

Use the D-pad to navigate events, Select to open details, and Back or the on-screen button to return. Failed refreshes retain previously loaded events for the same date range and mark them as previously loaded.

**Current demo limitations:** The Vega client keeps its device credential only in memory; closing/restarting the app requires pairing again. No Google or AWS secrets are stored in this app. Backend storage also remains in memory, so restarting the backend requires signing in and pairing again. Secure credential persistence is still pending for Vega; the root Expo target's SecureStore implementation does not apply here. The backend request timeout is 60 seconds to accommodate multiple Google calendars.

## Additional sections

Calendar remains the default. Brief uses the same visible calendar sources and opens event details. Calendars lets you hide personal sources without removing them from Google; this selection currently resets when Hearth closes. Only sources with loaded events appear in the list.

Weather uses Open-Meteo for East Brunswick, NJ (08816), matching the browser configuration. It refreshes every 30 minutes and has a manual retry. The forecast location is fixed in this build. Weather failures do not block calendar use.

Pomodoro provides focus, short-break, and long-break modes, duration controls, pause/resume/reset, and a completed-focus count. It continues across sections, uses elapsed wall time, and resets when the app closes. Brief is deterministic; no AI model is called.

## Build and launch

Use the installed Vega SDK 0.24.9914 and Node 20 or newer:

```sh
cd /Users/archi/planoramic/vega
npm ci
npm run build:release -- --target armv7 --max-workers 2
```

Connect the registered TV, substituting its current IP:

```sh
vega exec vda connect 10.0.0.186:5555
vega device list
```

Install and launch the generated ARMv7 package:

```sh
vega device install-app --packagePath build/armv7-release/planoramictv_armv7.vpkg --device 10.0.0.186:5555
vega device launch-app --appName com.archi.planoramic.main --device 10.0.0.186:5555
```

The release package includes its JavaScript bundle and does not require Metro. Live calendar data still requires the backend and port forwarding to remain active.

## Checks

```sh
./node_modules/.bin/tsc --noEmit
npm test -- --runInBand
```

The calendar tests cover request credentials, unauthorized-response handling, cancellation, all-day local dates, and local date-range boundaries across daylight saving. Timer tests cover delayed ticks, pause/resume, and completion counts. Brief tests cover overlapping and all-day events; weather tests cover malformed forecast data. They do not replace the on-TV pairing and remote checks.

## Compatibility

The physical stick reports `armv7l` and `OS 2.0 (TV Ship/515)`. SDK 0.24.9914's package resolver currently offers the OS 1.2 compatibility profile only. Dependencies are resolved against that profile with React Native 0.83; on-device installation is the compatibility check.

## Connection recovery

If VDA reports `No route to host` even though the device IP and port are reachable, restarting the local VDA server resolved this during setup:

```sh
vega exec vda kill-server
vega exec vda start-server
vega exec vda connect 10.0.0.186:5555
vega device list
```

Keep Developer Mode enabled and Connection Mode set to TCP/IP on the TV. Restarting VDA interrupts other development connections, but does not remove device registration or app data.
