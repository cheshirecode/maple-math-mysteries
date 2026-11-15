import { packForGrade } from './content/packs.ts'
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
  10: 'ten',
  11: 'eleven',
  12: 'twelve',
  13: 'thirteen',
  14: 'fourteen',
  15: 'fifteen',
  16: 'sixteen',
  17: 'seventeen',
  18: 'eighteen',
  19: 'nineteen',
  20: 'twenty',
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
