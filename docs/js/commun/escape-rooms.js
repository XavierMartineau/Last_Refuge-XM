/* Catalogue des escape rooms du pénitencier.
   difficulty : 1 à 5 · rooms : nombre de salles · minutes : [durée min, durée max] estimée
   url : page jouable (null = en préparation). Ajoutez une entrée ici pour publier une nouvelle escape room. */
window.LAST_REFUGE_ESCAPE_ROOMS = [
  {
    id: "sas-07",
    code: "SAS 07",
    name: "Bunker nord",
    sector: "Sous-sol du bloc C · Bunker de commandement",
    difficulty: 4,
    rooms: 12,
    minutes: [60, 90],
    url: "../escape-room/escape-room.html",
    tags: ["3D", "Combat", "Énigmes", "Électricité"],
    description: "Traversez les 12 salles du bunker sous le pénitencier : relancez le générateur, forcez la chambre forte et atteignez la zone d’évacuation.",
    narration: "Vous reprenez conscience dans un sas plongé dans le noir. Les sirènes se sont tues depuis longtemps ; seul le grésillement d’une radio vous rappelle que le bunker de commandement devait servir de dernier refuge aux gardiens. Votre lampe torche fonctionne encore. Derrière la porte blindée, l’électricité est coupée, les cellules sont ouvertes et quelque chose gratte contre les murs. Pour rejoindre la zone d’évacuation, il faudra rétablir le courant, trouver les codes des gardiens… et ne pas rester trop longtemps au même endroit."
  },
  {
    id: "bloc-c",
    code: "BLOC C",
    name: "Couloir des cellules",
    sector: "Quartier de détention",
    difficulty: 2,
    rooms: 5,
    minutes: [25, 40],
    url: null,
    tags: ["Fouille", "Crochetage", "Initiation"],
    description: "Une évasion d’initiation : sortez de votre cellule, fouillez celles des voisins et ouvrez la grille du couloir.",
    narration: "La porte de votre cellule s’est déverrouillée pendant la nuit, en même temps que toutes les autres. Le couloir est silencieux, mais les lits voisins sont vides et le sol est marqué de traînées sombres. Le surveillant a laissé son trousseau quelque part dans le bloc : retrouvez-le avant que les détenus disparus ne reviennent."
  },
  {
    id: "infirmerie",
    code: "INF-3",
    name: "Patient zéro",
    sector: "Aile médicale",
    difficulty: 3,
    rooms: 7,
    minutes: [45, 60],
    url: null,
    tags: ["Énigmes", "Laboratoire", "Infiltration"],
    description: "Dans l’infirmerie condamnée, reconstituez le dossier du premier détenu infecté pour récupérer l’antidote expérimental.",
    narration: "Tout a commencé ici. Les registres parlent d’un détenu transféré de nuit depuis une base militaire, d’une fièvre qui ne baissait pas et d’un médecin qui a fini par s’enfermer avec ses notes. Les vitres sont couvertes de mains ensanglantées. Si un remède existe, il se trouve derrière la porte du laboratoire."
  },
  {
    id: "armurerie",
    code: "ARM-1",
    name: "Dernière cartouche",
    sector: "Armurerie et mirador",
    difficulty: 5,
    rooms: 9,
    minutes: [75, 120],
    url: null,
    tags: ["Combat", "Survie", "Expert"],
    description: "Rejoignez l’armurerie puis le mirador nord sous la pression d’une horde, avec des munitions comptées.",
    narration: "Le haut-parleur du mirador nord crache le même message en boucle : « Hélicoptère d’extraction à l’aube. Un seul passage. » Entre vous et le toit, il y a l’armurerie verrouillée, la cour de promenade et deux cents détenus qui ne dorment plus. Chaque balle compte."
  }
];
