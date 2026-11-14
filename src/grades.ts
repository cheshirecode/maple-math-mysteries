import { CASES } from './cases/index.ts'
import type { CaseDef } from './engine/case.ts'

export const GRADES = [1, 2, 3, 4, 5] as const
export const ACTIVE_GRADES = [3] as const
export const WORD: Record<number, string> = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
}

export function isGradeActive(grade: number): boolean {
  return (ACTIVE_GRADES as readonly number[]).includes(grade)
}

export function gradeWord(grade: number, digitsMode: boolean): string {
  return digitsMode ? String(grade) : WORD[grade] ?? String(grade)
}

export function gradeCases(grade: number): CaseDef[] {
  return isGradeActive(grade) ? CASES : []
}