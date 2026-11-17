"""Dynamic Workflow: Mechanical Auto-Fix + Parallel Semantic Markdown Repair.

Designed for Antigravity `run_workflow(ScriptPath=..., Args=...)`.

Optional `Args`:
  files (list[str]): Explicit list of Markdown files to process.
  glob (str): Glob pattern when `files` is omitted (default: "**/*.md").
"""

import json
import os
import re
import subprocess
from pathlib import Path

wf_args = globals().get("args") or {}
explicit_files = wf_args.get("files") or []
target_glob = wf_args.get("glob") or "**/*.md"

TOOL_PATH = str(
    Path.home()
    / ".gemini"
    / "config"
    / "plugins"
    / "superpowers"
    / "scripts"
    / "markdown-tool.cjs"
)

ISSUE_RE = re.compile(
    r"^(.+?):(\d+)(?::(\d+))?\s+(?:(?:error|warning)\s+)?([A-Z0-9]+)/([a-z0-9-]+)\s+(.*)$",
    re.IGNORECASE,
)


def _run_tool(command: str, targets: list[str]) -> tuple[int, str]:
    """Run dev-master's markdown-tool.cjs on the given targets."""
    proc = subprocess.run(
        ["node", TOOL_PATH, command, *targets],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    combined = (proc.stdout or "") + "\n" + (proc.stderr or "")
    return proc.returncode, combined


def _parse_lint_files(output: str) -> dict[str, list[str]]:
    """Group lint violation lines by file path."""
    by_file: dict[str, list[str]] = {}
    for line in output.splitlines():
        match = ISSUE_RE.match(line.strip())
        if match:
            file_path = os.path.normpath(match.group(1).strip())
            by_file.setdefault(file_path, []).append(line.strip())
    return by_file


REPAIR_SCHEMA = {
    "type": "object",
    "properties": {
        "file": {"type": "string"},
        "fixed_rules": {"type": "array", "items": {"type": "string"}},
        "clean": {"type": "boolean"},
        "notes": {"type": "string"},
    },
    "required": ["file", "fixed_rules", "clean"],
}

targets = [str(f).strip() for f in explicit_files if str(f).strip()] or [target_glob]

phase("Mechanical Auto-Fix & Discovery")
fix_rc, _ = _run_tool("fix", targets)
lint_rc, lint_output = _run_tool("lint", targets)
issues_by_file = _parse_lint_files(lint_output)

if lint_rc == 0 and not issues_by_file:
    log("All Markdown files passed mechanical fix + lint with 0 issues.")
    print(json.dumps({"clean": True, "repaired": [], "remaining_files": []}, indent=2))
elif not issues_by_file:
    # Lint failed without standard line matches; hand off cleanly via agent discovery.
    log(f"markdownlint exited with code {lint_rc}; inspecting output via agent.")
    discovered = await agent(
        prompt=(
            f"Run `node \"{TOOL_PATH}\" lint {' '.join(targets)}` or inspect the lint output "
            f"below and return the list of Markdown file paths that still have errors:\n\n"
            f"{lint_output[:8000]}"
        ),
        schema={"type": "array", "items": {"type": "string"}},
        role="Identify failing Markdown files",
        model="inherit",
    )
    for f in discovered or []:
        cleaned = str(f).strip()
        if cleaned:
            issues_by_file[cleaned] = ["Reported by markdownlint"]
    if not issues_by_file:
        print(
            json.dumps(
                {
                    "clean": False,
                    "repaired": [],
                    "remaining_files": [],
                    "raw_output": lint_output[:2000],
                },
                indent=2,
            )
        )

if issues_by_file:
    failing_files = sorted(issues_by_file.keys())
    log(f"Found {len(failing_files)} file(s) requiring semantic Markdown repair.")

    phase("Parallel Semantic Repair")
    repair_results = await parallel(
        failing_files,
        lambda f: agent(
            prompt=(
                f"Fix all remaining markdownlint violations in `{f}` while preserving "
                f"documentation meaning and structure.\n\n"
                f"Detected violations:\n"
                + "\n".join(f"- {item}" for item in issues_by_file[f][:40])
                + f"\n\nAfter editing `{f}`, verify by running:\n"
                f"`node \"{TOOL_PATH}\" fix \"{f}\"` and "
                f"`node \"{TOOL_PATH}\" lint \"{f}\"` until 0 issues remain."
            ),
            schema=REPAIR_SCHEMA,
            role=f"Repair MD: {Path(f).name}",
            type_name="markdown-reviewer",
        ),
    )

    phase("Final Verification")
    final_rc, final_output = _run_tool("lint", targets)
    remaining = sorted(_parse_lint_files(final_output).keys())
    log(
        f"Final lint exit_code={final_rc}, remaining_files_with_issues={len(remaining)}"
    )
    print(
        json.dumps(
            {
                "clean": final_rc == 0 and not remaining,
                "repaired": repair_results,
                "remaining_files": remaining,
            },
            indent=2,
        )
    )
