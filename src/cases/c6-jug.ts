import type { CaseDef } from '../engine/case.ts'

export const c6Jug: CaseDef = {
  id: 'c6-jug',
  group: 'measurement and time',
  kidLabel: 'measuring and pouring',
  badge: 'jug-filler',
  widget: 'measure',
  titleNoDigits: 'The Thirsty Jug',
  titleDigits: 'The Thirsty Jug',
  storyNoDigits: [
    'The diner needs the right jug of juice for the recipe.',
    'Count the cupfuls the recipe asks for.',
  ],
  storyDigits: [
    'The diner needs the right jug of juice for the recipe.',
    'The recipe pours a set number of cupfuls.',
  ],
  questionNoDigits: 'Tap the jug that is right.',
  questionDigits: 'Which jug holds the right number of cupfuls?',
  puzzle: { kind: 'measure', cups: 4, options: [4, 2, 6] },
}
