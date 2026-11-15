# Lessons: mistakes to guards

Each row maps a failure pattern to its cause and the standing guard. Guards
live in `tests/*.test.ts` and `e2e/export-import.spec.ts`.

## Mistake, cause, guard

| # | Mistake pattern | Root cause | Guard |
| --- | --- | --- | --- |
| 1 | Fingerprint canonicalization flattened nested blocks | `JSON.stringify` replacer key list applies recursively | Round-trip test in `tests/pack-json.test.ts`; recursive `canonical` in `scripts/generate.ts` |
| 2 | Literal-count test drift on a grade branch | Hardcoded count instead of reading the pack | `tests/save-shape.test.ts` derives all counts from `ALL_CASES` |
| 3 | Stale e2e literal counts broke on every content change | Hand-maintained `toHaveCount` numbers | `e2e/export-import.spec.ts` derives counts from the packs |
| 4 | Story lines copied the widget question | Generator guidance equalled the widget hint | `tests/content-lint.test.ts` near-duplicate lint over both corpora |
| 5 | Shared widgets carried case-specific copy | "Check the lock" on a ladder case | Rule: widgets use kind-generic copy. No test: false positives |
| 6 | Playwright timed out clicking an aria-disabled pill | Actionability check treats aria-disabled as unclickable | Fixed in the spec; no standing guard needed |
| 7 | Node, Vite, and tsc disagree on JSON import attributes | Three toolchains, one syntax need | `tests/pack-json.test.ts` round-trips keep the JSON valid for all three |
| 8 | TDZ spread; a hand-splice corrupted a pack file | Scripted edit without post-write parse validation | `tests/pack-json.test.ts` parses and round-trips every pack |
| 9 | Missing count-table entry rendered "undefined mysteries" | Word table ended below the pack size | `tests/render-safety.test.ts`: `countWord` defined and digit-free over the full range |
| 10 | "No undo button" probed from the map state | Check ran from the wrong vantage | Rule: open the case, then probe the feature |
| 11 | Handoff banner reused the break-nudge class | Two banners shared one selector | Rule: the e2e tells banners apart by text, not class |
| 12 | Scratch scripts in `/tmp` failed to resolve repo deps | Scripts ran outside the repo root | Rule: run scratch scripts from the repo root |
| 13 | Commits green only because the working tree passed | Staged split diverged from the tree | Rule: gate the staged content, squash before pushing |
| 14 | Gate pipeline masked by a piped tail | Pipe exit status replaced the gate's exit status | Rule: run gates unpiped or under `set -o pipefail` |

## Not guarded, with reasons

- Widget literals versus case titles: a rare-word-overlap test would false-positive on domain words (crate, pie, fee, trail, spin). Code review catches case-specific copy; the table above keeps it visible.
- Offline reload: manual check, last run 2026-11-14, owner listed in `docs/requirements.md` R9.
