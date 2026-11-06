// Typography as in Lichtfeld: Bodoni Moda for display (hairlines like the scaffold),
// Schibsted Grotesk for text, JetBrains Mono for numbers, Shippori Mincho for kanji.
// Each face is one file under its own alias, so the browser never fakes bold or italic.

import { at, esc } from './svg.mjs';

export const FACES = Object.freeze({
  display: { alias: 'LF-D', query: 'Bodoni+Moda:opsz,wght@96,500' },
  italic: { alias: 'LF-I', query: 'Bodoni+Moda:ital,opsz,wght@1,96,400' },
  text: { alias: 'LF-T', query: 'Schibsted+Grotesk:wght@400' },
  textBold: { alias: 'LF-TB', query: 'Schibsted+Grotesk:wght@600' },
  mono: { alias: 'LF-M', query: 'JetBrains+Mono:wght@400' },
  monoBold: { alias: 'LF-MB', query: 'JetBrains+Mono:wght@700' },
  kanji: { alias: 'LF-K', query: 'Shippori+Mincho:wght@700' },
});

const FALLBACK = {
  display: 'Georgia,serif',
  italic: 'Georgia,serif',
  text: 'system-ui,sans-serif',
  textBold: 'system-ui,sans-serif',
  mono: 'ui-monospace,monospace',
  monoBold: 'ui-monospace,monospace',
  kanji: 'serif',
};

/** JetBrains Mono advances 600/1000 em per glyph; lets scenes place carets exactly. */
export const MONO_ADVANCE = 0.6;

/** Kana, kanji and full-width forms. */
const CJK = /[　-ヿ㐀-鿿＀-￯]/;

/**
 * Split text into runs of Japanese and non-Japanese characters.
 * @param {string} content
 * @returns {Array<{cjk: boolean, run: string}>}
 */
export function splitCjk(content) {
  const out = [];
  for (const ch of content) {
    const cjk = CJK.test(ch);
    const last = out.at(-1);
    if (last && last.cjk === cjk) out[out.length - 1] = { cjk, run: last.run + ch };
    else out.push({ cjk, run: ch });
  }
  return out;
}

/**
 * Collects which characters each face needs, so fonts are subset to exactly those.
 */
export function createTypeset() {
  /** @type {Map<keyof typeof FACES, Set<string>>} */
  const used = new Map();

  /**
   * A <text> element in a face; registers its characters.
   * @param {keyof typeof FACES} face
   * @param {string} content
   * @param {Record<string, unknown>} attrs
   */
  function register(face, content) {
    const chars = used.get(face) ?? new Set();
    for (const ch of content) chars.add(ch);
    used.set(face, chars);
  }

  function text(face, content, attrs = {}) {
    if (!FACES[face]) throw new Error(`Unknown face: ${face}`);
    const family = (f) => `${FACES[f].alias},${FALLBACK[f]}`;
    const open = `<text${at({ 'font-family': family(face), ...attrs })}>`;
    if (face === 'kanji' || !CJK.test(content)) {
      register(face, content);
      return `${open}${esc(content)}</text>`;
    }
    // Latin faces carry no Japanese glyphs: hand those runs to the Mincho face.
    const spans = splitCjk(content).map(({ cjk, run }) => {
      register(cjk ? 'kanji' : face, run);
      return cjk ? `<tspan font-family="${family('kanji')}">${esc(run)}</tspan>` : esc(run);
    });
    return `${open}${spans.join('')}</text>`;
  }

  /** @returns {Array<{face: keyof typeof FACES, chars: string}>} */
  function needs() {
    return [...used.entries()].map(([face, set]) => ({ face, chars: [...set].sort().join('') }));
  }

  return { text, needs };
}

/**
 * @font-face rules for embedded subsets.
 * @param {Array<{face: keyof typeof FACES, base64: string}>} files
 */
export function fontFaceCss(files) {
  return files
    .map(
      ({ face, base64 }) =>
        `@font-face{font-family:'${FACES[face].alias}';src:url(data:font/woff2;base64,${base64}) format('woff2');font-display:block}`,
    )
    .join('\n');
}
