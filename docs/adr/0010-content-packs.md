# ADR 0010: content packs as validated JSON

Date: 2026-11-14. Status: accepted.

## Context

Case content lived as TypeScript object literals under `src/cases/`. Every
new case meant a code commit touching TS. The owner wants the library to
grow past what code commits carry. Eventually the content should arrive
without an app release.

## Decision

Case content is data, not code. Each grade's cases live in one JSON pack under
`content/cases/grade-<word>.json`:

```json
{
  "packId": "core-grade-three",
  "schemaVersion": 1,
  "grade": 3,
  "title": "Maple Town mysteries for grade three",
  "cases": [ ... ]
}
```

`src/content/packs.ts` is the single load path:

- `parsePack(raw: unknown)` validates structure, every case (via
  `src/content/validate.ts`), pack-scoped id and badge uniqueness, and the
  schema version. It returns a discriminated result, `{ pack }` or
  `{ errors }`, never a partial pack.
- Built-in packs load through the same `parsePack` at module start and a
  rejected built-in **throws**. A broken pack must never silently shrink the
  town map; fail-closed beats fail-quiet.
- `gradeCases(grade)` serves `packForGrade(grade).cases`; the app has no other
  case source.

Widget kinds stay a closed set owned by the app (`WidgetKind`). A pack can
only compose puzzles from kinds the app ships; it cannot introduce behaviour.

## Remote packs (the direction, not yet built)

The loader shape is deliberately remote-ready. A future `fetchContentPacks(url)`
would: fetch, `parsePack`, reject on any error, and merge packs whose
`packId` is not already present. Rules the merge must honour:

- **Built-in packs win.** A remote pack may not shadow a built-in pack.
  It may not redefine a case id the player has progress for.
- **Schema version is a hard gate.** A pack written for a future schema is
  rejected, not best-effort parsed.
- **Progress survives content churn.** `completedCases` stores opaque ids.
  A missing id renders no card. Removing a case never erases history.
- **Parent-visible provenance.** When remote packs land, the parent view
  shows which pack each grade's content came from. Downloads are opt-in.

Storage for now is in-repo JSON commits: reviewable diffs, no hosting. The
loader treats them like a remote payload.

## Consequences

- Content authors work in JSON with a validator that names the offending
  case; `tests/packs.test.ts` keeps the rejection behaviour honest.
- The TS files under `src/cases/` are gone. `ALL_CASES` and `gradeCases`
  come from the loader, so the tests assert the served data.
- Adding a widget kind is an app change (type, widget, validator block); adding
  a case is a JSON commit.
