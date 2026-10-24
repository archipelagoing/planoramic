# Hearth — Fire TV demo scope

Last updated: 2026-10-23.

## Vega platform setup — completed

The user identified the physical target as **Fire TV Stick HD, 2nd generation, software OS 2.0**. Amazon lists the 2026 Fire TV Stick HD as a **Vega OS** device. Treat this as the Vega path unless further device identification shows otherwise. The existing Expo/react-native-tvos project is an Android TV target; an Android APK cannot be installed directly as a Vega app.

- [x] Confirm the device model/OS: Vega CLI reports physical `calypso`, ARMv7, OS 2.0, with Developer Mode enabled.
- [x] Confirm access to an Amazon Developer account and the Vega SDK/CLI (SDK 0.24.9914; user confirmed successful authentication).
- [x] Enable the physical device through [Vega Developer Mode](https://developer.amazon.com/docs/vega/0.24/developer-mode), completing browser authentication personally.
- [x] Connect over TCP/IP at `10.0.0.186:5555`; `vega device list` confirms the physical TV. Restarting the local VDA server resolved the connection failure.
- [x] Prove a minimal Vega app can build, install, and launch: `vega/` ARMv7 release installed on `10.0.0.186:5555`; process confirmed running; user confirmed its screen and remote navigation.
- [x] Implement the minimal Vega calendar client using the existing pairing/events backend: Today/Next 7 days, calendar labels, next event, event details, refresh, and loading/empty/error states. TypeScript passes and five API/date tests pass; on-TV live calendar verification remains separate.
- [x] Install and launch the calendar build on the physical TV. Backend logs confirm successful device registration (201) and repeated pairing polling (200) from the TV.
- [x] Verify Google sign-in, TV pairing, and live event loading: user reported it working; backend recorded successful pairing and four successful device event fetches. Calendar remote/detail verification remains separate.
- [ ] Verify calendar remote navigation, details, refresh after calendar membership changes, and app relaunch behavior. A later disconnect coincided with the app no longer running; the backend and VDA connection remained healthy. App was relaunched and requires pairing again because credentials are session-only.
- [ ] Add secure credential persistence on Vega. The first calendar client keeps pairing in memory only; closing it requires pairing again. Expo SecureStore applies to the existing Android target, not the Vega client.
The installed TV client is `vega/`. Follow [its README](vega/README.md) for the physical stick. Android/JDK instructions apply to the separate Expo target only.

## Expanded Vega scope — implemented, device checks pending

- [x] Keep Calendar as the default screen with Today, Next 7 days, source labels, details, refresh, and next event.
- [x] Add a daily Brief using the visible calendar events, with event details and next event.
- [x] Add calendar visibility controls without changing Google calendar membership (session-only).
- [x] Add analog/digital clocks, seven-day weather for 08816, and independent weather retry.
- [x] Add Pomodoro focus/break modes, duration controls, pause/resume/reset, and completion count across tabs.
- [x] Pass nine Vega API/date/timer/Brief/weather tests.
- [x] Build and install the expanded ARMv7 release on the physical TV.
- [ ] Verify each expanded section with the physical remote.
- [ ] Verify weather networking and selected-calendar visibility on the TV.

## Immediate submission priority

The verified deadline is **October 23, 2026 at 3:00 PM Eastern**. Use [the submission pack](docs/v1-submission.md). Freeze feature work, publish the actual Vega source to GitHub, record the physical-TV demo, complete the required form fields, and submit. AI remains future scope for this v1.

## Submission goal

**A household calendar on Fire TV that shows live shared Google Calendar events, supports remote exploration, and optionally explains the day with a short AI brief.**

Ship the calendar experience first. Add one small intelligence feature only after the native app works. Keep the final 45–60 minutes for recording, documentation, and submission. Time estimates below are planning ranges, not guarantees; build and AWS setup delays can exceed them.

The previous full roadmap and its detailed completion history are preserved in [the archived todo](docs/todo-before-scope-cut-2026-10-23.md).

## Current status: implementation versus verification

The browser flow and live calendar loading on the physical Vega TV are confirmed. The Vega client is a smaller native implementation; browser-only features and persistent credentials have not all been ported. Keep specific device checks unchecked until demonstrated.

- [x] Node/Express backend with health, registration, pairing, event, and device-control endpoints.
- [x] Google OAuth and live event fetching across readable personal/shared calendars; browser preview previously confirmed across 29 calendars.
- [x] Browser display pairing and live calendar events verified end to end.
- [x] Browser pairing persistence and native SecureStore implementation.
- [x] Native/shared calendar screen with event details, calendar labels, refresh, and loading/empty/error UI; native behavior still needs verification.
- [x] Existing Brief screen with today's event count/list and next upcoming timed event; this is deterministic, not AI-generated.
- [x] Today/Week controls and persistent calendar visibility filters implemented; verify the native controls before including them in the demo.
- [x] Backend and browser automated coverage recorded for authentication, calendar loading, pairing, persistence, and recovery. These checks have not been rerun for this scope rewrite.
- [x] Fire TV installation and troubleshooting guide: [docs/fire-tv-install-guide.md](docs/fire-tv-install-guide.md).
- [x] Build and install the native calendar on the physical Vega Fire TV.
- [x] Verify live pairing and calendar rendering on that target.
- [ ] Finish the calendar's remote/detail/refresh recording checks.

**Known limitation:** Backend storage is in memory. Restarting it clears accounts, Google tokens, devices, and pairing state. Keep it running during the demo; sign in and pair again after a restart. A native debug build also needs Metro and the development connection active.

## P0 — Required working demo

Complete remaining demo checks before recording. Follow the [Vega guide](vega/README.md).

### Install and connect

- [x] Confirm physical Vega OS Fire TV Stick HD as the target.
- [x] Confirm the Vega SDK and VDA recognize the device.
- [x] Start the backend and verify `/health`.
- [x] Forward backend port 3001 with VDA.
- [x] Build/install the ARMv7 release with bundled JavaScript; Metro is not needed.
- [x] Confirm the native calendar app launches and loads real events.

### Pair and show real events

- [x] Generate a pairing code on the TV.
- [x] Sign in on the Mac connection page and pair that display.
- [x] Confirm recognizable live calendar events appear.
- [ ] Verify timed and all-day events display sensible local dates/times.
- [ ] Navigate the event list, select an event, and return using only the remote.
- [ ] Refresh successfully.
- [x] Confirm relaunch behavior: the Vega app currently requires pairing again. Secure persistence remains deferred; keep the app/backend running during the demo.

### Fix only demo blockers

- [ ] Make the active remote focus clearly visible on the demonstrated controls.
- [ ] Check the actual demo layout for readable text and clipping.
- [ ] Verify a useful empty-calendar message.
- [ ] Verify backend failure shows an error/retry state and recovery works after reconnection.
- [ ] Choose one reliable calendar view and theme for recording.
- [ ] Record a short successful baseline before changing features.

**P0 done:** The installed app pairs, displays real household events, supports remote inspection, and refreshes reliably. If P0 runs long, skip add-ons and finish submission assets.

## P1 — Deferred add-on: AI Daily Brief

**Planning allowance: 45–75 minutes after P0, only if AWS access works promptly.** This is the smallest AI scheduling feature worth attempting: a short explanation of the existing day's schedule, with an optional focus-time suggestion from a computed free window. It does not create, move, or delete events.

Reuse [BriefScreen.tsx](screens/BriefScreen.tsx), the existing calendar data, and the current backend. Keep one remote-focusable **Generate brief** button and one compact result card. No chat UI, voice integration, agent framework, or new screen system.

### Gate: prove one model call first — maximum 10 minutes

- [ ] Verify AWS credentials, chosen region, and access to a compatible Bedrock model/inference profile.
- [ ] Make one successful backend-side text request before touching the UI.
- [ ] If access, billing, permissions, or regional availability is still blocking after ten minutes, stop this add-on and use one deterministic option from P2.

### Minimum version: explain the existing facts

- [ ] Add a small Bedrock service to the existing Node backend using `@aws-sdk/client-bedrock-runtime` and Converse. Configure region/model identifier through backend environment variables.
- [ ] Keep AWS credentials on the backend using the SDK credential chain; never put them in the display bundle.
- [ ] Add one endpoint protected by the existing paired-device credential; use that device owner's calendar data.
- [ ] Limit the request to the selected local day and visible calendar sources; respect the same filters as the displayed Brief. Include an explicit date and timezone.
- [ ] Compute event count, first/next/last timed event, and all-day event list in code. Send only the calendar facts needed for the summary.
- [ ] Ask for a two-sentence summary. Treat event titles as data and prohibit invented appointments, travel estimates, or calendar changes.
- [ ] Return a small validated response such as `{summary, generatedAt, source: "bedrock"}`. Reject missing, empty, or overlong summaries.
- [ ] Set an explicit output-token cap (for example, 250), a short request timeout (for example, eight seconds), and bounded retries.
- [ ] Add Generate brief loading/retry behavior without blocking the calendar UI. Prevent repeated submissions while a request is pending.
- [ ] Retain the existing deterministic Brief if generation fails. Label it as a basic schedule summary; never label fallback text as generated AI.
- [ ] Invalidate generated text when the selected day, visible calendars, or events change. If caching results, scope them to the authenticated owner, date, timezone, calendar selection, and schedule contents.
- [ ] Verify one real successful generation and one failed-call fallback on the demo target.

**Minimum done:** A real Bedrock response appears in the existing Brief screen, matches the visible schedule, and fails gracefully. This is enough to demonstrate an AI feature; stop here if time is tight.

### Optional extension: one suggested focus window

Do this only if the minimum AI brief is already working and submission time remains.

- [ ] Reuse the deterministic free-window calculation described in P2; send the computed windows with the facts.
- [ ] Let AI explain one existing window, for example: “Your 2–3 PM opening could fit a focus session.”
- [ ] Keep window start/end times from code. If returning a selected window identifier, validate it against the computed list.
- [ ] Describe the suggestion as time free on the selected calendars, without claiming everyone in the household is available.

Reference: [AWS Converse API](https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html). Resolve the actual model identifier from the configured account/region; do not hard-code an unverified model choice.

## P2 — Other small add-ons: pick at most one

These are alternatives or small follow-ups, not a second required roadmap. Prefer existing native components and no new permissions. Estimates assume the native app already runs and do not include toolchain setup.

| Add-on | Rough effort | Visible benefit | Prerequisite |
| --- | --- | --- | --- |
| Next-event countdown | 10–20 min | “Dentist starts in 35 minutes” | Existing next-event data |
| Today/Tomorrow Brief toggle | 15–25 min | Inspect tomorrow without a new screen | Events loaded for both days |
| Conflict badge/list | 20–40 min | Identify simultaneous timed appointments | Valid event start/end times |
| Largest open window | 25–45 min | Suggest a time for a focus session | Defined day bounds and overlap handling |
| Connection/freshness text | 10–20 min | “Updated 2 minutes ago” and “Showing saved events” | Last successful fetch timestamp |

### A. Next-event countdown — easiest visible improvement

- [ ] Add a countdown beside the existing next-event title in Brief.
- [ ] Update about once per minute and advance after an event begins.
- [ ] Handle no upcoming timed events and label all-day events separately.
- [ ] Verify the countdown at an event boundary.

### B. Today/Tomorrow Brief toggle

- [ ] Add two remote-focusable buttons to the existing Brief.
- [ ] Select the day using calendar dates in the device timezone, rather than adding a fixed 24 hours.
- [ ] Confirm events for the chosen date are loaded; handle a next-day empty state.
- [ ] Keep AI results tied to the chosen date if P1 is implemented.

### C. Conflict badge/list

- [ ] Compare timed intervals on the selected day: overlap when `a.start < b.end && b.start < a.end`.
- [ ] Treat end times as exclusive; back-to-back events are not overlaps.
- [ ] Clip multi-day intervals to the selected day and skip invalid/missing durations. Keep all-day events separate.
- [ ] Show the titles/times of overlapping events in one existing native card.
- [ ] Check overlap, nested overlap, back-to-back, and no-conflict examples.

### D. Largest open window

- [ ] Define a simple planning window, such as 8 AM–8 PM in the device timezone.
- [ ] Clip timed events to that window, sort them, and merge overlapping intervals before computing gaps.
- [ ] Return the largest gap of at least 30 minutes. Include the gap before the first event and after the last.
- [ ] Show the complete planning window on an empty day and a clear message when no qualifying gap exists.
- [ ] Display all-day events separately and explain that the suggestion uses timed events only.
- [ ] Check an empty day, fully booked day, nested overlaps, and events crossing midnight.

### E. Connection/freshness text

- [ ] Record and display the last successful calendar fetch time.
- [ ] Keep that timestamp unchanged after a failed refresh.
- [ ] If displaying retained events after failure, identify them as previously loaded and expose Retry.

**Recommended choice:** P0 → P1 minimum AI brief if access is ready → stop adding features. If AWS blocks you, P0 → countdown or conflict badge → submission. Add the focus-window extension only with real spare time.

## P3 — Submission and recording: reserve the final 45–60 minutes

- [ ] Freeze features and run the complete demo once on the actual target.
- [ ] Keep the backend, Metro, device connection, and Mac awake during recording.
- [ ] Record 60–120 seconds: calendar → multiple sources → remote event details → Brief → AI result if implemented.
- [ ] Capture two or three readable screenshots. Use events suitable for a public demo.
- [ ] Update README around the implemented scope; identify emulator versus physical hardware accurately.
- [ ] Remove or clearly label roadmap claims about Alexa+, Bedrock, phone control, and household availability that are not demonstrated.
- [ ] Describe the real architecture: Google Calendar → backend → paired TV; add Bedrock only if implemented.
- [ ] Document the local backend/Metro dependency, in-memory storage, and install steps.
- [ ] Include repository URL, required build/install instructions, description, screenshots/video, and any organizer-required fields.
- [ ] Check the actual submission requirements and deadline; do not assume a local demo or emulator meets every requirement.
- [ ] Submit with time to verify that links open and the upload is complete.

Suggested pitch after P0: “Hearth brings shared Google calendars to a household TV with a readable, remote-controlled daily view.” Add “A Bedrock-powered brief explains the day” only after P1 is verified.

## Deferred until after submission

Preserved here as future scope, not deadline requirements.

- Alexa+ integration, MCP server, and voice-to-TV control.
- Full phone controller and phone-to-TV state synchronization.
- Natural-language event creation, rescheduling, and automatic calendar writes.
- Weekly AI planning, travel-time estimates, and a full schedule engine.
- Household identities and everyone-free availability calculations.
- Native timed week-grid/weather parity with the browser.
- Live shared-task Google write verification and task demo polish.
- Production hosting, durable storage, and release/distribution work unless explicitly required by submission rules.
- Open-source UI library extraction, upstream contributions, and extensive design polish.

## Existing features retained outside the core demo

These were marked implemented in the previous todo. They remain available, but do not add native validation obligations for this submission unless selected for the demo.

- [x] Tasks: due dates, completion, edits, deletion, person colors, shared-calendar sync implementation, pending/error states, and retry. Real cross-device Google write verification remains deferred.
- [x] Browser timed Week grid, Agenda alternative, date navigation, daily weather, and detailed day schedules.
- [x] Compact clocks, appearance controls, font settings, and flame-text options.
- [x] Brief, Household, and Pomo navigation sections.
- [x] Pomo focus/break timer with duration controls, pause/resume/reset, and session count; continues across tabs and resets on app reload.
- [x] Browser fixture checks for shared tasks, failed-sync retry, and mobile layout.

## Scope rules

- Mark implementation and native verification separately.
- Fix failures in the demonstrated path before adding another feature.
- Keep Google and AWS credentials on the backend.
- Keep the calendar usable when AI is unavailable.
- Stop optional work at the submission buffer, even if an add-on is unfinished.
- Preserve a working recording and build before taking on changes that may break them.
