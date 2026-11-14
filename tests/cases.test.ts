import { describe, it } from 'node:test'
import assertStrict from 'node:assert/strict'
import { CASES } from '../src/cases/index.ts'
import { validateCase } from '../src/engine/case.ts'

describe('digits guard', () => {
  it('every case has digit-free titles, stories, and questions', () => {
    const failures = CASES.flatMap(validateCase)
    assertStrict.deepEqual(failures, [])
  })

  it('every case names a known BC content group', () => {
    for (const c of CASES) {
      assertStrict(CASES.some((x) => x.group === c.group), `unknown group ${c.group}`)
    }
  })

  it('case ids are unique', () => {
    const ids = new Set(CASES.map((c) => c.id))
    assertStrict.equal(ids.size, CASES.length)
  })

  it('digits variants exist where the puzzle carries numerals', () => {
    for (const c of CASES) {
      if (c.puzzle.kind === 'blocks' || c.puzzle.kind === 'dots') {
        assertStrict(typeof c.storyDigits !== 'undefined', `${c.id} needs storyDigits`)
        assertStrict(typeof c.questionDigits !== 'undefined', `${c.id} needs questionDigits`)
      }
    }
  })
})

describe('validateCase rejects digits in no-digit fields', () => {
  it('flags a digit in storyNoDigits', () => {
    const probe = { ...CASES[0], id: 'probe', storyNoDigits: ['4 clues were left'] }
    const failures = validateCase(probe)
    assertStrict(failures.some((f) => f.includes('storyNoDigits')))
  })
})
