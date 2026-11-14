import type { CaseDef } from '../engine/case.ts'
import { c1Safe } from './c1-safe.ts'
import { c2Fare } from './c2-fare.ts'
import { c3Loot } from './c3-loot.ts'
import { c4Pie } from './c4-pie.ts'
import { c5Trail } from './c5-trail.ts'
import { c6Jug } from './c6-jug.ts'
import { c7Crate } from './c7-crate.ts'
import { c8Spinner } from './c8-spinner.ts'
import { c9Stand } from './c9-stand.ts'
import { c10Library, c11Ferry, c12Tip } from './extra.ts'
import { CASES_G1 } from './grade1.ts'
import { CASES_G2 } from './grade2.ts'
import { CASES_G4 } from './grade4.ts'
import { CASES_G5 } from './grade5.ts'

export const CASES: CaseDef[] = [
  c1Safe,
  c2Fare,
  c3Loot,
  c4Pie,
  c5Trail,
  c6Jug,
  c7Crate,
  c8Spinner,
  c9Stand,
  c10Library,
  c11Ferry,
  c12Tip,
]
export { CASES_G1, CASES_G2, CASES_G4, CASES_G5 }
export const ALL_CASES: CaseDef[] = [...CASES, ...CASES_G1, ...CASES_G2, ...CASES_G4, ...CASES_G5]
