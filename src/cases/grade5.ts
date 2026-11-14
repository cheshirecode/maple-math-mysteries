import type { CaseDef } from '../engine/case.ts'

export const CASES_G5: CaseDef[] = [
  {
    id: 'g5-bar',
    group: 'fraction concepts',
    kidLabel: 'fraction sense',
    badge: 'share-scholar',
    widget: 'fraction',
    titleNoDigits: 'The Chocolate Ledger',
    titleDigits: 'The Chocolate Ledger',
    storyNoDigits: [
      'The scout troop earned one chocolate bar.',
      'Twelve scouts share it. Every scout gets one equal piece.',
    ],
    storyDigits: [
      'The scout troop earned one chocolate bar.',
      'Cut the bar into 12 equal shares.',
    ],
    puzzle: { kind: 'fraction', parts: 12 },
  },
  {
    id: 'g5-punch',
    group: 'measurement and time',
    kidLabel: 'measuring and pouring',
    badge: 'punch-planner',
    widget: 'measure',
    titleNoDigits: 'The Punch Bowl',
    titleDigits: 'The Punch Bowl',
    storyNoDigits: [
      'The graduation party needs fruit punch.',
      'Count the cupfuls the recipe asks for.',
    ],
    storyDigits: [
      'The graduation party needs fruit punch.',
      'The recipe pours a set number of cupfuls.',
    ],
    puzzle: { kind: 'measure', cups: 7, options: [7, 4, 10] },
  },
  {
    id: 'g5-fund',
    group: 'financial literacy',
    kidLabel: 'money sense',
    badge: 'fund-steward',
    widget: 'coins',
    titleNoDigits: 'The Field-Trip Fund',
    titleDigits: 'The Field-Trip Fund',
    storyNoDigits: [
      'The class pays the field-trip fee at the door.',
      'Pay the exact fee shown in coins.',
    ],
    storyDigits: [
      'The class pays the field-trip fee at the door.',
      'Pay the exact amount shown in coins.',
    ],
    puzzle: { kind: 'coins', target: [25, 25, 25, 10, 5, 5] },
  },
]
