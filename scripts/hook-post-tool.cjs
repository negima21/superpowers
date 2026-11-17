#!/usr/bin/env node

/**
 * Dev-Master PostToolUse Lifecycle Hook
 * Automatically runs markdown auto-fixer whenever write_file or edit_file
 * operates on a Markdown (.md) file.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
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

async function main() {
  try {
    const rawInput = await readStdin();
    if (!rawInput.trim()) {
      process.stdout.write('{}');
      process.exit(0);
    }

    const payload = JSON.parse(rawInput);
    const toolCall = payload.toolCall || {};
    const args = toolCall.args || {};
    const targetFile = args.Path || args.path;

    if (typeof targetFile === 'string' && targetFile.toLowerCase().endsWith('.md')) {
      if (fs.existsSync(targetFile)) {
        const toolScript = path.join(__dirname, 'markdown-tool.cjs');
        spawnSync(process.execPath, [toolScript, 'fix', targetFile], {
          stdio: 'ignore',
          shell: false,
        });
      }
    }
  } catch (_err) {
    // Graceful fallback: hooks must not crash the agent loop
  }

  // Contract: PostToolUse must output an empty JSON object
  process.stdout.write('{}');
  process.exit(0);
}

main();
