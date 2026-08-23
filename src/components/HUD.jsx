import { useEffect, useRef, useState } from 'react'
import { LIVES, streakMultiplier } from '../game/engine.js'

/** Rolls a number up to its new value so scoring feels earned, not assigned. */
function useCountUp(value, ms = 450) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)

  useEffect(() => {
    const start = performance.now()
    const begin = from.current
    if (begin === value) return

    let raf = 0
    const tick = (now) => {
      const t = Math.min((now - start) / ms, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setShown(Math.round(begin + (value - begin) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
      else from.current = value
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, ms])

  return shown
}

export default function HUD({ run, total, cardsLeft, muted, onToggleMute, onQuit }) {
  const score = useCountUp(run.score)
  const multiplier = streakMultiplier(run.streak)
  const progress = ((total - cardsLeft) / total) * 100

  return (
    <header className="hud">
      <div className="hud__row">
        <button className="icon-btn" onClick={onQuit} aria-label="Back to menu">←</button>

        <p className="hud__lives" aria-label={`${run.lives} of ${LIVES} lives left`}>
          {Array.from({ length: LIVES }, (_, i) => (
            <span key={i} className={`heart ${i < run.lives ? '' : 'heart--lost'}`} aria-hidden="true">
              {i < run.lives ? '❤️' : '🖤'}
            </span>
          ))}
        </p>

        {run.streak >= 3 && (
          <p className="hud__streak" aria-label={`Streak of ${run.streak}`}>
            <span aria-hidden="true">🔥</span> {run.streak}
          </p>
        )}

        <p className="hud__score">
          <strong>{score.toLocaleString()}</strong>
          {multiplier > 1 && <span className="hud__multiplier">×{multiplier}</span>}
        </p>

        <button
          className="icon-btn"
          onClick={onToggleMute}
          aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
          aria-pressed={muted}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      <div className="hud__progress" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Cards placed">
        <span style={{ width: `${progress}%` }} />
      </div>
    </header>
  )
}
