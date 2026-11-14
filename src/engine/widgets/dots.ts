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
  const target = puzzle.count
  const answer = puzzle.pairTarget - puzzle.pairA
  const board = el('div', 'dots-board')
  const question = el('p', 'dots-question', '')
  board.append(el('div', 'dots-group', ''), dotRow(target))
  board.append(el('div', 'dots-pair-label', puzzle.pairA > 0 ? '' : ''))
  root.append(board)

  const options = el('div', 'dots-options')
  const choices = [answer, answer + 1, Math.max(1, answer - 1)]
  for (const c of choices) {
    const opt = el('button', 'dots-option')
    opt.append(dotRow(c))
    opt.addEventListener('click', () => {
      if (c === answer) hooks.onSolved()
      else hooks.onRetry()
    })
    options.append(opt)
  }
  root.append(options)
  if (hooks.digitsMode) question.textContent = `What pairs with ${puzzle.pairA} to make ${puzzle.pairTarget}?`
  else question.textContent = 'Which picture completes the pair?'
  root.prepend(question)
}
