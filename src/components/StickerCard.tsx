"use client"

import type { StickerDTO } from "@/lib/types"
import { STATUS_META } from "@/lib/types"

const STATUS_STYLES: Record<StickerDTO["status"], string> = {
  MISSING:
    "border-zinc-300 bg-white hover:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-emerald-400",
  OWNED:
    "border-emerald-500 bg-emerald-50 hover:border-sky-500 dark:border-emerald-600 dark:bg-emerald-950/50 dark:hover:border-sky-400",
  DUPLICATE:
    "border-sky-500 bg-sky-50 hover:border-zinc-400 dark:border-sky-600 dark:bg-sky-950/50 dark:hover:border-zinc-500",
}

const STATUS_DOT: Record<StickerDTO["status"], string> = {
  MISSING: "bg-zinc-300 dark:bg-zinc-600",
  OWNED: "bg-emerald-500",
  DUPLICATE: "bg-sky-500",
}

type Props = {
  sticker: StickerDTO
  onCycle: (sticker: StickerDTO) => void
}

export function StickerCard({ sticker, onCycle }: Props) {
  const meta = STATUS_META[sticker.status]
  const isSpecial = sticker.category === "SPECIAL"

  return (
    <button
      type="button"
      onClick={() => onCycle(sticker)}
      title={`${sticker.code} · ${sticker.name} — ${meta.hint}. Clic para cambiar estado.`}
      className={`group relative flex flex-col gap-1 rounded-lg border p-2.5 text-left transition-colors ${STATUS_STYLES[sticker.status]}`}
    >
      <span className="flex items-center justify-between gap-1">
        <span className="font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-200">
          {sticker.code}
        </span>
        <span
          className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[sticker.status]}`}
        />
      </span>
      <span className="line-clamp-2 text-sm leading-tight text-zinc-700 dark:text-zinc-300">
        {isSpecial ? sticker.name : sticker.name}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
        {meta.short}
      </span>
    </button>
  )
}
