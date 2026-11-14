import type { CaseDef } from '../engine/case.ts'

export const c8Spinner: CaseDef = {
  id: 'c8-spinner',
  group: 'likelihood of simulated events',
  kidLabel: 'chance',
  badge: 'chance-teller',
  widget: 'spinner',
  titleNoDigits: 'The Likely Spinner',
  titleDigits: 'The Likely Spinner',
  storyNoDigits: [
    'The fair booth hides a spinner with coloured slices.',
    'Some colours cover more of the dial. Those land more often.',
  ],
  storyDigits: [
    'The fair booth hides a spinner with coloured slices.',
    'Bigger slices are more likely. Smaller slices are less likely.',
  ],
  questionNoDigits: 'Which colour lands most often?',
  questionDigits: 'Which colour is most likely?',
  puzzle: {
    kind: 'spinner',
    slices: [
      { colour: 'red', weight: 6 },
      { colour: 'blue', weight: 3 },
      { colour: 'gold', weight: 1 },
    ],
    answer: 'red',
  },
}
