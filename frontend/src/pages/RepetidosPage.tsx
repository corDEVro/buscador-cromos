/**
 * Pantalla "Repetidas": lista de cromos repetidos, agrupados por equipo/serie.
 *
 * - Calcula los repetidos: entradas del usuario con status REPETIDA.
 * - Agrupa por equipo y por serie especial, con filtro y buscador.
 * - Botón flotante que copia la lista al portapapeles.
 */
import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import type { Catalog, Team } from '../api'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function RepetidosPage() {
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [repetidas, setRepetidas] = useState<Set<string>>(new Set())
  const [teamFilter, setTeamFilter] = useState<string>('ALL')
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([api.catalog(), api.collection()])
      .then(([cat, entries]) => {
        setCatalog(cat)
        setRepetidas(new Set(entries.filter((e) => e.status === 'REPETIDA').map((e) => e.stickerCode)))
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudo cargar la lista'))
  }, [])

  const groups = useMemo(() => {
    if (!catalog) return []
    const q = query.trim().toLowerCase()
    const result: { team: Team | null; title: string; items: { badge: string; name: string | null; code: string }[] }[] = []

    if (teamFilter === 'ALL' || teamFilter.startsWith('T:')) {
      for (const team of catalog.teams) {
        if (teamFilter !== 'ALL' && teamFilter !== `T:${team.code}`) continue
        const items = team.stickers
          .filter((s) => repetidas.has(s.code))
          .filter((s) => !q || (s.name ?? '').toLowerCase().includes(q) || `${s.number}${s.slotLabel ?? ''}`.includes(q))
          .sort((a, b) => a.albumOrder - b.albumOrder)
          .map((s) => ({ badge: `${s.number}${s.slotLabel ?? ''}`, name: s.name, code: s.code }))
        if (items.length) result.push({ team, title: team.shortName, items })
      }
    }
    if (teamFilter === 'ALL') {
      for (const serie of catalog.series) {
        const items = serie.stickers
          .filter((s) => repetidas.has(s.code))
          .filter((s) => !q || (s.name ?? '').toLowerCase().includes(q) || `${s.number}${s.slotLabel ?? ''}`.includes(q))
          .sort((a, b) => a.albumOrder - b.albumOrder)
          .map((s) => ({ badge: `${s.number}${s.slotLabel ?? ''}`, name: s.name, code: s.code }))
        if (items.length) result.push({ team: null, title: serie.name, items })
      }
    }
    return result
  }, [catalog, repetidas, teamFilter, query])

  const totalRepetidas = useMemo(() => groups.reduce((n, g) => n + g.items.length, 0), [groups])

  async function copyList() {
    const lines: string[] = []
    for (const g of groups) {
      lines.push(`${g.title}:`)
      lines.push(g.items.map((i) => `${i.badge} ${i.name || '¿?'}`).join(' · '))
      lines.push('')
    }
    await navigator.clipboard.writeText(lines.join('\n').trim())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-3 pb-10 pt-4">
        <div className="mb-4 rounded-3xl bg-white p-4 text-center shadow-md ring-2 ring-brand-light">
          <h1 className="text-2xl font-black text-slate-700">
            🔁 Repetidas <span className="text-orange-500">{totalRepetidas}</span>
          </h1>
          <p className="text-sm font-bold text-slate-400">Cromos duplicados, para intercambiar</p>
        </div>

        {/* Filtros */}
        <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
          <Chip active={teamFilter === 'ALL'} onClick={() => setTeamFilter('ALL')}>
            Todos
          </Chip>
          {catalog?.teams.map((t) => (
            <Chip key={t.code} active={teamFilter === `T:${t.code}`} onClick={() => setTeamFilter(`T:${t.code}`)}>
              {t.shortName}
            </Chip>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔎 Buscar jugador…"
          className="mb-4 w-full rounded-2xl border-0 bg-white px-5 py-3 text-lg font-bold shadow-inner ring-2 ring-slate-200 focus:ring-brand focus:outline-none"
        />

        {error && <p className="text-center font-bold text-red-600">{error}</p>}

        {/* Lista */}
        <div className="space-y-5">
          {groups.map((g) => (
            <section key={g.team?.code ?? g.title} className="overflow-hidden rounded-3xl bg-white shadow-md ring-2 ring-slate-100">
              <header
                className="flex items-center justify-between px-4 py-2.5 font-black text-white"
                style={{ backgroundColor: g.team?.color ?? '#334155', color: 'white' }}
              >
                <span>{g.title}</span>
                <span className="rounded-full bg-black/20 px-2.5 py-0.5 text-sm tabular-nums">{g.items.length}</span>
              </header>
              <ul className="divide-y divide-slate-100">
                {g.items.map((i) => (
                  <li key={i.code} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="grid min-w-11 place-items-center rounded-xl bg-orange-100 px-2 py-1 text-sm font-black tabular-nums text-orange-700">
                      {i.badge}
                    </span>
                    <span className="font-bold text-slate-700">{i.name || '¿?'}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {!error && totalRepetidas === 0 && catalog && (
            <div className="py-10 text-center">
              <p className="text-6xl">🎉</p>
              <p className="mt-2 text-xl font-black text-green-600">No tienes repetidas, ¡nada que intercambiar!</p>
            </div>
          )}
        </div>

        {totalRepetidas > 0 && (
          <button
            onClick={copyList}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3.5 text-lg font-black text-white shadow-xl transition hover:brightness-105 active:scale-95"
          >
            {copied ? '¡Copiado! ✅' : '📋 Copiar lista'}
          </button>
        )}

        <Footer />
      </main>
    </>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition ${
        active ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 ring-2 ring-slate-200'
      }`}
    >
      {children}
    </button>
  )
}
