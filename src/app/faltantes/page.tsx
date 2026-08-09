import { MissingList } from "@/components/MissingList"
import { getActiveAlbum } from "@/lib/albums"

export const dynamic = "force-dynamic"

export default async function MissingPage() {
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

  const missing = album.stickers.filter((s) => s.status === "MISSING")

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Me faltan</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Consulta rápida de los cromos que te faltan para completar el álbum.
        </p>
      </div>
      <MissingList
        initialStickers={missing}
        teams={album.teams}
        totalStickers={album.stickers.length}
      />
    </div>
  )
}
