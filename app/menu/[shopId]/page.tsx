'use client'
import { useState, useEffect, use } from 'react'

interface MenuItem { id: string; name: string; description: string | null; price: number; category: string; imageEmoji: string }
interface MenuData {
  shop: { id: string; name: string; address: string | null }
  categories: Record<string, MenuItem[]>
  totalItems: number
}

export default function MenuPage({ params }: { params: Promise<{ shopId: string }> }) {
  const resolvedParams = use(params)
  const shopId = resolvedParams.shopId
  const [menuData, setMenuData] = useState<MenuData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState('')

  useEffect(() => {
    fetch(`/api/public/menu?shopId=${shopId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setMenuData(d.data)
          const cats = Object.keys(d.data.categories)
          if (cats.length > 0) setActiveCategory(cats[0])
        } else setError('Menu not available')
        setLoading(false)
      }).catch(() => { setError('Failed to load menu'); setLoading(false) })
  }, [shopId])

  const bg = '#0e0a06'

  if (loading) return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'rgba(245,237,224,0.4)', fontSize: 14 }}>Loading menu…</div>
    </div>
  )

  if (error || !menuData) return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <div>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🍽</div>
        <h2 style={{ color: '#f5ede0', fontFamily: 'Georgia, serif', marginBottom: 8 }}>Menu not available</h2>
        <p style={{ color: 'rgba(245,237,224,0.4)', fontSize: 14 }}>This shop hasn&apos;t set up their menu yet.</p>
      </div>
    </div>
  )

  const categories = Object.keys(menuData.categories)

  return (
    <div style={{ minHeight: '100vh', background: bg, paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 1.5rem 0', maxWidth: 480, margin: '0 auto' }}>
        <a href={`/scan/${shopId}`} style={{ color: 'rgba(245,237,224,0.4)', fontSize: 13, textDecoration: 'none', display: 'inline-block', marginBottom: '1rem' }}>← Back</a>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: '#e8a24b' }}>
          Brew<span style={{ color: '#f5ede0' }}>Pass</span>
        </div>
        <div style={{ color: '#f5ede0', fontSize: 18, fontWeight: 600, marginTop: 6 }}>{menuData.shop.name}</div>
        {menuData.shop.address && <div style={{ color: 'rgba(245,237,224,0.4)', fontSize: 13, marginTop: 2 }}>{menuData.shop.address}</div>}
        <div style={{ color: 'rgba(245,237,224,0.3)', fontSize: 12, marginTop: 6 }}>{menuData.totalItems} items</div>
      </div>

      {/* Category tabs */}
      {categories.length > 1 && (
        <div style={{ padding: '1rem 1.5rem', overflowX: 'auto', display: 'flex', gap: 8, scrollbarWidth: 'none', maxWidth: 480, margin: '0 auto' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{ background: activeCategory === cat ? '#e8a24b' : 'rgba(255,255,255,0.06)', color: activeCategory === cat ? '#0e0a06' : 'rgba(245,237,224,0.6)', border: 'none', borderRadius: 20, padding: '7px 16px', fontSize: 13, fontWeight: activeCategory === cat ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Menu items — view only */}
      <div style={{ padding: '0 1.5rem', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(menuData.categories[activeCategory] || []).map(item => (
            <div key={item.id} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1rem', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 30, width: 50, height: 50, background: 'rgba(255,255,255,0.05)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.imageEmoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#f5ede0', fontWeight: 600, fontSize: 15 }}>{item.name}</div>
                {item.description && (
                  <div style={{ color: 'rgba(245,237,224,0.45)', fontSize: 12, marginTop: 2 }}>{item.description}</div>
                )}
              </div>
              <div style={{ color: '#e8a24b', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                NPR {item.price.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p style={{ textAlign: 'center', color: 'rgba(245,237,224,0.12)', fontSize: 12, marginTop: '2rem' }}>
        Powered by BrewPass Nepal
      </p>
    </div>
  )
}
