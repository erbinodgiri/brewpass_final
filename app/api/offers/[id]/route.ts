// app/api/offers/[id]/route.ts
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { err, ok } from '@/lib/api'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return err('Unauthorized', 401)
  const { id } = await params
  const offer = await prisma.offer.findFirst({ where: { id, shopId: session.shopId } })
  if (!offer) return err('Offer not found', 404)
  const body = await req.json()
  const data: Record<string, unknown> = {}
  if (body.title !== undefined) data.title = body.title
  if (body.description !== undefined) data.description = body.description
  if (body.emoji !== undefined) data.emoji = body.emoji
  if (body.validUntil !== undefined) data.validUntil = body.validUntil ? new Date(body.validUntil) : null
  if (body.active !== undefined) data.active = body.active
  const updated = await prisma.offer.update({ where: { id }, data })
  return ok(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return err('Unauthorized', 401)
  const { id } = await params
  const offer = await prisma.offer.findFirst({ where: { id, shopId: session.shopId } })
  if (!offer) return err('Offer not found', 404)
  await prisma.offer.delete({ where: { id } })
  return ok({ deleted: true })
}
