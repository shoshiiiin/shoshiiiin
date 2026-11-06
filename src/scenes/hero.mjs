// Hero: Tsukuyomi. The moon slowly reveals half Rinne Sharingan, half Rinnegan; Itachi and Sasuke
// stand on either side, a Lichtfeld thread pulses between their eyes, crows dissolve
// into feathers, Sakura's petals drift through, Amaterasu burns at Sasuke's feet.

import { figureDefs, itachi, rasterFigure, sasuke } from '../lib/figures.mjs';
import { C, FRAME } from '../lib/palette.mjs';
import { between, rng } from '../lib/rng.mjs';
import { HOLOGRAM_CSS, susanooHologram } from '../lib/hologram.mjs';
import { LIGHTNING_CSS, strike, strikes } from '../lib/lightning.mjs';
import { PETAL, crow, glowGradient, rippleEye, tickRing } from '../lib/shapes.mjs';
import { at, doc, f, style } from '../lib/svg.mjs';
import { MONO_ADVANCE } from '../lib/type.mjs';

const W = 1280;
const H = 640;
const MOON = { x: 640, y: 262, r: 172 };
const ITACHI_AT = { x: 320, y: 552, s: 0.92 };
const SASUKE_AT = { x: 996, y: 566, s: 1.0 };
// Each Susanoo stands with its face right above its brother's head. Itachi is a little
// smaller and further right than he would be alone, so his Susanoo's face clears his
// head and its wings clear the corner label; tags sit on the outer side of each frame.
const SUSANOO_BOX = { top: 22, height: 460 };
const SUSANOO = { itachi: { side: 'left' }, sasuke: { side: 'right' } };
// The roof was drawn for Itachi standing at x 286; it moves with him.
const ROOF_SHIFT = ITACHI_AT.x - 286;
// Roles cycle: four slots of 4 s; a role types out during the first 8 % of the cycle.
const CYCLE = 16;
const SLOT = 4;
const TYPE_SHARE = 0.08;

const CSS = `
.rise{animation:rise 2.4s cubic-bezier(.2,.7,.2,1) both}
@keyframes rise{from{opacity:0;transform:translateY(46px)}}
.fadein{animation:fadein 2s ease-out both}
@keyframes fadein{from{opacity:0}}
.breath{animation:breath 7s ease-in-out infinite}
@keyframes breath{50%{opacity:.62}}
.reveal{animation:reveal 3.4s ease-in 1.2s both}
@keyframes reveal{from{opacity:0}}
.ring-2{animation:turn 46s linear infinite}
.ring-3{animation:turn 70s linear infinite reverse}
.ring-4{animation:turn 110s linear infinite}
.flash{animation:flash 16s ease-out 3s infinite}
@keyframes flash{0%{opacity:0}4%{opacity:.4}22%,100%{opacity:0}}
.wave{animation:wave 16s cubic-bezier(.2,.6,.3,1) 3s infinite}
@keyframes wave{0%{opacity:0;transform:scale(1)}3%{opacity:.8}30%{opacity:0;transform:scale(4.6)}100%{opacity:0;transform:scale(4.6)}}
.turn{animation:turn 140s linear infinite}
.turn-r{animation:turn 200s linear infinite reverse}
@keyframes turn{to{transform:rotate(360deg)}}
.drift{animation:drift 34s ease-in-out infinite alternate}
@keyframes drift{from{transform:translateX(-70px)}to{transform:translateX(70px)}}
.pulse{animation:pulse 5.5s cubic-bezier(.5,0,.5,1) infinite}
.pulse-back{animation:pulseback 8s cubic-bezier(.5,0,.5,1) 2s infinite}
@keyframes pulse{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}
@keyframes pulseback{from{stroke-dashoffset:0}to{stroke-dashoffset:1000}}
.blink{animation:blink 6.5s infinite}
@keyframes blink{0%,46%,50%,100%{transform:scaleY(1)}48%{transform:scaleY(.1)}}
.eyeglow{animation:eyeglow 3.2s ease-in-out infinite}
@keyframes eyeglow{50%{opacity:.45}}
.hem{transform-origin:50% 0;animation:hem 2.6s ease-in-out infinite}
@keyframes hem{0%,100%{transform:skewX(-7deg)}50%{transform:skewX(5deg) scaleY(1.06)}}
.flap{transform-origin:50% 0;animation:hem 1.9s ease-in-out infinite}
.cloud{animation:cloud 4s ease-in-out infinite}
@keyframes cloud{50%{opacity:.55}}
.edge{animation:eyeglow .9s steps(2) infinite}
.fly{animation:fly var(--t) linear var(--d) infinite}
@keyframes fly{0%{transform:translate(var(--x0),var(--y0));opacity:0}6%{opacity:1}50%{transform:translate(var(--xm),var(--ym))}82%{opacity:1}88%{transform:translate(var(--x1),var(--y1));opacity:0}100%{transform:translate(var(--x1),var(--y1));opacity:0}}
.burst{animation:burst var(--t) ease-out var(--d) infinite}
@keyframes burst{0%,86%{opacity:0;transform:translate(0,0) scale(.3)}89%{opacity:1}100%{opacity:0;transform:translate(var(--bx),var(--by)) scale(1)}}
.wing{transform-origin:50% 100%;animation:flapw .42s ease-in-out infinite alternate}
.wb{animation-delay:-.21s}
@keyframes flapw{to{transform:scaleY(-.65)}}
.fall{animation:fall var(--t) linear var(--d) infinite}
@keyframes fall{from{transform:translate(var(--x0),-40px) rotate(0)}to{transform:translate(var(--x1),${H + 40}px) rotate(var(--r))}}
.flip{animation:flip var(--f) ease-in-out infinite alternate}
@keyframes flip{to{transform:scaleX(-.25) rotate(25deg)}}
.flame{transform-box:fill-box;transform-origin:50% 100%;animation:flame var(--t) ease-in-out var(--d) infinite alternate}
@keyframes flame{0%{transform:scaleY(.82) skewX(-6deg)}100%{transform:scaleY(1.16) skewX(7deg)}}
.ember{animation:ember var(--t) linear var(--d) infinite}
@keyframes ember{0%{transform:translate(0,0);opacity:0}15%{opacity:1}100%{transform:translate(var(--ex),-150px);opacity:0}}
.role{animation:role 16s linear infinite}
@keyframes role{0%,24.9%{opacity:1}25%,100%{opacity:0}}
.ch{animation:ch 16s linear infinite backwards}
@keyframes ch{0%{opacity:0}.2%,23%{opacity:1}23.2%,100%{opacity:0}}
.caret{animation:caret 16s infinite backwards}
@keyframes caret{0%{transform:translateX(0)}8%,100%{transform:translateX(var(--w))}}
.cblink{animation:cblink .9s steps(1) infinite}
@keyframes cblink{50%{opacity:0}}
.scan{animation:pulse 7s cubic-bezier(.6,0,.4,1) 2.5s infinite}
`;

function sky() {
  return `<rect width="${W}" height="${H}" fill="${C.bg}"/>
<rect width="${W}" height="${H}" fill="url(#sky)"/>
<circle cx="${MOON.x}" cy="${MOON.y}" r="${MOON.r * 2.3}" fill="url(#moonglow)" class="breath"/>
<circle cx="${MOON.x + MOON.r * 0.55}" cy="${MOON.y}" r="${MOON.r * 1.8}" fill="url(#moonglow-v)" class="breath"/>`;
}

function atlas() {
  const { x, y, r } = MOON;
  return `<g opacity=".9">
<circle cx="${x}" cy="${y}" r="${r + 22}" fill="none" stroke="${C.line2}" stroke-width="1"/>
<g transform="translate(${x} ${y})"><g class="turn">${tickRing(0, 0, r + 34, { count: 120, every: 10, short: 4, long: 11, stroke: C.line2, width: 1 })}</g></g>
<g transform="translate(${x} ${y})"><g class="turn-r"><circle r="${r + 74}" fill="none" stroke="${C.line}" stroke-width="1" stroke-dasharray="2 9"/>${tickRing(0, 0, r + 74, { count: 12, every: 1, long: 14, stroke: C.line2, width: 1 })}</g></g>
<path d="M${x - r - 120} ${y}H${x - r - 50}M${x + r + 50} ${y}H${x + r + 120}" stroke="${C.line2}" stroke-width="1"/>
</g>`;
}

function moon(r0) {
  const { x, y, r } = MOON;
  const craters = Array.from({ length: 9 }, () => {
    const a = between(r0, 0, Math.PI * 2);
    const d = between(r0, 0.15, 0.82) * r;
    return `<circle${at({ cx: x + Math.cos(a) * d, cy: y + Math.sin(a) * d, r: between(r0, 6, 24), fill: '#000', opacity: between(r0, 0.06, 0.16) })}/>`;
  }).join('');
  const bands = [
    { y: y - 70, w: 420, h: 18, o: 0.5 },
    { y: y + 40, w: 520, h: 26, o: 0.62 },
    { y: y + 112, w: 360, h: 14, o: 0.45 },
  ]
    .map(
      (b, i) =>
        `<g class="drift" style="animation-delay:${-i * 9}s"><ellipse${at({ cx: x + (i - 1) * 80, cy: b.y, rx: b.w / 2, ry: b.h / 2, fill: C.bg, opacity: b.o })}/></g>`,
    )
    .join('');
  // Itachi's side is the Rinne Sharingan in red, Sasuke's the Rinnegan in violet; the
  // nine tomoe of the Infinite Tsukuyomi turn over both halves.
  const halves = [
    { clip: 'half-l', fill: 'url(#moon)', flash: C.bloodHi, eye: { rings: 4, tomoeRings: [], line: '#2a0006', tomoe: '#1c0005' } },
    { clip: 'half-r', fill: 'url(#moon-v)', flash: C.violetHi, eye: { rings: 4, tomoeRings: [], line: '#1e0c4a', tomoe: '#1e0c4a' } },
  ];
  const disc = halves.map((h) => `<g clip-path="url(#${h.clip})"><circle cx="${x}" cy="${y}" r="${r}" fill="${h.fill}"/></g>`).join('');
  const eyes = halves
    .map((h) => `<g clip-path="url(#${h.clip})"><g transform="translate(${x} ${y})">${rippleEye(r * 0.98, h.eye)}</g></g>`)
    .join('');
  const tomoe = `<g transform="translate(${x} ${y})">${rippleEye(r * 0.98, { rings: 4, tomoeRings: [2, 3, 4], line: 'none', tomoe: '#160008', head: r * 0.056, lines: false })}</g>`;
  const flash = halves
    .map((h) => `<g clip-path="url(#${h.clip})"><circle cx="${x}" cy="${y}" r="${r}" fill="${h.flash}" opacity="0" class="flash"/></g>`)
    .join('');
  const seam = `<path d="M${x} ${y - r - 22}V${y + r + 22}" stroke="${C.ink}" stroke-width="1" opacity=".4"/>`;
  return `<g class="rise">
${disc}
${craters}
<g class="reveal">${eyes}${tomoe}<circle cx="${x}" cy="${y}" r="${f(r * 0.12)}" fill="#12001c"/></g>
${seam}
${flash}
${bands}
</g>
<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${C.bloodHi}" stroke-width="2.4" opacity="0" class="a wave"/>`;
}

/**
 * The brothers, drawn or generated. Generated images (src/art) replace the drawn
 * silhouettes; eyes, the thread and Chidori follow their anchors.
 */
function cast(data) {
  const it = data.art?.itachi;
  const sa = data.art?.sasuke;
  const height = 400;
  const drawnHand = [SASUKE_AT.x - 84 * SASUKE_AT.s, SASUKE_AT.y - 162 * SASUKE_AT.s];
  const itachiFig = it
    ? rasterFigure(it, { x: ITACHI_AT.x, y: ITACHI_AT.y, height: height * ITACHI_AT.s }, [C.bloodHi])
    : { markup: `<g transform="translate(${ITACHI_AT.x} ${ITACHI_AT.y}) scale(${ITACHI_AT.s})">${itachi()}</g>`, eye: [ITACHI_AT.x, ITACHI_AT.y - 299 * ITACHI_AT.s] };
  const sasukeFig = sa
    ? rasterFigure(sa, { x: SASUKE_AT.x, y: SASUKE_AT.y, height: height * SASUKE_AT.s }, [C.bloodHi, C.violetHi])
    : { markup: `<g transform="translate(${SASUKE_AT.x} ${SASUKE_AT.y}) scale(${SASUKE_AT.s})">${sasuke()}</g>`, eye: [SASUKE_AT.x - 13 * SASUKE_AT.s, SASUKE_AT.y - 300 * SASUKE_AT.s], hand: drawnHand };
  return {
    itachi: { ...itachiFig, head: itachiFig.head ?? itachiFig.eye },
    sasuke: { ...sasukeFig, head: sasukeFig.head ?? sasukeFig.eye, hand: sasukeFig.hand ?? drawnHand },
  };
}

/**
 * The brothers' Susanoo: generated images floating as holograms behind them, framed in
 * Lichtfeld light. They take turns to stand out. Without images there is no Susanoo.
 */
function susanoos(data, ts, r0, brothers) {
  const layer = (name, who, colors, phase, start, tag) => {
    const art = data.art?.[name];
    if (!art) return '';
    const place = { cx: overHead(art, brothers[who].head), side: SUSANOO[who].side };
    return susanooHologram(art, { id: name, ...SUSANOO_BOX, ...place, ...colors, phase, start, tag }, ts, r0);
  };
  return (
    layer('itachi-susanoo', 'itachi', { line: C.bloodHi, hot: '#ffb08a' }, 0, 1.2, '須佐能乎 01') +
    layer('sasuke-susanoo', 'sasuke', { line: C.violet, hot: C.chidori }, -7, 1.6, '須佐能乎 02')
  );
}

/** The x that puts a Susanoo's face (anchor "face", else its middle) above a head. */
function overHead(art, [headX]) {
  const width = (SUSANOO_BOX.height * art.w) / art.h;
  const face = art.anchors?.face?.[0] ?? 0.5;
  return headX - (face - 0.5) * width;
}

/** The bond between the brothers: a Lichtfeld thread from eye to eye. */
function thread([ix, iy], [sx, sy]) {
  const ia = { x: ix, y: iy };
  const sa = { x: sx, y: sy };
  const d = `M${f(ia.x)} ${f(ia.y)}C${f(ia.x + 110)} 8 ${f(sa.x - 110)} 8 ${f(sa.x)} ${f(sa.y)}`;
  return `<path d="${d}" fill="none" stroke="${C.bloodHi}" stroke-width="1" opacity=".32" class="fadein"/>
<path d="${d}" pathLength="1000" fill="none" stroke="${C.bloodHi}" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="46 954" stroke-dashoffset="1000" class="pulse"/>
<path d="${d}" pathLength="1000" fill="none" stroke="${C.violetHi}" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="30 970" stroke-dashoffset="1000" class="pulse-back"/>`;
}

function roofs(r0) {
  // Distant Uchiha district, lower in the middle so the name has room.
  let d = `M0 ${H}`;
  let x = -20;
  while (x < W + 20) {
    const w = between(r0, 46, 96);
    const mid = Math.abs(x + w / 2 - W / 2) < 260;
    const top = mid ? between(r0, 584, 604) : between(r0, 500, 548);
    const eave = top + between(r0, 14, 22);
    d += `L${f(x)} ${f(eave + 8)}L${f(x + 6)} ${f(eave)}Q${f(x + w * 0.3)} ${f(top + 4)} ${f(x + w / 2)} ${f(top)}Q${f(x + w * 0.7)} ${f(top + 4)} ${f(x + w - 6)} ${f(eave)}L${f(x + w)} ${f(eave + 8)}`;
    x += w + between(r0, -4, 10);
  }
  d += `L${W} ${H}Z`;
  const lanterns = Array.from({ length: 7 }, () => {
    const lx = pickSide(r0);
    return `<circle${at({ cx: lx, cy: between(r0, 556, 600), r: 2.2, fill: C.chakra, opacity: between(r0, 0.35, 0.7), class: 'eyeglow', style: `animation-delay:${f(-between(r0, 0, 3))}s` })}/>`;
  }).join('');
  return `<path d="${d}" fill="#0c0818"/>${lanterns}`;
}

const pickSide = (r0) => (r0() < 0.5 ? between(r0, 30, 360) : between(r0, 920, 1250));

function itachiRoof() {
  const ridge = 552;
  const d = `M96 ${H}V604Q110 600 102 588L150 592Q210 566 250 ${ridge}H292Q332 566 392 592L442 588Q434 600 448 604V${H}Z`;
  return `<g transform="translate(${ROOF_SHIFT} 0)"><path d="${d}" fill="${C.shadow}"/><path d="M150 592Q210 566 250 ${ridge}H292Q332 566 392 592" fill="none" stroke="${C.bloodHi}" stroke-width="1.2" opacity=".55"/></g>`;
}

function sasukeLedge(r0) {
  const pts = [[862, H], [870, 590]];
  for (let x = 880; x <= 1180; x += 20) pts.push([x, 566 + between(r0, -6, 8)]);
  pts.push([1196, 596], [1210, H]);
  const d = `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`;
  const top = `M${pts.slice(1, -1).map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}`;
  return `<path d="${d}" fill="${C.shadow}"/><path d="${top}" fill="none" stroke="${C.violet}" stroke-width="1.2" opacity=".6"/>`;
}

function amaterasu(r0) {
  const tongue = 'M0 0C-9-9-6-24 1-42 3-28 11-20 8-6 12-12 14-20 13-28 21-14 18-3 12 0Z';
  let out = '';
  for (let i = 0; i < 14; i++) {
    const x = 880 + i * 22 + between(r0, -6, 6);
    const s = between(r0, 0.7, 1.4);
    out += `<g transform="translate(${f(x)} ${f(578 + between(r0, -4, 4))}) scale(${f(s)})"><path d="${tongue}" fill="#000" stroke="${C.violet}" stroke-width="1.3" stroke-opacity=".85" class="flame" style="${style({ '--t': `${f(between(r0, 0.5, 1.1))}s`, '--d': `${f(-between(r0, 0, 1))}s` })}"/></g>`;
  }
  for (let i = 0; i < 18; i++) {
    const x = between(r0, 880, 1190);
    out += `<circle${at({ cx: x, cy: between(r0, 560, 590), r: between(r0, 1, 2.2), fill: r0() < 0.6 ? C.violet : C.bloodHi, opacity: 0, class: 'ember', style: style({ '--t': `${f(between(r0, 2.6, 5))}s`, '--d': `${f(-between(r0, 0, 5))}s`, '--ex': `${f(between(r0, -40, 40))}px` }) })}/>`;
  }
  return out;
}

/** Chidori in Sasuke's hand: bolts in every direction and one down to the ground. */
function chidori(r0, [hx, hy]) {
  const radial = () => {
    const a = between(r0, 0, Math.PI * 2);
    const len = between(r0, 50, 110);
    return strike(r0, [hx, hy], [hx + Math.cos(a) * len, hy + Math.sin(a) * len], { levels: 4, roughness: 0.26, forks: 2, reach: 0.5 });
  };
  const ground = () => strike(r0, [hx, hy], [hx + between(r0, -40, 0), hy + between(r0, 100, 130)], { levels: 5, roughness: 0.2, forks: 2, reach: 0.35 });
  const variants = Array.from({ length: 7 }, () => [...Array.from({ length: 3 }, radial), ...(r0() < 0.5 ? [ground()] : [])]);
  return `<g><circle cx="${f(hx)}" cy="${f(hy)}" r="70" fill="url(#chidoriglow)" class="breath" style="animation-duration:.5s"/>${strikes(variants, { id: 'chh', color: C.chidori, core: C.chidoriCore, r: r0, period: [0.9, 1.3] })}<circle cx="${f(hx)}" cy="${f(hy)}" r="7" fill="${C.chidoriCore}"/></g>`;
}

function crows(r0) {
  let out = '';
  for (let i = 0; i < 11; i++) {
    const x0 = ITACHI_AT.x + between(r0, -20, 30);
    const y0 = ITACHI_AT.y - between(r0, 150, 260);
    const inside = i % 2 === 0;
    const x1 = inside ? between(r0, 420, 860) : between(r0, 1100, 1360);
    const y1 = inside ? between(r0, 60, 300) : between(r0, -60, 120);
    const xm = (x0 + x1) / 2 + between(r0, -60, 60);
    const ym = Math.min(y0, y1) - between(r0, 20, 90);
    const t = between(r0, 7, 12);
    const d = -between(r0, 0, t);
    const s = between(r0, 0.45, 1.05);
    const vars = { '--x0': `${f(x0)}px`, '--y0': `${f(y0)}px`, '--xm': `${f(xm)}px`, '--ym': `${f(ym)}px`, '--x1': `${f(x1)}px`, '--y1': `${f(y1)}px`, '--t': `${f(t)}s`, '--d': `${f(d)}s` };
    out += `<g class="fly" style="${style(vars)}" transform="translate(${f(xm)} ${f(ym)})"><g transform="scale(${f(s)})">${crow(C.shadow)}</g></g>`;
    if (inside) {
      for (let k = 0; k < 7; k++) {
        const a = (k / 7) * Math.PI * 2 + between(r0, -0.3, 0.3);
        const bvars = { '--t': `${f(t)}s`, '--d': `${f(d)}s`, '--bx': `${f(Math.cos(a) * between(r0, 24, 60))}px`, '--by': `${f(Math.sin(a) * between(r0, 24, 60) + 20)}px` };
        out += `<g transform="translate(${f(x1)} ${f(y1)})"><ellipse rx="3.2" ry="1.2" fill="${k % 3 ? C.shadow : C.bloodHi}" opacity="0" class="burst" style="${style(bvars)}" transform="rotate(${f(between(r0, 0, 180))})"/></g>`;
      }
    }
  }
  return out;
}

function petals(r0) {
  let out = '';
  for (let i = 0; i < 26; i++) {
    const x0 = between(r0, -200, W - 100);
    const t = between(r0, 13, 24);
    const vars = {
      '--x0': `${f(x0)}px`,
      '--x1': `${f(x0 + between(r0, 180, 360))}px`,
      '--r': `${f(between(r0, 260, 720))}deg`,
      '--t': `${f(t)}s`,
      '--d': `${f(-between(r0, 0, t))}s`,
      '--f': `${f(between(r0, 0.9, 2.2))}s`,
    };
    const s = between(r0, 0.55, 1.25);
    out += `<g class="fall" style="${style(vars)}" transform="translate(${f(x0 + 150)} ${f(between(r0, 30, H - 40))})"><g transform="scale(${f(s)})"><path d="${PETAL}" fill="url(#petal)" opacity="${f(between(r0, 0.55, 0.95))}" class="a flip"/></g></g>`;
  }
  return out;
}

function titles(ts, data) {
  const roles = [
    'SHOSHIN · BEGINNER’S MIND',
    'DESIGN ENGINEER',
    'BUILDS WITH AGENTS',
    `${data.repos} REPOS · ${data.total.toLocaleString('en-US')} COMMITS / YEAR`,
  ];
  const size = 19;
  const spacing = 4;
  const advance = MONO_ADVANCE * size + spacing;
  // Typewriter without clip paths (WebKit may not repaint an animated clipPath child):
  // every glyph is its own <text> and appears on its step; the role group hides the rest.
  const lines = roles
    .map((role, i) => {
      const glyphs = [...role];
      const n = glyphs.length;
      const w = n * advance;
      const x = W / 2 - w / 2;
      const y = 614;
      const step = (CYCLE * TYPE_SHARE) / n;
      const chars = glyphs
        .map((ch, k) =>
          ch === ' '
            ? ''
            : ts.text('mono', ch, { x: f(x + k * advance), y, 'font-size': size, fill: C.ink2, class: 'ch', style: `animation-delay:${f(i * SLOT + k * step)}s` }),
        )
        .join('');
      const caret = `animation-delay:${i * SLOT}s;animation-timing-function:steps(${n},end);--w:${f(w)}px`;
      return `<g class="role" style="animation-delay:${i * SLOT}s"${i ? ' opacity="0"' : ''}>${chars}
<g class="caret" style="${caret}" transform="translate(${f(w)} 0)"><rect x="${f(x + 2)}" y="${y - 17}" width="10" height="21" fill="${C.bloodHi}" class="cblink"/></g>
</g>`;
    })
    .join('');
  return `<g class="fadein" style="animation-delay:.6s">
${ts.text('mono', 'LICHTFELD', { x: 48, y: 58, 'font-size': 17, 'letter-spacing': 4, fill: C.ink3 })}
${ts.text('mono', '× UCHIHA', { x: 48, y: 82, 'font-size': 17, 'letter-spacing': 4, fill: C.ink3 })}
${ts.text('kanji', 'うちは', { x: 48, y: 116, 'font-size': 22, 'letter-spacing': 6, fill: C.bloodHi, opacity: 0.85 })}
${ts.text('mono', 'GITHUB.COM/SHOSHIIIIN', { x: 48, y: 624, 'font-size': 14, 'letter-spacing': 3, fill: C.ink3, opacity: 0.8 })}
${ts.text('mono', '無限月読 · INFINITE TSUKUYOMI', { x: W - 48, y: 624, 'font-size': 14, 'letter-spacing': 3, fill: C.ink3, 'text-anchor': 'end', opacity: 0.8 })}
${ts.text('kanji', '初心', { x: W / 2, y: 486, 'font-size': 30, 'letter-spacing': 14, fill: C.bloodHi, 'text-anchor': 'middle' })}
${ts.text('display', 'Shoshin', { x: W / 2, y: 568, 'font-size': 100, 'letter-spacing': 3, fill: 'url(#name)', 'text-anchor': 'middle' })}
<path d="M470 584H810" stroke="${C.line2}" stroke-width="1"/>
<path d="M470 584H810" pathLength="1000" stroke="${C.bloodHi}" stroke-width="1.6" stroke-dasharray="60 940" stroke-dashoffset="1000" class="scan"/>
</g>
${lines}`;
}

function defs() {
  return `<defs>
<clipPath id="frame"><rect width="${W}" height="${H}" rx="${FRAME.radius}"/></clipPath>
<radialGradient id="sky" cx="${MOON.x / W}" cy="${MOON.y / H}" r=".75"><stop offset="0" stop-color="#2b0614"/><stop offset=".45" stop-color="#12081f"/><stop offset="1" stop-color="${C.bg}"/></radialGradient>
${glowGradient('moonglow', C.blood, { inner: 0.42, mid: 0.14 })}
<radialGradient id="moon" fx=".4" fy=".36"><stop offset="0" stop-color="#ff4450"/><stop offset=".55" stop-color="${C.moon}"/><stop offset="1" stop-color="#6a0616"/></radialGradient>
<radialGradient id="moon-v" fx=".6" fy=".36"><stop offset="0" stop-color="${C.violetHi}"/><stop offset=".55" stop-color="#8556e6"/><stop offset="1" stop-color="#2a1068"/></radialGradient>
${glowGradient('moonglow-v', C.violet, { inner: 0.26, mid: 0.08 })}
<clipPath id="half-l"><rect x="0" y="0" width="${MOON.x}" height="${H}"/></clipPath>
<clipPath id="half-r"><rect x="${MOON.x}" y="0" width="${W - MOON.x}" height="${H}"/></clipPath>
${glowGradient('chidoriglow', C.chidori, { inner: 0.75, mid: 0.22 })}
${figureDefs()}
<radialGradient id="petal" fx=".5" fy=".3"><stop offset="0" stop-color="#fff0f6"/><stop offset=".6" stop-color="${C.petal}"/><stop offset="1" stop-color="${C.petalDeep}"/></radialGradient>
<linearGradient id="name" x1="0" y1="0" x2="0" y2="1"><stop offset=".2" stop-color="${C.ink}"/><stop offset="1" stop-color="${C.violetHi}"/></linearGradient>
</defs>`;
}

/**
 * @param {{repos: number, total: number}} data
 * @param {ReturnType<import('../lib/type.mjs').createTypeset>} ts
 */
export function hero(data, ts) {
  const r0 = rng(20261105);
  const brothers = cast(data);
  const body = `${defs()}
<g clip-path="url(#frame)">
${sky()}
${atlas()}
${moon(r0)}
${roofs(r0)}
${susanoos(data, ts, r0, brothers)}
${thread(brothers.itachi.eye, brothers.sasuke.eye)}
${itachiRoof()}
${sasukeLedge(r0)}
<g class="fadein" style="animation-delay:.4s">${brothers.itachi.markup}</g>
<g class="fadein" style="animation-delay:.6s">${brothers.sasuke.markup}</g>
${chidori(r0, brothers.sasuke.hand)}
${amaterasu(r0)}
${crows(r0)}
${titles(ts, data)}
${petals(r0)}
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="${FRAME.radius}" fill="none" stroke="${C.line2}"/>`;
  return doc({
    width: W,
    height: H,
    title: 'Shoshin: Lichtfeld × Uchiha',
    desc: 'The moon of the Infinite Tsukuyomi is split down the middle: Rinne Sharingan on Itachi’s side, Rinnegan on Sasuke’s, nine tomoe turning over both, a red wave of light rolling out. Itachi and Sasuke stand on either side, their Susanoo floating above them as holograms drawn in points of light, Itachi’s with mirror and blade, Sasuke’s with horns and twin blades, joined by a pulsing thread of light; crows dissolve into feathers, cherry blossom petals drift, black flames burn.',
    css: `${CSS}${HOLOGRAM_CSS}${LIGHTNING_CSS}`,
    body,
  });
}
