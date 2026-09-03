import type { Status } from '../api'

/** Aspecto del cromo según su estado: colores, texto e icono. */
const STYLES: Record<Status, { card: string; label: string; icon: string }> = {
  FALTA: {
    card: 'bg-white border-slate-300 border-dashed text-slate-500',
    label: 'Me falta',
    icon: '❔',
  },
  PEGADA: {
    card: 'bg-gradient-to-br from-emerald-400 to-green-600 border-green-700 text-white shadow-md',
    label: '¡La tengo!',
    icon: '✅',
  },
  REPETIDA: {
    card: 'bg-gradient-to-br from-amber-300 to-orange-400 border-orange-500 text-orange-950 shadow-md',
    label: 'Repetida',
    icon: '🔁',
  },
}

interface Props {
  code: string
  name: string | null
  badge: string
  status: Status
  onCycle: (code: string) => void
}

/** Cromo grande y táctil: un toque cambia Falta → Pegada → Repetida → Falta. */
export default function StickerCard({ code, name, badge, status, onCycle }: Props) {
  const s = STYLES[status]
  return (
    <button
      onClick={() => onCycle(code)}
      className={`relative flex min-h-28 flex-col items-center justify-center gap-1 rounded-3xl border-4 p-2 pt-5 text-center transition active:animate-pop ${s.card}`}
    >
      <span className="absolute left-2 top-1.5 rounded-lg bg-black/10 px-1.5 py-0.5 text-xs font-extrabold tabular-nums">
        {badge}
      </span>
      <span className="absolute right-2 top-1.5 text-base">{s.icon}</span>
      <span className="line-clamp-2 px-1 text-sm leading-tight font-extrabold sm:text-base">
        {name || `Nº ${badge}`}
      </span>
      <span className="text-[11px] font-bold opacity-80">{s.label}</span>
    </button>
  )
}
