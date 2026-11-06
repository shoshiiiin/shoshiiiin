// The year as a Sharingan. Lichtfeld rule 1: every point is a day of the last year,
// 53 spokes for the weeks, 7 rings for the days. Rule 2: brightness is commits.
// Rule 5: what is empty stays a faint scaffold point, so the lit days carry the eye.

import { sceneFrame, STAGE_GRADIENT } from '../lib/frame.mjs';
import { C } from '../lib/palette.mjs';
import { glowGradient, sasukeMangekyo, tickRing } from '../lib/shapes.mjs';
import { at, doc, f, polar } from '../lib/svg.mjs';
import { WEEKS, brightness, monthMarks } from '../lib/year.mjs';

const W = 1280;
const H = 740;
const CX = 612;
const CY = 382;
const R0 = 150;
const STEP = 21;
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const CSS = `
.in{animation:in 1s cubic-bezier(.2,.7,.2,1) both}
@keyframes in{from{opacity:0;transform:scale(.1)}}
.spin{animation:spin 16s cubic-bezier(.45,0,.55,1) 2.4s infinite}
@keyframes spin{0%{transform:rotate(0)}70%{transform:rotate(120deg)}82%{transform:rotate(600deg)}100%{transform:rotate(720deg)}}
.flash{animation:flash 16s ease-out 2.4s infinite}
@keyframes flash{0%,69%{opacity:0}75%{opacity:.5}92%,100%{opacity:0}}
.sweep{animation:turn 18s linear 2.4s infinite}
.turn-r{animation:turn 240s linear infinite reverse}
@keyframes turn{to{transform:rotate(360deg)}}
.today{animation:today 2.4s ease-out infinite}
@keyframes today{from{opacity:.9;transform:scale(.4)}to{opacity:0;transform:scale(2.6)}}
.glint{animation:glint var(--t) ease-in-out var(--d) infinite}
@keyframes glint{50%{opacity:.35}}
.fade{animation:fade 1.6s ease-out var(--d) both}
@keyframes fade{from{opacity:0}}
`;

/** Lit points shade from deep blood to white-hot, as the moon does. */
function tone(b) {
  if (b >= 0.92) return '#fff1f2';
  if (b >= 0.7) return C.bloodHi;
  return C.blood;
}

function points(cells, max) {
  let glow = '';
  let dots = '';
  for (const c of cells) {
    if (c.future) continue;
    const deg = (c.week / WEEKS) * 360;
    const [x, y] = polar(CX, CY, R0 + c.day * STEP, deg);
    const b = brightness(c.count, max);
    const delay = `animation-delay:${f(0.4 + c.week * 0.032 + c.day * 0.01)}s`;
    if (b === 0) {
      dots += `<circle${at({ cx: x, cy: y, r: 1.6, fill: C.line2, class: 'a in', style: delay })}/>`;
      continue;
    }
    glow += `<circle${at({ cx: x, cy: y, r: 4 + b * 10, fill: 'url(#g-point)', opacity: b, class: 'a in', style: delay })}/>`;
    dots += `<circle${at({ cx: x, cy: y, r: 2 + b * 3.2, fill: tone(b), class: 'a in', style: delay })}/>`;
  }
  return `<g>${glow}</g><g>${dots}</g>`;
}

function today(cells) {
  const last = cells.filter((c) => !c.future).at(-1);
  const [x, y] = polar(CX, CY, R0 + last.day * STEP, (last.week / WEEKS) * 360);
  return `<circle cx="${f(x)}" cy="${f(y)}" r="7" fill="none" stroke="${C.ink}" stroke-width="1.4" class="a today"/><circle cx="${f(x)}" cy="${f(y)}" r="2.6" fill="${C.ink}"/>`;
}

function scaffold(cells, ts) {
  const outer = R0 + 6 * STEP + 18;
  const labels = monthMarks(cells)
    .map(({ week, month }) => {
      const deg = (week / WEEKS) * 360;
      const [x, y] = polar(CX, CY, outer + 30, deg);
      const [x1, y1] = polar(CX, CY, outer, deg);
      const [x2, y2] = polar(CX, CY, outer + 14, deg);
      return `<path d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}" stroke="${C.ink3}"/>${ts.text('mono', MONTHS[month - 1], { x: f(x), y: f(y + 5), 'font-size': 15, 'letter-spacing': 2, fill: C.ink3, 'text-anchor': 'middle' })}`;
    })
    .join('');
  return `<circle cx="${CX}" cy="${CY}" r="${outer}" fill="none" stroke="${C.line2}"/>
<g transform="translate(${CX} ${CY})"><g class="turn-r">${tickRing(0, 0, outer + 44, { count: 106, every: 2, short: 3, long: 7, stroke: C.line2 })}</g></g>
<circle cx="${CX}" cy="${CY}" r="${R0 - 16}" fill="none" stroke="${C.line2}"/>
${labels}`;
}

function iris() {
  return `<g transform="translate(${CX} ${CY})">
<g class="spin">${sasukeMangekyo(R0 - 22, 'ems-eye')}</g>
<circle r="${R0 - 22}" fill="none" stroke="${C.bloodHi}" stroke-width="1" opacity=".7"/>
<circle r="${R0 - 22}" fill="${C.bloodHi}" opacity="0" class="flash"/>
</g>`;
}

/** A radar sweep: one hairline and a fading tail, turning once every 18 s. */
function sweep() {
  const tail = Array.from({ length: 10 }, (_, i) => {
    const [x1, y1] = polar(0, 0, R0 - 8, -i * 2.4);
    const [x2, y2] = polar(0, 0, R0 + 6 * STEP + 10, -i * 2.4);
    return `<path d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}" stroke="${C.bloodHi}" stroke-width="${i ? 1 : 1.6}" opacity="${f(0.7 * (1 - i / 10))}"/>`;
  }).join('');
  return `<g transform="translate(${CX} ${CY})"><g class="sweep">${tail}</g></g>`;
}

function sides(ts, data) {
  const stat = (y, value, label, d) =>
    `<g class="fade" style="--d:${d}s">${ts.text('display', value, { x: 64, y, 'font-size': 58, fill: C.ink })}${ts.text('mono', label, { x: 66, y: y + 28, 'font-size': 15, 'letter-spacing': 3, fill: C.ink3 })}</g>`;
  const n = (v) => v.toLocaleString('en-US');
  const left = `${ts.text('kanji', '写輪眼', { x: 64, y: 82, 'font-size': 24, 'letter-spacing': 6, fill: C.bloodHi })}
${ts.text('mono', 'THE YEAR IN COMMITS', { x: 64, y: 112, 'font-size': 16, 'letter-spacing': 4, fill: C.ink3 })}
${stat(232, n(data.total), 'COMMITS', 0.6)}
${stat(342, n(data.lit), 'DAYS LIT', 0.8)}
${stat(452, `${data.longest}`, 'DAY STREAK, LONGEST', 1)}
${stat(562, n(data.max), 'ON THE BUSIEST DAY', 1.2)}`;
  const rx = W - 64;
  const caption = ['Every point is a day.', 'Brightness is commits.', `${data.repos} repositories,`, 'names removed.']
    .map((line, i) => ts.text('text', line, { x: rx, y: 236 + i * 30, 'font-size': 20, fill: i < 2 ? C.ink : C.ink2, 'text-anchor': 'end' }))
    .join('');
  const legend = [
    [0, 'NO COMMITS'],
    [0.5, 'SOME'],
    [1, 'MANY'],
  ]
    .map(([b, label], i) => {
      const y = 420 + i * 34;
      const dot = b === 0
        ? `<circle cx="${rx - 6}" cy="${y - 5}" r="1.8" fill="${C.line2}"/>`
        : `<circle cx="${rx - 6}" cy="${y - 5}" r="${f(2 + b * 3.2)}" fill="${tone(b)}"/>`;
      return `${dot}${ts.text('mono', label, { x: rx - 24, y, 'font-size': 14, 'letter-spacing': 3, fill: C.ink3, 'text-anchor': 'end' })}`;
    })
    .join('');
  const until = ts.text('mono', `UNTIL ${data.until}`, { x: rx, y: 560, 'font-size': 14, 'letter-spacing': 3, fill: C.ink3, 'text-anchor': 'end' });
  return `${left}<g class="fade" style="--d:1.4s">${caption}${legend}${until}</g>`;
}

/** @param {any} data @param {ReturnType<import('../lib/type.mjs').createTypeset>} ts */
export function eye(data, ts) {
  const inner = `<defs>${STAGE_GRADIENT}
<radialGradient id="bg-eye" cx=".5" cy="${CY / H}" r=".6"><stop offset="0" stop-color="#2a0612"/><stop offset=".6" stop-color="#10081f"/><stop offset="1" stop-color="${C.bg}"/></radialGradient>
${glowGradient('g-point', C.bloodHi, { inner: 0.7, mid: 0.2 })}
</defs>
<rect width="${W}" height="${H}" fill="url(#bg-eye)"/>
${scaffold(data.cells, ts)}
${iris()}
${sweep()}
${points(data.cells, data.max)}
${today(data.cells)}
${sides(ts, data)}`;
  return doc({
    width: W,
    height: H,
    title: `A year of commits as a Sharingan: ${data.total} commits on ${data.lit} days`,
    desc: `Each of the ${WEEKS * 7} points is one day of the last year, arranged as 53 weekly spokes and 7 daily rings around Sasuke’s turning Mangekyō Sharingan. Brighter points mean more commits. Longest streak ${data.longest} days, busiest day ${data.max} commits.`,
    css: CSS,
    body: sceneFrame(W, H, inner),
  });
}
