# Dev Master Quick Reference & Cheat Sheet

A practical guide to using the Dev-Master plugin, its 42 engineering skills, autonomous subagents, Python Dynamic Workflows (`run_workflow`), automated safety hooks, and CLI tools.

---

## Quick Start: How Dev-Master Works

Dev-Master operates on two distinct levels:

1. **Automatic (Zero-Configuration)**:
   - **PostToolUse Auto-Fix**: Whenever any agent edits or creates a `.md` file, the markdown auto-fixer cleans up formatting in ~270ms.
   - **PreToolUse Safety Gate**: If a command could destroy work (`git push --force`, `git reset --hard`, recursive system deletes), it halts and asks for explicit confirmation.
   - **MCP Token Guard**: Warns if GitHub tools are called without a configured `GITHUB_TOKEN`.

2. **On-Demand (Slash Commands & Subagents)**:
   - Invoke skills by typing `/<skill-name>` directly in the chat bar.
   - Delegate heavy audits and reviews to specialized background subagents (`markdown-reviewer`, `code-reviewer`).

---

## 1. Quick Slash Command Shortcuts

The four most essential engineering workflows have short-form slash commands:

| Command | Full Skill Equivalent | When to Use | Typical Prompt |
| :--- | :--- | :--- | :--- |
| **`/verify`** | `verification-before-completion` | Before finishing any task or claiming work is done | `"/verify all tests pass and documentation has 0 errors"` |
| **`/tdd`** | `test-driven-development` | Writing new features or bug fixes using Red-Green-Refactor | `"/tdd implement email validation helper"` |
| **`/debug`** | `systematic-debugging` | Investigating bugs, errors, or unexpected test failures | `"/debug why login returns 401 on valid token"` |
| **`/plan-tasks`** | `planning-and-task-breakdown` | Breaking complex specs or features into ordered tasks | `"/plan-tasks for migrating auth to OAuth2"` |

---

## 2. Autonomous Custom Subagents

Dev-Master includes two specialized subagents that run in isolated context to prevent context bloat:

### Subagent: `@markdown-reviewer`

Specialist in CommonMark/GFM compliance and strict `markdownlint` (DavidAnson v0.41+):

- **When to Use**: Large documentation sweeps, fixing broken heading hierarchy (`MD001`), resolving inline HTML (`MD033`), cleaning up tables (`MD056`), or checking internal link anchors (`MD051`).
- **How to Invoke**:

  ```text
  "Delegate to @markdown-reviewer: Audit all markdown documentation in docs/ and fix any violations."
  ```

### Subagent: `@code-reviewer`

Adversarial, read-only code review agent using a 6-axis framework (correctness, security, performance, architecture, testing, observability):

- **When to Use**: Before merging a branch, submitting a PR, or finalizing critical business logic.
- **How to Invoke**:

  ```text
  "Delegate to @code-reviewer: Perform a 6-axis adversarial review on recently modified components."
  ```

### Bundled Python Dynamic Workflows (`run_workflow`)

Use `run_workflow` for scripted parallel fan-outs, staged pipelines, and strict JSON aggregation:

| Workflow Script | Purpose | Example Prompt |
| :--- | :--- | :--- |
| [`scripts/workflows/multi_axis_review.py`](scripts/workflows/multi_axis_review.py) | 6-axis parallel `@code-reviewer` fan-out with JSON verdict | `"Run multi_axis_review.py via run_workflow against HEAD~1"` |
| [`scripts/workflows/bulk_markdown_repair.py`](scripts/workflows/bulk_markdown_repair.py) | Auto-fix mechanical lint issues, then parallelize `@markdown-reviewer` over remaining semantic errors | `"Run bulk_markdown_repair.py via run_workflow on docs/**/*.md"` |

Choose the concurrency primitive by task shape:

- **`invoke_subagent`**: 1–2 isolated ad-hoc delegations.
- **`run_workflow`**: 3+ parallel items, staged pipelines (`phase()`, `pipeline()`), or JSON schema outputs.
- **`/swarm`**: Long-lived peer workers collaborating via `@mentions` and isolated `share`/`branch` workspaces.

---

## 3. Engineering Skills Matrix (42 Skills)

All 42 skills are first-class Antigravity skills. Type `/<name>` or reference them naturally in your prompt:

### Ideation & Problem Discovery

- **`/brainstorming`**: Divergent idea generation and stress-testing user intent before design.
- **`/idea-refine`**: Sharpens raw concepts through structured trade-off evaluation.
- **`/interview-me`**: Grills the developer to extract unstated edge cases and constraints.
- **`/doubt-driven-development`**: Adversarial devil's advocacy for high-stakes decisions.

### Planning & Architecture

- **`/writing-plans`**: Step-by-step implementation plans with explicit verification checkpoints.
- **`/spec-driven-development`**: Drafts formal technical specifications before writing code.
- **`/planning-and-task-breakdown`** (or **`/plan-tasks`**): Deconstructs features into atomic milestones.
- **`/api-and-interface-design`**: Designs contracts, types, and schemas between modules.

### Implementation & Coding

- **`/incremental-implementation`**: Delivers multi-file changes in small, testable chunks.
- **`/test-driven-development`** (or **`/tdd`**): Strict test-first Red-Green-Refactor development.
- **`/executing-plans`**: Systematic plan execution with progress tracking.
- **`/code-simplification`**: Refactors working code to remove complexity without altering behavior.

### Concurrency & Parallel Execution

- **`/subagent-driven-development`**: Orchestrates child agents for independent sub-tasks.
- **`/dispatching-parallel-agents`**: Spawns multiple parallel workers across uncoupled files.

### Quality, Debugging & Verification

- **`/systematic-debugging`** (or **`/debug`**): Evidence-based root-cause diagnosis.
- **`/code-review-and-quality`**: Multi-perspective code review and architectural adherence.
- **`/verification-before-completion`** (or **`/verify`**): Demands empirical proof before marking complete.
- **`/markdown-quality`**: Rigorous markdownlint compliance and verification.

### Git & Branch Lifecycle

- **`/using-git-worktrees`**: Isolates complex work using lightweight Git worktrees.
- **`/git-workflow-and-versioning`**: Clean commits, semantic versioning, and changelogs.
- **`/finishing-a-development-branch`**: Structured guide for merging, rebasing, or cleaning branches.
- **`/shipping-and-launch`**: Production readiness, staging rollouts, and rollback planning.

---

## 4. Automations Dashboard (Scheduled Sidecar)

Dev-Master bundles a scheduled background sidecar:

- **Name**: `Dev-Master Daily Quality Audit`
- **Schedule**: Weekday mornings (Monday–Friday) at 10:00 AM UTC
- **Task**: Automatically audits documentation quality, checks Git worktree status, and alerts on issues.
- **How to Manage**:
  1. Open the [Automations Dashboard](sidecar://dashboard).
  2. Toggle **Dev-Master Daily Quality Audit** on or off.

---

## 5. Direct CLI Usage (Terminal Commands)

You can run the Dev-Master quality engine directly from PowerShell or Command Prompt:

### Basic Verification

```powershell
# Verify all markdown files in the workspace (0 warnings required)
node scripts/markdown-tool.cjs lint "**/*.md"

# Lint specific directory or files
node scripts/markdown-tool.cjs lint "docs/**/*.md"
```

### Auto-Remediation

```powershell
# Auto-fix all 31 mechanical markdownlint rules (spacing, fences, bullets)
node scripts/markdown-tool.cjs fix "**/*.md"

# Clean disallowed <br> tags outside tables
node scripts/markdown-tool.cjs clean-br "**/*.md"

# Auto-tag bare ``` code blocks with the "text" language identifier
node scripts/markdown-tool.cjs fix-fences "**/*.md"
```

### Deep Audit & Triage

```powershell
# Comprehensive audit grouped by rule code and fixability
node scripts/markdown-tool.cjs audit "**/*.md"
```

*(In Command Prompt / CMD, you can use: `call scripts/check-markdown.cmd lint "**/*.md"`)*
