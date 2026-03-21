// app/api/menu/[id]/route.ts
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { err, ok } from '@/lib/api'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return err('Unauthorized', 401)
  const { id } = await params
  const item = await prisma.menuItem.findFirst({ where: { id, shopId: session.shopId } })
  if (!item) return err('Item not found', 404)
  const body = await req.json()
  const allowed = ['name', 'description', 'price', 'category', 'imageEmoji', 'available', 'sortOrder']
  const data: Record<string, unknown> = {}
  for (const k of allowed) if (body[k] !== undefined) data[k] = body[k]
  const updated = await prisma.menuItem.update({ where: { id }, data })
  return ok(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return err('Unauthorized', 401)
  const { id } = await params
  const item = await prisma.menuItem.findFirst({ where: { id, shopId: session.shopId } })
  if (!item) return err('Item not found', 404)
  await prisma.menuItem.delete({ where: { id } })
  return ok({ deleted: true })
}
