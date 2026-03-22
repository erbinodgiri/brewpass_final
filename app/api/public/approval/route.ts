// app/api/public/approval/route.ts — PUBLIC polling endpoint
import { prisma } from '@/lib/prisma'
import { err, ok } from '@/lib/api'
import { normalizePhone } from '@/lib/phone'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const rawPhone = searchParams.get('phone')
  const shopId = searchParams.get('shopId')
  if (!rawPhone || !shopId) return err('phone and shopId required')

  const phone = normalizePhone(rawPhone)

  // Find most recent request for this phone at this shop
  const request = await prisma.stampRequest.findFirst({
    where: { phone, shopId },
    orderBy: { createdAt: 'desc' }
  })

  if (!request) return ok({ status: 'pending' })
  if (request.status === 'pending') return ok({ status: 'pending' })
  if (request.status === 'rejected') return ok({ status: 'rejected' })

  // Approved — get current stamp count
  const shop = await prisma.shop.findUnique({ where: { id: shopId }, select: { stampGoal: true, reward: true } })
  const customer = await prisma.customer.findUnique({ where: { phone_shopId: { phone, shopId } } })

  if (!shop || !customer) return ok({ status: 'approved', activeStamps: 1, stampGoal: 7, isRewardReady: false, reward: '1 free coffee' })

  const activeStamps = await prisma.stamp.count({ where: { customerId: customer.id, shopId, redeemed: false } })
  const isRewardReady = activeStamps >= shop.stampGoal

  return ok({ status: 'approved', activeStamps, stampGoal: shop.stampGoal, isRewardReady, reward: shop.reward })
}
