import { el } from '../../voice.ts'
import type { WidgetHooks } from '../run.ts'
import type { PuzzleData } from '../case.ts'

export function widgetMeasure(root: HTMLElement, puzzle: PuzzleData, hooks: WidgetHooks): void {
  if (puzzle.kind !== 'measure') return
  const q = el(
    'p',
    'measure-question',
    hooks.digitsMode
      ? `The recipe pours ${puzzle.cups} cupfuls. Tap the jug that is right.`
      : 'The recipe pours this many cupfuls. Tap the jug that is right.',
  )
  const target = el('div', 'measure-target')
  for (let i = 0; i < puzzle.cups; i++) target.append(el('span', 'cup'))
  const opts = el('div', 'fraction-options')
  for (const n of puzzle.options) {
    const jug = el('div', 'jug')
    for (let i = 0; i < n; i++) jug.append(el('span', 'jug-fill'))
    if (hooks.digitsMode) jug.append(el('span', 'jug-label', String(n)))
    const opt = el('button', 'fraction-option')
    opt.append(jug)
    opt.addEventListener('click', () => (n === puzzle.cups ? hooks.onSolved() : hooks.onRetry()))
    opts.append(opt)
  }
  root.append(q, target, opts)
}
