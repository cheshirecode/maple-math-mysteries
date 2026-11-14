import type { CaseDef } from '../engine/case.ts'

export const c3Loot: CaseDef = {
  id: 'c3-loot',
  group: 'multiplication and division concepts',
  kidLabel: 'groups and sharing',
  badge: 'fair-sharer',
  widget: 'arrays',
  titleNoDigits: 'The Equal Loot',
  titleDigits: 'The Equal Loot',
  storyNoDigits: [
    'The suspect left a trail across the muddy yard.',
    'Footprints sit in neat rows. Count the rows to find the hiding spot.',
  ],
  storyDigits: [
    'The suspect left a trail across the muddy yard.',
    'The footprints form an array of equal rows.',
  ],
  puzzle: { kind: 'arrays', rows: 4, cols: 6 },
}
