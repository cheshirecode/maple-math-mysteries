import { el } from '../../voice.ts'
import type { WidgetHooks } from '../run.ts'
import type { PuzzleData } from '../case.ts'
import { baseTenLegend } from './legend.ts'

type Name = 'hundreds' | 'tens' | 'ones'
const NAMES: Name[] = ['hundreds', 'tens', 'ones']
const LABEL: Record<Name, string> = { hundreds: 'big block', tens: 'long block', ones: 'small block' }

export function widgetBlocks(root: HTMLElement, puzzle: PuzzleData, hooks: WidgetHooks): void {
  if (puzzle.kind !== 'blocks') return
  const want: Record<Name, number> = {
    hundreds: puzzle.hundreds,
    tens: puzzle.tens,
    ones: puzzle.ones,
  }
  const have: Record<Name, number> = { hundreds: 0, tens: 0, ones: 0 }

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

  const check = el('button', 'btn', 'Check the stacks')
  check.addEventListener('click', () => {
    const ok = NAMES.every((n) => have[n] === want[n])
    if (ok) hooks.onSolved()
    else hooks.onRetry()
  })
  board.append(check)

  const target = el('div', 'blocks-target')
  for (const n of NAMES) {
    if (want[n] <= 0) continue
    const row = el('div', `blocks-target-row ${n}`)
    for (let i = 0; i < want[n]; i++) row.append(el('span', 'block'))
    target.append(row)
  }

  const hint = el(
    'p',
    'blocks-hint',
    hooks.digitsMode
      ? `Open the safe: ${want.hundreds} big blocks, ${want.tens} long blocks, ${want.ones} small blocks.`
      : 'Build the stacks that match the picture.',
  )
  board.prepend(hint)
  hint.after(target)
  target.after(baseTenLegend())
  root.append(board)
}
