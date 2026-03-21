// app/api/menu/route.ts
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { err, ok } from '@/lib/api'

export async function GET() {
  const session = await getSession()
  if (!session) return err('Unauthorized', 401)
  const items = await prisma.menuItem.findMany({
    where: { shopId: session.shopId },
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }]
  })
  return ok(items)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return err('Unauthorized', 401)
  const { name, description, price, category, imageEmoji, available } = await req.json()
  if (!name?.trim()) return err('Name required')
  if (!price || isNaN(price) || price < 0) return err('Valid price required')
  const item = await prisma.menuItem.create({
    data: {
      shopId: session.shopId,
      name: name.trim(),
      description: description?.trim() || null,
      price: Number(price),
      category: category?.trim() || 'Other',
      imageEmoji: imageEmoji || '☕',
      available: available !== false,
    }
  })
  return ok(item, 201)
}
