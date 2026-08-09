import Link from "next/link"
import { computeStats, getActiveAlbum, getTeamStats } from "@/lib/albums"

export const dynamic = "force-dynamic"

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100)
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
      <div
        className="h-full rounded-full bg-emerald-500 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default async function HomePage() {
  const album = await getActiveAlbum()

  if (!album) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-semibold">No hay datos</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Ejecuta <code className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">npm run db:seed</code>{" "}
          para cargar el catálogo del Mundial 2026.
        </p>
      </div>
    )
  }

  const stats = computeStats(album.stickers)
  const teamStats = getTeamStats(album.stickers).sort((a, b) =>
    a.owned / a.total > b.owned / b.total ? -1 : 1,
  )

  const cards = [
    { label: "Pegados", value: stats.owned, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Repetidos", value: stats.duplicate, color: "text-sky-600 dark:text-sky-400" },
    { label: "Faltantes", value: stats.missing, color: "text-amber-600 dark:text-amber-400" },
    { label: "Completado", value: `${stats.completedPercent}%`, color: "text-zinc-900 dark:text-white" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{album.name}</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {album.description}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/faltantes"
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
          >
            Ver faltantes ({stats.missing})
          </Link>
          <Link
            href="/album"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Abrir álbum
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{c.label}</p>
            <p className={`mt-1 text-3xl font-bold tabular-nums ${c.color}`}>
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Progreso del álbum</span>
          <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
            {stats.ownedUnique}/{stats.total} cromos
          </span>
        </div>
        <ProgressBar value={stats.ownedUnique} max={stats.total} />
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Cuentan los cromos pegados y repetidos (los repetidos también los
          tienes).
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Progreso por selección</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {teamStats.map((t) => (
            <Link
              key={t.teamCode}
              href={`/album?team=${t.teamCode}`}
              className="rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-emerald-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-500"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    {t.groupCode}
                  </span>
                  <span className="font-medium">{t.teamName}</span>
                </div>
                <span className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                  {t.owned}/{t.total}
                </span>
              </div>
              <ProgressBar value={t.owned} max={t.total} />
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
        <p className="mb-2 font-medium text-zinc-800 dark:text-zinc-100">
          Cómo funciona
        </p>
        <ul className="list-inside space-y-1 text-zinc-500 dark:text-zinc-400">
          <li>
            En <Link href="/album" className="text-emerald-600 hover:underline dark:text-emerald-400">Álbum</Link>{" "}
            haz clic en un cromo para pasar de <b>Me falta</b> → <b>Pegado</b> →{" "}
            <b>Repetido</b>.
          </li>
          <li>
            En <Link href="/faltantes" className="text-amber-600 hover:underline dark:text-amber-400">Me faltan</Link>{" "}
            tienes la lista rápida de lo que te queda por pegar.
          </li>
        </ul>
      </div>
    </div>
  )
}
