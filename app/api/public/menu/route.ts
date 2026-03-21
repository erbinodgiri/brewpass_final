// app/api/public/menu/route.ts — PUBLIC
import { prisma } from '@/lib/prisma'
import { err, ok } from '@/lib/api'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const shopId = searchParams.get('shopId')
  if (!shopId) return err('shopId required')

  const [shop, items] = await Promise.all([
    prisma.shop.findUnique({
      where: { id: shopId },
      select: { id: true, name: true, address: true, active: true }
    }),
    prisma.menuItem.findMany({
      where: { shopId, available: true },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }]
    })
  ])

  if (!shop || !shop.active) return err('Shop not found', 404)

  // Group by category
  const grouped: Record<string, typeof items> = {}
  for (const item of items) {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  }

  return ok({ shop, categories: grouped, totalItems: items.length })
}
