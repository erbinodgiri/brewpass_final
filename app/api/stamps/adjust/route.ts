import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { err, ok } from '@/lib/api'

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session) return err('Unauthorized', 401)

  const { customerId, action, targetCount } = await req.json()
  if (!customerId) return err('customerId required')

  const shop = await prisma.shop.findUnique({
    where: { id: session.shopId },
    select: { stampGoal: true, reward: true }
  })
  if (!shop) return err('Shop not found', 404)

  const customer = await prisma.customer.findFirst({
    where: { id: customerId, shopId: session.shopId }
  })
  if (!customer) return err('Customer not found', 404)

  const activeStamps = await prisma.stamp.findMany({
    where: { customerId, shopId: session.shopId, redeemed: false },
    orderBy: { createdAt: 'desc' }
  })

  if (action === 'remove') {
    if (activeStamps.length === 0) return err('No stamps to remove')
    await prisma.stamp.delete({ where: { id: activeStamps[0].id } })
  } else if (action === 'add') {
    await prisma.stamp.create({ data: { shopId: session.shopId, customerId } })
  } else if (action === 'set') {
    if (targetCount === undefined || targetCount < 0) return err('Invalid targetCount')
    const current = activeStamps.length
    if (targetCount > current) {
      const toAdd = targetCount - current
      await prisma.stamp.createMany({
        data: Array.from({ length: toAdd }).map(() => ({ shopId: session.shopId, customerId }))
      })
    } else if (targetCount < current) {
      const toRemove = activeStamps.slice(0, current - targetCount)
      await prisma.stamp.deleteMany({ where: { id: { in: toRemove.map(s => s.id) } } })
    }
  } else {
    return err('Invalid action')
  }

  const newCount = await prisma.stamp.count({
    where: { customerId, shopId: session.shopId, redeemed: false }
  })

  return ok({ customerId, activeStamps: newCount, stampGoal: shop.stampGoal, isRewardReady: newCount >= shop.stampGoal })
}
