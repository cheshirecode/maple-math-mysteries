# ADR 0006: Digit-free authoring, enforced by test

Status: accepted

## Context

The player avoids numbers. No numeral may be visible until the child taps "show digits". Review cannot hold that promise across nine
cases and future edits; a regression must fail a build, not a child.

## Decision

Every `CaseDef` carries digit-free text and optional digit variants.
The digit-free fields are `titleNoDigits` and `storyNoDigits`.
The engine renders digit-free text while digits mode is off.
`validateCase()` rejects any digit in a no-digit field.
`tests/cases.test.ts` runs it over the whole registry.
CI fails if a digit ships.
Digits mode starts from the parent's `showDigitsDefault` setting.

## Consequences

- Adding a case with a bare numeral in story text breaks the build, which
  is the intended behavior.
- Distractor options render as dot patterns, coin icons, or bands.
  They never render as numerals.
  The widget set owns this rule too.
