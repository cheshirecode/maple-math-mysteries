import assertStrict from 'node:assert/strict'
import { describe, it } from 'node:test'
import { migrate, emptyProgress, CURRENT_SCHEMA } from '../src/state.ts'

describe('migrate', () => {
  it('returns empty progress for null, undefined, and non-objects', () => {
    assertStrict.deepEqual(migrate(null), emptyProgress())
    assertStrict.deepEqual(migrate(undefined), emptyProgress())
    assertStrict.deepEqual(migrate('nope'), emptyProgress())
    assertStrict.deepEqual(migrate(42), emptyProgress())
    assertStrict.deepEqual(migrate([]), emptyProgress())
  })

  it('keeps valid fields and stamps the current schema', () => {
    const out = migrate({
      schemaVersion: 0,
      completedCases: ['c1-safe'],
      badges: ['safe-opener'],
      minutesPlayed: 12,
      digitsMode: true,
      showDigitsDefault: false,
    })
    assertStrict.equal(out.schemaVersion, CURRENT_SCHEMA)
    assertStrict.deepEqual(out.completedCases, ['c1-safe'])
    assertStrict.equal(out.minutesPlayed, 12)
    assertStrict.equal(out.digitsMode, true)
  })

  it('drops junk instead of crashing', () => {
    const out = migrate({
      completedCases: ['ok', 7, null],
      badges: 'badge',
      minutesPlayed: 'many',
      digitsMode: 'yes',
    } as Record<string, unknown>)
    assertStrict.deepEqual(out.completedCases, ['ok'])
    assertStrict.deepEqual(out.badges, [])
    assertStrict.equal(out.minutesPlayed, 0)
    assertStrict.equal(out.digitsMode, false)
  })

  it('round-trips through its own output', () => {
    const once = migrate({ minutesPlayed: 3 })
    const twice = migrate(once)
    assertStrict.deepEqual(once, twice)
  })
})