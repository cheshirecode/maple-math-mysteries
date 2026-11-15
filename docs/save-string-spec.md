# Save-string spec (schema 1)

One string holds all settings and progress. No login, no accounts, no server.

## Format

```
MDA1.<version>.<crc32>.<base64url(payload)>
```

- `MDA1` — magic prefix, fixed.
- `<version>` — schema version of the JSON payload, now `1`.
- `<crc32>` — CRC-32 of the payload bytes, lowercase hex.
- `<base64url(payload)>` — the payload bytes, base64url without padding.

The payload is progress JSON. The encoder compresses with
`CompressionStream('deflate-raw')` when the browser supports it and falls back
to raw UTF-8 bytes. The decoder reads the first byte: `{` means raw JSON,
anything else means inflate.

## Decode order

1. Split on `.` into four parts. Wrong shape or magic: reject.
2. Parse the version. Unknown version: reject.
3. Base64url-decode, CRC-check the bytes. Mismatch: reject.
4. Decompress when needed, `JSON.parse`, migrate old fields to current schema.
5. Apply, then autosave.

A tampered byte fails step 3. A truncated string fails step 1 or 3.

## Payload (schema 1)

```json
{
  "schemaVersion": 1,
  "grade": 3,
  "completedCases": ["c1-safe"],
  "badges": ["safe-opener"],
  "minutesPlayed": 12,
  "digitsMode": false,
  "showDigitsDefault": false
}
```

No names, no dates, no identifiers — progress numbers and badge ids only.

## State code

One save code holds every piece of state: progress, settings, and any field added later. The parent exports it from this view and loads it on any fresh device to restore the same state. There is no lock and no account: the code itself is the transfer.

## Roles

- `src/save/string.ts` — encode and decode, CRC-32, migration.
- `src/save/store.ts` — localStorage autosave.
- `tests/save.test.ts` — round-trip and tamper checks.

## Handoff by query string

Any share surface produces the same URL: `origin + pathname + ?code=` plus the
URL-encoded save code. `handoffUrl()` in `src/parent/handoff.ts` builds it; the
QR renders it, the Share button sends it, and the reader turns it into the
confirmation panel. Every import surface, paste or URL, calls the one
`importSaveText()` in `src/save/import.ts`; substituting one surface for
another changes nothing about the contract. The panel states when the import
replaces local progress, and a failed code keeps the panel open with a visible
message.
