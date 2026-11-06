// Card frames and section headers shared by the scenes: hairline border, corner
// ticks like a star atlas, a mono label and a Bodoni title.

import { C, FRAME } from './palette.mjs';
import { f } from './svg.mjs';

/** Outer frame for a whole scene: rounded clip, background, hairline border. */
export function sceneFrame(w, h, inner) {
  return `<defs><clipPath id="frame"><rect width="${w}" height="${h}" rx="${FRAME.radius}"/></clipPath></defs>
<g clip-path="url(#frame)"><rect width="${w}" height="${h}" fill="${C.bg}"/>${inner}</g>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${FRAME.radius}" fill="none" stroke="${C.line2}"/>`;
}

/** A card: stage fill, hairline border, four corner ticks in the accent colour. */
export function card(x, y, w, h, accent) {
  const t = 14;
  const ticks = [
    `M${x} ${y + t}V${y}H${x + t}`,
    `M${x + w - t} ${y}H${x + w}V${y + t}`,
    `M${x + w} ${y + h - t}V${y + h}H${x + w - t}`,
    `M${x + t} ${y + h}H${x}V${y + h - t}`,
  ].join('');
  return `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="url(#stage)" stroke="${C.line}"/><path d="${ticks}" fill="none" stroke="${accent}" stroke-width="1.6"/>`;
}

export const STAGE_GRADIENT = `<linearGradient id="stage" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.stage}"/><stop offset="1" stop-color="#0b0718"/></linearGradient>`;

/**
 * Section header: kanji + mono label on the left, Bodoni title below.
 * @param {ReturnType<import('./type.mjs').createTypeset>} ts
 */
export function header(ts, { x, y, kanji, label, title, accent }) {
  return `${ts.text('kanji', kanji, { x, y, 'font-size': 22, 'letter-spacing': 6, fill: accent })}
${ts.text('mono', label, { x: x + 22 * [...kanji].length + 6 * [...kanji].length + 10, y: y - 3, 'font-size': 16, 'letter-spacing': 4, fill: C.ink3 })}
${ts.text('display', title, { x, y: y + 50, 'font-size': 44, fill: C.ink })}`;
}
