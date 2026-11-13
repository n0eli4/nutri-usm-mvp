import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { Goals } from "@/lib/diary-store";

export const MACRO_META: { key: keyof Goals; label: string; unit: string; color: string }[] = [
  { key: "kcal", label: "Calorías", unit: "kcal", color: "bg-primary" },
  { key: "protein", label: "Proteínas", unit: "g", color: "bg-chart-2" },
  { key: "carbs", label: "Carbohidratos", unit: "g", color: "bg-chart-4" },
  { key: "fat", label: "Grasas", unit: "g", color: "bg-chart-1" },
];


const round1 = (n: number) => Math.round(n * 10) / 10;

export function compareToGoal(value: number, goal: number) {
  const shown = Math.round(value);
  const hasGoal = goal > 0;
  const diff = hasGoal ? round1(shown - goal) : 0;
  return {
    shown,
    hasGoal,
    pct: hasGoal ? Math.round((shown / goal) * 100) : 0,
    over: hasGoal && diff > 0,
    met: hasGoal && diff === 0,
    // ✅ FIX S7766: Uso de Math.max para simplificar ternarios
    excess: Math.max(0, diff),
    remaining: Math.max(0, -diff),
  };
}

// ✅ FIX S6759: Props de solo lectura
export function MacroBar({
  label,
  unit,
  color,
  value,
  goal,
  featured = false,
}: Readonly<{
  label: string;
  unit: string;
  color: string;
  value: number;
  goal: number;
  featured?: boolean;
}>) {
  const { shown, hasGoal, pct, over, met, excess, remaining } = compareToGoal(value, goal);

  // ✅ FIX S3358: Extraer ternario anidado a variable independiente
  let statusNode;
  if (!hasGoal) {
    statusNode = <p className="mt-1.5 text-right text-xs font-bold text-muted-foreground">Define una meta para ver el avance</p>;
  } else if (over) {
    statusNode = (
      <p className="mt-1.5 flex items-center justify-end gap-1 text-right text-xs font-bold text-destructive">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        Superaste tu meta de {label.toLowerCase()} por {excess} {unit} ({pct}%)
      </p>
    );
  } else if (met) {
    statusNode = (
      <p className="mt-1.5 flex items-center justify-end gap-1 text-right text-xs font-bold text-primary">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        Meta alcanzada (100%)
      </p>
    );
  } else {
    statusNode = (
      <p className="mt-1.5 text-right text-xs font-bold text-muted-foreground">
        {pct}% de la meta · te faltan {remaining} {unit}
      </p>
    );
  }

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
      {statusNode}
    </div>
  );
}
