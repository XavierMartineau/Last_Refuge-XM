/* LAST REFUGE · XM — Bibliothèque du personnage 3D.
   Point d’entrée unique : import * as CL from '…/assets/creation-personnage/personnage_armes.js' */
export { D, LEN, NAMES, LABEL, DEF, STEPS, STEP_DETAILS, GENDERS, emptyChoices } from './donnees/donnees.js';
export { REGS, sanitize, choiceName, labelOf } from './donnees/selection.js';
export { buildCharacter } from './assemblage/personnage.js';
export { gunModel } from './armes/modeles-armes.js';
export { weaponStats, WSLOTS, WPN, WCTX, WFIN } from './armes/donnees-armes.js';
export { BOOTCOL } from './bottes/bottes.js';
export { GLOVECOL } from './gants/gants.js';
export { SPX } from './especes/especes.js';
export { CAMO } from './materiaux/materiaux.js';
export { aimArm } from './armes/prise-en-main.js';
