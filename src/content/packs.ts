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
  if (errors.length > 0) return { errors }
  return { pack: { packId, schemaVersion: pack.schemaVersion as number, grade: grade as number, title: pack.title as string, cases } }
}

import g1 from '../../content/cases/grade-one.json' with { type: 'json' }
import g2 from '../../content/cases/grade-two.json' with { type: 'json' }
import g3 from '../../content/cases/grade-three.json' with { type: 'json' }
import g4 from '../../content/cases/grade-four.json' with { type: 'json' }
import g5 from '../../content/cases/grade-five.json' with { type: 'json' }

const BUILTIN_RAW: unknown[] = [g1, g2, g3, g4, g5]

function loadBuiltin(): CasePack[] {
  const packs: CasePack[] = []
  for (const raw of BUILTIN_RAW) {
    const result = parsePack(raw)
    if ('errors' in result) {
      throw new Error(`builtin content pack rejected: ${result.errors.join('; ')}`)
    }
    packs.push(result.pack)
  }
  return packs
}

export const BUILTIN_PACKS: CasePack[] = loadBuiltin()

export const ALL_CASES: CaseDef[] = BUILTIN_PACKS.flatMap((p) => p.cases)

export function packForGrade(grade: number): CasePack | undefined {
  return BUILTIN_PACKS.find((p) => p.grade === grade)
}
