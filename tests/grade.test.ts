import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { GRADES, WORD, gradeCases, gradeWord, isGradeActive } from '../src/grades.ts'
import { loadAllPacks, packForGrade } from '../src/content/packs.ts'

const BUILTIN_PACKS = await loadAllPacks()
import { migrate } from '../src/state.ts'

describe('grade model', () => {
  it('five grades exist with word numerals', () => {
    assert.deepEqual([...GRADES], [1, 2, 3, 4, 5])
    for (const g of GRADES) {
      assert(/\d/.test(WORD[g]) === false, `word for grade ${g} must be digit-free`)
    }
  })

  it('digit-free labels use words, digits mode uses numerals', () => {
    assert.equal(gradeWord(3, false), 'three')
    assert.equal(gradeWord(3, true), '3')
  })

  it('every grade has one content pack and gradeCases serves it', () => {
    assert.equal(BUILTIN_PACKS.length, GRADES.length)
    for (const g of GRADES) {
      const pack = packForGrade(g)
      assert.ok(pack, `grade ${g} needs a content pack`)
      assert.equal(pack?.grade, g)
      assert.ok(pack && pack.cases.length > 0, `grade ${g} pack needs cases`)
      assert.ok(isGradeActive(g), `grade ${g} must be active`)
      assert.deepEqual(gradeCases(g), pack?.cases)
    }
  })

  it('migrate stamps a valid grade and rejects junk', () => {
    assert.equal(migrate({ grade: 4 }).grade, 4)
    assert.equal(migrate({}).grade, 3)
    assert.equal(migrate({ grade: 'four' }).grade, 3)
    assert.equal(migrate({ grade: 99 }).grade, 3)
  })
})
