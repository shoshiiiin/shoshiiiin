// The eye patterns and the lightning generator: deterministic, well-formed, in bounds.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ribbon, rimArc, strike, strikes, zigzag } from '../src/lib/lightning.mjs';
import { rng } from '../src/lib/rng.mjs';
import { itachiMangekyo, sasukeMangekyo } from '../src/lib/shapes.mjs';

test('Itachi’s Mangekyō has three blades, a rim ring and a pupil', () => {
  const itachi = itachiMangekyo(80, '#000');
  assert.equal((itachi.match(/<path /g) ?? []).length, 3);
  assert.equal((itachi.match(/<circle /g) ?? []).length, 2);
  assert.doesNotMatch(itachi, /NaN|undefined/);
});

test('Sasuke’s Mangekyō is three crossing ellipses on a black iris, outlined on top', () => {
  const sasuke = sasukeMangekyo(80, 'ems');
  assert.equal((sasuke.match(/<ellipse /g) ?? []).length, 6, 'three filled, three outlined');
  assert.match(sasuke, /<radialGradient id="ems"[^>]*gradientUnits="userSpaceOnUse"/);
  assert.match(sasuke, /fill="url\(#ems\)"/);
  assert.doesNotMatch(sasuke, /NaN|undefined/);
});

test('zigzag keeps its ends and doubles its segments per level', () => {
  const pts = zigzag(rng(1), [0, 0], [100, 0], { levels: 4 });
  assert.equal(pts.length, 2 ** 4 + 1);
  assert.deepEqual(pts[0], [0, 0]);
  assert.deepEqual(pts.at(-1), [100, 0]);
  assert.ok(pts.some(([, y]) => Math.abs(y) > 1), 'the line is jagged, not straight');
  assert.deepEqual(zigzag(rng(1), [0, 0], [100, 0], { levels: 4 }), pts);
});

test('a strike forks from points on its main channel', () => {
  const { main, forks } = strike(rng(3), [0, 0], [200, 0], { forks: 3 });
  assert.equal(forks.length, 3);
  const onMain = (p) => main.some((q) => q[0] === p[0] && q[1] === p[1]);
  assert.ok(forks.every((fork) => onMain(fork[0])));
});

test('a strike can be held inside a band', () => {
  const { main, forks } = strike(rng(5), [0, 50], [400, 50], { roughness: 0.3, clampY: [10, 90] });
  assert.ok([...main, ...forks.flat()].every(([, y]) => y >= 10 && y <= 90));
});

test('rim arcs hug their circle', () => {
  const { main } = rimArc(rng(9), 50, 0, 90, { jag: 4 });
  assert.ok(main.every(([x, y]) => Math.abs(Math.hypot(x, y) - 50) <= 4.01));
});

test('a ribbon tapers from its start to its tip', () => {
  const d = ribbon([[0, 0], [50, 0], [100, 0]], 4, 0);
  assert.equal(d, 'M0 2L50 1L100 0L100 0L50 -1L0 -2Z');
});

test('strikes show only the first variant in the still frame, with unique ids', () => {
  const variants = [0, 1, 2].map((k) => [strike(rng(k), [0, 0], [60, 0]), strike(rng(k + 9), [0, 0], [0, 60])]);
  const out = strikes(variants, { id: 'x', color: '#7fd6ff', core: '#fff', r: rng(2) });
  const ids = out.match(/id="[^"]+"/g) ?? [];
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ids.length, 6);
  assert.equal((out.match(/class="bolt"/g) ?? []).length, 3);
  assert.equal((out.match(/class="bolt"[^>]*opacity="0"/g) ?? []).length, 2);
  assert.match(out, /Z" fill="#7fd6ff"/, 'channels are filled ribbons');
  assert.doesNotMatch(out, /NaN|undefined/);
});
