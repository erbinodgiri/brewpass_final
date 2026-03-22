'use client'
import { useState, useEffect, useRef, useCallback, use } from 'react'

interface ShopInfo { name: string; address: string | null; stampGoal: number; reward: string; stampLogo: string | null; shopLogo: string | null; themeColor: string | null; offers: Offer[] }
interface Offer { id: string; title: string; description: string | null; emoji: string; validUntil: string | null }
interface CustomerData { exists: boolean; shopName: string; stampGoal: number; reward: string; customer?: { name: string | null; phone: string }; activeStamps?: number; totalStamps?: number; totalRedemptions?: number; isRewardReady?: boolean; history?: { id: string; createdAt: string; redeemed: boolean; redeemedAt: string | null }[]; stampLogo?: string | null; shopLogo?: string | null; themeColor?: string | null }
interface RequestResult { alreadyPending: boolean; customer?: { name: string | null; phone: string }; activeStamps?: number; stampGoal?: number; reward?: string; stampLogo?: string | null; shopLogo?: string | null; themeColor?: string | null }
type Step = 'form' | 'check_phone' | 'my_card' | 'pending' | 'duplicate'

function StampCard({ activeStamps, stampGoal, stampLogo, shopLogo, shopName, reward, themeColor, customerName, customerPhone }: {
  activeStamps: number; stampGoal: number; stampLogo?: string | null; shopLogo?: string | null
  shopName?: string; reward: string; themeColor?: string | null; customerName?: string | null; customerPhone?: string
}) {
  const color = themeColor || '#e8a24b'
  const cols = stampGoal <= 6 ? stampGoal : stampGoal <= 9 ? Math.ceil(stampGoal / 2) : 4
  const displayStamps = Math.min(activeStamps, stampGoal)

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.35)', background: '#1a1208', border: `1px solid ${color}40`, maxWidth: 360, margin: '0 auto' }}>
      <div style={{ height: 14, background: `repeating-linear-gradient(90deg, ${color}cc 0px, ${color}66 8px, ${color}33 12px, ${color}cc 16px)`, opacity: 0.8 }} />
      <div style={{ background: '#f8f4ee', padding: '10px 12px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          {shopLogo ? (
            <img src={shopLogo} alt={shopName} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 32, height: 32, borderRadius: 6, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{stampLogo || '☕'}</div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1208', lineHeight: 1.2 }}>{shopName || 'Loyalty Card'}</div>
            <div style={{ fontSize: 10, color: '#888', marginTop: 1 }}>Collect stamps, earn rewards</div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: color, background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 6, padding: '2px 8px' }}>{displayStamps}/{stampGoal}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #d4c9b8', borderRadius: 4, padding: '4px 8px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#999', fontWeight: 500 }}>Name:</span>
          <span style={{ fontSize: 12, color: '#1a1208', fontWeight: 600 }}>{customerName || customerPhone || ''}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 4 }}>
          {Array.from({ length: stampGoal - 1 }).map((_, i) => {
            const filled = i < displayStamps
            return (
              <div key={i} style={{ aspectRatio: '1', borderRadius: 6, border: `1.5px solid ${filled ? color : '#c8bfb0'}`, background: filled ? `${color}20` : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: filled ? 18 : 11, transition: 'all 0.2s', boxShadow: filled ? `inset 0 0 0 1px ${color}40` : 'none' }}>
                {filled ? (stampLogo || '☕') : ''}
              </div>
            )
          })}
          <div style={{ aspectRatio: '1', borderRadius: 6, background: displayStamps >= stampGoal ? 'linear-gradient(135deg, #22c55e, #16a34a)' : `linear-gradient(135deg, ${color}, ${color}cc)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 4, boxShadow: `0 2px 8px ${color}50` }}>
            {shopLogo ? <img src={shopLogo} alt="" style={{ width: '55%', height: '55%', objectFit: 'cover', borderRadius: 3, marginBottom: 2 }} /> : <div style={{ fontSize: 18, marginBottom: 2 }}>{stampLogo || '☕'}</div>}
            <div style={{ fontSize: 10, fontWeight: 900, color: displayStamps >= stampGoal ? '#fff' : '#0e0a06', letterSpacing: 0.5 }}>FREE</div>
          </div>
        </div>
        <div style={{ marginTop: 8, textAlign: 'center', fontSize: 11, color: displayStamps >= stampGoal ? '#16a34a' : '#888', fontWeight: displayStamps >= stampGoal ? 700 : 400 }}>
          {displayStamps >= stampGoal ? `🎉 Show this to staff for your free ${reward}!` : `${stampGoal - displayStamps} more stamp${stampGoal - displayStamps !== 1 ? 's' : ''} for free ${reward}`}
        </div>
      </div>
      <div style={{ height: 14, background: `repeating-linear-gradient(90deg, ${color}cc 0px, ${color}66 8px, ${color}33 12px, ${color}cc 16px)`, opacity: 0.8 }} />
    </div>
  )
}

export default function ScanPage({ params }: { params: Promise<{ shopId: string }> }) {
  const resolvedParams = use(params)
  const shopId = resolvedParams.shopId
  const [shop, setShop] = useState<ShopInfo | null>(null)
  const [shopError, setShopError] = useState(false)
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RequestResult | null>(null)
  const [error, setError] = useState('')
  const [checkPhone, setCheckPhone] = useState('')
  const [checkLoading, setCheckLoading] = useState(false)
  const [checkError, setCheckError] = useState('')
  const [customerData, setCustomerData] = useState<CustomerData | null>(null)
  const [step, setStep] = useState<Step>('form')
  const [wifiQr, setWifiQr] = useState<{ qrCode: string; ssid: string; password: string | null } | null>(null)
  const [showWifi, setShowWifi] = useState(false)
  const [approvalStatus, setApprovalStatus] = useState<'waiting' | 'approved' | 'rejected'>('waiting')
  const [approvedData, setApprovedData] = useState<{ activeStamps: number; stampGoal: number; isRewardReady: boolean; reward: string } | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const theme = shop?.themeColor || result?.themeColor || '#e8a24b'

  useEffect(() => {
    Promise.all([
      fetch(`/api/scan/${shopId}`).then(r => r.json()),
      fetch(`/api/public/wifi?shopId=${shopId}`).then(r => r.json()).catch(() => null)
    ]).then(([shopRes, wifiRes]) => {
      if (shopRes.success) setShop(shopRes.data)
      else setShopError(true)
      if (wifiRes?.success && wifiRes.data?.configured) setWifiQr(wifiRes.data)
    }).catch(() => setShopError(true))
  }, [shopId])

  function playApprovalSound() {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') ctx.resume()
      ;[{ freq: 523, delay: 0, dur: 0.15 }, { freq: 659, delay: 0.16, dur: 0.15 }, { freq: 784, delay: 0.32, dur: 0.4 }].forEach(({ freq, delay, dur }) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.frequency.value = freq; osc.type = 'sine'
        gain.gain.setValueAtTime(0.3, ctx.currentTime + delay)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur)
        osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + dur + 0.01)
      })
    } catch { /* ignore */ }
  }

  const pollApproval = useCallback(async () => {
    try {
      const res = await fetch(`/api/public/approval?phone=${encodeURIComponent(phone)}&shopId=${shopId}`)
      const data = await res.json()
      if (!data.success) return
      if (data.data.status === 'approved') {
        if (pollRef.current) clearInterval(pollRef.current)
        setApprovalStatus('approved'); setApprovedData(data.data); playApprovalSound()
      } else if (data.data.status === 'rejected') {
        if (pollRef.current) clearInterval(pollRef.current)
        setApprovalStatus('rejected')
      }
    } catch { /* ignore */ }
  }, [phone, shopId])

  useEffect(() => {
    if (step === 'pending') {
      setApprovalStatus('waiting')
      pollRef.current = setInterval(pollApproval, 3000)
    } else { if (pollRef.current) clearInterval(pollRef.current) }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [step, pollApproval])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!phone.trim()) return setError('Please enter your phone number')
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume()
    } catch { /* ignore */ }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/public/stamp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shopId, phone: phone.trim(), name: name.trim() || undefined }) })
      const json = await res.json()
      if (!json.success) { setError(json.error); return }
      setResult(json.data)
      if (json.data.customer?.phone) setPhone(json.data.customer.phone)  // ← ADD THIS LINE
      setStep(json.data.alreadyPending ? 'duplicate' : 'pending')
    } catch { setError('Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault()
    if (!checkPhone.trim()) return setCheckError('Please enter your phone number')
    setCheckLoading(true); setCheckError('')
    try {
      const res = await fetch(`/api/public/customer?shopId=${shopId}&phone=${encodeURIComponent(checkPhone.trim())}`)
      const json = await res.json()
      if (!json.success) { setCheckError(json.error); return }
      setCustomerData(json.data); setStep('my_card')
    } catch { setCheckError('Something went wrong.') }
    finally { setCheckLoading(false) }
  }

  function reset() {
    setPhone(''); setName(''); setStep('form'); setResult(null); setError('')
    setCheckPhone(''); setCheckError(''); setCustomerData(null)
    setApprovalStatus('waiting'); setApprovedData(null)
    if (pollRef.current) clearInterval(pollRef.current)
  }

  const bg = '#0e0a06'
  const card: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 18, padding: '1.5rem' }
  const inp: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '14px 16px', color: '#f5ede0', fontSize: 16, outline: 'none', boxSizing: 'border-box' }
  const btnPrimary = (color: string): React.CSSProperties => ({ width: '100%', background: color, color: '#0e0a06', border: 'none', borderRadius: 12, padding: '16px', fontSize: 16, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.3 })
  const btnGhost: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '14px', fontSize: 14, color: 'rgba(245,237,224,0.65)', cursor: 'pointer', textDecoration: 'none', display: 'block', textAlign: 'center' as const }

  if (shopError) return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div><div style={{ fontSize: 48, marginBottom: 16 }}>☕</div><h2 style={{ color: '#f5ede0', fontFamily: 'Georgia, serif' }}>Shop not found</h2><p style={{ color: 'rgba(245,237,224,0.4)', fontSize: 14 }}>This QR code may be invalid or expired.</p></div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
      <div className="scan-inner" style={{ width: '100%', maxWidth: 400 }}>

        {/* ── HEADER ── */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          {shop?.shopLogo ? (
            <img src={shop.shopLogo} alt={shop.name} style={{ width: 64, height: 64, borderRadius: 16, objectFit: 'cover', marginBottom: 12, border: `2px solid ${theme}50`, boxShadow: `0 0 0 4px ${theme}15` }} />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: 16, background: `${theme}20`, border: `2px solid ${theme}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 12px' }}>
              {shop?.stampLogo || '☕'}
            </div>
          )}
          {shop ? (
            <>
              <div style={{ color: '#f5ede0', fontSize: 20, fontWeight: 700, letterSpacing: -0.3 }}>{shop.name}</div>
              {shop.address && <div style={{ color: 'rgba(245,237,224,0.4)', fontSize: 12, marginTop: 3 }}>{shop.address}</div>}
              {/* How it works — brief */}
              <div style={{ marginTop: 12, background: `${theme}10`, border: `0.5px solid ${theme}25`, borderRadius: 10, padding: '8px 14px', display: 'inline-block' }}>
                <span style={{ color: theme, fontSize: 12, fontWeight: 500 }}>
                  Collect {shop.stampGoal} stamps → get free {shop.reward}
                </span>
              </div>
            </>
          ) : (
            <div style={{ color: 'rgba(245,237,224,0.3)', fontSize: 14 }}>Loading…</div>
          )}
        </div>

        {/* Offers */}
        {shop?.offers && shop.offers.length > 0 && step === 'form' && (
          <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {shop.offers.map(offer => (
              <div key={offer.id} style={{ background: `${theme}10`, border: `0.5px solid ${theme}30`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{offer.emoji}</span>
                <div>
                  <div style={{ color: theme, fontWeight: 600, fontSize: 13 }}>{offer.title}</div>
                  {offer.description && <div style={{ color: 'rgba(245,237,224,0.5)', fontSize: 12, marginTop: 1 }}>{offer.description}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── STEP: FORM ── */}
        {step === 'form' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <div style={card}>
              {/* Step indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: theme, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#0e0a06', flexShrink: 0 }}>1</div>
                <div>
                  <div style={{ color: '#f5ede0', fontSize: 15, fontWeight: 600 }}>Request a stamp</div>
                  <div style={{ color: 'rgba(245,237,224,0.4)', fontSize: 11, marginTop: 1 }}>Show this to staff after submitting</div>
                </div>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(245,237,224,0.55)', fontSize: 13, marginBottom: 7, fontWeight: 500 }}>
                    📱 Your phone number *
                  </label>
                  <input suppressHydrationWarning type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="98XXXXXXXX" required style={inp} autoComplete="tel" inputMode="numeric" />
                  <div style={{ fontSize: 11, color: 'rgba(245,237,224,0.25)', marginTop: 5 }}>Your phone number is your loyalty card ID</div>
                </div>
                <div>
                  <label style={{ display: 'block', color: 'rgba(245,237,224,0.55)', fontSize: 13, marginBottom: 7, fontWeight: 500 }}>
                    👤 Your name <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input suppressHydrationWarning type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sita Sharma" style={inp} autoComplete="name" />
                </div>
                {error && (
                  <div style={{ background: 'rgba(248,113,113,0.12)', border: '0.5px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13 }}>
                    ⚠ {error}
                  </div>
                )}
                <button type="submit" disabled={loading} style={{ ...btnPrimary(theme), opacity: loading ? 0.75 : 1, marginTop: 4 }}>
                  {loading ? 'Sending request…' : '☕ Request stamp'}
                </button>
              </form>
            </div>

            {/* Secondary actions — visually separated */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
              <button onClick={() => setStep('check_phone')} style={{ ...btnGhost, fontSize: 13, padding: '12px 8px' }}>
                🎫 My stamps
              </button>
              <a href={`/menu/${shopId}`} style={{ ...btnGhost, fontSize: 13, padding: '12px 8px' }}>
                🍽 View menu
              </a>
            </div>
            {wifiQr && (
              <button onClick={() => setShowWifi(true)} style={{ ...btnGhost, fontSize: 13 }}>
                📶 Connect to WiFi
              </button>
            )}
          </div>
        )}

        {/* ── STEP: CHECK PHONE ── */}
        {step === 'check_phone' && (
          <div style={card}>
            <button onClick={reset} style={{ background: 'none', border: 'none', color: 'rgba(245,237,224,0.4)', fontSize: 13, cursor: 'pointer', marginBottom: '1.25rem', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>← Back</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: theme, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0e0a06', flexShrink: 0 }}>🎫</div>
              <div>
                <div style={{ color: '#f5ede0', fontSize: 15, fontWeight: 600 }}>Check my loyalty card</div>
                <div style={{ color: 'rgba(245,237,224,0.4)', fontSize: 11, marginTop: 1 }}>See your stamps and progress</div>
              </div>
            </div>
            <form onSubmit={handleCheck} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: 'rgba(245,237,224,0.55)', fontSize: 13, marginBottom: 7, fontWeight: 500 }}>📱 Your phone number *</label>
                <input suppressHydrationWarning type="tel" value={checkPhone} onChange={e => setCheckPhone(e.target.value)} placeholder="98XXXXXXXX" required style={inp} autoComplete="tel" inputMode="numeric" />
              </div>
              {checkError && <div style={{ background: 'rgba(248,113,113,0.12)', border: '0.5px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13 }}>⚠ {checkError}</div>}
              <button type="submit" disabled={checkLoading} style={{ ...btnPrimary(theme), opacity: checkLoading ? 0.7 : 1 }}>
                {checkLoading ? 'Loading…' : '🎫 View my card'}
              </button>
            </form>
          </div>
        )}

        {/* ── STEP: MY CARD ── */}
        {step === 'my_card' && customerData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {!customerData.exists ? (
              <div style={{ ...card, textAlign: 'center' }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>☕</div>
                <h2 style={{ color: '#f5ede0', fontSize: 17, fontWeight: 700, margin: '0 0 8px' }}>No stamps yet</h2>
                <p style={{ color: 'rgba(245,237,224,0.45)', fontSize: 14, margin: '0 0 6px' }}>Phone: {checkPhone}</p>
                <p style={{ color: 'rgba(245,237,224,0.35)', fontSize: 13, margin: '0 0 20px' }}>Visit the counter and request your first stamp to get started!</p>
                <button onClick={reset} style={btnPrimary(theme)}>☕ Request first stamp</button>
              </div>
            ) : (
              <>
                {customerData.isRewardReady && (
                  <div style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', borderRadius: 14, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 32 }}>🎁</span>
                    <div>
                      <div style={{ color: '#4ade80', fontWeight: 700, fontSize: 15 }}>Reward ready to claim!</div>
                      <div style={{ color: 'rgba(74,222,128,0.7)', fontSize: 13, marginTop: 2 }}>Show this screen to staff for your free {customerData.reward}</div>
                    </div>
                  </div>
                )}
                <StampCard activeStamps={customerData.activeStamps ?? 0} stampGoal={customerData.stampGoal} stampLogo={customerData.stampLogo} shopLogo={customerData.shopLogo} shopName={customerData.shopName} reward={customerData.reward} themeColor={customerData.themeColor} customerName={customerData.customer?.name} customerPhone={checkPhone} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  {[{ l: 'Active stamps', v: customerData.activeStamps ?? 0, i: '☕' }, { l: 'Total earned', v: customerData.totalStamps ?? 0, i: '📊' }, { l: 'Rewards used', v: customerData.totalRedemptions ?? 0, i: '🎁' }].map(s => (
                    <div key={s.l} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '0.875rem 0.5rem', textAlign: 'center' }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{s.i}</div>
                      <div style={{ color: '#f5ede0', fontSize: 20, fontWeight: 700, fontFamily: 'Georgia, serif' }}>{s.v}</div>
                      <div style={{ color: 'rgba(245,237,224,0.35)', fontSize: 10, marginTop: 2, lineHeight: 1.3 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                {customerData.history && customerData.history.length > 0 && (
                  <div style={{ ...card, padding: '1.25rem' }}>
                    <div style={{ color: 'rgba(245,237,224,0.5)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.875rem' }}>Recent activity</div>
                    {customerData.history.slice(0, 8).map(h => (
                      <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: h.redeemed ? 'rgba(34,197,94,0.12)' : `${theme}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{h.redeemed ? '🎁' : '☕'}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: h.redeemed ? '#4ade80' : theme, fontSize: 13, fontWeight: 500 }}>{h.redeemed ? 'Reward redeemed' : 'Stamp earned'}</div>
                          <div style={{ color: 'rgba(245,237,224,0.3)', fontSize: 11 }}>{new Date(h.redeemed && h.redeemedAt ? h.redeemedAt : h.createdAt).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            <button onClick={reset} style={btnGhost}>← Back to stamp request</button>
          </div>
        )}

        {/* ── STEP: PENDING ── */}
        {step === 'pending' && result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {approvalStatus === 'approved' && approvedData ? (
              <div className="approved-in" style={{ ...card, textAlign: 'center' }}>
                <div style={{ fontSize: 56, marginBottom: 10 }}>{approvedData.isRewardReady ? '🎉' : '✅'}</div>
                <h2 style={{ color: '#f5ede0', fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>
                  {approvedData.isRewardReady ? 'You earned a free reward!' : 'Stamp approved!'}
                </h2>
                <p style={{ color: 'rgba(245,237,224,0.5)', fontSize: 13, margin: '0 0 16px' }}>
                  {approvedData.isRewardReady ? `Show this to staff to claim your free ${approvedData.reward}` : `You now have ${approvedData.activeStamps} of ${approvedData.stampGoal} stamps`}
                </p>
                <StampCard activeStamps={approvedData.activeStamps} stampGoal={approvedData.stampGoal} stampLogo={result.stampLogo} shopLogo={result.shopLogo} shopName={shop?.name} reward={approvedData.reward} themeColor={result.themeColor} customerName={result.customer?.name} customerPhone={phone} />
                {approvedData.isRewardReady && (
                  <div style={{ background: 'rgba(34,197,94,0.1)', border: '0.5px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '12px', marginTop: 12 }}>
                    <p style={{ color: '#4ade80', fontSize: 13, fontWeight: 500, margin: 0 }}>✓ Show this screen to staff to claim your reward</p>
                  </div>
                )}
                <button onClick={reset} style={{ ...btnPrimary(theme), marginTop: 16 }}>Done</button>
              </div>
            ) : approvalStatus === 'rejected' ? (
              <div style={{ ...card, textAlign: 'center' }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>❌</div>
                <h2 style={{ color: '#f5ede0', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>Request not approved</h2>
                <p style={{ color: 'rgba(245,237,224,0.5)', fontSize: 14, margin: '0 0 20px' }}>Please speak to staff at the counter.</p>
                <button onClick={reset} style={btnPrimary(theme)}>Try again</button>
              </div>
            ) : (
              <div style={{ ...card, textAlign: 'center' }}>
                {/* Progress steps */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 20 }}>
                  {[
                    { label: 'Submitted', done: true },
                    { label: 'Staff approving', done: false, active: true },
                    { label: 'Stamp added', done: false },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: s.done ? '#22c55e' : s.active ? theme : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: s.done || s.active ? '#0e0a06' : 'rgba(245,237,224,0.3)', transition: 'all 0.3s' }}>
                          {s.done ? '✓' : i + 1}
                        </div>
                        <div style={{ fontSize: 9, color: s.done ? '#22c55e' : s.active ? theme : 'rgba(245,237,224,0.25)', fontWeight: s.active ? 600 : 400, whiteSpace: 'nowrap' }}>{s.label}</div>
                      </div>
                      {i < 2 && <div style={{ width: 32, height: 1.5, background: i === 0 ? '#22c55e' : 'rgba(255,255,255,0.1)', margin: '0 4px', marginBottom: 18 }} />}
                    </div>
                  ))}
                </div>

                <div className="pulse" style={{ fontSize: 48, marginBottom: 10 }}>☕</div>
                <h2 style={{ color: '#f5ede0', fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>Request sent!</h2>
                {result.customer?.name && <p style={{ color: theme, fontSize: 14, fontWeight: 500, margin: '0 0 12px' }}>Hi {result.customer.name}!</p>}

                <div style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '14px', marginBottom: 14, textAlign: 'left' }}>
                  <div style={{ color: 'rgba(245,237,224,0.5)', fontSize: 12, marginBottom: 8, textAlign: 'center', fontWeight: 500 }}>What to do now:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(245,237,224,0.7)' }}>
                      <span style={{ fontSize: 16 }}>1️⃣</span> Show this screen to the staff
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(245,237,224,0.7)' }}>
                      <span style={{ fontSize: 16 }}>2️⃣</span> Wait for them to tap Approve
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(245,237,224,0.7)' }}>
                      <span style={{ fontSize: 16 }}>3️⃣</span> This page updates automatically ✓
                    </div>
                  </div>
                </div>

                {result.stampGoal && (
                  <StampCard activeStamps={result.activeStamps ?? 0} stampGoal={result.stampGoal} stampLogo={result.stampLogo} shopLogo={result.shopLogo} shopName={shop?.name} reward={result.reward ?? ''} themeColor={result.themeColor} customerName={result.customer?.name} customerPhone={phone} />
                )}
                <p style={{ color: 'rgba(245,237,224,0.2)', fontSize: 11, margin: '10px 0 0' }}>Checking for approval every 3 seconds…</p>
                <button onClick={reset} style={{ ...btnGhost, marginTop: 10 }}>Cancel</button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP: DUPLICATE ── */}
        {step === 'duplicate' && (
          <div style={{ ...card, textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>⏳</div>
            <h2 style={{ color: '#f5ede0', fontSize: 17, fontWeight: 700, margin: '0 0 8px' }}>You already have a pending request</h2>
            <p style={{ color: 'rgba(245,237,224,0.5)', fontSize: 14, margin: '0 0 16px', lineHeight: 1.6 }}>
              Your previous request is still waiting for staff to approve.<br />Please show your phone to the staff at the counter.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button onClick={() => { setCheckPhone(phone); setStep('check_phone') }} style={btnPrimary(theme)}>🎫 Check my stamps</button>
              <button onClick={reset} style={btnGhost}>Start over</button>
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', color: 'rgba(245,237,224,0.1)', fontSize: 11, marginTop: '1.5rem' }}>Powered by BrewPass Nepal</p>
      </div>

      {/* WiFi Modal */}
      {showWifi && wifiQr && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} onClick={() => setShowWifi(false)}>
          <div style={{ background: '#1a1208', border: '0.5px solid rgba(232,162,75,0.2)', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 320, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 700, color: theme }}>📶 Free WiFi</div>
              <button onClick={() => setShowWifi(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(245,237,224,0.4)', fontSize: 22, cursor: 'pointer' }}>×</button>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(245,237,224,0.5)', marginBottom: '1rem' }}>Point your phone camera at the QR code to connect</p>
            <div style={{ background: '#fff', padding: 12, borderRadius: 12, display: 'inline-block', marginBottom: '1rem' }}>
              <img src={wifiQr.qrCode} alt="WiFi QR" style={{ width: 160, height: 160, display: 'block' }} />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: wifiQr.password ? 8 : 0 }}>
                <span style={{ color: 'rgba(245,237,224,0.45)', fontSize: 13 }}>Network name</span>
                <span style={{ color: '#f5ede0', fontSize: 13, fontWeight: 600 }}>{wifiQr.ssid}</span>
              </div>
              {wifiQr.password && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(245,237,224,0.45)', fontSize: 13 }}>Password</span>
                  <span style={{ color: theme, fontSize: 13, fontWeight: 700, letterSpacing: 0.5 }}>{wifiQr.password}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}