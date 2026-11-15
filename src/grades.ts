import { packForGrade } from './content/packs.ts'
import type { CaseDef } from './engine/case.ts'
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
