import { el } from '../../voice.ts'
import type { WidgetHooks } from '../run.ts'
import type { PuzzleData } from '../case.ts'

function tile(group: number): HTMLElement {
  const t = el('div', 'pattern-tile')
  for (let i = 0; i < group; i++) t.append(el('span', 'dot'))
  return t
}

export function widgetPattern(root: HTMLElement, puzzle: PuzzleData, hooks: WidgetHooks): void {
  if (puzzle.kind !== 'pattern') return
  const steps = puzzle.steps
  const next = steps[steps.length - 1] + (steps[steps.length - 1] - steps[steps.length - 2])
  const shown = el('div', 'pattern-strip')
  for (const n of steps) shown.append(tile(n))
  root.append(shown)

  const answer = next
  const options = el('div', 'pattern-options')
  const question = el('p', 'pattern-question', '')
  const choices = [...new Set([answer, answer + 1, Math.max(answer - 1, 1)])]
  for (const c of choices) {
    const opt = el('button', 'pattern-option')
    opt.append(tile(c))
    opt.addEventListener('click', () => (c === answer ? hooks.onSolved() : hooks.onRetry()))
    options.append(opt)
  }
  if (hooks.digitsMode) question.textContent = `The trail grows. The next tile has how many marks?`
  else question.textContent = 'Which tile comes next on the trail?'
  root.prepend(question)
  root.append(options)
}
