import { useMemo, useState } from 'react'
import { formatYear } from './format.js'

/**
 * The long-term hook: every card you place correctly is yours to keep and
 * re-read. Cards you have not earned stay locked, so the collection doubles as
 * a map of what is still out there.
 */
export default function Collection({ events, collected, onBack }) {
  const [category, setCategory] = useState('all')
  const owned = useMemo(() => new Set(collected), [collected])

  const categories = useMemo(
    () => ['all', ...[...new Set(events.map((e) => e.category))].sort()],
    [events]
  )

  const shown = useMemo(() => {
    const list = category === 'all' ? events : events.filter((e) => e.category === category)
    return [...list].sort((a, b) => a.year - b.year)
  }, [events, category])

  const ownedShown = shown.filter((e) => owned.has(e.id)).length

  return (
    <div className="screen screen--collection">
      <header className="collection__head">
        <button className="btn btn--ghost btn--small" onClick={onBack}>← Menu</button>
        <h2>Collection</h2>
        <p className="collection__count">{ownedShown}/{shown.length}</p>
      </header>

      <div className="chips" role="group" aria-label="Filter by category">
        {categories.map((c) => (
          <button
            key={c}
            className={`chip ${c === category ? 'chip--on' : ''}`}
            onClick={() => setCategory(c)}
            aria-pressed={c === category}
          >
            {c}
          </button>
        ))}
      </div>

      <ul className="collection__list">
        {shown.map((event) => {
          const have = owned.has(event.id)
          return (
            <li key={event.id} className={`entry ${have ? '' : 'entry--locked'}`}>
              <span className="entry__emoji" aria-hidden="true">{have ? event.emoji : '🔒'}</span>
              <div>
                <p className="entry__year">{have ? formatYear(event.year) : '????'}</p>
                <h3 className="entry__title">{have ? event.title : 'Not found yet'}</h3>
                {have && <p className="entry__blurb">{event.blurb}</p>}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
