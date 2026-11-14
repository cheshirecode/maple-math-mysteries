# ADR 0003: Save-string envelope `MDA1.<version>.<crc32>.<base64url>`

Status: accepted

## Context

Progress must move between devices with no accounts and no server. One
long string carries it. The parent saves it, then imports it in a fresh
session. Import must fail
loudly on truncation or corruption, and old strings must keep working as the
schema grows.

## Decision

Envelope `MDA1.<version>.<crc32>.<base64url>` (`src/save/string.ts`).
Payload is progress JSON. Encode with `CompressionStream('deflate-raw')`
when available; fall back to raw UTF-8. Decode by first payload byte:
`{` means raw JSON, anything else means inflate. CRC-32 guards the payload
bytes; the version gates `migrate()` in `src/state.ts`. Details:
[save-string spec](../save-string-spec.md).

## Consequences

- A tampered or truncated string is rejected before any state changes.
- Both compression paths share one envelope, so old browsers still export.
- The string is not secret; secrecy is the access code's job (ADR 0004).
  Sealing it with AES-GCM later would add a fifth field, not a new format.
