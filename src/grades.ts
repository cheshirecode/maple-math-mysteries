import { CASES, CASES_G1, CASES_G2, CASES_G4, CASES_G5 } from './cases/index.ts'
import type { CaseDef } from './engine/case.ts'

export const GRADES = [1, 2, 3, 4, 5] as const
export const ACTIVE_GRADES = [1, 2, 3, 4, 5] as const
export const WORD: Record<number, string> = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
}

export const COUNT_WORD: Record<number, string> = {
  0: 'zero',
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
}

export function isGradeActive(grade: number): boolean {
  return (ACTIVE_GRADES as readonly number[]).includes(grade)
}

export function gradeWord(grade: number, digitsMode: boolean): string {
  return digitsMode ? String(grade) : WORD[grade] ?? String(grade)
}

const BY_GRADE: Record<number, CaseDef[]> = {
  1: CASES_G1,
  2: CASES_G2,
  3: CASES,
  4: CASES_G4,
  5: CASES_G5,
}

export function gradeCases(grade: number): CaseDef[] {
  return BY_GRADE[grade] ?? []
}