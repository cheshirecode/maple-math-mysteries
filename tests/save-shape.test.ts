import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { BUILTIN_PACKS, ALL_CASES } from '../src/content/packs.ts'

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

describe('save shape: case ids', () => {
  it('every case id matches the slug regex', () => {
    for (const c of ALL_CASES) {
      assert.match(c.id, SLUG, `${c.id}: not a slug`)
    }
  })

  it('case ids are unique within each pack', () => {
    for (const pack of BUILTIN_PACKS) {
      const ids = pack.cases.map((c) => c.id)
      assert.equal(new Set(ids).size, ids.length, `duplicate ids in pack ${pack.packId}`)
    }
  })

  it('case ids are globally unique across all packs', () => {
    const all = ALL_CASES.map((c) => c.id)
    assert.equal(new Set(all).size, all.length, `duplicate ids across packs`)
  })

  it('badges are globally unique across all packs', () => {
    const all = ALL_CASES.map((c) => c.badge)
    assert.equal(new Set(all).size, all.length, `duplicate badges across packs`)
  })
})
