import { el } from '../../voice.ts'
import type { WidgetHooks } from '../run.ts'
import type { PuzzleData } from '../case.ts'

function dial(slices: { colour: string; weight: number }[]): HTMLElement {
  const box = el('div', 'spinner-dial')
  let angle = 0
  const total = slices.reduce((s, x) => s + x.weight, 0)
  for (const s of slices) {
    const slice = el('div', 'spinner-slice')
    slice.style.background = s.colour
    slice.style.transform = `rotate(${(360 * angle) / total}deg) skewY(${-(90 - (360 * s.weight) / total)}deg)`
    box.append(slice)
    angle += s.weight
  }
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
    const opt = el('button', 'btn', s.colour)
    opt.addEventListener('click', () =>
      s.colour === puzzle.answer ? hooks.onSolved() : hooks.onRetry(),
    )
    opts.append(opt)
  }
  root.append(q, dial(puzzle.slices), opts)
}
