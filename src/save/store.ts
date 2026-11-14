const KEY = 'mda.progress.v1'
const SALT_KEY = 'mda.code.salt'
const HASH_KEY = 'mda.code.hash'

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

export function hasCode(): boolean {
  const s = ls()
  return !!(s?.getItem(SALT_KEY) && s?.getItem(HASH_KEY))
}

export function getCodeRecord(): { salt: string; hash: string } | null {
  const s = ls()
  const salt = s?.getItem(SALT_KEY)
  const hash = s?.getItem(HASH_KEY)
  return salt && hash ? { salt, hash } : null
}

export function setCodeRecord(salt: string, hash: string): void {
  ls()?.setItem(SALT_KEY, salt)
  ls()?.setItem(HASH_KEY, hash)
}

export function eraseAll(): void {
  const s = ls()
  s?.removeItem(KEY)
  s?.removeItem(SALT_KEY)
  s?.removeItem(HASH_KEY)
}
