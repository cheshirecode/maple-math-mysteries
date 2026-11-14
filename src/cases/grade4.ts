import type { CaseDef } from '../engine/case.ts'

export const CASES_G4: CaseDef[] = [
  {
    id: 'g4-pizza',
    group: 'fraction concepts',
    kidLabel: 'equal parts',
    badge: 'fair-slicer',
    widget: 'fraction',
    titleNoDigits: 'The Pizza Fair',
    titleDigits: 'The Pizza Fair',
    storyNoDigits: [
      'The class party needs a fair pizza.',
      'Eight friends share one pizza. Every friend gets one equal slice.',
    ],
    storyDigits: [
      'The class party needs a fair pizza.',
      'Cut the pizza into 8 equal shares.',
    ],
    puzzle: { kind: 'fraction', parts: 8 },
  },
  {
    id: 'g4-wheel',
    group: 'likelihood of simulated events',
    kidLabel: 'chance',
    badge: 'wheel-watcher',
    widget: 'spinner',
    titleNoDigits: 'The Raffle Wheel',
    titleDigits: 'The Raffle Wheel',
    storyNoDigits: [
      'The fair raffle hides a spinning wheel.',
      'Some colours cover more of the dial. Those land more often.',
    ],
    storyDigits: [
      'The fair raffle hides a spinning wheel.',
      'Spin the wheel often. Which colour lands more often?',
    ],
    puzzle: {
      kind: 'spinner',
      slices: [
        { colour: 'red', weight: 3 },
        { colour: 'blue', weight: 1 },
        { colour: 'gold', weight: 1 },
      ],
      answer: 'red',
    },
  },
  {
    id: 'g4-box',
    group: '3d objects and graphs',
    kidLabel: 'shapes and nets',
    badge: 'box-builder',
    widget: 'crate',
    titleNoDigits: 'The Parcel Puzzle',
    titleDigits: 'The Parcel Puzzle',
    storyNoDigits: [
      'A parcel arrived at the post office folded flat.',
      'The net folds into a crate. Which crate matches the net?',
    ],
    storyDigits: [
      'A parcel arrived at the post office folded flat.',
      'The net folds into a crate. Count its faces to find the crate.',
    ],
    puzzle: { kind: 'crate', shape: 'prism', suspects: [5, 6, 4] },
  },
]
