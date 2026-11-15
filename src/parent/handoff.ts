import { el } from '../voice.ts'
import { getProgress } from '../state.ts'
import { importSaveText } from '../save/import.ts'

// One home for the handoff URL fact: the builder (Show QR) and the reader
// (?code=) share it, so the parameter name cannot drift between them.
export function handoffUrl(code: string): string {
  return `${location.origin}${location.pathname}?code=${encodeURIComponent(code)}`
}

// Reads a handoff code from the URL and cleans the address bar so a refresh
// never re-prompts. Returns null when no code is present.
export function readHandoffCode(): string | null {
  const code = new URLSearchParams(location.search).get('code')
  if (!code) return null
  history.replaceState(null, '', location.pathname)
  return code
}

// The import confirmation. Offer-only: the import fires exclusively on the
// explicit yes. Failure keeps the panel open with a visible message.
export function renderHandoff(stage: HTMLElement, code: string, done: () => void): void {
  const hasProgress = getProgress().completedCases.length > 0
  const panel = el('div', 'handoff-panel')
  panel.setAttribute('role', 'alertdialog')
  panel.setAttribute('aria-labelledby', 'handoff-title')
  const title = el('p', 'handoff-title', 'Import this save code?')
  title.id = 'handoff-title'
  panel.append(title)
  panel.append(
    el(
      'p',
      'handoff-sub',
      hasProgress
        ? 'It replaces the progress on this device.'
        : 'It loads the progress from the other device.',
    ),
  )
  const msg = el('p', 'handoff-msg', '')
  const yes = el('button', 'btn', 'Yes, import it')
  yes.addEventListener('click', async () => {
    try {
      await importSaveText(code)
      done()
    } catch {
      msg.textContent = 'That code did not work. Ask the grown-up to send it again.'
    }
  })
  const no = el('button', 'btn btn-ghost', 'No, keep mine')
  no.addEventListener('click', () => done())
  panel.append(yes, no, msg)
  stage.append(panel)
  yes.focus()
}
