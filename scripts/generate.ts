import type { CaseDef, WidgetKind } from '../src/engine/case.ts'
import { validateCaseFull } from '../src/content/validate.ts'
import { numToWords } from '../src/numwords.ts'
import { ACTORS, BANDS, COLOURS, type BandSpec } from './bands.ts'

export const BAND_FLOOR = 3
const FACES: Record<string, number> = { cube: 6, prism: 6, cylinder: 3 }
const KIND_NOUNS: Record<WidgetKind, string[]> = {
  dots: ['Roll', 'Tickets', 'Pair', 'Bundle', 'Hand'],
  blocks: ['Stacks', 'Ladder', 'Tower', 'Safe', 'Wall'],
  arrays: ['Rows', 'Grid', 'Tracks', 'Lines', 'Ranks'],
  fraction: ['Share', 'Pie', 'Reel', 'Slice', 'Bar'],
  pattern: ['Pile', 'Trail', 'Rule', 'Heap', 'Run', 'Chain', 'Streak', 'Line'],
  measure: ['Pour', 'Kettle', 'Can', 'Cup', 'Jug'],
  crate: ['Box', 'Crate', 'Parcel', 'Net', 'Fold'],
  spinner: ['Wheel', 'Dial', 'Spin', 'Prize', 'Wheelbarrow'],
  coins: ['Payment', 'Till', 'Fee', 'Tab', 'Fare'],
  compare: ['Count', 'Tallies', 'Watch', 'Board', 'Gate'],
  combine: ['Total', 'Bridge', 'Ledger', 'Sum', 'Store'],
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


type VariantSpec = import('./bands.ts').VariantSpec

function digits3(n: number): [number, number, number] {
  return [Math.floor(n / 100), Math.floor((n % 100) / 10), n % 10]
}
function compose3(h: number, t: number, o: number): number {
  return h * 100 + t * 10 + o
}
function isRound(h: number, t: number, o: number): boolean {
  return t === 0 || o === 0
}
function isMixed(h: number, t: number, o: number): boolean {
  return t >= 1 && o >= 1
}
function shapeOk(shape: string, h: number, t: number, o: number): boolean {
  if (shape === 'round-round') return isRound(h, t, o)
  if (shape === 'mixed-mixed') return isMixed(h, t, o)
  return true // round-mixed constrains a only; caller checks sides
}

const REGROUP_DIFFICULTY: Record<string, string> = {
  none: 'warmup',
  ones: 'core',
  tens: 'core',
  double: 'tricky',
  'across-zero': 'tricky',
}

function genCombineVariant(v: VariantSpec & { kind: 'combine-regroup' }, rng: Rng): { puzzle: unknown; tags: string[] } | null {
  for (let i = 0; i < 400; i++) {
    const a = randInt(rng, 100, 899)
    const [ah, at, ao] = digits3(a)
    let b = 0
    if (v.op === 'add') {
      // carry structure from digit sums (ones carry -> tens get +1)
      const onesSum = ao + randInt(rng, 0, 9)
      const tensSum = at + randInt(rng, 0, 9)
      if (v.pattern === 'none' && (onesSum >= 10 || tensSum >= 10)) continue
      if (v.pattern === 'ones' && !(ao + (onesSum - ao) >= 10 && tensSum + 1 < 10)) continue
      if (v.pattern === 'tens' && !(onesSum < 10 && tensSum >= 10 && ah + Math.floor(tensSum / 10) <= 9)) continue
      if (v.pattern === 'double' && !(ao + (onesSum - ao) >= 10 && tensSum + 1 >= 10)) continue
      if (v.pattern === 'across-zero') continue // add has no borrow-across-zero
      const bo = onesSum - ao
      const bt = tensSum - at
      const bhMax = 9 - ah - (tensSum >= 10 ? 1 : 0)
      if (bo < 0 || bo > 9 || bt < 0 || bt > 9 || bhMax < 1) continue
      if (v.shape === 'round-mixed' && !(isRound(ah, at, ao) && isMixed(ah, bt, bo))) continue
      if (v.shape === 'round-round' && !(isRound(ah, at, ao) && isRound(ah, bt, bo))) continue
      if (v.shape === 'mixed-mixed' && !(isMixed(ah, at, ao) && isMixed(ah, bt, bo))) continue
      b = compose3(randInt(rng, 1, bhMax), bt, bo)
      const result = a + b
      if (result > 999 || result <= a) continue
      return {
        puzzle: { kind: 'combine', op: 'add', a: decompose(a), b: decompose(b) },
        tags: [REGROUP_DIFFICULTY[v.pattern], `regroup-${v.pattern}`, `shape-${v.shape}`, 'add'],
      }
    }
    // take
    const bh = randInt(rng, 1, ah)
    const bt = randInt(rng, 0, 9)
    const bo = randInt(rng, 0, 9)
    b = compose3(bh, bt, bo)
    if (b < 100 || b >= a) continue
    const borrowOnes = ao < bo
    const borrowTens = borrowOnes ? at - 1 < bt : at < bt
    const patternHit =
      v.pattern === 'none'
        ? !borrowOnes && !borrowTens
        : v.pattern === 'ones'
          ? borrowOnes && !borrowTens && at > 0
          : v.pattern === 'tens'
            ? !borrowOnes && borrowTens && ao >= bo
            : v.pattern === 'double'
              ? borrowOnes && borrowTens
              : at === 0 && ao < bo // across-zero
    if (!patternHit) continue
    if (v.pattern === 'across-zero' && at !== 0) continue
    if (v.shape === 'round-round' && !(isRound(ah, at, ao) && isRound(bh, bt, bo))) continue
    if (v.shape === 'mixed-mixed' && !(isMixed(ah, at, ao) && isMixed(bh, bt, bo))) continue
    return {
      puzzle: { kind: 'combine', op: 'take', a: decompose(a), b: decompose(b) },
      tags: [REGROUP_DIFFICULTY[v.pattern], `regroup-${v.pattern}`, `shape-${v.shape}`, 'take'],
    }
  }
  return null
}

const SKIP_WORDS: Record<number, string> = {
  1: 'one', 2: 'twos', 5: 'fives', 10: 'tens', 25: 'twenty-fives', 100: 'hundreds',
}

function genPatternSkip(v: VariantSpec & { kind: 'pattern-skip' }, who: string): { puzzle: unknown; tags: string[]; storyNoDigits: string[]; storyDigits: string[] } | null {
  const s = v.step
  const skipWord = { 2: 'twos', 5: 'fives', 10: 'tens', 25: 'twenty-fives', 100: 'hundreds' }[s]
  if (!skipWord) return null
  let start: number
  if (v.start !== undefined) {
    start = v.start
  } else if (v.backward) {
    start = s * 4
  } else {
    start = s
  }
  const dir = v.backward ? -1 : 1
  const steps = [0, 1, 2, 3].map((i) => start + dir * s * i)
  if (steps.some((n) => n < 0 || n > 1000)) return null
  const big = steps.some((n) => n > 20)
  const difficulty = big ? 'tricky' : 'core'
  const tags = [
    difficulty,
    `skip-${skipWord}`,
    ...(v.backward ? ['backward'] : []),
    ...(big ? ['base-ten'] : []),
  ]
  const line = v.backward
    ? `The ${who} counts backward by ${skipWord} down the trail.`
    : `The ${who} skip counts by ${skipWord} up the trail.`
  return { puzzle: { kind: 'pattern', steps, big }, tags, storyNoDigits: [line], storyDigits: [line] }
}

const TRAP_DIFFICULTY: Record<string, string> = {
  plain: 'warmup',
  reorder: 'core',
  'zero-place': 'core',
  boundary: 'tricky',
}

function genCompareVariant(v: VariantSpec & { kind: 'compare-trap' }, rng: Rng): { puzzle: unknown; tags: string[] } | null {
  for (let i = 0; i < 400; i++) {
    let ah = randInt(rng, 1, 9)
    let at = randInt(rng, 0, 9)
    let ao = randInt(rng, 0, 9)
    let bh = 0
    let bt = 0
    let bo = 0
    if (v.trap === 'plain') {
      bh = ah
      bt = at
      bo = ao
      if (v.deciding === 'hundreds') {
        while (bh === ah) bh = randInt(rng, 1, 9)
      } else if (v.deciding === 'tens') {
        while (bt === at) bt = randInt(rng, 0, 9)
      } else {
        while (bo === ao) bo = randInt(rng, 0, 9)
      }
    } else if (v.trap === 'reorder') {
      const digits = [randInt(rng, 1, 9), randInt(rng, 0, 9), randInt(rng, 0, 9)]
      ;[ah, at, ao] = digits as [number, number, number]
      const perms = [
        [ah, ao, at],
        [at, ah, ao],
        [at, ao, ah],
        [ao, ah, at],
        [ao, at, ah],
      ] as [number, number, number][]
      const valid = perms.filter(([h, t, o]) => h > 0 && compose3(h, t, o) !== compose3(ah, at, ao))
      if (valid.length === 0) continue
      const chosen = pick(rng, valid)
      bh = chosen[0]
      bt = chosen[1]
      bo = chosen[2]
      if (v.deciding === 'hundreds' && bh === ah) continue
      if (v.deciding === 'tens' && bt === at) continue
      if (v.deciding === 'ones' && bo === ao) continue
    } else if (v.trap === 'zero-place') {
      bh = ah
      if (v.deciding === 'tens') {
        at = 0
        bt = randInt(rng, 1, 9)
        while (ao !== bo) bo = randInt(rng, 0, 9)
      } else {
        ao = 0
        bo = randInt(rng, 1, 9)
        while (at !== bt) bt = randInt(rng, 0, 9)
      }
    } else {
      // boundary: a = h99, b = (h+1)00 + k
      ah = randInt(rng, 1, 8)
      at = 9
      ao = 9
      bh = ah + 1
      bt = 0
      bo = randInt(rng, 0, 9)
      if (v.deciding !== 'hundreds') continue
    }
    const a = compose3(ah, at, ao)
    const b = compose3(bh, bt, bo)
    if (a < 100 || b < 100 || a === b) continue
    return {
      puzzle: { kind: 'compare', a: decompose(a), b: decompose(b), more: a > b ? 'a' : 'b' },
      tags: [TRAP_DIFFICULTY[v.trap], `trap-${v.trap}`, `deciding-${v.deciding}`],
    }
  }
  return null
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

function makeStory(kind: WidgetKind, band: BandSpec, who: string, rng: Rng): { storyNoDigits: string[]; storyDigits: string[] } {
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
  takenTitles: Set<string> = new Set(),
): { cases: CaseDef[]; shortfalls: string[] } {
  const bands = BANDS[grade]
  if (!bands) throw new Error(`no band table for grade ${grade}`)
  const rng = mulberry32(seed)
  const seen = new Set(existing.map((c) => fingerprint(c.widget, c.puzzle)))
  const takenBadges = new Set(existing.map((c) => c.badge))
  for (const t of existing.map((c) => c.titleNoDigits)) takenTitles.add(t)
  const cases: CaseDef[] = []
  const shortfalls: string[] = []
  let serial = existing.length + 1
  for (const [kind, band] of Object.entries(bands) as [WidgetKind, BandSpec][]) {
    const have = existing.filter((c) => c.widget === kind).length
    const target = band.target ?? BAND_FLOOR
    let need = Math.max(0, target - have)
    const variants = [...(band.variants ?? [])]
    // shuffle variants so repeated runs with a new seed spread coverage
    for (let i = variants.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[variants[i], variants[j]] = [variants[j], variants[i]]
    }
    let attempts = 0
    while (need > 0) {
      attempts++
      if (attempts > 400) {
        if (have + cases.filter((c) => c.widget === kind).length < BAND_FLOOR) {
          throw new Error(`band ${grade}/${kind}: floor ${BAND_FLOOR} unreachable`)
        }
        shortfalls.push(kind)
        break
      }
      // One actor owns the case: the title and the story narrate the same
      // character. Picked before the variant loop so skip stories can name them.
      const who = pick(rng, ACTORS)
      let chosenActor = cap(who)
      // Prefer an unclaimed variant descriptor; fall back to the uniform draw
      // when the band has no variants or the descriptors run out (floor rule).
      let puzzle: unknown = null
      let caseTags: string[] = ['core']
      let skipStory: { storyNoDigits: string[]; storyDigits: string[] } | null = null
      while (variants.length > 0 && puzzle === null) {
        const v = variants.shift()
        if (!v) break
        if (v.kind === 'combine-regroup') {
          const cand = genCombineVariant(v, rng)
          if (cand && !seen.has(fingerprint(kind, cand.puzzle))) {
            puzzle = cand.puzzle
            caseTags = cand.tags
          }
        } else if (v.kind === 'compare-trap') {
          const cand = genCompareVariant(v, rng)
          if (cand && !seen.has(fingerprint(kind, cand.puzzle))) {
            puzzle = cand.puzzle
            caseTags = cand.tags
          }
        } else if (v.kind === 'pattern-skip') {
          const cand = genPatternSkip(v, chosenActor.toLowerCase())
          if (cand && !seen.has(fingerprint(kind, cand.puzzle))) {
            puzzle = cand.puzzle
            caseTags = cand.tags
            skipStory = { storyNoDigits: cand.storyNoDigits, storyDigits: cand.storyDigits }
          }
        }
      }
      if (puzzle === null) {
        puzzle = genPuzzle(kind, band, grade, rng)
        caseTags = ['core']
      }
      const fp = fingerprint(kind, puzzle)
      if (seen.has(fp)) continue
      seen.add(fp)
      // The first free title noun for this actor becomes the title.
      let noun = KIND_NOUNS[kind].find((n) => !takenTitles.has(`The ${chosenActor} ${n}`))
      if (noun === undefined) {
        for (const a of ACTORS) {
          const n = KIND_NOUNS[kind].find((x) => !takenTitles.has(`The ${cap(a)} ${x}`))
          if (n !== undefined) {
            chosenActor = cap(a)
            noun = n
            break
          }
        }
      }
      if (noun === undefined) {
        throw new Error(`title space exhausted for ${kind} in grade ${grade}`)
      }
      takenTitles.add(`The ${chosenActor} ${noun}`)
      const story = skipStory ?? makeStory(kind, band, chosenActor.toLowerCase(), rng)
      const storyNoDigits = story.storyNoDigits
      const storyDigits = story.storyDigits
      let badge = `${kind}-${grade}-${serial}`
      while (takenBadges.has(badge)) badge = `${badge}-a`
      takenBadges.add(badge)
      cases.push({
        id: `${packId}-x${serial}`,
        group: groupFor(kind),
        kidLabel: KIND_LABEL[kind],
        badge,
        widget: kind,
        titleNoDigits: `The ${chosenActor} ${noun}`,
        storyNoDigits,
        storyDigits,
        puzzle: puzzle as CaseDef['puzzle'],
        tags: caseTags,
      })
      serial++
      need--
    }
  }
  return { cases, shortfalls }
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
