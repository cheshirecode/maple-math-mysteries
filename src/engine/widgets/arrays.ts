import { el } from '../../voice.ts'
import type { WidgetHooks } from '../run.ts'
import type { PuzzleData } from '../case.ts'

export function widgetArrays(root: HTMLElement, puzzle: PuzzleData, hooks: WidgetHooks): void {
  if (puzzle.kind !== 'arrays') return
  const grid = el('div', 'arrays-grid')
  grid.style.gridTemplateColumns = `repeat(${puzzle.cols}, auto)`
  for (let r = 0; r < puzzle.rows; r++) {
    for (let c = 0; c < puzzle.cols; c++) grid.append(el('span', 'footprint'))
  }
  root.append(grid)

  const answer = puzzle.rows
  const options = el('div', 'arrays-options')
  const question = el('p', 'arrays-question', '')
  const choices = [...new Set([answer, answer + 1, Math.max(1, answer - 1)])]
  for (const c of choices) {
    const opt = el('button', 'btn', hooks.digitsMode ? String(c) : '•'.repeat(c))
    opt.addEventListener('click', () => (c === answer ? hooks.onSolved() : hooks.onRetry()))
    options.append(opt)
  }
  if (hooks.digitsMode) question.textContent = `${puzzle.rows} rows of ${puzzle.cols} footprints. How many rows?`
  else question.textContent = 'How many rows of footprints?'
  root.prepend(question)
  root.append(options)
}
