import type { CaseDef } from '../engine/case.ts'

export const c2Fare: CaseDef = {
  id: 'c2-fare',
  group: 'addition and subtraction to 1000',
  kidLabel: 'adding and subtracting',
  badge: 'fare-friend',
  widget: 'dots',
  titleNoDigits: 'The Streetcar Fare',
  titleDigits: 'The Streetcar Fare',
  storyNoDigits: [
    'Two friends share one fare on the streetcar.',
    'One friend already holds part of the fare in tickets.',
  ],
  storyDigits: [
    'Two friends share one fare on the streetcar.',
    'One friend already holds some of the tickets.',
  ],
  questionNoDigits: 'Which picture completes the pair of tickets?',
  questionDigits: 'What pairs with the first pile to make the whole fare?',
  puzzle: { kind: 'dots', pairTarget: 20, pairA: 13 },
}
