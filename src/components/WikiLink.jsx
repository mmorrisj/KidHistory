import { wikiUrl } from '../game/wiki.js'

/**
 * Opens in a new tab on purpose: mid-game the run lives only in memory, so
 * navigating away would throw it away. noreferrer/noopener because the tab is
 * external.
 */
export default function WikiLink({ event, className = '' }) {
  const href = wikiUrl(event)
  if (!href) return null
  return (
    <a
      className={`wiki-link ${className}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
    >
      Read more on Wikipedia
      <span aria-hidden="true"> ↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}
