// app/api/shops/me/route.ts
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { err, ok } from '@/lib/api'
import { isPlanActive } from '@/lib/plans'

export async function GET() {
  const session = await getSession()
  if (!session) return err('Unauthorized', 401)
  const shop = await prisma.shop.findUnique({
    where: { id: session.shopId },
    select: { id: true, name: true, email: true, address: true, phone: true, stampGoal: true, reward: true, qrCode: true, plan: true, planExpiresAt: true, active: true, freeLimit: true, stampLogo: true, shopLogo: true, themeColor: true, wifiName: true, wifiPassword: true, wifiType: true, wifiHidden: true, createdAt: true }
  })
  if (!shop) return err('Shop not found', 404)
  return ok({ ...shop, planActive: isPlanActive(shop) })
}

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session) return err('Unauthorized', 401)
  const body = await req.json()
  const allowed = ['name', 'address', 'phone', 'stampGoal', 'reward', 'stampLogo', 'shopLogo', 'themeColor']
  const data: Record<string, unknown> = {}
  for (const key of allowed) if (body[key] !== undefined) data[key] = body[key]
  const shop = await prisma.shop.update({
    where: { id: session.shopId }, data,
    select: { id: true, name: true, email: true, address: true, phone: true, stampGoal: true, reward: true, plan: true, planExpiresAt: true, freeLimit: true, stampLogo: true, shopLogo: true, themeColor: true }
  })
  return ok(shop)
}
