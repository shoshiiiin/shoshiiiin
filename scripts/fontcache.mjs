// Fetches font subsets from Google Fonts (the `text=` parameter returns exactly
// those glyphs) and caches them in src/fonts, so later builds run offline.
// curl, not fetch: it honours the system proxy and never truncates silently.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { FACES } from '../src/lib/type.mjs';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';
const WOFF2_MAGIC = 'wOF2';

/** @param {string} url @returns {Buffer} */
const MAX_BYTES = 2_000_000;

function curl(url) {
  return execFileSync(
    'curl',
    ['-sSfL', '--proto', '=https', '--proto-redir', '=https', '--max-filesize', String(MAX_BYTES), '--max-time', '30', '-A', UA, url],
    { maxBuffer: 4 * MAX_BYTES },
  );
}

/**
 * @param {string} dir cache directory
 * @param {keyof typeof FACES} face
 * @param {string} chars
 * @returns {string} base64 woff2
 */
export function subset(dir, face, chars) {
  const hash = createHash('sha1').update(`${FACES[face].query}|${chars}`).digest('hex').slice(0, 12);
  const file = join(dir, `${FACES[face].alias}-${hash}.woff2`);
  if (!existsSync(file)) {
    const css = curl(
      `https://fonts.googleapis.com/css2?family=${FACES[face].query}&text=${encodeURIComponent(chars)}&display=block`,
    ).toString('utf8');
    const url = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/)?.[1];
    if (!url) throw new Error(`No font URL for ${face}: ${css.slice(0, 200)}`);
    const bytes = curl(url);
    if (bytes.subarray(0, 4).toString('latin1') !== WOFF2_MAGIC) {
      throw new Error(`Not a woff2 file for ${face} (${bytes.length} bytes)`);
    }
    // Write then rename, so an interrupted build never leaves half a font in the cache.
    mkdirSync(dir, { recursive: true });
    writeFileSync(`${file}.part`, bytes);
    renameSync(`${file}.part`, file);
  }
  return readFileSync(file).toString('base64');
}
