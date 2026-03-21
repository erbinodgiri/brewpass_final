'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error); return }
      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inp: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '11px 14px', color: '#f5ede0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }

  return (
    <div style={{ minHeight: '100vh', background: '#0e0a06', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 700, color: '#e8a24b', textDecoration: 'none' }}>
            Brew<span style={{ color: '#f5ede0' }}>Pass</span>
          </Link>
          <p style={{ color: 'rgba(245,237,224,0.45)', marginTop: 8, fontSize: 14 }}>Sign in to your shop dashboard</p>
        </div>

        <div style={{ background: '#1a1208', border: '1px solid rgba(232,162,75,0.15)', borderRadius: 16, padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: 13, color: 'rgba(245,237,224,0.55)', marginBottom: 6 }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="cafe@example.com" required style={inp} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: 13, color: 'rgba(245,237,224,0.55)', marginBottom: 6 }}>Password</label>
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" required style={inp} />
            </div>
            {error && <div style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: '1rem' }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width: '100%', background: '#e8a24b', color: '#0e0a06', border: 'none', borderRadius: 8, padding: '12px', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', padding: '1rem', background: 'rgba(232,162,75,0.06)', borderRadius: 8, border: '1px dashed rgba(232,162,75,0.2)' }}>
            <div style={{ fontSize: 12, color: 'rgba(245,237,224,0.4)', marginBottom: 4 }}>Demo credentials</div>
            <div style={{ fontSize: 13, color: '#e8a24b', fontFamily: 'monospace' }}>cafe@piccolo.com</div>
            <div style={{ fontSize: 13, color: '#e8a24b', fontFamily: 'monospace' }}>demo1234</div>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 13, color: 'rgba(245,237,224,0.35)' }}>
          No account?{' '}
          <Link href="/register" style={{ color: '#e8a24b', textDecoration: 'none' }}>Register your shop →</Link>
        </p>
      </div>
    </div>
  )
}
