import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Minus,
  X,
  Check,
  UtensilsCrossed,
  Star,
  Compass,
  Bookmark,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { FOODS, type Food, foodById, alternativesFor, categoryIcon } from "@/data/foods";
import { RECIPES, RECIPE_TAGS, recipeTotals } from "@/data/recipes";
import { MEALS, MEAL_LABELS, useDiary, type Meal } from "@/lib/diary-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Buscar y descubrir alimentos — NUTRIUSM" },
      {
        name: "description",
        content:
          "Busca alimentos, filtra por alto en proteína o bajo en calorías, descubre recetas y arma tu comida en segundos.",
      },
      { property: "og:title", content: "Buscar y descubrir alimentos — NUTRIUSM" },
      {
        property: "og:description",
        content:
          "Busca alimentos, filtra por alto en proteína o bajo en calorías, descubre recetas y arma tu comida en segundos.",
      },
    ],
  }),
  component: RegistrarPage,
});

interface TrayItem {
  food: Food;
  servings: number;
}

type FilterId = "todos" | "favoritos" | "proteina" | "bajas-kcal" | "carbos" | "grasas-buenas";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "favoritos", label: "Favoritos" },
  { id: "proteina", label: "Alto en proteína" },
  { id: "bajas-kcal", label: "Bajo en calorías" },
  { id: "carbos", label: "Energía / carbos" },
  { id: "grasas-buenas", label: "Grasas buenas" },
];

function matchesFilter(f: Food, filter: FilterId, favorites: string[]): boolean {
  switch (filter) {
    case "favoritos":
      return favorites.includes(f.id);
    case "proteina":
      return f.protein >= 15 || (f.kcal > 0 && (f.protein * 4) / f.kcal >= 0.35);
    case "bajas-kcal":
      return f.kcal <= 110;
    case "carbos":
      return f.carbs >= 25;
    case "grasas-buenas":
      return f.fat >= 10;
    default:
      return true;
  }
}

function MacroChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
      {label} {value}
    </span>
  );
}

function RegistrarPage() {
  const { addEntries, favorites, toggleFavorite, isFavorite, saveMeal } = useDiary();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("todos");
  const [selected, setSelected] = useState<Food | null>(null);
  const [servings, setServings] = useState(1);
  const [tray, setTray] = useState<TrayItem[]>([]);
  const [mealPickerOpen, setMealPickerOpen] = useState(false);
  const [recipeTag, setRecipeTag] = useState<string>("Todas");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FOODS.filter((f) => {
      const byText =
        !q || f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
      return byText && matchesFilter(f, filter, favorites);
    });
  }, [query, filter, favorites]);

  const visibleRecipes = useMemo(
    () => (recipeTag === "Todas" ? RECIPES : RECIPES.filter((r) => r.tags.includes(recipeTag))),
    [recipeTag],
  );

  const trayKcal = tray.reduce((sum, i) => sum + i.food.kcal * i.servings, 0);

  const pushToTray = (items: { foodId: string; servings: number }[]) => {
    setTray((prev) => {
      const next = [...prev];
      for (const item of items) {
        const food = foodById(item.foodId);
        if (!food) continue;
        const existing = next.find((i) => i.food.id === food.id);
        if (existing) existing.servings += item.servings;
        else next.push({ food, servings: item.servings });
      }
      return next;
    });
  };

  const addToTray = () => {
    if (!selected) return;
    pushToTray([{ foodId: selected.id, servings }]);
    setSelected(null);
    setServings(1);
  };

  const register = (meal: Meal) => {
    addEntries(meal, tray.map((i) => ({ foodId: i.food.id, servings: i.servings })));
    toast.success(`¡Registrado en ${MEAL_LABELS[meal]}!`, {
      description: `${tray.length} alimento${tray.length > 1 ? "s" : ""} · ${Math.round(trayKcal)} kcal`,
    });
    setTray([]);
    setMealPickerOpen(false);
    navigate({ to: "/diario" });
  };

  const saveTrayAsMeal = () => {
    if (tray.length === 0) return;
    const name = tray
      .slice(0, 2)
      .map((i) => i.food.name)
      .join(" + ");
    saveMeal(tray.length > 2 ? `${name} +${tray.length - 2}` : name, tray.map((i) => ({
      foodId: i.food.id,
      servings: i.servings,
    })));
    toast.success("Comida guardada", { description: "La encuentras en el Diario para repetirla." });
  };

  return (
    <div className="px-4 pt-4 lg:px-0 lg:pt-0">
      <h1 className="text-xl font-extrabold tracking-tight lg:text-2xl">¿Qué comiste hoy?</h1>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Busca un alimento, descubre opciones nuevas y arma tu comida.
      </p>

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-8">
        {/* Columna de búsqueda */}
        <div className="min-w-0">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar alimento…"
              className="w-full rounded-2xl border border-input bg-card py-3 pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                  filter === f.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {selected && (
            <div className="mt-4 rounded-2xl border-2 border-primary/40 bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-bold">{selected.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {selected.portion} · {selected.grams} g
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"
                  aria-label="Cerrar detalle"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
                <div className="rounded-xl bg-secondary p-2">
                  <p className="text-sm font-extrabold">{Math.round(selected.kcal * servings)}</p>
                  <p className="text-[10px] font-semibold text-muted-foreground">kcal</p>
                </div>
                <div className="rounded-xl bg-secondary p-2">
                  <p className="text-sm font-extrabold">{(selected.protein * servings).toFixed(1)}</p>
                  <p className="text-[10px] font-semibold text-muted-foreground">Prot (g)</p>
                </div>
                <div className="rounded-xl bg-secondary p-2">
                  <p className="text-sm font-extrabold">{(selected.carbs * servings).toFixed(1)}</p>
                  <p className="text-[10px] font-semibold text-muted-foreground">Carb (g)</p>
                </div>
                <div className="rounded-xl bg-secondary p-2">
                  <p className="text-sm font-extrabold">{(selected.fat * servings).toFixed(1)}</p>
                  <p className="text-[10px] font-semibold text-muted-foreground">Grasa (g)</p>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-border/70 bg-background p-2">
                  <p className="text-sm font-extrabold">{(selected.fiber * servings).toFixed(1)} g</p>
                  <p className="text-[10px] font-semibold text-muted-foreground">Fibra</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-background p-2">
                  <p className="text-sm font-extrabold">{(selected.sugar * servings).toFixed(1)} g</p>
                  <p className="text-[10px] font-semibold text-muted-foreground">Azúcares</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-background p-2">
                  <p className="text-sm font-extrabold">{Math.round(selected.sodium * servings)} mg</p>
                  <p className="text-[10px] font-semibold text-muted-foreground">Sodio</p>
                </div>
              </div>

              {selected.sodium * servings >= 400 && (
                <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-alert-soft px-3 py-2 text-[11px] font-semibold text-alert">
                  <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
                  Alto en sodio para una porción. Revisa las alternativas de abajo.
                </p>
              )}

              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Porciones</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setServings((s) => Math.max(0.5, s - 0.5))}
                    className="grid h-8 w-8 place-items-center rounded-full border border-border bg-background"
                    aria-label="Menos porción"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-base font-extrabold">{servings}</span>
                  <button
                    onClick={() => setServings((s) => Math.min(10, s + 0.5))}
                    className="grid h-8 w-8 place-items-center rounded-full border border-border bg-background"
                    aria-label="Más porción"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={addToTray}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" /> Añadir a la comida
                </button>
                <button
                  onClick={() => toggleFavorite(selected.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition-colors ${
                    isFavorite(selected.id)
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  <Star className={`h-4 w-4 ${isFavorite(selected.id) ? "fill-current" : ""}`} />
                  {isFavorite(selected.id) ? "Guardado" : "Favorito"}
                </button>
              </div>

              {alternativesFor(selected).length > 0 && (
                <div className="mt-4 border-t border-border pt-3">
                  <h3 className="flex items-center gap-1.5 text-xs font-extrabold">
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" /> Alternativas
                    recomendadas
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {alternativesFor(selected).map(({ food: alt, reason }) => (
                      <li
                        key={alt.id}
                        className="flex min-w-0 items-center gap-2 rounded-xl bg-secondary px-3 py-2"
                      >
                        <span aria-hidden className="shrink-0 text-base">
                          {categoryIcon(alt.category)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold">
                            {alt.name}{" "}
                            <span className="font-semibold text-muted-foreground">
                              · {alt.kcal} kcal
                            </span>
                          </p>
                          <p className="truncate text-[11px] font-semibold text-primary">{reason}</p>
                        </div>
                        <button
                          onClick={() => {
                            pushToTray([{ foodId: alt.id, servings: 1 }]);
                            toast.success(`${alt.name} añadido a la comida`);
                          }}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                          aria-label={`Añadir ${alt.name} a la comida`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {results.length === 0 && (
              <li className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground sm:col-span-2">
                No encontramos resultados. Prueba con otro nombre o filtro.
              </li>
            )}
            {results.map((f) => (
              <li key={f.id} className="min-w-0">
                <div
                  className={`flex h-full min-w-0 gap-2 rounded-2xl border bg-card p-3 transition-colors ${
                    selected?.id === f.id ? "border-primary" : "border-border hover:border-primary/40"
                  }`}
                >
                  <button
                    onClick={() => {
                      setSelected(f);
                      setServings(1);
                    }}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span aria-hidden className="shrink-0 text-lg">{categoryIcon(f.category)}</span>
                        <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{f.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {f.portion} · {f.grams} g · {f.category}
                        </p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-xs font-extrabold text-accent-foreground">
                        {f.kcal} kcal
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <MacroChip label="P" value={`${f.protein}g`} />
                      <MacroChip label="C" value={`${f.carbs}g`} />
                      <MacroChip label="G" value={`${f.fat}g`} />
                    </div>
                  </button>
                  <button
                    onClick={() => toggleFavorite(f.id)}
                    className={`h-8 w-8 shrink-0 rounded-full ${
                      isFavorite(f.id) ? "text-primary" : "text-muted-foreground/50"
                    }`}
                    aria-label={isFavorite(f.id) ? `Quitar ${f.name} de favoritos` : `Guardar ${f.name} en favoritos`}
                  >
                    <Star className={`mx-auto h-4 w-4 ${isFavorite(f.id) ? "fill-current" : ""}`} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna de descubrimiento */}
        <div className="min-w-0">
          <h2 className="flex min-w-0 items-center gap-2 text-sm font-extrabold">
            <Compass className="h-4 w-4 shrink-0 text-primary" /> Descubre combinaciones
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Ideas de comidas armadas para estudiantes. Añádelas completas a tu bandeja.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {["Todas", ...RECIPE_TAGS].map((t) => (
              <button
                key={t}
                onClick={() => setRecipeTag(t)}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                  recipeTag === t
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {visibleRecipes.length === 0 && (
              <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No hay recetas con ese filtro todavía.
              </p>
            )}
            {visibleRecipes.map((r) => {
              const t = recipeTotals(r.items);
              return (
                <article key={r.id} className="flex min-w-0 flex-col rounded-2xl border border-border bg-card p-4">
                  <h3 className="truncate text-sm font-bold">{r.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{r.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {r.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-xs font-semibold text-muted-foreground">
                    {Math.round(t.kcal)} kcal · P {Math.round(t.protein)}g · C {Math.round(t.carbs)}g
                    · G {Math.round(t.fat)}g
                  </p>
                  <button
                    onClick={() => {
                      pushToTray(r.items);
                      toast.success(`${r.name} añadida a tu comida`);
                    }}
                    className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-primary/40 bg-accent py-2 text-xs font-bold text-accent-foreground hover:bg-accent/80"
                  >
                    <Plus className="h-3.5 w-3.5" /> Añadir a la comida
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bandeja de la comida actual */}
      {tray.length > 0 && (
        <div className="sticky bottom-20 z-30 mt-4 lg:bottom-6">
          <div className="rounded-2xl border border-primary/30 bg-card p-3 shadow-lg shadow-primary/10">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <UtensilsCrossed className="h-4 w-4 shrink-0 text-primary" />
                <p className="truncate text-xs font-semibold text-muted-foreground">
                  {tray.map((i) => `${i.food.name} ×${i.servings}`).join(", ")}
                </p>
              </div>
              <button
                onClick={() => setTray([])}
                className="shrink-0 text-muted-foreground"
                aria-label="Vaciar comida"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => setMealPickerOpen(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground"
              >
                <Check className="h-4 w-4" />
                Registrar comida ({tray.length}) · {Math.round(trayKcal)} kcal
              </button>
              <button
                onClick={saveTrayAsMeal}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-bold text-foreground"
              >
                <Bookmark className="h-4 w-4" /> Guardar comida
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selector de comida */}
      {mealPickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={() => setMealPickerOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-card p-5 pb-8 sm:rounded-3xl sm:pb-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-extrabold">¿En qué comida lo registro?</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {MEALS.map((meal) => (
                <button
                  key={meal}
                  onClick={() => register(meal)}
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
