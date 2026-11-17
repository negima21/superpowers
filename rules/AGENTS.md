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
>    - **Interactive Peer-to-Peer Collaboration (`/swarm`)**: Use when multiple workers need long-lived conversations, isolated `share`/`branch` workspaces, and direct `@mention` coordination on a shared message board.
>      - **Swarm Model Policy**: Always pin `/swarm` workers (`swarm{action:"add", model:...}`) to **Gemini 4 Hydrogen** (`gemini-4-hydrogen-low`, `gemini-4-hydrogen-medium`, `gemini-4-hydrogen-high`, or `gemini-4-hydrogen-xhigh`), even if the coordinator is running on **Argon** (`gemini-4-argon-*` / `gemini-pro-orchestrator-g1-pro`) or **Hydrogen**. Select the Hydrogen tier dynamically per worker based on task complexity and conditions (e.g., `low` for mechanical edits/checks, `medium` for standard implementation/verification, `high`/`xhigh` for complex architecture or deep debugging). Never delegate to `flash` or `flash_lite` in `invoke_subagent` or `run_workflow` (use `inherit`), and if any swarm member is found on a `flash` model, switch it to `gemini-4-hydrogen-*` via `swarm{action:"model"}`.
