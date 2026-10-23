# Hearth v1 submission pack

## Deadline and immediate actions

The [official hackathon page](https://amazonappdev2026.devpost.com/) lists October 23, 2026 at noon Pacific: **3:00 PM Eastern**. Submit before that time and verify the entry's submitted status. A saved draft alone is not confirmation of submission.

The [rules](https://amazonappdev2026.devpost.com/rules) require a working track demo, description, GitHub code and run instructions, a public demonstration video, and product feedback. For Fire TV, show the app functioning on Fire OS or Vega OS. Keep the video under three minutes, public on YouTube/Vimeo, and in English. Check every required form field; these notes do not certify personal eligibility.

- [x] Physical Vega TV runs the native calendar and loads live events (user confirmed).
- [x] Public repository exists at https://github.com/archipelagoing/planoramic with an Apache-2.0 license file locally.
- [ ] Commit/push the new `vega/` source, lockfile, and documentation; verify they are visible on GitHub. The generated Vega target was initially untracked locally.
- [ ] Record and upload the public demo video; paste its URL in Devpost.
- [ ] Fill description, Fire TV track, product feedback, and remaining required fields.
- [ ] Identify what changed during the hackathon window.
- [ ] Submit and verify confirmation before the deadline.

AI and Alexa+ are not implemented in this v1. Enter additional challenges only if their actual requirements are satisfied.

## Project title

Hearth

## Tagline

Your household's plans, together on Fire TV.

## Description — ready to adapt for the form

Hearth turns the household TV into a shared calendar surface. Instead of asking everyone to open another app, it puts upcoming plans where people can see them together.

The working Fire TV version runs natively on a Fire TV Stick HD using Vega OS. A companion browser page handles Google sign-in. The TV displays a pairing code, and the backend links that display to the signed-in account. Hearth then shows live events from readable personal and shared Google calendars, with source labels, Today and Next 7 days views, a next-event preview, and remote-controlled event details.

The stack is React Native for Vega, Amazon's Vega SDK and VDA development tools, a Node.js/Express backend, and Google OAuth/Calendar API. Google credentials stay on the backend; the TV receives a device-scoped credential.

This submission demonstrates the calendar foundation. AI summaries, Alexa+, automatic scheduling, and phone-to-TV controls remain future work. The current demo uses a local backend with in-memory storage and requires re-pairing after restarting the TV app.

## What changed during the hackathon

Hearth builds on an existing React Native TV/Expo foundation. Development added the Google Calendar/OAuth backend, display pairing, multi-calendar event loading, a richer browser planning interface, and a separate native Vega client. The new Vega target was built, installed, paired, and used to display live calendars on a physical Fire TV Stick HD during development.

Review this paragraph against your own project history before submitting it.

## Demo outline — approximately 90 seconds

1. **0–15 seconds:** Show the actual TV and remote. Say: “Hearth brings our household's shared calendars onto Fire TV.”
2. **15–35 seconds:** Show live calendar events and source labels. Explain the companion Google sign-in and display-code pairing briefly; showing the completed flow is enough if pairing would take too long in the video.
3. **35–60 seconds:** Use the remote to switch Today/Next 7 days, select an event, inspect its details, and return.
4. **60–80 seconds:** Show the next-event preview and Refresh. Explain that Google tokens remain in the backend.
5. **80–90 seconds:** State the current scope and future direction: “This is the working calendar v1. AI briefs and voice interaction are planned next.”

Use events suitable for a public demo. Film the real app functioning on the TV; a browser-only recording does not demonstrate this target. Do not demonstrate roadmap features as if they work.

## Product feedback draft — edit to reflect your experience

### Vega SDK, CLI, and VDA

**Used for:** Creating a native React Native TV target, resolving compatible dependencies, producing an ARMv7 release package, installing it on the stick, and connecting it to the development backend.

**Worked well:** The template and CLI provided a fast route from a basic native screen to an installed TV app. Manifest validation caught configuration issues before installation. A bundled release app could launch without Metro. VDA reverse forwarding let the TV use the local backend.

**Needs work:** It was initially unclear that the newer Fire TV Stick HD requires Vega rather than an Android APK. Developer login failed at vendor verification with a generic 401 until account/authentication setup was corrected. VDA reported “No route to host” even when ping and a direct TCP check succeeded; restarting the local VDA server restored the connection. The SDK resolver offered an OS 1.2 profile even though the physical device reported OS 2.0, which made compatibility less obvious.

**Onboarding:** More setup than expected because device OS identification, developer account registration, CLI authentication, connection mode, and app packaging were separate gates. Once connected, native build/install iterations were manageable.

**Would build again:** Yes. The physical TV demo works, and the shared React Native approach is useful. Clearer device-specific onboarding and more diagnostic connection errors would improve the experience.

### React Native for Vega

**Used for:** Remote-focusable controls, event lists, details, networking, and the TV calendar UI.

**Worked well:** Familiar React state and layout patterns transferred to the TV target. Focusable native controls supported remote exploration.

**Needs work:** The existing Expo/browser app could not simply be installed on Vega; dependencies and platform APIs needed separate handling. We kept the first Vega target small. Secure pairing persistence is still unfinished in this implementation and should not be described as an established platform limitation.

**Would build again:** Yes, with the target platform chosen and tested at the beginning.

### Google OAuth and Calendar API

**Used for:** Browser sign-in, readable calendar discovery, and live event retrieval.

**Worked well:** Multiple calendar sources could be combined and labeled in the TV view while keeping Google tokens on the backend.

**Needs work:** OAuth configuration, test-account permissions, and granting the appropriate scopes add onboarding steps. The demo needs clear calendar-source controls so users can hide personal information without changing their Google calendar memberships.

**Would build again:** Yes, with simpler calendar selection and durable backend storage.

## Evidence and limitations

- Native starter screen and remote navigation: confirmed by the user.
- Live calendar on the physical TV: confirmed by the user and successful backend event responses.
- Vega API/date tests: five passed; TypeScript check passed.
- Current storage is in memory; reopening the app requires pairing again.
- No real Bedrock, Alexa+, or automated scheduling integration is present in the submitted TV client.

## Publication check

The repository URL can retain its original `planoramic` name while the product is branded Hearth. Package IDs, cookie names, storage keys, and Google event metadata retain their original identifiers for compatibility. The Google OAuth consent-screen application name is configured separately in Google Cloud and may still show the old name.

Ensure the uploaded source includes `vega/package.json`, `vega/package-lock.json`, `vega/manifest.toml`, the Vega source/configuration, and backend code/setup instructions. Keep `.env`, `node_modules`, build output, and credentials out of GitHub. Publishing and submitting the form are still separate actions from preparing these local files.
