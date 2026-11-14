# ADR 0007: Warm-paper design system, no web fonts

Status: accepted

## Context

The first pass looked amateurish. It set Comic Sans as the main face and
used heavy black borders on flat, loud colors. A kids' product earns trust
with calm visuals. It does not need childish type.

## Decision

One stylesheet of design tokens drives every component.
The palette: warm paper, warm near-black ink, one maple accent.
It adds a gold secondary and a success green.
Depth comes from two soft shadow levels.
Strokes are 1px and low contrast.
No heavy borders anywhere.
Radii form a scale: 10, 14, and pill.
Typography uses the system rounded stack.
The stack is `ui-rounded`, `SF Pro Rounded`, `Quicksand`, then `Segoe UI`.
It loads no web fonts.
The app keeps its zero-network posture and offline install.
The solved state is a rotated dashed stamp on a green tint, not a badge row.

## Consequences

- A restyle is a token or component edit, not a sweep through markup.
- Rendering differs per platform; that is accepted.
  Every stack member is a rounded humanist face, not a default serif.
- Comic Sans is gone; no font file ships, so nothing loads from the network.