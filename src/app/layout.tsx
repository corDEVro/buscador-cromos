import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mis Cromos · Mundial 2026",
  description:
    "Controla tu colección de cromos del Mundial FIFA 2026: qué tienes, qué repites y qué te falta para completar el álbum.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col">
        <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80 sticky top-0 z-40">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold tracking-tight"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-600 text-sm text-white">
                ⚽
              </span>
              <span>
                Mis Cromos
                <span className="ml-2 hidden rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 sm:inline dark:bg-zinc-800 dark:text-zinc-300">
                  Mundial 2026
                </span>
              </span>
            </Link>
            <nav className="ml-auto flex items-center gap-1 text-sm font-medium">
              <Link
                href="/"
                className="rounded-md px-3 py-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                Inicio
              </Link>
              <Link
                href="/album"
                className="rounded-md px-3 py-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                Álbum
              </Link>
              <Link
                href="/faltantes"
                className="rounded-md px-3 py-1.5 text-amber-700 hover:bg-amber-50 hover:text-amber-900 dark:text-amber-400 dark:hover:bg-amber-950 dark:hover:text-amber-200"
              >
                Me faltan
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
