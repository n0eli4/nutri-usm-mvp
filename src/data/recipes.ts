import { foodById } from "./foods";

export interface RecipeItem {
  foodId: string;
  servings: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  tags: string[];
  items: RecipeItem[];
  estimatedCost?: number;
  estimatedMinutes?: number;
}

export const RECIPES: Recipe[] = [
  {
    id: "avena-proteica",
    name: "Avena proteica de mañana",
    description: "Rápida, barata y te deja lleno hasta el almuerzo.",
    tags: ["Alto en proteína", "Económica", "Rápida"],
    estimatedCost: 1200,
    estimatedMinutes: 5,
    items: [
      { foodId: "avena", servings: 1 },
      { foodId: "leche", servings: 1 },
      { foodId: "proteina-polvo", servings: 1 },
      { foodId: "platano", servings: 1 },
    ],
  },
  {
    id: "pollo-arroz",
    name: "Pollo con arroz y ensalada",
    description: "El clásico del casino, equilibrado y saciante.",
    tags: ["Alto en proteína", "Equilibrada"],
    estimatedCost: 2800,
    estimatedMinutes: 25,
    items: [
      { foodId: "pollo", servings: 1 },
      { foodId: "arroz", servings: 1 },
      { foodId: "lechuga", servings: 1 },
      { foodId: "tomate", servings: 1 },
      { foodId: "aceite-oliva", servings: 0.5 },
    ],
  },
  {
    id: "ensalada-atun",
    name: "Ensalada de atún liviana",
    description: "Menos de 300 kcal y mucha proteína.",
    tags: ["Bajo en calorías", "Alto en proteína", "Rápida"],
    estimatedCost: 1500,
    estimatedMinutes: 10,
    items: [
      { foodId: "atun", servings: 1 },
      { foodId: "lechuga", servings: 2 },
      { foodId: "tomate", servings: 1 },
      { foodId: "aceite-oliva", servings: 0.5 },
    ],
  },
  {
    id: "once-palta",
    name: "Once con palta",
    description: "Grasas buenas para la tarde de estudio.",
    tags: ["Vegetariana", "Rápida"],
    estimatedCost: 1000,
    estimatedMinutes: 5,
    items: [
      { foodId: "marraqueta", servings: 1 },
      { foodId: "palta", servings: 1 },
      { foodId: "tomate", servings: 1 },
    ],
  },
  {
    id: "lentejas-power",
    name: "Lentejas power",
    description: "Legumbres + pan integral: fibra y energía barata.",
    tags: ["Vegetariana", "Económica", "Alta en fibra"],
    estimatedCost: 1800,
    estimatedMinutes: 30,
    items: [
      { foodId: "lentejas", servings: 1 },
      { foodId: "pan-integral", servings: 1 },
    ],
  },
  {
    id: "snack-estudio",
    name: "Snack de estudio",
    description: "Para la noche de pruebas sin pasarte de calorías.",
    tags: ["Bajo en calorías", "Rápida"],
    estimatedCost: 900,
    estimatedMinutes: 2,
    items: [
      { foodId: "yogur", servings: 1 },
      { foodId: "manzana", servings: 1 },
    ],
  },
];

export function recipeTotals(items: RecipeItem[]) {
  const t = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  for (const i of items) {
    const f = foodById(i.foodId);
    if (!f) continue;
    t.kcal += f.kcal * i.servings;
    t.protein += f.protein * i.servings;
    t.carbs += f.carbs * i.servings;
    t.fat += f.fat * i.servings;
  }
  return t;
}

export const RECIPE_TAGS = [
  "Alto en proteína",
  "Bajo en calorías",
  "Vegetariana",
  "Económica",
  "Rápida",
];
