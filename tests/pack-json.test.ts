import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const casesDir = join(__dirname, '..', 'content', 'cases')

const GRADES = ['one', 'two', 'three', 'four', 'five']

describe('pack JSON round-trips', () => {
  for (const g of GRADES) {
    it(`grade-${g}.json parses and round-trips via JSON.parse(JSON.stringify)`, () => {
      const raw = readFileSync(join(casesDir, `grade-${g}.json`), 'utf8')
      const obj = JSON.parse(raw)
      const round = JSON.parse(JSON.stringify(obj))
      assert.deepEqual(round, obj, `grade-${g}.json round-trip mismatch`)
    })

    it(`grade-${g}.json has required top-level keys`, () => {
      const raw = readFileSync(join(casesDir, `grade-${g}.json`), 'utf8')
      const obj = JSON.parse(raw)
      assert.ok(typeof obj.packId === 'string', `packId missing`)
      assert.ok(typeof obj.schemaVersion === 'number', `schemaVersion missing`)
      assert.ok(Array.isArray(obj.cases), `cases missing`)
    })
  }

  it('every case has storyNoDigits as a non-empty array', () => {
    for (const g of GRADES) {
      const raw = readFileSync(join(casesDir, `grade-${g}.json`), 'utf8')
      const obj = JSON.parse(raw)
      for (const c of obj.cases) {
        assert.ok(Array.isArray(c.storyNoDigits), `${c.id}: storyNoDigits not an array`)
        assert.ok(c.storyNoDigits.length > 0, `${c.id}: storyNoDigits empty`)
      }
    }
  })
})
