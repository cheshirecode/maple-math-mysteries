# Lessons: mistakes to guards

Each row maps a recurring failure pattern to its root cause and the standing guard that catches it. Patterns observed in the maple-math-mysteries authoring sessions; guards live in `tests/*.test.ts` and `e2e/export-import.spec.ts`.

## Mistake → cause → guard

| # | Mistake pattern | Root cause | Guard |
|---|---|---|---|
| 1 | Fingerprint canonicalization flattens nested blocks to `{}` | `JSON.stringify(puzzle, Object.keys(puzzle).sort())` applies the key list recursively, collapsing nested `BlockPicture` objects to empty shells | `tests/save-shape.test.ts` — case ids and badges globally unique; `scripts/generate.ts` `fingerprint` uses a recursive `canonical` that preserves nesting |
| 2 | Literal-count test drift (`gradeCases(g).length, g === 3 ? CASES.length : 3`) | Hardcoded branch on grade number instead of reading the pack | `tests/render-safety.test.ts` — derives max from `BUILTIN_PACKS`; `tests/save-shape.test.ts` — counts come from `ALL_CASES` |
| 3 | Stale e2e literal counts (`.case-card` toHaveCount 12→20→25→39, filter 17→22→36) | Every content change broke hand-maintained numbers in `e2e/export-import.spec.ts` | `e2e/export-import.spec.ts` — imports `packForGrade`/`countWord`, derives `GRADE_THREE_COUNT`/`GRADE_ONE_COUNT` at module scope |
| 4 | Story line duplicating the widget question verbatim | Generator `GUIDANCE[kind]` equals the widget hint text; hand-authored cases copied the widget prompt into `storyNoDigits` | `tests/content-lint.test.ts` — asserts no story last line is a verbatim or >0.8 token-overlap near-duplicate of any widget question string; `scripts/generate.ts` GUIDANCE rephrased; 8 hand-authored JSON cases fixed |
| 5 | Hardcoded case-specific copy in shared widgets | `blocks.ts` said "Check the lock" for ladder cases, `arrays.ts` said "footprints" for ferry cases | Already fixed in `src/engine/widgets/*.ts` — widgets now use kind-generic copy. **Not guarded by a test** — a "no rare word overlap" test would have false positives (crate/pie/fee/trail/spin legitimately co-occur). Documented as a rule below. |
| 6 | Playwright clicking aria-disabled pill timed out | Needed `force: true` on disabled-grade-pill click | Already fixed in commit `31d10ae`. No standing guard; the e2e test itself exercises the disabled-pill path. |
| 7 | JSON imports `with { type: 'json' }` for node --test but not Vite/tsc | Three toolchains disagree silently on import-attribute syntax | No guard — the repo pins one toolchain per script (`node --test` for unit, `vite` for build, `playwright` for e2e). `tests/pack-json.test.ts` round-trips prove the JSON is valid for all three. |
| 8 | TDZ: `CASES_G1` const spread before declaration; scripted JSON edit corrupted `grade-one.json` | Hand-splice without post-write `JSON.parse` validation | `tests/pack-json.test.ts` — every `content/cases/*.json` parses and `JSON.parse(JSON.stringify())` deep-equals |
| 9 | `COUNT_WORD` table missing entries → "zero of undefined mysteries closed" | `countWord` wraps `numToWords` which throws for n>999; UI rendered the error string instead of the word | `tests/render-safety.test.ts` — `countWord(n)` is digit-free and defined for every n from 0 to max pack size + 10 |
| 10 | Diagnostic "no undo button" probed from the map state instead of the case view | Check ran from the wrong vantage (map), not where the feature lives (open case) | No standing guard — this is a discipline rule: run the check from the consumer's vantage. See session-discipline notes below. |
| 11 | e2e reused `.break-nudge` class for the handoff banner — collision risk | Two banners shared a selector; the handoff and break nudge both used `.break-nudge` | No standing guard — the e2e test asserts both banners appear and verifies the handoff text differs. If a future banner reuses the class, the test still distinguishes by text content. |
| 12 | Scratch scripts in `/tmp` failed to resolve repo deps (playwright) | Scratch scripts ran outside the repo root so `node:./node_modules` didn't resolve | No guard — discipline rule: run scratch scripts from the repo root, or use `direnv exec .` |
| 13 | Per-commit green only because the working tree (not the commit) passed gates | Staged splits left commit contents and working tree diverged | No guard — discipline rule: the gates run against the working tree at commit time; a commit that passes only because the tree passed is a split commit that needs squashing |

## Rule: widget literal vs case-title rare-word overlap (not guarded)

A test asserting "no widget literal shares a rare word with any case title" was considered but rejected: `crate` (crate widget ↔ "The Crate Clue"), `pie` (fraction widget ↔ "The Bake-Sale Pie"), `fee` (coins widget ↔ "The Snack-Stand Fee"), `trail`/`tile` (pattern widget ↔ "The Growing Trail"), `spin`/`spinner` (spinner widget ↔ "The Likely Spinner") all legitimately co-occur because the widget is about the same topic as the case. These are domain vocabulary, not the case-specific copy that mistake 5 caught (blocks saying "Check the lock" for a ladder case). The real guard for mistake 5 is code review: shared widgets must use kind-generic copy, not case-specific nouns.

## Session discipline notes

- **10. Diagnostics from the consumer's vantage.** A "no undo button" check that runs from the map state passes while the feature lives in the case view. Always open the case first, then probe the feature — never probe from the map.
- **12. Scratch scripts.** Playwright scratch scripts resolve `node:./node_modules` relative to the cwd; a script in `/tmp` has no repo deps.. Run from the repo root, or wrap with `direnv exec .`.
- **13. Per-commit green.** Staging a split commit (`git add -p`) where the working tree passes but the staged content does not is a trap — the commit will pass CI but the content is broken. squash before pushing.
