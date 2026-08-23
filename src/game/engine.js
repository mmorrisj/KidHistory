// Pure game logic. No React, no DOM, no storage — everything here is a plain
// function of its inputs so it can be tested directly.

export const LIVES = 3
export const SEED_CARDS = 1
export const BASE_POINTS = 100
export const STREAK_BONUS = 25
export const MAX_STREAK_MULTIPLIER = 5

/** Deterministic PRNG so a given seed always deals the same run. */
export function mulberry32(seed) {
  let a = seed >>> 0
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Turns any string into a 32-bit seed, so "2026-08-23" can seed a daily run. */
export function hashSeed(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function shuffle(items, rand) {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Builds a draw pile that eases players in: tier 1 events (famous, widely
 * spaced) come first, then tier 2, then tier 3. Within a tier the order is
 * shuffled, so runs stay fresh while difficulty still ramps.
 */
export function buildDeck(events, rand) {
  const byTier = [1, 2, 3].map((tier) =>
    shuffle(events.filter((e) => e.tier === tier), rand)
  )
  return byTier.flat()
}

export function startRun(events, seed) {
  const rand = mulberry32(seed)
  const deck = buildDeck(events, rand)
  const timeline = deck.slice(0, SEED_CARDS).sort((a, b) => a.year - b.year)
  return {
    seed,
    deck: deck.slice(SEED_CARDS + 1),
    timeline,
    current: deck[SEED_CARDS] ?? null,
    lives: LIVES,
    score: 0,
    streak: 0,
    bestStreak: 0,
    placed: [],
    status: 'playing',
    lastResult: null,
  }
}

/**
 * A card belongs in slot `index` if it is not older than the card to its left
 * and not newer than the card to its right. Ties count as correct — two events
 * in the same year can legitimately go either side of each other.
 */
export function isCorrectSlot(timeline, card, index) {
  const before = timeline[index - 1]
  const after = timeline[index]
  if (before && before.year > card.year) return false
  if (after && after.year < card.year) return false
  return true
}

/** The slot the card should have gone in, used to show the player the answer. */
export function correctSlot(timeline, card) {
  let i = 0
  while (i < timeline.length && timeline[i].year <= card.year) i++
  return i
}

export function streakMultiplier(streak) {
  return Math.min(1 + Math.floor(streak / 3), MAX_STREAK_MULTIPLIER)
}

export function pointsFor(streak) {
  return BASE_POINTS * streakMultiplier(streak) + STREAK_BONUS * streak
}

/** Applies a placement and returns the next run state. Never mutates `run`. */
export function placeCard(run, index) {
  if (run.status !== 'playing' || !run.current) return run

  const card = run.current
  const correct = isCorrectSlot(run.timeline, card, index)
  const landedAt = correct ? index : correctSlot(run.timeline, card)

  const timeline = [...run.timeline]
  timeline.splice(landedAt, 0, card)

  const streak = correct ? run.streak + 1 : 0
  const lives = correct ? run.lives : run.lives - 1
  const score = correct ? run.score + pointsFor(run.streak) : run.score

  const [next, ...rest] = run.deck
  const outOfCards = next === undefined

  return {
    ...run,
    timeline,
    deck: rest,
    current: outOfCards ? null : next,
    lives,
    score,
    streak,
    bestStreak: Math.max(run.bestStreak, streak),
    placed: correct ? [...run.placed, card.id] : run.placed,
    status: lives <= 0 ? 'lost' : outOfCards ? 'cleared' : 'playing',
    lastResult: { card, correct, attemptedIndex: index, landedAt },
  }
}

export function isOver(run) {
  return run.status !== 'playing'
}
