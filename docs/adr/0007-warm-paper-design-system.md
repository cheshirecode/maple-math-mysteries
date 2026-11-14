# ADR 0007: Warm-paper design system, no web fonts

Status: accepted

## Context

The first pass looked amateurish: Comic Sans as the primary face, heavy black
borders, flat saturated colors, no depth or rhythm. A kids' product earns
trust with calm, confident visuals; it does not need childish type.

## Decision

One stylesheet of design tokens drives every component. The palette is warm
paper (`#faf6ee`), warm near-black ink, one maple accent (`#b3402e`), a gold
secondary, and a success green. Depth comes from two soft shadow levels and
1px low-contrast strokes, never heavy borders. Radii form a scale: 10, 14,
and pill. Typography uses the system rounded stack (`ui-rounded`, `SF Pro
Rounded`, `Quicksand`, then `Segoe UI`), loading no web fonts, so the app
keeps its zero-network posture and offline install. The solved state is a
rotated dashed stamp on a green tint, not a badge row.

## Consequences

- A restyle is a token or component edit, not a sweep through markup.
- Rendering differs per platform; that is accepted, since every stack member
  is a rounded humanist face rather than a default serif.
- Comic Sans is gone; no font file ships, so nothing loads from the network.