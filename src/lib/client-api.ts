import type { Status } from "./types"

export async function setStickerStatus(id: number, status: Status): Promise<void> {
  const res = await fetch(`/api/stickers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })

  if (!res.ok) {
    throw new Error(`No se pudo actualizar el cromo ${id}`)
  }
}
