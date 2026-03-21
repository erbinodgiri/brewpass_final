// lib/auth.ts
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const SECRET = process.env.JWT_SECRET || 'brewpass-dev-secret'

export function signToken(payload: { shopId: string; email: string }) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { shopId: string; email: string } | null {
  try {
    return jwt.verify(token, SECRET) as { shopId: string; email: string }
  } catch {
    return null
  }
}

export async function getSession(): Promise<{ shopId: string; email: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('bp_token')?.value
  if (!token) return null
  return verifyToken(token)
}
