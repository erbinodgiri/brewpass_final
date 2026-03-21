'use client'
import { useEffect, useState } from 'react'

interface MenuItem { id: string; name: string; description: string | null; price: number; category: string; imageEmoji: string; available: boolean }

const EMOJIS = [
  // Drinks
  '☕','🍵','🧋','🥤','🍺','🍻','🧃','🥛','🍷','🥂','🍸','🍹','🧉','🫖','🍶',
  // Coffee specific
  '☕','🫗','🧊','🍦',
  // Food - cafe
  '🥐','🥖','🥨','🧀','🥚','🍳','🧇','🥞','🧈','🥗','🥙','🌮','🌯','🥪','🍔',
  // Food - restaurant
  '🍕','🍜','🍝','🍛','🍲','🥘','🫕','🍱','🥣','🍣','🍤','🍖','🍗','🥩','🌭',
  // Nepali / Asian
  '🥟','🫔','🧆','🥫','🍚','🍛','🥢',
  // Snacks & Desserts
  '🍰','🎂','🧁','🍮','🍭','🍬','🍫','🍩','🍪','🍦','🍧','🍨','🍡','🧁',
  // Hookah / special
  '💨','🌿','🎋','🫧','💫','⭐','🔥','🌶',
  // Others
  '🎁','🎉','⚡','❤️','🌟','🏆','🥇'
]
const CATEGORIES = ['Coffee', 'Tea', 'Cold Drinks', 'Food', 'Snacks', 'Desserts', 'Specials', 'Other']

const blank = { name: '', description: '', price: '', category: 'Coffee', imageEmoji: '☕', available: true }

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<MenuItem | null>(null)
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function fetchItems() {
    const res = await fetch('/api/menu')
    const data = await res.json()
    if (data.success) setItems(data.data)
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [])

  function openAdd() { setEditing(null); setForm(blank); setError(''); setShowForm(true) }
  function openEdit(item: MenuItem) {
    setEditing(item)
    setForm({ name: item.name, description: item.description || '', price: String(item.price), category: item.category, imageEmoji: item.imageEmoji, available: item.available })
    setError(''); setShowForm(true)
  }

  async function saveItem(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return setError('Name is required')
    if (!form.price || isNaN(Number(form.price))) return setError('Valid price is required')
    setSaving(true); setError('')
    try {
      const body = { ...form, price: Number(form.price) }
      const res = await fetch(editing ? `/api/menu/${editing.id}` : '/api/menu', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!data.success) { setError(data.error); return }
      await fetchItems()
      setShowForm(false)
      showToast(editing ? '✓ Item updated' : '✓ Item added')
    } catch { setError('Failed to save') } finally { setSaving(false) }
  }

  async function toggleAvailable(item: MenuItem) {
    await fetch(`/api/menu/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ available: !item.available }) })
    await fetchItems()
  }

  async function deleteItem(item: MenuItem) {
    if (!confirm(`Delete "${item.name}"?`)) return
    await fetch(`/api/menu/${item.id}`, { method: 'DELETE' })
    await fetchItems()
    showToast('Item deleted')
  }

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))]
  const filtered = activeCategory === 'All' ? items : items.filter(i => i.category === activeCategory)
  const grouped: Record<string, MenuItem[]> = {}
  for (const item of filtered) {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  }

  const inp: React.CSSProperties = { width: '100%', border: '1px solid #e0dbd2', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#1a1208', outline: 'none', background: '#fff', boxSizing: 'border-box' }

  return (
    <div style={{ maxWidth: 820 }}>
      {toast && <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 999, background: '#166534', color: '#fff', borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 500 }}>{toast}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#1a1208', margin: 0 }}>Menu</h1>
          <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>{items.length} items · customers see this when they scan your QR</p>
        </div>
        <button onClick={openAdd} style={{ background: '#e8a24b', color: '#0e0a06', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          + Add item
        </button>
      </div>

      {/* Category tabs */}
      {categories.length > 1 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{ background: activeCategory === cat ? '#e8a24b' : '#fff', color: activeCategory === cat ? '#0e0a06' : '#666', border: `1px solid ${activeCategory === cat ? '#e8a24b' : '#e0dbd2'}`, borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: activeCategory === cat ? 600 : 400, cursor: 'pointer' }}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#aaa' }}>Loading menu…</div>
      ) : items.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #ede8e0', borderRadius: 14, padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🍽</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#1a1208', marginBottom: 8 }}>No menu items yet</h2>
          <p style={{ color: '#aaa', fontSize: 14, marginBottom: 20 }}>Add your coffees, teas, and food items. Customers will see this when they scan your QR code.</p>
          <button onClick={openAdd} style={{ background: '#e8a24b', color: '#0e0a06', border: 'none', borderRadius: 8, padding: '11px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Add first item</button>
        </div>
      ) : (
        Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat} style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: '0.75rem' }}>{cat}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {catItems.map(item => (
                <div key={item.id} style={{ background: '#fff', border: '1px solid #ede8e0', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 14, opacity: item.available ? 1 : 0.5 }}>
                  <div style={{ fontSize: 28, flexShrink: 0, width: 44, height: 44, background: '#f8f5f0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.imageEmoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 15, color: '#1a1208' }}>{item.name}</span>
                      {!item.available && <span style={{ fontSize: 11, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 4, padding: '1px 7px' }}>Unavailable</span>}
                    </div>
                    {item.description && <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{item.description}</div>}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#1a1208', flexShrink: 0 }}>NPR {item.price.toLocaleString()}</div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => toggleAvailable(item)} title={item.available ? 'Mark unavailable' : 'Mark available'} style={{ background: 'transparent', border: '1px solid #e0dbd2', borderRadius: 7, padding: '5px 10px', fontSize: 12, color: '#666', cursor: 'pointer' }}>
                      {item.available ? '✓' : '✗'}
                    </button>
                    <button onClick={() => openEdit(item)} style={{ background: 'transparent', border: '1px solid #e0dbd2', borderRadius: 7, padding: '5px 10px', fontSize: 12, color: '#666', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => deleteItem(item)} style={{ background: 'transparent', border: '1px solid #fecaca', borderRadius: 7, padding: '5px 10px', fontSize: 12, color: '#dc2626', cursor: 'pointer' }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Add/Edit modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '2rem', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#1a1208', margin: 0 }}>{editing ? 'Edit item' : 'Add menu item'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', fontSize: 22, color: '#aaa', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={saveItem}>
              {/* Emoji picker */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 8, fontWeight: 500 }}>Icon</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {EMOJIS.map(e => (
                    <button key={e} type="button" onClick={() => setForm(p => ({ ...p, imageEmoji: e }))}
                      style={{ fontSize: 22, width: 40, height: 40, borderRadius: 8, border: `1.5px solid ${form.imageEmoji === e ? '#e8a24b' : '#e0dbd2'}`, background: form.imageEmoji === e ? '#fffbeb' : '#fff', cursor: 'pointer' }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 6, fontWeight: 500 }}>Item name *</label>
                  <input style={inp} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Cappuccino" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 6, fontWeight: 500 }}>Description <span style={{ color: '#bbb', fontWeight: 400 }}>(optional)</span></label>
                  <input style={inp} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Rich espresso with steamed milk" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 6, fontWeight: 500 }}>Price (NPR) *</label>
                    <input style={inp} type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="250" required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 6, fontWeight: 500 }}>Category</label>
                    <select style={{ ...inp }} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="avail" checked={form.available} onChange={e => setForm(p => ({ ...p, available: e.target.checked }))} />
                  <label htmlFor="avail" style={{ fontSize: 14, color: '#555', cursor: 'pointer' }}>Available to order</label>
                </div>
              </div>

              {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginTop: '1rem' }}>{error}</div>}

              <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem' }}>
                <button type="submit" disabled={saving} style={{ flex: 1, background: '#e8a24b', color: '#0e0a06', border: 'none', borderRadius: 8, padding: '12px', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving…' : editing ? 'Save changes' : 'Add item'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: 'transparent', border: '1px solid #e0dbd2', borderRadius: 8, padding: '12px 20px', fontSize: 14, color: '#666', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
