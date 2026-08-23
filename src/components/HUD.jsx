import { LIVES, streakMultiplier } from '../game/engine.js'

export default function HUD({ run, cardsLeft, onQuit }) {
  const multiplier = streakMultiplier(run.streak)
  return (
    <header className="hud">
      <button className="btn btn--ghost btn--small" onClick={onQuit}>← Menu</button>
      <p className="hud__lives" aria-label={`${run.lives} of ${LIVES} lives left`}>
        {Array.from({ length: LIVES }, (_, i) => (
          <span key={i} className={i < run.lives ? 'heart' : 'heart heart--lost'} aria-hidden="true">
            {i < run.lives ? '❤️' : '🖤'}
          </span>
        ))}
      </p>
      <p className="hud__score">
        <strong>{run.score.toLocaleString()}</strong>
        {multiplier > 1 && <span className="hud__multiplier">×{multiplier}</span>}
      </p>
      <p className="hud__left">{cardsLeft} left</p>
    </header>
  )
}
