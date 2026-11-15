import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { countWord } from '../src/grades.ts'
import { loadAllPacks } from '../src/content/packs.ts'

const BUILTIN_PACKS = await loadAllPacks()

describe('render safety: countWord', () => {
  it('returns a digit-free word for every n from 0 to 250', () => {
    const DIGIT = /\d/
    for (let n = 0; n <= 250; n++) {
      const w = countWord(n)
      assert.ok(typeof w === 'string', `countWord(${n}) is not a string`)
      assert.ok(w.length > 0, `countWord(${n}) is empty`)
      assert.equal(DIGIT.test(w), false, `countWord(${n}) contains digits: ${w}`)
    }
  })

  it('never returns undefined for any n in the pack-size range', () => {
    const max = Math.max(...BUILTIN_PACKS.map((p) => p.cases.length))
    for (let n = 0; n <= max + 10; n++) {
      assert.notEqual(countWord(n), undefined, `countWord(${n}) is undefined`)
    }
  })

  it('covers the largest pack size', () => {
    const max = Math.max(...BUILTIN_PACKS.map((p) => p.cases.length))
    assert.equal(typeof countWord(max), 'string')
  })

  it('zero word is "zero"', () => {
    assert.equal(countWord(0), 'zero')
  })
})
