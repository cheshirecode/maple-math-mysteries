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

## Access code

One code, set by the parent on first parent-view entry, covers every setting
and all progress. The device stores a salted PBKDF2-SHA-256 hash only
(210000 iterations, WebCrypto). A wrong code does nothing. The forgot-code
reset erases all local data, then the parent imports the last save-string.

## Roles

- `src/save/string.ts` — encode and decode, CRC-32, migration.
- `src/save/code.ts` — code hash and check.
- `src/save/store.ts` — localStorage autosave.
- `tests/save.test.ts` — round-trip and tamper checks.
- `tests/code.test.ts` — code hash and wrong-code checks.
