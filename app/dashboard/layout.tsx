'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const NAV = [
  { href: '/dashboard',             label: 'Overview',   icon: '📊' },
  { href: '/dashboard/approvals',   label: 'Approvals',  icon: '✅' },
  { href: '/dashboard/stamp',       label: 'Add Stamp',  icon: '☕' },
  { href: '/dashboard/customers',   label: 'Customers',  icon: '👥' },
  { href: '/dashboard/offers',      label: 'Offers',     icon: '🎉' },
  { href: '/dashboard/menu',        label: 'Menu',       icon: '🍽' },
  { href: '/dashboard/reports',     label: 'Reports',    icon: '📋' },
  { href: '/dashboard/settings',    label: 'Settings',   icon: '⚙️'  },
]

const PLAN_STYLES: Record<string, { bg: string; color: string }> = {
  free:  { bg: 'rgba(255,255,255,0.07)', color: 'rgba(245,237,224,0.4)' },
  basic: { bg: 'rgba(59,130,246,0.2)',   color: '#93c5fd' },
  pro:   { bg: 'rgba(232,162,75,0.2)',   color: '#e8a24b' },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [shopName, setShopName] = useState('')
  const [plan, setPlan] = useState('free')
  const [planActive, setPlanActive] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    fetch('/api/shops/me').then(r => r.json()).then(d => {
      if (!d.success) { router.push('/login'); return }
      setShopName(d.data.name)
      setPlan(d.data.plan || 'free')
      setPlanActive(d.data.planActive !== false)
    }).catch(() => router.push('/login'))
  }, [router])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const ps = PLAN_STYLES[plan] || PLAN_STYLES.free

  const sidebarContent = (
    <>
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#e8a24b' }}>
          Brew<span style={{ color: '#f5ede0' }}>Pass</span>
        </div>
        {shopName && (
          <div style={{ marginTop: 6 }}>
            <div style={{ fontSize: 12, color: 'rgba(245,237,224,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shopName}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span style={{ background: ps.bg, color: ps.color, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {plan}
              </span>
              {!planActive && <span style={{ background: 'rgba(220,38,38,0.2)', color: '#f87171', fontSize: 10, padding: '2px 8px', borderRadius: 4 }}>Expired</span>}
            </div>
          </div>
        )}
      </div>

      <nav style={{ padding: '1rem 0.75rem', flex: 1 }}>
        {NAV.map(l => {
          const active = pathname === l.href
          return (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8, marginBottom: 2,
              background: active ? 'rgba(232,162,75,0.12)' : 'transparent',
              color: active ? '#e8a24b' : 'rgba(245,237,224,0.55)',
              textDecoration: 'none', fontSize: 14, fontWeight: active ? 500 : 400,
            }}>
              <span style={{ fontSize: 16 }}>{l.icon}</span>{l.label}
            </Link>
          )
        })}
      </nav>

      {!planActive && (
        <div style={{ margin: '0 0.75rem 0.75rem', background: 'rgba(220,38,38,0.12)', border: '0.5px solid rgba(220,38,38,0.3)', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: 12, color: '#f87171', fontWeight: 500 }}>Plan expired</div>
          <div style={{ fontSize: 11, color: 'rgba(248,113,113,0.7)', marginTop: 2 }}>Contact admin to renew</div>
        </div>
      )}

      <div style={{ padding: '1rem 0.75rem', borderTop: '0.5px solid rgba(255,255,255,0.07)' }}>
        <button onClick={logout} style={{ width: '100%', background: 'transparent', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '9px 12px', color: 'rgba(245,237,224,0.45)', fontSize: 13, cursor: 'pointer', textAlign: 'left' }}>
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f5f0' }}>
      <aside style={{ width: 220, background: '#0e0a06', minHeight: '100vh', display: 'flex', flexDirection: 'column', borderRight: '0.5px solid rgba(232,162,75,0.08)', position: 'fixed', top: 0, left: 0, zIndex: 20 }} className="hidden-mobile">
        {sidebarContent}
      </aside>

      <div style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 30, background: '#0e0a06', borderBottom: '0.5px solid rgba(232,162,75,0.08)', padding: '1rem 1.25rem', alignItems: 'center', justifyContent: 'space-between' }} className="mobile-topbar">
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: '#e8a24b' }}>Brew<span style={{ color: '#f5ede0' }}>Pass</span></span>
        <button onClick={() => setMobileOpen(o => !o)} style={{ background: 'transparent', border: 'none', color: '#e8a24b', fontSize: 22, cursor: 'pointer' }}>☰</button>
      </div>

      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex' }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} onClick={() => setMobileOpen(false)} />
          <aside style={{ width: 240, background: '#0e0a06', display: 'flex', flexDirection: 'column', height: '100%' }}>{sidebarContent}</aside>
        </div>
      )}

      <main style={{ marginLeft: 220, flex: 1, padding: '2rem', minHeight: '100vh' }}>
        {children}
      </main>

      <style>{`
        @media (max-width: 640px) {
          .hidden-mobile { display: none !important; }
          .mobile-topbar { display: flex !important; }
          main { margin-left: 0 !important; padding-top: 5rem !important; }
        }
      `}</style>
    </div>
  )
}
