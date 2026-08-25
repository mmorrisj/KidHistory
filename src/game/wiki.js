// Wikipedia links are built here and nowhere else, so the URL form is one
// line to change.
//
// Special:Search rather than /wiki/<Title>: Special:Search jumps straight to
// the article when the term matches one, and falls back to search results
// when it does not. A slightly wrong title therefore lands a curious kid on
// a list of relevant articles instead of Wikipedia's "there is no article
// with this exact name" dead end. The terms in events.json were written by
// hand and have not been checked against the live site, so the graceful
// fallback is doing real work. Switch to /wiki/ once they are verified.
const BASE = 'https://en.wikipedia.org/wiki/Special:Search/'

export function wikiUrl(event) {
  if (!event?.wiki) return null
  return BASE + encodeURIComponent(event.wiki)
}
