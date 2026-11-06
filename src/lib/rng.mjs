// Seeded randomness, so every build draws the same sky.

/**
 * mulberry32: small, fast, good enough for layout.
 * @param {number} seed
 * @returns {() => number} values in [0, 1)
 */
export function rng(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** @param {() => number} r @param {number} min @param {number} max */
export const between = (r, min, max) => min + (max - min) * r();

/** @template T @param {() => number} r @param {readonly T[]} list @returns {T} */
export const pick = (r, list) => list[Math.floor(r() * list.length)];
