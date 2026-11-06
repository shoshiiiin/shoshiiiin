// The year as data: one point per day, brightness from commits.
// Pure functions only; the Sharingan scene draws what these return.

const DAY_MS = 86_400_000;
export const WEEKS = 53;

/** @param {string} iso YYYY-MM-DD @returns {number} UTC midnight in ms */
const toMs = (iso) => Date.parse(`${iso}T00:00:00Z`);
/** @param {number} ms @returns {string} */
const toIso = (ms) => new Date(ms).toISOString().slice(0, 10);

/**
 * 53 weeks x 7 days, Monday first, the last column holding `until`.
 * Days after `until` are marked as future.
 * @param {Record<string, number>} counts date -> commits
 * @param {string} until YYYY-MM-DD
 * @returns {Array<{date: string, week: number, day: number, count: number, future: boolean}>}
 */
export function buildYear(counts, until) {
  const end = toMs(until);
  const weekday = (new Date(end).getUTCDay() + 6) % 7; // Monday = 0
  const start = end - (weekday + (WEEKS - 1) * 7) * DAY_MS;
  return Array.from({ length: WEEKS * 7 }, (_, i) => {
    const ms = start + i * DAY_MS;
    const date = toIso(ms);
    return {
      date,
      week: Math.floor(i / 7),
      day: i % 7,
      count: ms > end ? 0 : Math.max(0, Math.floor(counts[date] ?? 0)),
      future: ms > end,
    };
  });
}

/**
 * Lichtfeld rule 2: brightness carries the message. Log scale, so one wild day
 * does not blind the rest; an empty day stays a faint scaffold point.
 * @param {number} count @param {number} max
 */
export function brightness(count, max) {
  if (count <= 0 || max <= 0) return 0;
  return 0.28 + 0.72 * (Math.log1p(count) / Math.log1p(max));
}

/**
 * @param {Array<{count: number, future: boolean}>} cells
 */
export function summarize(cells) {
  const past = cells.filter((c) => !c.future);
  let longest = 0;
  let run = 0;
  for (const c of past) {
    run = c.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  // Current streak: today may still be empty without breaking it.
  let current = 0;
  for (let i = past.length - 1; i >= 0; i--) {
    if (past[i].count > 0) current++;
    else if (i === past.length - 1) continue;
    else break;
  }
  const total = past.reduce((s, c) => s + c.count, 0);
  const max = past.reduce((m, c) => Math.max(m, c.count), 0);
  const lit = past.filter((c) => c.count > 0).length;
  return { total, max, lit, longest, current };
}

/**
 * Where a new month begins, judged by each week's Monday. The first column is
 * skipped: its month returns a year later at the end and the labels would collide.
 * @returns {Array<{week: number, month: number}>} month 1..12
 */
export function monthMarks(cells) {
  const marks = [];
  let prev = null;
  for (const c of cells) {
    if (c.day !== 0) continue;
    const month = Number(c.date.slice(5, 7));
    if (prev !== null && month !== prev) marks.push({ week: c.week, month });
    prev = month;
  }
  return marks;
}
