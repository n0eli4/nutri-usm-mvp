import { useEffect, useMemo, useState } from "react";
import { Minus, Pencil, Plus, Search, X } from "lucide-react";
import { foodById, searchFoods } from "@/data/foods";
import { FoodIcon } from "@/components/food-icon";
import type { SavedMeal } from "@/lib/diary-store";

const MAX_NAME_LENGTH = 40;
const MIN_SERVINGS = 0.5;
const MAX_SERVINGS = 10;
const STEP = 0.5;
const MAX_RESULTS = 5;

type Item = { foodId: string; servings: number };

/** Cuadro para cambiar nombre, porciones y alimentos de una comida guardada. */
export function EditSavedMealDialog({
  meal,
  onSave,
  onClose,
}: Readonly<{
  meal: SavedMeal;
  onSave: (name: string, items: Item[]) => void;
  onClose: () => void;
}>) {
  const [name, setName] = useState(meal.name.slice(0, MAX_NAME_LENGTH));
  const [items, setItems] = useState<Item[]>(() => meal.items.map((i) => ({ ...i })));
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const results = useMemo(
    () => (query.trim() ? searchFoods(query).slice(0, MAX_RESULTS) : []),
    [query],
  );

  const totalKcal = items.reduce((sum, i) => sum + (foodById(i.foodId)?.kcal ?? 0) * i.servings, 0);
  const clean = name.trim();
  const canSave = clean.length > 0 && items.length > 0;

  const change = (foodId: string, delta: number) =>
    setItems((prev) =>
      prev.map((i) =>
        i.foodId === foodId
          ? { ...i, servings: Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, i.servings + delta)) }
          : i,
      ),
    );

  const addFood = (foodId: string) => {
    setItems((prev) =>
      prev.some((i) => i.foodId === foodId)
        ? prev.map((i) =>
            i.foodId === foodId ? { ...i, servings: Math.min(MAX_SERVINGS, i.servings + 1) } : i,
          )
        : [...prev, { foodId, servings: 1 }],
    );
    setQuery("");
    setAdding(false);
  };

  return (
    <dialog
      open
      aria-label="Editar comida guardada"
      className="fixed inset-0 z-50 m-0 flex h-full w-full max-w-none items-end justify-center bg-black/40 p-0 sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card p-5 pb-8 sm:rounded-3xl sm:pb-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSave) onSave(clean, items);
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex min-w-0 items-center gap-2 text-base font-extrabold">
            <Pencil className="h-4 w-4 shrink-0 text-primary" /> Editar comida
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <label htmlFor="edit-meal-name" className="mt-4 block text-xs font-bold">
          Nombre
        </label>
        <input
          id="edit-meal-name"
          value={name}
          maxLength={MAX_NAME_LENGTH}
          onChange={(e) => setName(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />

        <div className="mt-4 flex items-baseline justify-between gap-2">
          <p className="text-xs font-bold">Ingredientes</p>
          <p className="text-xs font-semibold text-muted-foreground">{Math.round(totalKcal)} kcal</p>
        </div>

        <ul className="mt-1.5 space-y-2">
          {items.length === 0 && (
            <li className="rounded-xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
              Agrega al menos un alimento para poder guardar.
            </li>
          )}
          {items.map((i) => {
            const f = foodById(i.foodId);
            if (!f) return null;
            return (
              <li key={i.foodId} className="rounded-xl bg-secondary px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-card text-primary">
                    <FoodIcon category={f.category} className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold">{f.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {f.portion} · {Math.round(f.kcal * i.servings)} kcal
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((x) => x.foodId !== i.foodId))}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-destructive"
                    aria-label={`Quitar ${f.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => change(i.foodId, -STEP)}
                    disabled={i.servings <= MIN_SERVINGS}
                    className="grid h-7 w-7 place-items-center rounded-full border border-border bg-background disabled:opacity-40"
                    aria-label={`Menos porción de ${f.name}`}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-extrabold">{i.servings}</span>
                  <button
                    type="button"
                    onClick={() => change(i.foodId, STEP)}
                    disabled={i.servings >= MAX_SERVINGS}
                    className="grid h-7 w-7 place-items-center rounded-full border border-border bg-background disabled:opacity-40"
                    aria-label={`Más porción de ${f.name}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        {adding ? (
          <div className="mt-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar alimento…"
                className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {query.trim() && results.length === 0 && (
              <p className="mt-2 text-center text-xs text-muted-foreground">Sin resultados.</p>
            )}
            <ul className="mt-2 space-y-1.5">
              {results.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => addFood(f.id)}
                    className="flex w-full min-w-0 items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-left hover:border-primary/40"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold">{f.name}</span>
                      <span className="block text-[11px] text-muted-foreground">
                        {f.portion} · {f.kcal} kcal
                      </span>
                    </span>
                    <Plus className="h-4 w-4 shrink-0 text-primary" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary/40 bg-accent px-4 py-2.5 text-xs font-bold text-accent-foreground hover:bg-accent/80"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar alimento
          </button>
        )}

        <p className="mt-3 text-[11px] text-muted-foreground">
          Los cambios solo afectan a la comida guardada, no a los días en que ya la registraste.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border bg-background py-2.5 text-sm font-bold text-foreground"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className="rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </dialog>
  );
}
