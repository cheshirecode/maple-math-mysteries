# Product audit: the child flow

The player is one eight-year-old with mild ADHD. She avoids numerals, so
quantity comes first and digits stay hidden until she asks for them.

This pass covers the first run, the case loop, failure states, parent
friction, and privacy. A finding marked `fixed` ships now. A finding marked
`later` needs art or a product call, not a bug fix.

## Walk and findings

| Step | Finding | Status |
| --- | --- | --- |
| First run | Nine cards, zero guidance. A "start here" sticker now marks the first unsolved case. | fixed |
| First run | No onboarding voice line ("Tap a case, detective"). Nice, not needed; the sticker carries it. | later |
| Case open | No way back until solved. A wrong tap trapped the child. Every case now shows "Back to the map". | fixed |
| Case loop | The story reads aloud once. Buttons carry no speech. Tap-to-speak on prompt lines would help pre-readers. | later |
| Dots case | 13 dots in one strip is over the subitizing range. Rows now wrap at five dots, a ten-frame shape. | fixed |
| Wrong answer | No red X, no timer. A wrong tap brings a retry line and a fresh arrangement. This is the right shape for this child. | keep |
| Right answer | Text "Case closed!" plus a badge. A small confetti burst would make the win feel bigger. It needs art first. | later |
| Digits toggle | Off by default; parent default respected at load. No digit renders before the toggle; enforced by test and browser check. | keep |
| Session | No natural stop. A gentle "detective break" after three solved cases would help. Needs a product call first. | later |
| Parent gate | One code, hash-only, wrong code does nothing. Friction is one field; acceptable. | keep |
| Export/import | One string, checksum, version reject. Verified across two fresh browser profiles. | keep |
| Coins case | Coin sizes differ per value; colour is not the only signal. Fine for colour-blind play. | keep |
| Spinner case | Answer buttons name colours in text, so the label survives colour blindness. | keep |
| Privacy | No accounts, no analytics, no network calls. Nothing to collect. | keep |
| Offline | Service worker caches the shell; verified with the network cut. Navigation is network-first so updates reach returning visitors. | keep |
| Device handoff | Export offers copy, share, and download; import verified desktop to emulated mobile in CI. A QR code for phone scan is a later add. | later |
| Small screens | 44px buttons, wrapped dot rows, scaled widgets; e2e asserts no horizontal overflow at 390px. | keep |

## Deferred, with owners

- Voice on prompts: `mmm-pm-audit` follow-up. Needs per-line tap targets.
- Confetti beat: art asset, then `engine/run.ts`.
- Detective-break nudge: product decision on session shape, then `main.ts`.
- QR handoff: encode the save-string in the URL or a QR on the export box, then `parent.ts`.

## Verdict

The flow fits this child. Nothing punishes a wrong tap. No timer presses
her. Digits stay hidden until asked for. Every case has a way out, and
progress moves by hand between devices. What is left is polish, not
defects.