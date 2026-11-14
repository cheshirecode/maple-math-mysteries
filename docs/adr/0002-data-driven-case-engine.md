# ADR 0002: Data-driven case engine

Status: accepted

## Context

Nine cases must map to the BC grade-3 content standards. Each case needs a
story, a tool, a success check, and a badge. Cases must stay auditable against the curriculum. A test, not a review,
must hold the no-digit rule.

## Decision

A case is a data object, not a code path. Each `CaseDef` lives in
`src/engine/case.ts`. It holds the story, the digit-variant text, a widget
kind, and a `PuzzleData` shape.
Widgets are pure renderers from `(root, puzzle, hooks)`. `src/cases/` holds
one file per case; `src/cases/index.ts` is the ordered registry. The engine
(`src/engine/run.ts`) interprets a `CaseDef`; it contains no case content.

## Consequences

- Adding a case means writing data plus, at most, one widget.
- `tests/cases.test.ts` walks the registry, so the digits guard and schema
  checks cover every case that exists.
- A new puzzle shape needs a widget and a `PuzzleData` union member, which
  is the one place the engine changes.
