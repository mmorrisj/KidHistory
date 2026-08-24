import test from 'node:test'
import assert from 'node:assert/strict'
import events from '../src/content/events.json' with { type: 'json' }

const CURRENT_YEAR = 2026
const REQUIRED = ['id', 'year', 'title', 'blurb', 'category', 'region', 'tier', 'emoji']

test('the pack is big enough for a real run', () => {
  assert.ok(events.length >= 40, `only ${events.length} events`)
})

test('every event has every required field', () => {
  for (const e of events) {
    for (const field of REQUIRED) {
      assert.ok(e[field] !== undefined && e[field] !== '', `${e.id} is missing ${field}`)
    }
  }
})

test('ids are unique', () => {
  assert.equal(new Set(events.map((e) => e.id)).size, events.length)
})

test('years are whole numbers inside recorded history', () => {
  for (const e of events) {
    assert.equal(Number.isInteger(e.year), true, `${e.id} has a non-integer year`)
    assert.ok(e.year > -4000 && e.year <= CURRENT_YEAR, `${e.id} has an out-of-range year`)
  }
})

test('tiers are 1, 2 or 3 and each tier has enough cards', () => {
  const counts = { 1: 0, 2: 0, 3: 0 }
  for (const e of events) {
    assert.ok([1, 2, 3].includes(e.tier), `${e.id} has tier ${e.tier}`)
    counts[e.tier]++
  }
  for (const tier of [1, 2, 3]) {
    assert.ok(counts[tier] >= 10, `tier ${tier} only has ${counts[tier]} cards`)
  }
})

test('blurbs stay short enough to read on a phone', () => {
  for (const e of events) {
    assert.ok(e.title.length <= 60, `${e.id} title is ${e.title.length} chars`)
    assert.ok(e.blurb.length <= 220, `${e.id} blurb is ${e.blurb.length} chars`)
  }
})

test('the pack spans several regions and categories', () => {
  assert.ok(new Set(events.map((e) => e.region)).size >= 4)
  assert.ok(new Set(events.map((e) => e.category)).size >= 6)
})

test('no two events in the same year are indistinguishable to a player', () => {
  const byYear = new Map()
  for (const e of events) {
    byYear.set(e.year, (byYear.get(e.year) ?? 0) + 1)
  }
  for (const [year, count] of byYear) {
    assert.ok(count <= 2, `${count} events share the year ${year}`)
  }
})
