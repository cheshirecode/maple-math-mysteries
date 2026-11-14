const KEY = 'mda.progress.v1'

function ls(): Storage | null {
  try {
    return globalThis.localStorage
  } catch {
    return null
  }
}

export function loadProgress(): unknown | null {
  const s = ls()
  const raw = s?.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveProgress(p: unknown): void {
  try {
    ls()?.setItem(KEY, JSON.stringify(p))
  } catch {
    /* storage may be unavailable or full; ignore */
  }
}

export function eraseAll(): void {
  const s = ls()
  if (!s) return
  for (let i = s.length - 1; i >= 0; i--) {
    const k = s.key(i)
    if (k && k.startsWith('mda.')) s.removeItem(k)
  }
}
