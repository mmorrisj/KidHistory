export default function StartScreen({ progress, total, dailyPlayed, onStart, onCollection }) {
  const collected = progress.collected.length
  return (
    <div className="screen screen--start">
      <h1 className="logo">Kid<span>History</span></h1>
      <p className="tagline">Put history in order. How far can you get?</p>

      <div className="menu">
        <button className="btn btn--primary" onClick={() => onStart('endless')}>
          Play
        </button>
        <button className="btn" onClick={() => onStart('daily')} disabled={dailyPlayed}>
          {dailyPlayed ? "Today's challenge done ✓" : "Today's challenge"}
        </button>
        <button className="btn btn--ghost" onClick={onCollection}>
          Collection · {collected}/{total}
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
          <li>Tap a <strong>+</strong> gap to slot it into the timeline where you think it belongs.</li>
          <li>Right, and it locks in and joins your collection. Wrong, and you see where it really goes and lose a heart.</li>
          <li>Three hearts. Get three in a row for a score multiplier.</li>
        </ol>
      </details>
    </div>
  )
}
