import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Trash2, Flame, CheckCircle2 } from "lucide-react";
import { foodById } from "@/data/foods";
import {
  MEALS,
  MEAL_LABELS,
  dateKeyOffset,
  todayKey,
  totalsFor,
  useDiary,
} from "@/lib/diary-store";

export const Route = createFileRoute("/diario")({
  head: () => ({
    meta: [
      { title: "Diario del día — NUTRIUSM" },
      {
        name: "description",
        content: "Revisa lo que registraste en desayuno, almuerzo, once y cena, con el total de calorías y macros del día.",
      },
      { property: "og:title", content: "Diario del día — NUTRIUSM" },
      {
        property: "og:description",
        content: "Revisa lo que registraste en desayuno, almuerzo, once y cena, con el total de calorías y macros del día.",
      },
    ],
  }),
  component: DiarioPage,
});

function formatDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  if (daysAgo === 0) return "Hoy";
  if (daysAgo === 1) return "Ayer";
  return d.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "short" });
}

function DiarioPage() {
  const { getDay, removeEntry, goals } = useDiary();
  const [daysAgo, setDaysAgo] = useState(0);
  const dateKey = daysAgo === 0 ? todayKey() : dateKeyOffset(daysAgo);
  const day = getDay(dateKey);
  const totals = totalsFor(day);
  const kcalPct = Math.min(100, Math.round((totals.kcal / goals.kcal) * 100));

  return (
    <div className="px-4 pt-4">
      {/* Selector de día */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-2">
        <button
          onClick={() => setDaysAgo((d) => d + 1)}
          className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:bg-accent"
          aria-label="Día anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="text-sm font-extrabold capitalize">{formatDate(daysAgo)}</p>
          <p className="text-[11px] text-muted-foreground">{dateKey}</p>
        </div>
        <button
          onClick={() => setDaysAgo((d) => Math.max(0, d - 1))}
          disabled={daysAgo === 0}
          className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:bg-accent disabled:opacity-30"
          aria-label="Día siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Resumen del día */}
      <div className="mt-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-primary" />
          <p className="text-sm font-extrabold">
            {Math.round(totals.kcal)} / {goals.kcal} kcal
          </p>
          <span className="ml-auto text-xs font-bold text-primary">{kcalPct}%</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${kcalPct}%` }}
          />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-secondary p-2">
            <p className="text-sm font-extrabold">{Math.round(totals.protein)} g</p>
            <p className="text-[10px] font-semibold text-muted-foreground">Proteínas</p>
          </div>
          <div className="rounded-xl bg-secondary p-2">
            <p className="text-sm font-extrabold">{Math.round(totals.carbs)} g</p>
            <p className="text-[10px] font-semibold text-muted-foreground">Carbohidratos</p>
          </div>
          <div className="rounded-xl bg-secondary p-2">
            <p className="text-sm font-extrabold">{Math.round(totals.fat)} g</p>
            <p className="text-[10px] font-semibold text-muted-foreground">Grasas</p>
          </div>
        </div>
      </div>

      {/* Comidas */}
      <div className="mt-4 space-y-3">
        {MEALS.map((meal) => {
          const entries = day[meal];
          const mealKcal = entries.reduce((sum, e) => {
            const f = foodById(e.foodId);
            return sum + (f ? f.kcal * e.servings : 0);
          }, 0);
          return (
            <section key={meal} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold">{MEAL_LABELS[meal]}</h2>
                <span className="text-xs font-bold text-muted-foreground">
                  {Math.round(mealKcal)} kcal
                </span>
              </div>
              {entries.length === 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">Sin registros todavía.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {entries.map((e) => {
                    const f = foodById(e.foodId);
                    if (!f) return null;
                    return (
                      <li
                        key={e.id}
                        className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold">
                            {f.name} <span className="font-semibold text-muted-foreground">×{e.servings}</span>
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {Math.round(f.kcal * e.servings)} kcal · P {(f.protein * e.servings).toFixed(0)}g ·
                            C {(f.carbs * e.servings).toFixed(0)}g · G {(f.fat * e.servings).toFixed(0)}g
                          </p>
                        </div>
                        <button
                          onClick={() => removeEntry(dateKey, meal, e.id)}
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          aria-label={`Eliminar ${f.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
