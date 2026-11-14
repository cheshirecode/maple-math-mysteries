import { el } from '../../voice.ts'
import type { WidgetHooks } from '../run.ts'
import type { PuzzleData } from '../case.ts'

interface Stacks {
  hundreds: number
  tens: number
  ones: number
}

function blockStack(label: string, count: number, cls: string): HTMLElement {
  const box = el('div', `blocks-stack ${cls}`)
  for (let i = 0; i < count; i++) box.append(el('span', 'block'))
  box.dataset.count = String(count)
  box.dataset.label = label
  return box
}

export function widgetBlocks(root: HTMLElement, puzzle: PuzzleData, hooks: WidgetHooks): void {
  if (puzzle.kind !== 'blocks') return
  const want: Stacks = { hundreds: puzzle.hundreds, tens: puzzle.tens, ones: puzzle.ones }
  const have: Stacks = { hundreds: 0, tens: 0, ones: 0 }
  const names = ['hundreds', 'tens', 'ones'] as const

  const board = el('div', 'blocks-board')
  const stacks = el('div', 'blocks-stacks')
  const render = () => {
    stacks.innerHTML = ''
    for (const n of names) stacks.append(blockStack(n, have[n], n))
  }
  render()
  board.append(stacks)

  const controls = el('div', 'blocks-controls')
  const namesLabels: Record<string, string> = { hundreds: 'big block', tens: 'long block', ones: 'small block' }
  for (const n of names) {
    const group = el('div', 'blocks-control')
    group.append(el('button', 'btn btn-small', namesLabels[n]))
    ;(group.lastChild as HTMLElement).addEventListener('click', () => {
      have[n]++
      render()
    })
    group.append(el('button', 'btn btn-small', 'take one away'))
    ;(group.lastChild as HTMLElement).addEventListener('click', () => {
      if (have[n] > 0) have[n]--
      render()
    })
    controls.append(group)
  }
  board.append(controls)

  const check = el('button', 'btn', 'Check the lock')
  check.addEventListener('click', () => {
    const ok = names.every((n) => have[n] === want[n])
    if (ok) hooks.onSolved()
    else hooks.onRetry()
  })
  board.append(check)

  const hint = el('p', 'blocks-hint', hooks.digitsMode ? `Open the safe: ${want.hundreds} hundreds, ${want.tens} tens, ${want.ones} ones.` : 'Build the stacks that match the lock picture.')
  board.prepend(hint)
  root.append(board)
}
