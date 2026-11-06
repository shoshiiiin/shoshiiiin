// A generated Susanoo floating as a hologram. The painted giant glows additively
// behind its brother (Lichtfeld rule 9: light in the dark), light points trace its
// contour (rule 1: here every point is a piece of its edge), and a hairline scaffold
// holds it in the air: levitation rings, an axis, corner brackets (rule 3).
//
// The image breathes in and out; the rim of light does not follow it down, so the
// shape stays drawn in light while the giant fades. A pulse runs round the rim like a
// radar sweep, and a scan line passes over the frame (rule 4: threads with a pulse).

import { between } from './rng.mjs';
import { at, f, style } from './svg.mjs';

const RUN = 6;
const SWEEP = 6;

export const HOLOGRAM_CSS = `
.holo{mix-blend-mode:screen}
.manifest{animation:manifest 14s ease-in-out infinite}
@keyframes manifest{0%,100%{opacity:.24}38%,62%{opacity:1}}
.rim{animation:rim 14s ease-in-out infinite}
@keyframes rim{0%,100%{opacity:1}38%,62%{opacity:.75}}
.float{animation:float 8s ease-in-out infinite}
@keyframes float{50%{transform:translateY(-9px)}}
.trace{animation:trace 1.6s cubic-bezier(.2,.7,.2,1) var(--d) both}
@keyframes trace{from{opacity:0;transform:translate(var(--dx),var(--dy))}}
.run{animation:run ${RUN}s linear var(--r) infinite}
@keyframes run{0%,12%,100%{opacity:.5}4%{opacity:1}}
.spark{animation:spark var(--t) ease-in-out var(--w) infinite}
@keyframes spark{50%{opacity:.2}}
.orbit{animation:orbit 9s linear infinite}
@keyframes orbit{to{stroke-dashoffset:-1000}}
.sweep{animation:sweep ${SWEEP}s cubic-bezier(.45,0,.55,1) var(--s) infinite}
@keyframes sweep{0%{opacity:0;transform:translateY(0)}10%,82%{opacity:1}100%{opacity:0;transform:translateY(var(--h))}}
`;

const BRACKET = 26;
const TAG_GAP = 12;
const SPARK_SHARE = 0.16;
const HOT_SHARE = 0.55;
const TRAIL = 34;

/** One contour point: it flies in once, then glows as the pulse passes its angle. */
function tracePoint([fx, fy], i, count, box, o, r0) {
  const x = box.left + fx * box.width;
  const y = box.top + fy * box.height;
  const a = between(r0, 0, Math.PI * 2);
  const dist = between(r0, 30, 120);
  const fly = { '--dx': `${f(Math.cos(a) * dist)}px`, '--dy': `${f(Math.sin(a) * dist)}px`, '--d': `${f(o.start + (i / count) * 1.8)}s` };
  const r = between(r0, 1.5, 2.8);
  const light =
    r0() < SPARK_SHARE
      ? { r: r + 1.2, fill: '#fff', class: 'spark', style: style({ '--t': `${f(between(r0, 1.6, 4))}s`, '--w': `${f(-between(r0, 0, 4))}s` }) }
      : { r, fill: r0() < HOT_SHARE ? o.hot : o.line, class: 'run', style: style({ '--r': `${f(-RUN * (1 - i / count) + o.phase)}s` }) };
  return `<g class="trace" style="${style(fly)}"><circle${at({ cx: x, cy: y, ...light })}/></g>`;
}

function tracePoints(outline, box, o, r0) {
  return outline.map((p, i) => tracePoint(p, i, outline.length, box, o, r0)).join('');
}

/** A hairline that scans the frame top to bottom, with a faint trail of light above it, clipped to the frame. */
function sweep(box, base, o) {
  const id = `sweep-${o.id}`;
  const vars = { '--h': `${f(base - box.top)}px`, '--s': `${f(o.phase / 2)}s` };
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${o.hot}" stop-opacity="0"/><stop offset="1" stop-color="${o.hot}" stop-opacity=".3"/></linearGradient>
<clipPath id="${id}-clip"><rect${at({ x: box.left, y: box.top, width: box.width, height: base - box.top })}/></clipPath>
<g clip-path="url(#${id}-clip)"><g class="sweep" opacity="0" style="${style(vars)}"><rect${at({ x: box.left, y: box.top - TRAIL, width: box.width, height: TRAIL, fill: `url(#${id})` })}/><path d="M${f(box.left)} ${f(box.top + 1)}H${f(box.left + box.width)}" stroke="${o.hot}" stroke-width="1.4"/></g></g>`;
}

function scaffold(box, base, o) {
  const { left, top, width } = box;
  const cx = left + width / 2;
  const right = left + width;
  const rx = width * 0.46;
  const corners = [
    `M${f(left)} ${f(top + BRACKET)}V${f(top)}H${f(left + BRACKET)}`,
    `M${f(right - BRACKET)} ${f(top)}H${f(right)}V${f(top + BRACKET)}`,
    `M${f(right)} ${f(base - BRACKET)}V${f(base)}H${f(right - BRACKET)}`,
    `M${f(left + BRACKET)} ${f(base)}H${f(left)}V${f(base - BRACKET)}`,
  ].join('');
  const ticks = Array.from({ length: 9 }, (_, k) => {
    const y = top + (k * (base - top)) / 8;
    return `M${f(cx - (k % 4 ? 3 : 7))} ${f(y)}H${f(cx + (k % 4 ? 3 : 7))}`;
  }).join('');
  return `<ellipse${at({ cx, cy: base, rx, ry: rx * 0.09, fill: 'none', stroke: o.line, 'stroke-width': 1.2, opacity: 0.85 })}/>
<ellipse${at({ cx, cy: base + 8, rx: rx * 0.7, ry: rx * 0.06, fill: 'none', stroke: o.line, 'stroke-width': 1, 'stroke-dasharray': '2 7', opacity: 0.6 })}/>
<ellipse${at({ cx, cy: base, rx, ry: rx * 0.09, fill: 'none', stroke: o.hot, 'stroke-width': 2.6, pathLength: 1000, 'stroke-dasharray': '110 890', class: 'orbit' })}/>
<path d="M${f(cx)} ${f(top - 6)}V${f(base)}${ticks}" stroke="${o.line}" stroke-width="1" fill="none" opacity=".4"/>
<path d="${corners}" stroke="${o.line}" stroke-width="2" fill="none"/>`;
}

/**
 * @param {{uri: string, w: number, h: number, outline?: number[][]}} art
 * @param {{id: string, cx: number, top: number, height: number, side?: 'left' | 'right', line: string, hot: string, phase: number, start: number, tag: string}} o
 * @param {ReturnType<import('./type.mjs').createTypeset>} ts
 * @param {() => number} r0
 */
export function susanooHologram(art, o, ts, r0) {
  const width = (o.height * art.w) / art.h;
  const box = { left: o.cx - width / 2, top: o.top, width, height: o.height };
  const base = box.top + box.height * 0.94;
  const delay = `animation-delay:${o.phase}s`;
  const image = `<g class="manifest" opacity=".6" style="${delay}"><image${at({ href: art.uri, x: box.left, y: box.top, width, height: o.height })}/></g>`;
  const rim = `<g class="rim" style="${delay}">${tracePoints(art.outline ?? [], box, o, r0)}</g>`;
  // The tag hangs outside the frame on the given side, level with the levitation ring.
  const tagAt = o.side === 'right' ? { x: f(box.left + width + TAG_GAP) } : { x: f(box.left - TAG_GAP), 'text-anchor': 'end' };
  const tag = ts.text('mono', o.tag, { ...tagAt, y: f(base + 4), 'font-size': 14, 'letter-spacing': 2, fill: o.line });
  return `<g class="holo"><g class="float">${image}${rim}</g>${scaffold(box, base, o)}${sweep(box, base, o)}${tag}</g>`;
}
