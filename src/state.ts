export interface Progress {
  schemaVersion: number
  completedCases: string[]
  badges: string[]
  minutesPlayed: number
  digitsMode: boolean
  showDigitsDefault: boolean
}

export const CURRENT_SCHEMA = 1

export function emptyProgress(): Progress {
  return {
    schemaVersion: CURRENT_SCHEMA,
    completedCases: [],
    badges: [],
    minutesPlayed: 0,
    digitsMode: false,
    showDigitsDefault: false,
  }
}

export type Listener = (p: Progress) => void

const listeners = new Set<Listener>()
let current: Progress = emptyProgress()

export function getProgress(): Progress {
  return current
}

export function setProgress(next: Progress): void {
  current = next
  for (const fn of listeners) fn(current)
}

export function updateProgress(fn: (p: Progress) => Progress): void {
  setProgress(fn(current))
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function migrate(p: Progress): Progress {
  const base = emptyProgress()
  const out: Progress = { ...base, ...p, schemaVersion: CURRENT_SCHEMA }
  out.completedCases = Array.isArray(out.completedCases) ? out.completedCases : []
  out.badges = Array.isArray(out.badges) ? out.badges : []
  out.minutesPlayed = Number.isFinite(out.minutesPlayed) ? out.minutesPlayed : 0
  return out
}
