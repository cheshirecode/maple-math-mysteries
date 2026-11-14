import type { CaseDef } from '../engine/case.ts'

export const c4Pie: CaseDef = {
  id: 'c4-pie',
  group: 'fraction concepts',
  kidLabel: 'equal parts',
  badge: 'fair-baker',
  widget: 'fraction',
  titleNoDigits: 'The Bake-Sale Pie',
  titleDigits: 'The Bake-Sale Pie',
  storyNoDigits: [
    'The bake sale needs a fair pie.',
    'Six friends share one pie. Every part must be the same size, so every friend gets a fair share.',
  ],
  storyDigits: [
    'The bake sale needs a fair pie.',
    'Cut the pie into equal parts. Fractions are equal shares of a whole.',
  ],
  puzzle: { kind: 'fraction', parts: 6 },
}
