import type { CaseDef } from '../engine/case.ts'

export const c5Trail: CaseDef = {
  id: 'c5-trail',
  group: 'patterns and pattern rules',
  kidLabel: 'growing patterns',
  badge: 'trail-follower',
  widget: 'pattern',
  titleNoDigits: 'The Growing Trail',
  titleDigits: 'The Growing Trail',
  storyNoDigits: [
    'The culprit leaves a trail of pinecone piles.',
    'Each pile grows by the same rule. Say the rule, then find the next pile.',
  ],
  storyDigits: [
    'The culprit leaves a trail of pinecone piles.',
    'Each pile grows by the same rule. Predict the next pile.',
  ],
  puzzle: { kind: 'pattern', steps: [2, 4, 6, 8] },
}
