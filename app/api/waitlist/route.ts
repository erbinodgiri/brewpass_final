// app/api/waitlist/route.ts — PUBLIC
import { prisma } from '@/lib/prisma'
import { ok, err } from '@/lib/api'

export async function POST(req: Request) {
  const { contact } = await req.json()
  if (!contact?.trim()) return err('Contact required')
  try {
    await prisma.platformWaitlist.upsert({
      where: { contact: contact.trim() },
      update: {},
      create: { contact: contact.trim() }
    })
    return ok({ message: 'Added to waitlist' })
  } catch {
    return ok({ message: 'Already on waitlist' })
  }
}
