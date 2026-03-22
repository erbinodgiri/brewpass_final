// app/api/public/customer/route.ts — PUBLIC
import { prisma } from '@/lib/prisma'
import { err, ok } from '@/lib/api'
import { normalizePhone } from '@/lib/phone'                             // ← CHANGED: added import

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const shopId = searchParams.get('shopId')
  const rawPhone = searchParams.get('phone')                             // ← CHANGED: rawPhone
  if (!shopId || !rawPhone) return err('shopId and phone required')

  const phone = normalizePhone(rawPhone)                                 // ← CHANGED: normalize

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { name: true, stampGoal: true, reward: true, stampLogo: true, shopLogo: true, themeColor: true }
  })
  if (!shop) return err('Shop not found', 404)

  const customer = await prisma.customer.findUnique({
    where: { phone_shopId: { phone, shopId } },
    include: { stamps: { orderBy: { createdAt: 'desc' } } }
  })

  if (!customer) return ok({ exists: false, shopName: shop.name, stampGoal: shop.stampGoal, reward: shop.reward, stampLogo: shop.stampLogo, themeColor: shop.themeColor })

  const activeStamps = customer.stamps.filter(s => !s.redeemed).length
  const totalStamps = customer.stamps.length
  const totalRedemptions = customer.stamps.filter(s => s.redeemed).length
  const isRewardReady = activeStamps >= shop.stampGoal
  const history = customer.stamps.slice(0, 10).map(s => ({ id: s.id, createdAt: s.createdAt, redeemed: s.redeemed, redeemedAt: s.redeemedAt }))

  return ok({
    exists: true,
    shopName: shop.name,
    stampGoal: shop.stampGoal,
    reward: shop.reward,
    stampLogo: shop.stampLogo,
    shopLogo: shop.shopLogo,
    themeColor: shop.themeColor,
    customer: { name: customer.name, phone: customer.phone },
    activeStamps,
    totalStamps,
    totalRedemptions,
    isRewardReady,
    history
  })
}
