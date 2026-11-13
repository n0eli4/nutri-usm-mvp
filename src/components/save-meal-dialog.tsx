import { useEffect, useState } from "react";
import { Bookmark, X } from "lucide-react";

const MAX_NAME_LENGTH = 40;

/** Nombre sugerido a partir de los dos primeros alimentos ("Lentejas + Chorizo +1"). */
export function suggestMealName(names: string[], fallback: string): string {
  if (names.length === 0) return fallback;
  const base = names.slice(0, 2).join(" + ");
  return names.length > 2 ? `${base} +${names.length - 2}` : base;
}

/** Cuadro para ponerle nombre propio a una comida antes de guardarla. */
export function SaveMealDialog({
  suggestedName,
  summary,
  title = "Guardar comida",
  confirmLabel = "Guardar",
  onSave,
  onClose,
}: Readonly<{
  suggestedName: string;
  summary: string;
  title?: string;
  confirmLabel?: string;
  onSave: (name: string) => void;
  onClose: () => void;
}>) {
  const [name, setName] = useState(suggestedName.slice(0, MAX_NAME_LENGTH));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const clean = name.trim();

  return (
    <dialog
      open
      aria-label={title}
      className="fixed inset-0 z-50 m-0 flex h-full w-full max-w-none items-end justify-center bg-black/40 p-0 sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        className="relative w-full max-w-md rounded-t-3xl bg-card p-5 pb-8 sm:rounded-3xl sm:pb-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (clean) onSave(clean);
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex min-w-0 items-center gap-2 text-base font-extrabold">
            <Bookmark className="h-4 w-4 shrink-0 text-primary" /> {title}
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
        <p className="mt-1 text-xs text-muted-foreground">{summary}</p>

        <label htmlFor="saved-meal-name" className="mt-4 block text-xs font-bold">
          Ponle un nombre
        </label>
        <input
          id="saved-meal-name"
          autoFocus
          value={name}
          maxLength={MAX_NAME_LENGTH}
          onChange={(e) => setName(e.target.value)}
          onFocus={(e) => e.target.select()}
          placeholder="Ej: Lentejitas de mi abuela"
          className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />

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
            disabled={!clean}
            className="rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40"
          >
            {confirmLabel}
          </button>
        </div>
      </form>
    </dialog>
  );
}
