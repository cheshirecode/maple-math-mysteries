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

export const c13Watch: CaseDef = {
  id: 'c13-watch',
  group: 'number to 1000',
  kidLabel: 'comparing to one thousand',
  badge: 'watch-keeper',
  widget: 'compare',
  titleNoDigits: 'The Lighthouse Watch',
  titleDigits: 'The Lighthouse Watch',
  storyNoDigits: [
    'Two keepers counted the boats in the harbour.',
    'Both keepers counted at the same hour.',
  ],
  storyDigits: [
    'Two keepers counted the boats in the harbour.',
    'Whose count was bigger?',
  ],
  puzzle: {
    kind: 'compare',
    a: { hundreds: 3, tens: 4, ones: 9 },
    b: { hundreds: 3, tens: 5, ones: 2 },
    more: 'b',
  },
}

export const c14FerryCount: CaseDef = {
  id: 'c14-ferry-count',
  group: 'number to 1000',
  kidLabel: 'comparing with zeroes',
  badge: 'counter-captain',
  widget: 'compare',
  titleNoDigits: 'The Ferry Count',
  titleDigits: 'The Ferry Count',
  storyNoDigits: [
    'The ferry logs every rider aboard.',
    'Two logs were found from the same sailing.',
  ],
  storyDigits: [
    'The ferry logs every rider aboard.',
    'Which log counts more riders?',
  ],
  puzzle: {
    kind: 'compare',
    a: { hundreds: 7, tens: 8, ones: 0 },
    b: { hundreds: 7, tens: 0, ones: 8 },
    more: 'a',
  },
}

export const c15Boundary: CaseDef = {
  id: 'c15-boundary',
  group: 'number to 1000',
  kidLabel: 'comparing across one hundred',
  badge: 'gate-guard',
  widget: 'compare',
  titleNoDigits: 'The Boundary Gate',
  titleDigits: 'The Boundary Gate',
  storyNoDigits: [
    'The parade route passes the boundary gate.',
    'One marshal counted before the gate and one after.',
  ],
  storyDigits: [
    'The parade route passes the boundary gate.',
    'Which count is bigger?',
  ],
  puzzle: {
    kind: 'compare',
    a: { hundreds: 4, tens: 9, ones: 9 },
    b: { hundreds: 5, tens: 0, ones: 1 },
    more: 'b',
  },
}

export const c16Bridge: CaseDef = {
  id: 'c16-bridge',
  group: 'addition and subtraction to 1000',
  kidLabel: 'adding three-digit numbers',
  badge: 'bridge-builder',
  widget: 'combine',
  titleNoDigits: 'The Brick Bridge',
  titleDigits: 'The Brick Bridge',
  storyNoDigits: [
    'The bridge crew has one pallet of bricks and then another arrives.',
  ],
  storyDigits: [
    'The bridge crew has one pallet of bricks and then another arrives.',
    'Build the sum of the two pallets.',
  ],
  puzzle: {
    kind: 'combine',
    op: 'add',
    a: { hundreds: 3, tens: 4, ones: 5 },
    b: { hundreds: 2, tens: 3, ones: 2 },
  },
}

export const c17Press: CaseDef = {
  id: 'c17-press',
  group: 'addition and subtraction to 1000',
  kidLabel: 'adding with regrouping',
  badge: 'press-operator',
  widget: 'combine',
  titleNoDigits: 'The Cider Press',
  titleDigits: 'The Cider Press',
  storyNoDigits: [
    'The cider press filled one barrel in the morning and another by noon.',
    'Ten small blocks make one long block, and ten long blocks make one big block.',
  ],
  storyDigits: [
    'The cider press filled one barrel in the morning and another by noon.',
    'Build the sum. Remember to regroup.',
  ],
  puzzle: {
    kind: 'combine',
    op: 'add',
    a: { hundreds: 4, tens: 6, ones: 8 },
    b: { hundreds: 2, tens: 7, ones: 5 },
  },
}

export const c18Harbour: CaseDef = {
  id: 'c18-harbour',
  group: 'addition and subtraction to 1000',
  kidLabel: 'subtracting three-digit numbers',
  badge: 'gate-keeper',
  widget: 'combine',
  titleNoDigits: 'The Harbour Gates',
  titleDigits: 'The Harbour Gates',
  storyNoDigits: [
    'The harbour held a full count of crates this morning.',
    'Some crates shipped out on the noon boat.',
    'Ten small blocks make one long block, and ten long blocks make one big block.',
  ],
  storyDigits: [
    'The harbour held a full count of crates this morning.',
    'Some crates shipped out on the noon boat.',
    'Build the difference. Remember to regroup.',
  ],
  puzzle: {
    kind: 'combine',
    op: 'take',
    a: { hundreds: 5, tens: 1, ones: 2 },
    b: { hundreds: 1, tens: 8, ones: 7 },
  },
}

export const c19Route: CaseDef = {
  id: 'c19-route',
  group: 'addition and subtraction to 1000',
  kidLabel: 'subtracting with zeroes',
  badge: 'route-runner',
  widget: 'combine',
  titleNoDigits: 'The Paper Route',
  titleDigits: 'The Paper Route',
  storyNoDigits: [
    'The print shop stacked papers for the whole route.',
    'The route used up some of the stacks.',
    'Ten small blocks make one long block, and ten long blocks make one big block.',
  ],
  storyDigits: [
    'The print shop stacked papers for the whole route.',
    'The route used up part of the stacks.',
    'Build the difference. Remember to regroup across the zero.',
  ],
  puzzle: {
    kind: 'combine',
    op: 'take',
    a: { hundreds: 7, tens: 0, ones: 3 },
    b: { hundreds: 2, tens: 5, ones: 6 },
  },
}

export const c20Kettle: CaseDef = {
  id: 'c20-kettle',
  group: 'measurement and time',
  kidLabel: 'measuring and pouring',
  badge: 'kettle-stirrer',
  widget: 'measure',
  titleNoDigits: 'The Soup Kettle',
  titleDigits: 'The Soup Kettle',
  storyNoDigits: [
    'The chowder house fills its big kettle for the ferry day.',
    'Count the cupfuls the recipe asks for.',
  ],
  storyDigits: [
    'The chowder house fills its big kettle for the ferry day.',
    'The recipe pours a set number of cupfuls.',
  ],
  puzzle: { kind: 'measure', cups: 8, options: [8, 6, 10] },
}
