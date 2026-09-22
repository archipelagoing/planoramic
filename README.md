# planoramic

An Expo React Native TV app with a browser preview.

## Project structure

- Root app (`App.tsx`, `screens/`, `navigation/`): TV display and browser preview.
- `backend/`: local Express API, device pairing/control, and Google Calendar adapter.
- `web/`: planned phone-friendly login, pairing, and control app.
- [Device pairing design](docs/device-pairing.md): registration and display update flow.
- [Task list](todo.md): implementation progress.

See [backend setup](backend/README.md) to run the API on port 3001. The phone app
currently contains documentation only. Google login is implemented; follow
[Google Calendar setup](docs/google-calendar-setup.md) and open
`http://localhost:3001/connect` to try it. Persistent storage remains to be implemented.

## Run in a browser

```sh
npm install
npm run web
```

Open the local URL printed by Expo. Calendar opens with labeled sample events;
no backend is needed to preview the layout. Select an event to expand its details.
On TV, use Up / Down to browse and Select to expand; focused rows have a white
border and blue background. Choose **Connect calendar** to enter the existing
backend pairing flow, or **Preview sample events** to return from pairing.
Home, Movies, TV Shows, and Settings still display placeholder titles.

Expo uses `navigation/DrawerContent.web.tsx` for the browser sidebar and
`navigation/DrawerContent.tsx` for the TV sidebar with remote focus handling.
Both platforms share the screens and menu entries. Test TV remote behavior on
a TV device or emulator; the browser preview runs a separate instance of the app.

To generate a static web build:

```sh
npx expo export --platform web
```
