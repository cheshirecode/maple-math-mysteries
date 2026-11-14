let ctx: AudioContext | null = null
let muted = localStorage.getItem('mda.sound') === 'off'

function audio(): AudioContext | null {
  try {
    if (!ctx) {
      const Ctor = globalThis.AudioContext
      if (!Ctor) return null
      ctx = new Ctor()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tone(freq: number, start: number, dur: number, gain: number): void {
  const ac = audio()
  if (!ac) return
  const osc = ac.createOscillator()
  const env = ac.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  env.gain.setValueAtTime(0, ac.currentTime + start)
  env.gain.linearRampToValueAtTime(gain, ac.currentTime + start + 0.02)
  env.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + dur)
  osc.connect(env).connect(ac.destination)
  osc.start(ac.currentTime + start)
  osc.stop(ac.currentTime + start + dur + 0.05)
}

const C5 = 523.25
const E5 = 659.25
const G5 = 783.99
const C6 = 1046.5

export function playSolve(): void {
  if (muted) return
  tone(C5, 0, 0.16, 0.12)
  tone(E5, 0.1, 0.16, 0.12)
  tone(G5, 0.2, 0.2, 0.12)
  tone(C6, 0.3, 0.32, 0.1)
}

export function playRetry(): void {
  if (muted) return
  tone(220, 0, 0.14, 0.08)
  tone(196, 0.1, 0.18, 0.08)
}

export function playFanfare(): void {
  if (muted) return
  const notes = [C5, E5, G5, C6, G5, C6, 1318.5, 1568]
  notes.forEach((f, i) => tone(f, i * 0.11, i >= 6 ? 0.5 : 0.18, 0.1))
}

export function setMuted(next: boolean): void {
  muted = next
  localStorage.setItem('mda.sound', next ? 'off' : 'on')
}

export function isMuted(): boolean {
  return muted
}
