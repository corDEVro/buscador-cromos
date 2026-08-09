export const STATUSES = ["MISSING", "OWNED", "DUPLICATE"] as const
export type Status = (typeof STATUSES)[number]

export const CATEGORIES = ["LOGO", "PLAYER", "PHOTO", "SPECIAL"] as const
export type Category = (typeof CATEGORIES)[number]

export type StickerDTO = {
  id: number
  code: string
  name: string
  number: number
  category: Category
  status: Status
  albumOrder: number
  teamCode: string | null
  teamName: string | null
  groupCode: string | null
}

export type TeamDTO = {
  id: number
  code: string
  name: string
  groupCode: string
  order: number
}

export type AlbumDTO = {
  id: number
  slug: string
  name: string
  description: string | null
  teams: TeamDTO[]
  stickers: StickerDTO[]
}

export type AlbumStats = {
  total: number
  owned: number
  duplicate: number
  missing: number
  ownedUnique: number
  completedPercent: number
}

export const STATUS_META: Record<
  Status,
  { label: string; short: string; hint: string }
> = {
  MISSING: { label: "Me falta", short: "Falta", hint: "Aún no tienes este cromo" },
  OWNED: { label: "Pegado", short: "Tengo", hint: "Ya pegado en el álbum" },
  DUPLICATE: { label: "Repetido", short: "Repito", hint: "Lo tienes y además repites" },
}

export const CYCLE_ORDER: Status[] = ["MISSING", "OWNED", "DUPLICATE"]

export function nextStatus(s: Status): Status {
  const i = CYCLE_ORDER.indexOf(s)
  return CYCLE_ORDER[(i + 1) % CYCLE_ORDER.length]
}
