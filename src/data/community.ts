export interface CommunityPost {
  id: string;
  author: string;
  career: string;
  initials: string;
  timeAgo: string;
  text: string;
  kind: "tip" | "registro" | "receta";
  attachment?: { title: string; detail: string };
}

export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "p1",
    author: "Cata Riquelme",
    career: "Ing. Civil Industrial",
    initials: "CR",
    timeAgo: "hace 20 min",
    kind: "registro",
    text: "Almuerzo del casino de hoy: pollo con arroz y ensalada. Me quedó justo dentro de mi meta 💪",
    attachment: { title: "Pollo con arroz y ensalada", detail: "436 kcal · P 42g · C 46g · G 8g" },
  },
  {
    id: "p2",
    author: "Matías Soto",
    career: "Arquitectura",
    initials: "MS",
    timeAgo: "hace 1 h",
    kind: "tip",
    text: "Tip: dejar avena remojada la noche antes me salva las mañanas con clases a las 8:15.",
  },
  {
    id: "p3",
    author: "Javiera Núñez",
    career: "Bioquímica",
    initials: "JN",
    timeAgo: "hace 3 h",
    kind: "receta",
    text: "Comparto mi ensalada de atún: barata, rápida y con harta proteína para después del gimnasio.",
    attachment: { title: "Ensalada de atún liviana", detail: "285 kcal · P 24g · C 11g · G 15g" },
  },
  {
    id: "p4",
    author: "Ignacio Vera",
    career: "Ing. Informática",
    initials: "IV",
    timeAgo: "hace 5 h",
    kind: "tip",
    text: "Llevar fruta en la mochila me sacó del ciclo de máquina de snacks entre ramos.",
  },
  {
    id: "p5",
    author: "Fernanda Lagos",
    career: "Nutrición",
    initials: "FL",
    timeAgo: "ayer",
    kind: "tip",
    text: "Recordatorio: si entrenas en la tarde, no te saltes la once. Pan integral con palta y listo.",
  },
  {
    id: "p6",
    author: "Diego Contreras",
    career: "Ing. Mecánica",
    initials: "DC",
    timeAgo: "ayer",
    kind: "registro",
    text: "Cena post laboratorio: lentejas con pan integral. Barato y me dejó lleno.",
    attachment: { title: "Lentejas power", detail: "318 kcal · P 22g · C 55g · G 2g" },
  },
];
