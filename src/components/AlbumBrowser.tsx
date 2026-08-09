"use client"

import { useMemo, useState } from "react"
import { setStickerStatus } from "@/lib/client-api"
import type { StickerDTO, Status, TeamDTO } from "@/lib/types"
import { nextStatus } from "@/lib/types"
import { StickerCard } from "./StickerCard"

type Section = {
  key: string
  title: string
  groupCode: string
  stickers: StickerDTO[]
}

type Props = {
  initialStickers: StickerDTO[]
  teams: TeamDTO[]
  initialTeamCode?: string
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

const STATUS_FILTERS: { key: "all" | Status; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "MISSING", label: "Me falta" },
  { key: "OWNED", label: "Pegado" },
  { key: "DUPLICATE", label: "Repetido" },
]

export function AlbumBrowser({ initialStickers, teams, initialTeamCode = "all" }: Props) {
  const [items, setItems] = useState<StickerDTO[]>(initialStickers)
  const [query, setQuery] = useState("")
  const [teamCode, setTeamCode] = useState(initialTeamCode)
  const [groupCode, setGroupCode] = useState("all")
  const [status, setStatus] = useState<"all" | Status>("all")

  const groups = useMemo(
    () => [...new Set(teams.map((t) => t.groupCode))].sort(),
    [teams],
  )

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    return items.filter((s) => {
      if (status !== "all" && s.status !== status) return false
      if (teamCode !== "all" && s.teamCode !== teamCode) return false
      if (groupCode !== "all" && s.groupCode !== groupCode) return false
      if (q) {
        const haystack = normalize(
          `${s.code} ${s.name} ${s.teamName ?? ""} ${s.groupCode ?? ""}`,
        )
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [items, query, teamCode, groupCode, status])

  const sections = useMemo<Section[]>(() => {
    const byTeam = new Map<string, StickerDTO[]>()
    const specials: StickerDTO[] = []

    for (const s of filtered) {
      if (s.category === "SPECIAL") {
        specials.push(s)
      } else if (s.teamCode) {
        const list = byTeam.get(s.teamCode)
        if (list) list.push(s)
        else byTeam.set(s.teamCode, [s])
      }
    }

    const out: Section[] = []
    if (specials.length > 0) {
      out.push({
        key: "special",
        title: "Cromos Especiales",
        groupCode: "—",
        stickers: specials,
      })
    }
    for (const team of teams) {
      const list = byTeam.get(team.code)
      if (list && list.length > 0) {
        out.push({
          key: team.code,
          title: team.name,
          groupCode: team.groupCode,
          stickers: list,
        })
      }
    }
    return out
  }, [filtered, teams])

  const resultCount = filtered.length

  async function cycle(sticker: StickerDTO) {
    const target = nextStatus(sticker.status)
    setItems((prev) =>
      prev.map((s) => (s.id === sticker.id ? { ...s, status: target } : s)),
    )
    try {
      await setStickerStatus(sticker.id, target)
    } catch {
      setItems((prev) =>
        prev.map((s) =>
          s.id === sticker.id ? { ...s, status: sticker.status } : s,
        ),
      )
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca por jugador, equipo o código (ej. ESP15, Messi…)"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-emerald-400"
          />
          <div className="flex gap-2">
            <select
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="all">Todos los grupos</option>
              {groups.map((g) => (
                <option key={g} value={g}>
                  Grupo {g}
                </option>
              ))}
            </select>
            <select
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value)}
              className="max-w-44 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="all">Todas las selecciones</option>
              {teams.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatus(f.key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                status === f.key
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">
            {resultCount} cromo{resultCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {sections.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-500">
          No hay cromos que coincidan con el filtro.
        </p>
      ) : (
        <div className="space-y-8">
          {sections.map((section) => {
            const owned = section.stickers.filter(
              (s) => s.status !== "MISSING",
            ).length
            return (
              <section key={section.key}>
                <div className="mb-3 flex items-baseline gap-2 border-b border-zinc-200 pb-2 dark:border-zinc-800">
                  <h2 className="text-lg font-semibold">{section.title}</h2>
                  {section.groupCode !== "—" && (
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      Grupo {section.groupCode}
                    </span>
                  )}
                  <span className="ml-auto text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
                    {owned}/{section.stickers.length}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                  {section.stickers.map((s) => (
                    <StickerCard key={s.id} sticker={s} onCycle={cycle} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
