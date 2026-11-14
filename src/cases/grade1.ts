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
]
