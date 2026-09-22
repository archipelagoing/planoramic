# 🔥 Planoramic

### Your household's week, understood at a glance.

Planoramic transforms Fire TV into an **ambient intelligent planning surface** for the home.

Instead of repeatedly opening a calendar to figure out what is happening, Planoramic brings upcoming schedules, shared calendars, conflicts, free time, and useful insights onto the largest screen in the home.

The hackathon version is being developed around a simple interaction model:

> **Voice for intent. TV for understanding. Remote for exploration. Phone for configuration.**

Planoramic combines **Fire TV, Alexa+, Amazon Bedrock, and Google Calendar** to explore what a household planning experience can look like when information moves naturally between voice, television, remote, and phone.

---

## The Idea

Calendars contain a lot of information, but they still require someone to open an app, inspect individual events, compare schedules, and mentally figure out what matters.

Planoramic asks a different question:

**What if your home could simply show you what you need to know?**

The Fire TV becomes an ambient planning surface that can answer questions such as:

- What's happening tomorrow?
- When am I free?
- Do I have any conflicts?
- What's my busiest day this week?
- When is everyone free Saturday?
- What should I know before I leave?

Rather than treating the television as another place to open a calendar app, Planoramic is designed around **glanceable understanding from across the room**.

---

# Multimodal by Design

Planoramic uses each device for what it does best.

```text
                       PLANORAMIC

                ┌──────────────────┐
                │     FIRE TV      │
                │                  │
                │  SEE + UNDERSTAND│
                └────────▲─────────┘
                         │
                    shared state
                         │
              ┌──────────┴──────────┐
              │                     │
         ┌────▼─────┐          ┌────▼─────┐
         │  ALEXA+  │          │  PHONE   │
         │          │          │          │
         │ ASK      │          │ CONTROL  │
         └──────────┘          └──────────┘

                    FIRE TV REMOTE
                           │
                           ▼
                        EXPLORE
```

### 🗣 Voice for intent

Ask Alexa+ about your schedule naturally.

```text
"What's happening tomorrow?"

"When am I free Friday?"

"Do I have any conflicts this week?"

"Show me Saturday."
```

### 📺 TV for understanding

Planoramic turns the response into a visual experience designed for viewing from across the room.

Instead of Alexa simply reading a calendar aloud, the TV can move to the relevant date, highlight a conflict, or show an available block of time.

### 🎮 Remote for exploration

The Fire TV remote provides precise navigation when the user wants to inspect:

- individual events
- days
- schedule details
- AI insight cards
- conflicts
- free periods

### 📱 Phone for configuration

The companion control experience is designed for tasks that are awkward on a television:

- pairing a display
- selecting calendars
- changing views
- refreshing the display
- configuring household members
- managing preferences

---

# Example Experience

Imagine Planoramic is sitting quietly on the television showing the household's upcoming week.

You ask:

> **"Alexa, when am I free tomorrow?"**

Planoramic analyzes the schedule.

Alexa responds:

> "Your longest opening is from 2 to 5 PM."

At the same time, the television switches to tomorrow and highlights:

```text
TOMORROW

 9:00 ┌──────────────────┐
      │ Machine Learning │
11:00 └──────────────────┘

11:30 ┌──────────────────┐
      │ Interview        │
12:30 └──────────────────┘


 2:00 ╔══════════════════╗
      ║                  ║
      ║      FREE        ║
      ║     3 HOURS      ║
      ║                  ║
 5:00 ╚══════════════════╝
```

The spoken response gives the quick answer.

The television provides the context.

The remote lets the user explore further.

---

# ✦ Planoramic Brief

Planoramic is being extended with Amazon Bedrock to turn raw calendar data into useful schedule intelligence.

Instead of merely displaying events:

```text
10:00 AM    Class
12:30 PM    Interview
 2:00 PM    Meeting
 4:00 PM    Dentist
```

Planoramic can surface information such as:

```text
✦ PLANORAMIC BRIEF

Tuesday is busiest before 2 PM.

4 events

⚠ Tight transition this afternoon

✦ Best free block
5:00 – 8:30 PM

Tomorrow begins at 9:00 AM
```

The goal is not to ask an LLM to perform calendar arithmetic.

Planoramic first calculates deterministic schedule facts such as conflicts, gaps, event density, and transitions. Bedrock can then turn those facts into concise, human-friendly insights.

```text
Google Calendar
       │
       ▼
Planoramic Schedule Engine
       │
       ├── conflicts
       ├── free time
       ├── transitions
       └── schedule density
       │
       ▼
 Amazon Bedrock
       │
       ▼
Structured schedule insights
       │
       ▼
    Fire TV
```

---

# Alexa+ Integration

Planoramic is being designed so Alexa+ and Fire TV operate on the **same Planoramic state** rather than behaving like unrelated applications.

The planned integration uses a Planoramic MCP server.

```text
                   Alexa+
                      │
                      ▼
             Planoramic MCP Server
                      │
                      ▼
              Planoramic Backend
                ↙           ↘
       Schedule Engine    Amazon Bedrock
                ↘           ↙
                 Shared State
                      │
                      ▼
                   Fire TV
```

Initial Planoramic tools include:

```text
get_schedule
get_schedule_summary
find_free_time
find_conflicts
show_date
show_week
highlight_free_time
highlight_conflicts
```

This allows voice to affect the visual experience.

For example:

```text
"Alexa, show me Friday."

              ↓

        Planoramic MCP

              ↓

     Fire TV → Friday
```

---

# Household Planning

Fire TV naturally lives in a shared space.

Planoramic is therefore being designed to support multiple calendars and household identities rather than treating the television as a giant personal phone screen.

```text
HOUSEHOLD

Archi       ●
Mom         ●
Dad         ●
Family      ◇
School      □
```

This creates possibilities such as:

> "When is everyone free Saturday?"

> "Does anyone have anything tomorrow night?"

> "Show only my calendar."

> "Who has something Thursday morning?"

The goal is to make Planoramic useful as a persistent **shared awareness layer for the home**.

---

# Current Working Prototype

Planoramic already has a functioning calendar and device-pairing foundation.

### Working

- [x] Google OAuth sign-in
- [x] Read-only Google Calendar access
- [x] Multiple readable calendars
- [x] Shared calendar support
- [x] Live upcoming events
- [x] Display pairing codes
- [x] Browser pairing persistence
- [x] Expandable event details
- [x] Calendar source labels
- [x] Light theme
- [x] Dark theme
- [x] System theme
- [x] Backend API integration tests
- [x] Browser integration tests
- [x] Native SecureStore implementation

### Hackathon Development

- [ ] Fire TV device validation
- [ ] D-pad and focus validation
- [ ] Schedule intelligence engine
- [ ] Conflict detection
- [ ] Free-time detection
- [ ] Amazon Bedrock Planoramic Brief
- [ ] AI context cards
- [ ] Alexa+ MCP integration
- [ ] Alexa → Fire TV control
- [ ] Phone → Fire TV control
- [ ] Household availability
- [ ] Persistent production backend

---

# Amazon Developer Hackathon

Planoramic is being developed for the Amazon Developer Hackathon around several complementary parts of the Amazon ecosystem.

### Fire TV

The primary Planoramic experience.

Fire TV acts as an ambient, glanceable household planning surface designed for a 10-foot interface and D-pad navigation.

### AI-Enhanced Viewing

Amazon Bedrock is used to transform deterministic schedule information into concise, useful planning insights.

### Multi-Modal UX

Planoramic combines:

**voice → visual → remote → touch**

within the same planning experience.

### Alexa+

Alexa+ provides conversational access to Planoramic through MCP, allowing natural-language schedule queries and control of the Fire TV experience.

### AWS Builder

Amazon Bedrock powers the intelligence layer used by Planoramic Brief and schedule explanations.

### Open Source

Reusable React Native TV components developed for Planoramic are planned to be extracted into a small open-source TV UI/focus library.

---

# Architecture

```text
                       Google Calendar
                              │
                              ▼
                    ┌───────────────────┐
                    │ Planoramic Backend│
                    │                   │
                    │ OAuth             │
                    │ Calendar API      │
                    │ Device Pairing    │
                    │ Shared State      │
                    └─────────┬─────────┘
                              │
                  ┌───────────┴───────────┐
                  │                       │
                  ▼                       ▼
        ┌──────────────────┐     ┌────────────────┐
        │ Schedule Engine  │     │ Amazon Bedrock │
        │                  │     │                │
        │ conflicts        │────▶│ interpretation │
        │ free time        │     │ summaries      │
        │ transitions      │     │ insights       │
        └──────────────────┘     └────────────────┘
                  │                       │
                  └───────────┬───────────┘
                              │
                         shared state
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
           Fire TV          Alexa+           Phone
              │               │               │
           visual           voice           touch
              │
            remote
```

---

# Technology

### Display

- React Native
- React Native TV
- Expo
- TypeScript
- React Navigation
- React Native Paper
- React Native Reanimated
- Expo SecureStore

### Backend

- Node.js
- Express
- Google OAuth
- Google Calendar API

### Amazon

Hackathon integrations under development:

- Fire TV
- Amazon Bedrock
- Alexa+
- Model Context Protocol (MCP)

---

# Run Planoramic Locally

You'll need **Node.js 22 or newer**, npm, and two terminal windows.

To display your own events, you'll also need a Google account and Google Cloud OAuth client.

You can skip Google setup and explore Planoramic using the sample calendar.

## 1. Backend

```sh
npm install

cd backend
npm install

cp .env.example .env

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add the generated value to `DEV_API_KEY` in:

```text
backend/.env
```

To connect your own calendars, follow:

```text
docs/google-calendar-setup.md
```

Then configure:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

Start the backend:

```sh
npm start
```

---

## 2. Display

In another terminal:

```sh
npm run web
```

Open the local Expo web address.

The Calendar screen initially displays sample events.

---

## 3. Connect Google Calendar

1. Select **Connect calendar** on the display.
2. Planoramic generates a pairing code.
3. Open the Planoramic connection page.
4. Select **Connect Google Calendar**.
5. Sign into Google.
6. Grant calendar access, including event writes for shared tasks.
7. Enter the pairing code.
8. Select **Pair display**.

Upcoming events will appear on the display.

Calendar schedules remain read-only. In Settings, choose an editable shared calendar to sync dated tasks as all-day events. Task edits, completion, and deletion update those Planoramic-created events; unrelated Google events are not modified. Reconnect Google after upgrading from read-only access.

---

# Development

```sh
npm test --prefix backend
npm run test:web
npx tsc --noEmit
```

Browser tests use simulated calendar responses and do not replace testing on Fire TV hardware.

Native builds use Expo SecureStore for pairing credentials.

---

# Project Status

Planoramic is an active hackathon prototype.

The core Google Calendar, OAuth, pairing, and browser display pipeline works today.

Fire TV validation and the Bedrock, Alexa+, schedule-intelligence, phone-control, and household features described above are currently being developed.

See:

```text
todo.md
hackathon-todo.md
backend/README.md
docs/device-pairing.md
docs/google-calendar-setup.md
```

for implementation details and current progress.

---

# Why Planoramic?

A calendar tells you **what is scheduled**.

Planoramic is being built to help you understand:

**What matters?**

**When am I free?**

**Where are the conflicts?**

**What does the household need to know?**

**What should be on the screen right now?**

The television becomes more than another screen.

It becomes part of how the home understands its time.
