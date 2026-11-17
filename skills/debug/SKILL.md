---
name: debug
description: Shortcut slash command alias for systematic-debugging. Use when diagnosing bugs, test failures, or unexpected errors before proposing fixes.
---

# Systematic Debugging (Debug)

> Alias for [`systematic-debugging`](../systematic-debugging/SKILL.md)

## Core Directive

Find root causes through evidence and reproducible test cases rather than guessing or applying speculative patches.

## Operating Protocol

1. **Reproduce**: Create a minimal reproducing test case or command that reliably triggers the failure.
2. **Trace**: Follow data flow backwards from the failure site to locate the exact divergent state.
3. **Hypothesize & Prove**: Formulate a hypothesis and test it before modifying production logic.
4. **Remediate**: Apply the minimal targeted fix and verify resolution.
