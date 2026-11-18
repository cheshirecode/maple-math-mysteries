# ADR 0012: Clay learning-blue retheme

Status: accepted

## Context

The toy-bright warm-paper palette (0007) predates the shipped product.

The owner asked for a retheme and chose clay learning-blue.

That direction is a skill-verified kids-learning palette: blue primary, play accents.

It replaces the cream and coral paper look.

## Decision

Chrome tokens move to clay learning-blue.

Primary pressables are blue with white text and a soft press shadow.

Paper is light blue-tinted with a slate dot grid.

Question bars turn pink; ink turns slate.

Red is reserved for the counting dots and danger controls.

Gold stays on the base-ten objects, whose colors game copy names.

Spinner answers say "gold", so that gold cannot move.

Headings use self-hosted Baloo 2; body uses self-hosted Comic Neue.

The service worker cache bumps to mmm-v3 to pick the fonts up offline.

This supersedes the palette half of 0007 and keeps 0009's one-theme rule.

## Consequences

Object illustrations keep their colors.

Coins, crate, water, spinner wedges, blocks, and pies are unchanged.

Content packs and save codes are untouched.

Fonts ship in the bundle from src/fonts.

There is no font CDN and no new privacy surface.

The undefined --coral token referenced by the question bar becomes a real --pink token.
