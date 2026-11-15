export function el(tag: string, cls?: string, text?: string): HTMLElement {
  const node = document.createElement(tag)
  if (cls) node.className = cls
  if (text) node.textContent = text
  return node
}

let voiceOff = localStorage.getItem('mda.voice') === 'off'

export function speak(text: string): void {
  if (voiceOff) return
  try {
    const synth = globalThis.speechSynthesis
    if (!synth) return
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.95
    synth.speak(u)
  } catch {
    return
  }
}

export function speakable(node: HTMLElement, text: string): void {
  node.tabIndex = 0
  node.setAttribute('role', 'button')
  node.setAttribute('aria-label', 'Hear this line')
  node.classList.add('speakable')
  const handler = (e: Event) => {
    e.preventDefault()
    speak(text)
  }
  node.addEventListener('click', handler)
  node.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      speak(text)
    }
  })
}

export function isVoiceOff(): boolean {
  return voiceOff
}

export function setVoiceOff(next: boolean): void {
  voiceOff = next
  localStorage.setItem('mda.voice', next ? 'off' : 'on')
  if (next) {
    try {
      globalThis.speechSynthesis?.cancel()
    } catch {
      return
    }
  }
}

