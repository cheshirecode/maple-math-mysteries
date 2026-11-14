// The access code is the parent's gate, not the child's. We never store the
// code itself - only a salted PBKDF2 hash, so a lost or shared device leaks
// nothing useful. 210k iterations keeps a casual guess slow on purpose.
const ITERATIONS = 210000

function toBase64(bytes: ArrayBufferLike): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/=+$/, '')
}

export async function deriveCodeHash(code: string, saltB64: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(code), 'PBKDF2', false, [
    'deriveBits',
  ])
  const salt = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0))
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    key,
    256,
  )
  return toBase64(bits)
}

export async function verifyCodeHash(code: string, saltB64: string, expected: string): Promise<boolean> {
  const got = await deriveCodeHash(code, saltB64)
  const a = new Uint8Array(atob(got).split('').map((c) => c.charCodeAt(0)))
  const b = new Uint8Array(atob(expected).split('').map((c) => c.charCodeAt(0)))
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

export function newSalt(): string {
  const s = new Uint8Array(16)
  crypto.getRandomValues(s)
  return toBase64(s.buffer)
}

