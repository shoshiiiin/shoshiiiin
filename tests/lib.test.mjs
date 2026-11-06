import assert from 'node:assert/strict';
import { test } from 'node:test';
import { rng } from '../src/lib/rng.mjs';
import { detectStack } from '../src/lib/stack.mjs';
import { at, esc } from '../src/lib/svg.mjs';
import { createTypeset, splitCjk } from '../src/lib/type.mjs';
import { WEEKS, brightness, buildYear, monthMarks, summarize } from '../src/lib/year.mjs';

test('rng repeats the same sequence for the same seed', () => {
  const a = rng(42);
  const b = rng(42);
  const seqA = [a(), a(), a()];
  assert.deepEqual(seqA, [b(), b(), b()]);
  assert.ok(seqA.every((v) => v >= 0 && v < 1));
});

test('esc neutralises markup in text and attributes', () => {
  assert.equal(esc('<a href="x">&\'</a>'), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;');
});

test('at drops empty values and escapes the rest', () => {
  assert.equal(at({ a: 1, b: undefined, c: null, d: false, e: 'x"y' }), ' a="1" e="x&quot;y"');
});

test('buildYear ends on the given day in the last column, Monday first', () => {
  const cells = buildYear({ '2026-11-05': 4 }, '2026-11-05'); // a Thursday
  assert.equal(cells.length, WEEKS * 7);
  const last = cells.filter((c) => !c.future).at(-1);
  assert.equal(last.date, '2026-11-05');
  assert.equal(last.week, WEEKS - 1);
  assert.equal(last.day, 3);
  assert.equal(last.count, 4);
  assert.equal(cells[0].day, 0);
  assert.equal(new Date(`${cells[0].date}T00:00:00Z`).getUTCDay(), 1);
  assert.equal(cells.filter((c) => c.future).length, 3);
});

test('buildYear ignores negative or fractional counts', () => {
  const cells = buildYear({ '2026-11-04': -3, '2026-11-05': 2.7 }, '2026-11-05');
  const byDate = Object.fromEntries(cells.map((c) => [c.date, c.count]));
  assert.equal(byDate['2026-11-04'], 0);
  assert.equal(byDate['2026-11-05'], 2);
});

test('brightness is zero for empty days and grows with commits', () => {
  assert.equal(brightness(0, 100), 0);
  assert.ok(brightness(1, 100) > 0.28 - 1e-9);
  assert.ok(brightness(10, 100) < brightness(50, 100));
  assert.equal(brightness(100, 100), 1);
});

test('summarize finds streaks and totals; an empty today keeps the streak', () => {
  const counts = { '2026-11-01': 1, '2026-11-02': 2, '2026-11-03': 3, '2026-10-20': 9 };
  const s = summarize(buildYear(counts, '2026-11-04'));
  assert.equal(s.total, 15);
  assert.equal(s.max, 9);
  assert.equal(s.lit, 4);
  assert.equal(s.longest, 3);
  assert.equal(s.current, 3);
});

test('monthMarks gives each new month once and skips the first column', () => {
  const marks = monthMarks(buildYear({}, '2026-11-05'));
  const months = marks.map((m) => m.month);
  assert.equal(new Set(months).size, months.length);
  assert.ok(marks.every((m) => m.week > 0));
  assert.equal(marks.length, 12);
});

test('detectStack reads dependencies and marker files, survives bad JSON', () => {
  const found = detectStack([
    { name: 'package.json', text: JSON.stringify({ dependencies: { react: '1', three: '1' }, devDependencies: { '@playwright/test': '1' } }) },
    { name: 'wrangler.toml', text: '' },
    { name: 'Thing.xcodeproj', text: '' },
  ]);
  assert.deepEqual(found, ['cloudflare', 'node', 'playwright', 'react', 'swift', 'three']);
  assert.deepEqual(detectStack([{ name: 'package.json', text: '{broken' }]), ['node']);
});

test('typeset registers glyphs per face and routes Japanese to the kanji face', () => {
  const ts = createTypeset();
  const out = ts.text('mono', 'ITACHI · 月読', { x: 1 });
  assert.match(out, /<tspan font-family="LF-K,serif">月読<\/tspan>/);
  const needs = Object.fromEntries(ts.needs().map((n) => [n.face, n.chars]));
  assert.ok(!needs.mono.includes('月'));
  assert.equal(needs.kanji, [...'月読'].sort().join(''));
  assert.throws(() => ts.text('nope', 'x'), /Unknown face/);
});

test('splitCjk keeps runs together', () => {
  assert.deepEqual(splitCjk('A月読 B'), [
    { cjk: false, run: 'A' },
    { cjk: true, run: '月読' },
    { cjk: false, run: ' B' },
  ]);
});
