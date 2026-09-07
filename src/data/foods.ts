export interface Food {
  id: string;
  name: string;
  category: string;
  portion: string; // descripción de la porción
  grams: number; // gramos por porción
  kcal: number;
  protein: number; // gramos
  carbs: number; // gramos
  fat: number; // gramos
  fiber: number; // gramos
  sugar: number; // gramos
  sodium: number; // miligramos
}

export const FOODS: Food[] = [
  { id: "marraqueta", name: "Marraqueta", category: "Panificados", portion: "1 unidad", grams: 80, kcal: 224, protein: 7, carbs: 43, fat: 1.5 , fiber: 2.2, sugar: 1.5, sodium: 430 },
  { id: "pan-integral", name: "Pan integral", category: "Panificados", portion: "1 rebanada", grams: 35, kcal: 88, protein: 4, carbs: 15, fat: 1.2 , fiber: 2.4, sugar: 1.2, sodium: 150 },
  { id: "avena", name: "Avena", category: "Cereales", portion: "½ taza", grams: 40, kcal: 150, protein: 5, carbs: 27, fat: 3 , fiber: 4.2, sugar: 0.4, sodium: 2 },
  { id: "arroz", name: "Arroz blanco cocido", category: "Cereales", portion: "1 taza", grams: 160, kcal: 205, protein: 4.3, carbs: 45, fat: 0.4 , fiber: 0.6, sugar: 0.1, sodium: 2 },
  { id: "fideos", name: "Fideos cocidos", category: "Cereales", portion: "1 taza", grams: 140, kcal: 220, protein: 8, carbs: 43, fat: 1.3 , fiber: 2.5, sugar: 0.8, sodium: 5 },
  { id: "huevo", name: "Huevo de gallina", category: "Proteínas", portion: "1 unidad", grams: 55, kcal: 78, protein: 6.3, carbs: 0.6, fat: 5.3 , fiber: 0, sugar: 0.6, sodium: 62 },
  { id: "pollo", name: "Pechuga de pollo", category: "Proteínas", portion: "1 unidad (120 g)", grams: 120, kcal: 198, protein: 37, carbs: 0, fat: 4.3 , fiber: 0, sugar: 0, sodium: 88 },
  { id: "carne", name: "Carne de vacuno", category: "Proteínas", portion: "1 filete (120 g)", grams: 120, kcal: 250, protein: 31, carbs: 0, fat: 13 , fiber: 0, sugar: 0, sodium: 72 },
  { id: "jamon", name: "Jamón de pavo", category: "Proteínas", portion: "2 láminas", grams: 40, kcal: 42, protein: 7, carbs: 1, fat: 1 , fiber: 0, sugar: 0.8, sodium: 620 },
  { id: "atun", name: "Atún en agua", category: "Proteínas", portion: "1 tarro chico", grams: 80, kcal: 92, protein: 20, carbs: 0, fat: 1 , fiber: 0, sugar: 0, sodium: 280 },
  { id: "salmon", name: "Salmón", category: "Proteínas", portion: "1 filete (120 g)", grams: 120, kcal: 248, protein: 26, carbs: 0, fat: 15 , fiber: 0, sugar: 0, sodium: 60 },
  { id: "lentejas", name: "Lentejas cocidas", category: "Legumbres", portion: "1 plato", grams: 200, kcal: 230, protein: 18, carbs: 40, fat: 0.8 , fiber: 15.8, sugar: 3.6, sodium: 8 },
  { id: "porotos", name: "Porotos cocidos", category: "Legumbres", portion: "1 plato", grams: 200, kcal: 254, protein: 15, carbs: 45, fat: 1 , fiber: 15, sugar: 0.6, sodium: 10 },
  { id: "leche", name: "Leche entera", category: "Lácteos", portion: "1 vaso", grams: 200, kcal: 122, protein: 6.6, carbs: 9.6, fat: 6.4 , fiber: 0, sugar: 9.6, sodium: 100 },
  { id: "yogur", name: "Yogur natural", category: "Lácteos", portion: "1 pote", grams: 125, kcal: 76, protein: 4.3, carbs: 5.9, fat: 4 , fiber: 0, sugar: 5.9, sodium: 70 },
  { id: "queso", name: "Queso gouda", category: "Lácteos", portion: "1 lámina", grams: 25, kcal: 89, protein: 6.3, carbs: 0.6, fat: 6.9 , fiber: 0, sugar: 0.5, sodium: 205 },
  { id: "manzana", name: "Manzana", category: "Frutas", portion: "1 unidad", grams: 150, kcal: 78, protein: 0.4, carbs: 21, fat: 0.2 , fiber: 3.6, sugar: 15.8, sodium: 2 },
  { id: "platano", name: "Plátano", category: "Frutas", portion: "1 unidad", grams: 120, kcal: 107, protein: 1.3, carbs: 27, fat: 0.3 , fiber: 3.1, sugar: 14.4, sodium: 1 },
  { id: "naranja", name: "Naranja", category: "Frutas", portion: "1 unidad", grams: 140, kcal: 66, protein: 1.3, carbs: 15, fat: 0.2 , fiber: 3.4, sugar: 12, sodium: 0 },
  { id: "palta", name: "Palta (aguacate)", category: "Frutas", portion: "½ unidad", grams: 75, kcal: 120, protein: 1.5, carbs: 6.4, fat: 11 , fiber: 5, sugar: 0.5, sodium: 6 },
  { id: "tomate", name: "Tomate", category: "Verduras", portion: "1 unidad", grams: 120, kcal: 22, protein: 1, carbs: 4.8, fat: 0.2 , fiber: 1.4, sugar: 3.2, sodium: 6 },
  { id: "lechuga", name: "Lechuga", category: "Verduras", portion: "1 taza", grams: 50, kcal: 8, protein: 0.7, carbs: 1.4, fat: 0.1 , fiber: 0.6, sugar: 0.4, sodium: 5 },
  { id: "papa", name: "Papa cocida", category: "Verduras", portion: "1 unidad", grams: 150, kcal: 130, protein: 3, carbs: 30, fat: 0.2 , fiber: 3.1, sugar: 1.2, sodium: 8 },
  { id: "nueces", name: "Nueces", category: "Snacks", portion: "1 puñado", grams: 30, kcal: 196, protein: 4.6, carbs: 4.1, fat: 19.6 , fiber: 2, sugar: 0.8, sodium: 1 },
  { id: "barra-cereal", name: "Barra de cereal", category: "Snacks", portion: "1 unidad", grams: 25, kcal: 100, protein: 1.5, carbs: 17, fat: 3 , fiber: 1.2, sugar: 7, sodium: 60 },
  { id: "proteina-polvo", name: "Proteína en polvo", category: "Snacks", portion: "1 scoop", grams: 30, kcal: 113, protein: 24, carbs: 2, fat: 1 , fiber: 1, sugar: 1.5, sodium: 120 },
  { id: "aceite-oliva", name: "Aceite de oliva", category: "Grasas", portion: "1 cucharada", grams: 14, kcal: 119, protein: 0, carbs: 0, fat: 13.5 , fiber: 0, sugar: 0, sodium: 0 },
];

export const CATEGORY_ICON: Record<string, string> = {
  Panificados: "🥖",
  Cereales: "🌾",
  "Proteínas": "🍗",
  Legumbres: "🫘",
  "Lácteos": "🥛",
  Frutas: "🍎",
  Verduras: "🥗",
  Snacks: "🥜",
  Grasas: "🫒",
};

export function categoryIcon(category: string): string {
  return CATEGORY_ICON[category] ?? "🍽️";
}

/**
 * Alternativas compatibles con las metas: si el alimento es alto en grasa
 * sugiere opciones más magras, si es alto en calorías sugiere más livianas,
 * y en general prioriza mejor densidad de proteína y menos sodio.
 */
export interface FoodAlternative {
  food: Food;
  reason: string;
}

export function alternativesFor(food: Food, limit = 3): FoodAlternative[] {
  const highFat = food.fat >= 10;
  const highKcal = food.kcal >= 200;
  const highSodium = food.sodium >= 300;

  const scored = FOODS.filter((f) => f.id !== food.id && f.category === food.category)
    .concat(FOODS.filter((f) => f.id !== food.id && f.category !== food.category))
    .filter((f) => f.kcal <= food.kcal || f.protein > food.protein)
    .map((f) => {
      let score = 0;
      const reasons: string[] = [];
      if (highFat && f.fat < food.fat - 2) {
        score += 3;
        reasons.push(`${(food.fat - f.fat).toFixed(1)} g menos de grasa`);
      }
      if (highKcal && f.kcal <= food.kcal - 40) {
        score += 2;
        reasons.push(`${Math.round(food.kcal - f.kcal)} kcal menos`);
      }
      if (highSodium && f.sodium <= food.sodium / 2) {
        score += 2;
        reasons.push("menos sodio");
      }
      if (f.protein >= food.protein + 3) {
        score += 2;
        reasons.push(`+${(f.protein - food.protein).toFixed(0)} g de proteína`);
      }
      if (f.fiber >= food.fiber + 2) {
        score += 1;
        reasons.push(`+${(f.fiber - food.fiber).toFixed(0)} g de fibra`);
      }
      if (f.category === food.category) score += 1;
      return { food: f, score, reason: reasons.slice(0, 2).join(" · ") || "opción equilibrada" };
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ food: f, reason }) => ({ food: f, reason }));
}

export function foodById(id: string): Food | undefined {
  return FOODS.find((f) => f.id === id);
}
