// app/api/offers/route.ts
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { err, ok } from '@/lib/api'

export async function GET() {
  const session = await getSession()
  if (!session) return err('Unauthorized', 401)
  const offers = await prisma.offer.findMany({
    where: { shopId: session.shopId },
    orderBy: { createdAt: 'desc' }
  })
  return ok(offers)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return err('Unauthorized', 401)
  const { title, description, emoji, validUntil } = await req.json()
  if (!title?.trim()) return err('Title required')
  const offer = await prisma.offer.create({
    data: {
      shopId: session.shopId,
      title: title.trim(),
      description: description?.trim() || null,
      emoji: emoji || '🎉',
      validUntil: validUntil ? new Date(validUntil) : null,
      active: true,
    }
  })
  return ok(offer, 201)
}
