// app/api/auth/login/route.ts
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { err, ok } from '@/lib/api'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return err('Email and password required')

    const shop = await prisma.shop.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (!shop) return err('Invalid email or password', 401)

    const valid = await bcrypt.compare(password, shop.password)
    if (!valid) return err('Invalid email or password', 401)

    const token = signToken({ shopId: shop.id, email: shop.email })
    const cookieStore = await cookies()
    cookieStore.set('bp_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
    })

    return ok({ shopId: shop.id, name: shop.name, email: shop.email })
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}
