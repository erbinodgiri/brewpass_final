// app/api/reports/route.ts
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { err, ok } from '@/lib/api'

export async function GET(req: Request) {
  const session = await getSession()
  if (!session) return err('Unauthorized', 401)

  const { searchParams } = new URL(req.url)
  const format = searchParams.get('format') || 'json' // json | csv
  const shopId = session.shopId

  const [shop, customers] = await Promise.all([
    prisma.shop.findUnique({
      where: { id: shopId },
      select: { name: true, address: true, phone: true, stampGoal: true, reward: true, plan: true }
    }),
    prisma.customer.findMany({
      where: { shopId },
      include: {
        stamps: { orderBy: { createdAt: 'desc' } }
      },
      orderBy: { createdAt: 'desc' }
    })
  ])

  if (!shop) return err('Shop not found', 404)

  const enriched = customers.map(c => {
    const activeStamps = c.stamps.filter(s => !s.redeemed).length
    const totalStamps = c.stamps.length
    const totalRedemptions = c.stamps.filter(s => s.redeemed).length
    const isRewardReady = activeStamps >= shop.stampGoal
    const lastVisit = c.stamps[0]?.createdAt ?? null
    const firstVisit = c.stamps[c.stamps.length - 1]?.createdAt ?? null
    return {
      name: c.name || '',
      phone: c.phone,
      activeStamps,
      totalStamps,
      totalRedemptions,
      isRewardReady,
      joinedAt: c.createdAt,
      lastVisit,
      firstVisit,
    }
  })

  // CSV format
  if (format === 'csv') {
    const headers = ['Name', 'Phone', 'Active Stamps', 'Total Stamps', 'Rewards Redeemed', 'Reward Ready', 'First Visit', 'Last Visit', 'Joined']
    const rows = enriched.map(c => [
      c.name,
      c.phone,
      c.activeStamps,
      c.totalStamps,
      c.totalRedemptions,
      c.isRewardReady ? 'Yes' : 'No',
      c.firstVisit ? new Date(c.firstVisit).toLocaleDateString() : 'N/A',
      c.lastVisit ? new Date(c.lastVisit).toLocaleDateString() : 'N/A',
      new Date(c.joinedAt).toLocaleDateString(),
    ])

    const csv = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${shop.name.replace(/\s+/g, '_')}_customers_${new Date().toISOString().split('T')[0]}.csv"`,
      }
    })
  }

  // Summary stats
  const totalCustomers = enriched.length
  const totalStamps = enriched.reduce((a, c) => a + c.totalStamps, 0)
  const totalRedemptions = enriched.reduce((a, c) => a + c.totalRedemptions, 0)
  const rewardReady = enriched.filter(c => c.isRewardReady).length
  const avgStamps = totalCustomers > 0 ? Math.round(totalStamps / totalCustomers) : 0

  // Stamps per day last 30 days
  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
  const allStamps = await prisma.stamp.findMany({
    where: { shopId, createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' }
  })
  const byDay: Record<string, number> = {}
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo); d.setDate(d.getDate() + i)
    byDay[d.toISOString().split('T')[0]] = 0
  }
  allStamps.forEach(s => {
    const k = s.createdAt.toISOString().split('T')[0]
    if (k in byDay) byDay[k]++
  })
  const stampTrend = Object.entries(byDay).map(([date, count]) => ({ date: date.slice(5), count }))

  return ok({
    shop,
    generatedAt: new Date().toISOString(),
    summary: { totalCustomers, totalStamps, totalRedemptions, rewardReady, avgStamps },
    customers: enriched,
    stampTrend,
  })
}
