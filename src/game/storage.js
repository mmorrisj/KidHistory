// Progress lives in localStorage. Every read is defensive: a kid clearing site
// data, a private window, or a browser that blocks storage should all degrade
// to "fresh player" rather than a white screen.

const KEY = 'kidhistory.progress.v1'

export const emptyProgress = {
  collected: [],
  bestScore: 0,
  bestStreak: 0,
  runs: 0,
  dailyDone: null,
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...emptyProgress }
    const parsed = JSON.parse(raw)
    return {
      ...emptyProgress,
      ...parsed,
      collected: Array.isArray(parsed.collected) ? parsed.collected : [],
    }
  } catch {
    return { ...emptyProgress }
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress))
  } catch {
    // Storage unavailable or full — the current run still works, it just
    // will not be remembered.
  }
}

/** Folds a finished run into the saved progress. Pure, so it is testable. */
export function mergeRun(progress, run, { daily = null } = {}) {
  const collected = new Set(progress.collected)
  run.placed.forEach((id) => collected.add(id))
  return {
    ...progress,
    collected: [...collected],
    bestScore: Math.max(progress.bestScore, run.score),
    bestStreak: Math.max(progress.bestStreak, run.bestStreak),
    runs: progress.runs + 1,
    dailyDone: daily ?? progress.dailyDone,
  }
}

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}
