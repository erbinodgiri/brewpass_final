// app/api/public/stamp/route.ts — PUBLIC, no auth
import { prisma } from '@/lib/prisma'
import { err, ok } from '@/lib/api'
import { canAddCustomer, isPlanActive, getCustomerLimit } from '@/lib/plans'
import { normalizePhone } from '@/lib/phone'                              // ← CHANGED: added import

export async function POST(req: Request) {
  const { shopId, phone: rawPhone, name } = await req.json()             // ← CHANGED: rawPhone
  if (!shopId || !rawPhone?.trim()) return err('Shop ID and phone required')

  const phone = normalizePhone(rawPhone)                                  // ← CHANGED: normalize

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: {
      id: true, name: true, stampGoal: true, reward: true,
      plan: true, planExpiresAt: true, active: true,
      freeLimit: true, stampLogo: true, shopLogo: true, themeColor: true
    }
  })
  if (!shop) return err('Shop not found', 404)
  if (!isPlanActive(shop)) return err('This shop\'s loyalty program is currently inactive.', 403)

  // 10-minute cooldown — prevents duplicate spam
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
  const existingPending = await prisma.stampRequest.findFirst({
    where: { shopId, phone, status: 'pending', createdAt: { gte: tenMinutesAgo } }
  })
  if (existingPending) {
    return ok({ alreadyPending: true, message: 'You already have a pending request.' })
  }

  // Check if this is a new customer — if so, enforce the limit
  const existingCustomer = await prisma.customer.findUnique({
    where: { phone_shopId: { phone, shopId } }
  })

  if (!existingCustomer) {
    const currentCount = await prisma.customer.count({ where: { shopId } })
    const limit = getCustomerLimit(shop)

    if (!canAddCustomer(shop, currentCount)) {
      return err(
        `This shop has reached its customer limit of ${limit}. Please ask the owner to upgrade their plan.`,
        403
      )
    }
  }

  // Create or update customer
  const customer = await prisma.customer.upsert({
    where: { phone_shopId: { phone, shopId } },
    update: name?.trim() ? { name: name.trim() } : {},
    create: { phone, name: name?.trim() || null, shopId },
  })

  // Create pending stamp request — NOT a stamp yet (needs staff approval)
  await prisma.stampRequest.create({
    data: {
      shopId,
      phone,
      name: name?.trim() || null,
      customerId: customer.id,
      status: 'pending'
    }
  })

  const activeStamps = await prisma.stamp.count({
    where: { customerId: customer.id, shopId, redeemed: false }
  })

  return ok({
    alreadyPending: false,
    requested: true,
    shopName: shop.name,
    stampLogo: shop.stampLogo,
    shopLogo: shop.shopLogo,
    themeColor: shop.themeColor || '#e8a24b',
    customer: { name: customer.name, phone: customer.phone },
    activeStamps,
    stampGoal: shop.stampGoal,
    reward: shop.reward,
  })
}
