'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
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
  const lbl: React.CSSProperties = { display: 'block', fontSize: 13, color: 'rgba(245,237,224,0.55)', marginBottom: 6 }

  return (
    <div style={{ minHeight: '100vh', background: '#0e0a06', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 700, color: '#e8a24b', textDecoration: 'none' }}>
            Brew<span style={{ color: '#f5ede0' }}>Pass</span>
          </Link>
          <p style={{ color: 'rgba(245,237,224,0.45)', marginTop: 8, fontSize: 14 }}>Register your coffee shop — free forever</p>
        </div>

        <div style={{ background: '#1a1208', border: '1px solid rgba(232,162,75,0.15)', borderRadius: 16, padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            {[
              { k: 'name',     lbl: 'Shop Name',            ph: 'Cafe Piccolo',        type: 'text',     req: true  },
              { k: 'email',    lbl: 'Email',                 ph: 'cafe@example.com',    type: 'email',    req: true  },
              { k: 'password', lbl: 'Password (min 6 chars)',ph: '••••••••',            type: 'password', req: true  },
              { k: 'phone',    lbl: 'Phone (optional)',      ph: '98XXXXXXXX',          type: 'tel',      req: false },
              { k: 'address',  lbl: 'Address (optional)',    ph: 'Thamel, Kathmandu',   type: 'text',     req: false },
            ].map(f => (
              <div key={f.k} style={{ marginBottom: '1rem' }}>
                <label style={lbl}>{f.lbl}</label>
                <input type={f.type} placeholder={f.ph} required={f.req} value={form[f.k as keyof typeof form]} onChange={set(f.k)} style={inp} />
              </div>
            ))}
            {error && <div style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: '1rem' }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width: '100%', background: '#e8a24b', color: '#0e0a06', border: 'none', borderRadius: 8, padding: '12px', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4 }}>
              {loading ? 'Creating account…' : 'Create free account →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 13, color: 'rgba(245,237,224,0.35)' }}>
          Already registered?{' '}
          <Link href="/login" style={{ color: '#e8a24b', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
