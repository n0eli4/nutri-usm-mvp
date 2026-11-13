import type { ReactNode } from "react";
import { compareToGoal } from "@/components/macro-bar";

function CalorieRing({ value, goal }: Readonly<{ value: number; goal: number }>) {
  const { shown, pct, over } = compareToGoal(value, goal);
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.min(100, pct) / 100) * circumference;
  return (
    <div
      role="img"
      aria-label={`${shown} de ${goal} kcal consumidas hoy`}
      className="relative h-32 w-32 shrink-0"
    >
      <svg viewBox="0 0 112 112" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="56" cy="56" r={radius} fill="none" strokeWidth="10" className="stroke-card/80" />
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          className={`transition-all ${over ? "stroke-destructive" : "stroke-primary"}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-2xl font-black leading-none">{shown.toLocaleString("es-CL")}</p>
          <p className="mt-0.5 text-xs font-semibold text-muted-foreground">kcal hoy</p>
        </div>
      </div>
    </div>
  );
}

/** Anillo de calorías del día con el texto de cuánto queda (o cuánto se superó) de la meta. */
export function CalorieSummary({
  value,
  goal,
  showPercent = false,
  children,
}: Readonly<{ value: number; goal: number; showPercent?: boolean; children?: ReactNode }>) {
  const status = compareToGoal(value, goal);
  return (
    <div className="flex items-center gap-4">
      <CalorieRing value={value} goal={goal} />
      <div className="min-w-0">
        {!status.hasGoal && (
          <p className="text-sm font-semibold text-muted-foreground">
            Define una meta de calorías para ver tu avance.
          </p>
        )}
        {status.hasGoal && status.over && (
          <>
            <p className="text-xs font-semibold text-destructive">Superaste tu meta por</p>
            <p className="text-3xl font-black leading-tight text-destructive">
              {status.excess.toLocaleString("es-CL")}
              <span className="text-sm font-bold"> kcal</span>
            </p>
          </>
        )}
        {status.hasGoal && !status.over && (
          <>
            <p className="text-xs font-semibold text-muted-foreground">Te quedan</p>
            <p className="text-3xl font-black leading-tight">
              {status.remaining.toLocaleString("es-CL")}
              <span className="text-sm font-bold text-muted-foreground"> kcal</span>
            </p>
            <p className="text-xs text-muted-foreground">
              de tu meta de {goal.toLocaleString("es-CL")} kcal
              {showPercent ? ` · ${status.pct}%` : ""}
            </p>
          </>
        )}
        {children}
      </div>
    </div>
  );
}
