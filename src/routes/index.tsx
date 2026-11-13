import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bookmark,
} from "lucide-react";
import { foodById } from "@/data/foods";
import { CalorieSummary } from "@/components/calorie-ring";
import { MEAL_ICONS, MEAL_TINT, mealSpan } from "@/components/meal-style";
import { compareToGoal } from "@/components/macro-bar";
import { MEALS, MEAL_LABELS, todayKey, totalsFor, useDiary, type Meal } from "@/lib/diary-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inicio — NUTRIUSM" },
      {
        name: "description",
        content:
          "Resumen de tu día y registro rápido de tus comidas.",
      },
      { property: "og:title", content: "Inicio — NUTRIUSM" },
      {
        property: "og:description",
        content:
          "Resumen de tu día y registro rápido de tus comidas.",
      },
    ],
  }),
  component: InicioPage,
});

/** La comida que "toca" según la hora del día. */
function suggestedMeal(hour: number): Meal {
  if (hour < 11) return "desayuno";
  if (hour < 16) return "almuerzo";
  if (hour < 20) return "once";
  return "cena";
}

function greeting(hour: number): string {
  if (hour < 12) return "Buenos días";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

function MiniMacro({
  label,
  value,
  goal,
  color,
}: Readonly<{ label: string; value: number; goal: number; color: string }>) {
  const { shown, hasGoal, pct, over } = compareToGoal(value, goal);
  return (
    <div className="min-w-0 rounded-xl bg-card/80 p-2.5">
      <p className="truncate text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-extrabold">
        {shown}
        <span className="text-xs font-semibold text-muted-foreground">
          {" "}
          / {hasGoal ? `${goal} g` : "—"}
        </span>
      </p>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${over ? "bg-destructive" : color}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}

function InicioPage() {
  const { getDay, goals, savedMeals } = useDiary();

  const now = new Date();
  const hour = now.getHours();
  const suggested = suggestedMeal(hour);
  const dateLabel = now.toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const today = getDay(todayKey());
  const totals = totalsFor(today);
  const hasToday = totals.kcal > 0;

  return (
    <div className="px-4 pt-4 lg:px-0 lg:pt-0">
      <section className="rounded-3xl bg-linear-to-br from-accent to-secondary p-4 lg:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold tracking-tight lg:text-2xl">{greeting(hour)}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}
            </p>
          </div>
          <Link
            to="/progreso"
            className="flex shrink-0 items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            Ver mi progreso <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CalorieSummary value={totals.kcal} goal={goals.kcal}>
            {!hasToday && (
              <p className="mt-1 text-xs font-semibold text-primary">Aún no registras comidas hoy.</p>
            )}
          </CalorieSummary>
          <div className="grid grid-cols-3 gap-2 lg:w-96">
            <MiniMacro label="Proteínas" value={totals.protein} goal={goals.protein} color="bg-chart-2" />
            <MiniMacro label="Carbos" value={totals.carbs} goal={goals.carbs} color="bg-chart-4" />
            <MiniMacro label="Grasas" value={totals.fat} goal={goals.fat} color="bg-chart-1" />
          </div>
        </div>
      </section>

      <div className="mt-6 max-w-2xl space-y-3">
      <section>
        <h2 className="text-sm font-extrabold">¿Qué vas a registrar?</h2>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {MEALS.map((meal) => {
            const Icon = MEAL_ICONS[meal];
            const count = today[meal].length;
            const isNow = meal === suggested;
            return (
              <Link
                key={meal}
                to="/buscar"
                search={{ meal, date: todayKey() }}
                className={`flex min-w-0 items-center gap-3 rounded-2xl border p-3 transition-colors ${mealSpan(meal)} ${
                  isNow
                    ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                    isNow ? "bg-primary-foreground/20" : MEAL_TINT[meal]
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-extrabold">{MEAL_LABELS[meal]}</span>
                  <span
                    className={`block truncate text-xs ${
                      isNow ? "font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    {isNow
                      ? "Te toca ahora"
                      : count > 0
                        ? `${count} registrado${count > 1 ? "s" : ""}`
                        : "Sin registros"}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

        <Link
          to="/diario"
          hash="comidas-guardadas"
          className="flex min-w-0 items-center gap-3 rounded-2xl border-2 border-dashed border-primary/50 bg-transparent p-3 transition-colors hover:border-primary hover:bg-accent/50"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
            <Bookmark className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-extrabold text-primary">Repetir una comida guardada</span>
            <span className="block truncate text-xs text-muted-foreground">
              {savedMeals.length > 0
                ? `Tienes ${savedMeals.length} en el Diario`
                : "Guárdalas desde Buscar o el Diario"}
            </span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
