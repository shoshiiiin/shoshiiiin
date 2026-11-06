// Section dividers: a hairline with an eye that opens and closes on Sasuke's Mangekyō,
// or a line that crackles with Chidori. Pulses run outward along the thread.

import { C } from '../lib/palette.mjs';
import { LIGHTNING_CSS, strike, strikes } from '../lib/lightning.mjs';
import { between, rng } from '../lib/rng.mjs';
import { crow, glowGradient, sasukeMangekyo } from '../lib/shapes.mjs';
import { doc } from '../lib/svg.mjs';

const W = 1280;
const H = 110;
const MID = H / 2;

const CSS = `
.open{transform-origin:50% 50%;animation:open 7s cubic-bezier(.6,0,.2,1) infinite}
@keyframes open{0%,8%{transform:scaleY(.04)}22%,78%{transform:scaleY(1)}92%,100%{transform:scaleY(.04)}}
.spin{animation:spin 7s cubic-bezier(.45,0,.55,1) infinite}
@keyframes spin{0%,20%{transform:rotate(0)}50%{transform:rotate(240deg)}100%{transform:rotate(360deg)}}
.out{animation:out 7s cubic-bezier(.3,0,.3,1) infinite}
@keyframes out{0%,20%{stroke-dashoffset:0;opacity:0}24%{opacity:1}70%{stroke-dashoffset:-1000;opacity:1}76%,100%{stroke-dashoffset:-1000;opacity:0}}
.glide{animation:glide 14s linear infinite}
@keyframes glide{from{transform:translate(-60px,${MID - 18}px)}to{transform:translate(${W + 60}px,${MID - 30}px)}}
.wing{transform-origin:50% 100%;animation:flapw .4s ease-in-out infinite alternate}
.wb{animation-delay:-.2s}
@keyframes flapw{to{transform:scaleY(-.65)}}
${LIGHTNING_CSS}
.breath{animation:breath 1.2s ease-in-out infinite}
@keyframes breath{50%{opacity:.5}}
`;

const fadeLine = (color) =>
  `<linearGradient id="hair" x1="0" x2="1"><stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset=".5" stop-color="${color}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient>`;

/** The eye divider: Sasuke's Mangekyō opens on the line, crows gliding past. */
export function divider() {
  const eyeShape = `M-64 0Q0-34 64 0Q0 34-64 0Z`;
  const pulses = [-1, 1]
    .map(
      (side) =>
        `<path d="M${W / 2 + side * 70} ${MID}H${side < 0 ? 40 : W - 40}" pathLength="1000" stroke="${C.bloodHi}" stroke-width="1.8" stroke-dasharray="40 960" class="out"/>`,
    )
    .join('');
  const body = `<defs>${fadeLine(C.line2)}<clipPath id="lid"><path d="${eyeShape}"/></clipPath>${glowGradient('g-eye', C.blood, { inner: 0.5, mid: 0.15 })}
</defs>
<path d="M0 ${MID}H${W}" stroke="url(#hair)"/>
${pulses}
<g transform="translate(${W / 2} ${MID})">
<ellipse rx="120" ry="50" fill="url(#g-eye)"/>
<g class="a open"><path d="${eyeShape}" fill="#0b0712" stroke="${C.bloodHi}" stroke-width="1.2"/>
<g clip-path="url(#lid)"><g class="spin">${sasukeMangekyo(27, 'ems-divider')}</g></g></g>
</g>
<g class="glide" transform="translate(330 ${MID - 22})"><g transform="scale(.55)">${crow('#000')}</g></g>
<g class="glide" style="animation-delay:-6s;animation-duration:17s" transform="translate(930 ${MID - 28})"><g transform="scale(.38)">${crow('#000')}</g></g>`;
  return doc({ width: W, height: H, title: 'Divider: an eye opens', desc: 'A hairline across the page; in its middle an eye opens on Sasuke’s Mangekyō Sharingan, its pattern turns, and crows glide past.', css: CSS, body });
}

const BAND = [8, H - 8];

/**
 * One strike of the Chidori divider: a long bolt runs out along the line on each side
 * of the core, and two short sparks jump off the core.
 */
function crackle(r0) {
  const runs = [-1, 1].map((side) =>
    strike(r0, [W / 2 + side * 8, MID], [W / 2 + side * between(r0, 240, 540), MID + between(r0, -22, 22)], { levels: 5, roughness: 0.17, forks: 2, forkLevels: 3, reach: 0.26, clampY: BAND }),
  );
  const sparks = Array.from({ length: 2 }, () => {
    const a = between(r0, 0, Math.PI * 2);
    const len = between(r0, 18, 36);
    return strike(r0, [W / 2, MID], [W / 2 + Math.cos(a) * len, MID + Math.sin(a) * len * 0.8], { levels: 3, roughness: 0.3, forks: 0, clampY: BAND });
  });
  return [...runs, ...sparks];
}

/** Sasuke's divider: the hairline crackles with Chidori around a bright core. */
export function dividerChidori() {
  const r0 = rng(31);
  const variants = Array.from({ length: 7 }, () => crackle(r0));
  const body = `<defs>${fadeLine(C.violet)}${glowGradient('g-c', C.chidori, { inner: 0.8, mid: 0.25 })}
<linearGradient id="white" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<mask id="fade"><rect width="${W}" height="${H}" fill="url(#white)"/></mask></defs>
<path d="M0 ${MID}H${W}" stroke="url(#hair)" stroke-width="1.2"/>
<g mask="url(#fade)">${strikes(variants, { id: 'chd', color: C.chidori, core: C.chidoriCore, r: r0, period: [1.1, 1.6] })}</g>
<circle cx="${W / 2}" cy="${MID}" r="46" fill="url(#g-c)" class="breath"/>
<circle cx="${W / 2}" cy="${MID}" r="6" fill="${C.chidoriCore}"/>`;
  return doc({ width: W, height: H, title: 'Divider: Chidori', desc: 'A hairline across the page crackling with blue lightning around a bright core.', css: CSS, body });
}
