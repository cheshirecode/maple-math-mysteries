# Requirements traceability

Each requirement maps to one mechanism and one check. A check that no longer
runs is a gap. Last reviewed: 2026-11-15.

## Traceability matrix

| # | Requirement | Mechanism | Check | Where |
| --- | --- | --- | --- | --- |
| R1 | Progress stays in the browser; no accounts, no data collection | Static build; `mda.*` localStorage keys; no runtime network calls | Build has no backend; SW caches same-origin GETs only | `src/save/store.ts`, `public/sw.js` |
| R2 | One save code carries all state between devices | MDA1 envelope over the whole Progress object; autosave | Unit round-trip and tamper; e2e export then fresh-device import | `src/save/string.ts`, `e2e/export-import.spec.ts` |
| R3 | A fresh session restores the save string | Envelope `MDA1.<version>.<crc32>.<base64url>`; deflate or raw | Unit: round-trip, tamper, version-reject; e2e import leg | `src/save/string.ts` |
| R4 | No digit renders in the child's UI | Digit-free case text, word numerals, picture quantities | Unit digits-guard over every case; e2e body text has no digit | `src/engine/case.ts`, `tests/cases.test.ts` |
| R5 | Cases cover all nine BC grade-3 strands | Five JSON packs through the fail-closed `parsePack` | Unit: strand coverage, widget match, invariant rejections | `tests/cases.test.ts`, `tests/packs.test.ts` |
| R6 | Five grades, each with a pack; pills behave per view | Per-grade packs; pill handlers keyed to view state | Unit: each grade serves its pack; e2e pill-home and inert assertions | `src/grades.ts`, `src/main.ts` |
| R7 | Layout works from phone to desktop | Fluid `#app`; `clamp()` type; view container | E2e: no horizontal overflow at 390px | `src/style.css` |
| R8 | Wrong answers never punish | Retry line, new arrangement; no timers, no red X | E2e wrong-tap path; manual PM audit | `src/engine/run.ts`, `docs/pm-audit.md` |
| R9 | App installs and plays offline | PWA manifest; network-first SW | Manual offline reload, last run 2026-11-14 | `public/sw.js` |
| R10 | Three solves bring the break nudge; lines speak only on tap | `speakable()` wired once in `runCase`; speech scoped to two files | E2e nudge step; speech spy counts zero before first tap | `src/voice.ts`, `tests/voice-scope.test.ts` |
| R11 | Concept bands open in sequence; locked bands render as one shelf | `CONCEPT_SEQUENCE` opening rules in `src/grades.ts` | E2e: fresh map shows one band; walks open the next | `src/grades.ts`, `src/main.ts` |
| R12 | Generated content passes the same validation as hand content | Generator writes packs through `parsePack` | Unit: reproducibility, dedupe, floor lift, mutation checks | `scripts/generate.ts`, `tests/generator.test.ts` |

## Keeping this file true

- Add a row before the code lands. Keep dropped rows and note why they went.
- A check that cannot run headless keeps its manual owner and last-run date.
- CI counts as evidence only when the check runs in `.github/workflows/ci.yml`.
