'use client'
import { useState } from 'react'

interface StampResult {
  customer: { id: string; name: string | null; phone: string }
  activeStamps: number
  stampGoal: number
  isRewardReady: boolean
  reward: string
}

export default function StampPage() {
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<StampResult | null>(null)
  const [redeemLoading, setRedeemLoading] = useState(false)
  const [redeemed, setRedeemed] = useState(false)
  const [error, setError] = useState('')

  async function addStamp(e: React.FormEvent) {
    e.preventDefault()
    if (!phone.trim()) return setError('Phone number is required')
    setLoading(true); setError(''); setResult(null); setRedeemed(false)
    try {
      const res = await fetch('/api/stamps/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), name: name.trim() || undefined }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error); return }
      setResult(data.data)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  async function redeemReward() {
    if (!result) return
    setRedeemLoading(true); setError('')
    try {
      const res = await fetch('/api/stamps/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: result.customer.id }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error); return }
      setRedeemed(true)
    } catch {
      setError('Redemption failed. Try again.')
    } finally {
      setRedeemLoading(false)
    }
  }

  function reset() { setPhone(''); setName(''); setResult(null); setError(''); setRedeemed(false) }

  const inp: React.CSSProperties = { width: '100%', border: '1px solid #e0dbd2', borderRadius: 8, padding: '11px 14px', fontSize: 14, color: '#1a1208', outline: 'none', background: '#fff', boxSizing: 'border-box' }

  return (
    <div style={{ maxWidth: 500 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#1a1208', margin: 0 }}>Add Stamp</h1>
        <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Enter a customer&apos;s phone to add their stamp</p>
      </div>

      {/* Form */}
      <div style={{ background: '#fff', border: '1px solid #ede8e0', borderRadius: 16, padding: '2rem', marginBottom: '1.5rem' }}>
        <form onSubmit={addStamp}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 6, fontWeight: 500 }}>Phone Number *</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="98XXXXXXXX" required style={inp} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 6, fontWeight: 500 }}>Customer Name <span style={{ color: '#bbb', fontWeight: 400 }}>(optional — for new customers)</span></label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Sita Sharma" style={inp} />
          </div>
          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: '1rem' }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', background: '#e8a24b', color: '#0e0a06', border: 'none', borderRadius: 8, padding: '13px', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Adding stamp…' : '☕ Add Stamp'}
          </button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div style={{ background: result.isRewardReady ? '#fffbeb' : '#fff', border: `2px solid ${result.isRewardReady ? '#f59e0b' : '#ede8e0'}`, borderRadius: 16, padding: '2rem', textAlign: 'center' }}>
          {redeemed ? (
            <>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#1a1208', marginBottom: 8 }}>Reward Redeemed!</div>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>{result.customer.name || result.customer.phone} got their free {result.reward}</div>
              <button onClick={reset} style={{ background: '#e8a24b', color: '#0e0a06', border: 'none', borderRadius: 8, padding: '10px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Next customer →
              </button>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: '#1a1208' }}>{result.customer.name || result.customer.phone}</div>
                {result.customer.name && <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{result.customer.phone}</div>}
              </div>

              {/* Stamp grid */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', margin: '1.25rem 0' }}>
                {Array.from({ length: result.stampGoal }).map((_, i) => (
                  <div key={i} style={{ width: 44, height: 44, borderRadius: 10, background: i < result.activeStamps ? '#e8a24b' : '#f5f0e8', border: `1px solid ${i < result.activeStamps ? '#c97a20' : '#e0dbd2'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: i < result.activeStamps ? 18 : 10, color: '#888', fontWeight: 500 }}>
                    {i < result.activeStamps ? '☕' : i === result.stampGoal - 1 ? 'FREE' : ''}
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 14, color: '#666', marginBottom: '1.25rem' }}>
                {result.activeStamps} of {result.stampGoal} stamps
                {result.isRewardReady
                  ? <span style={{ color: '#d97706', fontWeight: 600 }}> — Reward ready! 🎁</span>
                  : ` — ${result.stampGoal - result.activeStamps} more for free ${result.reward}`}
              </div>

              {result.isRewardReady && (
                <button onClick={redeemReward} disabled={redeemLoading} style={{ background: '#f59e0b', color: '#0e0a06', border: 'none', borderRadius: 8, padding: '11px 28px', fontSize: 15, fontWeight: 600, cursor: redeemLoading ? 'not-allowed' : 'pointer', marginBottom: 12, width: '100%' }}>
                  {redeemLoading ? 'Redeeming…' : `🎁 Redeem Free ${result.reward}`}
                </button>
              )}

              <button onClick={reset} style={{ width: '100%', background: 'transparent', border: '1px solid #e0dbd2', borderRadius: 8, padding: '9px', fontSize: 13, color: '#888', cursor: 'pointer' }}>
                Next customer
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
