# ADR 0001: Vite + TypeScript, no UI framework

Status: accepted

## Context

The app is a small static game for one child. It needs a case picker,
nine puzzle widgets, a save system, and a parent view. It must keep working on free
static hosting for years, with minimal maintenance. The team is one parent
plus an agent; long-lived beats fashionable.

## Decision

Build with Vite and strict TypeScript. Do not use a UI framework. Render
with plain DOM calls in `src/voice.ts`'s `el()` helper. Preact stays a noted
fallback if widget code starts repeating shape logic.

## Consequences

- The bundle stays tiny (about 16 kB before batch two) with no framework to
  churn through breaking updates.
- Every view is hand-written DOM code; no reactivity, so widgets re-render
  by explicit calls.
- Upgrading Vite or TypeScript is the only toolchain maintenance.
