# ADR 0002: Data-driven case engine

Status: accepted

## Context

Nine cases must map to the BC grade-3 content standards, each with a story,
a tool, a success check, and a badge. Cases must stay auditable against the
curriculum, and the no-digit rule must be checkable by a test, not by review.

## Decision

A case is a `CaseDef` data object (`src/engine/case.ts`), not a code path:
story lines, digit-variant text, a widget kind, and a `PuzzleData` shape.
Widgets are pure renderers from `(root, puzzle, hooks)`. `src/cases/` holds
one file per case; `src/cases/index.ts` is the ordered registry. The engine
(`src/engine/run.ts`) interprets a `CaseDef`; it contains no case content.

## Consequences

- Adding a case means writing data plus, at most, one widget.
- `tests/cases.test.ts` walks the registry, so the digits guard and schema
  checks cover every case that exists.
- A new puzzle shape needs a widget and a `PuzzleData` union member, which
  is the one place the engine changes.
