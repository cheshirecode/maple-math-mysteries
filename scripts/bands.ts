import type { WidgetKind } from '../src/engine/case.ts'

export interface BandSpec {
  scenes: string[]
  // per-widget value range inputs; interpreted by the generator per kind
  min: number
  max: number
  // variant axes: the generator samples these descriptors (without replacement
  // per axis combination) and constructs operands to satisfy them. Bands that
  // omit them keep the uniform draw.
  variants?: VariantSpec[]
  // desired case count for this band (default: BAND_FLOOR). Grade three lifts
  // every band to ten; the other grades lift to six.
  target?: number
}

export type VariantSpec =
  | { kind: 'combine-regroup'; pattern: 'none' | 'ones' | 'tens' | 'double' | 'across-zero'; shape: 'round-round' | 'round-mixed' | 'mixed-mixed'; op: 'add' | 'take' }
  | { kind: 'compare-trap'; trap: 'plain' | 'reorder' | 'zero-place' | 'boundary'; deciding: 'hundreds' | 'tens' | 'ones' }
  | { kind: 'pattern-skip'; step: number; backward?: boolean }

// Value ranges keyed to grade x widget, aligned to the BC curriculum ladder.
// The table makes no pedagogical ordering claim between bands; it only bounds
// the numbers a band may emit.
export const BANDS: Record<number, Partial<Record<WidgetKind, BandSpec>>> = {
  1: {
    dots: { target: 6, min: 4, max: 10, scenes: ['The {who} fills a basket that holds {t} acorns.'] },
    blocks: { target: 6, min: 1, max: 29, scenes: ['The {who} stacks pennies on the steps.'] },
    arrays: { target: 6, min: 2, max: 3, scenes: ['The {who} watches the ducklings paddle in rows.'] },
    fraction: { target: 6, min: 2, max: 4, scenes: ['The {who} shares one snack at the picnic.'] },
    pattern: {
      target: 9,
      min: 1,
      max: 2,
      scenes: ['The {who} finds piles along the fence.'],
      variants: [
        { kind: 'pattern-skip', step: 1 },
        { kind: 'pattern-skip', step: 2 },
        { kind: 'pattern-skip', step: 10 },
      ],
    },
    measure: { target: 6, min: 2, max: 4, scenes: ['The {who} pours juice for the picnic table.'] },
    crate: { target: 6, min: 3, max: 6, scenes: ['The {who} folds a small box.'] },
    spinner: { target: 6, min: 2, max: 4, scenes: ['The {who} spins the carnival wheel.'] },
    coins: { target: 6, min: 2, max: 3, scenes: ['The {who} pays at the lemonade stand.'] },
    compare: { target: 6, min: 1, max: 9, scenes: ['Two {who}s counted small piles.'] },
    combine: { target: 6, min: 1, max: 9, scenes: ['The {who} puts two small piles together.'] },
  },
  2: {
    dots: { target: 6, min: 10, max: 20, scenes: ['The {who} fills a roll that holds {t} tickets.'] },
    blocks: { target: 6, min: 10, max: 99, scenes: ['The {who} counts the popcorn tubs.'] },
    arrays: { target: 6, min: 3, max: 5, scenes: ['The {who} lines up neat rows of prints.'] },
    fraction: { target: 6, min: 4, max: 6, scenes: ['The {who} cuts a campfire pie.'] },
    pattern: {
      target: 9,
      min: 2,
      max: 4,
      scenes: ['The {who} spots shells along the dock path.'],
      variants: [
        { kind: 'pattern-skip', step: 2 },
        { kind: 'pattern-skip', step: 5 },
        { kind: 'pattern-skip', step: 10 },
      ],
    },
    measure: { target: 6, min: 4, max: 6, scenes: ['The {who} fills the watering can.'] },
    crate: { target: 6, min: 3, max: 6, scenes: ['The {who} matches a folded parcel.'] },
    spinner: { target: 6, min: 2, max: 4, scenes: ['The {who} spins at the school fair.'] },
    coins: { target: 6, min: 2, max: 4, scenes: ['The {who} pays the bus driver.'] },
    compare: { target: 6, min: 10, max: 99, scenes: ['Two {who}s chalked scores on the board.'] },
    combine: {
      target: 6,
      min: 10,
      max: 99,
      scenes: ['The {who} works with two tubs of tens and ones.'],
      variants: [
        { kind: 'combine-regroup', pattern: 'none', shape: 'mixed-mixed', op: 'take' },
        { kind: 'combine-regroup', pattern: 'ones', shape: 'mixed-mixed', op: 'add' },
        { kind: 'combine-regroup', pattern: 'ones', shape: 'round-mixed', op: 'take' },
        { kind: 'combine-regroup', pattern: 'tens', shape: 'round-round', op: 'add' },
      ],
    },
  },
  3: {
    dots: { target: 10, min: 12, max: 20, scenes: ['The {who} rides with a partly punched ticket roll.'] },
    blocks: { target: 10, min: 100, max: 999, scenes: ['The {who} restocks the library ladder.'] },
    arrays: { target: 10, min: 4, max: 7, scenes: ['The {who} counts rows at the ferry queue.'] },
    fraction: { target: 10, min: 6, max: 12, scenes: ['The {who} shares a pie at the bake sale.'] },
    pattern: {
      target: 18,
      min: 3,
      max: 5,
      scenes: ['The {who} follows the growing trail.'],
      variants: [
        { kind: 'pattern-skip', step: 2 },
        { kind: 'pattern-skip', step: 5 },
        { kind: 'pattern-skip', step: 10 },
        { kind: 'pattern-skip', step: 25 },
        { kind: 'pattern-skip', step: 100 },
        { kind: 'pattern-skip', step: 5, backward: true },
        { kind: 'pattern-skip', step: 10, backward: true },
        { kind: 'pattern-skip', step: 100, backward: true },
      ],
    },
    measure: { target: 10, min: 6, max: 9, scenes: ['The {who} fills the soup kettle.'] },
    crate: { target: 10, min: 3, max: 6, scenes: ['The {who} folds a crate at the depot.'] },
    spinner: { target: 10, min: 3, max: 6, scenes: ['The {who} spins the raffle dial.'] },
    coins: { target: 10, min: 3, max: 5, scenes: ['The {who} pays the snack stand.'] },
    compare: {
      target: 10,
      min: 100,
      max: 999,
      scenes: ['Two {who}s tallied the same harbour hour.'],
      variants: [
        { kind: 'compare-trap', trap: 'plain', deciding: 'hundreds' },
        { kind: 'compare-trap', trap: 'plain', deciding: 'tens' },
        { kind: 'compare-trap', trap: 'plain', deciding: 'ones' },
        { kind: 'compare-trap', trap: 'reorder', deciding: 'tens' },
        { kind: 'compare-trap', trap: 'reorder', deciding: 'ones' },
        { kind: 'compare-trap', trap: 'zero-place', deciding: 'tens' },
        { kind: 'compare-trap', trap: 'zero-place', deciding: 'ones' },
        { kind: 'compare-trap', trap: 'boundary', deciding: 'hundreds' },
      ],
    },
    combine: {
      target: 10,
      min: 100,
      max: 999,
      scenes: ['The {who} moves crates at the harbour gates.'],
      variants: [
        { kind: 'combine-regroup', pattern: 'none', shape: 'round-mixed', op: 'add' },
        { kind: 'combine-regroup', pattern: 'none', shape: 'mixed-mixed', op: 'take' },
        { kind: 'combine-regroup', pattern: 'ones', shape: 'mixed-mixed', op: 'add' },
        { kind: 'combine-regroup', pattern: 'ones', shape: 'round-mixed', op: 'take' },
        { kind: 'combine-regroup', pattern: 'tens', shape: 'mixed-mixed', op: 'add' },
        { kind: 'combine-regroup', pattern: 'tens', shape: 'round-round', op: 'take' },
        { kind: 'combine-regroup', pattern: 'double', shape: 'mixed-mixed', op: 'add' },
        { kind: 'combine-regroup', pattern: 'double', shape: 'round-mixed', op: 'take' },
        { kind: 'combine-regroup', pattern: 'across-zero', shape: 'round-mixed', op: 'take' },
        { kind: 'combine-regroup', pattern: 'across-zero', shape: 'round-round', op: 'take' },
      ],
    },
  },
  4: {
    dots: { target: 6, min: 12, max: 20, scenes: ['The {who} punches tickets on the loop line.'] },
    blocks: { target: 6, min: 100, max: 999, scenes: ['The {who} stacks supply crates at the fort.'] },
    arrays: { target: 6, min: 5, max: 8, scenes: ['The {who} arrays the parade on the avenue.'] },
    fraction: { target: 6, min: 8, max: 12, scenes: ['The {who} slices the mural circle.'] },
    pattern: {
      target: 10,
      min: 4,
      max: 5,
      scenes: ['The {who} hops between lily pads.'],
      variants: [
        { kind: 'pattern-skip', step: 25 },
        { kind: 'pattern-skip', step: 100 },
        { kind: 'pattern-skip', step: 10, backward: true },
        { kind: 'pattern-skip', step: 25, backward: true },
      ],
    },
    measure: { target: 6, min: 6, max: 10, scenes: ['The {who} measures the garden rows.'] },
    crate: { target: 6, min: 3, max: 6, scenes: ['The {who} folds a silo sketch.'] },
    spinner: { target: 6, min: 4, max: 7, scenes: ['The {who} spins the garden wheel.'] },
    coins: { target: 6, min: 4, max: 6, scenes: ['The {who} counts the stall rent.'] },
    compare: {
      target: 6,
      min: 100,
      max: 999,
      scenes: ['Two {who}s compared dock tallies.'],
      variants: [
        { kind: 'compare-trap', trap: 'reorder', deciding: 'tens' },
        { kind: 'compare-trap', trap: 'reorder', deciding: 'ones' },
        { kind: 'compare-trap', trap: 'zero-place', deciding: 'tens' },
        { kind: 'compare-trap', trap: 'boundary', deciding: 'hundreds' },
      ],
    },
    combine: { target: 6, min: 100, max: 999, scenes: ['The {who} adds ridge-walk steps.'] },
  },
  5: {
    dots: { target: 6, min: 14, max: 20, scenes: ['The {who} counts a nearly full roll.'] },
    blocks: { target: 6, min: 100, max: 999, scenes: ['The {who} audits the lodge shelves.'] },
    arrays: { target: 6, min: 6, max: 9, scenes: ['The {who} charts the harvest rows.'] },
    fraction: { target: 6, min: 9, max: 12, scenes: ['The {who} splits the ribbon reel.'] },
    pattern: {
      target: 8,
      min: 4,
      max: 6,
      scenes: ['The {who} reads the trail rule.'],
      variants: [
        { kind: 'pattern-skip', step: 25, backward: true },
        { kind: 'pattern-skip', step: 100, backward: true },
      ],
    },
    measure: { target: 6, min: 8, max: 11, scenes: ['The {who} boils sap at the shack.'] },
    crate: { target: 6, min: 3, max: 6, scenes: ['The {who} folds a grand crate.'] },
    spinner: { target: 6, min: 5, max: 8, scenes: ['The {who} spins the garden dial again.'] },
    coins: { target: 6, min: 5, max: 7, scenes: ['The {who} settles the bake-sale till.'] },
    compare: { target: 6, min: 100, max: 999, scenes: ['Two {who}s compare ledger lines.'] },
    combine: {
      target: 6,
      min: 100,
      max: 999,
      scenes: ['The {who} sleds supplies to the summit.'],
      variants: [
        { kind: 'combine-regroup', pattern: 'double', shape: 'mixed-mixed', op: 'take' },
        { kind: 'combine-regroup', pattern: 'across-zero', shape: 'round-mixed', op: 'take' },
        { kind: 'combine-regroup', pattern: 'double', shape: 'mixed-mixed', op: 'add' },
        { kind: 'combine-regroup', pattern: 'tens', shape: 'round-round', op: 'add' },
      ],
    },
  },
}

export const ACTORS = ['librarian', 'harbourmaster', 'conductor', 'baker', 'ferry captain', 'park ranger', 'grocer', 'lighthouse keeper', 'postmaster', 'coach', 'chandler', 'fishmonger']
export const COLOURS = ['red', 'blue', 'gold', 'green']
