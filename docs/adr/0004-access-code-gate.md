# ADR 0004: One access code, hash-only storage, no login

Status: superseded by [0008](0008-state-code-replaces-gate.md)

## Context

The parent view carries import, export, and erase. The child must not
reach it by tapping around. There is no server, so there is no login. A
family app collects nothing, so there is nothing to recover by email.

## Decision

One access code, set by the parent on first parent-view entry, gates the
parent view and both import and export. Store only a salted PBKDF2-SHA-256
hash (210000 iterations, WebCrypto) in `localStorage`. The unlock flag lives
in memory for the session only. A wrong code changes nothing. The forgot-code
path erases all local data; the parent then re-imports the last save-string.

## Consequences

- The code never leaves the device; the device stores a hash, not the code.
- Moving devices means the parent re-enters (or re-sets) the code; the
  save-string itself is not code-bound.
- Forgetting the code costs local progress unless a save-string was kept.
