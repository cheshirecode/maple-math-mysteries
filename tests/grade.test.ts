import assertStrict from 'node:assert/strict'
import { describe, it } from 'node:test'
import { GRADES, ACTIVE_GRADES, WORD, gradeCases, gradeWord, isGradeActive } from '../src/grades.ts'
import { CASES, CASES_G1, CASES_G2, CASES_G4, CASES_G5 } from '../src/cases/index.ts'
import { migrate } from '../src/state.ts'

describe('grade model', () => {
  it('five grades exist with word numerals', () => {
    assertStrict.deepEqual([...GRADES], [1, 2, 3, 4, 5])
    for (const g of GRADES) {
      assertStrict(/\d/.test(WORD[g]) === false, `word for grade ${g} must be digit-free`)
    }
  })

  it('digit-free labels use words, digits mode uses numerals', () => {
    assertStrict.equal(gradeWord(3, false), 'three')
    assertStrict.equal(gradeWord(3, true), '3')
  })

  it('every grade is active and carries its own case set', () => {
    assertStrict.deepEqual([...ACTIVE_GRADES], [1, 2, 3, 4, 5])
    const registry: Record<number, typeof CASES> = { 1: CASES_G1, 2: CASES_G2, 3: CASES, 4: CASES_G4, 5: CASES_G5 }
    for (const g of GRADES) {
      assertStrict.ok(isGradeActive(g), `grade ${g} must be active`)
      assertStrict.deepEqual(gradeCases(g), registry[g])
    }
  })

  it('migrate stamps a valid grade and rejects junk', () => {
    assertStrict.equal(migrate({ grade: 4 }).grade, 4)
    assertStrict.equal(migrate({}).grade, 3)
    assertStrict.equal(migrate({ grade: 'four' }).grade, 3)
    assertStrict.equal(migrate({ grade: 99 }).grade, 3)
  })
})