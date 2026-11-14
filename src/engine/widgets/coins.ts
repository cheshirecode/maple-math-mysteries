import { el } from '../../voice.ts'
import type { WidgetHooks } from '../run.ts'
import type { PuzzleData } from '../case.ts'

const COIN_CLS: [string, string][] = [
  ['quarter', 'coin-q'],
  ['dime', 'coin-d'],
  ['nickel', 'coin-n'],
  ['penny', 'coin-p'],
]

function centsOf(values: number[]): number {
  return values.reduce((s, v) => s + v, 0)
}

export function widgetCoins(root: HTMLElement, puzzle: PuzzleData, hooks: WidgetHooks): void {
  if (puzzle.kind !== 'coins') return
  const want = centsOf(puzzle.target)
  const tray: number[] = []

  const q = el(
    'p',
    'coins-question',
    hooks.digitsMode
      ? `Tap coins to pay the exact fee of ${want} cents.`
      : 'Tap coins to pay the exact fee shown in the picture.',
  )
  const fee = el('div', 'coins-fee')
  for (const v of puzzle.target) {
    const cls = COIN_CLS.find(([, c]) => c.endsWith(v === 25 ? 'q' : v === 10 ? 'd' : v === 5 ? 'n' : 'p'))
    fee.append(el('span', `coin ${cls ? cls[1] : 'coin-p'}`))
  }
  const trayEl = el('div', 'coins-tray')
  const trayInfo = el('p', 'coins-tray-info', '')
  const controls = el('div', 'coins-controls')
  for (const [name, cls] of COIN_CLS) {
    const btn = el('button', 'btn btn-small', name)
    const value = name === 'quarter' ? 25 : name === 'dime' ? 10 : name === 'nickel' ? 5 : 1
    btn.addEventListener('click', () => {
      tray.push(value)
      trayEl.append(el('span', `coin ${cls}`))
      if (hooks.digitsMode) trayInfo.textContent = `Paid so far: ${centsOf(tray)} cents`
    })
    controls.append(btn)
  }
  const check = el('button', 'btn', 'Pay the fee')
  check.addEventListener('click', () => {
    if (centsOf(tray) === want) hooks.onSolved()
    else hooks.onRetry()
  })
  root.append(q, fee, trayEl, trayInfo, controls, check)
}
