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
  // Edit stamps
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [localCount, setLocalCount] = useState(0)
  const [adjusting, setAdjusting] = useState(false)
  const [toast, setToast] = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

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

  function openEdit(c: Customer) {
    setEditingCustomer(c)
    setLocalCount(c.activeStamps)
  }

  async function applyAdjust(action: 'add' | 'remove' | 'set') {
    if (!editingCustomer) return
    setAdjusting(true)
    try {
      const body: Record<string, unknown> = { customerId: editingCustomer.id, action }
      if (action === 'set') body.targetCount = localCount
      const res = await fetch('/api/stamps/adjust', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!data.success) { showToast(data.error); return }
      const newCount = data.data.activeStamps
      setLocalCount(newCount)
      setCustomers(prev => prev.map(c =>
        c.id === editingCustomer.id
          ? { ...c, activeStamps: newCount, isRewardReady: newCount >= stampGoal }
          : c
      ))
      setEditingCustomer(prev => prev ? { ...prev, activeStamps: newCount, isRewardReady: newCount >= stampGoal } : null)
      showToast(action === 'remove' ? '✓ Stamp removed' : action === 'add' ? '✓ Stamp added' : `✓ Set to ${newCount} stamps`)
    } catch { showToast('Failed — try again') }
    finally { setAdjusting(false) }
  }

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
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, background: '#166534', color: '#fff', borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          {toast}
        </div>
      )}

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
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr>
                  <th style={th}>Customer</th>
                  <th style={th}>Progress</th>
                  <th style={th}>Active Stamps</th>
                  <th style={th}>Total Stamps</th>
                  <th style={th}>Rewards</th>
                  <th style={th}>Joined</th>
                  <th style={th}>Adjust</th>
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

                      {/* ── NEW: Edit button ── */}
                      <td style={td}>
                        <button
                          onClick={() => openEdit(c)}
                          style={{ background: 'transparent', border: '1px solid #e0dbd2', borderRadius: 7, padding: '5px 12px', fontSize: 12, color: '#666', cursor: 'pointer' }}
                        >
                          ✏ Edit
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── NEW: Edit stamps modal ── */}
      {editingCustomer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '2rem', width: '100%', maxWidth: 400 }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: '#1a1208', margin: 0 }}>Adjust stamps</h2>
                <p style={{ color: '#888', fontSize: 13, margin: '4px 0 0' }}>
                  {editingCustomer.name || editingCustomer.phone}
                  {editingCustomer.name && <span style={{ color: '#bbb' }}> · {editingCustomer.phone}</span>}
                </p>
              </div>
              <button onClick={() => setEditingCustomer(null)} style={{ background: 'transparent', border: 'none', fontSize: 22, color: '#aaa', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            {/* Big +/- counter */}
            <div style={{ background: '#f8f5f0', borderRadius: 12, padding: '1.5rem', marginBottom: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>Active stamps</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                <button
                  onClick={() => applyAdjust('remove')}
                  disabled={adjusting || localCount === 0}
                  style={{ width: 48, height: 48, borderRadius: '50%', background: '#fff', border: '1.5px solid #e0dbd2', fontSize: 24, cursor: localCount === 0 ? 'not-allowed' : 'pointer', opacity: localCount === 0 ? 0.35 : 1, color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  −
                </button>
                <div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 52, fontWeight: 700, color: '#1a1208', lineHeight: 1 }}>{localCount}</div>
                  <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>of {stampGoal}</div>
                </div>
                <button
                  onClick={() => applyAdjust('add')}
                  disabled={adjusting}
                  style={{ width: 48, height: 48, borderRadius: '50%', background: '#e8a24b', border: 'none', fontSize: 24, cursor: 'pointer', color: '#0e0a06', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: adjusting ? 0.6 : 1 }}
                >
                  +
                </button>
              </div>
              {localCount >= stampGoal && (
                <div style={{ marginTop: 10, fontSize: 12, color: '#d97706', fontWeight: 600 }}>🎁 Reward ready</div>
              )}
            </div>

            {/* Set exact number */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: 13, color: '#555', fontWeight: 500, marginBottom: 8 }}>Set exact count:</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number" min={0} max={99}
                  value={localCount}
                  onChange={e => setLocalCount(Math.max(0, Number(e.target.value)))}
                  style={{ flex: 1, border: '1px solid #e0dbd2', borderRadius: 8, padding: '9px 14px', fontSize: 15, outline: 'none', textAlign: 'center', fontWeight: 600 }}
                />
                <button
                  onClick={() => applyAdjust('set')}
                  disabled={adjusting}
                  style={{ background: '#e8a24b', color: '#0e0a06', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: adjusting ? 'not-allowed' : 'pointer', opacity: adjusting ? 0.7 : 1 }}
                >
                  {adjusting ? '…' : 'Set'}
                </button>
              </div>
              <p style={{ fontSize: 11, color: '#bbb', marginTop: 5 }}>
                Useful for migrating a customer's paper card stamps
              </p>
            </div>

            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '9px 14px', fontSize: 12, color: '#92400e', marginBottom: '1.25rem' }}>
              <strong>Note:</strong> − removes the most recent stamp only. Changes are instant.
            </div>

            <button
              onClick={() => setEditingCustomer(null)}
              style={{ width: '100%', background: 'transparent', border: '1px solid #e0dbd2', borderRadius: 8, padding: '11px', fontSize: 14, color: '#666', cursor: 'pointer' }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
