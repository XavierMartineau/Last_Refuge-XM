/* LAST REFUGE · XM — Données du créateur : palettes (palettes.json), nombre de choix, noms, étiquettes, valeurs par défaut et étapes.
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */

// palettes, listes de noms et préréglages d’espèces : voir palettes.json
const D=await (await fetch(new URL('./palettes.json',import.meta.url))).json();
const LEN={species:14,skin:14,face:8,eyes:14,eyeColor:12,brows:10,nose:9,mouth:13,beard:10,hair:{male:14,female:13,other:10},hairColor:14,outfit:10,outfitColor:10,glasses:12,headwear:18,accColor:14,extra:17,specialBack:4,specialHead:4,specialFace:4,background:20,pattern:7,nameFont:12,nameColor:14,nameStyle:6,nameSize:4,namePos:2};
const NAMES={
  face:['Ovale','Rond','Carré','Allongé','Anguleux','Pointu','Doux','Large'],
  eyes:['Ronds naturels','Amande','Grands yeux','Petits yeux','Mi-clos','Endormis','Sévères','Doux','Pupille en fente','Lumineux','Noirs','Blancs','Cybernétiques','Cernés'],
  brows:['Aucun','Naturels','Épais','Fins arqués','Droits','En colère','Tristes','Longs','Courts','Broussailleux'],
  nose:['Petit','Droit','Long','Large','Pointu','Retroussé','Aquilin','Plat','Bulbeux'],
  mouth:['Neutre','Sourire','Grand sourire','Moue','Ouverte','Sourire en coin','Cri','Dents serrées','Crocs','Langue','Petite','Lèvres épaisses','Moqueur'],
  beard:['Aucune','Trois jours','Moustache','Bouc','Courte','Pleine','Longue','Favoris','Mentonnière','Tressée'],
  hair:{male:['Aucun','Courts','Rasés','Undercut','Hérissés','Banane','Mèche','Mi-longs','Longs','Queue de cheval','Chignon','Crête','Afro','Bouclés'],
        female:['Aucun','Courts','Carré','Carré long','Longs lisses','Longs bouclés','Queue de cheval','Couettes','Chignon','Tresses','Frange et longs','Mi-longs','Afro'],
        other:['Aucun','Courts','Hérissés','Crête','Longs','Chignon','Tresses','Afro','Bouclés','Queue de cheval']},
  outfit:['Tee-shirt','Manches longues','Sweat à capuche','Veste de survie','Gilet tactique','Manteau long','Débardeur','Plaque de blindage','Poncho','Blouse de laboratoire'],
  glasses:['Aucune','Rondes','Carrées','Aviateur','Soleil','Tactiques','Monocle','Visière','Cache-œil','Soudeur','Cyber-visière','Demi-lunes'],
  headwear:['Aucun','Bonnet','Casquette','Casque militaire','Bandana','Bandeau','Chapeau à large bord','Casque de chantier','Chapka','Cagoule','Béret','Capuche','Chapeau de cowboy','Casque audio','Masque à gaz','Casque tactique','Haut-de-forme','Couronne'],
  extra:['Aucun','Taches de rousseur','Cicatrice','Pansement','Boucles d’oreilles','Piercing au nez','Tatouage','Peinture de guerre','Masque chirurgical','Écharpe','Plaques d’identité','Cernes','Larme tatouée','Bandage','Griffures','Piercing sourcil','Foulard'],
  specialBack:['Aucun','Ailes de chauve-souris','Ailes de plumes','Appendices mutants'],
  specialHead:['Aucun','Cornes','Antennes','Crête mutante'],
  specialFace:['Aucun','Cicatrices','Implant cybernétique','Marques mutantes']
};
const LABEL={species:'Style (espèce)',skin:'Teint',face:'Visage',eyes:'Yeux',eyeColor:'Couleur yeux',brows:'Sourcils',nose:'Nez',mouth:'Bouche',beard:'Barbe',hair:'Cheveux',hairColor:'Couleur cheveux',outfit:'Tenue',outfitColor:'Couleur tenue',glasses:'Lunettes',headwear:'Couvre-chef',extra:'Détail',specialBack:'Ailes et appendices',specialHead:'Cornes et antennes',specialFace:'Détails spéciaux',background:'Fond',accColor:'Couleur couvre-chef',pattern:'Motif du fond',nameFont:'Police du nom',nameColor:'Couleur du nom',nameStyle:'Style du nom',nameSize:'Taille',namePos:'Position'};
const GENDERS={male:'Homme',female:'Femme',other:'Autres'};
const DEF={species:1,skin:3,face:0,eyes:0,eyeColor:1,brows:1,nose:0,mouth:0,beard:0,hair:3,hairColor:2,outfit:0,outfitColor:0,glasses:0,headwear:0,extra:0,specialBack:0,specialHead:0,specialFace:0,background:0,accColor:0,pattern:0,nameFont:0,nameColor:0,nameStyle:0,nameSize:1,namePos:0};
const STEPS=[{t:'1. Base',keys:['species','skin','face','eyes','eyeColor','brows','nose','mouth','beard','hair','hairColor','outfit','outfitColor']},
  {t:'2. Accessoires',keys:['headwear','accColor','glasses','extra','specialBack','specialHead','specialFace']},
  {t:'3. Fond & nom',keys:['background','pattern','nameFont','nameColor','nameStyle','nameSize','namePos']}];
const STEP_DETAILS=[['La base','Choisissez la silhouette et les traits de votre survivant.'],['Les accessoires','Complétez votre équipement avant la mission.'],['Fond & nom','Terminez votre portrait et exportez votre personnage en JSON ou en .glb.']];
const emptyChoices=new Set(['hair','beard','glasses','headwear','extra']);
Object.assign(LEN,{camo:6,pants:9,pantsColor:10,boots:9,bootsColor:8,gloves:8,glovesColor:8,arms:9,gear:9,backpack:8});
Object.assign(NAMES,{
  camo:['Uni','Woodland','Désert','Urbain','Numérique','Neige'],
  pants:['Jean droit','Pantalon cargo','Treillis camouflage','Pantalon tactique','Combinaison de travail','Short cargo','Jogging','Pantalon en cuir','Pantalon à genouillères'],
  boots:['Baskets','Rangers','Bottes hautes en cuir','Bottes en caoutchouc','Chaussures de ville','Bottes du désert','Bottes de neige','Rangers à bout renforcé','Sandales'],
  gloves:['Aucun','Gants en cuir','Gants tactiques','Mitaines','Gants de travail','Gants d’hiver','Gants médicaux','Gants de mécanicien'],
  arms:['Aucun','Bandage','Brassard rouge','Montre','Manchette en cuir','Coudières','Bracelets métalliques','Tatouage manches','Protège-bras'],
  gear:['Aucun','Ceinture tactique','Holster de cuisse','Bandoulière à cartouches','Sacoches de ceinture','Radio portative','Gourde et couteau','Harnais complet','Sangles de parachutiste'],
  backpack:['Aucun','Sac tactique','Sac de randonnée','Sac d’assaut','Sac radio','Sac médical','Sac avec couchage','Gros sac militaire']});
Object.assign(LABEL,{camo:'Motif de la tenue',pants:'Pantalon',pantsColor:'Couleur pantalon',boots:'Bottes',bootsColor:'Couleur bottes',gloves:'Gants',glovesColor:'Couleur gants',arms:'Bras (détails)',gear:'Équipement',backpack:'Sac à dos'});
Object.assign(DEF,{outfit:3,outfitColor:0,camo:1,pants:2,pantsColor:1,boots:1,bootsColor:0,gloves:2,glovesColor:0,arms:0,gear:1,backpack:0,hair:1,hairColor:2,headwear:0});
['gloves','arms','gear','backpack'].forEach(k=>emptyChoices.add(k));
STEPS.length=0;
STEPS.push(
  {t:'1. Base',keys:['species','skin','face','eyes','eyeColor','brows','nose','mouth','beard','hair','hairColor']},
  {t:'2. Tenue',keys:['outfit','outfitColor','camo','pants','pantsColor','boots','bootsColor','gloves','glovesColor','arms']},
  {t:'3. Équipement',keys:['headwear','accColor','glasses','extra','gear','backpack','specialBack','specialHead','specialFace']},
  {t:'4. Arme à feu',keys:['weapon','wMuzzle','wOptic','wUnder','wStock','wMag','wFinish']},
  {t:'5. Fond & nom',keys:['background','pattern','nameFont','nameColor','nameStyle','nameSize','namePos']});
STEP_DETAILS.length=0;
STEP_DETAILS.push(['La base','Choisissez les traits de votre survivant : visage, cheveux, barbe…'],['La tenue','Haut, camouflage, pantalon, bottes, gants et détails des bras.'],['L’équipement','Casque ou chapeau, lunettes, ceinture, holster, sac à dos et particularités.'],['Personnalisation de l’arme à feu','Choisissez parmi 6 armes puis changez l’embout, l’optique, la crosse, le chargeur et la finition : les caractéristiques se mettent à jour.'],['Fond & nom','Terminez votre portrait puis exportez-le en JSON, en .glb ou en image.']);

export {D,LEN,NAMES,LABEL,GENDERS,DEF,STEPS,STEP_DETAILS,emptyChoices};
