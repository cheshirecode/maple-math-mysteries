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

function clsFor(value: number): string {
  const hit = COIN_CLS.find(([, c]) => c.endsWith(value === 25 ? 'q' : value === 10 ? 'd' : value === 5 ? 'n' : 'p'))
  return hit ? hit[1] : 'coin-p'
}

function sorted(values: number[]): number[] {
  return [...values].sort((a, b) => b - a)
}

// The coin key: children meet four different coins in the fee picture with
// nothing saying which is which. The legend names every coin at its real
// size, so the fee picture becomes readable before the first tap.

function coinLegend(): HTMLElement {
  const legend = el('div', 'coin-legend')
  for (const [name, cls] of COIN_CLS) {
    const item = el('span', 'legend-item')
    item.append(el('span', `coin ${cls}`), el('span', 'legend-text', name))
    legend.append(item)
  }
  return legend
}

export function widgetCoins(root: HTMLElement, puzzle: PuzzleData, hooks: WidgetHooks): void {
  if (puzzle.kind !== 'coins') return
  const fee = sorted(puzzle.target)
  const paid: number[] = []

  const q = el(
    'p',
    'coins-question',
    hooks.digitsMode
      ? `Pay the exact fee of ${centsOf(fee)} cents using the same coins.`
      : 'Pay the fee using the same coins as the picture.',
  )

  root.append(q, coinLegend())

  const board = el('div', 'coins-board')
  const feeRow = el('div', 'coins-row')
  feeRow.append(el('span', 'coins-row-label', 'the fee'))
  for (const v of fee) {
    const slot = el('span', 'coin-slot')
    slot.append(el('span', `coin ${clsFor(v)}`))
    feeRow.append(slot)
  }
  const paidRow = el('div', 'coins-row')
  paidRow.append(el('span', 'coins-row-label', 'you paid'))
  const slots: HTMLElement[] = fee.map(() => el('span', 'coin-slot coin-slot-empty'))
  const render = () => {
    const soFar = sorted(paid)
    slots.forEach((slot, i) => {
      slot.innerHTML = ''
      if (i < soFar.length) slot.append(el('span', `coin ${clsFor(soFar[i])}`))
      slot.classList.toggle('coin-slot-empty', i >= soFar.length)
    })
    if (hooks.digitsMode) trayInfo.textContent = `Paid so far: ${centsOf(paid)} cents`
  }
  slots.forEach((s) => paidRow.append(s))
  const trayInfo = el('p', 'coins-tray-info', '')
  board.append(feeRow, paidRow)

  const controls = el('div', 'coins-controls')
  for (const [name] of COIN_CLS) {
    const btn = el('button', 'coin-choice')
    const chip = el('span', `coin ${clsFor(name === 'quarter' ? 25 : name === 'dime' ? 10 : name === 'nickel' ? 5 : 1)}`)
    btn.append(chip, el('span', 'coin-name', name))
    const value = name === 'quarter' ? 25 : name === 'dime' ? 10 : name === 'nickel' ? 5 : 1
    btn.addEventListener('click', () => {
      paid.push(value)
      render()
    })
    controls.append(btn)
  }
  const undo = el('button', 'btn-undo', 'take one back')
  undo.addEventListener('click', () => {
    if (paid.length > 0) {
      paid.pop()
      render()
    }
  })
  controls.append(undo)
  const check = el('button', 'btn', 'Pay the fee')
  check.addEventListener('click', () => {
    const ok = fee.length === paid.length && sorted(paid).every((v, i) => v === fee[i])
    if (ok) hooks.onSolved()
    else hooks.onRetry()
  })
  root.append(board, trayInfo, controls, check)
}
