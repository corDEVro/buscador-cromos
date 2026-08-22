/**
 * Barra de progreso reutilizable con estilo infantil.
 * Muestra un porcentaje acotado 0-100 y una etiqueta descriptiva.
 */
interface Props {
  percent: number
  label?: string
}

export default function ProgressBar({ percent, label }: Props) {
  // Evita valores fuera de rango si el backend aún no tiene datos
  const clamped = Math.max(0, Math.min(100, Math.round(percent)))
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
        <span>{label ?? 'Mi progreso'}</span>
        <span className="tabular-nums">{clamped}%</span>
      </div>
      <div
        className="h-4 w-full overflow-hidden rounded-full bg-white shadow-inner ring-2 ring-slate-200"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
