import { Cookie, Moon, Sun, Sunrise, Sunset, type LucideIcon } from "lucide-react";
import type { Meal } from "@/lib/diary-store";

/** Ícono y color de cada comida, iguales en Inicio y Diario. */
export const MEAL_ICONS: Record<Meal, LucideIcon> = {
  desayuno: Sunrise,
  almuerzo: Sun,
  once: Sunset,
  cena: Moon,
  snack: Cookie,
};

export const MEAL_TINT: Record<Meal, string> = {
  desayuno: "bg-amber-100 text-amber-700",
  almuerzo: "bg-emerald-100 text-emerald-700",
  once: "bg-orange-100 text-orange-700",
  cena: "bg-indigo-100 text-indigo-700",
  snack: "bg-rose-100 text-rose-700",
};

/** "Snack" ocupa todo el ancho bajo la grilla de 2x2 de las comidas principales. */
export function mealSpan(meal: Meal): string {
  return meal === "snack" ? "col-span-2" : "";
}

export function MealBadge({
  meal,
  className = "h-8 w-8 rounded-xl",
  iconClassName = "h-4 w-4",
}: Readonly<{ meal: Meal; className?: string; iconClassName?: string }>) {
  const Icon = MEAL_ICONS[meal];
  return (
    <span className={`grid shrink-0 place-items-center ${MEAL_TINT[meal]} ${className}`}>
      <Icon aria-hidden className={iconClassName} />
    </span>
  );
}
