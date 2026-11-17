import { el } from '../../voice.ts'
import type { WidgetHooks } from '../run.ts'
import type { PuzzleData, BlockPicture } from '../case.ts'
import { baseTenLegend } from './legend.ts'

export function miniStacks(num: BlockPicture): HTMLElement {
  const box = el('div', 'compare-stack')
  const groups: [string, number][] = [
    ['hundreds', num.hundreds],
    ['tens', num.tens],
    ['ones', num.ones],
  ]
  for (const [cls, count] of groups) {
    if (count <= 0) continue
    const row = el('div', `compare-row ${cls}`)
    for (let i = 0; i < count; i++) row.append(el('span', 'block'))
    box.append(row)
  }
  return box
}

export function blockValue(num: BlockPicture): number {
  return num.hundreds * 100 + num.tens * 10 + num.ones
}

function option(side: 'a' | 'b', picture: BlockPicture, hooks: WidgetHooks, puzzle: PuzzleData): HTMLElement {
  const opt = el('button', 'compare-option')
  opt.append(miniStacks(picture))
  opt.addEventListener('click', () => {
    if (puzzle.kind !== 'compare') return
    if (side === puzzle.more) hooks.onSolved()
    else hooks.onRetry()
  })
  return opt
}

export function widgetCompare(root: HTMLElement, puzzle: PuzzleData, hooks: WidgetHooks): void {
  if (puzzle.kind !== 'compare') return
  const q = el(
    'p',
    'compare-question',
    hooks.digitsMode
      ? `Which number is larger: ${blockValue(puzzle.a)} or ${blockValue(puzzle.b)}?`
      : 'Which pile holds more?',
  )
  const options = el('div', 'compare-options')
  options.append(option('a', puzzle.a, hooks, puzzle), option('b', puzzle.b, hooks, puzzle))
  const maxValue = Math.max(blockValue(puzzle.a), blockValue(puzzle.b))
  root.append(q, baseTenLegend({ ones: maxValue % 10 > 0, tens: maxValue >= 10, hundreds: maxValue >= 100 }), options)
}
