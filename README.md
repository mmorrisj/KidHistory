# KidHistory

A history game for ages 10–13. You are dealt an event card with the date hidden,
and you slot it into a timeline you have already built. Get it right and it locks
in and joins your collection; get it wrong and you see where it really belongs.

The point is **relative chronology** — knowing that the printing press came before
Columbus is a mental model. Knowing that it was 1440 is a flashcard.

## Playing

```bash
npm install
npm run dev
```

Then open the URL Vite prints. `npm run build` produces a static `dist/` you can
host anywhere; it installs as a phone app from the browser's "Add to Home Screen".

## Running the tests

```bash
npm test
```

Node's built-in test runner, no extra dependencies. Two suites:

- `test/engine.test.js` — the game rules: placement, scoring, lives, seeded decks.
- `test/content.test.js` — guards the content pack, so a bad event cannot ship.

## How it is put together

```
src/
  game/engine.js      pure game rules — no React, no DOM, no storage
  game/storage.js     localStorage progress, defensive about being blocked
  content/events.json the content pack
  components/         presentational React components
  App.jsx             screen routing and run lifecycle
```

`engine.js` is deliberately free of framework code. Every function takes state and
returns new state, which is why the rules can be tested directly and why the run
state can be serialised later for multiplayer or replays.

## The design, and why

**Tap-to-place, not drag-and-drop.** Dragging is fiddly on a phone and unusable
from a keyboard. Tapping a `+` gap is one gesture, works everywhere, and each gap
carries a screen-reader label saying which two events it sits between.

**Difficulty scales itself.** An empty timeline has enormous gaps and an almost
full one has tight ones, so the game gets harder as you get better without any
difficulty setting. The deck reinforces this by dealing tier 1 events (famous,
widely spaced) before tier 2 and tier 3.

**Wrong answers still teach.** A misplaced card is inserted where it actually
belongs, in context, next to the events either side of it. That is the moment the
learning happens, so the game never just says "no".

**The collection is the long game.** A single run is a few minutes. Filling in all
69 cards is weeks, and the collection screen doubles as a map of what is still out
there.

## Adding events

Append to `src/content/events.json` and run `npm test` — the content suite checks
the shape, uniqueness, year range, blurb length, and tier balance for you.

```json
{
  "id": "kebab-case-and-unique",
  "year": 1969,
  "title": "Short enough to fit a card (max 60 chars)",
  "blurb": "One or two sentences a 10-year-old would find interesting (max 220).",
  "category": "space",
  "region": "Americas",
  "tier": 1,
  "emoji": "🌙"
}
```

Use negative years for BCE: `-2560` renders as "2560 BCE".

`tier` controls when a card enters the deck — 1 for famous anchors, 2 for
middling, 3 for events that need a tight judgement call.

## Ideas not built yet

- **Era packs** — Ancient Egypt, Space Race, Civil Rights — as separate decks.
- **Two-player pass-and-play**, taking turns on one timeline.
- **Connection mode**: given two events, explain how one led to the other.
- Sound, and richer art per card.
