import type { CaseDef } from '../engine/case.ts'

export const c9Stand: CaseDef = {
  id: 'c9-stand',
  group: 'financial literacy',
  kidLabel: 'money sense',
  badge: 'fee-payer',
  widget: 'coins',
  titleNoDigits: 'The Snack-Stand Fee',
  titleDigits: 'The Snack-Stand Fee',
  storyNoDigits: [
    'Detectives pay a small fee at the snack stand.',
    'The fee is shown in the coin picture. Pay the same amount.',
  ],
  storyDigits: [
    'Detectives pay a small fee at the snack stand.',
    'The fee is shown in coins. Pay the same amount with your own coins.',
  ],
  questionNoDigits: 'Tap coins to pay the exact fee.',
  questionDigits: 'Count mixed coins to pay the exact fee.',
  puzzle: { kind: 'coins', target: [25, 25, 10, 5] },
}
