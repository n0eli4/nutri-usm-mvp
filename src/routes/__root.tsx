import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Leaf, Search, BookOpen, TrendingUp, Users } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { DiaryProvider } from "@/lib/diary-store";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página no encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La página que buscas no existe o fue movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Esta página no cargó
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo salió mal. Puedes intentar recargar o volver al inicio.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Reintentar
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "NUTRIUSM — Registro de alimentación universitaria" },
      {
        name: "description",
        content:
          "NUTRIUSM: registra tus comidas, busca alimentos con sus macros y sigue tus metas diarias de calorías, proteínas, carbohidratos y grasas.",
      },
      { property: "og:title", content: "NUTRIUSM — Registro de alimentación universitaria" },
      {
        property: "og:description",
        content: "Busca alimentos, registra tus comidas del día y compara tu consumo con tus metas diarias.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const NAV_ITEMS = [
  { to: "/", label: "Registrar", icon: Search },
  { to: "/diario", label: "Diario", icon: BookOpen },
  { to: "/progreso", label: "Progreso", icon: TrendingUp },
  { to: "/comunidad", label: "Comunidad", icon: Users },
] as const;

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            className="flex min-w-0 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold"
            activeProps={{ className: "text-primary" }}
            inactiveProps={{ className: "text-muted-foreground" }}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

function Brand({ className = "" }: { className?: string }) {
  return (
    <span className={`flex min-w-0 items-center gap-2 ${className}`}>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Leaf className="h-4.5 w-4.5" />
      </span>
      <span className="min-w-0 truncate text-lg font-extrabold tracking-tight text-foreground">
        NUTRI<span className="text-primary">USM</span>
      </span>
    </span>
  );
}

function SideNav() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-card/60 px-4 py-5 lg:flex xl:w-64">
      <Brand />
      <nav className="mt-8 flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            className="flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors"
            activeProps={{ className: "bg-accent text-primary" }}
            inactiveProps={{ className: "text-muted-foreground hover:bg-muted" }}
          >
            <Icon className="h-4.5 w-4.5 shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </nav>
      <p className="mt-auto text-[11px] leading-relaxed text-muted-foreground">
        Prototipo de registro de alimentación para estudiantes.
      </p>
    </aside>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <DiaryProvider>
        <div className="flex min-h-screen w-full bg-background">
          <SideNav />
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur lg:hidden">
              <div className="mx-auto w-full max-w-md px-4 py-3">
                <Brand />
              </div>
            </header>
            <main className="mx-auto w-full max-w-md flex-1 pb-24 lg:max-w-6xl lg:px-8 lg:py-6 lg:pb-10">
              <Outlet />
            </main>
          </div>
          <BottomNav />
        </div>
        <Toaster position="top-center" richColors />
      </DiaryProvider>
    </QueryClientProvider>
  );
}

