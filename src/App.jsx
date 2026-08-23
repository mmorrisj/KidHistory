import { useCallback, useEffect, useMemo, useState } from 'react'
import events from './content/events.json'
import { startRun, placeCard, hashSeed, isOver } from './game/engine.js'
import { loadProgress, saveProgress, mergeRun, todayKey } from './game/storage.js'
import StartScreen from './components/StartScreen.jsx'
import Collection from './components/Collection.jsx'
import GameOver from './components/GameOver.jsx'
import Timeline from './components/Timeline.jsx'
import EventCard from './components/EventCard.jsx'
import HUD from './components/HUD.jsx'
import { formatYear } from './components/format.js'

// How long the right/wrong banner stays up before the next card is dealt.
const FEEDBACK_MS = 1600

export default function App() {
  const [screen, setScreen] = useState('home')
  const [progress, setProgress] = useState(loadProgress)
  const [run, setRun] = useState(null)
  const [mode, setMode] = useState('endless')
  const [feedback, setFeedback] = useState(null)

  const today = todayKey()
  const dailyPlayed = progress.dailyDone === today

  useEffect(() => saveProgress(progress), [progress])

  const start = useCallback((nextMode) => {
    const seed = nextMode === 'daily' ? hashSeed(today) : (Math.random() * 2 ** 32) >>> 0
    setMode(nextMode)
    setRun(startRun(events, seed))
    setFeedback(null)
    setScreen('play')
  }, [today])

  const place = useCallback(
    (index) => {
      if (!run || feedback) return
      const next = placeCard(run, index)
      setRun(next)
      setFeedback(next.lastResult)
    },
    [run, feedback]
  )

  // Clear the banner a moment after a placement, and bank the run if it ended.
  useEffect(() => {
    if (!feedback || !run) return
    const timer = setTimeout(() => {
      setFeedback(null)
      if (isOver(run)) {
        setProgress((p) => mergeRun(p, run, { daily: mode === 'daily' ? today : null }))
        setScreen('over')
      }
    }, FEEDBACK_MS)
    return () => clearTimeout(timer)
  }, [feedback, run, mode, today])

  const isNewBest = useMemo(
    () => Boolean(run) && run.score > 0 && run.score >= progress.bestScore,
    [run, progress.bestScore]
  )

  if (screen === 'collection') {
    return (
      <Collection
        events={events}
        collected={progress.collected}
        onBack={() => setScreen('home')}
      />
    )
  }

  if (screen === 'over' && run) {
    return (
      <GameOver
        run={run}
        isNewBest={isNewBest}
        onAgain={() => start(mode === 'daily' ? 'endless' : mode)}
        onMenu={() => setScreen('home')}
        onCollection={() => setScreen('collection')}
      />
    )
  }

  if (screen === 'play' && run) {
    return (
      <div className="screen screen--play">
        <HUD run={run} cardsLeft={run.deck.length + (run.current ? 1 : 0)} onQuit={() => setScreen('home')} />

        <Timeline
          timeline={run.timeline}
          onPlace={place}
          disabled={Boolean(feedback) || !run.current}
          lastResult={feedback}
        />

        <footer className="dock">
          {feedback ? (
            <div className={`banner ${feedback.correct ? 'banner--good' : 'banner--bad'}`} role="status">
              <p className="banner__verdict">{feedback.correct ? 'Correct!' : 'Not quite'}</p>
              <p className="banner__detail">
                <strong>{feedback.card.title}</strong> — {formatYear(feedback.card.year)}
              </p>
              <p className="banner__blurb">{feedback.card.blurb}</p>
            </div>
          ) : run.current ? (
            <>
              <p className="dock__prompt">Where does this go?</p>
              <EventCard event={run.current} reveal={false} tone="hand" />
            </>
          ) : null}
        </footer>
      </div>
    )
  }

  return (
    <StartScreen
      progress={progress}
      total={events.length}
      dailyPlayed={dailyPlayed}
      onStart={start}
      onCollection={() => setScreen('collection')}
    />
  )
}
