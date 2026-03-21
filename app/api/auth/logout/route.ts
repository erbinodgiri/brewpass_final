// app/api/auth/logout/route.ts
import { cookies } from 'next/headers'
import { ok } from '@/lib/api'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('bp_token')
  return ok({ message: 'Logged out' })
}
