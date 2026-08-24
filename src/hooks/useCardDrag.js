import { useCallback, useEffect, useRef, useState } from 'react'

const DRAG_THRESHOLD = 6      // px of movement before a press becomes a drag
const EDGE = 70               // px from the edge where the strip auto-scrolls
const EDGE_SPEED = 14

/**
 * Drag-to-place built on pointer events, so one code path covers mouse, touch
 * and pen. Tapping a slot still works and remains the keyboard-accessible
 * route — dragging is an addition, never the only way in.
 */
export function useCardDrag({ onDrop, scrollerRef, enabled }) {
  const [drag, setDrag] = useState(null) // { x, y, slot } once past threshold
  const origin = useRef(null)
  const scrollTimer = useRef(0)

  const stopScrolling = useCallback(() => {
    if (scrollTimer.current) {
      cancelAnimationFrame(scrollTimer.current)
      scrollTimer.current = 0
    }
  }, [])

  // Nudge the timeline sideways while the pointer sits near an edge, so long
  // timelines stay reachable mid-drag.
  const edgeScroll = useCallback(
    (clientX) => {
      const el = scrollerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      let dx = 0
      if (clientX < rect.left + EDGE) dx = -EDGE_SPEED
      else if (clientX > rect.right - EDGE) dx = EDGE_SPEED

      stopScrolling()
      if (!dx) return
      const tick = () => {
        el.scrollLeft += dx
        scrollTimer.current = requestAnimationFrame(tick)
      }
      scrollTimer.current = requestAnimationFrame(tick)
    },
    [scrollerRef, stopScrolling]
  )

  const slotUnder = (x, y) => {
    const hit = document.elementFromPoint(x, y)?.closest('[data-slot]')
    return hit ? Number(hit.dataset.slot) : null
  }

  const onPointerDown = useCallback(
    (event) => {
      if (!enabled || event.button > 0) return
      origin.current = { x: event.clientX, y: event.clientY, id: event.pointerId }
      event.currentTarget.setPointerCapture?.(event.pointerId)
    },
    [enabled]
  )

  const onPointerMove = useCallback(
    (event) => {
      const from = origin.current
      if (!from || event.pointerId !== from.id) return

      const dx = event.clientX - from.x
      const dy = event.clientY - from.y
      if (!drag && Math.hypot(dx, dy) < DRAG_THRESHOLD) return

      event.preventDefault()
      edgeScroll(event.clientX)
      setDrag({ x: event.clientX, y: event.clientY, slot: slotUnder(event.clientX, event.clientY) })
    },
    [drag, edgeScroll]
  )

  const finish = useCallback(
    (event) => {
      const from = origin.current
      origin.current = null
      stopScrolling()
      if (!from || (event && event.pointerId !== from.id)) return

      const landed = drag?.slot
      setDrag(null)
      if (landed !== null && landed !== undefined) onDrop(landed)
    },
    [drag, onDrop, stopScrolling]
  )

  // A drag must not survive the card being swapped out from under it.
  useEffect(() => {
    if (!enabled) {
      origin.current = null
      stopScrolling()
      setDrag(null)
    }
  }, [enabled, stopScrolling])

  useEffect(() => stopScrolling, [stopScrolling])

  return {
    drag,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finish,
      onPointerCancel: finish,
    },
  }
}
