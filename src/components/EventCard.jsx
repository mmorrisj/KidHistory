import { formatYear } from './format.js'

/**
 * One event. `reveal` controls whether the year is shown — it stays hidden on
 * the card being placed, since guessing the order is the whole game.
 */
export default function EventCard({ event, reveal = true, tone = 'placed', compact = false }) {
  return (
    <article className={`card card--${tone} ${compact ? 'card--compact' : ''}`}>
      <span className="card__emoji" aria-hidden="true">{event.emoji}</span>
      <div className="card__body">
        {reveal && <p className="card__year">{formatYear(event.year)}</p>}
        <h3 className="card__title">{event.title}</h3>
        {!compact && <p className="card__blurb">{event.blurb}</p>}
      </div>
    </article>
  )
}
