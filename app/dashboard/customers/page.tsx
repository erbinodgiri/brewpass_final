'use client'
import { useEffect, useState, useCallback } from 'react'

interface Customer {
  id: string; name: string | null; phone: string; createdAt: string
  activeStamps: number; totalStamps: number; totalRedemptions: number
  isRewardReady: boolean
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stampGoal, setStampGoal] = useState(7)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchCustomers = useCallback(async (q = '') => {
    setLoading(true)
    try {
      const res = await fetch(`/api/customers${q ? `?search=${encodeURIComponent(q)}` : ''}`)
      const data = await res.json()
      if (data.success) {
        setCustomers(data.data.customers)
        setStampGoal(data.data.stampGoal)
      }
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  useEffect(() => {
    const t = setTimeout(() => fetchCustomers(search), 300)
    return () => clearTimeout(t)
  }, [search, fetchCustomers])

  const th: React.CSSProperties = {
    textAlign: 'left', padding: '10px 16px', color: '#aaa',
    fontWeight: 500, fontSize: 11, textTransform: 'uppercase',
    letterSpacing: 0.5, borderBottom: '1px solid #f0ece4', whiteSpace: 'nowrap'
  }
  const td: React.CSSProperties = {
    padding: '12px 16px', fontSize: 14, color: '#1a1208',
    borderBottom: '1px solid #f8f5f0', verticalAlign: 'middle'
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#1a1208', margin: 0 }}>Customers</h1>
        <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>
          {customers.length} customer{customers.length !== 1 ? 's' : ''} · stamp goal: {stampGoal}
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or phone…"
          style={{ width: '100%', maxWidth: 360, border: '1px solid #e0dbd2', borderRadius: 10, padding: '10px 16px', fontSize: 14, color: '#1a1208', outline: 'none', background: '#fff' }}
        />
      </div>

      <div style={{ background: '#fff', border: '1px solid #ede8e0', borderRadius: 14, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#aaa', fontSize: 14 }}>Loading…</div>
        ) : customers.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
            <p style={{ color: '#aaa', fontSize: 14, margin: 0 }}>
              {search ? 'No customers match your search.' : 'No customers yet. Start adding stamps!'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr>
                  <th style={th}>Customer</th>
                  <th style={th}>Progress</th>
                  <th style={th}>Active Stamps</th>
                  <th style={th}>Total Stamps</th>
                  <th style={th}>Rewards</th>
                  <th style={th}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => {
                  const pct = Math.min(100, Math.round((c.activeStamps / stampGoal) * 100))
                  return (
                    <tr key={c.id} style={{ background: c.isRewardReady ? '#fffbeb' : 'transparent' }}>
                      <td style={td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: c.isRewardReady ? '#fef3c7' : '#f0ece4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#c97a20', flexShrink: 0 }}>
                            {(c.name || c.phone).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500 }}>
                              {c.name || <span style={{ color: '#bbb', fontStyle: 'italic', fontWeight: 400 }}>No name</span>}
                            </div>
                            <div style={{ fontSize: 12, color: '#bbb' }}>{c.phone}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ ...td, minWidth: 160 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 5, background: '#f0ece4', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: c.isRewardReady ? '#f59e0b' : '#e8a24b', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 11, color: '#aaa', whiteSpace: 'nowrap' }}>
                            {Math.min(c.activeStamps, stampGoal)}/{stampGoal}
                          </span>
                        </div>
                      </td>

                      <td style={td}>
                        <span style={{ fontWeight: 600, color: c.isRewardReady ? '#d97706' : '#1a1208' }}>
                          {c.activeStamps}{c.isRewardReady ? ' 🎁' : ''}
                        </span>
                      </td>

                      <td style={{ ...td, color: '#666' }}>{c.totalStamps}</td>
                      <td style={{ ...td, color: '#666' }}>{c.totalRedemptions}</td>
                      <td style={{ ...td, color: '#bbb', fontSize: 12 }}>
                        {new Date(c.createdAt).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
