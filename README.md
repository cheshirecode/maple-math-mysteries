# Maple Math Mysteries

A detective game where math is the tool. Built for a grade-3 reader of the
British Columbia curriculum. Quantity comes before digits: every case starts
with dot patterns, blocks, nets, jugs, and coins. Numerals appear only after
the child taps "show digits."

No login. No accounts. No data collection. One parent-set access code guards
the parent view, including import and export of progress.

## Cases (BC grade-3 content standards)

| Case | Tool | BC content standard |
| --- | --- | --- |
| The Locked Safe | base-ten blocks | number concepts to 1000 |
| The Streetcar Fare | dot cards | addition and subtraction to 1000, facts to 20 |
| The Equal Loot | footprint arrays | multiplication and division concepts |
| The Bake-Sale Pie | pie shares | fraction concepts |
| The Growing Trail | pattern strip | patterns and pattern rules |
| The Thirsty Jug | jug bands | measurement and time |
| The Crate Clue | crate nets | 3D objects and graphs |
| The Likely Spinner | spinner dial | likelihood of simulated events |
| The Snack-Stand Fee | coin tray | financial literacy |

## Repository map

```
index.html                 entry page
public/                    manifest, icon, service worker
src/main.ts               shell: town map, digits toggle, minutes tracker
src/state.ts               progress model, migration, store bus
src/save/string.ts         save-string encode/decode, CRC-32
src/save/code.ts           access-code hash (PBKDF2)
src/save/store.ts          localStorage keys
src/engine/case.ts         CaseDef and PuzzleData types, validation
src/engine/run.ts          case loop: story, widget, feedback, badge
src/engine/widgets/        dots, blocks, arrays, fraction, pattern,
                           measure, crate, spinner, coins
src/cases/                 one data file per case + registry
src/parent/parent.ts       gated parent view: stats, import, export, reset
tests/                     node tests: save round-trip, code, digits guard
docs/adr/                  architecture decision records
docs/save-string-spec.md   save-string envelope spec
.github/workflows/          ci (every push), deploy (Pages on main)
```

## Development

```
npm install
npm run dev
npm run lint
npm test
npm run typecheck
npm run build
```

Node 24 or newer (the test runner uses native TypeScript stripping).

## Save-string

Progress serializes to one long string: `MDA1.<version>.<crc32>.<base64url>`.
A fresh session restores it from the parent view. See
[docs/save-string-spec.md](docs/save-string-spec.md).

## Decisions

See [docs/adr/](docs/adr/) for the six recorded decisions: stack, case
engine, save-string format, access code, hosting, and the no-digit rule.
The product audit of the child flow lives in
[docs/pm-audit.md](docs/pm-audit.md).

## Hosting

Static site. GitHub Pages deploys the `dist/` build on every push to `main`
via `.github/workflows/deploy.yml`. The service worker caches the app for
offline play.

## License

MIT
