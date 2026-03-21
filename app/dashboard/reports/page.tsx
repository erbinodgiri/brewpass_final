'use client'
import { useEffect, useState, useRef } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Customer {
  name: string; phone: string; activeStamps: number; totalStamps: number
  totalRedemptions: number; isRewardReady: boolean
  joinedAt: string; lastVisit: string | null; firstVisit: string | null
}
interface ReportData {
  shop: { name: string; address: string | null; phone: string | null; stampGoal: number; reward: string; plan: string }
  generatedAt: string
  summary: { totalCustomers: number; totalStamps: number; totalRedemptions: number; rewardReady: number; avgStamps: number }
  customers: Customer[]
  stampTrend: { date: string; count: number }[]
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'totalStamps' | 'lastVisit' | 'joinedAt'>('totalStamps')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [filterReady, setFilterReady] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/reports').then(r => r.json()).then(d => {
      if (d.success) setData(d.data)
      setLoading(false)
    })
  }, [])

  function downloadCSV() {
    window.location.href = '/api/reports?format=csv'
  }

  function handlePrint() {
    window.print()
  }

  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
  }

  function fmtDate(d: string | null) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const filtered = data?.customers
    .filter(c =>
      (!filterReady || c.isRewardReady) &&
      (!search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))
    )
    .sort((a, b) => {
      let av: number | string = 0, bv: number | string = 0
      if (sortBy === 'name') { av = a.name || a.phone; bv = b.name || b.phone }
      else if (sortBy === 'totalStamps') { av = a.totalStamps; bv = b.totalStamps }
      else if (sortBy === 'lastVisit') { av = a.lastVisit || ''; bv = b.lastVisit || '' }
      else if (sortBy === 'joinedAt') { av = a.joinedAt; bv = b.joinedAt }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    }) ?? []

  const card: React.CSSProperties = { background: '#fff', border: '1px solid #ede8e0', borderRadius: 14, padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }
  const th: React.CSSProperties = { textAlign: 'left', padding: '10px 14px', color: '#aaa', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #f0ece4', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }
  const td: React.CSSProperties = { padding: '11px 14px', fontSize: 13, color: '#1a1208', borderBottom: '1px solid #f8f5f0', verticalAlign: 'middle' }

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#aaa' }}>Loading report…</div>
  if (!data) return null

  const { shop, summary, stampTrend, generatedAt } = data

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: fixed; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
          .print-page-break { page-break-before: always; }
        }
      `}</style>

      <div style={{ maxWidth: 960 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#1a1208', margin: 0 }}>Customer Report</h1>
            <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>
              {shop.name} · Generated {new Date(generatedAt).toLocaleDateString('en-NP', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }} className="no-print">
            <button onClick={downloadCSV} style={{ background: '#fff', border: '1px solid #e0dbd2', borderRadius: 8, padding: '9px 18px', fontSize: 13, color: '#666', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
              ⬇ Export CSV
            </button>
            <button onClick={handlePrint} style={{ background: '#e8a24b', color: '#0e0a06', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              🖨 Print Report
            </button>
          </div>
        </div>

        {/* Print area */}
        <div id="print-area" ref={printRef}>

          {/* Print header — only shows when printing */}
          <div style={{ display: 'none' }} className="print-only">
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid #e0dbd2' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 700, color: '#c97a20' }}>BrewPass</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{shop.name} — Customer Report</div>
              {shop.address && <div style={{ color: '#666', fontSize: 13, marginTop: 2 }}>{shop.address}</div>}
              <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                Generated: {new Date(generatedAt).toLocaleDateString('en-NP', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            {[
              { label: 'Total Customers', value: summary.totalCustomers, icon: '👥' },
              { label: 'Total Stamps', value: summary.totalStamps, icon: '☕' },
              { label: 'Rewards Redeemed', value: summary.totalRedemptions, icon: '🎁' },
              { label: 'Reward Ready', value: summary.rewardReady, icon: '🎯' },
              { label: 'Avg Stamps/Customer', value: summary.avgStamps, icon: '📊' },
            ].map(s => (
              <div key={s.label} style={card}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#1a1208', fontFamily: 'Georgia, serif' }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Trend chart */}
          <div style={{ ...card, marginBottom: '1.25rem' }} className="no-print">
            <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1208', marginBottom: '1rem' }}>Stamps — last 30 days</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={stampTrend} barSize={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#bbb' }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: '#bbb' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #ede8e0', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="#e8a24b" radius={[3, 3, 0, 0]} name="Stamps" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Filters — no-print */}
          <div style={{ display: 'flex', gap: 10, marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }} className="no-print">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name or phone…"
              style={{ border: '1px solid #e0dbd2', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: '#1a1208', outline: 'none', background: '#fff', width: 220 }}
            />
            <button
              onClick={() => setFilterReady(f => !f)}
              style={{ background: filterReady ? '#fffbeb' : '#fff', border: `1px solid ${filterReady ? '#f59e0b' : '#e0dbd2'}`, borderRadius: 8, padding: '8px 14px', fontSize: 13, color: filterReady ? '#d97706' : '#666', cursor: 'pointer', fontWeight: filterReady ? 600 : 400 }}
            >
              {filterReady ? '🎁 Reward ready only' : 'All customers'}
            </button>
            <span style={{ fontSize: 12, color: '#aaa', marginLeft: 'auto' }}>
              Showing {filtered.length} of {summary.totalCustomers} customers
            </span>
          </div>

          {/* Customer table */}
          <div style={{ background: '#fff', border: '1px solid #ede8e0', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                <thead>
                  <tr>
                    <th style={th} onClick={() => toggleSort('name')}>
                      Customer {sortBy === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th style={{ ...th, cursor: 'default' }}>Progress</th>
                    <th style={th} onClick={() => toggleSort('totalStamps')}>
                      Total Stamps {sortBy === 'totalStamps' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th style={{ ...th, cursor: 'default' }}>Rewards</th>
                    <th style={th} onClick={() => toggleSort('lastVisit')}>
                      Last Visit {sortBy === 'lastVisit' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th style={th} onClick={() => toggleSort('joinedAt')}>
                      Joined {sortBy === 'joinedAt' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ ...td, textAlign: 'center', color: '#bbb', padding: '3rem' }}>
                        No customers found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c, i) => {
                      const pct = Math.min(100, Math.round((c.activeStamps / shop.stampGoal) * 100))
                      return (
                        <tr key={c.phone + i} style={{ background: c.isRewardReady ? '#fffbeb' : 'transparent' }}>
                          <td style={td}>
                            <div style={{ fontWeight: 500 }}>{c.name || <span style={{ color: '#bbb', fontStyle: 'italic', fontWeight: 400 }}>No name</span>}</div>
                            <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>{c.phone}</div>
                          </td>
                          <td style={{ ...td, minWidth: 140 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, height: 5, background: '#f0ece4', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: c.isRewardReady ? '#f59e0b' : '#e8a24b', borderRadius: 3 }} />
                              </div>
                              <span style={{ fontSize: 11, color: '#aaa', whiteSpace: 'nowrap' }}>
                                {Math.min(c.activeStamps, shop.stampGoal)}/{shop.stampGoal}
                                {c.isRewardReady && ' 🎁'}
                              </span>
                            </div>
                          </td>
                          <td style={{ ...td, fontWeight: 600, color: '#c97a20' }}>{c.totalStamps}</td>
                          <td style={{ ...td, color: '#666' }}>{c.totalRedemptions}</td>
                          <td style={{ ...td, color: '#888', fontSize: 12 }}>{fmtDate(c.lastVisit)}</td>
                          <td style={{ ...td, color: '#bbb', fontSize: 12 }}>{fmtDate(c.joinedAt)}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Print footer */}
          <div style={{ marginTop: '1.5rem', display: 'none', textAlign: 'center', color: '#bbb', fontSize: 12, borderTop: '1px solid #e0dbd2', paddingTop: '1rem' }} className="print-footer">
            BrewPass · Digital Loyalty for Nepal · {shop.name} · Stamp goal: {shop.stampGoal} stamps = {shop.reward}
          </div>
        </div>
      </div>
    </>
  )
}
