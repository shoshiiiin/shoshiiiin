// Reads the last year of your own commits from local git repositories and keeps
// only what the page shows: commits per day and which tools the repos use.
// No repository names, paths, messages or e-mail addresses leave this script.
//
//   AUTHORS="you@example.com,work@example.com" node scripts/collect-local.mjs [root]
//
// Without AUTHORS it uses `git config user.email`.

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { detectStack } from '../src/lib/stack.mjs';

const root = resolve(process.argv[2] ?? join(homedir(), 'Developer'));
const MAX_DEPTH = 3;
const SKIP = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'target', '.turbo', 'Pods', 'DerivedData']);

function git(dir, args) {
  try {
    return execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  } catch {
    return '';
  }
}

function authors() {
  const fromEnv = (process.env.AUTHORS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  if (fromEnv.length) return fromEnv;
  const own = git(process.cwd(), ['config', 'user.email']).trim();
  if (!own) throw new Error('No author: set AUTHORS or git config user.email');
  return [own];
}

/** Git repositories up to MAX_DEPTH below root. */
function findRepos(dir, depth = 0, out = []) {
  if (depth > MAX_DEPTH) return out;
  if (existsSync(join(dir, '.git'))) out.push(dir);
  let entries = [];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (!e.isDirectory() || SKIP.has(e.name) || e.name.startsWith('_')) continue;
    findRepos(join(dir, e.name), depth + 1, out);
  }
  return out;
}

/** Files a stack detector may look at: repo root plus one level of sub-packages. */
function manifestFiles(repo) {
  const files = [];
  const visit = (dir, depth) => {
    let entries = [];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        if (depth < 2 && !SKIP.has(e.name) && !e.name.startsWith('.')) visit(p, depth + 1);
        if (e.name.endsWith('.xcodeproj') || e.name === '.vercel') files.push({ name: e.name, text: '' });
        continue;
      }
      const isManifest = e.name === 'package.json' || /\.(uproject)$/.test(e.name) ||
        ['Package.swift', 'pubspec.yaml', 'project.godot', 'pyproject.toml', 'requirements.txt',
          'wrangler.toml', 'wrangler.jsonc', 'wrangler.json', 'vercel.json', 'astro.config.mjs'].includes(e.name);
      if (!isManifest) continue;
      const big = statSync(p).size > 512 * 1024;
      files.push({ name: e.name, text: e.name === 'package.json' && !big ? readFileSync(p, 'utf8') : '' });
    }
  };
  visit(repo, 0);
  return files;
}

/** Local calendar date, matching git's --date=short (author-local). */
const localDate = (ms) => {
  const d = new Date(ms);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};
const since = localDate(Date.now() - 371 * 86_400_000);
const until = localDate(Date.now());
// -F: author addresses are plain strings, not patterns.
const who = ['-F', ...authors().flatMap((a) => ['--author', a])];

const seen = new Set();
const roots = new Set();
const days = {};
const stack = {};
let repos = 0;

for (const repo of findRepos(root)) {
  const lines = git(repo, ['log', '--all', `--since=${since}`, '--format=%H %ad', '--date=short', ...who])
    .split('\n')
    .filter(Boolean);
  if (!lines.length) continue; // not mine, or quiet this year
  // The same history cloned twice counts once (same root commit), for repos and tools alike.
  const firstRoot = git(repo, ['rev-list', '--max-parents=0', '--all']).split('\n').filter(Boolean).sort()[0];
  const isCopy = Boolean(firstRoot) && roots.has(firstRoot);
  if (firstRoot) roots.add(firstRoot);
  if (!isCopy) {
    repos++;
    for (const tech of detectStack(manifestFiles(repo))) stack[tech] = (stack[tech] ?? 0) + 1;
  }
  for (const line of lines) {
    const [hash, date] = line.split(' ');
    if (seen.has(hash)) continue;
    seen.add(hash);
    days[date] = (days[date] ?? 0) + 1;
  }
}

const sorted = Object.fromEntries(Object.entries(days).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync('data/days.json', `${JSON.stringify({ until, repos, days: sorted }, null, 1)}\n`);
writeFileSync('data/stack.json', `${JSON.stringify(stack, null, 1)}\n`);
console.log(`days: ${Object.keys(sorted).length}, commits: ${seen.size}, repos: ${repos}, stack: ${Object.keys(stack).length}`);
