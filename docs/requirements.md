# Requirements traceability

Each requirement below maps to one mechanism and one check. If a
requirement has no check, we do not know if the app meets it. If a check has
no requirement, it guards nothing and should go. Last reviewed: 2026-11-14.

## Traceability matrix

| # | Requirement | Mechanism | Check | Where |
| --- | --- | --- | --- | --- |
| R1 | Progress lives in the browser only; no accounts, no server, no data collection | Static build; localStorage keys `mda.*`; zero network calls at runtime | Build output has no backend; SW caches same-origin GETs only | `src/save/store.ts`, `public/sw.js` |
| R2 | One save code serializes all state; entering it on a fresh device loads the same state | MDA1 envelope over the whole Progress object; localStorage autosave | Unit: round-trip and tamper (tests/save.test.ts). E2e: desktop export to fresh-device import carries cases and minutes | `src/save/string.ts`, `src/save/store.ts`, `e2e/export-import.spec.ts` |
| R3 | Progress serializes to one save-string; a fresh session restores it | Envelope `MDA1.<version>.<crc32>.<base64url>`; deflate or raw by first byte | Unit: round-trip, tamper, version-reject, whitespace-trim (`tests/save.test.ts`). E2e: desktop export to mobile import carries cases and minutes | `src/save/string.ts`, `e2e/export-import.spec.ts` |
| R4 | No digit renders in the child's UI | digit-free case text, word numerals, picture quantities; no toggle | Unit: digits-guard walks every case (`tests/cases.test.ts`). E2e: `document.body.innerText` has no digit | `src/engine/case.ts`, `src/grades.ts` |
| R5 | Cases cover all nine BC grade-3 content groups | Nine `CaseDef` files registered in `src/cases/index.ts` | Unit: every group in `BC_GROUPS` has a case; puzzle/widget match; spinner/coins/measure invariants | `tests/cases.test.ts`, `tests/grade.test.ts` |
| R6 | Grade picker offers 1-5; grade three active, others visibly coming | `GRADES`, `ACTIVE_GRADES`, disabled pills with `aria-disabled` | Unit: only grade 3 active, words digit-free. E2e: 5 pills, 4 off, 1 selected | `src/grades.ts`, `tests/grade.test.ts`, `e2e/export-import.spec.ts` |
| R7 | Layout works from phone to desktop | Fluid `#app` up to 1080px; `clamp()` type; 4-up grid at width; `.stage` view container | E2e: no horizontal overflow at 390px; CI e2e job | `src/style.css` |
| R8 | Wrong answers never punish | Retry line, new arrangement; no timers, no red X | E2e: wrong-tap path in dots case; manual PM audit | `src/engine/run.ts`, `docs/pm-audit.md` |
| R9 | App installs and plays offline | PWA manifest + network-first SW, versioned cache | Manual: reload with network cut renders fully. SW registration asserted in e2e-era checks | `public/sw.js`, `public/manifest.webmanifest` |
| R10 | Story text reads aloud on case open; prompt tap-to-speak is deferred (see pm-audit) | Web Speech wrapper on story lines | Unit-free: presence of `speak()` call path; manual audit lists it deferred (tap-to-speak) | `src/voice.ts` |

## Keeping this file true

- Add a row before the code for a new requirement lands. Keep the row when
  a requirement is dropped, and note why it went.
- A check that cannot run headless stays listed with its manual owner and
  the date it last ran.
- CI counts as evidence only when the check runs in
  `.github/workflows/ci.yml`. A green badge alone proves nothing.