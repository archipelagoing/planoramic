## Inspiration

I wanted a shared calendar on the TV so you could just look up and see what’s going on. You shouldn’t have to keep opening your phone and switching between calendars to figure out what the day looks like.

That’s basically where Hearth started. I wanted it to feel like something that belongs in the house, with everyone’s plans in one place.

## What it does

Hearth connects Google Calendar to your Fire TV. You sign in on your computer, enter the code that shows up on the TV, and it loads your events.

You can switch between today and the next seven days, see which calendar an event belongs to, and use the remote to open the details. It also shows your next upcoming event and lets you refresh the calendar.

The demo runs on an actual Fire TV Stick HD with Vega OS. There’s also a browser version with more planning features, but I haven’t brought all of those over to the TV yet.

## How we built it

I started with an existing React Native TV and Expo project, then added a Node.js and Express backend for Google sign-in, calendar events, and display pairing.

Sign-in happens on your computer because typing a Google login with a TV remote would be annoying. The backend keeps the Google tokens, and the TV gets a separate credential to load the calendar.

A lot of the initial work was on the web version. For the physical stick, I built a separate React Native for Vega app, packaged it for ARMv7, and installed it using the Vega SDK.

## Challenges we ran into

The biggest issue was that having the web version working didn’t mean the Fire TV version was ready. The project had TV configuration, but I still needed to build it, install it, and get it talking to the backend on the actual device.

Then I found out my Fire TV Stick HD runs Vega OS, so the Android TV build wasn’t going to work on it. That changed the setup pretty late.

Developer login failed during account verification, and the connection tools later kept saying “No route to host.” Even when the TV responded to a network check, the tools wouldn’t connect. Restarting the local VDA service fixed that.

I also had to severely narrow the scope near the deadline. I wanted AI scheduling, voice controls, and more of the browser features on the TV, but getting the actual calendar working had to come first.

## Accomplishments that we're proud of

I got it from working on the web to actually showing live calendar events on my Fire TV. I could sign in, pair the display, and see the calendar on the screen.

There are still things to fix, but that part works on the physical device. I also added tests for credentials, cancelled requests, and date handling, including all-day events and daylight saving boundaries.

## What we learned

Test on the actual device earlier. That was probably the biggest lesson. The browser was useful for building things quickly, but it didn’t tell me whether the app would run on my stick.

Remote navigation also needs its own testing. Something can look fine on a computer and still be awkward when you’re trying to get around with a D-pad.

While getting ready for the demo, I had to remove myself from some personal calendars so they wouldn’t show up. That made calendar visibility controls a much clearer priority for the TV version.

## What's next for Hearth

First I need to make pairing stick. Right now, if the TV app closes, you have to pair it again. The backend also stores everything in memory, so restarting it means signing in again.

After that, I want calendar visibility controls and more of the features I already built for the browser. I still want to add AI scheduling help, starting with a daily brief, conflicts, and suggestions for free time.

Those aren’t part of this TV version yet. This submission is the working calendar v1, and I’m building from there.
