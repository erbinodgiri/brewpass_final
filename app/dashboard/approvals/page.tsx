'use client'
import { useEffect, useState, useCallback, useRef } from 'react'

interface StampRequest { id: string; phone: string; name: string | null; createdAt: string; activeStamps: number; stampGoal: number; customerId: string }

export default function ApprovalsPage() {
  const [requests, setRequests] = useState<StampRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const prevCountRef = useRef(0)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(false)

  function showToast(msg: string, type: 'success' | 'error') { setToast({ msg, type }); setTimeout(() => setToast(null), 3500) }

  // Must be called after a user gesture to unlock AudioContext
  function unlockAudio() {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume()
      }
      setSoundEnabled(true)
    } catch { /* ignore */ }
  }

  function playSound(freqs: number[], durations: number[]) {
    try {
      const ctx = audioCtxRef.current
      if (!ctx || ctx.state !== 'running') return
      freqs.forEach((freq, i) => {
        const delay = durations.slice(0, i).reduce((a, b) => a + b, 0)
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.frequency.value = freq
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.3, ctx.currentTime + delay)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + durations[i])
        osc.start(ctx.currentTime + delay)
        osc.stop(ctx.currentTime + delay + durations[i])
      })
    } catch { /* ignore */ }
  }

  function playNewRequestSound() { playSound([880, 660], [0.2, 0.2]) }
  function playApproveSound() { playSound([523, 659, 784], [0.1, 0.1, 0.3]) }

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/requests')
      const data = await res.json()
      if (data.success) {
        const newRequests = data.data
        if (prevCountRef.current >= 0 && newRequests.length > prevCountRef.current) {
          playNewRequestSound()
        }
        prevCountRef.current = newRequests.length
        setRequests(newRequests)
      }
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    prevCountRef.current = -1
    fetchRequests()
    const t = setInterval(fetchRequests, 5000)
    return () => clearInterval(t)
  }, [fetchRequests])

  async function handleAction(id: string, action: 'approve' | 'reject') {
    setActionLoading(id + action)
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!data.success) { showToast(data.error, 'error'); return }
      setRequests(prev => prev.filter(r => r.id !== id))
      prevCountRef.current = Math.max(0, prevCountRef.current - 1)
      if (action === 'approve') {
        playApproveSound()
        const d = data.data
        showToast(d.isRewardReady
          ? `🎉 ${d.customer?.name || 'Customer'} earned a FREE reward!`
          : `✓ Stamp approved — ${d.customer?.name || 'Customer'} has ${d.activeStamps}/${d.stampGoal}`, 'success')
      } else {
        showToast('Request rejected', 'error')
      }
    } catch { showToast('Action failed', 'error') }
    finally { setActionLoading(null) }
  }

  function timeAgo(s: string) {
    const sec = Math.floor((Date.now() - new Date(s).getTime()) / 1000)
    if (sec < 60) return `${sec}s ago`
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
    return `${Math.floor(sec / 3600)}h ago`
  }

  return (
    <div style={{ maxWidth: 660 }}>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, background: toast.type === 'success' ? '#166534' : '#991b1b', color: '#fff', borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 500, maxWidth: 380, boxShadow: '0 4px 24px rgba(0,0,0,0.18)', lineHeight: 1.5 }}>
          {toast.msg}
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#1a1208', margin: 0 }}>Stamp Approvals</h1>
        <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>
          {loading ? 'Loading…' : requests.length === 0 ? 'No pending requests · auto-refreshes every 5s' : `${requests.length} pending · refreshing every 5s`}
        </p>
      </div>

      {/* Sound enable button — REQUIRED for browsers */}
      {!soundEnabled && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#92400e' }}>🔔 Enable sound alerts</div>
            <div style={{ fontSize: 12, color: '#b45309', marginTop: 2 }}>Browsers require a tap to enable sound. Click to hear alerts when customers arrive.</div>
          </div>
          <button
            onClick={unlockAudio}
            style={{ background: '#f59e0b', color: '#0e0a06', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            🔊 Enable Sound
          </button>
        </div>
      )}

      {soundEnabled && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '0.75rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>🔊</span>
          <span style={{ fontSize: 13, color: '#166534', fontWeight: 500 }}>Sound alerts active — you&apos;ll hear a tone when new requests arrive</span>
        </div>
      )}

      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '0.875rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
        <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6, margin: 0 }}>
          Verify the customer is <strong>physically at the counter</strong>, then tap <strong>Approve</strong>. The customer&apos;s phone updates automatically.
        </p>
      </div>

      {loading ? (
        <div style={{ background: '#fff', border: '1px solid #ede8e0', borderRadius: 14, padding: '3rem', textAlign: 'center', color: '#aaa' }}>Loading…</div>
      ) : requests.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #ede8e0', borderRadius: 14, padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <p style={{ color: '#888', fontSize: 15, margin: 0, fontWeight: 500 }}>All clear — no pending requests</p>
          <p style={{ color: '#ccc', fontSize: 13, marginTop: 6 }}>New requests appear automatically with a sound alert</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {requests.map(r => {
            const pct = Math.min(100, Math.round((r.activeStamps / r.stampGoal) * 100))
            const isApproving = actionLoading === r.id + 'approve'
            const isRejecting = actionLoading === r.id + 'reject'
            return (
              <div key={r.id} style={{ background: '#fff', border: '1px solid #ede8e0', borderRadius: 14, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f0ece4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#c97a20', flexShrink: 0 }}>
                  {(r.name || r.phone).charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: 15, color: '#1a1208' }}>{r.name || <span style={{ fontStyle: 'italic', color: '#aaa', fontWeight: 400 }}>No name</span>}</span>
                    <span style={{ fontSize: 13, color: '#888' }}>{r.phone}</span>
                    <span style={{ fontSize: 11, color: '#bbb', marginLeft: 'auto', whiteSpace: 'nowrap' }}>{timeAgo(r.createdAt)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 5, background: '#f0ece4', borderRadius: 3, overflow: 'hidden', maxWidth: 160 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#e8a24b', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#888' }}>{r.activeStamps}/{r.stampGoal}</span>
                    <span style={{ fontSize: 12, color: '#e8a24b', fontWeight: 600 }}>+1 pending</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => handleAction(r.id, 'reject')}
                    disabled={!!actionLoading}
                    style={{ background: 'transparent', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 16px', fontSize: 13, color: '#dc2626', cursor: actionLoading ? 'not-allowed' : 'pointer', opacity: isRejecting ? 0.6 : 1, fontWeight: 500 }}
                  >
                    {isRejecting ? '…' : '✕ Reject'}
                  </button>
                  <button
                    onClick={() => { unlockAudio(); handleAction(r.id, 'approve') }}
                    disabled={!!actionLoading}
                    style={{ background: '#e8a24b', border: 'none', borderRadius: 8, padding: '9px 22px', fontSize: 13, color: '#0e0a06', cursor: actionLoading ? 'not-allowed' : 'pointer', opacity: isApproving ? 0.6 : 1, fontWeight: 700 }}
                  >
                    {isApproving ? '…' : '✓ Approve'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
