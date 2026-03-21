// app/api/wifi/route.ts
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { err, ok } from '@/lib/api'
import QRCode from 'qrcode'

export async function GET() {
  const session = await getSession()
  if (!session) return err('Unauthorized', 401)

  const shop = await prisma.shop.findUnique({
    where: { id: session.shopId },
    select: { wifiName: true, wifiPassword: true, wifiType: true, wifiHidden: true }
  })
  if (!shop) return err('Shop not found', 404)
  if (!shop.wifiName) return err('WiFi not configured', 400)

  // WiFi QR string format: WIFI:T:WPA;S:NetworkName;P:Password;H:false;;
  const escape = (s: string) => s.replace(/[\\;,"]/g, c => `\\${c}`)
  const wifiString = [
    'WIFI:',
    `T:${shop.wifiType || 'WPA'};`,
    `S:${escape(shop.wifiName)};`,
    shop.wifiPassword ? `P:${escape(shop.wifiPassword)};` : 'P:;',
    `H:${shop.wifiHidden ? 'true' : 'false'};;`,
  ].join('')

  const qrDataUrl = await QRCode.toDataURL(wifiString, {
    width: 300,
    margin: 2,
    color: { dark: '#0e0a06', light: '#ffffff' },
    errorCorrectionLevel: 'M',
  })

  return ok({ qrCode: qrDataUrl, ssid: shop.wifiName })
}

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session) return err('Unauthorized', 401)

  const { wifiName, wifiPassword, wifiType, wifiHidden } = await req.json()

  const shop = await prisma.shop.update({
    where: { id: session.shopId },
    data: {
      wifiName: wifiName?.trim() || null,
      wifiPassword: wifiPassword?.trim() || null,
      wifiType: wifiType || 'WPA',
      wifiHidden: wifiHidden || false,
    },
    select: { wifiName: true, wifiPassword: true, wifiType: true, wifiHidden: true }
  })

  return ok(shop)
}
