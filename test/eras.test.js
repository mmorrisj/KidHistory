import test from 'node:test'
import assert from 'node:assert/strict'
import { eraOf, eraStyle, ERAS } from '../src/game/eras.js'
import events from '../src/content/events.json' with { type: 'json' }

test('eras are ordered and cover every year without a gap', () => {
  const bounds = ERAS.map((e) => e.until)
  assert.deepEqual(bounds, [...bounds].sort((a, b) => a - b))
  assert.equal(bounds.at(-1), Infinity)
})

test('era keys, hues and labels are unique', () => {
  for (const field of ['key', 'hue', 'label', 'short']) {
    assert.equal(new Set(ERAS.map((e) => e[field])).size, ERAS.length, `${field} repeats`)
  }
})

test('eraOf picks the era each year falls in', () => {
  assert.equal(eraOf(-2560).key, 'ancient')
  assert.equal(eraOf(79).key, 'ancient')
  assert.equal(eraOf(500).key, 'medieval')
  assert.equal(eraOf(1449).key, 'medieval')
  assert.equal(eraOf(1450).key, 'earlymod')
  assert.equal(eraOf(1799).key, 'earlymod')
  assert.equal(eraOf(1800).key, 'indust')
  assert.equal(eraOf(1900).key, 'modern')
  assert.equal(eraOf(2020).key, 'today')
})

test('every event in the pack lands in an era', () => {
  for (const e of events) {
    assert.ok(eraOf(e.year)?.key, `${e.id} has no era`)
  }
})

test('the pack spans at least five of the six eras', () => {
  const used = new Set(events.map((e) => eraOf(e.year).key))
  assert.ok(used.size >= 5, `only ${used.size} eras represented`)
})

test('eraStyle returns the custom properties the CSS expects', () => {
  const style = eraStyle(1969)
  for (const prop of ['--era-h', '--era-edge', '--era-glow', '--era-wash']) {
    assert.ok(style[prop] !== undefined, `missing ${prop}`)
  }
  assert.equal(style['--era-h'], eraOf(1969).hue)
})
