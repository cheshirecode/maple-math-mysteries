import { packForGrade, PACK_GRADES } from './content/packs.ts'
import type { CaseDef, WidgetKind } from './engine/case.ts'
import { numToWords } from './numwords.ts'

export const GRADES = [1, 2, 3, 4, 5] as const
export const ACTIVE_GRADES = [1, 2, 3, 4, 5] as const

export const WORD: Record<number, string> = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
}

export function countWord(n: number): string {
  return numToWords(n)
}

export function isGradeActive(grade: number): boolean {
  return (PACK_GRADES as readonly number[]).includes(grade)
}

export function gradeWord(grade: number, digitsMode: boolean): string {
  return digitsMode ? String(grade) : WORD[grade] ?? String(grade)
}

export function gradeCases(grade: number): CaseDef[] {
  return packForGrade(grade)?.cases ?? []
}

export function gradeSlug(grade: number): string {
  return `grade-${WORD[grade] ?? grade}`
}

export function gradeFromSlug(slug: string): number | null {
  const m = /^grade-(one|two|three|four|five)$/.exec(slug)
  if (!m) return null
  return GRADES.find((g) => WORD[g] === m[1]) ?? null
}

// Topics are the kid-findable groupings: each band answers "what kind of
// math is this" rather than "which widget renders it". Skip counting gets its
// own band, split out of the pattern widget by tag.
export interface Topic {
  key: string
  label: string
  kinds: WidgetKind[]
  requireTagPrefix?: string
}

export const TOPICS: Topic[] = [
  { key: 'blocks', label: 'Place value', kinds: ['blocks'] },
  { key: 'dots', label: 'Counting facts', kinds: ['dots'] },
  { key: 'compare', label: 'Comparing numbers', kinds: ['compare'] },
  { key: 'combine', label: 'Add and take away', kinds: ['combine'] },
  { key: 'skip-counting', label: 'Skip counting', kinds: ['pattern'], requireTagPrefix: 'skip-' },
  { key: 'pattern', label: 'Growing patterns', kinds: ['pattern'] },
  { key: 'arrays', label: 'Equal rows', kinds: ['arrays'] },
  { key: 'fraction', label: 'Fair shares', kinds: ['fraction'] },
  { key: 'measure', label: 'Measuring', kinds: ['measure'] },
  { key: 'crate', label: 'Nets and shapes', kinds: ['crate'] },
  { key: 'spinner', label: 'Chance', kinds: ['spinner'] },
  { key: 'coins', label: 'Money', kinds: ['coins'] },
]

export const DIFFICULTY_ORDER = ['warmup', 'core', 'tricky']

function difficultyRank(c: CaseDef): number {
  const tag = c.tags?.find((t) => DIFFICULTY_ORDER.includes(t))
  return tag ? DIFFICULTY_ORDER.indexOf(tag) : 1
}

// Band display order: warm-up cases first, then core, then tricky.
export function sortBandCases(cases: CaseDef[]): CaseDef[] {
  return [...cases].sort((a, b) => difficultyRank(a) - difficultyRank(b))
}

const UNLOCK_AFTER_SOLVED = 3

// A concept band unlocks when the previous band has enough solved cases, or
// when the band itself already holds a completed case (replayed or imported
// progress stays visible instead of vanishing behind a lock).
function bandUnlocked(cases: CaseDef[], topic: Topic, doneSet: Set<string>): boolean {
  const own = topicCases(topic, cases)
  if (own.some((c) => doneSet.has(c.id))) return true
  const position = TOPICS.indexOf(topic)
  if (position <= 0) return true
  const prev = TOPICS[position - 1]
  const prevCases = topicCases(prev, cases)
  if (prevCases.length === 0) return true
  const prevSolved = prevCases.filter((c) => doneSet.has(c.id)).length
  return prevSolved >= Math.min(UNLOCK_AFTER_SOLVED, prevCases.length)
}

// Cards the map shows for this grade: every unlocked band's cases, in concept
// order. Locked bands collapse to shelves in the caller.
function topicCases(topic: Topic, cases: CaseDef[]): CaseDef[] {
  const tagPrefix = topic.requireTagPrefix
  return cases.filter(
    (c) =>
      topic.kinds.includes(c.widget) &&
      (!tagPrefix || (c.tags?.some((t) => t.startsWith(tagPrefix)) ?? false)),
  )
}

export function visibleCases(cases: CaseDef[], completed: string[]): CaseDef[] {
  const doneSet = new Set(completed)
  const out: CaseDef[] = []
  for (const topic of TOPICS) {
    const bandCases = topicCases(topic, cases)
    if (bandCases.length === 0) continue
    if (!bandUnlocked(cases, topic, doneSet)) continue
    out.push(...sortBandCases(bandCases))
  }
  return out
}

export function lockedTopics(cases: CaseDef[], completed: string[]): { key: string; label: string; count: number }[] {
  const doneSet = new Set(completed)
  const out: { key: string; label: string; count: number }[] = []
  for (const topic of TOPICS) {
    const bandCases = topicCases(topic, cases)
    if (bandCases.length === 0) continue
    if (!bandUnlocked(cases, topic, doneSet)) {
      out.push({ key: topic.key, label: topic.label, count: bandCases.length })
    }
  }
  return out
}
