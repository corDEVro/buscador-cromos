/**
 * Pantalla principal "Mi álbum".
 *
 * - Pide catálogo + estados + estadísticas al arrancar.
 * - Pestañas por sección (Equipos, ADN Prime, Fantasy, Draft 23, Kromix, Extras).
 * - Dentro de "Equipos", selector del equipo concreto.
 * - Buscador por nombre o número.
 * - Tocar un cromo cicla su estado con actualización optimista.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import type { Catalog, EntryDto, Section, Stats, Sticker } from '../api'
import Header from '../components/Header'
import ProgressBar from '../components/ProgressBar'
import StickerCard from '../components/StickerCard'

/** Pestaña activa: EQUIPO muestra el selector de equipos; el resto son series. */
type ViewKey = 'EQUIPO' | Section

const SERIES_TABS: { key: ViewKey; label: string }[] = [
  { key: 'EQUIPO', label: 'Equipos' },
  { key: 'ADN_PRIME', label: 'ADN Prime' },
  { key: 'FANTASY', label: 'Fantasy' },
  { key: 'DRAFT23', label: 'Draft 23' },
  { key: 'KROMIX', label: 'Kromix' },
  { key: 'FICHAJES', label: 'Fichajes 🔄' },
  { key: 'EXTRA', label: 'Extras ✨' },
]

export default function AlbumPage() {
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [statuses, setStatuses] = useState<Map<string, string>>(new Map())
  const [stats, setStats] = useState<Stats | null>(null)
  const [view, setView] = useState<ViewKey>('EQUIPO')
  const [teamCode, setTeamCode] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  /** Carga inicial en paralelo: catálogo, estados guardados y estadísticas. */
  useEffect(() => {
    Promise.all([api.catalog(), api.collection(), api.stats()])
      .then(([cat, entries, st]) => {
        setCatalog(cat)
        setStats(st)
        setStatuses(new Map(entries.map((e: EntryDto) => [e.stickerCode, e.status])))
        setTeamCode(cat.teams[0]?.code ?? null)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudo cargar el álbum'))
  }, [])

  /**
   * Cambia el estado de un cromo al tocarlo.
   * Actualización optimista: pintamos el nuevo estado al instante y revertimos
   * solo si el backend falla (ideal para niños impacientes 😉).
   */
  const cycle = useCallback(
    async (code: string) => {
      // Actualización optimista para que responda al instante (niños impacientes 😉)
      const current = (statuses.get(code) as never) ?? 'FALTA'
      const next = current === 'FALTA' ? 'PEGADA' : current === 'PEGADA' ? 'REPETIDA' : 'FALTA'
      setStatuses((prev) => new Map(prev).set(code, next))
      try {
        const res = await api.cycle(code)
        setStatuses((prev) => new Map(prev).set(code, res.status))
        api.stats().then(setStats).catch(() => undefined)
      } catch {
        setStatuses((prev) => new Map(prev).set(code, current))
        setError('No se pudo guardar. ¿Tienes internet?')
      }
    },
    [statuses],
  )

  /** Láminas a mostrar según pestaña/equipo activo y texto de búsqueda. */
  const stickersToShow: Sticker[] = useMemo(() => {
    if (!catalog) return []
    let list: Sticker[]
    if (view === 'EQUIPO') {
      const team = catalog.teams.find((t) => t.code === teamCode)
      list = team ? [...team.stickers] : []
    } else {
      list = catalog.series.find((s) => s.code === view)?.stickers ?? []
    }
    // Busca por nombre, número suelto ("20") o lámina exacta ("18b")
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        String(s.number).includes(q) ||
        `${s.number}${s.slotLabel ?? ''}`.toLowerCase() === q,
    )
  }, [catalog, view, teamCode, query])

  if (error && !catalog) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl p-6 text-center font-bold text-red-600">{error}</main>
      </>
    )
  }

  if (!catalog) {
    return (
      <>
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center text-5xl">
          <span className="animate-bounce">⚽</span>
        </main>
      </>
    )
  }

  const selectedTeam = catalog.teams.find((t) => t.code === teamCode)

  return (
    <>
      <Header progress={stats?.percent} />
      <main className="mx-auto max-w-3xl px-3 pb-10 pt-4">
        <div className="mb-4 rounded-3xl bg-white p-4 shadow-md ring-2 ring-brand-light">
          <ProgressBar percent={stats?.percent ?? 0} label={`Llevas ${stats?.pegadas ?? 0} de ${stats?.total ?? 562}`} />
          <p className="mt-2 text-center text-sm font-bold text-slate-500">
            🔁 Repetidas: <span className="tabular-nums">{stats?.repetidas ?? 0}</span>
          </p>
        </div>

        {/* Pestañas de secciones */}
        <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
          {SERIES_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setView(t.key)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition ${
                view === t.key
                  ? 'bg-brand text-white shadow-md'
                  : 'bg-white text-slate-600 ring-2 ring-slate-200 hover:ring-brand-light'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Selector de equipo */}
        {view === 'EQUIPO' ? (
          <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
            {catalog.teams.map((t) => (
              <button
                key={t.code}
                onClick={() => setTeamCode(t.code)}
                className={`flex shrink-0 items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-sm font-extrabold transition ${
                  teamCode === t.code ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 ring-2 ring-slate-200'
                }`}
              >
                <span
                  className="grid h-8 w-8 place-items-center rounded-full text-xs font-black text-white"
                  style={{ backgroundColor: t.color, color: pickText(t.color) }}
                >
                  {t.shortName.slice(0, 2).toUpperCase()}
                </span>
                {t.shortName}
              </button>
            ))}
          </div>
        ) : (
          catalog.series.find((s) => s.code === view) && (
            <h2 className="mb-3 text-center text-xl font-black text-slate-700">
              {catalog.series.find((s) => s.code === view)!.name}
              {view === 'EXTRA' && (
                <span className="mt-1 block text-xs font-bold text-slate-400">
                  Estos cromos no van en el álbum, son joyas de coleccionista 💎
                </span>
              )}
            </h2>
          )
        )}

        {/* Buscador */}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔎 Buscar jugador o número…"
          className="mb-4 w-full rounded-2xl border-0 bg-white px-5 py-3 text-lg font-bold shadow-inner ring-2 ring-slate-200 focus:ring-brand focus:outline-none"
        />

        {/* Rejilla de cromos */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {stickersToShow.map((s) => (
            <StickerCard
              key={s.code}
              code={s.code}
              name={s.name}
              badge={`${s.number}${s.slotLabel ?? ''}`}
              status={(statuses.get(s.code) ?? 'FALTA') as never}
              onCycle={cycle}
            />
          ))}
          {stickersToShow.length === 0 && (
            <p className="col-span-full mt-6 text-center font-bold text-slate-400">
              No hay cromos aquí 👀
            </p>
          )}
        </div>

        {view === 'EQUIPO' && selectedTeam && (
          <p className="mt-4 text-center text-sm font-bold text-slate-400">
            Toca un cromo para cambiarlo: ❔ me falta → ✅ la tengo → 🔁 repetida
          </p>
        )}
      </main>
    </>
  )
}

/** Elige texto blanco o negro según el color del equipo. */
function pickText(hex: string): string {
  const c = hex.replace('#', '')
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  return r * 299 + g * 587 + b * 114 > 500 ? '#1e293b' : '#ffffff'
}
