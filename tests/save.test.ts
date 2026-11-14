import assertStrict from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildSaveText, decodeSaveText, crc32 } from '../src/save/string.ts'
import { emptyProgress } from '../src/state.ts'

describe('save-string round trip', () => {
  it('encodes, decodes, and restores equal state', async () => {
    const p = { ...emptyProgress(), completedCases: ['c1-safe'], minutesPlayed: 7 }
    const built = await buildSaveText(p)
    assertStrict.match(built.text, /^MDA1\.1\.[0-9a-f]+\./)
    const decoded = await decodeSaveText(built.text)
    assertStrict.equal(decoded.version, 1)
    assertStrict.deepEqual(decoded.progress, p)
  })

  it('round-trips the same state on both compression paths', async () => {
    const p = emptyProgress()
    const built = await buildSaveText(p)
    const again = await buildSaveText(p)
    assertStrict.equal(built.text, again.text)
    assertStrict.deepEqual(await decodeSaveText(again.text), await decodeSaveText(built.text))
  })

  it('rejects a tampered payload byte', async () => {
    const built = await buildSaveText(emptyProgress())
    const parts = built.text.split('.')
    const tampered = `MDA1.${parts[1]}.${parts[2]}.${parts[3].slice(0, -2)}xx`
    await assertStrict.rejects(decodeSaveText(tampered), /checksum|shape/)
  })

  it('rejects a wrong magic', async () => {
    await assertStrict.rejects(decodeSaveText('XXX1.1.0.aa'), /shape/)
  })

  it('computes a known crc32', () => {
    assertStrict.equal(crc32(new TextEncoder().encode('123456789')), 0xcbf43926)
  })

  it('round-trips unicode badges and a full case list', async () => {
    const p = {
      ...emptyProgress(),
      completedCases: ['c1-safe', 'c2-fare', 'c3-loot', 'c4-pie', 'c5-trail'],
      badges: ['safe-opener', '🕵️', '界'],
      minutesPlayed: 999,
    }
    const decoded = await decodeSaveText((await buildSaveText(p)).text)
    assertStrict.deepEqual(decoded.progress, p)
  })

  it('rejects an unknown future version', async () => {
    const built = await buildSaveText(emptyProgress())
    const parts = built.text.split('.')
    const future = `MDA1.99.${parts[2]}.${parts[3]}`
    await assertStrict.rejects(decodeSaveText(future), /unsupported/)
  })

  it('trims surrounding whitespace on import', async () => {
    const p = { ...emptyProgress(), minutesPlayed: 5 }
    const text = (await buildSaveText(p)).text
    const decoded = await decodeSaveText(`  ${text} \n`)
    assertStrict.deepEqual(decoded.progress, p)
  })
})
