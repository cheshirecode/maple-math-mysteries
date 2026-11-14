# ADR 0006: Digit-free authoring, enforced by test

Status: accepted

## Context

The player avoids numbers. The promise is that no numeral is visible until
the child taps "show digits". Review cannot hold that promise across nine
cases and future edits; a regression must fail a build, not a child.

## Decision

Every `CaseDef` carries digit-free text (`titleNoDigits`, `storyNoDigits`,
`questionNoDigits`) and optional digit variants. The engine renders the
digit-free text unless digits mode is on. `validateCase()` rejects any
digit in a no-digit field, and `tests/cases.test.ts` runs it over the whole
registry, so CI fails if a digit ships. Digits mode defaults from the
parent's `showDigitsDefault` setting at session start.

## Consequences

- Adding a case with a bare numeral in story text breaks the build, which
  is the intended behavior.
- Distractor options render as dot patterns, coin icons, or bands, never
  as numerals, so the widget set owns this rule too.
