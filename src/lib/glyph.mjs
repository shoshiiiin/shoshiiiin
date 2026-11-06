// 初心 written with light. Each kanji is a list of brush strokes in stroke order,
// drawn on a 200 x 200 grid; the strokes are sampled into points the way Lichtfeld
// lets 6,134 points fly in to form its word.

import { between } from './rng.mjs';

/** 初: clothing radical (five strokes), then the knife (two strokes). */
export const SHO = Object.freeze([
  [[36, 12], [46, 30]],
  [[10, 48], [66, 46], [50, 70], [30, 92], [12, 106]],
  [[40, 76], [40, 132], [40, 194]],
  [[40, 118], [24, 138], [10, 148]],
  [[48, 112], [64, 130]],
  [[98, 46], [184, 42], [182, 96], [180, 150], [176, 180], [162, 194], [146, 186]],
  [[136, 46], [134, 92], [124, 138], [108, 168], [88, 192]],
]);

/** 心: left dot, lying hook, middle dot, right dot. */
export const SHIN = Object.freeze([
  [[34, 108], [22, 132], [16, 154]],
  [[58, 64], [62, 124], [70, 164], [92, 184], [132, 186], [164, 174], [182, 148], [170, 138]],
  [[96, 52], [110, 78]],
  [[148, 70], [166, 92], [176, 110]],
]);

/** Catmull-Rom point between p1 and p2. */
function spline(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  const c = (a, b, c2, d) => 0.5 * (2 * b + (-a + c2) * t + (2 * a - 5 * b + 4 * c2 - d) * t2 + (-a + 3 * b - 3 * c2 + d) * t3);
  return [c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])];
}

/**
 * Evenly spaced samples along a smooth stroke, with the direction at each.
 * @param {ReadonlyArray<readonly [number, number]>} pts
 * @param {number} spacing
 * @returns {Array<{x: number, y: number, angle: number, t: number}>}
 */
export function sampleStroke(pts, spacing) {
  const dense = [];
  const ext = [pts[0], ...pts, pts.at(-1)];
  for (let i = 1; i < ext.length - 2; i++) {
    for (let k = 0; k < 24; k++) dense.push(spline(ext[i - 1], ext[i], ext[i + 1], ext[i + 2], k / 24));
  }
  dense.push(pts.at(-1));
  const lengths = [0];
  for (let i = 1; i < dense.length; i++) {
    lengths.push(lengths[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
  }
  const total = lengths.at(-1);
  const out = [];
  let j = 1;
  for (let s = 0; s <= total; s += spacing) {
    while (j < dense.length - 1 && lengths[j] < s) j++;
    const [a, b] = [dense[j - 1], dense[j]];
    const seg = lengths[j] - lengths[j - 1] || 1;
    const u = (s - lengths[j - 1]) / seg;
    out.push({ x: a[0] + (b[0] - a[0]) * u, y: a[1] + (b[1] - a[1]) * u, angle: Math.atan2(b[1] - a[1], b[0] - a[0]), t: total ? s / total : 0 });
  }
  return out;
}

/**
 * Points of light for a whole glyph: each stroke sampled, spread across a tapering
 * brush width. `order` counts strokes across glyphs, so writing runs in sequence.
 * @param {() => number} r rng
 * @param {ReadonlyArray<ReadonlyArray<readonly [number, number]>>} strokes
 * @returns {Array<{x: number, y: number, stroke: number, t: number}>}
 */
export function glyphPoints(r, strokes, { spacing = 3.4, width = 13, across = 2, firstStroke = 0 } = {}) {
  const out = [];
  strokes.forEach((stroke, i) => {
    for (const s of sampleStroke(stroke, spacing)) {
      const w = width * (1 - 0.45 * s.t);
      for (let k = 0; k < across; k++) {
        const off = between(r, -w / 2, w / 2);
        out.push({ x: s.x - Math.sin(s.angle) * off, y: s.y + Math.cos(s.angle) * off, stroke: firstStroke + i, t: s.t });
      }
    }
  });
  return out;
}
