// Every scene renders from fixture data into a sound SVG: titled, still under reduced
// motion, no NaN or undefined leaking into coordinates, well-formed XML.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { FONT_SLOT } from '../src/lib/svg.mjs';
import { createTypeset } from '../src/lib/type.mjs';
import { buildYear, summarize } from '../src/lib/year.mjs';
import { SCENES } from '../src/scenes/index.mjs';

function fixture() {
  const days = {};
  for (let i = 0; i < 60; i++) days[`2026-0${1 + (i % 9)}-${String(1 + (i % 27)).padStart(2, '0')}`] = (i * 7) % 40;
  const cells = buildYear(days, '2026-11-05');
  return {
    ...summarize(cells),
    cells,
    until: '2026-11-05',
    repos: 12,
    stack: { typescript: 9, react: 4, three: 2, node: 11 },
    profile: { handle: 'someone', name: 'Someone' },
  };
}

const hasXmllint = spawnSync('xmllint', ['--version']).status === 0;

for (const [name, render] of Object.entries(SCENES)) {
  test(`scene ${name} renders a sound SVG`, () => {
    const ts = createTypeset();
    const svg = render(fixture(), ts).replace(FONT_SLOT, '');
    assert.match(svg, /^<svg [^>]*role="img"/);
    assert.match(svg, /<title id="t">[^<]+<\/title>/);
    assert.match(svg, /<desc id="d">[^<]+<\/desc>/);
    assert.match(svg, /@media \(prefers-reduced-motion:reduce\)\{\*\{animation:none!important\}\}/);
    assert.doesNotMatch(svg, /NaN|undefined|Infinity/);
    if (hasXmllint) {
      const lint = spawnSync('xmllint', ['--noout', '-'], { input: svg });
      assert.equal(lint.status, 0, lint.stderr.toString());
    }
  });
}

test('generated figures replace the silhouettes and follow their anchors', () => {
  const uri = 'data:image/webp;base64,UklGRg==';
  const art = {
    itachi: { uri, w: 400, h: 800, anchors: { eyes: [[0.45, 0.1], [0.55, 0.1]] } },
    sasuke: { uri, w: 500, h: 800, anchors: { eyes: [[0.3, 0.1]], hand: [0.1, 0.5] } },
    team7: { uri, w: 900, h: 600, anchors: {} },
  };
  const data = { ...fixture(), art };
  const hero = SCENES.hero(data, createTypeset());
  assert.equal((hero.match(/<image /g) ?? []).length, 2);
  assert.doesNotMatch(hero, /NaN|undefined/);
  const dawn = SCENES.dawn(data, createTypeset());
  assert.equal((dawn.match(/<image /g) ?? []).length, 1);
  // The Susanoo float as holograms with their traced outline.
  const outline = [[0.5, 0.1], [0.2, 0.5], [0.8, 0.5], [0.5, 0.9]];
  const withSusanoo = { ...data, art: { ...art, 'itachi-susanoo': { uri, w: 600, h: 900, outline, anchors: {} }, 'sasuke-susanoo': { uri, w: 600, h: 900, outline, anchors: {} } } };
  const holo = SCENES.hero(withSusanoo, createTypeset());
  assert.equal((holo.match(/<image /g) ?? []).length, 4);
  assert.equal((holo.match(/class="holo"/g) ?? []).length, 2);
  assert.ok((holo.match(/class="trace"/g) ?? []).length >= 8);
  // The light rim lives apart from the fading image, a pulse runs round it, a scan line sweeps the frame.
  assert.equal((holo.match(/class="rim"/g) ?? []).length, 2);
  assert.equal((holo.match(/class="manifest"/g) ?? []).length, 2);
  assert.ok((holo.match(/class="run"/g) ?? []).length >= 4);
  assert.equal((holo.match(/class="sweep"/g) ?? []).length, 2);
  assert.doesNotMatch(holo, /class="manifest"[^>]*>(?:(?!<\/g>).)*class="rim"/s);
  assert.doesNotMatch(holo, /NaN|undefined/);
  // Each Susanoo's face stands right above its brother's head (fixture faces default to the middle).
  const images = [...holo.matchAll(/<image href="[^"]*" x="([-\d.]+)" y="[-\d.]+" width="([-\d.]+)"/g)].map((m) => [Number(m[1]), Number(m[2])]);
  const [susI, susS, figI, figS] = images;
  const centre = ([x, w], frac = 0.5) => x + w * frac;
  assert.ok(Math.abs(centre(susI) - centre(figI, 0.5)) < 0.5, 'Itachi stands centred under his Susanoo');
  assert.ok(Math.abs(centre(susS) - centre(figS, 0.3)) < 0.5, 'Sasuke stands centred under his Susanoo');
  // Without anchors the brothers still get a thread and Chidori.
  const bare = { ...fixture(), art: { itachi: { ...art.itachi, anchors: {} }, sasuke: { ...art.sasuke, anchors: {} } } };
  assert.doesNotMatch(SCENES.hero(bare, createTypeset()), /NaN|undefined/);
});

test('the same data always draws the same picture', () => {
  const a = SCENES.hero(fixture(), createTypeset());
  const b = SCENES.hero(fixture(), createTypeset());
  assert.equal(a, b);
});
