import type { CaseDef } from '../engine/case.ts'
import { validateCaseData } from './validate.ts'

export const SUPPORTED_SCHEMA_VERSION = 1

export interface CasePack {
  packId: string
  schemaVersion: number
  grade: number
  title: string
  cases: CaseDef[]
}

export type ParseResult = { pack: CasePack } | { errors: string[] }

const GRADE_IDS = [1, 2, 3, 4, 5]

export function parsePack(raw: unknown): ParseResult {
  const errors: string[] = []
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { errors: ['pack must be an object'] }
  }
  const pack = raw as Record<string, unknown>
  const packId = typeof pack.packId === 'string' ? pack.packId : ''
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(packId)) errors.push('packId must be a slug')
  if (pack.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    errors.push(`schemaVersion must be ${SUPPORTED_SCHEMA_VERSION}`)
  }
  const grade = pack.grade
  if (typeof grade !== 'number' || !GRADE_IDS.includes(grade)) errors.push('grade must be one of one through five')
  if (typeof pack.title !== 'string') errors.push('title must be a string')
  if (!Array.isArray(pack.cases)) {
    errors.push('cases must be an array')
    return { errors }
  }
  const cases: CaseDef[] = []
  pack.cases.forEach((raw, i) => {
    const result = validateCaseData(raw)
    if ('errors' in result) errors.push(...result.errors.map((e) => `case ${i}: ${e}`))
    else cases.push(result.def)
  })
  const ids = new Set(cases.map((c) => c.id))
  if (ids.size !== cases.length) errors.push('case ids must be unique inside a pack')
  const badges = new Set(cases.map((c) => c.badge))
  if (badges.size !== cases.length) errors.push('badges must be unique inside a pack')
  const titles = new Set(cases.map((c) => c.titleNoDigits))
  if (titles.size !== cases.length) errors.push('titles must be unique inside a pack')
  if (errors.length > 0) return { errors }
  return { pack: { packId, schemaVersion: pack.schemaVersion as number, grade: grade as number, title: pack.title as string, cases } }
}

export const PACK_GRADES = [1, 2, 3, 4, 5] as const

const loaders: Record<number, () => Promise<unknown>> = {
  1: () => import('../../content/cases/grade-one.json', { with: { type: 'json' } }).then((m) => m.default),
  2: () => import('../../content/cases/grade-two.json', { with: { type: 'json' } }).then((m) => m.default),
  3: () => import('../../content/cases/grade-three.json', { with: { type: 'json' } }).then((m) => m.default),
  4: () => import('../../content/cases/grade-four.json', { with: { type: 'json' } }).then((m) => m.default),
  5: () => import('../../content/cases/grade-five.json', { with: { type: 'json' } }).then((m) => m.default),
}

const loaded = new Map<number, CasePack>()

// Loads one grade's pack on demand and caches it. A rejected pack throws:
// a broken pack must never silently shrink the town map.
export async function loadPack(grade: number): Promise<CasePack> {
  const cached = loaded.get(grade)
  if (cached) return cached
  const loader = loaders[grade]
  if (!loader) throw new Error(`no content pack for grade ${grade}`)
  const raw = await loader()
  const result = parsePack(raw)
  if ('errors' in result) {
    throw new Error(`grade ${grade} content pack rejected: ${result.errors.join('; ')}`)
  }
  loaded.set(grade, result.pack)
  return result.pack
}

export async function loadAllPacks(): Promise<CasePack[]> {
  return Promise.all(GRADE_IDS.map((g) => loadPack(g)))
}

export function packForGrade(grade: number): CasePack | undefined {
  return loaded.get(grade)
}

export function loadedGrades(): number[] {
  return GRADE_IDS.filter((g) => loaded.has(g))
}
