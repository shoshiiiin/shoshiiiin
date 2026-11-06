// Four paths: what I build, told through four characters.
// Itachi = illusion (design, motion), Sasuke = one clean strike (fast systems),
// Naruto = shadow clones (agents, many apps), Sakura = healing (tests, security).

import { card, header, sceneFrame, STAGE_GRADIENT } from '../lib/frame.mjs';
import { C } from '../lib/palette.mjs';
import { LIGHTNING_CSS, rimArc, strike, strikes } from '../lib/lightning.mjs';
import { between, rng } from '../lib/rng.mjs';
import { PETAL, crow, glowGradient, itachiMangekyo, rippleEye, sasukeMangekyo, spiralPoints } from '../lib/shapes.mjs';
import { at, doc, f, style } from '../lib/svg.mjs';

const W = 1280;
const H = 850;
const CW = 612;
const CH = 330;
const GAP = 24;
const TOP = 152;

const CSS = `
.turn{animation:turn 40s linear infinite}
.turn-fast{animation:turn 1.6s linear infinite}
.turn-r{animation:turn 60s linear infinite reverse}
.ring-3{animation:turn 30s linear infinite}
.ring-2{animation:turn 45s linear infinite reverse}
.orbit{animation:turn 16s linear infinite}
@keyframes turn{to{transform:rotate(360deg)}}
.spin{animation:spin 12s cubic-bezier(.45,0,.55,1) infinite}
@keyframes spin{0%{transform:rotate(0)}70%{transform:rotate(120deg)}82%{transform:rotate(600deg)}100%{transform:rotate(720deg)}}
.wing{transform-origin:50% 100%;animation:flapw .4s ease-in-out infinite alternate}
.wb{animation-delay:-.2s}
@keyframes flapw{to{transform:scaleY(-.65)}}
${LIGHTNING_CSS}
.breath{animation:breath 3.4s ease-in-out infinite}
@keyframes breath{50%{opacity:.55}}
.clone{animation:clone 4.8s ease-in-out infinite}
@keyframes clone{0%,8%{opacity:0;transform:scale(.4)}16%,62%{opacity:.75;transform:scale(1)}70%,100%{opacity:0;transform:scale(1.25)}}
.puff{animation:puff 4.8s ease-out infinite}
@keyframes puff{0%,6%{opacity:0;transform:scale(.3)}12%{opacity:.6}24%,100%{opacity:0;transform:scale(1.5)}}
.heal{animation:heal 3.6s ease-out infinite}
@keyframes heal{from{opacity:.75;transform:scale(.35)}to{opacity:0;transform:scale(1.35)}}
.seal{animation:seal 3.6s ease-in-out infinite}
@keyframes seal{50%{opacity:.6;transform:rotate(45deg) scale(.9)}}
.drift{animation:drift var(--t) ease-in var(--d) infinite}
@keyframes drift{0%{transform:translate(0,0) rotate(0);opacity:0}15%{opacity:.9}100%{transform:translate(var(--dx),var(--dy)) rotate(var(--r));opacity:0}}
.rise{animation:rise 1.4s cubic-bezier(.2,.7,.2,1) var(--d) both}
@keyframes rise{from{opacity:0;transform:translateY(24px)}}
.scan{animation:scan 6s cubic-bezier(.6,0,.4,1) infinite}
@keyframes scan{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}
`;

/** Itachi: his Mangekyō Sharingan, turning, with three orbiting crows. */
function itachiEmblem() {
  const crows = [0, 120, 240]
    .map((deg) => `<g transform="rotate(${deg}) translate(0 -120) rotate(90) scale(.72)">${crow(C.shadow)}</g>`)
    .join('');
  return `<circle r="112" fill="url(#g-blood)" class="breath"/>
<circle r="86" fill="url(#iris-blood)"/>
<circle r="86" fill="none" stroke="${C.bloodHi}" stroke-width="1" opacity=".6"/>
<g class="spin">${itachiMangekyo(86, '#150004')}</g>
<g class="turn-r"><circle r="120" fill="none" stroke="${C.line2}" stroke-dasharray="2 8"/></g>
<g class="orbit">${crows}</g>`;
}

const EYE_GAP = 64;

/**
 * One strike of Chidori around Sasuke's eyes: an arc crawling along each rim, a bolt
 * bridging the eyes over the top or the bottom, a short bolt off one outer side.
 */
function chidoriAround(r0, R) {
  const rims = [-1, 1].map((side) => {
    const from = between(r0, 0, 360);
    const arc = rimArc(r0, R + 5, from, from + between(r0, 70, 140), { jag: 4.5, forks: 2, reach: 22 });
    const move = ([x, y]) => [x + side * EYE_GAP, y];
    return { main: arc.main.map(move), forks: arc.forks.map((fork) => fork.map(move)) };
  });
  const rimPoint = (side, deg) => [side * EYE_GAP + Math.cos((deg * Math.PI) / 180) * (R + 3), Math.sin((deg * Math.PI) / 180) * (R + 3)];
  const over = r0() < 0.5 ? -1 : 1;
  const bridge = strike(r0, rimPoint(-1, over * 40), rimPoint(1, over * 140), { levels: 4, roughness: 0.3, forks: 1, reach: 0.5 });
  const side = r0() < 0.5 ? -1 : 1;
  const deg = (side < 0 ? 180 : 0) + between(r0, -35, 35);
  const a = rimPoint(side, deg);
  const rad = (deg * Math.PI) / 180;
  const len = between(r0, 18, 28);
  const outer = strike(r0, a, [a[0] + Math.cos(rad) * len, a[1] + Math.sin(rad) * len], { levels: 3, roughness: 0.32, forks: 1, reach: 0.6 });
  return [...rims, bridge, outer];
}

/**
 * Sasuke's two eyes: the Mangekyō Sharingan (his right, on our left) and the Rinnegan
 * with six tomoe (his left), Chidori crackling between them.
 */
function sasukeEmblem(r0, ts) {
  const R = 56;
  const variants = Array.from({ length: 7 }, () => chidoriAround(r0, R));
  const mangekyo = `<g transform="translate(${-EYE_GAP} 0)">
<circle r="${R + 16}" fill="url(#g-blood)" class="breath"/>
<g class="spin">${sasukeMangekyo(R, 'ems-card')}</g>
<circle r="${R}" fill="none" stroke="${C.bloodHi}" stroke-width="1" opacity=".7"/></g>`;
  const rinnegan = `<g transform="translate(${EYE_GAP} 0)">
<circle r="${R + 16}" fill="url(#g-chidori)" class="breath"/>
<circle r="${R}" fill="url(#iris-violet)"/>
${rippleEye(R, { rings: 5, tomoeRings: [2, 3], line: '#3a2575', tomoe: '#1a0b3a', head: 4.4 })}
<circle r="4" fill="#1a0b3a"/>
<circle r="${R}" fill="none" stroke="${C.violetHi}" stroke-width="1" opacity=".8"/></g>`;
  const labels = `${ts.text('kanji', '万華鏡', { x: -EYE_GAP, y: R + 34, 'font-size': 15, 'letter-spacing': 3, fill: C.bloodHi, 'text-anchor': 'middle', opacity: 0.85 })}${ts.text('kanji', '輪廻眼', { x: EYE_GAP, y: R + 34, 'font-size': 15, 'letter-spacing': 3, fill: C.violetHi, 'text-anchor': 'middle', opacity: 0.85 })}`;
  return `${mangekyo}${rinnegan}${strikes(variants, { id: 'chs', color: C.chidori, core: C.chidoriCore, r: r0, period: [1, 1.4] })}${labels}`;
}

/** Naruto: a Rasengan of spiral light, with shadow clones popping in and out. */
function narutoEmblem(r0) {
  const dots = (pts) =>
    pts.map((p) => `<circle${at({ cx: p.x, cy: p.y, r: p.s, fill: C.chakraHi, opacity: p.o })}/>`).join('');
  const orb = (scale) =>
    `<g transform="scale(${scale})"><circle r="70" fill="url(#g-chakra)"/><g class="turn-fast">${dots(spiralPoints(r0, { outer: 62 }))}</g><circle r="64" fill="none" stroke="${C.chakra}" stroke-width="1.2" opacity=".7"/><circle r="10" fill="#fff6e0"/></g>`;
  const clones = [-1, 1]
    .map(
      (side, i) =>
        `<g transform="translate(${side * 92} ${18})"><g class="a clone" style="animation-delay:${i * 0.5}s">${orb(0.52)}</g><circle r="30" fill="none" stroke="${C.ink2}" stroke-width="1.2" stroke-dasharray="3 5" class="a puff" style="animation-delay:${i * 0.5}s"/></g>`,
    )
    .join('');
  return `<circle r="120" fill="url(#g-chakra)" opacity=".5" class="breath"/>${clones}${orb(1)}`;
}

/** Sakura: the diamond seal, a turning blossom, healing rings, drifting petals. */
function sakuraEmblem(r0) {
  const blossom = [0, 72, 144, 216, 288]
    .map((deg) => `<path d="${PETAL}" transform="rotate(${deg}) translate(0 -34) scale(2.6)" fill="url(#petal)" opacity=".9"/>`)
    .join('');
  const rings = [0, 1, 2]
    .map((i) => `<circle r="92" fill="none" stroke="${C.heal}" stroke-width="1.4" class="a heal" style="animation-delay:${i * 1.2}s"/>`)
    .join('');
  const drift = Array.from({ length: 9 }, () => {
    const vars = { '--t': `${f(between(r0, 4, 7))}s`, '--d': `${f(-between(r0, 0, 7))}s`, '--dx': `${f(between(r0, 60, 150))}px`, '--dy': `${f(between(r0, 60, 140))}px`, '--r': `${f(between(r0, 180, 540))}deg` };
    return `<g transform="translate(${f(between(r0, -60, 40))} ${f(between(r0, -80, 20))})"><path d="${PETAL}" fill="url(#petal)" class="a drift" style="${style(vars)}"/></g>`;
  }).join('');
  return `<circle r="116" fill="url(#g-heal)" opacity=".55" class="breath"/>${rings}
<g class="turn">${blossom}</g>
<circle r="18" fill="#2a0f2a"/>
<rect x="-11" y="-11" width="22" height="22" fill="${C.violetHi}" transform="rotate(45)" class="a seal"/>
<rect x="-5" y="-5" width="10" height="10" fill="#fff" transform="rotate(45)" opacity=".85"/>${drift}`;
}

function paths(data) {
  return [
    {
      who: 'ITACHI', kanji: '月読', title: 'Genjutsu', accent: C.bloodHi, emblem: itachiEmblem,
      lines: ['Interfaces that feel like an', 'illusion. Motion with a reason,', 'depth with restraint.'],
      tags: ['GSAP', 'three.js', 'SwiftUI'],
    },
    {
      who: 'SASUKE', kanji: '千鳥', title: 'Chidori', accent: C.chidori, emblem: sasukeEmblem,
      lines: ['One strike, no wasted motion.', 'Lean bundles, edge functions,', 'systems that answer fast.'],
      tags: ['Workers', 'Supabase', 'Postgres'],
    },
    {
      who: 'NARUTO', kanji: '影分身', title: 'Kage Bunshin', accent: C.chakra, emblem: narutoEmblem,
      lines: ['Never give up, ship in parallel.', `A swarm of agents, ${data.repos} repos`, 'in flight this year.'],
      tags: ['Claude', 'Agents', 'Next.js'],
    },
    {
      who: 'SAKURA', kanji: '百豪', title: 'Byakugō', accent: C.petal, emblem: sakuraEmblem,
      lines: ['Heal what breaks. Tests first,', 'security audits, accessibility', 'that holds.'],
      tags: ['Playwright', 'Vitest', 'WCAG 2.2'],
    },
  ];
}

function pathCard(ts, r0, p, i) {
  const x = GAP / 1.5 + (i % 2) * (CW + GAP);
  const y = TOP + Math.floor(i / 2) * (CH + GAP);
  const ex = x + 158;
  const ey = y + CH / 2;
  const tx = x + 306;
  let chipX = tx;
  const chips = p.tags
    .map((tag) => {
      const w = [...tag].length * 0.6 * 15 + 24;
      const out = `<rect x="${f(chipX)}" y="${y + 262}" width="${f(w)}" height="30" fill="none" stroke="${C.line2}"/>${ts.text('mono', tag, { x: f(chipX + 12), y: y + 282, 'font-size': 15, fill: C.ink2 })}`;
      chipX += w + 10;
      return out;
    })
    .join('');
  return `<g class="rise" style="--d:${f(0.15 * i)}s">
${card(x, y, CW, CH, p.accent)}
${ts.text('kanji', p.kanji, { x: x + CW - 28, y: y + 92, 'font-size': 72, fill: p.accent, opacity: 0.12, 'text-anchor': 'end' })}
<g transform="translate(${ex} ${ey})">${p.emblem(r0, ts)}</g>
${ts.text('mono', `${p.who} · ${p.kanji}`, { x: tx, y: y + 64, 'font-size': 16, 'letter-spacing': 4, fill: p.accent })}
${ts.text('display', p.title, { x: tx, y: y + 116, 'font-size': 44, fill: C.ink })}
${p.lines.map((line, k) => ts.text('text', line, { x: tx, y: y + 162 + k * 30, 'font-size': 21, fill: C.ink2 })).join('')}
${chips}
</g>`;
}

function defs() {
  const iris = (id, a, b, c) => `<radialGradient id="${id}"><stop offset="0" stop-color="${a}"/><stop offset=".7" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient>`;
  return `<defs>${STAGE_GRADIENT}
${glowGradient('g-blood', C.blood, { inner: 0.45, mid: 0.14 })}
${glowGradient('g-chidori', C.violet, { inner: 0.4, mid: 0.12 })}
${glowGradient('g-chakra', C.chakra, { inner: 0.75, mid: 0.25 })}
${glowGradient('g-heal', C.heal, { inner: 0.3, mid: 0.1 })}
${iris('iris-blood', '#ff4a52', C.moon, '#5e0614')}
${iris('iris-violet', '#cbb8ff', '#8f78d8', '#4b3596')}
<radialGradient id="petal" fx=".5" fy=".3"><stop offset="0" stop-color="#fff0f6"/><stop offset=".6" stop-color="${C.petal}"/><stop offset="1" stop-color="${C.petalDeep}"/></radialGradient>
</defs>`;
}

/** @param {{repos: number}} data @param {ReturnType<import('../lib/type.mjs').createTypeset>} ts */
export function team(data, ts) {
  const r0 = rng(7);
  const inner = `${defs()}
${header(ts, { x: 40, y: 58, kanji: '四道', label: 'FOUR PATHS · HOW I BUILD', title: 'One village, four ways to fight', accent: C.bloodHi })}
<path d="M40 136H${W - 40}" stroke="${C.line}"/><path d="M40 136H${W - 40}" pathLength="1000" stroke="${C.bloodHi}" stroke-width="1.4" stroke-dasharray="50 950" class="scan"/>
${paths(data).map((p, i) => pathCard(ts, r0, p, i)).join('')}`;
  return doc({
    width: W,
    height: H,
    title: 'Four paths: Itachi, Sasuke, Naruto, Sakura',
    desc: 'Four cards. Itachi stands for interfaces and motion, Sasuke for fast systems, Naruto for agents and shipping in parallel, Sakura for tests, security and accessibility.',
    css: CSS,
    body: sceneFrame(W, H, inner),
  });
}
