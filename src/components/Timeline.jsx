import { useEffect, useRef } from 'react'
import EventCard from './EventCard.jsx'

/**
 * The timeline reads left to right, oldest first, with a tappable gap between
 * every pair of cards. Tapping a gap is how you place the current card —
 * chosen over drag-and-drop because it works on touch and with a keyboard.
 */
export default function Timeline({ timeline, onPlace, disabled, lastResult }) {
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
      className="slot"
      onClick={() => onPlace(index)}
      disabled={disabled}
      aria-label={slotLabel(timeline, index)}
    >
      <span className="slot__tick" aria-hidden="true" />
      <span className="slot__plus" aria-hidden="true">+</span>
    </button>
  )

  return (
    <div className="timeline">
      <div className="timeline__track" role="list">
        <span className="timeline__rail" aria-hidden="true" />
        <span className="timeline__end" aria-hidden="true">◀ older</span>
        {slot(0)}
        {timeline.map((event, i) => {
          const justLanded = lastResult?.card.id === event.id
          return [
            <div
              key={event.id}
              role="listitem"
              ref={justLanded ? landed : null}
              className={
                'timeline__item' +
                (justLanded ? (lastResult.correct ? ' is-correct' : ' is-wrong') : '')
              }
            >
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
