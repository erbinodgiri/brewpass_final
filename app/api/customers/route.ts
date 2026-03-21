// app/api/customers/route.ts
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { err, ok } from '@/lib/api'

export async function GET(req: Request) {
  const session = await getSession()
  if (!session) return err('Unauthorized', 401)
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''

  const [customers, shop] = await Promise.all([
    prisma.customer.findMany({
      where: {
        shopId: session.shopId,
        ...(search ? { OR: [{ name: { contains: search } }, { phone: { contains: search } }] } : {}),
      },
      include: { stamps: { orderBy: { createdAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.shop.findUnique({
      where: { id: session.shopId },
      select: { stampGoal: true }
    })
  ])

  const stampGoal = shop?.stampGoal ?? 7

  const enriched = customers.map(c => {
    const activeStamps = c.stamps.filter(s => !s.redeemed).length
    const totalStamps = c.stamps.length
    const totalRedemptions = c.stamps.filter(s => s.redeemed).length
    const isRewardReady = activeStamps >= stampGoal
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      createdAt: c.createdAt,
      activeStamps,
      totalStamps,
      totalRedemptions,
      isRewardReady,
    }
  })

  return ok({ customers: enriched, stampGoal })
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return err('Unauthorized', 401)
  const { phone, name } = await req.json()
  if (!phone) return err('Phone number required')
  const customer = await prisma.customer.upsert({
    where: { phone_shopId: { phone, shopId: session.shopId } },
    update: name ? { name } : {},
    create: { phone, name, shopId: session.shopId },
  })
  return ok(customer, 201)
}
