'use client'
import { useEffect, useState, useRef } from 'react'

interface ShopData {
  id: string; name: string; email: string; address: string | null
  phone: string | null; stampGoal: number; reward: string
  qrCode: string | null; plan: string; planExpiresAt: string | null; planActive: boolean
  freeLimit: number; stampLogo: string | null; shopLogo: string | null; themeColor: string | null
  wifiName: string | null; wifiPassword: string | null; wifiType: string | null; wifiHidden: boolean
}

const PLAN_INFO = {
  free:  { label: 'Free',  color: '#666',    bg: '#f8f5f0', price: 'NPR 0' },
  basic: { label: 'Basic', color: '#1d4ed8', bg: '#eff6ff', price: 'NPR 1,500/mo' },
  pro:   { label: 'Pro',   color: '#d97706', bg: '#fffbeb', price: 'NPR 3,500/mo' },
}

const THEME_COLORS = ['#e8a24b','#e05454','#3b82f6','#10b981','#8b5cf6','#ec4899','#f97316','#06b6d4','#84cc16','#6366f1']
const STAMP_EMOJIS = ['☕','🍵','🧋','⭐','❤️','🌟','🎯','💎','🏆','🎪','🎨','🌸','🍀','🦋','🌈','🎭','🎵','🔥','💫','✨','🍕','🥤','🍺','🍜','🍱','🥘','🫕','🍗','🍖','🌮','🥗','🍰','🎂','🧁','🍫','🍩','🍪','🎁','🎉','🎊']

export default function SettingsPage() {
  const [shop, setShop] = useState<ShopData | null>(null)
  // Shop info form
  const [form, setForm] = useState({ name: '', address: '', phone: '', stampGoal: 7, reward: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  // Branding
  const [stampLogo, setStampLogo] = useState('☕')
  const [shopLogo, setShopLogo] = useState('')
  const [themeColor, setThemeColor] = useState('#e8a24b')
  const [brandingSaving, setBrandingSaving] = useState(false)
  const [brandingSaved, setBrandingSaved] = useState(false)
  const shopLogoRef = useRef<HTMLInputElement>(null)
  // QR
  const [qrLoading, setQrLoading] = useState(false)
  const [qrData, setQrData] = useState<{ qrCode: string; scanUrl: string } | null>(null)
  // WiFi
  const [wifiForm, setWifiForm] = useState({ wifiName: '', wifiPassword: '', wifiType: 'WPA', wifiHidden: false })
  const [wifiQr, setWifiQr] = useState<{ qrCode: string; ssid: string } | null>(null)
  const [wifiSaving, setWifiSaving] = useState(false)
  const [wifiSaved, setWifiSaved] = useState(false)

  useEffect(() => {
    fetch('/api/shops/me').then(r => r.json()).then(d => {
      if (!d.success) return
      const s = d.data
      setShop(s)
      setForm({ name: s.name, address: s.address || '', phone: s.phone || '', stampGoal: s.stampGoal, reward: s.reward })
      setStampLogo(s.stampLogo || '☕')
      setShopLogo(s.shopLogo || '')
      setThemeColor(s.themeColor || '#e8a24b')
      setWifiForm({ wifiName: s.wifiName || '', wifiPassword: s.wifiPassword || '', wifiType: s.wifiType || 'WPA', wifiHidden: s.wifiHidden || false })
      if (s.qrCode) setQrData({ qrCode: s.qrCode, scanUrl: `${window.location.origin}/scan/${s.id}` })
      // Auto-regenerate so QR always points to current domain
      fetch('/api/qr').then(r => r.json()).then(d => { if (d.success) setQrData(d.data) }).catch(() => {})
      // if (s.qrCode) setQrData({ qrCode: s.qrCode, scanUrl: `${window.location.origin}/scan/${s.id}` })
    })
  }, [])

  async function saveShop(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(''); setSaved(false)
    try {
      const res = await fetch('/api/shops/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, stampGoal: Number(form.stampGoal) }) })
      const data = await res.json()
      if (!data.success) { setError(data.error); return }
      setSaved(true); setTimeout(() => setSaved(false), 3000)
      setShop(prev => prev ? { ...prev, ...data.data } : prev)
    } catch { setError('Failed to save') } finally { setSaving(false) }
  }

  async function saveBranding() {
    setBrandingSaving(true); setBrandingSaved(false)
    try {
      const res = await fetch('/api/shops/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stampLogo, shopLogo: shopLogo || null, themeColor })
      })
      const data = await res.json()
      if (data.success) {
        setBrandingSaved(true)
        setTimeout(() => setBrandingSaved(false), 3000)
        setShop(prev => prev ? { ...prev, stampLogo, shopLogo: shopLogo || null, themeColor } : prev)
      }
    } catch { /* ignore */ } finally { setBrandingSaving(false) }
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 300 * 1024) { alert('Image must be under 300KB'); return }
    const reader = new FileReader()
    reader.onload = ev => setShopLogo(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function generateQR() {
    setQrLoading(true)
    try {
      const res = await fetch('/api/qr'); const d = await res.json()
      if (d.success) setQrData(d.data)
    } finally { setQrLoading(false) }
  }

  async function saveWifi(e: React.FormEvent) {
    e.preventDefault(); setWifiSaving(true); setWifiSaved(false)
    try {
      const res = await fetch('/api/wifi', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(wifiForm) })
      const d = await res.json()
      if (d.success) {
        setWifiSaved(true); setTimeout(() => setWifiSaved(false), 3000)
        if (wifiForm.wifiName.trim()) {
          const qrRes = await fetch('/api/wifi'); const qrD = await qrRes.json()
          if (qrD.success) setWifiQr(qrD.data)
        } else setWifiQr(null)
      }
    } catch { /* ignore */ } finally { setWifiSaving(false) }
  }

  if (!shop) return <div style={{ padding: '3rem', textAlign: 'center', color: '#aaa' }}>Loading…</div>

  const planInfo = PLAN_INFO[shop.plan as keyof typeof PLAN_INFO] || PLAN_INFO.free
  const card: React.CSSProperties = { background: '#fff', border: '1px solid #ede8e0', borderRadius: 14, padding: '1.75rem', marginBottom: '1.5rem' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 13, color: '#555', marginBottom: 6, fontWeight: 500 }
  const inp: React.CSSProperties = { width: '100%', border: '1px solid #e0dbd2', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#1a1208', outline: 'none', background: '#fff', boxSizing: 'border-box' }

  function SaveBtn({ onClick, saving, saved, label }: { onClick?: () => void; saving: boolean; saved: boolean; label: string }) {
    return (
      <button type={onClick ? 'button' : 'submit'} onClick={onClick} disabled={saving}
        style={{ background: saved ? '#22c55e' : '#e8a24b', color: '#0e0a06', border: 'none', borderRadius: 8, padding: '11px 24px', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.25s', opacity: saving ? 0.7 : 1 }}>
        {saved ? '✓ Saved!' : saving ? 'Saving…' : label}
      </button>
    )
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#1a1208', margin: 0 }}>Settings</h1>
        <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Manage your shop profile, branding, and loyalty program</p>
      </div>

      {/* Plan card */}
      <div style={{ background: planInfo.bg, border: `1px solid ${shop.plan === 'pro' ? '#fde68a' : shop.plan === 'basic' ? '#bfdbfe' : '#e0dbd2'}`, borderRadius: 14, padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ background: planInfo.color, color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>{planInfo.label}</span>
          {!shop.planActive && <span style={{ background: '#fef2f2', color: '#dc2626', fontSize: 11, padding: '3px 10px', borderRadius: 5, border: '1px solid #fecaca', marginLeft: 6 }}>Expired</span>}
          <div style={{ fontSize: 13, color: '#666', marginTop: 6 }}>{shop.plan === 'free' ? `Up to ${shop.freeLimit} customers` : 'Unlimited customers'}</div>
          {shop.planExpiresAt && <div style={{ fontSize: 12, color: new Date(shop.planExpiresAt) < new Date() ? '#dc2626' : '#888', marginTop: 3 }}>
            {new Date(shop.planExpiresAt) < new Date() ? '⚠ Expired' : `Active until ${new Date(shop.planExpiresAt).toLocaleDateString('en-NP', { day: 'numeric', month: 'long', year: 'numeric' })}`}
          </div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: planInfo.color }}>{planInfo.price}</div>
          <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>Contact admin to upgrade</div>
        </div>
      </div>

      {/* Branding */}
      <div style={card}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1a1208', marginTop: 0, marginBottom: 4 }}>🎨 Card Branding</h2>
        <p style={{ fontSize: 13, color: '#888', margin: '0 0 1.25rem' }}>Customize how your digital loyalty card looks to customers</p>

        {/* Shop logo */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={lbl}>Shop logo <span style={{ color: '#bbb', fontWeight: 400 }}>(shows on scan page, max 300KB)</span></label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {shopLogo ? (
              <img src={shopLogo} alt="Shop logo" style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', border: '2px solid #e0dbd2', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 56, height: 56, borderRadius: 12, background: '#f8f5f0', border: '2px dashed #e0dbd2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>☕</div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <input ref={shopLogoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
              <button type="button" onClick={() => shopLogoRef.current?.click()} style={{ background: '#fff', border: '1px solid #e0dbd2', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: '#555', cursor: 'pointer' }}>
                {shopLogo ? 'Change logo' : 'Upload logo'}
              </button>
              {shopLogo && <button type="button" onClick={() => setShopLogo('')} style={{ background: 'transparent', border: 'none', fontSize: 12, color: '#dc2626', cursor: 'pointer' }}>Remove</button>}
            </div>
          </div>
        </div>

        {/* Stamp emoji */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={lbl}>Stamp icon <span style={{ color: '#bbb', fontWeight: 400 }}>(shows on each stamp cell)</span></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: 8, background: '#f8f5f0', borderRadius: 10, border: '1px solid #e0dbd2', maxHeight: 140, overflowY: 'auto' }}>
            {STAMP_EMOJIS.map(e => (
              <button key={e} type="button" onClick={() => setStampLogo(e)}
                style={{ fontSize: 20, width: 36, height: 36, borderRadius: 7, border: `2px solid ${stampLogo === e ? themeColor : 'transparent'}`, background: stampLogo === e ? `${themeColor}18` : 'transparent', cursor: 'pointer' }}>
                {e}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>Selected: <strong>{stampLogo}</strong></div>
        </div>

        {/* Theme color */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={lbl}>Card accent color</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {THEME_COLORS.map(c => (
              <button key={c} type="button" onClick={() => setThemeColor(c)}
                style={{ width: 34, height: 34, borderRadius: '50%', background: c, border: `3px solid ${themeColor === c ? '#1a1208' : 'transparent'}`, cursor: 'pointer', outline: themeColor === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }} />
            ))}
            <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)}
              style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid #e0dbd2', cursor: 'pointer', padding: 2 }} title="Custom color" />
          </div>
        </div>

        {/* Live preview — matches physical card style */}
        <div style={{ background: '#f8f5f0', borderRadius: 12, padding: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, textAlign: 'center' }}>Card preview</div>
          <StampCardPreview
            stampGoal={shop.stampGoal}
            activeStamps={4}
            stampLogo={stampLogo}
            shopLogo={shopLogo}
            themeColor={themeColor}
            shopName={shop.name}
            reward={shop.reward}
            customerName="Sita Sharma"
          />
        </div>

        <SaveBtn onClick={saveBranding} saving={brandingSaving} saved={brandingSaved} label="Save branding" />
      </div>

      {/* Shop info */}
      <form onSubmit={saveShop}>
        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1a1208', marginTop: 0, marginBottom: '1.25rem' }}>Shop Information</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div><label style={lbl}>Shop Name</label><input style={inp} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
            <div><label style={lbl}>Email <span style={{ color: '#bbb', fontWeight: 400 }}>(cannot change)</span></label><input style={{ ...inp, background: '#f8f5f0', color: '#bbb' }} value={shop.email} disabled /></div>
            <div><label style={lbl}>Phone</label><input style={inp} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="98XXXXXXXX" /></div>
            <div><label style={lbl}>Address</label><input style={inp} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Thamel, Kathmandu" /></div>
          </div>
        </div>
        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1a1208', marginTop: 0, marginBottom: '1.25rem' }}>Loyalty Program</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={lbl}>Stamps required for reward</label>
              <input style={{ ...inp, maxWidth: 100 }} type="number" min={1} max={30} value={form.stampGoal} onChange={e => setForm(p => ({ ...p, stampGoal: Number(e.target.value) }))} />
            </div>
            <div><label style={lbl}>Reward description</label><input style={inp} value={form.reward} onChange={e => setForm(p => ({ ...p, reward: e.target.value }))} placeholder="1 free coffee" /></div>
          </div>
        </div>
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: '1rem' }}>{error}</div>}
        <SaveBtn saving={saving} saved={saved} label="Save changes" />
      </form>

      {/* QR Code */}
      <div style={{ ...card, marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1a1208', marginTop: 0, marginBottom: 6 }}>QR Code</h2>
        <p style={{ fontSize: 13, color: '#888', margin: '0 0 1.25rem' }}>Print and place at your counter. Customers scan to request stamps.</p>
        {qrData ? (
          <div style={{ textAlign: 'center' }}>
            <img src={qrData.qrCode} alt="QR" style={{ width: 160, height: 160, border: '4px solid #f0ece4', borderRadius: 12, display: 'block', margin: '0 auto 1rem' }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <button onClick={() => { const a = document.createElement('a'); a.href = qrData.qrCode; a.download = 'brewpass-qr.png'; a.click() }} style={{ background: '#e8a24b', color: '#0e0a06', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>⬇ Download</button>
              <button onClick={generateQR} disabled={qrLoading} style={{ background: 'transparent', border: '1px solid #e0dbd2', borderRadius: 8, padding: '9px 18px', fontSize: 13, color: '#666', cursor: 'pointer' }}>{qrLoading ? 'Generating…' : 'Regenerate'}</button>
            </div>
            <div style={{ background: '#f8f5f0', border: '1px solid #e0dbd2', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <code style={{ flex: 1, fontSize: 11, color: '#666', wordBreak: 'break-all', textAlign: 'left' }}>{qrData.scanUrl}</code>
              <button onClick={() => navigator.clipboard.writeText(qrData.scanUrl)} style={{ background: 'transparent', border: 'none', color: '#e8a24b', fontSize: 12, cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}>Copy</button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 120, height: 120, background: '#f8f5f0', border: '2px dashed #e0dbd2', borderRadius: 12, margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 13 }}>No QR yet</div>
            <button onClick={generateQR} disabled={qrLoading} style={{ background: '#e8a24b', color: '#0e0a06', border: 'none', borderRadius: 8, padding: '11px 24px', fontSize: 14, fontWeight: 600, cursor: qrLoading ? 'not-allowed' : 'pointer', opacity: qrLoading ? 0.7 : 1 }}>
              {qrLoading ? 'Generating…' : 'Generate QR Code'}
            </button>
          </div>
        )}
      </div>

      {/* WiFi */}
      <div style={{ ...card, marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1a1208', marginTop: 0, marginBottom: 6 }}>📶 WiFi QR Code</h2>
        <p style={{ fontSize: 13, color: '#888', margin: '0 0 1.25rem' }}>Customers scan to connect — no need to ask for the password.</p>
        <form onSubmit={saveWifi}>
          <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
            <div><label style={lbl}>Network name (SSID)</label><input style={inp} value={wifiForm.wifiName} onChange={e => setWifiForm(p => ({ ...p, wifiName: e.target.value }))} placeholder="CafePiccolo_WiFi" /></div>
            <div><label style={lbl}>Password</label><input style={inp} type="text" value={wifiForm.wifiPassword} onChange={e => setWifiForm(p => ({ ...p, wifiPassword: e.target.value }))} placeholder="YourWifiPassword" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={lbl}>Security type</label>
                <select style={{ ...inp }} value={wifiForm.wifiType} onChange={e => setWifiForm(p => ({ ...p, wifiType: e.target.value }))}>
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP (older)</option>
                  <option value="nopass">No password</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#555', cursor: 'pointer' }}>
                  <input type="checkbox" checked={wifiForm.wifiHidden} onChange={e => setWifiForm(p => ({ ...p, wifiHidden: e.target.checked }))} />
                  Hidden network
                </label>
              </div>
            </div>
          </div>
          <SaveBtn saving={wifiSaving} saved={wifiSaved} label="Save & Generate WiFi QR" />
        </form>
        {wifiQr && (
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <hr style={{ border: 'none', borderTop: '1px solid #f0ece4', marginBottom: '1.5rem' }} />
            <div style={{ fontSize: 13, color: '#888', marginBottom: '0.75rem' }}>WiFi QR for <strong>{wifiQr.ssid}</strong></div>
            <img src={wifiQr.qrCode} alt="WiFi QR" style={{ width: 140, height: 140, border: '4px solid #f0ece4', borderRadius: 12, display: 'block', margin: '0 auto 1rem' }} />
            <button onClick={() => { const a = document.createElement('a'); a.href = wifiQr.qrCode; a.download = 'wifi-qr.png'; a.click() }} style={{ background: '#e8a24b', color: '#0e0a06', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              ⬇ Download WiFi QR
            </button>
            <p style={{ fontSize: 12, color: '#bbb', marginTop: 10 }}>💡 Print on tables. Customers point camera to connect.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Physical card replica — coffee bean border, grid of boxes, logo in last cell
function StampCardPreview({ stampGoal, activeStamps, stampLogo, shopLogo, themeColor, shopName, reward, customerName }: {
  stampGoal: number; activeStamps: number; stampLogo: string; shopLogo: string
  themeColor: string; shopName: string; reward: string; customerName?: string
}) {
  const cols = stampGoal <= 6 ? stampGoal : stampGoal <= 8 ? 4 : stampGoal <= 10 ? 5 : 4
  const rows = Math.ceil((stampGoal) / cols)

  return (
    <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #e0dbd2', userSelect: 'none' }}>
      {/* Coffee bean border top */}
      <div style={{ height: 14, background: `repeating-linear-gradient(90deg, #3d1f00 0px, #5c2e0a 8px, #3d1f00 16px)`, opacity: 0.85 }} />
      {/* Header */}
      <div style={{ background: '#fff', padding: '8px 12px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1208', fontFamily: 'Georgia, serif' }}>{shopName}</div>
          <div style={{ fontSize: 10, color: '#888' }}>Name: {customerName || '________________'}</div>
        </div>
        {shopLogo && <img src={shopLogo} alt="logo" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />}
      </div>
      {/* Stamp grid */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 0, padding: '0 10px 6px', background: '#fff' }}>
        {Array.from({ length: stampGoal }).map((_, i) => {
          const isFree = i === stampGoal - 1
          const isStamped = i < activeStamps
          return (
            <div key={i} style={{ aspectRatio: '1', border: `1.5px solid ${themeColor}60`, margin: 2, borderRadius: 4, background: isStamped ? `${themeColor}20` : isFree ? themeColor : '#fafafa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              {isFree ? (
                shopLogo ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: themeColor }}>
                    <img src={shopLogo} alt="logo" style={{ width: '55%', height: '55%', objectFit: 'cover', borderRadius: 3 }} />
                    <div style={{ fontSize: 9, fontWeight: 900, color: '#fff', letterSpacing: 1, marginTop: 2 }}>FREE</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: themeColor, width: '100%', height: '100%', justifyContent: 'center' }}>
                    <span style={{ fontSize: 16 }}>{stampLogo}</span>
                    <span style={{ fontSize: 9, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>FREE</span>
                  </div>
                )
              ) : isStamped ? (
                <span style={{ fontSize: 18 }}>{stampLogo}</span>
              ) : null}
            </div>
          )
        })}
      </div>
      {/* Reward label */}
      <div style={{ textAlign: 'center', fontSize: 10, color: '#888', paddingBottom: 6 }}>
        Collect {stampGoal} stamps • Earn: {reward}
      </div>
      {/* Coffee bean border bottom */}
      <div style={{ height: 14, background: `repeating-linear-gradient(90deg, #3d1f00 0px, #5c2e0a 8px, #3d1f00 16px)`, opacity: 0.85 }} />
    </div>
  )
}
