import { BC_GROUPS, type CaseDef, type WidgetKind } from '../engine/case.ts'

const DIGIT = /\d/
const WIDGET_KINDS: WidgetKind[] = [
  'dots',
  'blocks',
  'arrays',
  'fraction',
  'pattern',
  'measure',
  'crate',
  'spinner',
  'coins',
  'compare',
  'combine',
]
const FACES: Record<string, number> = { cube: 6, prism: 6, cylinder: 3 }
const COIN_VALUES = [1, 5, 10, 25]

function valueOf(p: { hundreds: number; tens: number; ones: number }): number {
  return p.hundreds * 100 + p.tens * 10 + p.ones
}

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

function num(x: unknown): number | null {
  return typeof x === 'number' && Number.isFinite(x) ? x : null
}

function str(x: unknown): string | null {
  return typeof x === 'string' ? x : null
}

function strArray(x: unknown): string[] | null {
  return Array.isArray(x) && x.every((v) => typeof v === 'string') ? (x as string[]) : null
}

function blockPicture(x: unknown): { hundreds: number; tens: number; ones: number } | null {
  if (!isObject(x)) return null
  const h = num(x.hundreds)
  const t = num(x.tens)
  const o = num(x.ones)
  if (h === null || t === null || o === null) return null
  if (h < 0 || t < 0 || o < 0 || t > 9 || o > 9) return null
  return { hundreds: h, tens: t, ones: o }
}

export function validateCaseFull(def: CaseDef): string[] {
  const errors: string[] = []
  const id = def.id
  if (DIGIT.test(def.titleNoDigits)) errors.push(`${id}: titleNoDigits has digits`)
  if (DIGIT.test(def.kidLabel)) errors.push(`${id}: kidLabel has digits`)
  for (const line of def.storyNoDigits) if (DIGIT.test(line)) errors.push(`${id}: storyNoDigits has digits`)
  if (!BC_GROUPS.includes(def.group as (typeof BC_GROUPS)[number])) errors.push(`${id}: unknown group ${def.group}`)
  if (!WIDGET_KINDS.includes(def.widget)) errors.push(`${id}: unknown widget ${def.widget}`)
  if (def.widget !== def.puzzle.kind) errors.push(`${id}: puzzle kind ${def.puzzle.kind} does not match widget ${def.widget}`)
  const p = def.puzzle
  if (p.kind === 'spinner') {
    const hit = p.slices.find((s) => s.colour === p.answer)
    if (!hit) errors.push(`${id}: spinner answer missing from slices`)
    else if (hit.weight <= 0) errors.push(`${id}: spinner answer weight must be positive`)
  }
  if (p.kind === 'coins' && p.target.some((v) => !COIN_VALUES.includes(v))) {
    errors.push(`${id}: coin value outside canadian set`)
  }
  if (p.kind === 'measure' && !p.options.includes(p.cups)) errors.push(`${id}: cups missing from options`)
  if (p.kind === 'crate' && !p.suspects.includes(FACES[p.shape])) errors.push(`${id}: answer missing from suspects`)
  if (p.kind === 'compare') {
    const va = valueOf(p.a)
    const vb = valueOf(p.b)
    if (va === vb) errors.push(`${id}: compare sides must differ`)
    else if (p.more !== (va > vb ? 'a' : 'b')) errors.push(`${id}: more does not name the larger side`)
  }
  if (p.kind === 'combine') {
    const result = p.op === 'add' ? valueOf(p.a) + valueOf(p.b) : valueOf(p.a) - valueOf(p.b)
    if (result <= 0 || result > 999) errors.push(`${id}: combine result must land inside three digits`)
  }
  return errors
}

export function validateCaseData(raw: unknown): { def: CaseDef } | { errors: string[] } {
  if (!isObject(raw)) return { errors: ['case must be an object'] }
  const errors: string[] = []
  const id = str(raw.id) ?? 'unnamed'
  const need = (key: string, check: (v: unknown) => boolean, what: string) => {
    if (!check(raw[key])) errors.push(`${id}: ${what}`)
  }
  need('id', (v) => typeof str(v) === 'string' && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(str(v) ?? ''), 'id must be a slug')
  need('group', (v) => typeof str(v) === 'string', 'group must be a string')
  need('kidLabel', (v) => typeof str(v) === 'string', 'kidLabel must be a string')
  need('badge', (v) => typeof str(v) === 'string' && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(str(v) ?? ''), 'badge must be a slug')
  need('widget', (v) => typeof str(v) === 'string' && WIDGET_KINDS.includes(str(v) as WidgetKind), 'widget must be a known kind')
  need('titleNoDigits', (v) => typeof str(v) === 'string', 'titleNoDigits must be a string')
  const title = str(raw.titleNoDigits) ?? ''
  if (DIGIT.test(title)) errors.push(`${id}: titleNoDigits has digits`)
  const kidLabel = str(raw.kidLabel) ?? ''
  if (DIGIT.test(kidLabel)) errors.push(`${id}: kidLabel has digits`)
  const story = strArray(raw.storyNoDigits)
  if (!story) errors.push(`${id}: storyNoDigits must be a string array`)
  else for (const line of story) if (DIGIT.test(line)) errors.push(`${id}: storyNoDigits has digits`)
  if (raw.storyDigits !== undefined && !strArray(raw.storyDigits)) errors.push(`${id}: storyDigits must be a string array`)
  if (!isObject(raw.puzzle)) {
    errors.push(`${id}: puzzle must be an object`)
    return { errors }
  }
  const puzzle = raw.puzzle
  const kind = str(puzzle.kind)
  if (!kind || !WIDGET_KINDS.includes(kind as WidgetKind)) {
    errors.push(`${id}: puzzle kind must be a known kind`)
    return { errors }
  }
  let puzzleOk = true
  const needP = (key: string, check: (v: unknown) => boolean, what: string) => {
    if (!check(puzzle[key])) {
      errors.push(`${id}: puzzle ${what}`)
      puzzleOk = false
    }
  }
  if (kind === 'dots') {
    needP('pairTarget', (v) => (num(v) ?? 0) > 0, 'pairTarget must be a positive number')
    needP('pairA', (v) => (num(v) ?? 0) > 0, 'pairA must be a positive number')
  } else if (kind === 'blocks') {
    needP('hundreds', (v) => (num(v) ?? -1) >= 0, 'hundreds must be a number')
    needP('tens', (v) => (num(v) ?? -1) >= 0, 'tens must be a number')
    needP('ones', (v) => (num(v) ?? -1) >= 0, 'ones must be a number')
  } else if (kind === 'arrays') {
    needP('rows', (v) => (num(v) ?? 0) > 0, 'rows must be a positive number')
    needP('cols', (v) => (num(v) ?? 0) > 0, 'cols must be a positive number')
  } else if (kind === 'fraction') {
    needP('parts', (v) => (num(v) ?? 0) >= 2, 'parts must be at least two')
  } else if (kind === 'pattern') {
    needP('steps', (v) => Array.isArray(v) && v.length >= 2 && v.every((x) => (num(x) ?? -1) > 0), 'steps must be positive numbers')
  } else if (kind === 'measure') {
    needP('cups', (v) => (num(v) ?? 0) > 0, 'cups must be a positive number')
    needP('options', (v) => Array.isArray(v) && v.every((x) => (num(x) ?? -1) > 0), 'options must be positive numbers')
  } else if (kind === 'crate') {
    needP('shape', (v) => ['cube', 'prism', 'cylinder'].includes(str(v) ?? ''), 'shape must be cube, prism or cylinder')
    needP('suspects', (v) => Array.isArray(v) && v.every((x) => (num(x) ?? -1) > 0), 'suspects must be positive numbers')
  } else if (kind === 'spinner') {
    needP('slices', (v) => Array.isArray(v) && v.every((x) => isObject(x) && typeof str((x as Record<string, unknown>).colour) === 'string' && (num((x as Record<string, unknown>).weight) ?? 0) > 0), 'slices must be colour and positive weight pairs')
    needP('answer', (v) => typeof str(v) === 'string', 'answer must be a colour name')
  } else if (kind === 'coins') {
    needP('target', (v) => Array.isArray(v) && v.every((x) => COIN_VALUES.includes(num(x) ?? 0)), 'target must use canadian coin values')
  } else if (kind === 'compare') {
    needP('a', (v) => blockPicture(v) !== null, 'a must be a block picture')
    needP('b', (v) => blockPicture(v) !== null, 'b must be a block picture')
    needP('more', (v) => str(v) === 'a' || str(v) === 'b', 'more must name a side')
  } else if (kind === 'combine') {
    needP('op', (v) => str(v) === 'add' || str(v) === 'take', 'op must be add or take')
    needP('a', (v) => blockPicture(v) !== null, 'a must be a block picture')
    needP('b', (v) => blockPicture(v) !== null, 'b must be a block picture')
  }
  if (!puzzleOk) return { errors }
  const def = {
    id: str(raw.id) ?? id,
    group: str(raw.group) ?? '',
    kidLabel,
    badge: str(raw.badge) ?? '',
    widget: str(raw.widget) as WidgetKind,
    titleNoDigits: title,
    titleDigits: str(raw.titleDigits) ?? undefined,
    storyNoDigits: story ?? [],
    storyDigits: strArray(raw.storyDigits) ?? undefined,
    puzzle: raw.puzzle as CaseDef['puzzle'],
  }
  errors.push(...validateCaseFull(def))
  if (errors.length > 0) return { errors }
  return { def }
}
