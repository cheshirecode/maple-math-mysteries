import type { CaseDef } from '../engine/case.ts'

export const c1Safe: CaseDef = {
  id: 'c1-safe',
  group: 'number to 1000',
  badge: 'safe-opener',
  widget: 'blocks',
  titleNoDigits: 'The Locked Safe',
  titleDigits: 'The Locked Safe',
  storyNoDigits: [
    'The mayor keeps the town records in a safe.',
    'The lock shows a picture of blocks: big blocks, long blocks, and small blocks.',
  ],
  storyDigits: [
    'The mayor keeps the town records in a safe.',
    'The lock wants hundreds, tens, and ones blocks.',
  ],
  questionNoDigits: 'Build the stacks that match the lock picture.',
  questionDigits: 'Open the safe with the right place-value stacks.',
  puzzle: { kind: 'blocks', hundreds: 3, tens: 4, ones: 2 },
}
