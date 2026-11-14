# Requirements traceability

Each product requirement maps to a mechanism and a check. A requirement with
no check is a gap; a check with no requirement is coverage theater. This file
syncs the two. Last reviewed: 2026-11-14, head `main`.

## Traceability matrix

| # | Requirement | Mechanism | Check | Where |
| --- | --- | --- | --- | --- |
| R1 | Progress lives in the browser only; no accounts, no server, no data collection | Static build; localStorage keys `mda.*`; zero network calls at runtime | Build output has no backend; SW caches same-origin GETs only | `src/save/store.ts`, `public/sw.js` |
| R2 | One parent-set access code gates parent view, import, and export | PBKDF2-SHA-256 salted hash, 210k iterations; in-memory unlock flag | Unit: `tests/code.test.ts` (round-trip, wrong-code). E2e: unlock gate before export/import | `src/save/code.ts`, `src/parent/parent.ts` |
| R3 | Progress serializes to one save-string; a fresh session restores it | Envelope `MDA1.<version>.<crc32>.<base64url>`; deflate or raw by first byte | Unit: round-trip, tamper, version-reject, whitespace-trim (`tests/save.test.ts`). E2e: desktop export to mobile import carries cases and minutes | `src/save/string.ts`, `e2e/export-import.spec.ts` |
| R4 | No digit is visible until the child taps "show digits" | `titleNoDigits`/`storyNoDigits`/`questionNoDigits` + word numerals for grades | Unit: digits-guard walks every case (`tests/cases.test.ts`). E2e: `document.body.innerText` has no digit before toggle | `src/engine/case.ts`, `src/grades.ts` |
| R5 | Cases cover all nine BC grade-3 content groups | Nine `CaseDef` files registered in `src/cases/index.ts` | Unit: every group in `BC_GROUPS` has a case; puzzle/widget match; spinner/coins/measure invariants | `tests/cases.test.ts`, `tests/grade.test.ts` |
| R6 | Grade picker offers 1-5; grade three active, others visibly coming | `GRADES`, `ACTIVE_GRADES`, disabled pills with `aria-disabled` | Unit: only grade 3 active, words digit-free. E2e: 5 pills, 4 off, 1 selected | `src/grades.ts`, `tests/grade.test.ts`, `e2e/export-import.spec.ts` |
| R7 | Layout works from phone to desktop | Fluid `#app` up to 1080px; `clamp()` type; 4-up grid at width; `.stage` view container | E2e: no horizontal overflow at 390px; CI e2e job | `src/style.css` |
| R8 | Wrong answers never punish | Retry line, new arrangement; no timers, no red X | E2e: wrong-tap path in dots case; manual PM audit | `src/engine/run.ts`, `docs/pm-audit.md` |
| R9 | App installs and plays offline | PWA manifest + network-first SW, versioned cache | Manual: reload with network cut renders fully. SW registration asserted in e2e-era checks | `public/sw.js`, `public/manifest.webmanifest` |
| R10 | Voice reads every text aloud | Web Speech wrapper on story lines | Unit-free: presence of `speak()` call path; manual audit lists it deferred (tap-to-speak) | `src/voice.ts` |

## Sync rules

- A new requirement gets a row before code lands; a dropped requirement
  keeps its row with a removal note.
- A check that cannot run headless stays in the matrix with its manual
  owner and last run date.
- CI green is evidence only when the relevant check is wired into the
  workflow file; see `.github/workflows/ci.yml`.