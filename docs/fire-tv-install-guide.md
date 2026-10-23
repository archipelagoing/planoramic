# Run Hearth on Fire TV from your Mac

> **Target-device update (2026-10-23):** The reported Fire TV Stick HD 2nd generation with software OS 2.0 matches the newer Vega device family. Amazon lists the 2026 HD as Vega OS. This guide's Android APK/ADB build steps do **not** apply to that stick. Use the platform gate in [todo.md](../todo.md) and [Amazon's Vega Developer Mode instructions](https://developer.amazon.com/docs/vega/0.24/developer-mode) before installing tools. The existing Android TV app requires a Vega-compatible build/port to run on this device.

This guide builds and installs this repository's native Android TV app, connects it to the local backend, and pairs Google Calendar. It covers a physical **Fire OS Fire TV** and an **Android TV emulator**.

This Android APK workflow does not apply to a Fire TV running **Vega OS**. Check the operating system in the device's About screen before spending time on Android setup. An Android TV emulator tests the Android TV app; it is not an actual Fire OS device.

The project already has `react-native-tvos` and the TV config plugin enabled in `app.json`. Build the existing project. Do not create a new Expo project or upgrade Expo/React Native for this installation.

## 1. Check your Mac's tools

Open Terminal and run:

```sh
cd /Users/archi/planoramic
node --version
npm --version
/usr/libexec/java_home -V
```

Use Node.js **22 or newer** for the backend and **JDK 17** for this project's Android build. The earlier environment check found Java 24 and Java 8, but no Java 17.

If needed:

1. Install [Android Studio](https://developer.android.com/studio). Choose the download matching your Mac. The earlier environment check reported an Intel (`x86_64`) Mac.
2. Complete Android Studio's setup wizard.
3. Open **SDK Manager** from the welcome screen's **More Actions**, or from Android Studio settings.
4. Install Android SDK Platform 34, Android SDK Platform-Tools, Android SDK Build-Tools 34.0.0, and Android SDK Command-line Tools. Enable **Show Package Details** to choose a specific build-tools version. If the build requests another SDK/NDK component, install that exact component too.
5. Install a macOS JDK 17 package, for example from [Eclipse Temurin](https://adoptium.net/temurin/releases/?version=17). Choose x64 for an Intel Mac or aarch64 for Apple silicon.

Configure your current Terminal session:

```sh
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

adb version
"$JAVA_HOME/bin/java" -version
```

**Success:** ADB prints its version and Java reports version 17. If Android Studio uses a different SDK location, substitute its location for `ANDROID_HOME`.

These exports apply to this terminal only. Repeat them in a new build terminal, or add them to your shell configuration yourself.

## 2. Connect the target

Choose either A or B.

### A. Physical Fire OS Fire TV

1. Put your Mac and Fire TV on the same local network. Avoid guest Wi-Fi that isolates devices.
2. On Fire TV, open **Settings → My Fire TV → Developer Options** and enable **ADB Debugging**. Menu names can vary by model.
3. If Developer Options is hidden, open **My Fire TV → About**, highlight the device name, and press Select seven times. Return to My Fire TV and look again.
4. Find the Fire TV's IP address under **About → Network**.
5. Run the following, replacing the example address with the TV's address:

```sh
adb connect 192.168.1.50:5555
adb devices -l
```

6. Accept the debugging authorization prompt on the TV. Allow this computer if offered.

**Success:** Your TV appears with status `device`, not `unauthorized` or `offline`.

### B. Android TV emulator

1. In Android Studio, open **Device Manager**.
2. Create a virtual device using a **TV** hardware profile, such as Android TV 1080p.
3. Download a compatible Android TV system image. Expo's guidance specifies API 31 or newer. Choose x86_64 for an Intel Mac or ARM64 for Apple silicon.
4. Start the emulator and wait for its home screen.
5. Run:

```sh
adb devices -l
```

**Success:** An emulator such as `emulator-5554` appears with status `device`. You do not need `adb connect` for a local emulator.

## 3. Select exactly one target

Copy the identifier in the first column of `adb devices -l`. Set it in your build terminal. Choose the appropriate example and replace it with your actual identifier:

```sh
# Physical TV example:
export ANDROID_SERIAL=192.168.1.50:5555
```

```sh
# Emulator example:
export ANDROID_SERIAL=emulator-5554
```

Verify:

```sh
adb -s "$ANDROID_SERIAL" shell getprop ro.product.model
adb -s "$ANDROID_SERIAL" shell getprop ro.build.version.sdk
```

**Success:** The commands print the intended device model and Android API level. Keep this terminal for the build and ADB commands below.

## 4. Start the backend in a separate terminal

If your backend already runs and Google sign-in works, leave it running and skip setup changes. Restarting it clears its in-memory accounts, Google tokens, devices, and pairing sessions.

Otherwise, open a second terminal:

```sh
cd /Users/archi/planoramic/backend
npm install
```

If `backend/.env` does not exist, create it from `backend/.env.example`. Do not overwrite an existing working `.env`.

Generate a development API key:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set these values in `backend/.env` using your editor:

```dotenv
HOST=127.0.0.1
PORT=3001
DEV_API_KEY=YOUR_GENERATED_VALUE
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
```

Keep credentials in the backend. Never put Google secrets or `DEV_API_KEY` in an `EXPO_PUBLIC_` variable.

Start it:

```sh
npm start
```

Keep this terminal running. In another terminal, verify:

```sh
curl http://127.0.0.1:3001/health
```

**Success:** You get a successful health response. For Google Cloud configuration, use [Google Calendar setup](google-calendar-setup.md).

## 5. Forward the TV's ports to your Mac

Return to the build terminal from step 3:

```sh
adb -s "$ANDROID_SERIAL" reverse tcp:3001 tcp:3001
adb -s "$ANDROID_SERIAL" reverse tcp:8081 tcp:8081
adb -s "$ANDROID_SERIAL" reverse --list
```

Port 3001 is the backend. Port 8081 is Metro, the JavaScript development server.

With these mappings, `127.0.0.1:3001` inside the TV app reaches the backend on your Mac. Without forwarding, that address points at the TV itself.

**Success:** Both mappings appear. Reapply them after device reboots or ADB reconnections. If `reverse` is unsupported or fails, use the local-network fallback below.

## 6. Build and install Hearth

In the same build terminal:

```sh
cd /Users/archi/planoramic
export EXPO_TV=1
export EXPO_PUBLIC_API_URL=http://127.0.0.1:3001
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

npx expo run:android --device "$ANDROID_SERIAL"
```

If dependencies are missing, run `npm install` in the repository root and retry. If Expo asks for an Android package name, use `com.archi.planoramic` and keep that name for subsequent builds.

This command generates the native Android project if needed, downloads build dependencies, builds an APK, installs it, and starts Metro. The first build can take several minutes. Leave the terminal running.

**Success:** Gradle reports `BUILD SUCCESSFUL`, the app is installed, and Hearth opens on the target. The launcher may call it **ExpoTVDemo**, the current name in `app.json`.

This uses a native debug build. Expo Go does not support this project's TV configuration. The debug app needs Metro running to load its JavaScript.

If the build reports a missing SDK or unaccepted license, install the requested component in SDK Manager. To review and accept SDK licenses:

```sh
"$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --licenses
```

Then rerun the build command.

## 7. Pair Google Calendar

1. Open the Calendar section on the TV.
2. Select **Connect calendar**. The initial calendar may show sample events before pairing.
3. Read the pairing code on the TV.
4. On your Mac, open **http://localhost:3001/connect**.
5. Sign in with Google and grant the requested calendar access.
6. Enter the TV's pairing code and select **Pair display**.
7. Wait for the TV to finish polling and display your live events.

Use `localhost` consistently for the Mac's connection page and OAuth callback. Switching between `localhost` and `127.0.0.1` in that browser flow can cause cookie/state problems. The native app's API URL can still use `127.0.0.1` through ADB forwarding.

**Success:** Recognizable events from your own calendars replace sample data. Codes expire after about ten minutes; use the currently displayed code.

## 8. Check the demo flow

- Navigate with only the remote's D-pad and Select.
- Open and close event details.
- Refresh and confirm events return.
- Leave and reopen the app while keeping Metro and the backend running.
- Verify pairing survives reopening.

Browser-only views may differ from native TV views. Focus on the native calendar flow first.

Once this works, record a successful demo before further changes. Keep the Mac awake, the ADB connection active, and both servers running.

## Troubleshooting

### `adb: command not found` or SDK not found

Repeat the `ANDROID_HOME` and `PATH` exports in step 1. Verify the SDK location in Android Studio. Install Platform-Tools if `platform-tools/adb` is absent.

If Gradle specifically reports `SDK location not found`, ensure `ANDROID_HOME` is exported in the build terminal. Alternatively, create or edit `android/local.properties` after native generation and add:

```properties
sdk.dir=/Users/archi/Library/Android/sdk
```

### TV connection refused, timed out, unauthorized, or offline

Check the current IP address, ADB Debugging setting, and TV authorization prompt. Verify both devices are on a network that allows local connections. Temporarily disconnect a VPN if it blocks local access.

Reconnect using your TV's actual address:

```sh
adb disconnect 192.168.1.50:5555
adb connect 192.168.1.50:5555
adb devices -l
```

If necessary, toggle ADB Debugging off and on. Reapply port forwarding after reconnecting. As a later recovery step, `adb kill-server` followed by `adb start-server` restarts ADB, but interrupts all current ADB connections.

### More than one device/emulator

Use `adb -s "$ANDROID_SERIAL" ...` for ADB commands and `--device "$ANDROID_SERIAL"` for the Expo build. Ensure the variable is set in your current terminal.

### Java, Gradle, or `Unsupported class file major version` error

Verify JDK 17 is installed and selected:

```sh
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
"$JAVA_HOME/bin/java" -version
```

If the native Android directory exists, stop old Gradle daemons before retrying:

```sh
cd /Users/archi/planoramic/android
./gradlew --stop
cd /Users/archi/planoramic
npx expo run:android --device "$ANDROID_SERIAL"
```

Do not upgrade Gradle or React Native to resolve a Java selection issue.

### Build cannot download Gradle/Maven/npm dependencies

Check the Mac's internet connection, proxy, and VPN. Retry once connectivity is restored. Save the first concrete error above `BUILD FAILED`; the final failure line alone rarely identifies the cause.

### App installed, but missing from the home screen

Look under installed applications for **ExpoTVDemo**. With the package name from step 6, you can launch it directly:

```sh
adb -s "$ANDROID_SERIAL" shell monkey -p com.archi.planoramic -c android.intent.category.LEANBACK_LAUNCHER 1
```

If you chose a different package name, substitute it. To inspect installed third-party package names:

```sh
adb -s "$ANDROID_SERIAL" shell pm list packages -3
```

### Red screen, `Unable to load script`, or cannot connect to Metro

Keep the backend running. Check that Metro is running in the build terminal and reapply the forwarding:

```sh
adb -s "$ANDROID_SERIAL" reverse tcp:8081 tcp:8081
curl http://127.0.0.1:8081/status
```

The status endpoint should report that the packager is running. If Metro has stopped, start it from the project root with the same API environment:

```sh
cd /Users/archi/planoramic
export EXPO_TV=1
export EXPO_PUBLIC_API_URL=http://127.0.0.1:3001
npx expo start --localhost --clear
```

Reopen or reload the installed app. Use port 8081 consistently; if another Metro instance occupies it, stop that instance instead of accepting a different port without also changing forwarding.

### `Cannot reach the calendar service` or pairing code never appears

1. Run `curl http://127.0.0.1:3001/health` on the Mac.
2. Check `adb -s "$ANDROID_SERIAL" reverse --list` for port 3001.
3. Reapply the backend forwarding.
4. Verify `EXPO_PUBLIC_API_URL` was set in the terminal that started Metro.
5. If you changed that variable, stop Metro and restart it with `--clear` using the command above. The value is included in the JavaScript bundle; changing a shell variable alone does not update a running app.

If logs report **cleartext HTTP traffic not permitted**, inspect the generated debug manifest at `android/app/src/debug/AndroidManifest.xml`. Its `<application>` element should allow local development HTTP with `android:usesCleartextTraffic="true"`. If absent, add that attribute for the debug build and rebuild. Keep this exception scoped to local development.

### Local-network fallback when `adb reverse` fails

Use your Mac's local IP instead of TV loopback:

1. Find the Mac's IP under **System Settings → Network → your active connection → Details → TCP/IP**.
2. Stop the backend only if necessary to change its listening address. Restarting loses pairing and sign-in state.
3. In the backend terminal, run:

```sh
cd /Users/archi/planoramic/backend
HOST=0.0.0.0 npm start
```

4. Stop Metro and restart from the project root, substituting the Mac's actual IP:

```sh
cd /Users/archi/planoramic
export EXPO_TV=1
export EXPO_PUBLIC_API_URL=http://192.168.1.20:3001
npx expo start --lan --clear
```

5. Allow incoming connections for Node if macOS asks. Keep both devices on the same trusted network.
6. Reopen the app. If its developer server address still points at localhost, open the React Native developer menu and set the debug server host to `YOUR_MAC_IP:8081`. On devices that support the shortcut, open that menu with:

```sh
adb -s "$ANDROID_SERIAL" shell input keyevent 82
```

Continue Google sign-in on the Mac at `http://localhost:3001/connect`, retaining the localhost OAuth callback. Only the TV's API and Metro connections use the Mac's LAN IP.

### Google sign-in fails or events do not load after pairing

- **Redirect URI mismatch:** Register `http://localhost:3001/auth/google/callback` exactly in the Google OAuth web client and backend configuration.
- **Invalid OAuth state:** Start again at `/connect` in one browser tab using `localhost` throughout.
- **Access denied/testing restrictions:** Check the OAuth consent screen and add your Google account as a test user if the app is in testing mode.
- **Expired pairing code:** Enter the currently displayed code or use **Retry pairing** on the TV.
- **Pairing lost after backend restart:** Sign in and pair again. Native SecureStore remembers the device credential, but the current backend loses its matching records on restart.
- **Calendar permissions/token error:** Reconnect Google on the connection page, then refresh the TV. Check backend logs for the underlying Google error.
- **No events:** Check the selected date range, hidden calendar filters, and that the signed-in account has readable calendars with events in that range.

### Immediate app crash or a JavaScript error

Capture logs before changing dependencies:

```sh
adb -s "$ANDROID_SERIAL" logcat -v time AndroidRuntime:E ReactNativeJS:V ReactNative:V '*:S'
```

Launch the app again while this runs; press Ctrl+C to stop. Look for the first exception and its stack trace. For earlier crash output:

```sh
adb -s "$ANDROID_SERIAL" logcat -b crash -d
```

A working browser build does not establish native compatibility. If a named component/module fails, use its native implementation or fix the reported native error; rebuilding repeatedly will not fix a JavaScript exception.

### Remote buttons or focus do not work

Check that the failing element is actually focusable and that you built with the existing TV config. You can send navigation keys to isolate remote hardware problems:

```sh
adb -s "$ANDROID_SERIAL" shell input keyevent 20
adb -s "$ANDROID_SERIAL" shell input keyevent 23
adb -s "$ANDROID_SERIAL" shell input keyevent 4
```

These send Down, Select, and Back. Up is 19, Left is 21, and Right is 22. If ADB navigation also fails, investigate the UI focus behavior.

### App reports a signing conflict during installation

Use the same signing key as the installed app when possible. Uninstalling the existing app is a last resort: it deletes its local data, including pairing credentials. If you choose to uninstall, use Fire TV's application settings, then install the build and pair again.

## Restart checklist for the next session

1. Keep or start the backend; sign in and pair again if it was restarted.
2. Start the emulator or connect ADB to the physical TV.
3. Export the SDK path and target identifier in your terminal.
4. Reapply both reverse-port mappings.
5. Start Metro with the same `EXPO_PUBLIC_API_URL`.
6. Open the already installed app. Rebuild only when native code/configuration or dependencies change.

For a runnable APK that loads without Metro, a separate release build with bundled JavaScript is needed. The debug workflow above is intended for development and a connected demo; it still requires your Mac and backend.

## References

- [Amazon: Connect to Fire TV through ADB](https://developer.amazon.com/docs/fire-tv/connecting-adb-to-device.html)
- [Amazon: Install and run your app](https://developer.amazon.com/docs/fire-tv/installing-and-running-your-app.html)
- [Expo: Build apps for TV](https://docs.expo.dev/guides/building-for-tv/)
- [Android: Java versions in Android builds](https://developer.android.com/build/jdks)
- [Project: Google Calendar setup](google-calendar-setup.md)
- [Project: Backend setup](../backend/README.md)
