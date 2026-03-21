// app/api/requests/[id]/route.ts
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { err, ok } from '@/lib/api'
import { canAddCustomer, getCustomerLimit } from '@/lib/plans'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return err('Unauthorized', 401)

  const { id } = await params
  const { action } = await req.json()
  if (!['approve', 'reject'].includes(action)) return err('Invalid action')

  const request = await prisma.stampRequest.findFirst({
    where: { id, shopId: session.shopId, status: 'pending' }
  })
  if (!request) return err('Request not found or already resolved', 404)

  if (action === 'reject') {
    await prisma.stampRequest.update({
      where: { id },
      data: { status: 'rejected', resolvedAt: new Date() }
    })
    return ok({ message: 'Request rejected' })
  }

  // APPROVE
  const shop = await prisma.shop.findUnique({
    where: { id: session.shopId },
    select: { id: true, name: true, stampGoal: true, reward: true, plan: true, freeLimit: true }
  })
  if (!shop) return err('Shop not found', 404)

  // Check customer limit before creating new customer
  const existingCustomer = await prisma.customer.findUnique({
    where: { phone_shopId: { phone: request.phone, shopId: session.shopId } }
  })

  if (!existingCustomer) {
    const currentCount = await prisma.customer.count({ where: { shopId: session.shopId } })
    if (!canAddCustomer(shop, currentCount)) {
      const limit = getCustomerLimit(shop)
      await prisma.stampRequest.update({
        where: { id },
        data: { status: 'rejected', resolvedAt: new Date() }
      })
      return err(`Customer limit of ${limit} reached. Upgrade plan to accept new customers.`, 403)
    }
  }

  const customer = await prisma.customer.upsert({
    where: { phone_shopId: { phone: request.phone, shopId: session.shopId } },
    update: request.name ? { name: request.name } : {},
    create: { phone: request.phone, name: request.name, shopId: session.shopId },
  })

  await prisma.stamp.create({ data: { shopId: session.shopId, customerId: customer.id } })

  await prisma.stampRequest.update({
    where: { id },
    data: { status: 'approved', resolvedAt: new Date(), customerId: customer.id }
  })

  const activeStamps = await prisma.stamp.count({
    where: { customerId: customer.id, shopId: session.shopId, redeemed: false }
  })

  return ok({
    message: 'Stamp approved',
    customer,
    activeStamps,
    stampGoal: shop.stampGoal,
    isRewardReady: activeStamps >= shop.stampGoal,
    reward: shop.reward,
  })
}
