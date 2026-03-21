// app/api/stamps/add/route.ts — staff manual stamp (authenticated)
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { err, ok } from '@/lib/api'
import { canAddCustomer, getCustomerLimit } from '@/lib/plans'

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return err('Unauthorized', 401)

  const { phone, name } = await req.json()
  if (!phone?.trim()) return err('Phone number required')

  const shop = await prisma.shop.findUnique({
    where: { id: session.shopId },
    select: { id: true, plan: true, freeLimit: true, stampGoal: true, reward: true }
  })
  if (!shop) return err('Shop not found', 404)

  // Check limit for new customers (paid plans are unlimited)
  const existingCustomer = await prisma.customer.findUnique({
    where: { phone_shopId: { phone: phone.trim(), shopId: session.shopId } }
  })

  if (!existingCustomer) {
    const currentCount = await prisma.customer.count({ where: { shopId: session.shopId } })
    if (!canAddCustomer(shop, currentCount)) {
      const limit = getCustomerLimit(shop)
      return err(`Customer limit of ${limit} reached. Upgrade your plan to add more.`, 403)
    }
  }

  const customer = await prisma.customer.upsert({
    where: { phone_shopId: { phone: phone.trim(), shopId: session.shopId } },
    update: name?.trim() ? { name: name.trim() } : {},
    create: { phone: phone.trim(), name: name?.trim() || null, shopId: session.shopId },
  })

  await prisma.stamp.create({ data: { shopId: session.shopId, customerId: customer.id } })

  const activeStamps = await prisma.stamp.count({
    where: { customerId: customer.id, shopId: session.shopId, redeemed: false },
  })

  return ok({
    customer,
    activeStamps,
    stampGoal: shop.stampGoal,
    isRewardReady: activeStamps >= shop.stampGoal,
    reward: shop.reward
  }, 201)
}
