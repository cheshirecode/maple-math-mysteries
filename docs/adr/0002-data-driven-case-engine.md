# ADR 0002: Data-driven case engine

Status: accepted (storage superseded in part by [0010](0010-content-packs.md))

## Context

Nine cases must map to the BC grade-3 content standards. Each case needs a
story, a tool, a success check, and a badge. Cases must stay auditable
against the curriculum. A test, not a review, must hold the no-digit rule.

## Decision

A case is a data object, not a code path. Each `CaseDef` lives in
`src/engine/case.ts`: the story, digit-variant text, a widget kind, and a
`PuzzleData` shape.
Widgets are pure renderers from `(root, puzzle, hooks)`. Case content lives
in the JSON packs of [0010](0010-content-packs.md), one pack per grade. The
engine (`src/engine/run.ts`) interprets a `CaseDef` and contains no case
content.

## Consequences

- Adding a case means writing data plus, at most, one widget.
- `tests/cases.test.ts` walks the registry, so the digits guard and schema
  checks cover every case that exists.
- A new puzzle shape needs a widget and a `PuzzleData` union member, which
  is the one place the engine changes.
