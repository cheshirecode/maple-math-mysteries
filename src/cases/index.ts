import type { CaseDef } from '../engine/case.ts'
import { c1Safe } from './c1-safe.ts'
import { c2Fare } from './c2-fare.ts'
import { c3Loot } from './c3-loot.ts'
import { c4Pie } from './c4-pie.ts'
import { c5Trail } from './c5-trail.ts'

export const CASES: CaseDef[] = [c1Safe, c2Fare, c3Loot, c4Pie, c5Trail]
