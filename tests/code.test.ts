import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { deriveCodeHash, newSalt, verifyCodeHash } from '../src/save/code.ts'

describe('access code', () => {
  it('set and verify round-trip', async () => {
    const salt = newSalt()
    const hash = await deriveCodeHash('maplesyrup', salt)
    assert(await verifyCodeHash('maplesyrup', salt, hash))
  })

  it('rejects a wrong code', async () => {
    const salt = newSalt()
    const hash = await deriveCodeHash('maplesyrup', salt)
    assert(!(await verifyCodeHash('pancakehouse', salt, hash)))
  })

  it('salt changes the hash', async () => {
    const a = await deriveCodeHash('maplesyrup', newSalt())
    const b = await deriveCodeHash('maplesyrup', newSalt())
    assert.notEqual(a, b)
  })
})
