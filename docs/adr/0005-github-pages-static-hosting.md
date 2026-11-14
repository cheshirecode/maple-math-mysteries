# ADR 0005: GitHub Pages via Actions; static-only forever

Status: accepted

## Context

The game must be free to host for a public, open-source repo, installable
on a family tablet, and usable offline at a cabin. No account, no backend,
no analytics are wanted.

## Decision

GitHub Pages, deployed by GitHub Actions on push to `main`
(`.github/workflows/deploy.yml`), with CI on every push and PR. Ship as a
PWA: manifest plus a hand-rolled cache-first service worker (`public/sw.js`).
The repo is public, so Actions minutes are free.

## Consequences

- Any feature that needs a server is out of scope by construction.
- The service worker is simple enough to audit in one screen; it caches
  same-origin GETs and serves stale-then-refresh.
- Alternatives with the same output (Cloudflare Pages) remain drop-in
  because the build is plain static files.
