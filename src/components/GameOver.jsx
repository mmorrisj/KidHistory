import EventCard from './EventCard.jsx'
import { formatYear } from './format.js'

export default function GameOver({ run, isNewBest, onAgain, onMenu, onCollection }) {
  const cleared = run.status === 'cleared'
  return (
    <div className="screen screen--over">
      <h2 className="over__title">{cleared ? 'You cleared the deck! 🏆' : 'Out of hearts'}</h2>
      {isNewBest && <p className="over__best">New best score! 🎉</p>}

      <dl className="stats stats--big">
        <div><dt>Score</dt><dd>{run.score.toLocaleString()}</dd></div>
        <div><dt>Best streak</dt><dd>{run.bestStreak}</dd></div>
        <div><dt>Placed</dt><dd>{run.placed.length}</dd></div>
      </dl>

      {run.lastResult && !run.lastResult.correct && (
        <p className="over__last">
          The last one, <strong>{run.lastResult.card.title}</strong>, was{' '}
          {formatYear(run.lastResult.card.year)}.
        </p>
      )}

      {/* The timeline you built is the thing worth looking back at. */}
      <section className="over__review">
        <h3>Your timeline</h3>
        <div className="over__strip">
          {run.timeline.map((event) => (
            <EventCard key={event.id} event={event} compact tone="placed" />
          ))}
        </div>
      </section>

      <div className="menu menu--row">
        <button className="btn btn--primary" onClick={onAgain}>Play again</button>
        <button className="btn" onClick={onCollection}>Collection</button>
        <button className="btn btn--ghost" onClick={onMenu}>Menu</button>
      </div>
    </div>
  )
}
