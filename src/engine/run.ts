import { el } from '../voice.ts'
import type { CaseDef, PuzzleData } from './case.ts'
import { widgetDots } from './widgets/dots.ts'
import { widgetBlocks } from './widgets/blocks.ts'
import { widgetArrays } from './widgets/arrays.ts'
import { widgetFraction } from './widgets/fraction.ts'
import { widgetPattern } from './widgets/pattern.ts'
import { widgetMeasure } from './widgets/measure.ts'
import { widgetCrate } from './widgets/crate.ts'
import { widgetSpinner } from './widgets/spinner.ts'
import { widgetCoins } from './widgets/coins.ts'

export interface WidgetHooks {
  digitsMode: boolean
  onSolved: () => void
  onRetry: () => void
}

const runners: Record<
  string,
  (root: HTMLElement, puzzle: PuzzleData, hooks: WidgetHooks) => void
> = {
  dots: widgetDots,
  blocks: widgetBlocks,
  arrays: widgetArrays,
  fraction: widgetFraction,
  pattern: widgetPattern,
  measure: widgetMeasure,
  crate: widgetCrate,
  spinner: widgetSpinner,
  coins: widgetCoins,
}

export interface RunOptions {
  onBadge: (badge: string) => void
  onDone: () => void
}

export function runCase(root: HTMLElement, def: CaseDef, opts: RunOptions): void {
  root.innerHTML = ''
  const digitsMode = false
  const title = def.titleNoDigits
  const story = def.storyNoDigits

  const box = el('div', 'case')
  box.append(el('h2', 'case-title', title))
  for (const line of story) {
    const p = el('p', 'case-story', line)
    box.append(p)
  }
  const area = el('div', 'case-widget')
  box.append(area)
  const feedback = el('p', 'case-feedback', '')
  box.append(feedback)
  const back = el('button', 'btn btn-ghost', 'Back to the map')
  back.addEventListener('click', opts.onDone)
  box.append(back)
  root.append(box)

  const hooks: WidgetHooks = {
    digitsMode,
    onRetry: () => {
      feedback.textContent = 'Not quite. Look again, detective.'
    },
    onSolved: () => {
      feedback.textContent = 'Case closed!'
      confetti(box)
      opts.onBadge(def.badge)
    },
  }
  const run = runners[def.widget]
  if (!run) throw new Error(`unknown widget ${def.widget}`)
  run(area, def.puzzle, hooks)
}

const CONFETTI_COLORS = ['#e8443a', '#ffc834', '#2ea44f', '#4a90d9']

export function confetti(box: HTMLElement): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  for (let i = 0; i < 24; i++) {
    const bit = document.createElement('div')
    bit.className = 'confetti-bit'
    bit.style.left = `${5 + Math.random() * 90}%`
    const size = 8 + Math.floor(Math.random() * 7)
    bit.style.width = `${size}px`
    bit.style.height = `${size}px`
    bit.style.borderRadius = i % 2 === 0 ? '2px' : '50%'
    bit.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
    bit.style.setProperty('--dx', `${Math.floor(Math.random() * 241) - 120}px`)
    bit.style.setProperty('--rot', `${Math.floor(Math.random() * 1081) - 540}deg`)
    box.append(bit)
    setTimeout(() => bit.remove(), 950)
  }
}
