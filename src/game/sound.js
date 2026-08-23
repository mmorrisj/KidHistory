// Synthesised with the Web Audio API rather than shipped as files: a few
// oscillators cost nothing to download and cannot fail to load offline.

let ctx = null
let muted = false

const KEY = 'kidhistory.muted.v1'

try {
  muted = localStorage.getItem(KEY) === '1'
} catch {
  // Storage blocked — default to sound on.
}

export function isMuted() {
  return muted
}

export function setMuted(next) {
  muted = next
  try {
    localStorage.setItem(KEY, next ? '1' : '0')
  } catch {
    // Preference just will not persist.
  }
}

/** Browsers only allow audio after a gesture, so the context is made lazily. */
function audio() {
  if (muted) return null
  if (!ctx) {
    const Ctor = window.AudioContext || window.webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(freq, start, duration, { type = 'sine', gain = 0.12 } = {}) {
  const ac = audio()
  if (!ac) return
  const osc = ac.createOscillator()
  const amp = ac.createGain()
  const at = ac.currentTime + start

  osc.type = type
  osc.frequency.setValueAtTime(freq, at)

  // A quick attack and exponential tail keeps it a chime rather than a beep.
  amp.gain.setValueAtTime(0.0001, at)
  amp.gain.exponentialRampToValueAtTime(gain, at + 0.015)
  amp.gain.exponentialRampToValueAtTime(0.0001, at + duration)

  osc.connect(amp).connect(ac.destination)
  osc.start(at)
  osc.stop(at + duration + 0.02)
}

/** Rising arpeggio; climbs with the streak so a hot run sounds like one. */
export function playCorrect(streak = 0) {
  const base = 523.25 * Math.pow(2, Math.min(streak, 8) / 24)
  ;[0, 4, 7].forEach((semis, i) => {
    tone(base * Math.pow(2, semis / 12), i * 0.06, 0.28, { type: 'triangle' })
  })
}

export function playWrong() {
  tone(196, 0, 0.22, { type: 'sawtooth', gain: 0.07 })
  tone(146.83, 0.09, 0.3, { type: 'sawtooth', gain: 0.07 })
}

export function playPickup() {
  tone(392, 0, 0.09, { type: 'sine', gain: 0.05 })
}

export function playFanfare() {
  ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
    tone(f, i * 0.1, 0.5, { type: 'triangle', gain: 0.11 })
  })
}
