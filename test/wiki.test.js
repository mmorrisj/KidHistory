import test from 'node:test'
import assert from 'node:assert/strict'
import { wikiUrl } from '../src/game/wiki.js'
import events from '../src/content/events.json' with { type: 'json' }

test('every event carries a wiki term', () => {
  for (const e of events) {
    assert.equal(typeof e.wiki, 'string', `${e.id} has no wiki term`)
    assert.ok(e.wiki.trim().length > 0, `${e.id} has an empty wiki term`)
  }
})

test('wiki terms are search phrases, not URLs or slugs', () => {
  for (const e of events) {
    assert.ok(!/^https?:/i.test(e.wiki), `${e.id} stores a URL; store the term only`)
    assert.ok(!e.wiki.includes('_'), `${e.id} looks like a slug; use spaces`)
    assert.ok(!e.wiki.includes('/'), `${e.id} contains a path separator`)
    assert.equal(e.wiki, e.wiki.trim(), `${e.id} has surrounding whitespace`)
  }
})

test('wiki terms are distinct, so no two cards lead to the same page', () => {
  const seen = new Set(events.map((e) => e.wiki.toLowerCase()))
  assert.equal(seen.size, events.length)
})

test('wikiUrl builds an encoded https en.wikipedia.org link', () => {
  const url = wikiUrl({ wiki: 'Nicolaus Copernicus' })
  assert.ok(url.startsWith('https://en.wikipedia.org/'), url)
  assert.ok(url.endsWith('Nicolaus%20Copernicus'), url)
})

test('wikiUrl round-trips terms with punctuation', () => {
  // The pack contains apostrophes, commas and parentheses. encodeURIComponent
  // leaves apostrophes and parentheses alone -- they are legal in a path -- so
  // the assertion that matters is that the term survives decoding intact.
  for (const term of [
    "Women's suffrage in New Zealand",
    'Jamestown, Virginia',
    'Curiosity (rover)',
    'Hijra (Islam)',
  ]) {
    const url = wikiUrl({ wiki: term })
    assert.ok(!url.includes(' '), `spaces must be encoded: ${url}`)
    const last = new URL(url).pathname.split('/').pop()
    assert.equal(decodeURIComponent(last), term)
  }
})

test('every event in the pack produces a parseable https URL', () => {
  for (const e of events) {
    const url = wikiUrl(e)
    const parsed = new URL(url)
    assert.equal(parsed.protocol, 'https:', `${e.id}`)
    assert.equal(parsed.hostname, 'en.wikipedia.org', `${e.id}`)
    assert.ok(!/[ "<>]/.test(url), `${e.id} produced an unescaped URL: ${url}`)
  }
})

test('wikiUrl returns null rather than a broken link when the term is absent', () => {
  assert.equal(wikiUrl({}), null)
  assert.equal(wikiUrl(null), null)
  assert.equal(wikiUrl({ wiki: '' }), null)
})
