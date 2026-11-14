import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

function srcFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...srcFiles(path))
    else if (entry.name.endsWith('.ts')) out.push(path)
  }
  return out
}

test('no speech synthesis remains in src', () => {
  const files = srcFiles(join(import.meta.dirname, '..', 'src'))
  assert.ok(files.length > 0, 'expected to scan src files')
  for (const file of files) {
    assert.ok(!/\bspeak/i.test(readFileSync(file, 'utf8')), `voice regression in ${file}`)
  }
})
