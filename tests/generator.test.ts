import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { numToWords } from '../src/numwords.ts'
import { fingerprint, generateCases, checkGenerated, BAND_FLOOR } from '../scripts/generate.ts'
import { parsePack, loadPack, loadAllPacks } from '../src/content/packs.ts'

const SEED = 2026

function gradePackRaw(grade: number): { packId: string; cases: unknown[] } {
  const words: Record<number, string> = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five' }
  return JSON.parse(readFileSync(join(import.meta.dirname, '..', 'content', 'cases', `grade-${words[grade]}.json`), 'utf8'))
}

describe('pack generator', () => {
  it('renders edge values as digit-free words', () => {
    assert.equal(numToWords(105), 'one hundred five')
    assert.equal(numToWords(340), 'three hundred forty')
    assert.equal(numToWords(999), 'nine hundred ninety-nine')
    for (const n of [0, 7, 20, 47, 99, 200, 867]) {
      assert.ok(!/\d/.test(numToWords(n)), `${n} rendered with a digit`)
    }
  })

  it('is reproducible for the same seed and input', () => {
    const raw = gradePackRaw(3)
    const pack = parsePack(raw)
    assert.ok('pack' in pack)
    const first = generateCases(3, pack.pack.packId, pack.pack.cases, SEED)
    const second = generateCases(3, pack.pack.packId, pack.pack.cases, SEED)
    assert.deepEqual(first, second)
  })

  it('reports bands whose puzzle space is smaller than their target', () => {
    const raw = gradePackRaw(3)
    const pack = parsePack(raw)
    assert.ok('pack' in pack)
    const { shortfalls } = generateCases(3, pack.pack.packId, pack.pack.cases, SEED)
    assert.ok(shortfalls.includes('fraction'), 'fraction space (parts six to twelve) cannot reach ten')
  })

  it('a different seed mints different puzzles', () => {
    const raw = gradePackRaw(3)
    const pack = parsePack(raw)
    assert.ok('pack' in pack)
    // Thin the input to one compare case so both seeds must mint new ones.
    const starved = pack.pack.cases.filter((c) => c.widget === 'compare')
    const a = generateCases(3, pack.pack.packId, starved, SEED).cases
    const b = generateCases(3, pack.pack.packId, starved, SEED + 1).cases
    assert.ok(a.length > 0 && b.length > 0, 'a starved band must mint cases under any seed')
    const fa = new Set(a.map((c) => fingerprint(c.widget, c.puzzle)))
    const fb = new Set(b.map((c) => fingerprint(c.widget, c.puzzle)))
    assert.notDeepEqual([...fa], [...fb])
  })

  it('every generated case passes the pack validator and merges cleanly', () => {
    for (const grade of [1, 2, 3, 4, 5]) {
      const raw = gradePackRaw(grade)
      const pack = parsePack(raw)
      assert.ok('pack' in pack)
      const { cases } = generateCases(grade, pack.pack.packId, pack.pack.cases, SEED)
      assert.deepEqual(checkGenerated(cases), [], `grade ${grade} generated cases must validate`)
      const merged = { ...(raw as object), cases: [...pack.pack.cases, ...cases] }
      const result = parsePack(merged)
      assert.ok('pack' in result, `grade ${grade} merged pack rejected: ${'errors' in result ? result.errors.join('; ') : ''}`)
    }
  })

  it('never mints a semantic duplicate', () => {
    const raw = gradePackRaw(3)
    const pack = parsePack(raw)
    assert.ok('pack' in pack)
    const { cases } = generateCases(3, pack.pack.packId, pack.pack.cases, SEED)
    const fps = [
      ...pack.pack.cases.map((c) => fingerprint(c.widget, c.puzzle)),
      ...cases.map((c) => fingerprint(c.widget, c.puzzle)),
    ]
    assert.equal(new Set(fps).size, fps.length)
  })

  it('lifts every band to the floor and mints pack-scoped unique ids', async () => {
    const ids = new Set((await loadAllPacks()).flatMap((p) => p.cases).map((c) => c.id))
    for (const grade of [1, 2, 3, 4, 5]) {
      const raw = gradePackRaw(grade)
      const pack = parsePack(raw)
      assert.ok('pack' in pack)
      const { cases } = generateCases(grade, pack.pack.packId, pack.pack.cases, SEED)
      const merged = [...pack.pack.cases, ...cases]
      for (const kind of ['dots', 'blocks', 'arrays', 'fraction', 'pattern', 'measure', 'crate', 'spinner', 'coins', 'compare', 'combine']) {
        assert.ok(merged.filter((c) => c.widget === kind).length >= BAND_FLOOR, `grade ${grade} ${kind} band below floor`)
      }
      for (const c of cases) {
        assert.ok(c.id.startsWith(`${pack.pack.packId}-x`), `${c.id} is not pack-scoped`)
        assert.ok(!ids.has(c.id), `${c.id} collides with an existing case`)
        ids.add(c.id)
      }
    }
  })

  it('the validator catches a deliberately broken generated shape', () => {
    const raw = gradePackRaw(3)
    const pack = parsePack(raw)
    assert.ok('pack' in pack)
    const broken = {
      id: 'probe-broken',
      group: 'addition and subtraction to 1000',
      kidLabel: 'probe',
      badge: 'probe-badge',
      widget: 'combine',
      titleNoDigits: 'The Broken Probe',
      storyNoDigits: ['A probe line.'],
      puzzle: { kind: 'combine', op: 'take', a: { hundreds: 2, tens: 0, ones: 0 }, b: { hundreds: 5, tens: 0, ones: 0 } },
    } as const
    const errors = checkGenerated([broken as never])
    assert.ok(errors.some((e) => e.includes('combine')), 'validator did not flag the broken combine')
  })
})
