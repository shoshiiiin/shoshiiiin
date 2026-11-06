// Closing scene: after the long night, the dawn. Akatsuki means daybreak.
// Naruto is the rising sun with his spiral, Sakura's petals blow in, Team 7 stands
// against the light, and Itachi's crows fly off into the morning.

import { teamFromBehind } from '../lib/figures.mjs';
import { sceneFrame } from '../lib/frame.mjs';
import { C } from '../lib/palette.mjs';
import { between, rng } from '../lib/rng.mjs';
import { PETAL, crow, glowGradient, spiralPoints } from '../lib/shapes.mjs';
import { at, doc, f, polar, style } from '../lib/svg.mjs';

const W = 1280;
const H = 600;
const SUN = { x: 640, y: 446, r: 122 };
const CREST = 506;

const CSS = `
.rise{animation:rise 3.2s cubic-bezier(.2,.7,.2,1) both}
@keyframes rise{from{transform:translateY(70px)}}
.turn{animation:turn 60s linear infinite}
.turn-slow{animation:turn 180s linear infinite}
@keyframes turn{to{transform:rotate(360deg)}}
.breath{animation:breath 6s ease-in-out infinite}
@keyframes breath{50%{opacity:.7}}
.fly{animation:fly var(--t) linear var(--d) infinite}
@keyframes fly{0%{transform:translate(var(--x0),var(--y0)) scale(1);opacity:0}8%{opacity:1}85%{opacity:1}100%{transform:translate(var(--x1),var(--y1)) scale(.35);opacity:0}}
.wing{transform-origin:50% 100%;animation:flapw .44s ease-in-out infinite alternate}
.wb{animation-delay:-.22s}
@keyframes flapw{to{transform:scaleY(-.65)}}
.fall{animation:fall var(--t) linear var(--d) infinite}
@keyframes fall{from{transform:translate(-60px,var(--y0)) rotate(0)}to{transform:translate(${W + 60}px,var(--y1)) rotate(var(--r))}}
.flip{animation:flip var(--f) ease-in-out infinite alternate}
@keyframes flip{to{transform:scaleX(-.25) rotate(25deg)}}
.fadein{animation:fadein 2.4s ease-out var(--d) both}
@keyframes fadein{from{opacity:0}}
.shimmer{animation:shimmer 4s ease-in-out infinite}
@keyframes shimmer{50%{opacity:.45}}
`;

function sky() {
  return `<rect width="${W}" height="${H}" fill="url(#dawn)"/>
<circle cx="${SUN.x}" cy="${SUN.y}" r="${SUN.r * 3.6}" fill="url(#g-sun)" class="breath"/>`;
}

function rays() {
  let d = '';
  for (let i = 0; i < 36; i++) {
    const deg = (i / 36) * 360;
    const [x1, y1] = polar(0, 0, SUN.r + 22, deg);
    const [x2, y2] = polar(0, 0, SUN.r + (i % 3 === 0 ? 420 : 260), deg);
    d += `M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`;
  }
  return `<g transform="translate(${SUN.x} ${SUN.y})"><g class="turn-slow"><path d="${d}" stroke="${C.chakraHi}" stroke-width="1" opacity=".22"/></g>
<g class="turn"><circle r="${SUN.r + 40}" fill="none" stroke="${C.chakraHi}" stroke-dasharray="2 10" opacity=".4"/></g></g>`;
}

function sun(r0) {
  const spiral = spiralPoints(r0, { arms: 1, perArm: 70, inner: 5, outer: SUN.r - 14, turns: 2.4 })
    .map((p) => `<circle${at({ cx: p.x, cy: p.y, r: 1.2 + p.s, fill: '#d9481f', opacity: 0.25 + p.o * 0.4 })}/>`)
    .join('');
  return `<g class="rise"><circle cx="${SUN.x}" cy="${SUN.y}" r="${SUN.r}" fill="url(#sun)"/>
<g transform="translate(${SUN.x} ${SUN.y})"><g class="turn">${spiral}</g></g></g>`;
}

/** Mountains, lower near the middle so the sun stands free behind Team 7. */
function ridge(r0, base, amp, color, step) {
  let d = `M0 ${H}L0 ${base}`;
  for (let x = 0; x <= W; x += step) {
    const open = Math.min(1, Math.abs(x - SUN.x) / 300) ** 1.6;
    d += `L${x} ${f(base - (Math.abs(Math.sin(x / 170 + base)) * amp + between(r0, 0, amp * 0.25)) * (0.25 + 0.75 * open))}`;
  }
  return `<path d="${d}L${W} ${H}Z" fill="${color}"/>`;
}

function hill() {
  const d = `M0 ${H}V560Q320 548 520 ${CREST + 6}Q640 ${CREST - 8} 760 ${CREST + 6}Q960 548 ${W} 560V${H}Z`;
  const rim = `M300 552Q440 528 520 ${CREST + 6}Q640 ${CREST - 8} 760 ${CREST + 6}Q840 528 980 552`;
  return `<path d="${d}" fill="#0a0612"/><path d="${rim}" fill="none" stroke="${C.chakraHi}" stroke-width="1.4" opacity=".75" class="shimmer"/>`;
}

function team(art) {
  if (art) {
    const height = 196;
    const width = (height * art.w) / art.h;
    return `<image${at({ href: art.uri, x: SUN.x - width / 2, y: CREST + 4 - height, width, height })}/>`;
  }
  const at7 = `translate(${SUN.x} ${CREST + 2}) scale(1.75)`;
  return `<g transform="${at7}"><g stroke="${C.chakraHi}" stroke-width="2" stroke-linejoin="round" opacity=".9">${teamFromBehind('none')}</g>${teamFromBehind('#0a0612')}</g>`;
}

function crows(r0) {
  let out = '';
  for (let i = 0; i < 7; i++) {
    const t = between(r0, 9, 15);
    const vars = {
      '--x0': `${f(between(r0, 120, 520))}px`, '--y0': `${f(between(r0, 300, 420))}px`,
      '--x1': `${f(between(r0, 900, 1200))}px`, '--y1': `${f(between(r0, 60, 180))}px`,
      '--t': `${f(t)}s`, '--d': `${f(-between(r0, 0, t))}s`,
    };
    out += `<g class="fly" style="${style(vars)}" transform="translate(${f(between(r0, 500, 900))} ${f(between(r0, 160, 300))})"><g transform="scale(${f(between(r0, 0.5, 0.85))})">${crow('#120814')}</g></g>`;
  }
  return out;
}

function petals(r0) {
  let out = '';
  for (let i = 0; i < 34; i++) {
    const t = between(r0, 9, 18);
    const y0 = between(r0, 60, 520);
    const vars = {
      '--y0': `${f(y0)}px`, '--y1': `${f(y0 + between(r0, 40, 160))}px`, '--r': `${f(between(r0, 300, 900))}deg`,
      '--t': `${f(t)}s`, '--d': `${f(-between(r0, 0, t))}s`, '--f': `${f(between(r0, 0.8, 2))}s`,
    };
    out += `<g class="fall" style="${style(vars)}" transform="translate(${f(between(r0, 0, W))} ${f(y0)})"><g transform="scale(${f(between(r0, 0.6, 1.3))})"><path d="${PETAL}" fill="url(#petal)" opacity="${f(between(r0, 0.6, 1))}" class="a flip"/></g></g>`;
  }
  return out;
}

/** @param {any} data @param {ReturnType<import('../lib/type.mjs').createTypeset>} ts */
export function dawn(data, ts) {
  const r0 = rng(4242);
  const handle = data.profile.handle.toUpperCase();
  const inner = `<defs>
<linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.bg}"/><stop offset=".34" stop-color="#170a2c"/><stop offset=".58" stop-color="#4a1430"/><stop offset=".76" stop-color="#b8402e"/><stop offset=".86" stop-color="#ff8a3c"/></linearGradient>
${glowGradient('g-sun', C.chakra, { inner: 0.6, mid: 0.2 })}
<radialGradient id="sun" fx=".5" fy=".42"><stop offset="0" stop-color="#fffbe8"/><stop offset=".5" stop-color="${C.chakraHi}"/><stop offset="1" stop-color="${C.chakra}"/></radialGradient>
<radialGradient id="petal" fx=".5" fy=".3"><stop offset="0" stop-color="#fff0f6"/><stop offset=".6" stop-color="${C.petal}"/><stop offset="1" stop-color="${C.petalDeep}"/></radialGradient>
</defs>
${sky()}
${rays()}
${sun(r0)}
${ridge(r0, 500, 70, '#3b1530', 24)}
${ridge(r0, 536, 46, '#1e0b22', 18)}
${hill()}
${team(data.art?.team7)}
${crows(r0)}
<g class="fadein" style="--d:.4s">
${ts.text('kanji', '暁', { x: W / 2, y: 78, 'font-size': 34, fill: C.chakraHi, 'text-anchor': 'middle' })}
${ts.text('italic', 'After the long night, the dawn.', { x: W / 2, y: 148, 'font-size': 54, fill: C.ink, 'text-anchor': 'middle' })}
${ts.text('mono', 'AKATSUKI MEANS DAYBREAK · LET’S BUILD SOMETHING', { x: W / 2, y: 192, 'font-size': 16, 'letter-spacing': 4, fill: C.ink2, 'text-anchor': 'middle' })}
</g>
${ts.text('mono', `GITHUB.COM/${handle}`, { x: W / 2, y: 578, 'font-size': 15, 'letter-spacing': 4, fill: C.ink3, 'text-anchor': 'middle' })}
${petals(r0)}`;
  return doc({
    width: W,
    height: H,
    title: 'After the long night, the dawn',
    desc: 'A sun with a spiral rises behind three figures on a hill, Naruto, Sakura and Sasuke seen from behind. Crows fly away into the morning, cherry blossom petals blow across.',
    css: CSS,
    body: sceneFrame(W, H, inner),
  });
}
