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

// The grade-three year in concept order: place value first, chance and money
// last. Other grades follow the same sequence with their own case sets.
// The grade-three year in concept order: place value, then counting, then
// comparing and operating, then the wider strands. Bands open in this order
// and each band lists its cases warm-up first.
export const CONCEPT_SEQUENCE: WidgetKind[] = [
  'blocks',
  'dots',
  'compare',
  'combine',
  'arrays',
  'fraction',
  'pattern',
  'measure',
  'crate',
  'spinner',
  'coins',
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
function bandUnlocked(
  cases: CaseDef[],
  kind: WidgetKind,
  doneSet: Set<string>,
): boolean {
  if (cases.some((c) => c.widget === kind && doneSet.has(c.id))) return true
  const position = CONCEPT_SEQUENCE.indexOf(kind)
  if (position <= 0) return true
  const prev = CONCEPT_SEQUENCE[position - 1]
  const prevCases = cases.filter((c) => c.widget === prev)
  if (prevCases.length === 0) return true
  const prevSolved = prevCases.filter((c) => doneSet.has(c.id)).length
  return prevSolved >= Math.min(UNLOCK_AFTER_SOLVED, prevCases.length)
}

// Cards the map shows for this grade: every unlocked band's cases, in concept
// order. Locked bands collapse to shelves in the caller.
export function visibleCases(cases: CaseDef[], completed: string[]): CaseDef[] {
  const doneSet = new Set(completed)
  const out: CaseDef[] = []
  for (const kind of CONCEPT_SEQUENCE) {
    const bandCases = cases.filter((c) => c.widget === kind)
    if (bandCases.length === 0) continue
    if (!bandUnlocked(cases, kind, doneSet)) continue
    out.push(...sortBandCases(bandCases))
  }
  return out
}

export function lockedConcepts(cases: CaseDef[], completed: string[]): { kind: WidgetKind; count: number }[] {
  const doneSet = new Set(completed)
  const out: { kind: WidgetKind; count: number }[] = []
  for (const kind of CONCEPT_SEQUENCE) {
    const bandCases = cases.filter((c) => c.widget === kind)
    if (bandCases.length === 0) continue
    if (!bandUnlocked(cases, kind, doneSet)) out.push({ kind, count: bandCases.length })
  }
  return out
}
