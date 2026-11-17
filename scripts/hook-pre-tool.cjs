#!/usr/bin/env node

/**
 * Dev-Master PreToolUse Lifecycle Hook
 * Enforces workspace safety and Superpowers Work Isolation directives
 * by intercepting potentially destructive terminal commands, and checks
 * preflight prerequisites for MCP tools.
 */

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
    process.stdin.on('error', () => {
      resolve('');
    });
  });
}

const DESTRUCTIVE_PATTERNS = [
  { pattern: /\bgit\s+push\s+.*(-f|--force)\b/i, reason: 'Force-pushing may overwrite remote Git history.' },
  { pattern: /\bgit\s+reset\s+--hard\b/i, reason: 'Hard Git reset will discard all uncommitted changes.' },
  { pattern: /\bgit\s+clean\s+-[a-zA-Z]*f/i, reason: 'Force cleaning will permanently delete untracked files.' },
  { pattern: /\bgit\s+branch\s+-[a-zA-Z]*D\b/, reason: 'Force-deleting an unmerged Git branch may lose work.' },
  { pattern: /\brm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r)\s+[\/\\]/i, reason: 'Root directory deletion detected.' },
  { pattern: /\b(del|rmdir)\s+\/[a-zA-Z0-9_\/\\:\s]*[sS]/i, reason: 'Recursive system file deletion detected.' },
  { pattern: /\bRemove-Item\b.*-Recurse.*-Force/i, reason: 'Forced recursive item removal detected.' },
  { pattern: /\b(mkfs|format)\s+[a-zA-Z0-9_\/\\:]+/i, reason: 'Disk format command detected.' }
];

async function main() {
  try {
    const rawInput = await readStdin();
    if (!rawInput.trim()) {
      process.stdout.write(JSON.stringify({ decision: 'allow' }));
      process.exit(0);
    }

    const payload = JSON.parse(rawInput);
    const toolCall = payload.toolCall || {};
    const toolName = toolCall.name || '';
    const args = toolCall.args || {};

    // 1. Destructive Terminal Command Safety Gate
    if (toolName === 'run_command') {
      const commandLine = args.CommandLine || args.commandLine || args.command || '';
      if (typeof commandLine === 'string' && commandLine.trim()) {
        for (const item of DESTRUCTIVE_PATTERNS) {
          if (item.pattern.test(commandLine)) {
            const response = {
              decision: 'ask',
              reason: `Dev-Master Safety Gate: ${item.reason} Command: "${commandLine.slice(0, 100)}..."`
            };
            process.stdout.write(JSON.stringify(response));
            process.exit(0);
          }
        }
      }
    }

    // 2. Preflight Check for GitHub MCP Tools
    if (toolName === 'call_mcp_tool') {
      const serverName = args.ServerName || args.serverName || '';
      if (typeof serverName === 'string' && serverName.toLowerCase().includes('github')) {
        if (!process.env.GITHUB_TOKEN) {
          const response = {
            decision: 'ask',
            reason: 'Dev-Master MCP Guard: GITHUB_TOKEN environment variable is not configured. GitHub MCP server calls require a valid GITHUB_TOKEN to authenticate with the GitHub API.'
          };
          process.stdout.write(JSON.stringify(response));
          process.exit(0);
        }
      }
    }
  } catch (_err) {
    // Graceful fallback: hooks must not crash or block the agent loop unexpectedly
  }

  process.stdout.write(JSON.stringify({ decision: 'allow' }));
  process.exit(0);
}

main();
