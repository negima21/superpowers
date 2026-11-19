# Dev-Master Engineering & Workflow Directives

> [!IMPORTANT]
> **Superpowers Execution & Discipline Rules:**
>
> 1. **Spec & Plan First**:
>    - For any multi-step feature, non-trivial edit, or refactoring, ALWAYS create a structured implementation plan before modifying source code.
>    - Explore intent and requirements using structured planning skills (`writing-plans`, `brainstorming`).
> 2. **Work Isolation**:
>    - Protect workspace integrity. Use git worktrees or isolated feature branches (`using-git-worktrees`) when making major architectural changes or executing multi-step plans.
> 3. **Strict Verification Before Completion**:
>    - **NEVER** claim a task is complete, fixed, or passing without executing concrete verification commands (e.g. running unit tests, linting, build checks) and inspecting the actual output.
>    - Empirical proof is required before finalizing any work (`verification-before-completion`).
> 4. **Incremental Implementation & TDD**:
>    - Deliver changes in small, logical, self-contained increments (`incremental-implementation`).
>    - Write tests before writing code whenever adding new logic or fixing bugs (`test-driven-development`).
> 5. **Markdown Quality & Formatting Discipline (`markdown-quality`)**:
>    - Strictly observe markdownlint (DavidAnson v0.41+) standards across all generated or modified `.md` documentation:
>      - **Surround Blocks with Blank Lines (MD022, MD031, MD032, MD058)**: Exactly one blank line before and after headings, fenced code blocks, list blocks, and tables.
>      - **Fenced Code Block Languages (MD040)**: Always explicitly specify the language identifier (e.g., `bash`, `python`, `powershell`, `markdown`, `json`, `text`, `arabic`, `mermaid`). Never leave an unadorned bare fence.
>      - **Sequential Headings & Single Title (MD001, MD003, MD025, MD026)**: Never skip heading levels (e.g. `#` directly to `###`). ATX style only. Exactly one `# Title` per file. Omit trailing punctuation (`:`, `.`, `,`).
>      - **Clean HTML & Line Breaks (MD033)**: Never use `<br>`, `<div>`, or `<span>` in body text, lists, or blockquotes; use two trailing spaces or paragraph breaks. Use `<br>` only inside Markdown table cells or Mermaid labels where raw newlines break syntax.
>      - **Table Structure & Alignment (MD055, MD056, MD058)**: Include leading and trailing pipes (`| Col 1 | Col 2 |`). Every row must have matching column counts and standard delimiter syntax (`| :--- | :--- |`).
>      - **Valid Anchor Links & Alt Text (MD045, MD051, MD059)**: Internal hash links `[Text](#slug)` must match exact normalized heading anchor names. Images must have descriptive alt text `![Description](path.png)`. Avoid generic link text like "link" or "click here".
>      - **Mandatory Post-Generation Verification Loop**:
>        - After creating or modifying any `.md` file, you MUST immediately execute:
>          1. Auto-fix mechanical errors:
>             `node "$env:USERPROFILE\.gemini\config\plugins\superpowers\scripts\markdown-tool.cjs" fix "<file>"`
>          2. Lint verification:
>             `node "$env:USERPROFILE\.gemini\config\plugins\superpowers\scripts\markdown-tool.cjs" lint "<file>"`
>          3. Iterative Remediation: If lint outputs ANY issues (such as `MD001` heading jumps or `MD040` bare code fences), edit the file to resolve them, and re-run lint until the output explicitly confirms **0 issues in 0 files**.
>        - In CMD environments, use: `call "%USERPROFILE%\.gemini\config\plugins\superpowers\scripts\check-markdown.cmd" fix "<file>"` and `lint "<file>"`.
>        - Empirical proof of 0 markdownlint issues is required before marking documentation or markdown tasks complete.
>      - **On-Demand Project-Wide Audits (Bulk Remediation)**:
>        - When requested to audit or sweep documentation quality across a repository:
>          - `node "$env:USERPROFILE\.gemini\config\plugins\superpowers\scripts\markdown-tool.cjs" audit "**/*.md"`
>          - `node "$env:USERPROFILE\.gemini\config\plugins\superpowers\scripts\markdown-tool.cjs" fix "**/*.md"`
>          - `node "$env:USERPROFILE\.gemini\config\plugins\superpowers\scripts\markdown-tool.cjs" clean-br "**/*.md"`
>          - `node "$env:USERPROFILE\.gemini\config\plugins\superpowers\scripts\markdown-tool.cjs" fix-fences "**/*.md"`
> 6. **Multi-Agent Orchestration Discipline (Subagents vs. Dynamic Workflows vs. Swarm)**:
>    - **Single / Ad-hoc Delegation (`invoke_subagent`)**: Use for 1–2 isolated tasks (`@code-reviewer`, `@markdown-reviewer`, `research`, `browser`).
>    - **Scripted Fan-Out & Staged Pipelines (`run_workflow`)**: Use when orchestrating 3+ independent items in parallel (`parallel()`), staged pipelines (`pipeline()`, `phase()`), or schema-enforced JSON outputs (`schema=`) — including bundled workflows [`multi_axis_review.py`](file:///C:/Users/lolic/.gemini/config/plugins/superpowers/scripts/workflows/multi_axis_review.py) and [`bulk_markdown_repair.py`](file:///C:/Users/lolic/.gemini/config/plugins/superpowers/scripts/workflows/bulk_markdown_repair.py).
>    - **Interactive Peer-to-Peer Collaboration (`/swarm`)**: Use when multiple workers need long-lived conversations, isolated `share`/`branch` workspaces, and direct `@mention` coordination on a shared message board. Leverage native swarm primitives where appropriate: pass `fork:"<member>"` (or `"coordinator"`) when a new worker needs warm context, use `tasks` / `n` for sharded worker pools, and split large swarms (8+ workers or independent work areas) into topic `channels` while keeping `main` quiet.
>      - **Swarm Model Policy (Hybrid Hydrogen + Neon, Never Argon)**: Always explicitly pin `/swarm` workers (`swarm{action:"add", model:...}`) to **Gemini 4 Hydrogen** or **Gemini 4 Neon** regardless of the coordinator's model (**Orchestrator (Neon)** `gemini-pro-orchestrator-neon`, **Neon** `gemini-4-neon-*`, **Orchestrator (Argon)** `gemini-pro-orchestrator-g1-pro`, **Argon** `gemini-4-argon-*`, or **Hydrogen** `gemini-4-hydrogen-*`), unless the user explicitly requests another model. Never auto-assign **Argon** (`gemini-4-argon-*` / `gemini-pro-orchestrator-g1-pro`) to preserve its separate weekly quota bucket.
>      - **Role & Thinking-Level Routing**:
>        - `gemini-4-hydrogen-low`: Mechanical edits, linting/formatting, boilerplate, and swarm support workers (`monitor`, `narrator`).
>        - `gemini-4-hydrogen-medium` / `gemini-4-hydrogen-high`: Default workhorse for standard feature implementation, tests, and scoped multi-file edits.
>        - `gemini-4-neon-medium` / `gemini-4-neon-high`: High-judgment roles — verifiers, adversarial code reviewers, security audits, complex refactoring, architecture design, and deep debugging (`gemini-4-neon-xhigh` only for the hardest root-cause or frontier design work).
>      - **Mid-Swarm Switching, Quota & Flash Guardrails**:
>        - **Low-Quota Step-Down (`[quota]` warning)**: Because Neon and Hydrogen share the same rolling quota bucket, downgrade high-burn workers (`neon-high`/`xhigh` → `neon-medium` or `hydrogen-medium`/`low`) via `swarm{action:"model"}` when `[quota]` warnings appear.
>        - **0% Bucket Exhaustion**: Pause and ask the user before switching any member to **Argon** or **Claude** — never silently burn weekly Argon quota.
>        - **In-Place Escalation**: If a Hydrogen worker stalls or loops on complex logic, escalate it in-place to `gemini-4-neon-medium` or `gemini-4-neon-high` via `swarm{action:"model"}` (preserving its conversation) instead of killing it.
>        - **Strict Flash Ban**: Never delegate to `flash` or `flash_lite` in `invoke_subagent` or `run_workflow` (use `inherit`). If any swarm member is found on a `flash` model, immediately switch it to the appropriate `gemini-4-hydrogen-*` or `gemini-4-neon-*` tier via `swarm{action:"model"}`.
