export function el(tag: string, cls?: string, text?: string): HTMLElement {
  const node = document.createElement(tag)
  if (cls) node.className = cls
  if (text) node.textContent = text
  return node
}

export function speak(text: string): void {
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
