// app/api/requests/route.ts
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { err, ok } from '@/lib/api'

export async function GET() {
  const session = await getSession()
  if (!session) return err('Unauthorized', 401)

  const requests = await prisma.stampRequest.findMany({
    where: { shopId: session.shopId, status: 'pending' },
    include: {
      customer: {
        include: {
          stamps: { where: { redeemed: false } }
        }
      }
    },
    orderBy: { createdAt: 'asc' },
  })

  const shop = await prisma.shop.findUnique({
    where: { id: session.shopId },
    select: { stampGoal: true }
  })

  const enriched = requests.map(r => ({
    id: r.id,
    phone: r.phone,
    name: r.name,
    createdAt: r.createdAt,
    status: r.status,
    activeStamps: r.customer?.stamps.length ?? 0,
    stampGoal: shop?.stampGoal ?? 7,
    customerId: r.customerId,
  }))

  return ok(enriched)
}
