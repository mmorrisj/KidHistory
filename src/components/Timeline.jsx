import { useEffect, useRef } from 'react'
import EventCard from './EventCard.jsx'
import { eraOf } from '../game/eras.js'

/**
 * The timeline reads left to right, oldest first, with a tappable gap between
 * every pair of cards. Two ways in: tap a gap, or drag the card onto one.
 */
export default function Timeline({
  timeline, onPlace, disabled, lastResult, scrollerRef, hoveredSlot, dragging,
}) {
  const landed = useRef(null)

  // Keep the card that was just placed in view; the strip gets wide fast.
  useEffect(() => {
    if (landed.current) {
      landed.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [lastResult])

  const slot = (index) => (
    <button
      key={`slot-${index}`}
      type="button"
      data-slot={index}
      className={`slot ${hoveredSlot === index ? 'slot--hot' : ''} ${dragging ? 'slot--armed' : ''}`}
      onClick={() => onPlace(index)}
      disabled={disabled}
      aria-label={slotLabel(timeline, index)}
    >
      <span className="slot__tick" aria-hidden="true" />
      <span className="slot__plus" aria-hidden="true">+</span>
    </button>
  )

  return (
    <div className="timeline" ref={scrollerRef}>
      <div className="timeline__track" role="list">
        <span className="timeline__rail" aria-hidden="true" />
        <span className="timeline__end" aria-hidden="true">◀ older</span>
        {slot(0)}
        {timeline.map((event, i) => {
          const justLanded = lastResult?.card.id === event.id
          const era = eraOf(event.year)
          const newEra = i === 0 || eraOf(timeline[i - 1].year).key !== era.key
          return [
            <div
              key={event.id}
              role="listitem"
              ref={justLanded ? landed : null}
              className={
                'timeline__item' +
                (justLanded ? (lastResult.correct ? ' is-correct' : ' is-wrong') : '')
              }
              style={{ '--era-h': era.hue }}
            >
              {newEra && <span className="timeline__era" style={{ '--era-h': era.hue }}>{era.label}</span>}
              <EventCard event={event} compact tone="placed" />
            </div>,
            slot(i + 1),
          ]
        })}
        <span className="timeline__end" aria-hidden="true">newer ▶</span>
      </div>
    </div>
  )
}

function slotLabel(timeline, index) {
  const before = timeline[index - 1]
  const after = timeline[index]
  if (!before && !after) return 'Place the first card'
  if (!before) return `Place before "${after.title}"`
  if (!after) return `Place after "${before.title}"`
  return `Place between "${before.title}" and "${after.title}"`
}
