import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Users, Send, Sparkles, UtensilsCrossed, NotebookPen, X } from "lucide-react";
import { toast } from "sonner";
import { COMMUNITY_POSTS, type CommunityPost } from "@/data/community";
import { RECIPES, recipeTotals } from "@/data/recipes";
import { foodById } from "@/data/foods";
import { MEALS, MEAL_LABELS, todayKey, useDiary } from "@/lib/diary-store";

export const Route = createFileRoute("/comunidad")({
  head: () => ({
    meta: [
      { title: "Comunidad — NUTRIUSM" },
      {
        name: "description",
        content:
          "Lee tips y comidas que comparten otros estudiantes, y comparte tu propio registro o receta favorita.",
      },
      { property: "og:title", content: "Comunidad — NUTRIUSM" },
      {
        property: "og:description",
        content: "Tips breves y comidas reales compartidas por estudiantes de la universidad.",
      },
    ],
  }),
  component: ComunidadPage,
});

const KIND_LABEL: Record<CommunityPost["kind"], string> = {
  tip: "Tip",
  registro: "Registro",
  receta: "Receta",
};

function PostCard({ post }: { post: CommunityPost }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-xs font-extrabold text-secondary-foreground">
          {post.initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{post.author}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {post.career} · {post.timeAgo}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-accent-foreground">
          {KIND_LABEL[post.kind]}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground">{post.text}</p>
      {post.attachment && (
        <div className="mt-3 flex min-w-0 items-center gap-2 rounded-xl bg-secondary px-3 py-2">
          <UtensilsCrossed className="h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="truncate text-xs font-bold">{post.attachment.title}</p>
            <p className="truncate text-[11px] text-muted-foreground">{post.attachment.detail}</p>
          </div>
        </div>
      )}
    </article>
  );
}

function ComunidadPage() {
  const { posts, addPost, getDay } = useDiary();
  const [composerOpen, setComposerOpen] = useState(false);
  const [text, setText] = useState("");
  const [attachId, setAttachId] = useState<string>("");

  const day = getDay(todayKey());

  const attachOptions = useMemo(() => {
    const options: { id: string; title: string; detail: string; kind: CommunityPost["kind"] }[] = [];
    for (const meal of MEALS) {
      const entries = day[meal];
      if (entries.length === 0) continue;
      const t = entries.reduce(
        (acc, e) => {
          const f = foodById(e.foodId);
          if (!f) return acc;
          return {
            kcal: acc.kcal + f.kcal * e.servings,
            protein: acc.protein + f.protein * e.servings,
            carbs: acc.carbs + f.carbs * e.servings,
            fat: acc.fat + f.fat * e.servings,
          };
        },
        { kcal: 0, protein: 0, carbs: 0, fat: 0 },
      );
      options.push({
        id: `meal-${meal}`,
        kind: "registro",
        title: `${MEAL_LABELS[meal]} de hoy`,
        detail: `${Math.round(t.kcal)} kcal · P ${Math.round(t.protein)}g · C ${Math.round(t.carbs)}g · G ${Math.round(t.fat)}g`,
      });
    }
    for (const r of RECIPES) {
      const t = recipeTotals(r.items);
      options.push({
        id: `recipe-${r.id}`,
        kind: "receta",
        title: r.name,
        detail: `${Math.round(t.kcal)} kcal · P ${Math.round(t.protein)}g · C ${Math.round(t.carbs)}g · G ${Math.round(t.fat)}g`,
      });
    }
    return options;
  }, [day]);

  const publish = () => {
    if (!text.trim()) return;
    const attach = attachOptions.find((o) => o.id === attachId);
    addPost({
      author: "Tú",
      career: "Estudiante USM",
      initials: "TÚ",
      kind: attach ? attach.kind : "tip",
      text: text.trim(),
      ...(attach ? { attachment: { title: attach.title, detail: attach.detail } } : {}),
    });
    toast.success("¡Publicado en la comunidad!");
    setText("");
    setAttachId("");
    setComposerOpen(false);
  };

  const allPosts = [...posts, ...COMMUNITY_POSTS];

  return (
    <div className="px-4 pt-4 lg:px-0 lg:pt-0">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-extrabold tracking-tight lg:text-2xl">Comunidad</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Comidas y tips breves de otros estudiantes.
          </p>
        </div>
        <button
          onClick={() => setComposerOpen(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
        >
          <NotebookPen className="h-3.5 w-3.5" /> Compartir
        </button>
      </header>

      <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {allPosts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>

      <div className="mt-4 flex min-w-0 items-center gap-2 rounded-2xl border border-dashed border-border p-4 text-xs text-muted-foreground">
        <Users className="h-4 w-4 shrink-0 text-primary" />
        <p className="min-w-0">
          Este muro es solo para inspirarse: no hay comentarios ni likes, únicamente comidas y
          consejos compartidos.
        </p>
      </div>

      {composerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={() => setComposerOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-card p-5 pb-8 sm:rounded-3xl sm:pb-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="min-w-0 truncate text-base font-extrabold">Compartir con la comunidad</h2>
              <button
                onClick={() => setComposerOpen(false)}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              maxLength={220}
              placeholder="Cuenta qué comiste o comparte un tip…"
              className="mt-3 w-full resize-none rounded-2xl border border-input bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Adjuntar un registro o receta
              (opcional)
            </p>
            <select
              value={attachId}
              onChange={(e) => setAttachId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="">Sin adjunto</option>
              {attachOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </select>
            <button
              onClick={publish}
              disabled={!text.trim()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40"
            >
              <Send className="h-4 w-4" /> Publicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
