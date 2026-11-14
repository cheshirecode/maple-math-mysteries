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

export function migrate(input: unknown): Progress {
  const base = emptyProgress()
  if (typeof input !== 'object' || input === null) return base
  const p = input as Record<string, unknown>
  const strings = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
  return {
    schemaVersion: CURRENT_SCHEMA,
    completedCases: strings(p.completedCases),
    badges: strings(p.badges),
    minutesPlayed: typeof p.minutesPlayed === 'number' && Number.isFinite(p.minutesPlayed) ? p.minutesPlayed : 0,
    digitsMode: typeof p.digitsMode === 'boolean' ? p.digitsMode : false,
    showDigitsDefault: typeof p.showDigitsDefault === 'boolean' ? p.showDigitsDefault : false,
  }
}
