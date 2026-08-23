import { ERAS } from '../game/eras.js'

export default function StartScreen({
  progress, total, dailyPlayed, muted, onToggleMute, onStart, onCollection,
}) {
  const collected = progress.collected.length
  const pct = Math.round((collected / total) * 100)

  return (
    <div className="screen screen--start">
      <button className="icon-btn icon-btn--corner" onClick={onToggleMute} aria-label={muted ? 'Turn sound on' : 'Turn sound off'}>
        {muted ? '🔇' : '🔊'}
      </button>

      <div className="hero">
        <h1 className="logo">Kid<span>History</span></h1>
        <p className="tagline">Put history in order. How far can you get?</p>
        <div className="era-strip" aria-hidden="true">
          {ERAS.map((era) => (
            <span key={era.key} className="era-strip__band" style={{ '--era-h': era.hue }}>
              {era.label}
            </span>
          ))}
        </div>
      </div>

      <div className="menu">
        <button className="btn btn--primary" onClick={() => onStart('endless')}>
          <span>Play</span>
        </button>
        <button className="btn" onClick={() => onStart('daily')} disabled={dailyPlayed}>
          {dailyPlayed ? "Today's challenge done ✓" : "Today's challenge"}
        </button>
        <button className="btn btn--ghost" onClick={onCollection}>
          Collection · {collected}/{total}
          <span className="btn__meter" aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>
        </button>
      </div>

      {progress.runs > 0 && (
        <dl className="stats">
          <div><dt>Best score</dt><dd>{progress.bestScore.toLocaleString()}</dd></div>
          <div><dt>Best streak</dt><dd>{progress.bestStreak}</dd></div>
          <div><dt>Games</dt><dd>{progress.runs}</dd></div>
        </dl>
      )}

      <details className="how">
        <summary>How to play</summary>
        <ol>
          <li>You get an event card, but not its date.</li>
          <li><strong>Drag</strong> it onto the timeline, or tap a <strong>+</strong> gap, where you think it belongs.</li>
          <li>Right, and it locks in and joins your collection. Wrong, and you see where it really goes and lose a heart.</li>
          <li>Three hearts. Three in a row starts a score multiplier.</li>
        </ol>
      </details>
    </div>
  )
}
