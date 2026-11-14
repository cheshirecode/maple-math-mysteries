export type WidgetKind = 'dots' | 'blocks' | 'arrays' | 'fraction' | 'pattern'

export type PuzzleData =
  | { kind: 'dots'; count: number; pairTarget: number; pairA: number }
  | { kind: 'blocks'; hundreds: number; tens: number; ones: number }
  | { kind: 'arrays'; rows: number; cols: number }
  | { kind: 'fraction'; parts: number }
  | { kind: 'pattern'; steps: number[] }

export interface CaseDef {
  id: string
  group: string
  badge: string
  widget: WidgetKind
  titleNoDigits: string
  titleDigits?: string
  storyNoDigits: string[]
  storyDigits?: string[]
  questionNoDigits: string
  questionDigits?: string
  puzzle: PuzzleData
}

export const BC_GROUPS = [
  'number to 1000',
  'addition and subtraction to 1000',
  'multiplication and division concepts',
  'fraction concepts',
  'patterns and pattern rules',
] as const

export function validateCase(def: CaseDef): string[] {
  const errors: string[] = []
  const digit = /\d/
  if (digit.test(def.titleNoDigits)) errors.push(`${def.id}: titleNoDigits has digits`)
  for (const line of def.storyNoDigits) if (digit.test(line)) errors.push(`${def.id}: storyNoDigits line has digits`)
  if (digit.test(def.questionNoDigits)) errors.push(`${def.id}: questionNoDigits has digits`)
  if (!BC_GROUPS.includes(def.group as (typeof BC_GROUPS)[number]))
    errors.push(`${def.id}: unknown group ${def.group}`)
  return errors
}
