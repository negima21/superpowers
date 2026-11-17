"""Dynamic Workflow: 6-Axis Parallel Code Review.

Designed for Antigravity `run_workflow(ScriptPath=..., Args=...)`.

Optional `Args`:
  files (list[str]): Specific file paths to review. If omitted, discovers
    modified/untracked files against `base_ref` using git.
  base_ref (str): Git ref to diff against when discovering files (default: "HEAD~1").
  context (str): Spec summary, PR description, or global constraints for reviewers.
"""

import json
import subprocess

wf_args = globals().get("args") or {}
explicit_files = wf_args.get("files") or []
base_ref = wf_args.get("base_ref") or "HEAD~1"
review_context = wf_args.get("context") or ""

AXES = [
    {
        "name": "Correctness & Logic",
        "focus": (
            "Verify exact spec alignment, boundary conditions, null/empty handling, "
            "off-by-one errors, race conditions, and complete error-path handling."
        ),
    },
    {
        "name": "Security & Hardening",
        "focus": (
            "Inspect input validation/sanitization, hardcoded credentials or secrets, "
            "authorization/authentication checks, injection surfaces, and untrusted boundaries."
        ),
    },
    {
        "name": "Performance & Scale",
        "focus": (
            "Check for N+1 queries, unbounded loops or fetches, blocking synchronous I/O "
            "in hot paths, missing pagination, and excessive allocations."
        ),
    },
    {
        "name": "Architecture & Design",
        "focus": (
            "Assess module boundaries, coupling, circular dependencies, duplicated logic "
            "that should reuse canonical helpers, leaky abstractions, and file size bloat."
        ),
    },
    {
        "name": "Readability & Simplicity",
        "focus": (
            "Check naming clarity, shallow nesting, dead code or unused shims, "
            "over-engineering, and unnecessary complexity that can be simplified."
        ),
    },
    {
        "name": "Testing & Observability",
        "focus": (
            "Verify failure-path test coverage, absence of brittle mocks or tautological "
            "assertions, meaningful diagnostics/logging, and clear error messages."
        ),
    },
]

AXIS_SCHEMA = {
    "type": "object",
    "properties": {
        "axis": {"type": "string"},
        "verdict": {"type": "string", "enum": ["APPROVE", "REQUEST_CHANGES"]},
        "findings": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "severity": {
                        "type": "string",
                        "enum": ["Critical", "Required", "Optional", "Nit"],
                    },
                    "file": {"type": "string"},
                    "line": {"type": "string"},
                    "summary": {"type": "string"},
                    "remedy": {"type": "string"},
                },
                "required": ["severity", "file", "summary", "remedy"],
            },
        },
    },
    "required": ["axis", "verdict", "findings"],
}


def _discover_git_files(ref: str) -> list[str]:
    """Discover changed or untracked files via git without crashing on fresh repos."""
    discovered: list[str] = []
    commands = [
        ["git", "diff", "--name-only", ref],
        ["git", "diff", "--name-only", "--cached"],
        ["git", "ls-files", "--others", "--exclude-standard"],
    ]
    for cmd in commands:
        proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
        if proc.returncode == 0:
            for line in proc.stdout.splitlines():
                cleaned = line.strip()
                if cleaned and cleaned not in discovered:
                    discovered.append(cleaned)
    return discovered


phase("Discover Review Scope")
target_files = [str(f).strip() for f in explicit_files if str(f).strip()]
if not target_files:
    target_files = _discover_git_files(base_ref)

if not target_files:
    discovered = await agent(
        prompt=(
            f"List the modified, staged, or newly added file paths in this workspace "
            f"(comparing against {base_ref} or working tree status). Return file paths only."
        ),
        schema={"type": "array", "items": {"type": "string"}},
        role="Discover changed files",
        model="inherit",
    )
    target_files = [str(f).strip() for f in (discovered or []) if str(f).strip()]

if not target_files:
    log("No changed files found to review.")
    print(json.dumps({"verdict": "APPROVE", "files": [], "axes": []}, indent=2))
else:
    log(f"Reviewing {len(target_files)} file(s): {', '.join(target_files)}")
    files_block = "\n".join(f"- {f}" for f in target_files)
    context_block = f"\n\nAdditional Context / Spec:\n{review_context}" if review_context else ""

    phase("Multi-Axis Parallel Review")
    axis_results = await parallel(
        AXES,
        lambda ax: agent(
            prompt=(
                f"Perform an adversarial review strictly focused on the axis: "
                f"**{ax['name']}**.\n\n"
                f"Axis Focus:\n{ax['focus']}\n\n"
                f"Target Files:\n{files_block}"
                f"{context_block}\n\n"
                f"Inspect the target files (and `git diff {base_ref}` if applicable). "
                f"Report only concrete, verified issues within this axis using severity "
                f"Critical, Required, Optional, or Nit, along with an actionable remedy."
            ),
            schema=AXIS_SCHEMA,
            role=f"Review: {ax['name']}",
            type_name="code-reviewer",
        ),
    )

    phase("Aggregate Verdict")
    blocking = []
    all_findings = []
    for res in axis_results:
        for finding in res.get("findings", []):
            entry = {"axis": res.get("axis"), **finding}
            all_findings.append(entry)
            if finding.get("severity") in ("Critical", "Required"):
                blocking.append(entry)

    overall_verdict = (
        "REQUEST_CHANGES"
        if blocking or any(r.get("verdict") == "REQUEST_CHANGES" for r in axis_results)
        else "APPROVE"
    )
    log(
        f"Review complete: verdict={overall_verdict}, "
        f"total_findings={len(all_findings)}, blocking={len(blocking)}"
    )
    print(
        json.dumps(
            {
                "verdict": overall_verdict,
                "files": target_files,
                "blocking_count": len(blocking),
                "total_findings": len(all_findings),
                "axes": axis_results,
            },
            indent=2,
        )
    )
