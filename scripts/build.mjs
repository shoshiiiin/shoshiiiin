// Renders every scene to assets/*.svg with exactly the glyphs each one uses.
//   node scripts/build.mjs            all scenes
//   node scripts/build.mjs hero eye   only these

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { FONT_SLOT } from '../src/lib/svg.mjs';
import { createTypeset, fontFaceCss } from '../src/lib/type.mjs';
import { buildYear, summarize } from '../src/lib/year.mjs';
import { SCENES } from '../src/scenes/index.mjs';
import { subset } from './fontcache.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

/** Generated figures prepared by scripts/prepare-art.py, with anchors from art/anchors.json. */
function loadArt() {
  const anchors = existsSync(join(ROOT, 'art/anchors.json')) ? readJson('art/anchors.json') : {};
  const art = {};
  for (const name of ['itachi', 'sasuke', 'team7', 'itachi-susanoo', 'sasuke-susanoo']) {
    const webp = join(ROOT, 'src/art', `${name}.webp`);
    if (!existsSync(webp)) continue;
    const { w, h, outline } = readJson(`src/art/${name}.json`);
    art[name] = { uri: `data:image/webp;base64,${readFileSync(webp).toString('base64')}`, w, h, outline, anchors: anchors[name] ?? {} };
  }
  return art;
}

function loadData() {
  const raw = readJson('data/days.json');
  const cells = buildYear(raw.days, raw.until);
  return {
    ...summarize(cells),
    cells,
    until: raw.until,
    repos: raw.repos,
    stack: readJson('data/stack.json'),
    profile: readJson('data/profile.json'),
    art: loadArt(),
  };
}

const wanted = process.argv.slice(2);
const data = loadData();
const unknown = wanted.filter((name) => !SCENES[name]);
if (unknown.length) throw new Error(`Unknown scene(s): ${unknown.join(', ')}. Known: ${Object.keys(SCENES).join(', ')}`);

for (const [name, render] of Object.entries(SCENES)) {
  if (wanted.length && !wanted.includes(name)) continue;
  const ts = createTypeset();
  const svg = render(data, ts);
  const files = ts.needs().map(({ face, chars }) => ({ face, base64: subset(join(ROOT, 'src/fonts'), face, chars) }));
  const out = svg.replace(FONT_SLOT, fontFaceCss(files));
  writeFileSync(join(ROOT, 'assets', `${name}.svg`), out);
  console.log(`${name.padEnd(10)} ${(Buffer.byteLength(out) / 1024).toFixed(1)} KB`);
}
