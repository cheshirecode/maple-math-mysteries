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
