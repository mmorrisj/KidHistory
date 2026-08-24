import test from 'node:test'
import assert from 'node:assert/strict'
import {
  startRun, placeCard, isCorrectSlot, correctSlot, buildDeck,
  mulberry32, hashSeed, pointsFor, streakMultiplier, LIVES,
} from '../src/game/engine.js'
import { mergeRun, emptyProgress } from '../src/game/storage.js'
import events from '../src/content/events.json' with { type: 'json' }

const card = (year) => ({ id: `y${year}`, year, tier: 1, title: `${year}` })

/**
 * Finds a slot the current card genuinely does not belong in. Picking "0 unless
 * the answer is 0" looks equivalent but breaks on tied years, where both sides
 * of a neighbour are legitimately correct.
 */
const wrongSlot = (run) => {
  for (let i = 0; i <= run.timeline.length; i++) {
    if (!isCorrectSlot(run.timeline, run.current, i)) return i
  }
  throw new Error('no wrong slot exists for this card')
}

test('isCorrectSlot accepts a card that fits between its neighbours', () => {
  const timeline = [card(1000), card(1500), card(1900)]
  assert.equal(isCorrectSlot(timeline, card(1200), 1), true)
  assert.equal(isCorrectSlot(timeline, card(1200), 0), false)
  assert.equal(isCorrectSlot(timeline, card(1200), 2), false)
})

test('isCorrectSlot handles both ends of the timeline', () => {
  const timeline = [card(1000), card(1500)]
  assert.equal(isCorrectSlot(timeline, card(500), 0), true)
  assert.equal(isCorrectSlot(timeline, card(2000), 2), true)
  assert.equal(isCorrectSlot(timeline, card(500), 2), false)
})

test('a year that ties a neighbour counts as correct on either side', () => {
  const timeline = [card(1500)]
  assert.equal(isCorrectSlot(timeline, card(1500), 0), true)
  assert.equal(isCorrectSlot(timeline, card(1500), 1), true)
})

test('BCE years order before CE years', () => {
  const timeline = [card(-44), card(79)]
  assert.equal(isCorrectSlot(timeline, card(-221), 0), true)
  assert.equal(isCorrectSlot(timeline, card(-221), 1), false)
})

test('correctSlot points at where the card actually belongs', () => {
  const timeline = [card(1000), card(1500), card(1900)]
  assert.equal(correctSlot(timeline, card(500)), 0)
  assert.equal(correctSlot(timeline, card(1200)), 1)
  assert.equal(correctSlot(timeline, card(2000)), 3)
})

test('a correct placement scores, keeps lives, and grows the streak', () => {
  const run = startRun(events, 42)
  const slot = correctSlot(run.timeline, run.current)
  const next = placeCard(run, slot)
  assert.equal(next.lastResult.correct, true)
  assert.equal(next.lives, LIVES)
  assert.equal(next.streak, 1)
  assert.ok(next.score > 0)
  assert.equal(next.timeline.length, run.timeline.length + 1)
})

test('a wrong placement costs a life, resets the streak, and scores nothing', () => {
  const run = startRun(events, 42)
  const next = placeCard(run, wrongSlot(run))
  assert.equal(next.lastResult.correct, false)
  assert.equal(next.lives, LIVES - 1)
  assert.equal(next.streak, 0)
  assert.equal(next.score, 0)
})

test('a wrongly placed card still lands in its true position', () => {
  let run = startRun(events, 7)
  run = placeCard(run, wrongSlot(run))
  const years = run.timeline.map((c) => c.year)
  assert.deepEqual(years, [...years].sort((a, b) => a - b))
})

test('the timeline stays sorted across a whole run', () => {
  let run = startRun(events, 99)
  while (run.status === 'playing') {
    run = placeCard(run, correctSlot(run.timeline, run.current))
    const years = run.timeline.map((c) => c.year)
    assert.deepEqual(years, [...years].sort((a, b) => a - b))
  }
})

test('placing perfectly clears the run and collects every card', () => {
  let run = startRun(events, 5)
  while (run.status === 'playing') {
    run = placeCard(run, correctSlot(run.timeline, run.current))
  }
  assert.equal(run.status, 'cleared')
  assert.equal(run.lives, LIVES)
  assert.equal(run.timeline.length, events.length)
  assert.equal(run.placed.length, events.length - 1) // minus the seeded card
})

test('three mistakes ends the run', () => {
  let run = startRun(events, 3)
  for (let i = 0; i < LIVES; i++) {
    run = placeCard(run, wrongSlot(run))
  }
  assert.equal(run.status, 'lost')
  assert.equal(run.lives, 0)
})

test('placing into a finished run is a no-op', () => {
  let run = { ...startRun(events, 1), status: 'lost' }
  assert.equal(placeCard(run, 0), run)
})

test('placeCard does not mutate the run it is given', () => {
  const run = startRun(events, 11)
  const snapshot = JSON.stringify(run)
  placeCard(run, correctSlot(run.timeline, run.current))
  assert.equal(JSON.stringify(run), snapshot)
})

test('the same seed always deals the same run', () => {
  const a = startRun(events, hashSeed('2026-08-23'))
  const b = startRun(events, hashSeed('2026-08-23'))
  assert.deepEqual(a.deck.map((c) => c.id), b.deck.map((c) => c.id))
  assert.notDeepEqual(
    a.deck.map((c) => c.id),
    startRun(events, hashSeed('2026-08-24')).deck.map((c) => c.id)
  )
})

test('the deck deals easy tiers before hard ones', () => {
  const tiers = buildDeck(events, mulberry32(123)).map((c) => c.tier)
  assert.deepEqual(tiers, [...tiers].sort((a, b) => a - b))
})

test('the deck deals every event exactly once', () => {
  const deck = buildDeck(events, mulberry32(8))
  assert.equal(deck.length, events.length)
  assert.equal(new Set(deck.map((c) => c.id)).size, events.length)
})

test('mulberry32 stays inside [0, 1)', () => {
  const rand = mulberry32(2024)
  for (let i = 0; i < 1000; i++) {
    const n = rand()
    assert.ok(n >= 0 && n < 1)
  }
})

test('the streak multiplier climbs then caps', () => {
  assert.equal(streakMultiplier(0), 1)
  assert.equal(streakMultiplier(3), 2)
  assert.equal(streakMultiplier(100), 5)
  assert.ok(pointsFor(6) > pointsFor(0))
})

test('mergeRun folds a run into saved progress without losing cards', () => {
  const before = { ...emptyProgress, collected: ['moon-landing'], bestScore: 500, runs: 2 }
  const run = { placed: ['moon-landing', 'hastings'], score: 300, bestStreak: 4 }
  const after = mergeRun(before, run)
  assert.deepEqual([...after.collected].sort(), ['hastings', 'moon-landing'])
  assert.equal(after.bestScore, 500)
  assert.equal(after.bestStreak, 4)
  assert.equal(after.runs, 3)
})
