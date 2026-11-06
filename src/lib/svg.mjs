// Tiny helpers for writing SVG as strings. No DOM, so everything stays testable.

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** @param {unknown} value @returns {string} */
export const esc = (value) => String(value).replace(/[&<>"']/g, (ch) => ENTITIES[ch]);

/** Round for compact output. @param {number} n @param {number} [digits] */
export const f = (n, digits = 2) => {
  const p = 10 ** digits;
  return String(Math.round(n * p) / p);
};

/**
 * Build an attribute string; undefined and null values are dropped.
 * @param {Record<string, unknown>} attrs
 */
export function at(attrs) {
  return Object.entries(attrs)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => ` ${k}="${esc(typeof v === 'number' ? f(v) : v)}"`)
    .join('');
}

/**
 * Inline style from custom properties and plain properties.
 * @param {Record<string, string | number>} props
 */
export const style = (props) =>
  Object.entries(props)
    .map(([k, v]) => `${k}:${typeof v === 'number' ? f(v) : v}`)
    .join(';');

/** Points along a polar circle. @returns {[number, number]} */
export const polar = (cx, cy, r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};

/** Polyline points to a path "d". @param {Array<[number, number]>} pts */
export const poly = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`).join(' ');

/** Where the build inserts the @font-face rules for the glyphs a scene used. */
export const FONT_SLOT = '/*FONTS*/';

/**
 * The document shell every scene shares: title, description, fonts, styles, reduced motion.
 * Reduced motion shows the still frame (Lichtfeld rule 8): base attributes hold that frame.
 * `.a` comes before the scene CSS so a scene can still move an element's origin.
 */
export function doc({ width, height, title, desc, css, body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title>
<desc id="d">${esc(desc)}</desc>
<style>${FONT_SLOT}
.a{transform-box:fill-box;transform-origin:center}
${css}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
${body}
</svg>
`;
}
