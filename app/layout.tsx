import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BrewPass — Digital Loyalty for Coffee Shops',
  description: 'Replace paper stamp cards with smart QR-based digital loyalty. Built for Nepal\'s coffee shops.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
