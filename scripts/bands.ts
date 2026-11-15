import type { WidgetKind } from '../src/engine/case.ts'

export interface BandSpec {
  scenes: string[]
  // per-widget value range inputs; interpreted by the generator per kind
  min: number
  max: number
}

// Value ranges keyed to grade x widget, aligned to the BC curriculum ladder.
// The table makes no pedagogical ordering claim between bands; it only bounds
// the numbers a band may emit (council item 7).
export const BANDS: Record<number, Partial<Record<WidgetKind, BandSpec>>> = {
  1: {
    dots: { min: 4, max: 10, scenes: ['The {who} fills a basket that holds {t} acorns.'] },
    blocks: { min: 1, max: 29, scenes: ['The {who} stacks pennies on the steps.'] },
    arrays: { min: 2, max: 3, scenes: ['The {who} watches the ducklings paddle in rows.'] },
    fraction: { min: 2, max: 4, scenes: ['The {who} shares one snack at the picnic.'] },
    pattern: { min: 1, max: 2, scenes: ['The {who} finds piles along the fence.'] },
    measure: { min: 2, max: 4, scenes: ['The {who} pours juice for the picnic table.'] },
    crate: { min: 3, max: 6, scenes: ['The {who} folds a small box.'] },
    spinner: { min: 2, max: 4, scenes: ['The {who} spins the carnival wheel.'] },
    coins: { min: 2, max: 3, scenes: ['The {who} pays at the lemonade stand.'] },
    compare: { min: 1, max: 9, scenes: ['Two {who}s counted small piles.'] },
    combine: { min: 1, max: 9, scenes: ['The {who} puts two small piles together.'] },
  },
  2: {
    dots: { min: 10, max: 20, scenes: ['The {who} fills a roll that holds {t} tickets.'] },
    blocks: { min: 10, max: 99, scenes: ['The {who} counts the popcorn tubs.'] },
    arrays: { min: 3, max: 5, scenes: ['The {who} lines up neat rows of prints.'] },
    fraction: { min: 4, max: 6, scenes: ['The {who} cuts a campfire pie.'] },
    pattern: { min: 2, max: 4, scenes: ['The {who} spots shells along the dock path.'] },
    measure: { min: 4, max: 6, scenes: ['The {who} fills the watering can.'] },
    crate: { min: 3, max: 6, scenes: ['The {who} matches a folded parcel.'] },
    spinner: { min: 2, max: 4, scenes: ['The {who} spins at the school fair.'] },
    coins: { min: 2, max: 4, scenes: ['The {who} pays the bus driver.'] },
    compare: { min: 10, max: 99, scenes: ['Two {who}s chalked scores on the board.'] },
    combine: { min: 10, max: 99, scenes: ['The {who} works with two tubs of tens and ones.'] },
  },
  3: {
    dots: { min: 12, max: 20, scenes: ['The {who} rides with a partly punched ticket roll.'] },
    blocks: { min: 100, max: 999, scenes: ['The {who} restocks the library ladder.'] },
    arrays: { min: 4, max: 7, scenes: ['The {who} counts rows at the ferry queue.'] },
    fraction: { min: 6, max: 12, scenes: ['The {who} shares a pie at the bake sale.'] },
    pattern: { min: 3, max: 5, scenes: ['The {who} follows the growing trail.'] },
    measure: { min: 6, max: 9, scenes: ['The {who} fills the soup kettle.'] },
    crate: { min: 3, max: 6, scenes: ['The {who} folds a crate at the depot.'] },
    spinner: { min: 3, max: 6, scenes: ['The {who} spins the raffle dial.'] },
    coins: { min: 3, max: 5, scenes: ['The {who} pays the snack stand.'] },
    compare: { min: 100, max: 999, scenes: ['Two {who}s tallied the same harbour hour.'] },
    combine: { min: 100, max: 999, scenes: ['The {who} moves crates at the harbour gates.'] },
  },
  4: {
    dots: { min: 12, max: 20, scenes: ['The {who} punches tickets on the loop line.'] },
    blocks: { min: 100, max: 999, scenes: ['The {who} stacks supply crates at the fort.'] },
    arrays: { min: 5, max: 8, scenes: ['The {who} arrays the parade on the avenue.'] },
    fraction: { min: 8, max: 12, scenes: ['The {who} slices the mural circle.'] },
    pattern: { min: 4, max: 5, scenes: ['The {who} hops between lily pads.'] },
    measure: { min: 6, max: 10, scenes: ['The {who} measures the garden rows.'] },
    crate: { min: 3, max: 6, scenes: ['The {who} folds a silo sketch.'] },
    spinner: { min: 4, max: 7, scenes: ['The {who} spins the garden wheel.'] },
    coins: { min: 4, max: 6, scenes: ['The {who} counts the stall rent.'] },
    compare: { min: 100, max: 999, scenes: ['Two {who}s compared dock tallies.'] },
    combine: { min: 100, max: 999, scenes: ['The {who} adds ridge-walk steps.'] },
  },
  5: {
    dots: { min: 14, max: 20, scenes: ['The {who} counts a nearly full roll.'] },
    blocks: { min: 100, max: 999, scenes: ['The {who} audits the lodge shelves.'] },
    arrays: { min: 6, max: 9, scenes: ['The {who} charts the harvest rows.'] },
    fraction: { min: 9, max: 12, scenes: ['The {who} splits the ribbon reel.'] },
    pattern: { min: 4, max: 6, scenes: ['The {who} reads the trail rule.'] },
    measure: { min: 8, max: 11, scenes: ['The {who} boils sap at the shack.'] },
    crate: { min: 3, max: 6, scenes: ['The {who} folds a grand crate.'] },
    spinner: { min: 5, max: 8, scenes: ['The {who} spins the garden dial again.'] },
    coins: { min: 5, max: 7, scenes: ['The {who} settles the bake-sale till.'] },
    compare: { min: 100, max: 999, scenes: ['Two {who}s compare ledger lines.'] },
    combine: { min: 100, max: 999, scenes: ['The {who} sleds supplies to the summit.'] },
  },
}

export const ACTORS = ['librarian', 'harbourmaster', 'conductor', 'baker', 'ferry captain', 'park ranger', 'grocer', 'lighthouse keeper', 'postmaster', 'coach']
export const COLOURS = ['red', 'blue', 'gold', 'green']
