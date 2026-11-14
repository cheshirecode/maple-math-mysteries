import { el } from '../../voice.ts'
import type { WidgetHooks } from '../run.ts'
import type { PuzzleData } from '../case.ts'

export function widgetFraction(root: HTMLElement, puzzle: PuzzleData, hooks: WidgetHooks): void {
  if (puzzle.kind !== 'fraction') return
  const options = el('div', 'fraction-options')
  const question = el('p', 'fraction-question', '')
  const choices = [puzzle.parts, puzzle.parts + 1, Math.max(2, puzzle.parts - 1)]
  for (const cuts of choices) {
    const pie = el('div', 'pie')
    for (let i = 0; i < cuts; i++) {
      const slice = el('div', 'pie-slice')
      slice.style.transform = `rotate(${(360 / cuts) * i}deg)`
      pie.append(slice)
    }
    const opt = el('button', 'fraction-option')
    opt.append(pie)
    opt.addEventListener('click', () => (cuts === puzzle.parts ? hooks.onSolved() : hooks.onRetry()))
    options.append(opt)
  }
  if (hooks.digitsMode) question.textContent = `Cut the pie into ${puzzle.parts} equal shares.`
  else question.textContent = 'Which pie shares every part fairly?'
  root.prepend(question)
  root.append(options)
}
