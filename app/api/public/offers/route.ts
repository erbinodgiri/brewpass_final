// app/api/public/offers/route.ts — PUBLIC
import { prisma } from '@/lib/prisma'
import { err, ok } from '@/lib/api'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const shopId = searchParams.get('shopId')
  if (!shopId) return err('shopId required')

  const now = new Date()
  const offers = await prisma.offer.findMany({
    where: {
      shopId,
      active: true,
      OR: [
        { validUntil: null },
        { validUntil: { gte: now } }
      ]
    },
    orderBy: { createdAt: 'desc' }
  })
  return ok(offers)
}
