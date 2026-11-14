import type { CaseDef } from '../engine/case.ts'

export const c7Crate: CaseDef = {
  id: 'c7-crate',
  group: '3d objects and graphs',
  kidLabel: 'shapes and graphs',
  badge: 'crate-spotter',
  widget: 'crate',
  titleNoDigits: 'The Crate Clue',
  titleDigits: 'The Crate Clue',
  storyNoDigits: [
    'The trophy was taken in a folding crate.',
    'A flat net was left behind. Match it to the crate.',
  ],
  storyDigits: [
    'The trophy was taken in a folding crate.',
    'A flat net was left behind. Count its faces to find the crate.',
  ],
  puzzle: { kind: 'crate', shape: 'cube', suspects: [6, 5, 3] },
}
