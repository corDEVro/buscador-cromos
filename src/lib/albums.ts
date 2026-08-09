import { prisma } from "./prisma"
import type { AlbumDTO, AlbumStats, StickerDTO, TeamDTO } from "./types"

export const ACTIVE_ALBUM_SLUG = "mundial-2026"

function toStickerDTO(sticker: {
  id: number
  code: string
  name: string
  number: number
  category: string
  status: string
  albumOrder: number
  team: { code: string; name: string; groupCode: string } | null
}): StickerDTO {
  return {
    id: sticker.id,
    code: sticker.code,
    name: sticker.name,
    number: sticker.number,
    category: sticker.category as StickerDTO["category"],
    status: sticker.status as StickerDTO["status"],
    albumOrder: sticker.albumOrder,
    teamCode: sticker.team?.code ?? null,
    teamName: sticker.team?.name ?? null,
    groupCode: sticker.team?.groupCode ?? null,
  }
}

export async function getAlbum(slug: string): Promise<AlbumDTO | null> {
  const album = await prisma.album.findUnique({
    where: { slug },
    include: {
      teams: { orderBy: { order: "asc" } },
      stickers: { orderBy: { albumOrder: "asc" }, include: { team: true } },
    },
  })

  if (!album) return null

  const teams: TeamDTO[] = album.teams.map((t) => ({
    id: t.id,
    code: t.code,
    name: t.name,
    groupCode: t.groupCode,
    order: t.order,
  }))

  const stickers: StickerDTO[] = album.stickers.map((s) => toStickerDTO(s))

  return {
    id: album.id,
    slug: album.slug,
    name: album.name,
    description: album.description,
    teams,
    stickers,
  }
}

export async function getActiveAlbum(): Promise<AlbumDTO | null> {
  return getAlbum(ACTIVE_ALBUM_SLUG)
}

export function computeStats(stickers: StickerDTO[]): AlbumStats {
  const total = stickers.length
  const owned = stickers.filter((s) => s.status === "OWNED").length
  const duplicate = stickers.filter((s) => s.status === "DUPLICATE").length
  const missing = total - owned - duplicate
  const ownedUnique = owned + duplicate
  const completedPercent =
    total === 0 ? 0 : Math.round((ownedUnique / total) * 100)
  return { total, owned, duplicate, missing, ownedUnique, completedPercent }
}

export function getTeamStats(stickers: StickerDTO[]) {
  const map = new Map<
    string,
    { teamCode: string; teamName: string; groupCode: string; total: number; owned: number }
  >()

  for (const s of stickers) {
    if (!s.teamCode) continue
    let entry = map.get(s.teamCode)
    if (!entry) {
      entry = {
        teamCode: s.teamCode,
        teamName: s.teamName ?? s.teamCode,
        groupCode: s.groupCode ?? "",
        total: 0,
        owned: 0,
      }
      map.set(s.teamCode, entry)
    }
    entry.total++
    if (s.status !== "MISSING") entry.owned++
  }

  return [...map.values()]
}
