// app/api/stamps/redeem/route.ts
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { err, ok } from '@/lib/api'

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return err('Unauthorized', 401)

  const { customerId } = await req.json()
  if (!customerId) return err('Customer ID required')

  const shop = await prisma.shop.findUnique({ where: { id: session.shopId } })
  if (!shop) return err('Shop not found', 404)

  const customer = await prisma.customer.findFirst({
    where: { id: customerId, shopId: session.shopId }
  })
  if (!customer) return err('Customer not found', 404)

  const activeStamps = await prisma.stamp.count({
    where: { customerId, shopId: session.shopId, redeemed: false }
  })
  if (activeStamps < shop.stampGoal) {
    return err(`Not enough stamps. Has ${activeStamps}, needs ${shop.stampGoal}`)
  }

  const toRedeem = await prisma.stamp.findMany({
    where: { customerId, shopId: session.shopId, redeemed: false },
    take: shop.stampGoal,
    orderBy: { createdAt: 'asc' }
  })

  await prisma.stamp.updateMany({
    where: { id: { in: toRedeem.map(s => s.id) } },
    data: { redeemed: true, redeemedAt: new Date() }
  })

  return ok({ redeemed: toRedeem.length, reward: shop.reward, customer })
}
