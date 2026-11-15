import { describe, it } from 'node:test'
import assertStrict from 'node:assert/strict'
import { loadAllPacks } from '../src/content/packs.ts'

const ALL_CASES = (await loadAllPacks()).flatMap((p) => p.cases)
import { validateCase, BC_GROUPS } from '../src/engine/case.ts'

describe('BC coverage', () => {
  it('every BC content group has at least one case', () => {
    for (const g of BC_GROUPS) {
      assertStrict(ALL_CASES.some((c) => c.group === g), `no case covers ${g}`)
    }
  })

  it('badges and kid labels are unique and present', () => {
    const badges = new Set(ALL_CASES.map((c) => c.badge))
    assertStrict.equal(badges.size, ALL_CASES.length)
    for (const c of ALL_CASES) {
      assertStrict(c.kidLabel.length > 0, `${c.id} needs a kidLabel`)
    }
  })

  it('puzzle kind matches the widget kind', () => {
    for (const c of ALL_CASES) {
      assertStrict.equal(c.puzzle.kind, c.widget, `${c.id}: puzzle/widget mismatch`)
    }
  })

  it('spinner answers name a slice with positive weight', () => {
    for (const c of ALL_CASES) {
      if (c.puzzle.kind !== 'spinner') continue
      const puzzle = c.puzzle
      const hit = puzzle.slices.find((s) => s.colour === puzzle.answer)
      assertStrict(hit, `${c.id}: answer missing from slices`)
      assertStrict((hit?.weight ?? 0) > 0, `${c.id}: answer weight must be positive`)
    }
  })

  it('coins targets use real canadian coin values', () => {
    const legal = new Set([1, 5, 10, 25])
    for (const c of ALL_CASES) {
      if (c.puzzle.kind !== 'coins') continue
      for (const v of c.puzzle.target) {
        assertStrict(legal.has(v), `${c.id}: coin value ${v} not canadian`)
      }
    }
  })

  it('measure and crate options include the answer', () => {
    for (const c of ALL_CASES) {
      if (c.puzzle.kind === 'measure') {
        assertStrict(c.puzzle.options.includes(c.puzzle.cups), `${c.id}: cups missing from options`)
      }
      if (c.puzzle.kind === 'crate') {
        const want = { cube: 6, prism: 6, cylinder: 3 }[c.puzzle.shape]
        assertStrict(c.puzzle.suspects.includes(want), `${c.id}: answer missing from suspects`)
      }
    }
  })

  it('compare puzzles name the strictly larger side', () => {
    const value = (p: { hundreds: number; tens: number; ones: number }) => p.hundreds * 100 + p.tens * 10 + p.ones
    for (const c of ALL_CASES) {
      if (c.puzzle.kind !== 'compare') continue
      const va = value(c.puzzle.a)
      const vb = value(c.puzzle.b)
      assertStrict.notEqual(va, vb, `${c.id}: compare sides must differ`)
      assertStrict.equal(c.puzzle.more, va > vb ? 'a' : 'b', `${c.id}: more does not name the larger side`)
    }
  })

  it('combine puzzles land inside three digits', () => {
    const value = (p: { hundreds: number; tens: number; ones: number }) => p.hundreds * 100 + p.tens * 10 + p.ones
    for (const c of ALL_CASES) {
      if (c.puzzle.kind !== 'combine') continue
      const start = value(c.puzzle.a)
      const change = value(c.puzzle.b)
      const result = c.puzzle.op === 'add' ? start + change : start - change
      assertStrict.ok(result > 0, `${c.id}: combine result must be positive`)
      assertStrict.ok(result <= 999, `${c.id}: combine result must stay inside three digits`)
    }
  })
})

describe('digits guard', () => {
  it('every case has digit-free titles, stories, and questions', () => {
    const failures = ALL_CASES.flatMap(validateCase)
    assertStrict.deepEqual(failures, [])
  })

  it('every case names a known BC content group', () => {
    for (const c of ALL_CASES) {
      assertStrict(ALL_CASES.some((x) => x.group === c.group), `unknown group ${c.group}`)
    }
  })

  it('case ids are unique', () => {
    const ids = new Set(ALL_CASES.map((c) => c.id))
    assertStrict.equal(ids.size, ALL_CASES.length)
  })

  it('digits variants exist for every case', () => {
    for (const c of ALL_CASES) {
      assertStrict(typeof c.storyDigits !== 'undefined', `${c.id} needs storyDigits`)
    }
  })
})

describe('validateCase rejects digits in no-digit fields', () => {
  it('flags a digit in storyNoDigits', () => {
    const probe = { ...ALL_CASES[0], id: 'probe', storyNoDigits: ['4 clues were left'] }
    const failures = validateCase(probe)
    assertStrict(failures.some((f) => f.includes('storyNoDigits')))
  })
})
