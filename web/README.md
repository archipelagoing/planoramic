# Phone control app

Reserved for the phone-friendly web UI. This app is not implemented yet.
The existing root `npm run web` command still previews the TV display in a browser.

Planned screens:

- Google sign-in and calendar connection.
- Pair a TV by entering its displayed code.
- Select a linked TV and see when it last checked in.
- View upcoming events and change the TV's today/week or date-range settings.
- Request a refresh or unlink a TV.

This UI will call the backend; it will not communicate directly with the TV.
See the [device pairing flow](../docs/device-pairing.md).
