// 初心, shoshin: beginner's mind. The word writes itself in light, stroke by stroke
// in calligraphic order. Lichtfeld rule 1 allows exactly one decoration, the word in
// flight, and the page says so.

import { sceneFrame } from '../lib/frame.mjs';
import { SHIN, SHO, glyphPoints } from '../lib/glyph.mjs';
import { C } from '../lib/palette.mjs';
import { between, rng } from '../lib/rng.mjs';
import { glowGradient } from '../lib/shapes.mjs';
import { at, doc, f, style } from '../lib/svg.mjs';

const W = 1280;
const H = 560;
const SCALE = 1.5;
const GLYPHS = [
  { strokes: SHO, x: 64, y: 118 },
  { strokes: SHIN, x: 352, y: 118 },
];
const STROKE_TIME = 0.42;

const CSS = `
.write{animation:write 1.3s cubic-bezier(.2,.7,.2,1) var(--d) both}
@keyframes write{from{opacity:0;transform:translate(var(--dx),var(--dy))}}
.twinkle{animation:twinkle var(--t) ease-in-out var(--w) infinite}
@keyframes twinkle{50%{opacity:.35}}
.breath{animation:breath 6s ease-in-out infinite}
@keyframes breath{50%{opacity:.6}}
.fade{animation:fade 1.6s ease-out var(--d) both}
@keyframes fade{from{opacity:0;transform:translateY(10px)}}
.scan{animation:scan 7s cubic-bezier(.6,0,.4,1) 4s infinite}
@keyframes scan{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}
`;

function light(r0) {
  let strokeBase = 0;
  let dots = '';
  let count = 0;
  for (const g of GLYPHS) {
    const pts = glyphPoints(r0, g.strokes, { firstStroke: strokeBase, spacing: 3.6, width: 15, across: 3 });
    strokeBase += g.strokes.length;
    for (const p of pts) {
      const x = g.x + p.x * SCALE;
      const y = g.y + p.y * SCALE;
      const a = between(r0, 0, Math.PI * 2);
      const dist = between(r0, 40, 220);
      const hot = r0() < 0.22;
      const vars = {
        '--dx': `${f(Math.cos(a) * dist)}px`,
        '--dy': `${f(Math.sin(a) * dist)}px`,
        '--d': `${f(0.3 + p.stroke * STROKE_TIME + p.t * STROKE_TIME * 0.9)}s`,
      };
      const twinkle = r0() < 0.18
        ? { class: 'twinkle', style: style({ '--t': `${f(between(r0, 2, 5))}s`, '--w': `${f(-between(r0, 0, 5))}s` }) }
        : {};
      dots += `<g class="write" style="${style(vars)}"><circle${at({ cx: x, cy: y, r: f(between(r0, 1.3, 2.7)), fill: hot ? C.bloodHi : r0() < 0.5 ? C.ink : '#dccbff', ...twinkle })}/></g>`;
      count++;
    }
  }
  return { dots, count };
}

function definition(ts, data, count) {
  const x = 700;
  const line = (content, y, opts) => ts.text('text', content, { x, y, 'font-size': 22, fill: C.ink2, ...opts });
  return `<g class="fade" style="--d:2.2s">
${ts.text('mono', '初心 · SHOSHIN · ZEN', { x, y: 128, 'font-size': 17, 'letter-spacing': 4, fill: C.bloodHi })}
${ts.text('display', 'Beginner’s mind.', { x, y: 200, 'font-size': 64, fill: C.ink })}
</g>
<g class="fade" style="--d:2.8s">
${ts.text('kanji', '初', { x, y: 262, 'font-size': 24, fill: C.bloodHi })}${line('sho: first, the beginning', 262, { x: x + 36 })}
${ts.text('kanji', '心', { x, y: 298, 'font-size': 24, fill: C.bloodHi })}${line('shin: heart, mind', 298, { x: x + 36 })}
</g>
<g class="fade" style="--d:3.4s">
${line('Meet every problem as if for the first time:', 358, { fill: C.ink })}
${line('open, eager, free of the expert’s blinders.', 390, { fill: C.ink })}
${line(`${data.total.toLocaleString('en-US')} commits this year, still a beginner.`, 422, { fill: C.ink })}
${ts.text('italic', 'The name I build under.', { x, y: 478, 'font-size': 30, fill: C.violetHi })}
</g>
${ts.text('mono', `THE ONLY DECORATION IS THE WORD · ${count} POINTS OF LIGHT`, { x: 64, y: 520, 'font-size': 13, 'letter-spacing': 3, fill: C.ink3 })}`;
}

/** @param {{total: number}} data @param {ReturnType<import('../lib/type.mjs').createTypeset>} ts */
export function shoshin(data, ts) {
  const r0 = rng(1600);
  const { dots, count } = light(r0);
  const inner = `<defs>${glowGradient('g-word', C.blood, { inner: 0.34, mid: 0.1 })}${glowGradient('g-word2', C.violet, { inner: 0.24, mid: 0.08 })}</defs>
<ellipse cx="214" cy="270" rx="230" ry="210" fill="url(#g-word)" class="breath"/>
<ellipse cx="502" cy="270" rx="220" ry="200" fill="url(#g-word2)" class="breath" style="animation-delay:-3s"/>
<path d="M64 ${H - 64}H${W - 64}" stroke="${C.line}"/>
<path d="M64 ${H - 64}H${W - 64}" pathLength="1000" stroke="${C.bloodHi}" stroke-width="1.4" stroke-dasharray="50 950" class="scan"/>
<path d="M656 96V${H - 96}" stroke="${C.line2}"/>
${dots}
${definition(ts, data, count)}`;
  return doc({
    width: W,
    height: H,
    title: 'Shoshin, beginner’s mind',
    desc: `The kanji 初心 write themselves in ${count} points of light, stroke by stroke. Beside them: shoshin, beginner’s mind. Sho means first, shin means heart or mind: meet every problem as if for the first time.`,
    css: CSS,
    body: sceneFrame(W, H, inner),
  });
}
