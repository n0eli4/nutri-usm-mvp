import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Target, Pencil, Check } from "lucide-react";
import { dateKeyOffset, todayKey, totalsFor, useDiary, type Goals } from "@/lib/diary-store";

export const Route = createFileRoute("/progreso")({
  head: () => ({
    meta: [
      { title: "Progreso y metas — NUTRIUSM" },
      {
        name: "description",
        content: "Compara tu consumo diario con tus metas de calorías, proteínas, carbohidratos y grasas.",
      },
      { property: "og:title", content: "Progreso y metas — NUTRIUSM" },
      {
        property: "og:description",
        content: "Compara tu consumo diario con tus metas de calorías, proteínas, carbohidratos y grasas.",
      },
    ],
  }),
  component: ProgresoPage,
});

const MACRO_META: { key: keyof Goals; label: string; unit: string; color: string }[] = [
  { key: "kcal", label: "Calorías", unit: "kcal", color: "bg-primary" },
  { key: "protein", label: "Proteínas", unit: "g", color: "bg-chart-2" },
  { key: "carbs", label: "Carbohidratos", unit: "g", color: "bg-chart-4" },
  { key: "fat", label: "Grasas", unit: "g", color: "bg-chart-1" },
];

function MacroBar({
  label,
  unit,
  color,
  value,
  goal,
}: {
  label: string;
  unit: string;
  color: string;
  value: number;
  goal: number;
}) {
  const pct = goal > 0 ? Math.round((value / goal) * 100) : 0;
  const shown = Math.min(100, pct);
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-extrabold">{label}</p>
        <p className="text-xs text-muted-foreground">
          <span className="text-sm font-extrabold text-foreground">{Math.round(value)}</span> / {goal} {unit}
        </p>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${pct > 100 ? "bg-destructive" : color}`}
          style={{ width: `${shown}%` }}
        />
      </div>
      <p className={`mt-1.5 text-right text-xs font-bold ${pct >= 90 && pct <= 110 ? "text-primary" : "text-muted-foreground"}`}>
        {pct}% de la meta
      </p>
    </div>
  );
}

function ProgresoPage() {
  const { getDay, goals, setGoals } = useDiary();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Goals>(goals);

  const todayTotals = totalsFor(getDay(todayKey()));

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const key = i === 0 ? todayKey() : dateKeyOffset(i);
    return { key, daysAgo: i, totals: totalsFor(getDay(key)) };
  }).reverse();

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">Tu progreso</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Metas diarias vs. consumo de hoy.</p>
        </div>
        <button
          onClick={() => {
            setDraft(goals);
            setEditing(true);
          }}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground"
        >
          <Pencil className="h-3.5 w-3.5" /> Editar metas
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {MACRO_META.map((m) => (
          <MacroBar
            key={m.key}
            label={m.label}
            unit={m.unit}
            color={m.color}
            value={todayTotals[m.key]}
            goal={goals[m.key]}
          />
        ))}
      </div>

      {/* Últimos 7 días */}
      <h2 className="mt-6 flex items-center gap-2 text-sm font-extrabold">
        <Target className="h-4 w-4 text-primary" /> Últimos 7 días (kcal)
      </h2>
      <div className="mt-2 flex items-end justify-between gap-1.5 rounded-2xl border border-border bg-card p-4">
        {last7.map(({ key, daysAgo, totals }) => {
          const pct = Math.min(100, Math.round((totals.kcal / goals.kcal) * 100));
          const d = new Date();
          d.setDate(d.getDate() - daysAgo);
          const label = d.toLocaleDateString("es-CL", { weekday: "narrow" });
          return (
            <div key={key} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-muted-foreground">
                {totals.kcal > 0 ? Math.round(totals.kcal) : "—"}
              </span>
              <div className="flex h-24 w-full items-end rounded-lg bg-muted/60">
                <div
                  className={`w-full rounded-lg ${daysAgo === 0 ? "bg-primary" : "bg-primary/40"}`}
                  style={{ height: `${Math.max(2, pct)}%` }}
                />
              </div>
              <span className={`text-[10px] font-bold uppercase ${daysAgo === 0 ? "text-primary" : "text-muted-foreground"}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Editor de metas */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setEditing(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-card p-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-extrabold">Metas diarias</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {MACRO_META.map((m) => (
                <label key={m.key} className="block">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {m.label} ({m.unit})
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={draft[m.key]}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [m.key]: Number(e.target.value) || 0 }))
                    }
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-bold outline-none focus:border-primary"
                  />
                </label>
              ))}
            </div>
            <button
              onClick={() => {
                setGoals(draft);
                setEditing(false);
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground"
            >
              <Check className="h-4 w-4" /> Guardar metas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
