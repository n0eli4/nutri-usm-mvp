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
}

export const FOODS: Food[] = [
  { id: "marraqueta", name: "Marraqueta", category: "Panificados", portion: "1 unidad", grams: 80, kcal: 224, protein: 7, carbs: 43, fat: 1.5 },
  { id: "pan-integral", name: "Pan integral", category: "Panificados", portion: "1 rebanada", grams: 35, kcal: 88, protein: 4, carbs: 15, fat: 1.2 },
  { id: "avena", name: "Avena", category: "Cereales", portion: "½ taza", grams: 40, kcal: 150, protein: 5, carbs: 27, fat: 3 },
  { id: "arroz", name: "Arroz blanco cocido", category: "Cereales", portion: "1 taza", grams: 160, kcal: 205, protein: 4.3, carbs: 45, fat: 0.4 },
  { id: "fideos", name: "Fideos cocidos", category: "Cereales", portion: "1 taza", grams: 140, kcal: 220, protein: 8, carbs: 43, fat: 1.3 },
  { id: "huevo", name: "Huevo de gallina", category: "Proteínas", portion: "1 unidad", grams: 55, kcal: 78, protein: 6.3, carbs: 0.6, fat: 5.3 },
  { id: "pollo", name: "Pechuga de pollo", category: "Proteínas", portion: "1 unidad (120 g)", grams: 120, kcal: 198, protein: 37, carbs: 0, fat: 4.3 },
  { id: "carne", name: "Carne de vacuno", category: "Proteínas", portion: "1 filete (120 g)", grams: 120, kcal: 250, protein: 31, carbs: 0, fat: 13 },
  { id: "jamon", name: "Jamón de pavo", category: "Proteínas", portion: "2 láminas", grams: 40, kcal: 42, protein: 7, carbs: 1, fat: 1 },
  { id: "atun", name: "Atún en agua", category: "Proteínas", portion: "1 tarro chico", grams: 80, kcal: 92, protein: 20, carbs: 0, fat: 1 },
  { id: "salmon", name: "Salmón", category: "Proteínas", portion: "1 filete (120 g)", grams: 120, kcal: 248, protein: 26, carbs: 0, fat: 15 },
  { id: "lentejas", name: "Lentejas cocidas", category: "Legumbres", portion: "1 plato", grams: 200, kcal: 230, protein: 18, carbs: 40, fat: 0.8 },
  { id: "porotos", name: "Porotos cocidos", category: "Legumbres", portion: "1 plato", grams: 200, kcal: 254, protein: 15, carbs: 45, fat: 1 },
  { id: "leche", name: "Leche entera", category: "Lácteos", portion: "1 vaso", grams: 200, kcal: 122, protein: 6.6, carbs: 9.6, fat: 6.4 },
  { id: "yogur", name: "Yogur natural", category: "Lácteos", portion: "1 pote", grams: 125, kcal: 76, protein: 4.3, carbs: 5.9, fat: 4 },
  { id: "queso", name: "Queso gouda", category: "Lácteos", portion: "1 lámina", grams: 25, kcal: 89, protein: 6.3, carbs: 0.6, fat: 6.9 },
  { id: "manzana", name: "Manzana", category: "Frutas", portion: "1 unidad", grams: 150, kcal: 78, protein: 0.4, carbs: 21, fat: 0.2 },
  { id: "platano", name: "Plátano", category: "Frutas", portion: "1 unidad", grams: 120, kcal: 107, protein: 1.3, carbs: 27, fat: 0.3 },
  { id: "naranja", name: "Naranja", category: "Frutas", portion: "1 unidad", grams: 140, kcal: 66, protein: 1.3, carbs: 15, fat: 0.2 },
  { id: "palta", name: "Palta (aguacate)", category: "Frutas", portion: "½ unidad", grams: 75, kcal: 120, protein: 1.5, carbs: 6.4, fat: 11 },
  { id: "tomate", name: "Tomate", category: "Verduras", portion: "1 unidad", grams: 120, kcal: 22, protein: 1, carbs: 4.8, fat: 0.2 },
  { id: "lechuga", name: "Lechuga", category: "Verduras", portion: "1 taza", grams: 50, kcal: 8, protein: 0.7, carbs: 1.4, fat: 0.1 },
  { id: "papa", name: "Papa cocida", category: "Verduras", portion: "1 unidad", grams: 150, kcal: 130, protein: 3, carbs: 30, fat: 0.2 },
  { id: "nueces", name: "Nueces", category: "Snacks", portion: "1 puñado", grams: 30, kcal: 196, protein: 4.6, carbs: 4.1, fat: 19.6 },
  { id: "barra-cereal", name: "Barra de cereal", category: "Snacks", portion: "1 unidad", grams: 25, kcal: 100, protein: 1.5, carbs: 17, fat: 3 },
  { id: "proteina-polvo", name: "Proteína en polvo", category: "Snacks", portion: "1 scoop", grams: 30, kcal: 113, protein: 24, carbs: 2, fat: 1 },
  { id: "aceite-oliva", name: "Aceite de oliva", category: "Grasas", portion: "1 cucharada", grams: 14, kcal: 119, protein: 0, carbs: 0, fat: 13.5 },
];

export function foodById(id: string): Food | undefined {
  return FOODS.find((f) => f.id === id);
}
