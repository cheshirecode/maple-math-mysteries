# Maple Math Mysteries

A detective game where math is the tool. Built for a grade-3 reader of the
British Columbia curriculum. Quantity comes before digits: every case starts
with dot patterns, blocks, maps, and coins. Numerals appear only after the
child taps "show digits."

No login. No accounts. No data collection. One parent-set access code guards
the parent view, including import and export of progress.

## Cases (BC grade 3 content standards)

| Case | Tool | BC content standard |
| --- | --- | --- |
| The Locked Safe | base-ten blocks | number concepts to 1000 |
| The Streetcar Fare | dot cards | addition and subtraction to 1000, facts to 20 |
| The Equal Loot | footprint arrays | multiplication and division concepts |
| The Bake-Sale Pie | pie share | fraction concepts |
| The Growing Trail | pattern strip | patterns and pattern rules |
| The Millilitre Jug *(later)* | tape and jug | measurement, time |
| The Crate Clue *(later)* | crate shapes | 3D objects, graphs |
| The Likely Spinner *(later)* | spinner | likelihood of simulated events |
| The Snack-Stand Fee *(later)* | coins | financial literacy |

## Development

```
npm install
npm run dev
npm test
npm run typecheck
npm run build
```

## Save-string

Progress serializes to one long string: `MDA1.<version>.<crc32>.<base64url>`.
A fresh session restores it from the parent view. See
[docs/save-string-spec.md](docs/save-string-spec.md).

## Hosting

Static site. GitHub Pages deploys the `dist/` build on every push to `main`
via `.github/workflows/deploy.yml`. The service worker caches the app for
offline play.

## License

MIT
