# ADR 0008: State code replaces the access-code gate

Status: accepted

## Context

The first design used a PBKDF2 code to unlock the parent view. A second string carried progress. That was two secrets for one job.

## Decision

One save code carries all state. The parent view opens freely; export builds the code, import loads it. Progress is the single state object, so new fields serialize without format changes. Supersedes ADR 0004.

## Consequences

No gate stops the child from the parent view (accepted). A leaked code leaks progress, nothing more - the code contains no secrets. ADR 0004 is superseded; its file stays for history.
