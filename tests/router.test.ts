import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { formatRoute, parseHash } from '../src/lib/router.ts'

describe('hash router', () => {
  it('parses the three depths', () => {
    assert.deepEqual(parseHash('#/grade-three'), { grade: 'grade-three' })
    assert.deepEqual(parseHash('#/grade-three/combine'), { grade: 'grade-three', band: 'combine' })
    assert.deepEqual(parseHash('#/grade-three/combine/c16-bridge'), {
      grade: 'grade-three',
      band: 'combine',
      caseId: 'c16-bridge',
    })
  })

  it('degrades malformed hashes per shape, never crashes', () => {
    assert.deepEqual(parseHash(''), { grade: '' })
    assert.deepEqual(parseHash('#'), { grade: '' })
    // extra segments drop: the grammar holds three slots, junk values are the
    // caller's to resolve (grade-nine normalizes to the default route in app).
    assert.deepEqual(parseHash('#/grade-nine/bogus/nope/extra'), {
      grade: 'grade-nine',
      band: 'bogus',
      caseId: 'nope',
    })
  })

  it('round-trips format(parse(route))', () => {
    const routes = [
      { grade: 'grade-three' },
      { grade: 'grade-one', band: 'blocks' },
      { grade: 'grade-two', band: 'coins', caseId: 'g2-fare' },
    ]
    for (const r of routes) {
      assert.equal(formatRoute(parseHash(formatRoute(r))), formatRoute(r))
    }
  })
})
