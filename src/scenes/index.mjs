// Every scene the build renders, by output name (assets/<name>.svg).
import { arsenal } from './arsenal.mjs';
import { dawn } from './dawn.mjs';
import { divider, dividerChidori } from './divider.mjs';
import { eye } from './eye.mjs';
import { hero } from './hero.mjs';
import { shoshin } from './shoshin.mjs';
import { team } from './team.mjs';

export const SCENES = Object.freeze({
  hero,
  shoshin,
  divider,
  team,
  'divider-chidori': dividerChidori,
  arsenal,
  eye,
  dawn,
});
