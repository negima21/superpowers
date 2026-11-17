---
name: verify
description: Shortcut slash command alias for verification-before-completion. Use to run verification commands and prove tasks are passing before completing them.
---

# Verification Before Completion (Verify)

> Alias for [`verification-before-completion`](../verification-before-completion/SKILL.md)

## Core Directive

**NEVER** claim a task is complete, fixed, or passing without executing concrete verification commands and inspecting the output.

## Operating Protocol

1. Identify the verification command for the current stack (e.g. `npm test`, `pytest`, `cargo test`, `go test`).
2. Execute the test or build command.
3. Inspect stderr, exit code, and test report.
4. Only declare success when empirical proof confirms 0 errors.
