import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parsePack } from '../src/content/packs.ts'
import type { CasePack } from '../src/content/packs.ts'
import { checkGenerated, generateCases } from './generate.ts'

const WORDS: Record<number, string> = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five' }
const SEED = 2026

function loadPacks(): Record<number, { raw: unknown; pack: CasePack; path: string }> {
  const dir = join(import.meta.dirname, '..', 'content', 'cases')
  const out: Record<number, { raw: unknown; pack: CasePack; path: string }> = {}
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.json')) continue
    const path = join(dir, file)
    const raw: unknown = JSON.parse(readFileSync(path, 'utf8'))
    const result = parsePack(raw)
    if ('errors' in result) throw new Error(`${file}: ${result.errors.join('; ')}`)
    out[result.pack.grade] = { raw, pack: result.pack, path }
  }
  return out
}

const packs = loadPacks()
let totalAdded = 0
for (const gradeStr of Object.keys(packs)) {
  const grade = Number(gradeStr)
  const { raw, pack, path } = packs[grade]
  const { cases, shortfalls } = generateCases(grade, pack.packId, pack.cases, SEED)
  const errors = checkGenerated(cases)
  if (errors.length > 0) throw new Error(`generated cases rejected: ${errors.join('; ')}`)
  const merged = [...pack.cases, ...cases]
  const next = { ...(raw as Record<string, unknown>), cases: merged }
  const check = parsePack(next)
  if ('errors' in check) throw new Error(`${path} after merge: ${check.errors.join('; ')}`)
  writeFileSync(path, JSON.stringify(next, null, 2) + '\n')
  totalAdded += cases.length
  const note = shortfalls.length > 0 ? ` [below target: ${shortfalls.join(', ')}]` : ''
  console.log(`grade ${grade}: +${cases.length} generated (${merged.length} total)${note}`)
}
console.log(`done: ${totalAdded} generated cases`)
