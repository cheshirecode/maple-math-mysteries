import { el } from '../../voice.ts'
import type { WidgetHooks } from '../run.ts'
import type { PuzzleData } from '../case.ts'

function dotRow(count: number): HTMLElement {
  const row = el('div', 'dots-row')
  for (let i = 0; i < count; i++) row.append(el('span', 'dot'))
  return row
}

export function widgetDots(root: HTMLElement, puzzle: PuzzleData, hooks: WidgetHooks): void {
  if (puzzle.kind !== 'dots') return
  const answer = puzzle.pairTarget - puzzle.pairA
  const q = el(
    'p',
    'dots-question',
    hooks.digitsMode
      ? `What pairs with ${puzzle.pairA} to make ${puzzle.pairTarget}?`
      : 'Which picture completes the pair?',
  )
  const held = el('div', 'dots-held')
  held.append(dotRow(puzzle.pairA))
  const options = el('div', 'dots-options')
  const choices = [...new Set([answer, answer + 1, Math.max(1, answer - 1)])]
  for (const c of choices) {
    const opt = el('button', 'dots-option')
    opt.append(dotRow(c))
    opt.addEventListener('click', () => (c === answer ? hooks.onSolved() : hooks.onRetry()))
    options.append(opt)
  }
  root.append(q, held, options)
}
