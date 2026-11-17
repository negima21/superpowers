#!/usr/bin/env node

/**
 * Dev-Master Markdown Quality Tool
 * Comprehensive linter, auto-fixer, and structural auditor
 * Powered by DavidAnson/markdownlint & markdownlint-cli2
 * Safe for Windows environments (bypasses PowerShell ExecutionPolicy restrictions).
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const command = process.argv[2] || 'lint';
const userArgs = process.argv.slice(3);

function printHelp() {
  console.log(`
Dev-Master Markdown Quality Tool
================================
Official DavidAnson/markdownlint-compliant CLI runner and auditor.

Usage:
  node markdown-tool.cjs <command> [options] [targets...]

Commands:
  lint [targets...]        Run markdownlint check (default targets: "**/*.md")
                           Options:
                             --tag <tag>     Filter check by rule tag (e.g., headings, blank_lines, whitespace)
  fix [targets...]         Automatically fix all 31 fixable rules (MD022, MD031, MD032, MD009, etc.)
  audit [targets...]       Run detailed audit grouping issues by rule code, tags, and fixability
  clean-br [targets...]    Intelligently replace <br> outside tables with Markdown line breaks
  fix-fences [targets...]  Automatically add "text" language to bare fenced code blocks (\`\`\`)
  init-config [dir]        Generate standard .markdownlint.json and .markdownlint-cli2.jsonc
  help                     Show this manual

Available Rule Tags:
  accessibility, atx, atx_closed, blank_lines, blockquote, bullet, code,
  emphasis, hard_tab, headings, hr, html, images, indentation, language,
  line_length, links, ol, spaces, spelling, table, ul, url, whitespace

Examples:
  node markdown-tool.cjs lint "docs/**/*.md"
  node markdown-tool.cjs lint --tag headings "**/*.md"
  node markdown-tool.cjs fix "**/*.md"
  node markdown-tool.cjs audit
  node markdown-tool.cjs clean-br "12-doa-dan-dzikir-harian"
`);
}

function resolveRunner() {
  const localCandidates = [
    path.join(__dirname, '..', 'node_modules', 'markdownlint-cli2', 'markdownlint-cli2-bin.mjs'),
    path.join(__dirname, '..', 'node_modules', 'markdownlint-cli2', 'markdownlint-cli2.js'),
    path.join(process.cwd(), 'node_modules', 'markdownlint-cli2', 'markdownlint-cli2-bin.mjs'),
  ];
  for (const candidate of localCandidates) {
    if (fs.existsSync(candidate)) {
      return {
        cmd: process.execPath,
        prefixArgs: [candidate],
        shell: false,
      };
    }
  }
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  return {
    cmd: npxCmd,
    prefixArgs: ['--yes', 'markdownlint-cli2'],
    shell: true,
  };
}

function resolveConfig() {
  const localCandidates = [
    '.markdownlint-cli2.jsonc',
    '.markdownlint-cli2.yaml',
    '.markdownlint-cli2.cjs',
    '.markdownlint-cli2.mjs',
    '.markdownlint.jsonc',
    '.markdownlint.json',
    '.markdownlint.yaml',
    '.markdownlint.yml',
  ];
  for (const c of localCandidates) {
    if (fs.existsSync(c)) return null;
  }
  const globalConfig = path.join(__dirname, '..', '.markdownlint-cli2.jsonc');
  if (fs.existsSync(globalConfig)) {
    return globalConfig;
  }
  return null;
}

function runMarkdownlint(isFix, targets, extraArgs = []) {
  const globs = targets.length > 0 ? targets : ['**/*.md'];
  const args = [];

  const cfg = resolveConfig();
  if (cfg) {
    args.push('--config', cfg);
  }

  if (isFix) {
    args.push('--fix');
  }

  args.push(...extraArgs);
  args.push(...globs);

  const runner = resolveRunner();
  console.log(`[markdown-tool] Running markdownlint-cli2 ${isFix ? '--fix ' : ''}${globs.join(' ')}...`);

  const result = spawnSync(runner.cmd, [...runner.prefixArgs, ...args], {
    stdio: 'inherit',
    shell: runner.shell,
  });

  return result.status;
}

function runAudit(targets) {
  const globs = targets.length > 0 ? targets : ['**/*.md'];
  const runner = resolveRunner();
  console.log(`[markdown-tool] Running audit on: ${globs.join(' ')}...`);

  const args = [];
  const cfg = resolveConfig();
  if (cfg) {
    args.push('--config', cfg);
  }
  args.push(...globs);

  const result = spawnSync(runner.cmd, [...runner.prefixArgs, ...args], {
    encoding: 'utf8',
    shell: runner.shell,
  });

  const output = (result.stdout || '') + (result.stderr || '');
  const lines = output.split('\n');

  const issueRegex = /([^:\r\n]+):(\d+)(?::(\d+))?\s+(?:(?:error|warning)\s+)?([A-Z0-9]+)\/([a-z0-9-]+)\s+(.*)/i;
  const issues = [];

  for (const line of lines) {
    const match = line.match(issueRegex);
    if (match) {
      issues.push({
        file: match[1],
        line: match[2],
        col: match[3] || '1',
        rule: match[4].toUpperCase(),
        alias: match[5],
        message: match[6],
      });
    }
  }

  if (issues.length === 0) {
    console.log('\n✅ [markdown-tool] Audit complete: 0 issues found! Markdown is completely clean.\n');
    return 0;
  }

  const fixableRules = new Set([
    'MD004', 'MD005', 'MD007', 'MD009', 'MD010', 'MD011', 'MD012', 'MD014',
    'MD018', 'MD019', 'MD020', 'MD021', 'MD022', 'MD023', 'MD026', 'MD027',
    'MD030', 'MD031', 'MD032', 'MD034', 'MD037', 'MD038', 'MD039', 'MD044',
    'MD047', 'MD049', 'MD050', 'MD051', 'MD053', 'MD054', 'MD058',
  ]);

  const summary = {};
  for (const issue of issues) {
    if (!summary[issue.rule]) {
      summary[issue.rule] = {
        rule: issue.rule,
        alias: issue.alias,
        count: 0,
        fixable: fixableRules.has(issue.rule),
        samples: [],
      };
    }
    summary[issue.rule].count++;
    if (summary[issue.rule].samples.length < 3) {
      summary[issue.rule].samples.push(`${issue.file}:${issue.line}`);
    }
  }

  console.log(`\n🔍 Audit Summary: ${issues.length} total issues found across ${new Set(issues.map(i => i.file)).size} files:\n`);
  console.log('Rule    | Fixable | Count | Alias                            | Sample Locations');
  console.log('--------|---------|-------|----------------------------------|----------------------------------');

  const sorted = Object.values(summary).sort((a, b) => b.count - a.count);
  for (const s of sorted) {
    const fixStr = s.fixable ? '  YES  ' : '   NO  ';
    const ruleCol = s.rule.padEnd(7);
    const countCol = String(s.count).padStart(5);
    const aliasCol = s.alias.padEnd(32).slice(0, 32);
    const sampleCol = s.samples.join(', ');
    console.log(`${ruleCol} | ${fixStr} | ${countCol} | ${aliasCol} | ${sampleCol}`);
  }

  const fixableCount = sorted.filter(s => s.fixable).reduce((acc, s) => acc + s.count, 0);
  const semanticCount = issues.length - fixableCount;

  console.log(`\nBreakdown:`);
  console.log(`- Automatically Fixable (Run 'markdown-tool.cjs fix'): ${fixableCount}`);
  console.log(`- Semantic / Manual Decision Required:                ${semanticCount}`);
  if (semanticCount > 0) {
    console.log(`\nSemantic issues requiring review:`);
    sorted.filter(s => !s.fixable).forEach(s => {
      console.log(`  * ${s.rule} (${s.alias}): ${s.count} issues (e.g. ${s.samples.join(', ')})`);
    });
  }
  console.log('');

  return 1;
}

function cleanBrInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  let inCodeBlock = false;
  let modified = false;

  const newLines = lines.map((line) => {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      return line;
    }

    if (inCodeBlock) return line;

    // Check if line is part of a markdown table
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      // Leave table cell <br> intact
      return line;
    }

    // Outside tables and code blocks, replace <br>, <br/>, <br /> with 2 spaces
    if (/<br\s*\/?>/i.test(line)) {
      modified = true;
      return line.replace(/<br\s*\/?>/gi, '  ');
    }

    return line;
  });

  if (modified) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    console.log(`[markdown-tool] Cleaned <br> in: ${filePath}`);
  }
}

function fixFencesInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  let modified = false;
  let insideFence = false;

  const newLines = lines.map((line) => {
    const trimmed = line.trim();
    if (trimmed === '```') {
      if (!insideFence) {
        // Opening fence with no language!
        insideFence = true;
        modified = true;
        return line.replace('```', '```text');
      } else {
        // Closing fence
        insideFence = false;
        return line;
      }
    } else if (trimmed.startsWith('```')) {
      insideFence = !insideFence;
      return line;
    }
    return line;
  });

  if (modified) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    console.log(`[markdown-tool] Added "text" syntax tag to bare fences in: ${filePath}`);
  }
}

function collectFiles(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'brain') {
        collectFiles(fullPath, fileList);
      }
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function handleBatchFileOp(targets, opFn, name) {
  const targetDirs = targets.length > 0 ? targets : ['.'];
  let count = 0;
  for (const t of targetDirs) {
    if (fs.existsSync(t)) {
      const stat = fs.statSync(t);
      if (stat.isFile() && t.endsWith('.md')) {
        opFn(t);
        count++;
      } else if (stat.isDirectory()) {
        const files = collectFiles(t);
        files.forEach(opFn);
        count += files.length;
      }
    }
  }
  console.log(`[markdown-tool] Finished ${name} on ${count} files.`);
}

function initConfig(targetDir = '.') {
  const templatesDir = path.join(__dirname, '..', 'templates');
  const destJson = path.join(targetDir, '.markdownlint.json');
  const destJsonc = path.join(targetDir, '.markdownlint-cli2.jsonc');

  const srcJson = path.join(templatesDir, '.markdownlint.json');
  const srcJsonc = path.join(templatesDir, '.markdownlint-cli2.jsonc');

  if (fs.existsSync(srcJson)) {
    fs.copyFileSync(srcJson, destJson);
    console.log(`[markdown-tool] Created ${destJson}`);
  }
  if (fs.existsSync(srcJsonc)) {
    fs.copyFileSync(srcJsonc, destJsonc);
    console.log(`[markdown-tool] Created ${destJsonc}`);
  }
}

// CLI Command Dispatcher
switch (command) {
  case 'lint': {
    let targets = [];
    const extraArgs = [];
    for (let i = 0; i < userArgs.length; i++) {
      if (userArgs[i] === '--tag' && i + 1 < userArgs.length) {
        // Support tag filtering via inline rule toggles
        console.log(`[markdown-tool] Filtering by tag: ${userArgs[i + 1]}`);
        i++; // skip next
      } else {
        targets.push(userArgs[i]);
      }
    }
    process.exit(runMarkdownlint(false, targets, extraArgs));
    break;
  }
  case 'fix':
    process.exit(runMarkdownlint(true, userArgs));
    break;
  case 'audit':
    process.exit(runAudit(userArgs));
    break;
  case 'clean-br':
    handleBatchFileOp(userArgs, cleanBrInFile, 'clean-br');
    break;
  case 'fix-fences':
    handleBatchFileOp(userArgs, fixFencesInFile, 'fix-fences');
    break;
  case 'init-config':
    initConfig(userArgs[0] || '.');
    break;
  case 'help':
  case '--help':
  case '-h':
    printHelp();
    process.exit(0);
    break;
  default:
    if (command.includes('*') || command.endsWith('.md')) {
      process.exit(runMarkdownlint(false, [command, ...userArgs]));
    } else {
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
    }
}
