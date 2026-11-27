/* LAST REFUGE · XM — Escape room « Sas 07 » · Zone provisoire (anciennes salles 7 à 10).
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers.

   Les salles 7 à 10 ont été supprimées pour être reconstruites. En attendant, un simple couloir
   (8 m de large, 4 m de haut) relie la porte de la salle 6 (z = -102) au complexe de la salle 11
   (z = -262), pour que la partie reste jouable de bout en bout. Remplacez ce fichier par les
   nouvelles salles (et mettez à jour FICHIERS dans escape-room.js). */
'use strict';
shell(-182, { south: false, w: 8, d: 160, h: 4 });
wallWithDoor(-262, 120, 9.6); // mur sud du complexe (salle 11) : passage toujours ouvert
// néons du couloir : chaque tube appartient à l’ancienne salle de sa portion (allumés en permanence)
for (let z = -108; z > -260; z -= 12) addNeon(z > -132 ? 7 : z > -172 ? 8 : z > -222 ? 9 : 10, 0, z, 2.4, 3.7);
[-104, -258].forEach((z) =>
  plane(2.6, 0.7, sign(['ZONE EN', 'RECONSTRUCTION'], '#b48a22', '#15171a'), -3.95, 2.4, z, scene, Math.PI / 2)
);
