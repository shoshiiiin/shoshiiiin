// Which tools a repository uses, read from its manifests. Pure: takes file names
// and package.json text, returns tech ids. The arsenal scene names them.

/** package name -> tech id */
const PACKAGES = Object.freeze({
  typescript: 'typescript',
  react: 'react',
  next: 'next',
  astro: 'astro',
  vite: 'vite',
  tailwindcss: 'tailwind',
  gsap: 'gsap',
  three: 'three',
  '@react-three/fiber': 'r3f',
  '@supabase/supabase-js': 'supabase',
  '@supabase/ssr': 'supabase',
  wrangler: 'cloudflare',
  hono: 'cloudflare',
  pg: 'postgres',
  postgres: 'postgres',
  '@neondatabase/serverless': 'postgres',
  'drizzle-orm': 'postgres',
  '@playwright/test': 'playwright',
  playwright: 'playwright',
  '@anthropic-ai/sdk': 'claude',
  '@anthropic-ai/claude-agent-sdk': 'claude',
  '@modelcontextprotocol/sdk': 'claude',
  vitest: 'vitest',
  ai: 'aisdk',
  'livekit-client': 'livekit',
});

/** file name (or suffix) -> tech id */
const FILES = Object.freeze([
  [/^Package\.swift$|\.xcodeproj$/, 'swift'],
  [/^pubspec\.yaml$/, 'flutter'],
  [/\.uproject$/, 'unreal'],
  [/^project\.godot$/, 'godot'],
  [/^pyproject\.toml$|^requirements\.txt$/, 'python'],
  [/^wrangler\.(toml|jsonc?)$/, 'cloudflare'],
  [/^vercel\.json$|^\.vercel$/, 'vercel'],
  [/^astro\.config\.mjs$/, 'astro'],
  [/^package\.json$/, 'node'],
]);

/**
 * @param {Array<{name: string, text: string}>} files manifests found in one repo
 * @returns {string[]} unique tech ids
 */
export function detectStack(files) {
  const found = new Set();
  for (const { name, text } of files) {
    for (const [pattern, tech] of FILES) if (pattern.test(name)) found.add(tech);
    if (name !== 'package.json' || !text) continue;
    let pkg;
    try {
      pkg = JSON.parse(text);
    } catch {
      continue;
    }
    const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
    for (const dep of Object.keys(deps)) if (PACKAGES[dep]) found.add(PACKAGES[dep]);
  }
  return [...found].sort();
}
