# ADR 0011: Hash routing, hand-rolled

Date: 2026-11-15. Status: accepted.

## Context

Every view rendered client-side with no address: the map, the concept
sections, and each case were indistinguishable in the URL bar, unshareable,
and the browser back button left the app. Routes arrange grade -> concept
band -> case. Static GitHub Pages hosting cannot rewrite paths, and Vite's
`base: './'` makes history-API deep paths 404 their relative asset URLs.

The owner asked to check routing libraries under Liskov and YAGNI.

## Decision

Hash routes, hand-rolled in `src/lib/router.ts` (~50 lines):

- Grammar: `#/grade-three`, `#/grade-three/combine`,
  `#/grade-three/combine/c16-bridge`. Band slugs are widget kinds; case slugs
  are pack ids. Malformed hashes degrade per shape; unknown case ids land on
  the grade map; unknown grades normalize the hash to the default route.
- One handler contract, `RouteHandler = (route, query) => void`, so route
  handlers are substitutable without changing callers (Liskov).
- The route is the single view source. Nothing calls `render()` after init
  except the hashchange dispatch; card clicks, pill clicks, and both back
  buttons call `navigate()`, which only ever assigns `location.hash` — same
  hash pushes no entry (YAGNI: no history wrappers).
- The route never rewrites `location.search`: the `?code=` handoff composes
  (`?code=X#/grade-one`), and the handoff wins over a case route on first
  render because the panel needs the map behind it.
- The pack write stays on the pill path: deep links and back render a grade
  without changing the saved grade.

## Libraries considered and rejected

- **page.js** (~1.2KB): history-API first, hash mode second-class; conflicts
  with `base: './'`.
- **@vaadin/router** (~10-15KB): nested child outlets — the app replaces the
  whole `#app`; the feature goes unused.
- **navigo / URLPattern**: hooks and regex-grade patterns exceed three fixed
  routes; `URLPattern` browser support remains partial.

All three target requirements this app does not have. Revisit if param
transforms, nested outlets, or search-param routing arrive.

## Consequences

- Deep links to locked-band cases run the case: the lock is a browsing gate
  (shelf, pills), not a URL gate. Bookmark intent wins.
- `hideSolved` stays a module var: putting it in the hash would flood history.
- The service worker needs no change: hash navigations stay at `/`, which the
  network-first SW already serves.
- Grade slugs (`grade-three`) enter the URL; `gradeSlug`/`gradeFromSlug` in
  `src/grades.ts` are the single mapping.
