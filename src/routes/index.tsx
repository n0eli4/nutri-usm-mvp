import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus, Minus, X, Check, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { FOODS, type Food } from "@/data/foods";
import { MEALS, MEAL_LABELS, useDiary, type Meal } from "@/lib/diary-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Buscar y registrar — NUTRIUSM" },
      {
        name: "description",
        content: "Busca alimentos, revisa sus calorías y macros por porción, y añádelos a tu comida.",
      },
      { property: "og:title", content: "Buscar y registrar — NUTRIUSM" },
      {
        property: "og:description",
        content: "Busca alimentos, revisa sus calorías y macros por porción, y añádelos a tu comida.",
      },
    ],
  }),
  component: RegistrarPage,
});

interface TrayItem {
  food: Food;
  servings: number;
}

function MacroChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
      {label} {value}
    </span>
  );
}

function RegistrarPage() {
  const { addEntries } = useDiary();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Food | null>(null);
  const [servings, setServings] = useState(1);
  const [tray, setTray] = useState<TrayItem[]>([]);
  const [mealPickerOpen, setMealPickerOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FOODS;
    return FOODS.filter(
      (f) => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q),
    );
  }, [query]);

  const trayKcal = tray.reduce((sum, i) => sum + i.food.kcal * i.servings, 0);

  const addToTray = () => {
    if (!selected) return;
    setTray((prev) => {
      const existing = prev.find((i) => i.food.id === selected.id);
      if (existing) {
        return prev.map((i) =>
          i.food.id === selected.id ? { ...i, servings: i.servings + servings } : i,
        );
      }
      return [...prev, { food: selected, servings }];
    });
    setSelected(null);
    setServings(1);
    setQuery("");
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

  return (
    <div className="px-4 pt-4">
      <h1 className="text-xl font-extrabold tracking-tight">¿Qué comiste?</h1>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Busca un alimento, ajusta la porción y añádelo a tu comida.
      </p>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar alimento…"
          className="w-full rounded-2xl border border-input bg-card py-3 pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Detalle del alimento seleccionado */}
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

          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
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

          <div className="mt-3 flex items-center justify-between">
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

          <button
            onClick={addToTray}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Añadir a la comida
          </button>
        </div>
      )}

      {/* Resultados */}
      <ul className="mt-4 space-y-2">
        {results.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No encontramos “{query}”. Prueba con otro nombre.
          </li>
        )}
        {results.map((f) => (
          <li key={f.id}>
            <button
              onClick={() => {
                setSelected(f);
                setServings(1);
              }}
              className={`w-full rounded-2xl border bg-card p-3 text-left transition-colors ${
                selected?.id === f.id ? "border-primary" : "border-border hover:border-primary/40"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{f.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {f.portion} · {f.grams} g · {f.category}
                  </p>
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
          </li>
        ))}
      </ul>

      {/* Bandeja de la comida actual */}
      {tray.length > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-40 mx-auto w-full max-w-md px-4 pb-2">
          <div className="rounded-2xl border border-primary/30 bg-card p-3 shadow-lg shadow-primary/10">
            <div className="flex items-center justify-between gap-2">
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
            <button
              onClick={() => setMealPickerOpen(true)}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground"
            >
              <Check className="h-4 w-4" />
              Registrar comida ({tray.length}) · {Math.round(trayKcal)} kcal
            </button>
          </div>
        </div>
      )}

      {/* Selector de comida */}
      {mealPickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setMealPickerOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-card p-5 pb-8"
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
