# Product audit: the child flow

Audience: one eight-year-old, mild ADHD, prefers not to see numerals.
Lens: first-run experience, the case loop, failure states, parent friction,
privacy. Status `fixed` ships in this wave. Status `later` needs a design
call or art, not a bug fix.

## Walk and findings

| Step | Finding | Status |
| --- | --- | --- |
| First run | Nine cards, zero guidance. A "start here" sticker now marks the first unsolved case. | fixed |
| First run | No onboarding voice line ("Tap a case, detective"). Nice, not needed; the sticker carries it. | later |
| Case open | No way back until solved. A wrong tap trapped the child. Every case now shows "Back to the map". | fixed |
| Case loop | The story reads aloud once. Buttons carry no speech. Tap-to-speak on prompt lines would help pre-readers. | later |
| Dots case | 13 dots in one strip is over the subitizing range. Rows now wrap at five dots, a ten-frame shape. | fixed |
| Wrong answer | No red X, no timer: a retry line and new arrangement. Matches the ADHD brief. | keep |
| Right answer | Text "Case closed!" plus a badge. A confetti beat would add delight; art needed. | later |
| Digits toggle | Off by default; parent default respected at load. No digit renders before the toggle; enforced by test and browser check. | keep |
| Session | No natural stop. A "detective break" nudge after three solved cases would fit the ADHD brief; needs a design call. | later |
| Parent gate | One code, hash-only, wrong code does nothing. Friction is one field; acceptable. | keep |
| Export/import | One string, checksum, version reject. Verified across two fresh browser profiles. | keep |
| Coins case | Coin sizes differ per value; colour is not the only signal. Fine for colour-blind play. | keep |
| Spinner case | Answer buttons name colours in text, so the label survives colour blindness. | keep |
| Privacy | No accounts, no analytics, no network calls. Nothing to collect. | keep |
| Offline | Service worker caches the shell; verified with the network cut. | keep |

## Deferred, with owners

- Voice on prompts: `mmm-pm-audit` follow-up. Needs per-line tap targets.
- Confetti beat: art asset, then `engine/run.ts`.
- Detective-break nudge: product decision on session shape, then `main.ts`.

## Verdict

The flow is sound for the MVP audience: no fail states, no timers, digits
gated, escape hatches everywhere, progress portable by hand. The deferred
items are polish, not defects.