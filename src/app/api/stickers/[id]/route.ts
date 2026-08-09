import { prisma } from "@/lib/prisma"
import { STATUSES, type Status } from "@/lib/types"

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/stickers/[id]">,
) {
  const { id } = await ctx.params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 })
  }

  const status = (body as { status?: unknown }).status
  if (typeof status !== "string" || !STATUSES.includes(status as Status)) {
    return Response.json(
      { error: "Estado inválido. Usa MISSING, OWNED o DUPLICATE." },
      { status: 400 },
    )
  }

  const stickerId = Number(id)
  if (!Number.isInteger(stickerId)) {
    return Response.json({ error: "Id inválido" }, { status: 400 })
  }

  const sticker = await prisma.sticker.update({
    where: { id: stickerId },
    data: { status: status as Status },
  })

  return Response.json({ id: sticker.id, status: sticker.status })
}
