import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { FOODS, foodById } from "@/data/foods";

export const MEALS = ["desayuno", "almuerzo", "once", "cena"] as const;
export type Meal = (typeof MEALS)[number];

export const MEAL_LABELS: Record<Meal, string> = {
  desayuno: "Desayuno",
  almuerzo: "Almuerzo",
  once: "Once",
  cena: "Cena",
};

export interface DiaryEntry {
  id: string;
  foodId: string;
  servings: number;
}

export type DayMeals = Record<Meal, DiaryEntry[]>;
export type Diary = Record<string, DayMeals>;

export interface Goals {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const DEFAULT_GOALS: Goals = { kcal: 2200, protein: 95, carbs: 250, fat: 70 };

const STORAGE_KEY = "nutriusm-diary-v1";

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function dateKeyOffset(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function emptyDay(): DayMeals {
  return { desayuno: [], almuerzo: [], once: [], cena: [] };
}

let entrySeq = 0;
function makeEntry(foodId: string, servings: number): DiaryEntry {
  entrySeq += 1;
  return { id: `${Date.now().toString(36)}-${entrySeq}`, foodId, servings };
}

function seedDiary(): Diary {
  const d1 = dateKeyOffset(1);
  const d2 = dateKeyOffset(2);
  return {
    [d1]: {
      desayuno: [makeEntry("avena", 1.5), makeEntry("leche", 1), makeEntry("platano", 1)],
      almuerzo: [makeEntry("pollo", 1), makeEntry("arroz", 1), makeEntry("tomate", 1), makeEntry("aceite-oliva", 1)],
      once: [makeEntry("marraqueta", 1), makeEntry("palta", 1)],
      cena: [makeEntry("lentejas", 1), makeEntry("pan-integral", 1)],
    },
    [d2]: {
      desayuno: [makeEntry("marraqueta", 1), makeEntry("huevo", 2), makeEntry("naranja", 1)],
      almuerzo: [makeEntry("porotos", 1), makeEntry("lechuga", 1)],
      once: [makeEntry("yogur", 1), makeEntry("barra-cereal", 1)],
      cena: [makeEntry("salmon", 1), makeEntry("papa", 1), makeEntry("tomate", 1)],
    },
  };
}

export interface Totals {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function totalsFor(day: DayMeals): Totals {
  const t: Totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  for (const meal of MEALS) {
    for (const e of day[meal]) {
      const f = foodById(e.foodId);
      if (!f) continue;
      t.kcal += f.kcal * e.servings;
      t.protein += f.protein * e.servings;
      t.carbs += f.carbs * e.servings;
      t.fat += f.fat * e.servings;
    }
  }
  return t;
}

export interface SavedMeal {
  id: string;
  name: string;
  items: { foodId: string; servings: number }[];
}

export interface UserPost {
  id: string;
  author: string;
  career: string;
  initials: string;
  timeAgo: string;
  text: string;
  kind: "tip" | "registro" | "receta";
  attachment?: { title: string; detail: string };
}

const SEED_SAVED_MEALS: SavedMeal[] = [
  {
    id: "sm-desayuno-rapido",
    name: "Desayuno rápido",
    items: [
      { foodId: "avena", servings: 1 },
      { foodId: "leche", servings: 1 },
      { foodId: "platano", servings: 1 },
    ],
  },
  {
    id: "sm-almuerzo-casino",
    name: "Almuerzo del casino",
    items: [
      { foodId: "pollo", servings: 1 },
      { foodId: "arroz", servings: 1 },
      { foodId: "lechuga", servings: 1 },
    ],
  },
  {
    id: "sm-once-clasica",
    name: "Once clásica",
    items: [
      { foodId: "marraqueta", servings: 1 },
      { foodId: "palta", servings: 1 },
      { foodId: "jamon", servings: 1 },
    ],
  },
];

const SEED_FAVORITES = ["huevo", "platano", "pollo", "yogur"];

interface DiaryContextValue {
  diary: Diary;
  goals: Goals;
  getDay: (dateKey: string) => DayMeals;
  addEntries: (meal: Meal, items: { foodId: string; servings: number }[], dateKey?: string) => void;
  removeEntry: (dateKey: string, meal: Meal, entryId: string) => void;
  setGoals: (g: Goals) => void;
  favorites: string[];
  toggleFavorite: (foodId: string) => void;
  isFavorite: (foodId: string) => boolean;
  savedMeals: SavedMeal[];
  saveMeal: (name: string, items: { foodId: string; servings: number }[]) => void;
  removeSavedMeal: (id: string) => void;
  posts: UserPost[];
  addPost: (post: Omit<UserPost, "id" | "timeAgo">) => void;
}

const DiaryContext = createContext<DiaryContextValue | null>(null);

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* ignore */
  }
  return fallback;
}

function loadDiary(): Diary {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Diary;
  } catch {
    /* ignore */
  }
  return seedDiary();
}

export function DiaryProvider({ children }: { children: ReactNode }) {
  const [diary, setDiary] = useState<Diary>(() => loadDiary());
  const [goals, setGoals] = useState<Goals>(() => loadJSON(STORAGE_KEY + "-goals", DEFAULT_GOALS));
  const [favorites, setFavorites] = useState<string[]>(() =>
    loadJSON(STORAGE_KEY + "-favs", SEED_FAVORITES),
  );
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>(() =>
    loadJSON(STORAGE_KEY + "-saved", SEED_SAVED_MEALS),
  );
  const [posts, setPosts] = useState<UserPost[]>(() => loadJSON<UserPost[]>(STORAGE_KEY + "-posts", []));

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + "-favs", JSON.stringify(favorites));
      localStorage.setItem(STORAGE_KEY + "-saved", JSON.stringify(savedMeals));
      localStorage.setItem(STORAGE_KEY + "-posts", JSON.stringify(posts));
    } catch {
      /* ignore */
    }
  }, [favorites, savedMeals, posts]);


  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(diary));
    } catch {
      /* ignore */
    }
  }, [diary]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + "-goals", JSON.stringify(goals));
    } catch {
      /* ignore */
    }
  }, [goals]);

  const value = useMemo<DiaryContextValue>(
    () => ({
      diary,
      goals,
      getDay: (dateKey) => diary[dateKey] ?? emptyDay(),
      addEntries: (meal, items, dateKey = todayKey()) =>
        setDiary((prev) => {
          const day = prev[dateKey] ?? emptyDay();
          return {
            ...prev,
            [dateKey]: {
              ...day,
              [meal]: [...day[meal], ...items.map((i) => makeEntry(i.foodId, i.servings))],
            },
          };
        }),
      removeEntry: (dateKey, meal, entryId) =>
        setDiary((prev) => {
          const day = prev[dateKey] ?? emptyDay();
          return {
            ...prev,
            [dateKey]: { ...day, [meal]: day[meal].filter((e) => e.id !== entryId) },
          };
        }),
      setGoals,
      favorites,
      isFavorite: (foodId) => favorites.includes(foodId),
      toggleFavorite: (foodId) =>
        setFavorites((prev) =>
          prev.includes(foodId) ? prev.filter((f) => f !== foodId) : [...prev, foodId],
        ),
      savedMeals,
      saveMeal: (name, items) =>
        setSavedMeals((prev) => [
          { id: `sm-${Date.now().toString(36)}`, name, items },
          ...prev,
        ]),
      removeSavedMeal: (id) => setSavedMeals((prev) => prev.filter((m) => m.id !== id)),
      posts,
      addPost: (post) =>
        setPosts((prev) => [
          { ...post, id: `up-${Date.now().toString(36)}`, timeAgo: "recién" },
          ...prev,
        ]),
    }),
    [diary, goals, favorites, savedMeals, posts],
  );


  return <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>;
}

export function useDiary(): DiaryContextValue {
  const ctx = useContext(DiaryContext);
  if (!ctx) throw new Error("useDiary must be used inside DiaryProvider");
  return ctx;
}

export { FOODS };
