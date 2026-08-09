"use client"

import { useMemo, useState } from "react"
import { setStickerStatus } from "@/lib/client-api"
import type { StickerDTO, Status, TeamDTO } from "@/lib/types"

type Props = {
  initialStickers: StickerDTO[]
  teams: TeamDTO[]
  totalStickers: number
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

type Section = { teamCode: string; teamName: string; groupCode: string; stickers: StickerDTO[] }

export function MissingList({ initialStickers, teams, totalStickers }: Props) {
  const [items, setItems] = useState<StickerDTO[]>(initialStickers)
  const [query, setQuery] = useState("")
  const [teamCode, setTeamCode] = useState("all")
  const [groupCode, setGroupCode] = useState("all")

  const groups = useMemo(
    () => [...new Set(teams.map((t) => t.groupCode))].sort(),
    [teams],
  )

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    return items.filter((s) => {
      if (teamCode !== "all" && s.teamCode !== teamCode) return false
      if (groupCode !== "all" && s.groupCode !== groupCode) return false
      if (q) {
        const haystack = normalize(`${s.code} ${s.name} ${s.teamName ?? ""}`)
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [items, query, teamCode, groupCode])

  const sections = useMemo<Section[]>(() => {
    const byTeam = new Map<string, Section>()
    for (const s of filtered) {
      const key = s.teamCode ?? "special"
      let section = byTeam.get(key)
      if (!section) {
        section = {
          teamCode: key,
          teamName: s.teamName ?? "Cromos especiales",
          groupCode: s.groupCode ?? "—",
          stickers: [],
        }
        byTeam.set(key, section)
      }
      section.stickers.push(s)
    }
    return [...byTeam.values()].map((section) => ({
      ...section,
      stickers: [...section.stickers].sort((a, b) => a.albumOrder - b.albumOrder),
    }))
  }, [filtered])

  const missingCount = items.length

  async function mark(sticker: StickerDTO, status: Status) {
    setItems((prev) => prev.filter((s) => s.id !== sticker.id))
    try {
      await setStickerStatus(sticker.id, status)
    } catch {
      setItems((prev) => [...prev, sticker])
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/40">
        <span className="text-2xl">🎯</span>
        <div>
          <p className="font-semibold text-amber-900 dark:text-amber-200">
            Te faltan {missingCount} cromos de {totalStickers}
          </p>
          <p className="text-sm text-amber-800/80 dark:text-amber-300/70">
            {Math.round((missingCount / totalStickers) * 100)}% del álbum por
            completar.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrar por jugador o código…"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-950"
          />
          <div className="flex gap-2">
            <select
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-950"
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
              className="max-w-44 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-950"
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
      </div>

      {sections.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-500">
          ¡No hay faltantes que coincidan con el filtro! 🎉
        </p>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <section key={section.teamCode}>
              <div className="mb-2 flex items-baseline gap-2 border-b border-zinc-200 pb-2 dark:border-zinc-800">
                <h2 className="font-semibold">{section.teamName}</h2>
                {section.groupCode !== "—" && (
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    Grupo {section.groupCode}
                  </span>
                )}
                <span className="ml-auto text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
                  {section.stickers.length} faltante
                  {section.stickers.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {section.stickers.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <span className="font-mono text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      {s.code}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-zinc-800 dark:text-zinc-200">
                      {s.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => mark(s, "OWNED")}
                      className="shrink-0 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
                    >
                      Tengo
                    </button>
                    <button
                      type="button"
                      onClick={() => mark(s, "DUPLICATE")}
                      className="shrink-0 rounded-md bg-sky-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-sky-700"
                    >
                      Repito
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
