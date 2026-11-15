import { packForGrade } from './content/packs.ts'
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
  return packForGrade(grade) !== undefined
}

export function gradeWord(grade: number, digitsMode: boolean): string {
  return digitsMode ? String(grade) : WORD[grade] ?? String(grade)
}

export function gradeCases(grade: number): CaseDef[] {
  return packForGrade(grade)?.cases ?? []
}

// The grade-three year in concept order: place value first, chance and money
// last. Other grades follow the same sequence with their own case sets.
export const CONCEPT_SEQUENCE: WidgetKind[] = [
  'blocks',
  'compare',
  'dots',
  'combine',
  'arrays',
  'fraction',
  'pattern',
  'measure',
  'crate',
  'spinner',
  'coins',
]

const UNLOCK_AFTER_SOLVED = 3

// A concept band unlocks when the previous band has enough solved cases, or
// when the band itself already holds a completed case (replayed or imported
// progress stays visible instead of vanishing behind a lock).
function bandUnlocked(
  grade: number,
  kind: WidgetKind,
  doneSet: Set<string>,
): boolean {
  const cases = gradeCases(grade)
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
export function visibleCases(grade: number, completed: string[]): CaseDef[] {
  const doneSet = new Set(completed)
  const cases = gradeCases(grade)
  const out: CaseDef[] = []
  for (const kind of CONCEPT_SEQUENCE) {
    const bandCases = cases.filter((c) => c.widget === kind)
    if (bandCases.length === 0) continue
    if (!bandUnlocked(grade, kind, doneSet)) continue
    out.push(...bandCases)
  }
  return out
}

export function lockedConcepts(grade: number, completed: string[]): { kind: WidgetKind; count: number }[] {
  const doneSet = new Set(completed)
  const cases = gradeCases(grade)
  const out: { kind: WidgetKind; count: number }[] = []
  for (const kind of CONCEPT_SEQUENCE) {
    const bandCases = cases.filter((c) => c.widget === kind)
    if (bandCases.length === 0) continue
    if (!bandUnlocked(grade, kind, doneSet)) out.push({ kind, count: bandCases.length })
  }
  return out
}
