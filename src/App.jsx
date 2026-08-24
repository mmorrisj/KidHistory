import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import events from './content/events.json'
import { startRun, placeCard, hashSeed, isOver } from './game/engine.js'
import { loadProgress, saveProgress, mergeRun, todayKey } from './game/storage.js'
import { burst } from './game/confetti.js'
import { eraOf } from './game/eras.js'
import * as sound from './game/sound.js'
import { useCardDrag } from './hooks/useCardDrag.js'
import StartScreen from './components/StartScreen.jsx'
import Collection from './components/Collection.jsx'
import GameOver from './components/GameOver.jsx'
import Timeline from './components/Timeline.jsx'
import EventCard from './components/EventCard.jsx'
import HUD from './components/HUD.jsx'
import { formatYear } from './components/format.js'

// How long the right/wrong banner stays up before the next card is dealt.
const FEEDBACK_MS = 1900

export default function App() {
  const [screen, setScreen] = useState('home')
  const [progress, setProgress] = useState(loadProgress)
  const [run, setRun] = useState(null)
  const [mode, setMode] = useState('endless')
  const [feedback, setFeedback] = useState(null)
  const [muted, setMuted] = useState(sound.isMuted)

  const scroller = useRef(null)
  const canvas = useRef(null)

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
      if (!run || feedback || !run.current) return
      const next = placeCard(run, index)
      setRun(next)
      setFeedback(next.lastResult)

      if (next.lastResult.correct) {
        sound.playCorrect(run.streak)
        burst(canvas.current, {
          x: window.innerWidth / 2,
          y: window.innerHeight * 0.62,
          count: 18 + Math.min(run.streak, 8) * 4,
          hue: eraOf(next.lastResult.card.year).hue,
        })
      } else {
        sound.playWrong()
      }
    },
    [run, feedback]
  )

  const canDrag = Boolean(run?.current) && !feedback
  const { drag, handlers } = useCardDrag({ onDrop: place, scrollerRef: scroller, enabled: canDrag })

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

  // Celebrate a record once the results screen is actually on show.
  useEffect(() => {
    if (screen !== 'over' || !isNewBest) return
    sound.playFanfare()
    const stop = burst(canvas.current, {
      x: window.innerWidth / 2, y: window.innerHeight * 0.35, count: 90, power: 13,
    })
    return stop
  }, [screen, isNewBest])

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      sound.setMuted(!m)
      if (m) sound.playPickup() // unmuting: confirm it is audible again
      return !m
    })
  }, [])

  const overlay = <canvas ref={canvas} className="fx" aria-hidden="true" />

  if (screen === 'collection') {
    return (
      <>
        <Collection events={events} collected={progress.collected} onBack={() => setScreen('home')} />
        {overlay}
      </>
    )
  }

  if (screen === 'over' && run) {
    return (
      <>
        <GameOver
          run={run}
          isNewBest={isNewBest}
          onAgain={() => start(mode === 'daily' ? 'endless' : mode)}
          onMenu={() => setScreen('home')}
          onCollection={() => setScreen('collection')}
        />
        {overlay}
      </>
    )
  }

  if (screen === 'play' && run) {
    const cardsLeft = run.deck.length + (run.current ? 1 : 0)
    return (
      <div className="screen screen--play">
        <HUD
          run={run}
          total={events.length}
          cardsLeft={cardsLeft}
          muted={muted}
          onToggleMute={toggleMute}
          onQuit={() => setScreen('home')}
        />

        <Timeline
          timeline={run.timeline}
          onPlace={place}
          disabled={Boolean(feedback) || !run.current}
          lastResult={feedback}
          scrollerRef={scroller}
          hoveredSlot={drag?.slot ?? null}
          dragging={Boolean(drag)}
        />

        <footer className="dock">
          {feedback ? (
            <div className={`banner ${feedback.correct ? 'banner--good' : 'banner--bad'}`} role="status">
              <p className="banner__verdict">
                {feedback.correct ? `Correct!${run.streak >= 3 ? ` ${run.streak} in a row 🔥` : ''}` : 'Not quite'}
              </p>
              <p className="banner__detail">
                <strong>{feedback.card.title}</strong> — {formatYear(feedback.card.year)}
              </p>
              <p className="banner__blurb">{feedback.card.blurb}</p>
            </div>
          ) : run.current ? (
            <>
              <p className="dock__prompt">Drag it onto the line, or tap a <b>+</b></p>
              <div
                className={`hand ${drag ? 'hand--dragging' : ''}`}
                {...handlers}
                onPointerDown={(e) => { sound.playPickup(); handlers.onPointerDown(e) }}
              >
                <EventCard event={run.current} reveal={false} tone="hand" />
              </div>
            </>
          ) : null}
        </footer>

        {drag && (
          <div className="ghost" style={{ transform: `translate(${drag.x}px, ${drag.y}px)` }} aria-hidden="true">
            <EventCard event={run.current} reveal={false} tone="hand" compact />
          </div>
        )}

        {overlay}
      </div>
    )
  }

  return (
    <>
      <StartScreen
        progress={progress}
        total={events.length}
        dailyPlayed={dailyPlayed}
        muted={muted}
        onToggleMute={toggleMute}
        onStart={start}
        onCollection={() => setScreen('collection')}
      />
      {overlay}
    </>
  )
}
