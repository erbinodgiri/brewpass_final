// app/api/auth/register/route.ts
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { err, ok } from '@/lib/api'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { name, email, password, address, phone } = await req.json()

    if (!name?.trim()) return err('Shop name is required')
    if (!email?.trim()) return err('Email is required')
    if (!password || password.length < 6) return err('Password must be at least 6 characters')

    const exists = await prisma.shop.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (exists) return err('An account with this email already exists')

    const hashed = await bcrypt.hash(password, 10)
    const shop = await prisma.shop.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashed,
        address: address?.trim() || null,
        phone: phone?.trim() || null,
      },
    })

    const token = signToken({ shopId: shop.id, email: shop.email })
    const cookieStore = await cookies()
    cookieStore.set('bp_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
    })

    return ok({ shopId: shop.id, name: shop.name }, 201)
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}
