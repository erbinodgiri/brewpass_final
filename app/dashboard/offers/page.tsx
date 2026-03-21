'use client'
import { useEffect, useState } from 'react'

interface Offer { id: string; title: string; description: string | null; emoji: string; validUntil: string | null; active: boolean }

const OFFER_EMOJIS = ['🎉','🎊','🔥','⭐','💥','🎁','🎯','🍕','🍜','🥘','🫕','🍖','🥩','🍗','🥗','🍱','🧆','🥙','🌮','🌯','🫔','🥪','🍔','🍟','🌭','🍿','🧇','🥞','🧈','🍳','🥚','🥐','🥖','🫓','🥨','🧀','🥓','🥩','🍛','🍲','🥣','🥗','🫙','🧂','🥫','☕','🧋','🍵','🧃','🥤','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉','🫖','🍰','🎂','🧁','🍮','🍭','🍬','🍫','🍩','🍪','🍦','🍧','🍨','🫧']

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', emoji: '🎉', validUntil: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function fetchOffers() {
    const res = await fetch('/api/offers'); const d = await res.json()
    if (d.success) setOffers(d.data); setLoading(false)
  }

  useEffect(() => { fetchOffers() }, [])

  async function saveOffer(e: React.FormEvent) {
    e.preventDefault(); if (!form.title.trim()) return setError('Title required')
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/offers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, validUntil: form.validUntil || null }) })
      const d = await res.json()
      if (!d.success) { setError(d.error); return }
      await fetchOffers(); setShowForm(false); setForm({ title: '', description: '', emoji: '🎉', validUntil: '' }); showToast('✓ Offer added')
    } catch { setError('Failed to save') } finally { setSaving(false) }
  }

  async function toggleOffer(offer: Offer) {
    await fetch(`/api/offers/${offer.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !offer.active }) })
    await fetchOffers()
  }

  async function deleteOffer(id: string) {
    if (!confirm('Delete this offer?')) return
    await fetch(`/api/offers/${id}`, { method: 'DELETE' }); await fetchOffers(); showToast('Offer deleted')
  }

  const inp: React.CSSProperties = { width: '100%', border: '1px solid #e0dbd2', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#1a1208', outline: 'none', background: '#fff', boxSizing: 'border-box' }

  return (
    <div style={{ maxWidth: 720 }}>
      {toast && <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 999, background: '#166534', color: '#fff', borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 500 }}>{toast}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#1a1208', margin: 0 }}>Offers & Promotions</h1>
          <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Active offers show on the customer scan page automatically</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ background: '#e8a24b', color: '#0e0a06', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          + Add offer
        </button>
      </div>

      <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 12, padding: '0.875rem 1.25rem', marginBottom: '1.5rem', fontSize: 13, color: '#0369a1' }}>
        <strong>💡 Tip:</strong> Add offers for anything — coffee, hookah, momo, pizza, or any special deal. Customers see these as banners when they scan your QR code.
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#aaa' }}>Loading…</div>
      ) : offers.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #ede8e0', borderRadius: 14, padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#1a1208', marginBottom: 8 }}>No offers yet</h2>
          <p style={{ color: '#aaa', fontSize: 14, marginBottom: 20 }}>Add offers, promotions, or special deals. They appear as banners when customers scan your QR.</p>
          <button onClick={() => setShowForm(true)} style={{ background: '#e8a24b', color: '#0e0a06', border: 'none', borderRadius: 8, padding: '11px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Add first offer
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {offers.map(offer => (
            <div key={offer.id} style={{ background: '#fff', border: '1px solid #ede8e0', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 14, opacity: offer.active ? 1 : 0.5 }}>
              <div style={{ fontSize: 30, width: 48, height: 48, background: '#f8f5f0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{offer.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 15, color: '#1a1208' }}>{offer.title}</span>
                  {!offer.active && <span style={{ fontSize: 11, background: '#f8f5f0', color: '#888', border: '1px solid #e0dbd2', borderRadius: 4, padding: '1px 7px' }}>Hidden</span>}
                  {offer.validUntil && new Date(offer.validUntil) < new Date() && <span style={{ fontSize: 11, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 4, padding: '1px 7px' }}>Expired</span>}
                </div>
                {offer.description && <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{offer.description}</div>}
                {offer.validUntil && <div style={{ fontSize: 11, color: '#bbb', marginTop: 3 }}>Until {new Date(offer.validUntil).toLocaleDateString('en-NP', { day: 'numeric', month: 'long', year: 'numeric' })}</div>}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => toggleOffer(offer)} style={{ background: 'transparent', border: '1px solid #e0dbd2', borderRadius: 7, padding: '5px 10px', fontSize: 12, color: '#666', cursor: 'pointer' }}>
                  {offer.active ? '👁 Hide' : '👁 Show'}
                </button>
                <button onClick={() => deleteOffer(offer.id)} style={{ background: 'transparent', border: '1px solid #fecaca', borderRadius: 7, padding: '5px 10px', fontSize: 12, color: '#dc2626', cursor: 'pointer' }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add offer modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '2rem', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#1a1208', margin: 0 }}>Add offer</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', fontSize: 22, color: '#aaa', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={saveOffer}>
              {/* Emoji picker */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 8, fontWeight: 500 }}>Icon</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxHeight: 160, overflowY: 'auto', padding: 4, border: '1px solid #e0dbd2', borderRadius: 8 }}>
                  {OFFER_EMOJIS.map(e => (
                    <button key={e} type="button" onClick={() => setForm(p => ({ ...p, emoji: e }))}
                      style={{ fontSize: 20, width: 36, height: 36, borderRadius: 6, border: `1.5px solid ${form.emoji === e ? '#e8a24b' : 'transparent'}`, background: form.emoji === e ? '#fffbeb' : 'transparent', cursor: 'pointer' }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 6, fontWeight: 500 }}>Offer title *</label>
                  <input style={inp} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Buy 1 Get 1 Coffee" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 6, fontWeight: 500 }}>Description <span style={{ color: '#bbb', fontWeight: 400 }}>(optional)</span></label>
                  <input style={inp} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Valid on weekdays only" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 6, fontWeight: 500 }}>Valid until <span style={{ color: '#bbb', fontWeight: 400 }}>(optional — leave blank for no expiry)</span></label>
                  <input style={inp} type="date" value={form.validUntil} onChange={e => setForm(p => ({ ...p, validUntil: e.target.value }))} />
                </div>
              </div>
              {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginTop: '1rem' }}>{error}</div>}
              <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem' }}>
                <button type="submit" disabled={saving} style={{ flex: 1, background: '#e8a24b', color: '#0e0a06', border: 'none', borderRadius: 8, padding: '12px', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving…' : 'Add offer'}
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
