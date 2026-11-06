// Lichtfeld "Ultraviolett" as the ground, with one colour per character.
// Colour carries meaning, as in Lichtfeld: it says who is speaking, never decorates.

export const C = Object.freeze({
  // Lichtfeld night
  bg: '#07050f',
  stage: '#120c24',
  ink: '#efeaff',
  ink2: '#b3a7dc',
  ink3: '#8a7cb8',
  line: '#231a42',
  line2: '#3a2c6e',
  shadow: '#030207',

  // Itachi: the blood moon, Tsukuyomi, crows
  blood: '#e0182d',
  bloodHi: '#ff5468',
  bloodDeep: '#4a0410',
  moon: '#c3122a',

  // Sasuke: Susanoo violet, Chidori light
  violet: '#a66bff',
  violetHi: '#c7a6ff',
  chidori: '#7fd6ff',
  chidoriCore: '#eaf9ff',

  // Naruto: the dawn, chakra gold
  chakra: '#ff9a3c',
  chakraHi: '#ffd27a',

  // Sakura: petals, the healing seal
  petal: '#ffb3cf',
  petalDeep: '#ff7fae',
  heal: '#6ff0c2',
});

/** Rounded frame shared by every card, so the page reads as one system. */
export const FRAME = Object.freeze({ radius: 22, hair: 1 });
