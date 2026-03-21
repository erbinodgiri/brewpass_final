// app/api/dashboard/stats/route.ts
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { err, ok } from '@/lib/api'

export async function GET() {
  const session = await getSession()
  if (!session) return err('Unauthorized', 401)
  const shopId = session.shopId

  const now = new Date()
  const start30 = new Date(now); start30.setDate(now.getDate() - 29); start30.setHours(0,0,0,0)

  const [totalCustomers, totalStamps, totalRedeemed, stampsLast30, customersLast30, recentStamps] = await Promise.all([
    prisma.customer.count({ where: { shopId } }),
    prisma.stamp.count({ where: { shopId } }),
    prisma.stamp.count({ where: { shopId, redeemed: true } }),
    prisma.stamp.count({ where: { shopId, createdAt: { gte: start30 } } }),
    prisma.customer.count({ where: { shopId, createdAt: { gte: start30 } } }),
    prisma.stamp.findMany({ where: { shopId, createdAt: { gte: start30 } }, select: { createdAt: true }, orderBy: { createdAt: 'asc' } }),
  ])

  const dayMap: Record<string, number> = {}
  for (let i = 0; i < 30; i++) {
    const d = new Date(start30); d.setDate(d.getDate() + i)
    dayMap[d.toISOString().split('T')[0]] = 0
  }
  for (const s of recentStamps) {
    const k = s.createdAt.toISOString().split('T')[0]
    if (k in dayMap) dayMap[k]++
  }
  const chartData = Object.entries(dayMap).map(([date, stamps]) => ({ date: date.slice(5), stamps }))

  const topCustomers = await prisma.customer.findMany({
    where: { shopId },
    include: { stamps: { select: { id: true } } },
    orderBy: { stamps: { _count: 'desc' } },
    take: 5,
  })

  return ok({
    totalCustomers, totalStamps, totalRedeemed, stampsLast30, customersLast30, chartData,
    topCustomers: topCustomers.map(c => ({ id: c.id, name: c.name, phone: c.phone, totalStamps: c.stamps.length })),
  })
}
