import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { err, ok } from '@/lib/api'
import QRCode from 'qrcode'
import { headers } from 'next/headers'

export async function GET() {
  const session = await getSession()
  if (!session) return err('Unauthorized', 401)

  const h = await headers()
  const host = h.get('host') || ''
  const proto = h.get('x-forwarded-proto') || 'https'
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || ''
  const isPlaceholder = !envUrl || envUrl.includes('yourdomain')
  const baseUrl = isPlaceholder ? `${proto}://${host}` : envUrl
  const scanUrl = `${baseUrl}/scan/${session.shopId}`

  const qrDataUrl = await QRCode.toDataURL(scanUrl, {
    width: 300, margin: 2,
    color: { dark: '#0e0a06', light: '#ffffff' },
    errorCorrectionLevel: 'M',
  })

  await prisma.shop.update({ where: { id: session.shopId }, data: { qrCode: qrDataUrl } })

  return ok({ qrCode: qrDataUrl, scanUrl })
}
