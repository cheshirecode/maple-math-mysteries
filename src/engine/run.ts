import { el, speak } from '../voice.ts'
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
  const digitsMode = currentDigitsMode()
  const title = digitsMode ? def.titleDigits ?? def.titleNoDigits : def.titleNoDigits
  const story = digitsMode ? def.storyDigits ?? def.storyNoDigits : def.storyNoDigits

  const box = el('div', 'case')
  box.append(el('h2', 'case-title', title))
  for (const line of story) {
    const p = el('p', 'case-story', line)
    box.append(p)
  }
  speak(story.join(' '))
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
      speak('Not quite. Look again.')
    },
    onSolved: () => {
      feedback.textContent = 'Case closed!'
      speak('Case closed.')
      opts.onBadge(def.badge)
    },
  }
  runners[def.widget](area, def.puzzle, hooks)
}

function currentDigitsMode(): boolean {
  return document.body.dataset.digitsMode === 'true'
}
