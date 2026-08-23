import { eraOf, eraStyle } from '../game/eras.js'
import { formatYear } from './format.js'

/**
 * One event. `reveal` controls whether the year is shown — it stays hidden on
 * the card being placed, since guessing the order is the whole game. The card
 * takes its colour from its era, so a placed timeline reads as coloured bands.
 */
export default function EventCard({ event, reveal = true, tone = 'placed', compact = false, style }) {
  const era = eraOf(event.year)
  return (
    <article
      className={`card card--${tone} ${compact ? 'card--compact' : ''}`}
      style={{ ...(reveal ? eraStyle(event.year) : null), ...style }}
    >
      <span className="card__emoji" aria-hidden="true">{event.emoji}</span>
      <div className="card__body">
        {reveal ? (
          <p className="card__year">
            {formatYear(event.year)}
            <span className="card__era">{era.short}</span>
          </p>
        ) : (
          <p className="card__year card__year--hidden">? ? ? ?</p>
        )}
        <h3 className="card__title">{event.title}</h3>
        {!compact && <p className="card__blurb">{event.blurb}</p>}
      </div>
    </article>
  )
}
