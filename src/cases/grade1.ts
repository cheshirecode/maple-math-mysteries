export const CASES_G1_EXTRA: CaseDef[] = [
  {
    id: 'g1-acorn',
    group: 'number to 1000',
    kidLabel: 'counting to ten',
    badge: 'acorn-hoarder',
    widget: 'dots',
    titleNoDigits: 'The Acorn Match',
    titleDigits: 'The Acorn Match',
    storyNoDigits: [
      'The chipmunk fills its cheeks for winter.',
      'The burrow holds eight acorns. Count the empty spots.',
    ],
    storyDigits: [
      'The chipmunk fills its cheeks for winter.',
      'The burrow holds 8 acorns. 5 are already in. How many more?',
    ],
    puzzle: { kind: 'dots', pairTarget: 8, pairA: 5 },
  },
  {
    id: 'g1-stairs',
    group: 'number to 1000',
    kidLabel: 'tens and ones',
    badge: 'step-climber',
    widget: 'blocks',
    titleNoDigits: 'The Penny Stairs',
    titleDigits: 'The Penny Stairs',
    storyNoDigits: [
      'The fountain collects pennies on its steps.',
      'Build the stacks that match the picture.',
    ],
    storyDigits: [
      'The fountain collects pennies on its steps.',
      'Build the stacks: tens and ones blocks.',
    ],
    puzzle: { kind: 'blocks', hundreds: 0, tens: 2, ones: 4 },
  },
  {
    id: 'g1-duck',
    group: 'multiplication and division concepts',
    kidLabel: 'neat rows',
    badge: 'pond-counter',
    widget: 'arrays',
    titleNoDigits: 'The Duck Line',
    titleDigits: 'The Duck Line',
    storyNoDigits: [
      'Ducklings paddle behind the mother duck.',
      'The ducklings swim in neat rows. How many rows are there?',
    ],
    storyDigits: [
      'Ducklings paddle behind the mother duck.',
      'The ducklings form an array of equal rows. Count the rows.',
    ],
    puzzle: { kind: 'arrays', rows: 2, cols: 4 },
  },
  {
    id: 'g1-lemonade',
    group: 'financial literacy',
    kidLabel: 'money sense',
    badge: 'stand-server',
    widget: 'coins',
    titleNoDigits: 'The Lemonade Coin',
    titleDigits: 'The Lemonade Coin',
    storyNoDigits: [
      'The lemonade stand takes the exact coin.',
      'Pay the fee using the same coins as the picture.',
    ],
    storyDigits: [
      'The lemonade stand takes the exact coin.',
      'Pay the exact amount shown in coins.',
    ],
    puzzle: { kind: 'coins', target: [5, 5, 1] },
  },
  {
    id: 'g1-wheel',
    group: 'likelihood of simulated events',
    kidLabel: 'more or less likely',
    badge: 'wheel-friend',
    widget: 'spinner',
    titleNoDigits: 'The Colour Wheel',
    titleDigits: 'The Colour Wheel',
    storyNoDigits: [
      'The carnival spins a two-colour wheel.',
      'One colour covers more of the dial. It lands more often.',
    ],
    storyDigits: [
      'The carnival spins a two-colour wheel.',
      'Which colour lands more often?',
    ],
    puzzle: {
      kind: 'spinner',
      slices: [
        { colour: 'red', weight: 3 },
        { colour: 'gold', weight: 1 },
      ],
      answer: 'red',
    },
  },
]

import type { CaseDef } from '../engine/case.ts'

export const CASES_G1: CaseDef[] = [
  {
    id: 'g1-egg',
    group: 'number to 1000',
    kidLabel: 'counting to ten',
    badge: 'egg-counter',
    widget: 'dots',
    titleNoDigits: 'The Egg Basket',
    titleDigits: 'The Egg Basket',
    storyNoDigits: [
      'The hens filled a basket for the fair.',
      'The basket holds ten eggs. Count the empty nests.',
    ],
    storyDigits: [
      'The hens filled a basket for the fair.',
      'The basket holds 10 eggs. 6 are already in. How many more?',
    ],
    puzzle: { kind: 'dots', pairTarget: 10, pairA: 6 },
  },
  {
    id: 'g1-line',
    group: 'patterns and pattern rules',
    kidLabel: 'growing patterns',
    badge: 'pinecone-patroller',
    widget: 'pattern',
    titleNoDigits: 'The Pinecone Line',
    titleDigits: 'The Pinecone Line',
    storyNoDigits: [
      'A squirrel hides pinecones along the fence.',
      'Each pile grows by one pinecone. Find the next pile.',
    ],
    storyDigits: [
      'A squirrel hides pinecones along the fence.',
      'Each pile grows by one pinecone. Predict the next pile.',
    ],
    puzzle: { kind: 'pattern', steps: [1, 2, 3, 4] },
  },
  {
    id: 'g1-juice',
    group: 'measurement and time',
    kidLabel: 'measuring and pouring',
    badge: 'juice-pourer',
    widget: 'measure',
    titleNoDigits: 'The Juice Cups',
    titleDigits: 'The Juice Cups',
    storyNoDigits: [
      'The canteen needs juice for the picnic.',
      'Count the cupfuls the recipe asks for.',
    ],
    storyDigits: [
      'The canteen needs juice for the picnic.',
      'The recipe pours a set number of cupfuls.',
    ],
    puzzle: { kind: 'measure', cups: 3, options: [3, 1, 5] },
  },
  ...CASES_G1_EXTRA,
]

