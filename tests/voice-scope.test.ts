import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const VOICE_MODULES = new Set(['voice.ts', 'run.ts'])

function srcFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...srcFiles(path))
    else if (entry.name.endsWith('.ts')) out.push(path)
  }
  return out
}

test('speech synthesis stays a fixed-overhead capability, not per-content code', () => {
  const srcRoot = join(import.meta.dirname, '..', 'src')
  const files = srcFiles(srcRoot)
  assert.ok(files.length > 0, 'expected to scan src files')
  for (const file of files) {
    const rel = file.slice(srcRoot.length + 1)
    const name = file.split('/').pop() ?? ''
    if (rel.startsWith('engine') && name === 'run.ts') continue
    if (VOICE_MODULES.has(name)) continue
    assert.ok(
      !/\bspeak/i.test(readFileSync(file, 'utf8')),
      `speech code leaked outside voice.ts/run.ts: ${rel}`,
    )
  }
})
