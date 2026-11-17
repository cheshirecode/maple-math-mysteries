import { el } from '../../voice.ts'
import type { WidgetHooks } from '../run.ts'
import type { PuzzleData } from '../case.ts'

const COLOURS: Record<string, string> = {
  red: '#c0392b',
  blue: '#4a6fa5',
  gold: '#e9b949',
  green: '#33714a',
}

function dial(slices: { colour: string; weight: number }[]): HTMLElement {
  const box = el('div', 'spinner-dial')
  const total = slices.reduce((s, x) => s + x.weight, 0)
  const stops: string[] = []
  let acc = 0
  for (const s of slices) {
    const from = (acc / total) * 360
    acc += s.weight
    const to = (acc / total) * 360
    stops.push(`${COLOURS[s.colour] ?? s.colour} ${from}deg ${to}deg`)
  }
  box.style.background = `conic-gradient(${stops.join(', ')})`
  return box
}

export function widgetSpinner(root: HTMLElement, puzzle: PuzzleData, hooks: WidgetHooks): void {
  if (puzzle.kind !== 'spinner') return
  const q = el(
    'p',
    'spinner-question',
    hooks.digitsMode
      ? 'Spin the spinner often. Which colour lands more often?'
      : 'Spin the spinner many times. Which colour lands most often?',
  )
  const opts = el('div', 'spinner-options')
  const seen = new Set<string>()
  for (const s of puzzle.slices) {
    if (seen.has(s.colour)) continue
    seen.add(s.colour)
    const opt = el('button', 'spinner-option', s.colour)
    opt.addEventListener('click', () =>
      s.colour === puzzle.answer ? hooks.onSolved() : hooks.onRetry(),
    )
    opts.append(opt)
  }
  root.append(q, dial(puzzle.slices), opts)
}
