# Maple Math Mysteries

[![Pages](https://img.shields.io/badge/pages-live-brightgreen)](https://cheshirecode.github.io/maple-math-mysteries/)

Play it: **<https://cheshirecode.github.io/maple-math-mysteries/>**

A detective game where math is the tool. Built for a grade-3 reader of the
British Columbia curriculum. Quantity comes before digits: every case starts
with dot patterns, blocks, nets, jugs, and coins. No numeral renders anywhere
in the child's view; pictures and word numerals carry the meaning. There is
no login and nothing leaves the browser. One save code carries all state
between devices.

## How the content is organized

Two hundred thirty-nine cases live in five JSON packs, one per grade,
under `content/cases/`. Each case pairs a story with a widget.
Eleven widgets cover the formats, from base-ten blocks and dot pairs to
coin trays and spinner dials.

Cases inside a grade open in concept order: place value first, chance and
money last. The map shows one concept band at a time until the child clears
it. A generator (`npm run generate`) extends bands with variant puzzles.
Every pack passes a fail-closed validator before the app loads it, and the
tests reject any numeral in child-facing text.

| Concept band (grade three) | Widget | BC strand |
| --- | --- | --- |
| Place value | base-ten blocks | number concepts to 1000 |
| Comparing | block pictures | number concepts to 1000 |
| Ticket pairs | dot cards | addition and subtraction facts to 20 |
| Add and take away | build-the-answer | addition and subtraction to 1000 |
| Equal rows | footprint arrays | multiplication and division concepts |
| Fair shares | pie slices | fraction concepts |
| Growing patterns | pattern strip | patterns and pattern rules |
| Measuring | jug bands | measurement and time |
| Net folding | crate nets | 3D objects and graphs |
| Chance | spinner dial | likelihood of simulated events |
| Money | coin tray | financial literacy |

## Parent tools

The parent area shows play statistics, a sounds toggle, and a voice toggle.
Progress moves between devices three ways. A save code copies as text. A QR
code opens the site with the code attached. A file download works offline.

## Repository map

```
index.html                 entry page
content/cases/             JSON packs, one per grade (the content source)
scripts/                   pack generator and variant bands
public/                    manifest, icon, service worker
src/main.ts                shell: town map, concept sections, minutes tracker
src/state.ts               progress model, migration, store bus
src/grades.ts              grade registry, concept sequence, unlock rules
src/content/               pack loader and fail-closed validation
src/save/string.ts         save-string encode/decode, CRC-32
src/save/store.ts          localStorage keys
src/engine/case.ts         CaseDef and PuzzleData types, validation
src/engine/run.ts          case loop: story, widget, feedback, badge
src/engine/widgets/        the eleven puzzle widgets
src/voice.ts               tap-to-speak lines (Web Speech)
src/sfx.ts                 solve chime, retry tone, fanfare (Web Audio)
src/parent/                parent area: stats, toggles, QR handoff
e2e/                       one Playwright walk: solve, nudge, export, import
tests/                     unit gates: packs, content lint, generator, save
```

## Development

```sh
npm install
npm run dev        # local dev server
npm test           # unit gates (69 and counting)
npm run test:e2e   # PW_CHANNEL=chrome locally; CI runs bundled chromium
npm run generate   # extend content packs with variant puzzles
```

Design history and decisions live in `docs/adr/`. Session lessons and the
guards they produced live in `docs/lessons.md`.
