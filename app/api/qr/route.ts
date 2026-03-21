// app/api/qr/route.ts
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { err, ok } from '@/lib/api'
import QRCode from 'qrcode'

export async function GET() {
  const session = await getSession()
  if (!session) return err('Unauthorized', 401)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const scanUrl = `${appUrl}/scan/${session.shopId}`

  const qrDataUrl = await QRCode.toDataURL(scanUrl, {
    width: 300, margin: 2,
    color: { dark: '#0e0a06', light: '#ffffff' },
  })

  await prisma.shop.update({ where: { id: session.shopId }, data: { qrCode: qrDataUrl } })

  return ok({ qrCode: qrDataUrl, scanUrl })
}
