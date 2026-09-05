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

interface DiaryContextValue {
  diary: Diary;
  goals: Goals;
  getDay: (dateKey: string) => DayMeals;
  addEntries: (meal: Meal, items: { foodId: string; servings: number }[], dateKey?: string) => void;
  removeEntry: (dateKey: string, meal: Meal, entryId: string) => void;
  setGoals: (g: Goals) => void;
}

const DiaryContext = createContext<DiaryContextValue | null>(null);

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
  const [goals, setGoals] = useState<Goals>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY + "-goals");
      if (raw) return JSON.parse(raw) as Goals;
    } catch {
      /* ignore */
    }
    return DEFAULT_GOALS;
  });

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
    }),
    [diary, goals],
  );

  return <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>;
}

export function useDiary(): DiaryContextValue {
  const ctx = useContext(DiaryContext);
  if (!ctx) throw new Error("useDiary must be used inside DiaryProvider");
  return ctx;
}

export { FOODS };
