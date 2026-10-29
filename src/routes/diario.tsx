import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  Flame,
  Bookmark,
  Plus,
  Minus,
  Star,
  X,
  CalendarDays,
  Sparkles,
  UtensilsCrossed,
  Salad,
} from "lucide-react";
import { toast } from "sonner";
import { foodById } from "@/data/foods";
import { FoodIcon } from "@/components/food-icon";
import {
  MEALS,
  MEAL_LABELS,
  dateKeyOffset,
  todayKey,
  totalsFor,
  useDiary,
  type Meal,
  type SavedMeal,
} from "@/lib/diary-store";

export const Route = createFileRoute("/diario")({
  head: () => ({
    meta: [
      { title: "Diario del día — NUTRIUSM" },
      {
        name: "description",
        content:
          "Revisa desayuno, almuerzo, once y cena, con totales del día y tus comidas guardadas para repetir en un clic.",
      },
      { property: "og:title", content: "Diario del día — NUTRIUSM" },
      {
        property: "og:description",
        content:
          "Revisa desayuno, almuerzo, once y cena, con totales del día y tus comidas guardadas para repetir en un clic.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { date?: string } => {
    const { date } = search;
    return typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) ? { date } : {};
  },
  component: DiarioPage,
});

const MIN_SERVINGS = 0.5;
const MAX_SERVINGS = 10;
const SERVING_STEP = 0.5;

function formatDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  if (daysAgo === 0) return "Hoy";
  if (daysAgo === 1) return "Ayer";
  return d.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "short" });
}

function savedMealKcal(m: SavedMeal): number {
  return m.items.reduce((sum, i) => {
    const f = foodById(i.foodId);
    return sum + (f ? f.kcal * i.servings : 0);
  }, 0);
}

function DiarioPage() {
  const {
    getDay,
    removeEntry,
    updateEntry,
    goals,
    savedMeals,
    removeSavedMeal,
    addEntries,
    favorites,
    saveMeal,
  } = useDiary();
  const { date: initialDate } = Route.useSearch();
  const [daysAgo, setDaysAgo] = useState(() => {
    if (!initialDate) return 0;
    const picked = new Date(initialDate + "T00:00:00");
    const today = new Date(todayKey() + "T00:00:00");
    return Math.max(0, Math.round((today.getTime() - picked.getTime()) / 86400000));
  });
  const [pending, setPending] = useState<SavedMeal | null>(null);
  const dateKey = daysAgo === 0 ? todayKey() : dateKeyOffset(daysAgo);
  const day = getDay(dateKey);
  const totals = totalsFor(day);
  const dayIsEmpty = MEALS.every((m) => day[m].length === 0);
  const kcalPct = Math.min(100, Math.round((totals.kcal / goals.kcal) * 100));

  const quickAdd = (meal: Meal) => {
    if (!pending) return;
    addEntries(meal, pending.items, dateKey);
    toast.success(`${pending.name} añadida a ${MEAL_LABELS[meal]}`, {
      description: `${Math.round(savedMealKcal(pending))} kcal`,
    });
    setPending(null);
  };

  return (
    <div className="px-4 pt-4 lg:px-0 lg:pt-0">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-8">
        <div className="min-w-0">
          {/* Selector de día */}
          <div className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-card p-2">
            <button
              onClick={() => setDaysAgo((d) => d + 1)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted-foreground hover:bg-accent"
              aria-label="Día anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0 text-center">
              <p className="truncate text-sm font-extrabold capitalize">{formatDate(daysAgo)}</p>
              <p className="text-[11px] text-muted-foreground">{dateKey}</p>
            </div>
            <button
              onClick={() => setDaysAgo((d) => Math.max(0, d - 1))}
              disabled={daysAgo === 0}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted-foreground hover:bg-accent disabled:opacity-30"
              aria-label="Día siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <label className="relative grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-xl text-muted-foreground hover:bg-accent">
              <CalendarDays className="h-5 w-5" />
              <span className="sr-only">Elegir fecha</span>
              <input
                type="date"
                value={dateKey}
                max={todayKey()}
                onChange={(ev) => {
                  if (!ev.target.value) return;
                  const picked = new Date(ev.target.value + "T00:00:00");
                  const today = new Date(todayKey() + "T00:00:00");
                  const diff = Math.round((today.getTime() - picked.getTime()) / 86400000);
                  setDaysAgo(Math.max(0, diff));
                }}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
          </div>

          {/* Resumen del día */}
          <div className="mt-3 rounded-2xl border border-border bg-card p-4">
            <div className="flex min-w-0 items-end gap-2">
              <Flame className="mb-1 h-5 w-5 shrink-0 text-primary" />
              <p className="min-w-0 truncate text-2xl font-black leading-none tracking-tight lg:text-3xl">
                {Math.round(totals.kcal)}
                <span className="text-sm font-bold text-muted-foreground"> / {goals.kcal} kcal</span>
              </p>
              <span
                className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs font-extrabold ${
                  kcalPct >= 100 ? "bg-alert-soft text-alert" : "bg-accent text-accent-foreground"
                }`}
              >
                {kcalPct}%
              </span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${kcalPct}%` }}
              />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-secondary p-2">
                <p className="text-base font-extrabold">{Math.round(totals.protein)} g</p>
                <p className="text-[10px] font-semibold text-muted-foreground">Proteínas</p>
              </div>
              <div className="rounded-xl bg-secondary p-2">
                <p className="text-base font-extrabold">{Math.round(totals.carbs)} g</p>
                <p className="text-[10px] font-semibold text-muted-foreground">Carbohidratos</p>
              </div>
              <div className="rounded-xl bg-secondary p-2">
                <p className="text-base font-extrabold">{Math.round(totals.fat)} g</p>
                <p className="text-[10px] font-semibold text-muted-foreground">Grasas</p>
              </div>
            </div>
          </div>

          {dayIsEmpty && (
            <div className="mt-3 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent text-primary">
                <Salad aria-hidden className="h-8 w-8" />
              </div>
              <h2 className="mt-3 text-sm font-extrabold">Aún no hay registros este día</h2>
              <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">
                Cuando anotes tu desayuno, almuerzo, once o cena, verás aquí el desglose con
                calorías y macros de cada alimento.
              </p>
              <Link
                to="/"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
              >
                <Sparkles className="h-3.5 w-3.5" /> Registrar un alimento
              </Link>
            </div>
          )}

          {/* Comidas */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {MEALS.map((meal) => {
              const entries = day[meal];
              const mealKcal = entries.reduce((sum, e) => {
                const f = foodById(e.foodId);
                return sum + (f ? f.kcal * e.servings : 0);
              }, 0);
              return (
                <section key={meal} className="min-w-0 rounded-2xl border border-border bg-card p-4">
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <h2 className="truncate text-sm font-extrabold">{MEAL_LABELS[meal]}</h2>
                    <span className="shrink-0 text-xs font-bold text-muted-foreground">
                      {Math.round(mealKcal)} kcal
                    </span>
                  </div>
                  {entries.length === 0 ? (
                    <div className="mt-2 rounded-xl border border-dashed border-border bg-background/60 px-3 py-4 text-center">
                      <UtensilsCrossed aria-hidden className="mx-auto h-5 w-5 text-muted-foreground/60" />
                      <p className="mt-1 text-xs font-semibold text-muted-foreground">
                        Sin registros en {MEAL_LABELS[meal].toLowerCase()}
                      </p>
                    </div>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {entries.map((e) => {
                        const f = foodById(e.foodId);
                        if (!f) return null;
                        return (
                          <li key={e.id} className="min-w-0 rounded-xl bg-secondary px-3 py-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-card text-primary">
                                <FoodIcon category={f.category} className="h-3.5 w-3.5" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold">
                                  {f.name}{" "}
                                  <span className="font-semibold text-muted-foreground">
                                    {Math.round(f.kcal * e.servings)} kcal
                                  </span>
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {Math.round(f.grams * e.servings)} g · P{" "}
                                  {(f.protein * e.servings).toFixed(0)}g · C{" "}
                                  {(f.carbs * e.servings).toFixed(0)}g · G{" "}
                                  {(f.fat * e.servings).toFixed(0)}g
                                </p>
                              </div>
                              <button
                                onClick={() => removeEntry(dateKey, meal, e.id)}
                                className="shrink-0 text-muted-foreground hover:text-destructive"
                                aria-label={`Eliminar ${f.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="mt-2 flex min-w-0 items-center justify-between gap-2">
                              <span className="min-w-0 truncate text-[11px] font-semibold text-muted-foreground">
                                Porciones · {f.portion}
                              </span>
                              <div className="flex shrink-0 items-center gap-1">
                                <button
                                  onClick={() =>
                                    updateEntry(
                                      dateKey,
                                      meal,
                                      e.id,
                                      Math.max(MIN_SERVINGS, e.servings - SERVING_STEP),
                                    )
                                  }
                                  disabled={e.servings <= MIN_SERVINGS}
                                  className="grid h-7 w-7 place-items-center rounded-full border border-border bg-background disabled:opacity-30"
                                  aria-label={`Menos porción de ${f.name}`}
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span
                                  className="w-8 text-center text-xs font-extrabold"
                                  aria-label={`${e.servings} porciones`}
                                >
                                  {e.servings}
                                </span>
                                <button
                                  onClick={() =>
                                    updateEntry(
                                      dateKey,
                                      meal,
                                      e.id,
                                      Math.min(MAX_SERVINGS, e.servings + SERVING_STEP),
                                    )
                                  }
                                  disabled={e.servings >= MAX_SERVINGS}
                                  className="grid h-7 w-7 place-items-center rounded-full border border-border bg-background disabled:opacity-30"
                                  aria-label={`Más porción de ${f.name}`}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <Link
                    to="/"
                    search={{ meal, date: dateKey }}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary/40 bg-accent py-2 text-xs font-bold text-accent-foreground hover:bg-accent/80"
                  >
                    <Plus className="h-3.5 w-3.5" /> Agregar alimento a {MEAL_LABELS[meal].toLowerCase()}
                  </Link>
                  {entries.length > 0 && (
                    <button
                      onClick={() => {
                        saveMeal(
                          `${MEAL_LABELS[meal]} de ${formatDate(daysAgo).toLowerCase()}`,
                          entries.map((e) => ({ foodId: e.foodId, servings: e.servings })),
                        );
                        toast.success("Comida guardada para repetirla después");
                      }}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2 text-xs font-bold text-foreground hover:border-primary/40"
                    >
                      <Bookmark className="h-3.5 w-3.5" /> Guardar esta comida
                    </button>
                  )}
                </section>
              );
            })}
          </div>
        </div>

        {/* Guardados */}
        <aside className="min-w-0">
          <h2 className="flex min-w-0 items-center gap-2 text-sm font-extrabold">
            <Bookmark className="h-4 w-4 shrink-0 text-primary" /> Comidas guardadas
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Agrégalas al día en un clic, sin volver a buscar cada alimento.
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {savedMeals.length === 0 && (
              <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Todavía no guardas comidas. Puedes hacerlo desde Registrar.
              </p>
            )}
            {savedMeals.map((m) => (
              <div key={m.id} className="min-w-0 rounded-2xl border border-border bg-card p-3">
                <div className="flex min-w-0 items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{m.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {m.items
                        .map((i) => foodById(i.foodId)?.name ?? "")
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                  <button
                    onClick={() => removeSavedMeal(m.id)}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label={`Eliminar ${m.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => setPending(m)}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="h-3.5 w-3.5" /> Agregar ({Math.round(savedMealKcal(m))} kcal)
                </button>
              </div>
            ))}
          </div>

          <h2 className="mt-6 flex min-w-0 items-center gap-2 text-sm font-extrabold">
            <Star className="h-4 w-4 shrink-0 text-primary" /> Alimentos favoritos
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {favorites.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Marca alimentos con la estrella en Registrar.
              </p>
            )}
            {favorites.map((id) => {
              const f = foodById(id);
              if (!f) return null;
              return (
                <span
                  key={id}
                  className="rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground"
                >
                  {f.name} · {f.kcal} kcal
                </span>
              );
            })}
          </div>
        </aside>
      </div>

      {/* Selector de comida para guardados */}
      {pending && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={() => setPending(null)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-card p-5 pb-8 sm:rounded-3xl sm:pb-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="min-w-0 truncate text-base font-extrabold">
                Agregar “{pending.name}” a…
              </h2>
              <button
                onClick={() => setPending(null)}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {MEALS.map((meal) => (
                <button
                  key={meal}
                  onClick={() => quickAdd(meal)}
                  className="rounded-2xl border border-border bg-secondary py-4 text-sm font-bold text-secondary-foreground transition-colors hover:border-primary hover:bg-accent"
                >
                  {MEAL_LABELS[meal]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
