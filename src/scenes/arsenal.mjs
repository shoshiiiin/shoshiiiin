// Jutsu arsenal: the tools as five chakra natures. Every point is a tool; its size,
// brightness and number say how many of my repositories use it (Lichtfeld rules 1, 2).
// Threads join each nature to the centre and carry a wandering pulse (rule 4).

import { header, sceneFrame } from '../lib/frame.mjs';
import { C } from '../lib/palette.mjs';
import { glowGradient } from '../lib/shapes.mjs';
import { at, doc, f, polar, style } from '../lib/svg.mjs';

const W = 1280;
const H = 720;
const CX = 680;
const CY = 392;
const RING = 206;

const NATURES = [
  { kanji: '火', name: 'KATON', role: 'Frontend', color: '#ff9a3c', tools: [['typescript', 'TypeScript'], ['react', 'React'], ['next', 'Next.js'], ['vite', 'Vite'], ['tailwind', 'Tailwind'], ['astro', 'Astro']] },
  { kanji: '雷', name: 'RAITON', role: 'Edge & data', color: '#7fd6ff', tools: [['node', 'Node'], ['vercel', 'Vercel'], ['cloudflare', 'Workers'], ['supabase', 'Supabase'], ['postgres', 'Postgres']] },
  { kanji: '風', name: 'FŪTON', role: 'Motion & 3D', color: '#6ff0c2', tools: [['three', 'three.js'], ['gsap', 'GSAP'], ['r3f', 'R3F']] },
  { kanji: '水', name: 'SUITON', role: 'Native', color: '#9d8bff', tools: [['swift', 'Swift'], ['flutter', 'Flutter'], ['unreal', 'Unreal']] },
  { kanji: '土', name: 'DOTON', role: 'Agents & proof', color: '#e4b77a', tools: [['vitest', 'Vitest'], ['playwright', 'Playwright'], ['python', 'Python'], ['aisdk', 'AI SDK'], ['claude', 'Claude SDK']] },
];

const CSS = `
.pulse{animation:pulse var(--t) cubic-bezier(.5,0,.5,1) var(--d) infinite}
@keyframes pulse{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}
.breath{animation:breath var(--t) ease-in-out var(--d) infinite}
@keyframes breath{50%{opacity:.5}}
.in{animation:in 1.1s cubic-bezier(.2,.7,.2,1) var(--d) both}
@keyframes in{from{opacity:0;transform:scale(.2)}}
.turn{animation:turn 90s linear infinite}
.turn-r{animation:turn 140s linear infinite reverse}
@keyframes turn{to{transform:rotate(360deg)}}
.nature{animation:nature 5s ease-in-out var(--d) infinite}
@keyframes nature{50%{transform:scale(1.08)}}
`;

/** Size and light from use: one repo is a spark, many are a star. */
function weight(count, max) {
  if (!count) return 0;
  return Math.log1p(count) / Math.log1p(max);
}

function natureNode(ts, n, i, stack, max) {
  const deg = (i / NATURES.length) * 360;
  const [nx, ny] = polar(CX, CY, RING, deg);
  const spread = Math.min(150, 34 * n.tools.length);
  const threads = [];
  const nodes = [];
  n.tools.forEach(([id, label], k) => {
    const count = stack[id] ?? 0;
    const w = weight(count, max);
    const a = deg - spread / 2 + (n.tools.length === 1 ? spread / 2 : (spread * k) / (n.tools.length - 1));
    const dist = 92 + (k % 2) * 20;
    const [tx, ty] = polar(nx, ny, dist, a);
    const [lx, ly] = polar(nx, ny, dist + 18, a);
    const side = Math.abs(lx - tx) >= 6;
    const anchor = !side ? 'middle' : lx > tx ? 'start' : 'end';
    // Above the point the number goes under the name, below it the name leads; sideways both sit level.
    const [labelY, countY] = side ? [ly + 4, ly + 22] : ly < ty ? [ly - 14, ly + 2] : [ly + 14, ly + 30];
    const delay = { '--d': `${f(0.5 + i * 0.15 + k * 0.06)}s` };
    threads.push(`<path d="M${f(nx)} ${f(ny)}L${f(tx)} ${f(ty)}" stroke="${n.color}" stroke-width="1" opacity="${f(0.18 + w * 0.3)}"/>`);
    nodes.push(`<g class="a in" style="${style(delay)}">
<circle${at({ cx: tx, cy: ty, r: 8 + w * 16, fill: `url(#g${i})`, opacity: 0.4 + w * 0.6, class: 'breath', style: style({ '--t': `${f(2.4 + k * 0.4)}s`, '--d': `${f(-k * 0.7)}s` }) })}/>
<circle${at({ cx: tx, cy: ty, r: 2.2 + w * 4.2, fill: w > 0.85 ? '#fff' : n.color })}/>
${ts.text('text', label, { x: f(lx), y: f(labelY), 'font-size': 18, fill: C.ink, 'text-anchor': anchor })}
${ts.text('mono', `×${count}`, { x: f(lx), y: f(countY), 'font-size': 13, 'letter-spacing': 1, fill: C.ink3, 'text-anchor': anchor })}
</g>`);
  });
  const hub = `<path d="M${CX} ${CY}L${f(nx)} ${f(ny)}" stroke="${n.color}" stroke-width="1" opacity=".3"/>
<path d="M${CX} ${CY}L${f(nx)} ${f(ny)}" pathLength="1000" stroke="${n.color}" stroke-width="2" stroke-linecap="round" stroke-dasharray="70 930" stroke-dashoffset="1000" class="pulse" style="${style({ '--t': `${f(3.6 + i * 0.5)}s`, '--d': `${f(-i * 0.9)}s` })}"/>`;
  const node = `<g transform="translate(${f(nx)} ${f(ny)})"><g class="a nature" style="--d:${f(-i)}s"><circle r="44" fill="url(#g${i})" opacity=".55"/><circle r="30" fill="${C.stage}" stroke="${n.color}" stroke-width="1.4"/></g>
${ts.text('kanji', n.kanji, { x: 0, y: 10, 'font-size': 28, fill: n.color, 'text-anchor': 'middle' })}</g>`;
  return { back: `${hub}${threads.join('')}`, front: `${node}${nodes.join('')}` };
}

function legend(ts) {
  return NATURES.map((n, i) => {
    const y = 300 + i * 56;
    return `${ts.text('kanji', n.kanji, { x: 64, y, 'font-size': 26, fill: n.color })}
${ts.text('mono', n.name, { x: 104, y: y - 6, 'font-size': 14, 'letter-spacing': 3, fill: n.color })}
${ts.text('text', n.role, { x: 104, y: y + 16, 'font-size': 17, fill: C.ink2 })}`;
  }).join('');
}

/** @param {{stack: Record<string, number>}} data @param {ReturnType<import('../lib/type.mjs').createTypeset>} ts */
export function arsenal(data, ts) {
  const max = Math.max(1, ...Object.values(data.stack));
  const parts = NATURES.map((n, i) => natureNode(ts, n, i, data.stack, max));
  const inner = `<defs>
<radialGradient id="bg-ars" cx="${CX / W}" cy="${CY / H}" r=".6"><stop offset="0" stop-color="#170d2e"/><stop offset="1" stop-color="${C.bg}"/></radialGradient>
${NATURES.map((n, i) => glowGradient(`g${i}`, n.color, { inner: 0.6, mid: 0.18 })).join('')}
${glowGradient('g-core', C.bloodHi, { inner: 0.55, mid: 0.16 })}
</defs>
<rect width="${W}" height="${H}" fill="url(#bg-ars)"/>
<g transform="translate(${CX} ${CY})"><g class="turn"><circle r="${RING}" fill="none" stroke="${C.line2}" stroke-dasharray="2 10"/></g><g class="turn-r"><circle r="${RING + 150}" fill="none" stroke="${C.line}" stroke-dasharray="1 14"/></g></g>
${parts.map((p) => p.back).join('')}
<circle cx="${CX}" cy="${CY}" r="80" fill="url(#g-core)"/>
<circle cx="${CX}" cy="${CY}" r="46" fill="${C.stage}" stroke="${C.bloodHi}" stroke-width="1.2"/>
${ts.text('kanji', '初心', { x: CX, y: CY + 11, 'font-size': 30, fill: C.bloodHi, 'text-anchor': 'middle', 'letter-spacing': 2 })}
${parts.map((p) => p.front).join('')}
${header(ts, { x: 64, y: 70, kanji: '術', label: 'JUTSU ARSENAL', title: 'Five natures', accent: C.bloodHi })}
${ts.text('text', 'Every point is a tool. Its light', { x: 64, y: 176, 'font-size': 18, fill: C.ink2 })}
${ts.text('text', 'and number: how many of my', { x: 64, y: 200, 'font-size': 18, fill: C.ink2 })}
${ts.text('text', 'repositories use it.', { x: 64, y: 224, 'font-size': 18, fill: C.ink2 })}
${legend(ts)}`;
  return doc({
    width: W,
    height: H,
    title: 'Jutsu arsenal: my tools as five chakra natures',
    desc: `Five clusters around the centre: fire for frontend, lightning for edge and data, wind for motion and 3D, water for native apps, earth for agents and testing. Each tool shows how many repositories use it; TypeScript ${data.stack.typescript ?? 0}, React ${data.stack.react ?? 0}, three.js ${data.stack.three ?? 0}.`,
    css: CSS,
    body: sceneFrame(W, H, inner),
  });
}
