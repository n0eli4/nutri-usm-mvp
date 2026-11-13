import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
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
  Clock,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { type Food, FOODS, foodById, alternativesFor, searchFoods } from "@/data/foods";
import { RECIPES, RECIPE_TAGS, recipeTotals } from "@/data/recipes";
import { FoodIcon } from "@/components/food-icon";
import { SectionChips } from "@/components/section-chips";
import { mealSpan } from "@/components/meal-style";
import { SaveMealDialog, suggestMealName } from "@/components/save-meal-dialog";
import { MEALS, MEAL_LABELS, todayKey, useDiary, type Meal } from "@/lib/diary-store";

export const Route = createFileRoute("/buscar")({
  head: () => ({
    meta: [
      { title: "Buscar alimentos — NUTRIUSM" },
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
  validateSearch: (search: Record<string, unknown>): { meal?: Meal; date?: string } => {
    const { meal, date } = search;
    const result: { meal?: Meal; date?: string } = {};
    if (MEALS.includes(meal as Meal)) result.meal = meal as Meal;
    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) result.date = date;
    return result;
  },
  component: BuscarPage,
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

function BuscarPage() {
  const { addEntries, favorites, toggleFavorite, isFavorite, saveMeal } = useDiary();
  const navigate = useNavigate();
  const { meal: presetMeal, date: presetDate } = Route.useSearch();
  const targetDate = presetDate ?? todayKey();
  const targetDayLabel = targetDate === todayKey() ? "hoy" : targetDate;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("todos");
  const [category, setCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<Food | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const [selectionRequest, setSelectionRequest] = useState(0);
  const [servings, setServings] = useState(1);
  const [tray, setTray] = useState<TrayItem[]>([]);
  const [mealPickerOpen, setMealPickerOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [recipeTag, setRecipeTag] = useState<string>("Todas");

  useEffect(() => {
    if (!mealPickerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMealPickerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mealPickerOpen]);

  const results = useMemo(
    () =>
      searchFoods(query).filter(
        (f) => (category === null || f.category === category) && matchesFilter(f, filter, favorites),
      ),
    [query, filter, favorites, category],
  );

  const categories = useMemo(
    () =>
      Array.from(new Set(FOODS.map((f) => f.category))).map((name) => ({ name })),
    [],
  );
  const favoriteFoods = favorites.map((id) => foodById(id)).filter((f): f is Food => !!f);
  // Sin búsqueda ni categoría elegida se muestran las categorías, no la lista completa.
  const browsing = query.trim() === "" && category === null;

  const openFood = (f: Food) => {
    setSelected(f);
    setServings(1);
    setSelectionRequest((request) => request + 1);
  };

  const backToCategories = () => {
    setCategory(null);
    setQuery("");
    setFilter("todos");
  };

  const visibleRecipes = useMemo(
    () => (recipeTag === "Todas" ? RECIPES : RECIPES.filter((r) => r.tags.includes(recipeTag))),
    [recipeTag],
  );

  useEffect(() => {
    if (!selected) return;
    detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selected, selectionRequest]);

  const trayKcal = tray.reduce((sum, i) => sum + i.food.kcal * i.servings, 0);

  const pushToTray = (items: { foodId: string; servings: number }[]) => {
    setTray((prev) => {
      const next = [...prev];
      for (const item of items) {
        const food = foodById(item.foodId);
        if (!food) continue;
        const index = next.findIndex((i) => i.food.id === food.id);
        const current = next[index];
        if (current) next[index] = { ...current, servings: current.servings + item.servings };
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
    addEntries(
      meal,
      tray.map((i) => ({ foodId: i.food.id, servings: i.servings })),
      targetDate,
    );
    toast.success(`¡Registrado en ${MEAL_LABELS[meal]} (${targetDayLabel})!`, {
      description: `${tray.length} alimento${tray.length > 1 ? "s" : ""} · ${Math.round(trayKcal)} kcal`,
    });
    setTray([]);
    setMealPickerOpen(false);
    // ✅ FIX S9383: Promesa ignorada explícitamente con void
    void navigate({ to: "/diario", search: presetDate ? { date: presetDate } : {} });
  };

  const saveTrayAsMeal = (name: string) => {
    if (tray.length === 0) return;
    saveMeal(
      name,
      tray.map((i) => ({ foodId: i.food.id, servings: i.servings })),
    );
    toast.success(`“${name}” guardada`, { description: "La encuentras en el Diario para repetirla." });
    setSaveOpen(false);
  };

  const chipSections = [
    { id: "buscar", label: "Buscar" },
    ...(browsing
      ? [
          ...(favoriteFoods.length > 0 ? [{ id: "favoritos", label: "Favoritos" }] : []),
          { id: "categorias", label: "Categorías" },
        ]
      : [{ id: "resultados", label: "Resultados" }]),
    { id: "combinaciones", label: "Combinaciones" },
  ];

  return (
    <div className="px-4 pt-4 lg:px-0 lg:pt-0">
      <SectionChips sections={chipSections} />
      <section id="buscar" className="scroll-mt-28 rounded-3xl bg-linear-to-br from-accent to-secondary p-4 lg:p-6">
        <h1 className="text-xl font-extrabold tracking-tight lg:text-2xl">Buscar alimentos</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Busca un alimento, descubre opciones nuevas y arma tu comida.
        </p>

        {presetMeal && (
          <p className="mt-3 rounded-xl bg-card/80 px-3 py-2 text-xs font-bold text-accent-foreground">
            Estás agregando alimentos a {MEAL_LABELS[presetMeal]} ({targetDayLabel}).
          </p>
        )}

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.trim()) setCategory(null);
            }}
            placeholder="Buscar alimento…"
            className="w-full rounded-2xl border border-input bg-card py-3.5 pl-10 pr-4 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </section>

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-8">
        {/* Columna de búsqueda */}
        <div className="min-w-0">
          {!browsing && (
          <div className="flex flex-wrap gap-2">
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
          )}

          {selected && (
            <div
              ref={detailRef}
              className="mt-4 scroll-mt-20 rounded-2xl border-2 border-primary/40 bg-card p-4 shadow-sm"
            >
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
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-card text-primary">
                          <FoodIcon category={alt.category} />
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

          {browsing ? (
            <div className="mt-4 space-y-5">
              {favoriteFoods.length > 0 && (
                <section id="favoritos" className="scroll-mt-28">
                  <h2 className="flex items-center gap-2 text-sm font-extrabold">
                    <Star className="h-4 w-4 shrink-0 text-primary" /> Favoritos
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {favoriteFoods.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => openFood(f)}
                        className="rounded-full border border-border bg-card px-3 py-2 text-xs font-bold transition-colors hover:border-primary/40"
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </section>
              )}
              <section id="categorias" className="scroll-mt-28">
                <h2 className="text-sm font-extrabold">Categorías</h2>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {categories.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        setCategory(c.name);
                        setFilter("todos");
                      }}
                      className="flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-border bg-card px-2 py-4 text-center transition-colors hover:border-primary/40"
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary">
                        <FoodIcon category={c.name} className="h-5 w-5" />
                      </span>
                      <span className="max-w-full truncate text-sm font-bold">{c.name}</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <>
          <div id="resultados" className="mt-4 flex scroll-mt-28 items-center justify-between gap-2">
            <button
              onClick={backToCategories}
              className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Categorías
            </button>
            <p className="text-sm font-extrabold">
              {category ?? "Resultados"}{" "}
              <span className="font-semibold text-muted-foreground">({results.length})</span>
            </p>
          </div>
          <ul className="mt-3 grid gap-2">
            {results.length === 0 && (
              <li className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
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
                    onClick={() => openFood(f)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                        <FoodIcon category={f.category} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold leading-snug">{f.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {f.portion} · {f.kcal} kcal
                        </p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => toggleFavorite(f.id)}
                    className={`h-10 w-10 shrink-0 self-center rounded-full ${
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
            </>
          )}
        </div>

        {/* Columna de descubrimiento */}
        <div id="combinaciones" className="min-w-0 scroll-mt-28">
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
                  <p className="mt-1 flex flex-wrap gap-x-3 text-[11px] font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock aria-hidden className="h-3.5 w-3.5" /> {r.estimatedMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Wallet aria-hidden className="h-3.5 w-3.5" /> ${r.estimatedCost?.toLocaleString("es-CL")}
                    </span>
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
                onClick={() => (presetMeal ? register(presetMeal) : setMealPickerOpen(true))}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground"
              >
                <Check className="h-4 w-4" />
                {presetMeal ? `Registrar en ${MEAL_LABELS[presetMeal]}` : "Confirmar registro de comida"} (
                {tray.length}) · {Math.round(trayKcal)} kcal
              </button>
              <button
                onClick={() => setSaveOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-bold text-foreground"
              >
                <Bookmark className="h-4 w-4" /> Guardar comida
              </button>
            </div>
          </div>
        </div>
      )}

      {saveOpen && tray.length > 0 && (
        <SaveMealDialog
          suggestedName={suggestMealName(
            tray.map((i) => i.food.name),
            "Mi comida",
          )}
          summary={`${tray.length} alimento${tray.length > 1 ? "s" : ""} · ${Math.round(trayKcal)} kcal`}
          onSave={saveTrayAsMeal}
          onClose={() => setSaveOpen(false)}
        />
      )}

      {/* ✅ FIX S6819, S6848, S1082: Modal nativo con <dialog> */}
      {mealPickerOpen && (
        <dialog
          open
          className="fixed inset-0 z-50 m-0 flex h-full w-full max-w-none items-end justify-center bg-black/40 p-0 sm:items-center"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setMealPickerOpen(false);
          }}
        >
          <div className="relative w-full max-w-md rounded-t-3xl bg-card p-5 pb-8 sm:rounded-3xl sm:pb-5">
            <h2 className="text-base font-extrabold">¿En qué comida lo registro?</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {MEALS.map((meal) => (
                <button
                  key={meal}
                  onClick={() => register(meal)}
                  className={`rounded-2xl border border-border bg-secondary py-4 text-sm font-bold text-secondary-foreground transition-colors hover:border-primary hover:bg-accent ${mealSpan(meal)}`}
                >
                  {MEAL_LABELS[meal]}
                </button>
              ))}
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}