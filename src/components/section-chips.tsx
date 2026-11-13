import { useEffect, useState } from "react";

export interface ChipSection {
  /** id del elemento de la página al que lleva este botón */
  id: string;
  label: string;
}

/** Distancia desde el borde superior de la ventana a partir de la cual una sección cuenta como "actual". */
const PIVOT = 150;
/** La barra aparece cuando la página mide más de 1,6 pantallas y se oculta bajo 1,4 (así no parpadea). */
const SHOW_ABOVE = 1.6;
const HIDE_BELOW = 1.4;

/** ¿La página es lo bastante larga como para necesitar una barra de secciones? */
function useIsLongPage(): boolean {
  const [long, setLong] = useState(false);
  useEffect(() => {
    const measure = () => {
      const ratio = document.documentElement.scrollHeight / globalThis.innerHeight;
      setLong((prev) => (prev ? ratio >= HIDE_BELOW : ratio > SHOW_ABOVE));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    globalThis.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      globalThis.removeEventListener("resize", measure);
    };
  }, []);
  return long;
}

function useActiveSection(ids: string[]): number {
  const [active, setActive] = useState(0);
  const key = ids.join("|");

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      let current = 0;
      ids.forEach((id, i) => {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= PIVOT) current = i;
      });
      // Al llegar al final de la página, la última sección cuenta como actual.
      const atBottom =
        globalThis.innerHeight + globalThis.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom && globalThis.scrollY > 0) current = ids.length - 1;
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    globalThis.addEventListener("scroll", onScroll, { passive: true });
    globalThis.addEventListener("resize", onScroll);
    return () => {
      globalThis.removeEventListener("scroll", onScroll);
      globalThis.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return Math.min(active, Math.max(0, ids.length - 1));
}

/**
 * Botones "Ir a…" pegados arriba: resaltan la sección en la que estás y llevan a cada una al tocarlos.
 * Por defecto solo se ven en celular y tablet; con `desktop` también en pantallas grandes.
 * Solo aparece si la página es lo bastante larga como para necesitarla.
 */
export function SectionChips({
  sections,
  desktop = false,
}: Readonly<{ sections: ChipSection[]; desktop?: boolean }>) {
  const active = useActiveSection(sections.map((s) => s.id));
  const isLong = useIsLongPage();
  if (sections.length < 2 || !isLong) return null;

  return (
    <nav
      aria-label="Ir a una sección de esta pantalla"
      className={`sticky top-14 z-30 -mx-4 mb-3 border-b border-border bg-background/95 px-4 py-2 backdrop-blur ${
        desktop ? "lg:top-0 lg:mx-0 lg:px-0" : "lg:hidden"
      }`}
    >
      <ul className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((s, i) => (
          <li key={s.id} className="shrink-0">
            <button
              type="button"
              onClick={() =>
                document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              aria-current={i === active ? "true" : undefined}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                i === active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
              }`}
            >
              {s.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
