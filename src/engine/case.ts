export type WidgetKind =
  | 'dots'
  | 'blocks'
  | 'arrays'
  | 'fraction'
  | 'pattern'
  | 'measure'
  | 'crate'
  | 'spinner'
  | 'coins'
  | 'compare'
  | 'combine'

export interface BlockPicture {
  hundreds: number
  tens: number
  ones: number
}

export type PuzzleData =
  | { kind: 'dots'; pairTarget: number; pairA: number }
  | { kind: 'blocks'; hundreds: number; tens: number; ones: number }
  | { kind: 'arrays'; rows: number; cols: number }
  | { kind: 'fraction'; parts: number }
  | { kind: 'pattern'; steps: number[]; big?: boolean }
  | { kind: 'measure'; cups: number; options: number[] }
  | { kind: 'crate'; shape: 'cube' | 'prism' | 'cylinder'; suspects: number[] }
  | { kind: 'spinner'; slices: { colour: string; weight: number }[]; answer: string }
  | { kind: 'coins'; target: number[] }
  | { kind: 'compare'; a: BlockPicture; b: BlockPicture; more: 'a' | 'b' }
  | { kind: 'combine'; op: 'add' | 'take'; a: BlockPicture; b: BlockPicture }

export interface CaseDef {
  id: string
  group: string
  kidLabel: string
  badge: string
  widget: WidgetKind
  titleNoDigits: string
  titleDigits?: string
  storyNoDigits: string[]
  storyDigits?: string[]
  puzzle: PuzzleData
}

export const BC_GROUPS = [
  'number to 1000',
  'addition and subtraction to 1000',
  'multiplication and division concepts',
  'fraction concepts',
  'patterns and pattern rules',
  'measurement and time',
  '3d objects and graphs',
  'likelihood of simulated events',
  'financial literacy',
] as const

export function validateCase(def: CaseDef): string[] {
  const errors: string[] = []
  const digit = /\d/
  if (digit.test(def.titleNoDigits)) errors.push(`${def.id}: titleNoDigits has digits`)
  if (digit.test(def.kidLabel)) errors.push(`${def.id}: kidLabel has digits`)
  for (const line of def.storyNoDigits) if (digit.test(line)) errors.push(`${def.id}: storyNoDigits line has digits`)
  if (!BC_GROUPS.includes(def.group as (typeof BC_GROUPS)[number]))
    errors.push(`${def.id}: unknown group ${def.group}`)
  return errors
}
