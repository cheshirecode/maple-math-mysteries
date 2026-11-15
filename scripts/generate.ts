import type { CaseDef, WidgetKind } from '../src/engine/case.ts'
import { validateCaseFull } from '../src/content/validate.ts'
import { numToWords } from '../src/numwords.ts'
import { ACTORS, BANDS, COLOURS, type BandSpec } from './bands.ts'

export const BAND_FLOOR = 3
const FACES: Record<string, number> = { cube: 6, prism: 6, cylinder: 3 }
const KIND_NOUN: Record<WidgetKind, string> = {
  dots: 'Roll',
  blocks: 'Stacks',
  arrays: 'Rows',
  fraction: 'Share',
  pattern: 'Pile',
  measure: 'Pour',
  crate: 'Box',
  spinner: 'Wheel',
  coins: 'Payment',
  compare: 'Count',
  combine: 'Total',
}
const KIND_LABEL: Record<WidgetKind, string> = {
  dots: 'counting pairs',
  blocks: 'place value',
  arrays: 'equal rows',
  fraction: 'fair shares',
  pattern: 'growing patterns',
  measure: 'measuring and pouring',
  crate: 'shapes and nets',
  spinner: 'chance',
  coins: 'money sense',
  compare: 'comparing numbers',
  combine: 'add and take away',
}
const GUIDANCE: Record<WidgetKind, string> = {
  dots: 'Count the empty spots, then choose the matching picture.',
  blocks: 'Stack the blocks to match the target picture.',
  arrays: 'Count the equal rows you see.',
  fraction: 'Look for the piece cut into fair shares.',
  pattern: 'Say the rule, then pick the next pile.',
  measure: 'Compare the fills before you tap.',
  crate: 'Fold the net in your head, then choose.',
  spinner: 'The biggest slice lands most often.',
  coins: 'Pay with the same coins as the picture.',
  compare: 'Look at both piles, then choose the bigger one.',
  combine: 'Build the answer stacks before you check.',
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([k, v]) => [k, canonical(v)]),
    )
  }
  return value
}

export function fingerprint(widget: WidgetKind, puzzle: unknown): string {
  return `${widget}:${JSON.stringify(canonical(puzzle))}`
}

type Rng = () => number

function randInt(rng: Rng, lo: number, hi: number): number {
  return lo + Math.floor(rng() * (hi - lo + 1))
}

function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function decompose(value: number): { hundreds: number; tens: number; ones: number } {
  return { hundreds: Math.floor(value / 100), tens: Math.floor((value % 100) / 10), ones: value % 10 }
}

function genPuzzle(kind: WidgetKind, band: BandSpec, grade: number, rng: Rng): unknown {
  if (kind === 'dots') {
    const t = randInt(rng, Math.max(4, band.min), band.max)
    return { kind, pairTarget: t, pairA: randInt(rng, 1, t - 1) }
  }
  if (kind === 'blocks') {
    return { kind, ...decompose(randInt(rng, band.min, band.max)) }
  }
  if (kind === 'arrays') {
    return { kind, rows: randInt(rng, band.min, band.max), cols: randInt(rng, 2, 6) }
  }
  if (kind === 'fraction') {
    return { kind, parts: randInt(rng, band.min, band.max) }
  }
  if (kind === 'pattern') {
    const step = randInt(rng, 1, 3)
    const start = randInt(rng, 1, Math.max(1, 20 - step * 3))
    return { kind, steps: [start, start + step, start + step * 2, start + step * 3] }
  }
  if (kind === 'measure') {
    const cups = randInt(rng, band.min, band.max)
    const options = [cups, Math.max(1, cups - 2), cups + 2]
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[options[i], options[j]] = [options[j], options[i]]
    }
    return { kind, cups, options }
  }
  if (kind === 'crate') {
    const shape = pick(rng, ['cube', 'prism', 'cylinder'] as const)
    const want = FACES[shape]
    const others = [3, 4, 5, 6].filter((f) => f !== want)
    const suspects = [want, ...others.slice(0, 2)]
    for (let i = suspects.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[suspects[i], suspects[j]] = [suspects[j], suspects[i]]
    }
    return { kind, shape, suspects }
  }
  if (kind === 'spinner') {
    const colours = [...COLOURS]
    const n = randInt(rng, 2, 3)
    const chosen: string[] = []
    while (chosen.length < n) {
      const c = pick(rng, colours)
      if (!chosen.includes(c)) chosen.push(c)
    }
    const weights: number[] = []
    const used = new Set<number>()
    for (let i = 0; i < n; i++) {
      let w = randInt(rng, 1, 4)
      while (used.has(w)) w = randInt(rng, 1, 4)
      used.add(w)
      weights.push(w)
    }
    const max = Math.max(...weights)
    const answer = chosen[weights.indexOf(max)]
    return { kind, slices: chosen.map((colour, i) => ({ colour, weight: weights[i] })), answer }
  }
  if (kind === 'coins') {
    const k = randInt(rng, band.min, Math.min(band.max, 8))
    const target: number[] = []
    for (let i = 0; i < k; i++) target.push(pick(rng, [25, 10, 5, 1]))
    return { kind, target }
  }
  if (kind === 'compare') {
    const a = randInt(rng, band.min, band.max)
    let b = randInt(rng, band.min, band.max)
    while (b === a) b = randInt(rng, band.min, band.max)
    return { kind, a: decompose(a), b: decompose(b), more: a > b ? 'a' : 'b' }
  }
  // combine
  const op = rng() < 0.5 ? 'add' : 'take'
  let a: number
  let b: number
  if (grade === 1) {
    if (op === 'add') {
      a = randInt(rng, 1, 8)
      b = randInt(rng, 1, 9 - a)
    } else {
      a = randInt(rng, 2, 9)
      b = randInt(rng, 1, a - 1)
    }
  } else if (grade === 2) {
    if (op === 'add') {
      a = randInt(rng, 10, 89)
      b = randInt(rng, 10, 99 - a)
    } else {
      a = randInt(rng, 21, 99)
      b = randInt(rng, 10, a - 1)
    }
  } else {
    if (op === 'add') {
      a = randInt(rng, 100, 899)
      b = randInt(rng, band.min, Math.min(band.max, 999 - a))
    } else {
      a = randInt(rng, Math.max(201, band.min), band.max)
      b = randInt(rng, band.min, a - 1)
    }
  }
  return { kind, op, a: decompose(a), b: decompose(b) }
}

function cap(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase())
}

function makeStory(kind: WidgetKind, band: BandSpec, rng: Rng): { storyNoDigits: string[]; storyDigits: string[] } {
  const who = pick(rng, ACTORS)
  const scene = pick(rng, band.scenes)
  const tNumber = kind === 'dots' ? randInt(rng, Math.max(4, band.min), band.max) : band.min
  const fill = (asDigits: boolean) =>
    scene.replace('{who}', who).replace(/\{t\}/g, asDigits ? String(tNumber) : numToWords(tNumber))
  return {
    storyNoDigits: [fill(false), GUIDANCE[kind]],
    storyDigits: [fill(true), GUIDANCE[kind]],
  }
}

export function generateCases(
  grade: number,
  packId: string,
  existing: CaseDef[],
  seed: number,
): { cases: CaseDef[] } {
  const bands = BANDS[grade]
  if (!bands) throw new Error(`no band table for grade ${grade}`)
  const rng = mulberry32(seed)
  const seen = new Set(existing.map((c) => fingerprint(c.widget, c.puzzle)))
  const takenBadges = new Set(existing.map((c) => c.badge))
  const cases: CaseDef[] = []
  let serial = existing.length + 1
  for (const [kind, band] of Object.entries(bands) as [WidgetKind, BandSpec][]) {
    const have = existing.filter((c) => c.widget === kind).length
    let need = Math.max(0, BAND_FLOOR - have)
    let attempts = 0
    while (need > 0) {
      attempts++
      if (attempts > 200) throw new Error(`band ${grade}/${kind}: cannot mint enough distinct cases`)
      const puzzle = genPuzzle(kind, band, grade, rng)
      const fp = fingerprint(kind, puzzle)
      if (seen.has(fp)) continue
      seen.add(fp)
      const who = pick(rng, ACTORS)
      const story = makeStory(kind, band, rng)
      let badge = `${kind}-${grade}-${serial}`
      while (takenBadges.has(badge)) badge = `${badge}-a`
      takenBadges.add(badge)
      const actor = cap(who)
      cases.push({
        id: `${packId}-x${serial}`,
        group: groupFor(kind),
        kidLabel: KIND_LABEL[kind],
        badge,
        widget: kind,
        titleNoDigits: `The ${actor} ${KIND_NOUN[kind]}`,
        storyNoDigits: story.storyNoDigits,
        storyDigits: story.storyDigits,
        puzzle: puzzle as CaseDef['puzzle'],
      })
      serial++
      need--
    }
  }
  return { cases }
}

function groupFor(kind: WidgetKind): string {
  const map: Partial<Record<WidgetKind, string>> = {
    dots: 'addition and subtraction to 1000',
    blocks: 'number to 1000',
    arrays: 'multiplication and division concepts',
    fraction: 'fraction concepts',
    pattern: 'patterns and pattern rules',
    measure: 'measurement and time',
    crate: '3d objects and graphs',
    spinner: 'likelihood of simulated events',
    coins: 'financial literacy',
    compare: 'number to 1000',
    combine: 'addition and subtraction to 1000',
  }
  return map[kind] ?? 'number to 1000'
}

export function checkGenerated(cases: CaseDef[]): string[] {
  return cases.flatMap((c) => validateCaseFull(c))
}
