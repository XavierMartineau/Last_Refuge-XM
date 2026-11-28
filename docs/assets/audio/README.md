# Sons du Sas 07

Enregistrements des effets sonores du jeu, tels qu’ils sont synthétisés en direct par
`docs/js/escape-room/Sas-07/09-son.js` (Web Audio : filtres, écho et compresseur compris).
Le nom de chaque fichier correspond à l’identifiant utilisé dans le code : `SND.play('door')` → `door.wav`.

Format : WAV PCM 16 bits, mono, 44,1 kHz. Les volumes sont ceux du jeu (non normalisés).
Le jeu continue pour l’instant à générer ses sons en direct : ces fichiers ne sont pas encore chargés.
Les effets aléatoires (goutte, chaîne, étincelles, néon qui grésille, radio) sont une variante parmi d’autres.

| Dossier | Fichiers |
| --- | --- |
| `sound-effects/interface/` | `click` (clic), `tick` (survol d’un objet), `key` (touche du digicode), `error` (code faux), `success` (réussite), `zoom` (vue rapprochée), `flash` (lampe torche), `paper` (lecture d’une note) |
| `sound-effects/mechanics/` | `locked` (porte verrouillée), `lever` (levier), `power` (courant rétabli), `unlock` (verrou), `door` (porte), `locker` (casier), `lockerdoor` (porte de casier), `latch` (loquet), `boom` (impact), `neonflick` / `neonoff` / `neonon` (néons), `sparkle` (étincelles de la batterie), `sputter` (moteur qui cale), `genstart` (démarrage du générateur), `step` (pas), `press-green` / `press-red` / `press-blue` (boutons de la salle 2) |
| `sound-effects/tools/` | `cutlock` (pince sur un cadenas), `padfall` (cadenas qui tombe), `drill` (perceuse), `pour` (bidon d’essence versé) |
| `ambient/` | `creak` (grincement), `wind` (vent), `moan` (gémissement), `chain` (chaînes), `radio` (radio lointaine), `beepfar` (bip lointain), `slamfar` (porte qui claque au loin), `drip` (goutte d’eau), `clank` (choc métallique) |
