import type { CaseDef } from '../engine/case.ts'

export const CASES_G2: CaseDef[] = [
  {
    id: 'g2-grid',
    group: 'multiplication and division concepts',
    kidLabel: 'rows and columns',
    badge: 'row-reader',
    widget: 'arrays',
    titleNoDigits: 'The Muddy Grid',
    titleDigits: 'The Muddy Grid',
    storyNoDigits: [
      'A raccoon crossed the muddy yard at night.',
      'The footprints sit in neat rows. Count the rows.',
    ],
    storyDigits: [
      'A raccoon crossed the muddy yard at night.',
      'The footprints form an array of equal rows. Count the rows.',
    ],
    puzzle: { kind: 'arrays', rows: 3, cols: 5 },
  },
  {
    id: 'g2-fare',
    group: 'financial literacy',
    kidLabel: 'money sense',
    badge: 'fare-finder',
    widget: 'coins',
    titleNoDigits: 'The Bus Fare',
    titleDigits: 'The Bus Fare',
    storyNoDigits: [
      'The bus driver takes the exact fare.',
      'Pay the same coins shown in the picture.',
    ],
    storyDigits: [
      'The bus driver takes the exact fare.',
      'Pay the same amount shown in coins.',
    ],
    puzzle: { kind: 'coins', target: [10, 10, 5] },
  },
  {
    id: 'g2-tickets',
    group: 'addition and subtraction to 1000',
    kidLabel: 'adding to twenty',
    badge: 'ticket-splitter',
    widget: 'dots',
    titleNoDigits: 'The Ticket Roll',
    titleDigits: 'The Ticket Roll',
    storyNoDigits: [
      'The conductor punches tickets for the ride.',
      'One friend already holds part of the roll. Count the empty spots.',
    ],
    storyDigits: [
      'The conductor punches tickets for the ride.',
      'One friend already holds part of the tickets. How many more?',
    ],
    puzzle: { kind: 'dots', pairTarget: 20, pairA: 12 },
  },
]
