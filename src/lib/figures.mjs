// The silhouettes. Shadow figures lit only at the rim, the way Lichtfeld lights a globe:
// a coloured copy shifted toward the light sits behind the black figure, so only the
// edges facing the light glow. Feet at y = 0, centre at x = 0.

import { C } from './palette.mjs';
import { CLOUD, glowGradient } from './shapes.mjs';
import { at } from './svg.mjs';

// Itachi, front view: high collar, long cloak, bangs framing the face.
const ITACHI_HEAD =
  'M0-340C15-340 24-331 25-316 26-305 27-293 33-276L23-284 19-288H-19L-23-284-33-276C-27-293-26-305-25-316-24-331-15-340 0-340Z';
// The upper face, dimly lit by the moon; the collar hides the rest.
const ITACHI_FACE = 'M-15-318C-15-306-13-298-11-293L0-289 11-293C13-298 15-306 15-318Z';
const ITACHI_BANGS = 'M-25-318C-19-312-17-302-19-284L-13-300C-12-308-10-314-5-320ZM25-318C19-312 17-302 19-284L13-300C12-308 10-314 5-320Z';
const ITACHI_CLOAK =
  'M-46-304C-43-286-47-273-57-263-65-256-67-240-65-221L-67-120C-69-84-72-56-74-34H74C72-56 69-84 67-120L65-221C67-240 65-256 57-263 47-273 43-286 46-304L26-289 0-283-26-289Z';
const ITACHI_HEM =
  'M-74-36H74L75-16 62-21 50-11 37-19 23-8 9-17-5-7-19-17-33-9-47-19-60-10-75-18Z';
const ITACHI_FEET = 'M-23-16H-8L-6 0H-27ZM8-16H23L27 0H6Z';

// Sasuke, three-quarter view facing left: spiked hair, rope belt, Chidori hand forward.
const SASUKE_HEAD =
  'M-25-303C-25-321-13-331 1-331L17-349 21-333 45-338 34-319 52-311 35-303 46-290 24-293C20-283 14-279 7-277L5-267H-11L-12-276C-19-278-23-283-25-289L-32-273-29-293-31-296Z';
const SASUKE_BODY =
  'M-11-268H5L29-260C35-255 37-246 38-238L44-206 50-170 42-166 32-204 26-226 24-192 30-188 40-112H-42L-30-188-24-192-27-228-36-208-62-177-80-160-86-166-70-188-49-214-38-242C-36-252-30-258-24-262Z';
const SASUKE_LEGS = 'M-36-114H-6L-9-14H-25ZM6-114H34L30-14H14ZM-27-16H-7L-5 0H-31ZM13-16H31L35 0H11Z';
const SASUKE_FLAP = 'M-42-114H40L42-96 30-100 18-92 6-101-6-93-18-101-30-94-43-100Z';
const SASUKE_FACE = 'M-23-306-11-311-6-297-10-281-19-280-24-289Z';
const SASUKE_BANG = 'M-27-309-32-273-23-292-20-306Z';
const SASUKE_SWORD = 'M41-176L120-12';
const SASUKE_HILT = 'M36-190L46-166';

/**
 * Render a figure three times: two rim copies toward the light, then the shadow.
 * @param {(fill: string, extra: string) => string} draw the figure in one colour
 * @param {Array<{dx: number, dy: number, color: string, opacity: number}>} rims
 */
function lit(draw, rims) {
  const copies = rims.map(
    ({ dx, dy, color, opacity }) => `<g transform="translate(${dx} ${dy})" opacity="${opacity}">${draw(color)}</g>`,
  );
  return `${copies.join('')}${draw(C.shadow)}`;
}

/** Itachi standing; the hem flutters (class "hem"), clouds and eyes glow. */
export function itachi() {
  const draw = (fill) =>
    `<path d="${ITACHI_CLOAK}" fill="${fill}"/><path d="${ITACHI_HEAD}" fill="${fill}"/><path d="${ITACHI_FEET}" fill="${fill}"/><path d="${ITACHI_HEM}" fill="${fill}" class="a hem"/>`;
  const figure = lit(draw, [
    { dx: 3.2, dy: -1.6, color: C.blood, opacity: 0.45 },
    { dx: 1.6, dy: -0.8, color: C.bloodHi, opacity: 0.9 },
  ]);
  const clouds = [
    { x: -52, y: -220, s: 0.8 },
    { x: 14, y: -156, s: 0.9 },
    { x: -46, y: -92, s: 0.76 },
  ]
    .map(
      ({ x, y, s }) =>
        `<path d="${CLOUD}" transform="translate(${x} ${y}) scale(${s})" fill="#5a0a16" stroke="#ffd6dc" stroke-width="1.3" stroke-opacity=".5" class="cloud"/>`,
    )
    .join('');
  const face = `<path d="${ITACHI_FACE}" fill="url(#face-blood)"/><path d="${ITACHI_BANGS}" fill="${C.shadow}"/>`;
  const band = `<path d="M-25-319Q0-325 25-319" stroke="${C.ink3}" stroke-width="1.6" fill="none" opacity=".6"/><path d="M-7-326 7-315" stroke="${C.bloodHi}" stroke-width="1.6" opacity=".9"/>`;
  return `${figure}${clouds}${face}${band}${eyes([
    [-9.5, -299, C.bloodHi],
    [9.5, -299, C.bloodHi],
  ])}`;
}

/** Sasuke with Kusanagi; the Chidori hand sits at (-84, -162) in figure space. */
export function sasuke() {
  const draw = (fill) =>
    `<path d="${SASUKE_SWORD}" stroke="${fill}" stroke-width="3.2" stroke-linecap="round"/><path d="${SASUKE_HILT}" stroke="${fill}" stroke-width="5" stroke-linecap="round"/><path d="${SASUKE_LEGS}" fill="${fill}"/><path d="${SASUKE_BODY}" fill="${fill}"/><path d="${SASUKE_HEAD}" fill="${fill}"/><path d="${SASUKE_FLAP}" fill="${fill}" class="a flap"/>`;
  const figure = lit(draw, [
    { dx: -3, dy: -1.8, color: C.blood, opacity: 0.4 },
    { dx: -1.8, dy: 1.2, color: C.violet, opacity: 0.95 },
  ]);
  const blade = `<path d="M43-171L118-16" stroke="${C.chidori}" stroke-width="1" opacity=".75" class="edge"/>`;
  const rope = `<path d="M-27-192Q0-184 27-192M-26-188Q0-180 26-188" stroke="${C.violet}" stroke-width="2" fill="none" opacity=".9"/><path d="M20-190Q34-180 30-160M22-188Q40-184 42-170" stroke="${C.violet}" stroke-width="1.6" fill="none" opacity=".8"/>`;
  const face = `<path d="${SASUKE_FACE}" fill="url(#face-violet)"/><path d="${SASUKE_BANG}" fill="${C.shadow}"/>`;
  return `${figure}${blade}${rope}${face}${eyes([
    [-18, -300, C.bloodHi],
    [-8, -301, C.violetHi],
  ])}`;
}

/**
 * A generated figure (WebP with alpha) standing with its feet at (x, y), `height` tall.
 * Anchors are fractions of the image; the eyes get the same glow as the drawn figures.
 * @param {{uri: string, w: number, h: number, anchors: {eyes?: number[][], hand?: number[]}}} art
 * @param {{x: number, y: number, height: number}} place
 * @param {string[]} eyeColors one per eye
 */
export function rasterFigure(art, { x, y, height }, eyeColors) {
  const width = (height * art.w) / art.h;
  const left = x - width / 2;
  const top = y - height;
  const pos = ([fx, fy]) => [left + fx * width, top + fy * height];
  const eyeList = (art.anchors.eyes ?? []).map((e, i) => [...pos(e), eyeColors[i % eyeColors.length]]);
  const markup = `<image${at({ href: art.uri, x: left, y: top, width, height })}/>${eyeList.length ? eyes(eyeList) : ''}`;
  const eye = eyeList.length ? eyeList[0].slice(0, 2) : [x, top + height * 0.1];
  const mean = (k) => eyeList.reduce((sum, e) => sum + e[k], 0) / eyeList.length;
  return {
    markup,
    eye,
    head: eyeList.length ? [mean(0), mean(1)] : eye,
    hand: art.anchors.hand ? pos(art.anchors.hand) : null,
  };
}

/** Glowing eyes that blink now and then (class "eye"). */
function eyes(list) {
  return `<g class="a blink">${list
    .map(
      ([x, y, color]) =>
        `<circle${at({ cx: x, cy: y, r: 9, fill: `url(#glow-${color.slice(1)})`, class: 'eyeglow' })}/><circle${at({ cx: x, cy: y, r: 2.4, fill: color })}/>`,
    )
    .join('')}</g>`;
}

/** Gradients the figures refer to; every scene that draws a figure puts these in <defs>. */
export function figureDefs() {
  const eyesGlow = [C.bloodHi, C.violetHi].map((c) => glowGradient(`glow-${c.slice(1)}`, c, { inner: 0.9, mid: 0.35 }));
  const face = (id, color, fromLeft) =>
    `<linearGradient id="${id}" x1="${fromLeft ? 0 : 1}" y1="0" x2="${fromLeft ? 1 : 0}" y2="0"><stop offset="0" stop-color="${color}" stop-opacity=".95"/><stop offset="1" stop-color="${C.shadow}"/></linearGradient>`;
  return `${eyesGlow.join('')}${face('face-blood', '#5c0b18', false)}${face('face-violet', '#3a2470', true)}`;
}

/** Team 7 seen from behind, small: Naruto (fist raised), Sakura, Sasuke. Feet at y = 0. */
export function teamFromBehind(fill) {
  const legs = 'M-9 0-8-26H-1L-2 0ZM2 0 1-26H8L9 0Z';
  const torso = 'M-10-24-13-44C-13-48-10-50-6-51H6C10-50 13-48 13-44L10-24Z';
  const armL = 'M-13-46-16-24H-13L-11-40Z';
  const armR = 'M13-46 16-24H13L11-40Z';
  const armUp = 'M12-47 19-66 23-64 16-42Z';
  const head = 'M0-65.5A7.5 7.5 0 1 1 0-50.5 7.5 7.5 0 1 1 0-65.5Z';
  const narutoHair = 'M-8-60-14-66-8-65-11-74-4-68-2-79 2-69 7-77 7-67 13-72 9-63 14-60 7-55H-7Z';
  const sakuraHair = 'M-9-55C-12-72 12-72 9-55L10-49H-10Z';
  const sasukeHair = 'M-8-61C-8-69 6-71 9-64L17-73 12-62 19-64 10-55H-7Z';
  const person = (parts, dx, s = 1) => `<g transform="translate(${dx} 0) scale(${s})"><path d="${parts.join('')}"/></g>`;
  return `<g fill="${fill}">${person([legs, torso, armL, armUp, head, narutoHair], -40)}${person([legs, torso, armL, armR, head, sakuraHair], 0, 0.93)}${person([legs, torso, armL, armR, head, sasukeHair], 40, 1.02)}</g>`;
}
