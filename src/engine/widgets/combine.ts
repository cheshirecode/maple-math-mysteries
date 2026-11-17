import { el } from '../../voice.ts'
import type { WidgetHooks } from '../run.ts'
import type { PuzzleData } from '../case.ts'
import { blockValue, miniStacks } from './compare.ts'
import { baseTenLegend } from './legend.ts'

type Name = 'hundreds' | 'tens' | 'ones'
const NAMES: Name[] = ['hundreds', 'tens', 'ones']
const LABEL: Record<Name, string> = { hundreds: 'big block', tens: 'long block', ones: 'small block' }

function decompose(value: number): Record<Name, number> {
  return {
    hundreds: Math.floor(value / 100),
    tens: Math.floor((value % 100) / 10),
    ones: value % 10,
  }
}

export function widgetCombine(root: HTMLElement, puzzle: PuzzleData, hooks: WidgetHooks): void {
  if (puzzle.kind !== 'combine') return
  const start = blockValue(puzzle.a)
  const change = blockValue(puzzle.b)
  const result = puzzle.op === 'add' ? start + change : start - change
  const want = decompose(result)

  const have: Record<Name, number> = { hundreds: 0, tens: 0, ones: 0 }

  const pictures = el('div', 'combine-pictures')
  const first = el('div', 'combine-picture')
  first.append(el('p', 'combine-label', 'start with'), miniStacks(puzzle.a))
  const second = el('div', 'combine-picture')
  second.append(
    el('p', 'combine-label', puzzle.op === 'add' ? 'then add' : 'then take away'),
    miniStacks(puzzle.b),
  )
  pictures.append(first, second)

  const board = el('div', 'blocks-board')
  const stacks = el('div', 'blocks-stacks')
  const render = () => {
    stacks.innerHTML = ''
    for (const n of NAMES) {
      const box = el('div', `blocks-stack ${n}`)
      for (let i = 0; i < have[n]; i++) box.append(el('span', 'block'))
      stacks.append(box)
    }
  }
  render()
  board.append(stacks)

  const controls = el('div', 'blocks-controls')
  for (const n of NAMES) {
    const group = el('div', 'blocks-control')
    const add = el('button', 'btn btn-small', `add ${LABEL[n]}`)
    add.addEventListener('click', () => {
      have[n]++
      render()
    })
    const take = el('button', 'btn btn-small', 'take one away')
    take.addEventListener('click', () => {
      if (have[n] > 0) have[n]--
      render()
    })
    group.append(add, take)
    controls.append(group)
  }
  board.append(controls)

  const check = el('button', 'btn', 'Check the answer')
  check.addEventListener('click', () => {
    const ok = NAMES.every((n) => have[n] === want[n])
    if (ok) hooks.onSolved()
    else hooks.onRetry()
  })
  board.append(check)

    const q = el(
    'p',
    'combine-question',
    hooks.digitsMode
      ? puzzle.op === 'add'
        ? `Build the answer: ${start} + ${change}.`
        : `Build the answer: ${start} - ${change}.`
      : puzzle.op === 'add'
        ? 'Build the stacks for both piles put together.'
        : 'Build the stacks that are left.',
  )
  root.append(q, baseTenLegend(), pictures, board)
}
