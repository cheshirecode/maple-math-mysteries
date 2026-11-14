import type { CaseDef } from '../engine/case.ts'

export const c10Library: CaseDef = {
  id: 'c10-library',
  group: 'number to 1000',
  kidLabel: 'counting and place value',
  badge: 'ladder-climber',
  widget: 'blocks',
  titleNoDigits: 'The Library Ladder',
  titleDigits: 'The Library Ladder',
  storyNoDigits: [
    'The librarian stacks returns on a rolling ladder.',
    'Build the stacks that match the ladder picture.',
  ],
  storyDigits: [
    'The librarian stacks returns on a rolling ladder.',
    'Build the stacks: hundreds, tens, and ones blocks.',
  ],
  puzzle: { kind: 'blocks', hundreds: 2, tens: 3, ones: 5 },
}

export const c11Ferry: CaseDef = {
  id: 'c11-ferry',
  group: 'multiplication and division concepts',
  kidLabel: 'equal rows',
  badge: 'queue-reader',
  widget: 'arrays',
  titleNoDigits: 'The Ferry Queue',
  titleDigits: 'The Ferry Queue',
  storyNoDigits: [
    'Vehicles line up for the maple bay ferry.',
    'The queue sits in neat rows. Count the rows to board.',
  ],
  storyDigits: [
    'Vehicles line up for the maple bay ferry.',
    'The queue forms equal rows. Count the rows.',
  ],
  puzzle: { kind: 'arrays', rows: 5, cols: 4 },
}

export const c12Tip: CaseDef = {
  id: 'c12-tip',
  group: 'financial literacy',
  kidLabel: 'money sense',
  badge: 'tip-giver',
  widget: 'coins',
  titleNoDigits: 'The Tip Jar',
  titleDigits: 'The Tip Jar',
  storyNoDigits: [
    'The busker played fiddle outside the bakery.',
    'The tip is shown in the coin picture. Pay the same amount.',
  ],
  storyDigits: [
    'The busker played fiddle outside the bakery.',
    'The tip is shown in coins. Pay the same amount.',
  ],
  puzzle: { kind: 'coins', target: [25, 10, 10, 5] },
}
