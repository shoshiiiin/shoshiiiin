// Shapes shared by the scenes: eye patterns, tomoe, crows, petals, clouds, spirals.
// Lightning lives in lightning.mjs.
// Original drawings; nothing is traced from the series.

import { between } from './rng.mjs';
import { at, f } from './svg.mjs';

/**
 * One tomoe (the comma of the Sharingan), head at the origin, tail curling
 * counter-clockwise. Rotate copies by 120 degrees around the iris centre.
 * @param {number} r head radius
 */
export function tomoePath(r) {
  return [
    `M${f(r)} 0`,
    `A${f(r)} ${f(r)} 0 1 1 ${f(-r)} 0`,
    `C${f(-r * 1.05)} ${f(-r * 1.5)} ${f(-r * 0.3)} ${f(-r * 2.5)} ${f(r * 1.9)} ${f(-r * 2.75)}`,
    `C${f(r * 0.65)} ${f(-r * 2.05)} ${f(r * 1.05)} ${f(-r * 1.15)} ${f(r)} 0Z`,
  ].join('');
}

/**
 * Itachi's Mangekyō Sharingan as drawn here: three blades leave the pupil broad, sweep
 * round in a strong curve and narrow into a ring at the rim, so the red between them
 * forms three large curved wedges. An own drawing of the motif.
 * @param {number} R iris radius @param {string} fill
 */
export function itachiMangekyo(R, fill) {
  const p = (r, deg) => {
    const a = (deg * Math.PI) / 180;
    return `${f(Math.cos(a) * R * r)} ${f(Math.sin(a) * R * r)}`;
  };
  const ring = 0.9;
  const blade = (t) =>
    `M${p(0.2, t - 28)}C${p(0.5, t + 2)} ${p(0.82, t + 38)} ${p(ring, t + 70)}` +
    `A${f(R * ring)} ${f(R * ring)} 0 0 1 ${p(ring, t + 86)}` +
    `C${p(0.74, t + 66)} ${p(0.5, t + 46)} ${p(0.2, t + 28)}Z`;
  const blades = [0, 120, 240].map((t) => `<path d="${blade(t)}" fill="${fill}"/>`).join('');
  return `${blades}<circle r="${f(R * ring)}" fill="none" stroke="${fill}" stroke-width="${f(R * 0.06)}"/><circle r="${f(R * 0.24)}" fill="${fill}"/>`;
}

/**
 * Sasuke's Mangekyō Sharingan as drawn here: three long ellipses crossing at the pupil
 * form a six-pointed star on a black iris; their black outlines run on through each
 * other, and the red darkens into a deep halo round the pupil. Draws the whole eye.
 * @param {number} R iris radius @param {string} id gradient id, unique in the document
 */
export function sasukeMangekyo(R, id) {
  const ink = '#050001';
  const petals = (attrs) => [90, 30, 150].map((deg) => `<ellipse rx="${f(R * 0.93)}" ry="${f(R * 0.3)}" transform="rotate(${deg})"${attrs}/>`).join('');
  const shade = `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="${f(R)}"><stop offset=".14" stop-color="#240002"/><stop offset=".36" stop-color="#7c0009"/><stop offset=".62" stop-color="#c8000f"/><stop offset="1" stop-color="#a8000c"/></radialGradient>`;
  return `<defs>${shade}</defs><circle r="${f(R)}" fill="${ink}"/>${petals(` fill="url(#${id})"`)}${petals(` fill="none" stroke="${ink}" stroke-width="${f(R * 0.035)}"`)}<circle r="${f(R * 0.13)}" fill="${ink}"/>`;
}

/**
 * Ripple rings with tomoe: the Rinnegan pattern. `perRing` tomoe sit on each ring
 * listed in `tomoeRings`; every ring is its own group (class "ring-<i>") so it can turn.
 * With `lines: false` only the tomoe are drawn, to lay them over rings drawn elsewhere.
 * @param {number} R outer radius
 * @param {{rings: number, tomoeRings: number[], perRing?: number, line: string, tomoe: string, head?: number, lines?: boolean}} o
 */
export function rippleEye(R, { rings, tomoeRings, perRing = 3, line, tomoe, head = R * 0.055, lines = true }) {
  let out = '';
  for (let i = 1; i <= rings; i++) {
    const r = (R * i) / (rings + 0.35);
    if (lines) out += `<circle r="${f(r)}" fill="none" stroke="${line}" stroke-width="${f(Math.max(1.2, R * 0.016))}"/>`;
    if (!tomoeRings.includes(i)) continue;
    const one = tomoePath(head);
    const marks = Array.from({ length: perRing }, (_, k) => {
      const deg = (k * 360) / perRing + i * 40;
      return `<path d="${one}" fill="${tomoe}" transform="rotate(${f(deg)}) translate(0 ${f(-r)}) rotate(-28)"/>`;
    }).join('');
    out += `<g class="ring ring-${i}">${marks}</g>`;
  }
  return out;
}

/** Crow body facing right, about 46 units wide; wings come separately so they can beat. */
export const CROW_BODY =
  'M-15 0C-9-6 4-8 11-4L14-6 20-4 14-1C9 4-5 6-13 3L-24 6-21 1-25-1Z';
export const CROW_WING = 'M-5-2C-4-12 3-22 16-28 12-19 10-10 7-1Z';
export const CROW_WING_BACK = 'M-8-1C-10-9-7-18 2-25 1-16 2-8 3-1Z';

/**
 * A crow: body plus two beating wings (class "wing" animates them).
 * @param {string} fill
 */
export function crow(fill) {
  return `<path d="${CROW_WING_BACK}" fill="${fill}" opacity=".7" class="a wing wb"/><path d="${CROW_BODY}" fill="${fill}"/><path d="${CROW_WING}" fill="${fill}" class="a wing"/>`;
}

/** Cherry blossom petal with its notch, about 18 units tall. */
export const PETAL = 'M0-8 2.6-11.5C7-11.5 9.2-3 6.2 4.2 4.3 8.8 1.4 11 0 11-1.4 11-4.3 8.8-6.2 4.2-9.2-3-7-11.5-2.6-11.5Z';

/** A small swirl cloud (the red clouds on Itachi's cloak), about 40 x 22 units. */
export const CLOUD =
  'M0 10C-2 2 6-2 10 2 12-6 22-6 24 1 30-3 38 2 36 9 40 14 34 20 28 17 24 22 14 22 12 17 6 21-2 18 0 10Z';

/**
 * Points on a multi-arm logarithmic spiral: Naruto's spiral, the Rasengan.
 * @param {() => number} r rng
 * @returns {Array<{x: number, y: number, s: number, o: number}>}
 */
export function spiralPoints(r, { arms = 3, perArm = 26, inner = 4, outer = 60, turns = 1.35 } = {}) {
  const out = [];
  for (let arm = 0; arm < arms; arm++) {
    for (let i = 0; i < perArm; i++) {
      const t = i / (perArm - 1);
      const rad = inner * (outer / inner) ** t;
      const a = (arm / arms) * Math.PI * 2 + t * turns * Math.PI * 2 + between(r, -0.08, 0.08);
      out.push({ x: Math.cos(a) * rad, y: Math.sin(a) * rad, s: 0.6 + (1 - t) * 1.8, o: 0.35 + (1 - t) * 0.65 });
    }
  }
  return out;
}

/** A soft glow as a radial gradient definition (cheaper than a blur filter). */
export function glowGradient(id, color, { inner = 0.9, mid = 0.25 } = {}) {
  return `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${inner}"/><stop offset=".35" stop-color="${color}" stop-opacity="${mid}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
}

/** Hairline ring with tick marks, as on a star atlas (Lichtfeld rule 3). */
export function tickRing(cx, cy, radius, { count = 72, every = 6, short = 5, long = 12, stroke, width = 1, opacity = 1 } = {}) {
  let d = '';
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const len = i % every === 0 ? long : short;
    const x1 = cx + Math.cos(a) * radius;
    const y1 = cy + Math.sin(a) * radius;
    const x2 = cx + Math.cos(a) * (radius + len);
    const y2 = cy + Math.sin(a) * (radius + len);
    d += `M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`;
  }
  return `<path${at({ d, stroke, 'stroke-width': width, opacity, fill: 'none' })}/>`;
}
