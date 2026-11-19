#!/usr/bin/env node

/**
 * Dev-Master PreToolUse Lifecycle Hook
 * Enforces workspace safety and Superpowers Work Isolation directives
 * by intercepting potentially destructive terminal commands, and checks
 * preflight prerequisites for MCP tools.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

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
  { pattern: /\b(mkfs|format)\s+[a-zA-Z0-9_\/\\:]+/i, reason: 'Disk format command detected.' },
  { pattern: /\bgh\s+repo\s+delete\b/i, reason: 'Permanently deleting a GitHub repository cannot be undone.' },
  { pattern: /\bgh\s+repo\s+edit\b.*--visibility(?:=|\s+)public\b/i, reason: 'Changing a private GitHub repository visibility to public may expose private code.' },
  { pattern: /\bgh\s+repo\s+archive\b/i, reason: 'Archiving a GitHub repository makes it read-only.' },
  { pattern: /\bgh\s+release\s+delete\b/i, reason: 'Deleting a GitHub release may break published artifacts.' },
  { pattern: /\bgh\s+pr\s+merge\b/i, reason: 'Merging a pull request alters remote branch history.' },
  { pattern: /\bgh\s+issue\s+delete\b/i, reason: 'Permanently deleting a GitHub issue cannot be undone.' },
  { pattern: /\bgh\s+(secret|variable)\s+delete\b/i, reason: 'Deleting a GitHub Actions secret or variable may break workflows.' }
];

function hasValidTokenValue(val) {
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  return trimmed.length > 0 && !/^\$\{[^}]+\}$/.test(trimmed);
}

function hasGithubTokenConfigured(serverName) {
  if (hasValidTokenValue(process.env.GITHUB_TOKEN)) {
    return true;
  }
  try {
    const configPath = path.join(os.homedir(), '.gemini', 'config', 'mcp_config.json');
    if (!fs.existsSync(configPath)) return false;
    const parsed = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const servers = parsed && parsed.mcpServers && typeof parsed.mcpServers === 'object' ? parsed.mcpServers : {};
    const matchedKey = Object.prototype.hasOwnProperty.call(servers, serverName)
      ? serverName
      : Object.keys(servers).find((k) => k.toLowerCase() === serverName.toLowerCase());
    const env = matchedKey && servers[matchedKey] && servers[matchedKey].env;
    if (!env || typeof env !== 'object') return false;
    return hasValidTokenValue(env.GITHUB_TOKEN) || hasValidTokenValue(env.GITHUB_PERSONAL_ACCESS_TOKEN);
  } catch (_err) {
    return false;
  }
}

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
        if (!hasGithubTokenConfigured(serverName)) {
          const response = {
            decision: 'ask',
            reason: 'Dev-Master MCP Guard: GITHUB_TOKEN is not configured in the environment or ~/.gemini/config/mcp_config.json. GitHub MCP server calls require a valid token to authenticate with the GitHub API.'
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
