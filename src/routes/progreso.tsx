import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Target, Pencil, Check, AlertCircle, TrendingUp, CheckCircle2, Utensils, X } from "lucide-react";
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

const MAX_GOAL = 10000;

type DraftGoals = Record<keyof Goals, string>;
type GoalErrors = Partial<Record<keyof Goals, string>>;

/** Redondea a 1 decimal para evitar ruido de punto flotante (p. ej. 8.5 - 8 = 0.5). */
const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Compara lo consumido con la meta usando el MISMO valor redondeado que ve el usuario.
 * Así "17 / 17 g" se considera meta alcanzada y no un exceso de 0 g.
 */
function compareToGoal(value: number, goal: number) {
  const shown = Math.round(value);
  const hasGoal = goal > 0;
  const diff = hasGoal ? round1(shown - goal) : 0; // > 0: exceso, < 0: falta
  return {
    shown,
    hasGoal,
    pct: hasGoal ? Math.round((shown / goal) * 100) : 0,
    over: hasGoal && diff > 0,
    met: hasGoal && diff === 0,
    excess: diff > 0 ? diff : 0,
    remaining: diff < 0 ? Math.abs(diff) : 0,
  };
}

/** Valida el borrador de metas. Devuelve los errores por campo y, si todo es válido, las metas numéricas. */
function validateGoals(draft: DraftGoals): { errors: GoalErrors; goals: Goals | null } {
  const errors: GoalErrors = {};
  const parsed = {} as Goals;

  for (const m of MACRO_META) {
    const raw = draft[m.key].trim().replace(",", ".");
    if (raw === "") {
      errors[m.key] = "Ingresa un valor.";
      continue;
    }
    const n = Number(raw);
    if (!Number.isFinite(n)) {
      errors[m.key] = "Ingresa solo números.";
    } else if (n <= 0) {
      errors[m.key] = "Debe ser mayor que 0.";
    } else if (n > MAX_GOAL) {
      errors[m.key] = `Debe ser menor o igual a ${MAX_GOAL}.`;
    } else {
      parsed[m.key] = n;
    }
  }

  return Object.keys(errors).length > 0 ? { errors, goals: null } : { errors, goals: parsed };
}

function toDraft(goals: Goals): DraftGoals {
  return {
    kcal: String(goals.kcal),
    protein: String(goals.protein),
    carbs: String(goals.carbs),
    fat: String(goals.fat),
  };
}

function MacroBar({
  label,
  unit,
  color,
  value,
  goal,
  featured = false,
}: {
  label: string;
  unit: string;
  color: string;
  value: number;
  goal: number;
  featured?: boolean;
}) {
  const { shown, hasGoal, pct, over, met, excess, remaining } = compareToGoal(value, goal);

  return (
    <div className={`rounded-2xl border border-border bg-card p-4 ${featured ? "sm:col-span-2 sm:p-5" : ""}`}>
      <div className="flex items-baseline justify-between gap-2">
        <p className={`font-extrabold ${featured ? "text-base" : "text-sm"}`}>{label}</p>
        <p className="text-xs text-muted-foreground">
          <span className={`font-extrabold text-foreground ${featured ? "text-2xl" : "text-sm"}`}>{shown}</span> /{" "}
          {hasGoal ? `${goal} ${unit}` : "sin meta"}
        </p>
      </div>
      <div className={`mt-2 overflow-hidden rounded-full bg-muted ${featured ? "h-4" : "h-3"}`}>
        <div
          className={`h-full rounded-full transition-all ${over ? "bg-destructive" : color}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      {!hasGoal ? (
        <p className="mt-1.5 text-right text-xs font-bold text-muted-foreground">Define una meta para ver el avance</p>
      ) : over ? (
        <p className="mt-1.5 flex items-center justify-end gap-1 text-right text-xs font-bold text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          Superaste tu meta de {label.toLowerCase()} por {excess} {unit} ({pct}%)
        </p>
      ) : met ? (
        <p className="mt-1.5 flex items-center justify-end gap-1 text-right text-xs font-bold text-primary">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          Meta alcanzada (100%)
        </p>
      ) : (
        <p className="mt-1.5 text-right text-xs font-bold text-muted-foreground">
          {pct}% de la meta · te faltan {remaining} {unit}
        </p>
      )}
    </div>
  );
}

/** Reparto de las calorías del día entre proteínas, carbohidratos y grasas (4, 4 y 9 kcal por gramo). */
function MacroBalance({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const kp = protein * 4;
  const kc = carbs * 4;
  const kf = fat * 9;
  const total = kp + kc + kf;
  if (total <= 0) return null;

  const parts = [
    { label: "Proteínas", color: "bg-chart-2", kcal: kp },
    { label: "Carbohidratos", color: "bg-chart-4", kcal: kc },
    { label: "Grasas", color: "bg-chart-1", kcal: kf },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">Cuánto aporta cada macro a las calorías que llevas hoy.</p>
      <div className="mt-2 flex h-4 overflow-hidden rounded-full bg-muted">
        {parts.map((p) => (
          <div key={p.label} className={p.color} style={{ width: `${(p.kcal / total) * 100}%` }} />
        ))}
      </div>
      <ul className="mt-3 grid grid-cols-3 gap-2">
        {parts.map((p) => (
          <li key={p.label} className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${p.color}`} />
              <span className="truncate text-[11px] font-semibold text-muted-foreground">{p.label}</span>
            </div>
            <p className="mt-0.5 text-sm font-extrabold">{Math.round((p.kcal / total) * 100)}%</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProgresoPage() {
  const { getDay, goals, setGoals } = useDiary();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DraftGoals>(toDraft(goals));
  const [errors, setErrors] = useState<GoalErrors>({});
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const todayTotals = totalsFor(getDay(todayKey()));
  const hasToday = todayTotals.kcal > 0 || todayTotals.protein > 0 || todayTotals.carbs > 0 || todayTotals.fat > 0;

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const key = i === 0 ? todayKey() : dateKeyOffset(i);
    const d = new Date();
    d.setDate(d.getDate() - i);
    return {
      key,
      daysAgo: i,
      totals: totalsFor(getDay(key)),
      label: d.toLocaleDateString("es-CL", { weekday: "short" }).replace(".", ""),
      fullLabel: d.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" }),
    };
  }).reverse();

  const selected = last7.find((d) => d.key === selectedKey) ?? null;

  const daysWithData = last7.filter((d) => d.totals.kcal > 0);
  const avgKcal =
    daysWithData.length > 0
      ? Math.round(daysWithData.reduce((sum, d) => sum + d.totals.kcal, 0) / daysWithData.length)
      : 0;
  const daysOverGoal = daysWithData.filter((d) => compareToGoal(d.totals.kcal, goals.kcal).over).length;
  const daysInRange = daysWithData.filter((d) => {
    const { pct } = compareToGoal(d.totals.kcal, goals.kcal);
    return pct >= 90 && pct <= 110;
  }).length;

  const kcalToday = Math.round(todayTotals.kcal);

  const openEditor = () => {
    setDraft(toDraft(goals));
    setErrors({});
    setEditing(true);
  };

  const saveGoals = () => {
    const result = validateGoals(draft);
    setErrors(result.errors);
    if (result.goals) {
      setGoals(result.goals);
      setEditing(false);
    }
  };

  return (
    <div className="px-4 pt-4 lg:px-0 lg:pt-0">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-extrabold tracking-tight lg:text-2xl">Tu progreso</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {hasToday
              ? goals.kcal > 0
                ? `Hoy llevas ${kcalToday} de ${goals.kcal} kcal.`
                : `Hoy llevas ${kcalToday} kcal.`
              : "Compara lo que consumes cada día con tus metas."}
          </p>
        </div>
        <button
          onClick={openEditor}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground"
        >
          <Pencil className="h-3.5 w-3.5" /> Editar metas
        </button>
      </div>

      {!hasToday && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Aún no registras comidas hoy. Añade alimentos para ver tu avance aquí.
          </p>
          <Link
            to="/"
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
          >
            <Utensils className="h-3.5 w-3.5" /> Registrar comida
          </Link>
        </div>
      )}

      <h2 className="mt-5 text-sm font-extrabold">Hoy</h2>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {MACRO_META.map((m) => (
          <MacroBar
            key={m.key}
            label={m.label}
            unit={m.unit}
            color={m.color}
            value={todayTotals[m.key]}
            goal={goals[m.key]}
            featured={m.key === "kcal"}
          />
        ))}
      </div>

      {hasToday && (
        <>
          <h2 className="mt-6 text-sm font-extrabold">Balance</h2>
          <div className="mt-2">
            <MacroBalance protein={todayTotals.protein} carbs={todayTotals.carbs} fat={todayTotals.fat} />
          </div>
        </>
      )}

      {/* Últimos 7 días */}
      <h2 className="mt-6 flex items-center gap-2 text-sm font-extrabold">
        <Target className="h-4 w-4 text-primary" /> Últimos 7 días (kcal)
      </h2>
      <div className="mt-2 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-end justify-between gap-1.5">
          {last7.map(({ key, daysAgo, totals, label, fullLabel }) => {
            const { over } = compareToGoal(totals.kcal, goals.kcal);
            const ratio = goals.kcal > 0 ? totals.kcal / goals.kcal : 0;
            const pct = Math.min(100, Math.round(ratio * 100));
            const isSelected = key === selectedKey;
            return (
              <button
                type="button"
                key={key}
                title={fullLabel}
                aria-label={`Ver detalle de ${fullLabel}`}
                aria-pressed={isSelected}
                onClick={() => setSelectedKey(isSelected ? null : key)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl p-0.5 transition-colors ${
                  isSelected ? "bg-primary/10 ring-2 ring-primary/40" : "hover:bg-muted/60"
                }`}
              >
                <span className={`text-[10px] font-bold ${over ? "text-destructive" : "text-muted-foreground"}`}>
                  {totals.kcal > 0 ? Math.round(totals.kcal) : "—"}
                </span>
                <div className="flex h-24 w-full items-end rounded-lg bg-muted/60">
                  <div
                    className={`w-full rounded-lg ${
                      over ? "bg-destructive" : daysAgo === 0 ? "bg-primary" : "bg-primary/40"
                    }`}
                    style={{ height: `${totals.kcal > 0 ? Math.max(2, pct) : 0}%` }}
                  />
                </div>
                <span
                  className={`text-[10px] font-bold uppercase ${daysAgo === 0 ? "text-primary" : "text-muted-foreground"}`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-start gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
          <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          {daysWithData.length === 0 ? (
            <p>Aún no hay registros en los últimos 7 días. Añade comidas para ver tu avance.</p>
          ) : (
            <p>
              Promedio de <span className="font-extrabold text-foreground">{avgKcal} kcal</span> en{" "}
              {daysWithData.length} {daysWithData.length === 1 ? "día con registros" : "días con registros"}
              {daysInRange > 0 && (
                <>
                  {" "}
                  · <span className="font-bold text-primary">{daysInRange} en rango (±10%)</span>
                </>
              )}
              {daysOverGoal > 0 && (
                <>
                  {" "}
                  · <span className="font-bold text-destructive">{daysOverGoal} sobre la meta</span>
                </>
              )}
              .
            </p>
          )}
        </div>
      </div>

      {selected ? (
        <div className="mt-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold capitalize">{selected.fullLabel}</h3>
            <button
              type="button"
              onClick={() => setSelectedKey(null)}
              aria-label="Cerrar detalle del día"
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {selected.totals.kcal > 0 ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {MACRO_META.map((m) => (
                <MacroBar
                  key={m.key}
                  label={m.label}
                  unit={m.unit}
                  color={m.color}
                  value={selected.totals[m.key]}
                  goal={goals[m.key]}
                />
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No registraste comidas este día.</p>
          )}
        </div>
      ) : (
        daysWithData.length > 0 && (
          <p className="mt-2 text-center text-[11px] text-muted-foreground">Toca un día para ver su detalle.</p>
        )
      )}

      {/* Editor de metas */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setEditing(false);
          }}
        >
          <form
            noValidate
            className="w-full max-w-md rounded-t-3xl bg-card p-5 pb-8 sm:rounded-3xl sm:pb-5"
            onSubmit={(e) => {
              e.preventDefault();
              saveGoals();
            }}
          >
            <h2 className="text-base font-extrabold">Metas diarias</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {MACRO_META.map((m) => (
                <label key={m.key} className="block">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {m.label} ({m.unit})
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={draft[m.key]}
                    aria-invalid={errors[m.key] ? true : undefined}
                    onChange={(e) => {
                      const value = e.target.value;
                      setDraft((d) => ({ ...d, [m.key]: value }));
                      setErrors((er) => ({ ...er, [m.key]: undefined }));
                    }}
                    className={`mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm font-bold outline-none ${
                      errors[m.key] ? "border-destructive" : "border-input focus:border-primary"
                    }`}
                  />
                  {errors[m.key] && (
                    <span role="alert" className="mt-1 block text-xs font-semibold text-destructive">
                      {errors[m.key]}
                    </span>
                  )}
                </label>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-xl border border-border py-2.5 text-sm font-bold text-foreground"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground"
              >
                <Check className="h-4 w-4" /> Guardar metas
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}