import { AlbumBrowser } from "@/components/AlbumBrowser"
import { getActiveAlbum } from "@/lib/albums"

export const dynamic = "force-dynamic"

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AlbumPage({ searchParams }: Props) {
  const params = await searchParams
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

  const team = typeof params.team === "string" ? params.team : undefined

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Álbum completo</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {album.name} · {album.stickers.length} cromos. Haz clic en un cromo
          para cambiar su estado.
        </p>
      </div>
      <AlbumBrowser
        initialStickers={album.stickers}
        teams={album.teams}
        initialTeamCode={team}
      />
    </div>
  )
}
