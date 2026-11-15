import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { loadAllPacks } from '../src/content/packs.ts'

const ALL_CASES = (await loadAllPacks()).flatMap((p) => p.cases)

// Widget question strings shown to the kid (non-digits mode, the default).
// Sourced from src/engine/widgets/*.ts — update there if widgets change.
const WIDGET_QUESTIONS: Record<string, string[]> = {
  arrays: ['How many rows are there?'],
  blocks: ['Build the stacks that match the picture.'],
  coins: ['Pay the fee using the same coins as the picture.'],
  compare: ['Which pile holds more?'],
  crate: ['The crate folds from the net. Which crate matches the net?'],
  dots: ['Which picture completes the pair?'],
  fraction: ['Which pie gives every friend a fair share?'],
  measure: ['The recipe pours this many cupfuls. Tap the jug that is right.'],
  pattern: ['Which tile comes next on the trail?'],
  spinner: ['Spin the spinner many times. Which colour lands most often?'],
  combine: ['Build the stacks for both piles put together.', 'Build the stacks that are left.'],
}

const ALL_QUESTIONS = Object.values(WIDGET_QUESTIONS).flat()

// Token-overlap helper: share of shared words (case-insensitive, >= 0.8 means near-duplicate)
function tokens(s: string): Set<string> {
  return new Set(s.toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/).filter((w) => w.length > 2))
}
function overlap(a: string, b: string): number {
  const ta = tokens(a)
  const tb = tokens(b)
  if (ta.size === 0 || tb.size === 0) return 0
  let shared = 0
  for (const t of ta) if (tb.has(t)) shared++
  return shared / Math.max(ta.size, tb.size)
}

describe('content lint: story vs widget question', () => {
  it('no story last line duplicates a widget question verbatim', () => {
    const hits: string[] = []
    for (const c of ALL_CASES) {
      const last = c.storyNoDigits[c.storyNoDigits.length - 1] ?? ''
      for (const q of ALL_QUESTIONS) {
        if (last === q) {
          hits.push(`${c.id} (${c.widget}): story last line === widget question`)
        }
      }
    }
    assert.deepEqual(hits, [], `verbatim duplicates:\n${hits.join('\n')}`)
  })

  it('no story last line near-duplicates a widget question (>0.8 token overlap)', () => {
    const hits: string[] = []
    for (const c of ALL_CASES) {
      const last = c.storyNoDigits[c.storyNoDigits.length - 1] ?? ''
      for (const q of ALL_QUESTIONS) {
        const ov = overlap(last, q)
        if (ov >= 0.8) {
          hits.push(`${c.id} (${c.widget}): ${ov.toFixed(2)} overlap with "${q}"`)
        }
      }
    }
    assert.deepEqual(hits, [], `near-duplicates:\n${hits.join('\n')}`)
  })
})
