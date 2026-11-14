import { el } from '../../voice.ts'
import type { WidgetHooks } from '../run.ts'
import type { PuzzleData } from '../case.ts'

const FACES: Record<string, number> = { cube: 6, prism: 6, cylinder: 3 }

export function widgetCrate(root: HTMLElement, puzzle: PuzzleData, hooks: WidgetHooks): void {
  if (puzzle.kind !== 'crate') return
  const want = FACES[puzzle.shape]
  const q = el(
    'p',
    'crate-question',
    hooks.digitsMode
      ? `The crate folds from the net. It has ${want} faces. Which crate matches the net?`
      : 'The crate folds from the net. Which crate matches the net?',
  )
  const net = el('div', 'net')
  for (let i = 0; i < want; i++) net.append(el('span', 'net-tile'))
  const opts = el('div', 'fraction-options')
  for (const faces of puzzle.suspects) {
    const stack = el('div', 'face-stack')
    for (let i = 0; i < faces; i++) stack.append(el('span', 'face-tile'))
    if (hooks.digitsMode) stack.append(el('span', 'jug-label', String(faces)))
    const opt = el('button', 'fraction-option')
    opt.append(stack)
    opt.addEventListener('click', () => (faces === want ? hooks.onSolved() : hooks.onRetry()))
    opts.append(opt)
  }
  root.append(q, net, opts)
}
