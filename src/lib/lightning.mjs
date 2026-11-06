// Lightning for Chidori. The channels come from midpoint displacement (each level splits
// every segment and pushes its middle sideways), so they are jagged at every scale and
// fork like a real discharge. Each channel is drawn as a filled ribbon that tapers from
// the source to a needle tip, under a soft glow and over a white core; forks are thinner.
// A bolt strikes in an instant, flickers, and dies away; several different bolts strike
// out of step, so the crackle never repeats the same way.

import { between } from './rng.mjs';

export const LIGHTNING_CSS = `
.bolt{animation:bolt var(--t) linear var(--d) infinite}
@keyframes bolt{0%{opacity:0}1.5%{opacity:1}5%{opacity:.3}8%{opacity:1}14%{opacity:.8}24%{opacity:.45}40%,100%{opacity:0}}
`;

/** One decimal is plenty for lightning and keeps the files small. */
const n = (v) => `${Math.round(v * 10) / 10}`;

const clampTo = (band) => (band ? ([x, y]) => [x, Math.min(band[1], Math.max(band[0], y))] : (p) => p);

/**
 * A jagged line from a to b.
 * @param {() => number} r rng
 * @param {number[]} a @param {number[]} b
 * @param {{levels?: number, roughness?: number, clampY?: number[]}} [o]
 * @returns {number[][]} 2^levels + 1 points
 */
export function zigzag(r, a, b, { levels = 4, roughness = 0.24, clampY } = {}) {
  const clamp = clampTo(clampY);
  let pts = [a, b];
  for (let level = 0; level < levels; level++) {
    const next = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const len = Math.hypot(x1 - x0, y1 - y0) || 1;
      const push = between(r, -roughness, roughness) * len;
      next.push(clamp([(x0 + x1) / 2 - ((y1 - y0) / len) * push, (y0 + y1) / 2 + ((x1 - x0) / len) * push]), pts[i]);
    }
    pts = next;
  }
  return pts;
}

/** Forks leave the main channel at a slant and reach a share of its length. */
function forksOf(r, main, heading, length, { forks, reach, levels, roughness, clampY }) {
  const clamp = clampTo(clampY);
  return Array.from({ length: forks }, () => {
    const from = main[1 + Math.floor(between(r, 0.1, 0.75) * (main.length - 2))];
    const dir = heading + between(r, 0.35, 0.95) * (r() < 0.5 ? -1 : 1);
    const len = length * reach * between(r, 0.45, 1);
    const to = clamp([from[0] + Math.cos(dir) * len, from[1] + Math.sin(dir) * len]);
    return zigzag(r, from, to, { levels: Math.max(2, levels - 1), roughness, clampY });
  });
}

/**
 * A bolt from a to b with forks.
 * @returns {{main: number[][], forks: number[][][]}}
 */
export function strike(r, a, b, { levels = 4, roughness = 0.24, forks = 2, reach = 0.45, forkLevels = levels - 1, clampY } = {}) {
  const main = zigzag(r, a, b, { levels, roughness, clampY });
  const heading = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return { main, forks: forksOf(r, main, heading, length, { forks, reach, levels: forkLevels + 1, roughness, clampY }) };
}

/**
 * Electricity crawling along a circle (centred at the origin) from one angle to
 * another, jumping in and out by up to `jag`; forks shoot outward.
 * @returns {{main: number[][], forks: number[][][]}}
 */
export function rimArc(r, radius, fromDeg, toDeg, { steps = 12, jag = 4, forks = 1, reach = 22 } = {}) {
  const main = Array.from({ length: steps + 1 }, (_, i) => {
    const a = ((fromDeg + ((toDeg - fromDeg) * i) / steps) * Math.PI) / 180;
    const rr = radius + (i === 0 || i === steps ? 0 : between(r, -jag, jag));
    return [Math.cos(a) * rr, Math.sin(a) * rr];
  });
  const out = Array.from({ length: forks }, () => {
    const from = main[1 + Math.floor(r() * (steps - 1))];
    const dir = Math.atan2(from[1], from[0]) + between(r, -0.5, 0.5);
    const len = reach * between(r, 0.5, 1);
    return zigzag(r, from, [from[0] + Math.cos(dir) * len, from[1] + Math.sin(dir) * len], { levels: 3, roughness: 0.3 });
  });
  return { main, forks: out };
}

const line = (pts) => `M${pts.map(([x, y]) => `${n(x)} ${n(y)}`).join('L')}`;

/** A filled outline around a channel, `from` wide at its start and `to` wide at its end. */
export function ribbon(pts, from, to) {
  const last = pts.length - 1;
  const sides = pts.map(([x, y], i) => {
    const [ax, ay] = pts[Math.max(0, i - 1)];
    const [bx, by] = pts[Math.min(last, i + 1)];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    const half = (from + (to - from) * (i / last)) / 2;
    const nx = (-(by - ay) / len) * half;
    const ny = ((bx - ax) / len) * half;
    return [[x + nx, y + ny], [x - nx, y - ny]];
  });
  const left = sides.map(([l]) => l);
  const right = sides.map(([, r]) => r).reverse();
  return `${line([...left, ...right])}Z`;
}

/** One bolt: glow and core stroked along the channel, the tapering ribbon between them. */
function bolt({ main, forks }, ref, { color, core, width }) {
  const defs = `<path id="${ref}" d="${line(main)}"/>`;
  const glow = `<use href="#${ref}" stroke="${color}" stroke-width="${n(14 * width)}" opacity=".05"/><use href="#${ref}" stroke="${color}" stroke-width="${n(6 * width)}" opacity=".16"/>`;
  const body = `<path d="${ribbon(main, 2.6 * width, 0.2)}" fill="${color}" stroke="none"/>`;
  const branches = forks.map((fork) => `<path d="${line(fork)}" stroke="${color}" stroke-width="${n(3.5 * width)}" opacity=".1"/><path d="${ribbon(fork, 1.4 * width, 0.15)}" fill="${color}" stroke="none" opacity=".85"/>`).join('');
  const centre = `<use href="#${ref}" stroke="${core}" stroke-width="${n(0.7 * width)}" opacity=".95"/>`;
  return { defs, markup: `${glow}${branches}${body}${centre}` };
}

/**
 * Bolts that strike in turns: each variant flashes, flickers and fades on its own beat.
 * The first variant is the still frame under reduced motion; the others start hidden.
 * @param {Array<Array<{main: number[][], forks: number[][][]}>>} variants
 * @param {{id: string, color: string, core: string, r: () => number, period?: number[], width?: number}} o
 *   id: prefix for the path ids, unique within the document; r: rng for the beats;
 *   period: seconds between two strikes of the same variant
 */
export function strikes(variants, { id, color, core, r, period = [1, 1.5], width = 1 }) {
  return variants
    .map((bolts, k) => {
      const t = between(r, period[0], period[1]);
      const beat = { '--t': `${n(t)}s`, '--d': `${n(-((k / variants.length) * t + between(r, 0, 0.08)))}s` };
      const drawn = bolts.map((b, i) => bolt(b, `${id}${k}-${i}`, { color, core, width }));
      return `<g class="bolt" fill="none" stroke-linecap="round" stroke-linejoin="round" style="--t:${beat['--t']};--d:${beat['--d']}"${k ? ' opacity="0"' : ''}><defs>${drawn.map((d) => d.defs).join('')}</defs>${drawn.map((d) => d.markup).join('')}</g>`;
    })
    .join('');
}
