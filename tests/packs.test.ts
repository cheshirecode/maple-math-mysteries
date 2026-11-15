import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parsePack, SUPPORTED_SCHEMA_VERSION, ALL_CASES, BUILTIN_PACKS } from '../src/content/packs.ts'
import { GRADES } from '../src/grades.ts'

const goodCase = {
  id: 'probe-case',
  group: 'number to 1000',
  kidLabel: 'probe',
  badge: 'probe-badge',
  widget: 'dots',
  titleNoDigits: 'The Probe',
  storyNoDigits: ['A probe story line.'],
  puzzle: { kind: 'dots', pairTarget: 10, pairA: 4 },
}

function packWith(overrides: Record<string, unknown>): unknown {
  return { packId: 'probe-pack', schemaVersion: SUPPORTED_SCHEMA_VERSION, grade: 1, title: 'Probe pack', cases: [goodCase], ...overrides }
}

describe('content pack loader', () => {
  it('builtin packs loaded and cover every grade', () => {
    assert.equal(BUILTIN_PACKS.length, GRADES.length)
    assert.ok(ALL_CASES.length >= 52, `expected the full library, got ${ALL_CASES.length}`)
  })

  it('accepts a well-formed pack', () => {
    const result = parsePack(packWith({}))
    assert.ok('pack' in result)
  })

  it('rejects an unsupported schema version', () => {
    const result = parsePack(packWith({ schemaVersion: 99 }))
    assert.ok('errors' in result)
    assert.ok(result.errors.some((e) => e.includes('schemaVersion')))
  })

  it('rejects digits in a story line', () => {
    const result = parsePack(packWith({ cases: [{ ...goodCase, storyNoDigits: ['4 coins were left'] }] }))
    assert.ok('errors' in result)
    assert.ok(result.errors.some((e) => e.includes('digits')))
  })

  it('rejects duplicate case ids inside a pack', () => {
    const result = parsePack(packWith({ cases: [goodCase, goodCase] }))
    assert.ok('errors' in result)
    assert.ok(result.errors.some((e) => e.includes('unique')))
  })

  it('rejects an unknown widget kind', () => {
    const result = parsePack(packWith({ cases: [{ ...goodCase, widget: 'crossword' }] }))
    assert.ok('errors' in result)
    assert.ok(result.errors.some((e) => e.includes('widget')))
  })

  it('rejects illegal coin values', () => {
    const result = parsePack(packWith({
      cases: [{ ...goodCase, widget: 'coins', puzzle: { kind: 'coins', target: [3] } }],
    }))
    assert.ok('errors' in result)
    assert.ok(result.errors.some((e) => e.includes('coin')))
  })

  it('rejects a compare puzzle whose more side is wrong', () => {
    const result = parsePack(packWith({
      cases: [{
        ...goodCase,
        widget: 'compare',
        puzzle: { kind: 'compare', a: { hundreds: 1, tens: 0, ones: 0 }, b: { hundreds: 2, tens: 0, ones: 0 }, more: 'a' },
      }],
    }))
    assert.ok('errors' in result)
    assert.ok(result.errors.some((e) => e.includes('larger')))
  })

  it('rejects a non-slug pack id', () => {
    const result = parsePack(packWith({ packId: 'Bad Pack!' }))
    assert.ok('errors' in result)
    assert.ok(result.errors.some((e) => e.includes('packId')))
  })
})
