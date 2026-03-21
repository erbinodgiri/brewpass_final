'use client'
import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Stats {
  totalCustomers: number
  totalStamps: number
  totalRedeemed: number
  stampsLast30: number
  customersLast30: number
  chartData: { date: string; stamps: number }[]
  topCustomers: { id: string; name: string | null; phone: string; totalStamps: number }[]
}

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #ede8e0', borderRadius: 12, padding: '1.25rem 1.5rem' }}>
      <div style={{ fontSize: 11, color: '#aaa', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1208', fontFamily: 'Georgia, serif' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#bbb', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats').then(r => r.json()).then(d => {
      if (d.success) setStats(d.data)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#aaa', fontSize: 14 }}>
      Loading…
    </div>
  )
  if (!stats) return null

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#1a1208', margin: 0 }}>Overview</h1>
        <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Your loyalty program at a glance</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Customers" value={stats.totalCustomers} sub={`+${stats.customersLast30} this month`} />
        <StatCard label="Total Stamps" value={stats.totalStamps} sub={`${stats.stampsLast30} in 30 days`} />
        <StatCard label="Rewards Redeemed" value={stats.totalRedeemed} />
        <StatCard label="Avg Stamps/Customer" value={stats.totalCustomers > 0 ? Math.round(stats.totalStamps / stats.totalCustomers) : 0} />
      </div>

      {/* Chart */}
      <div style={{ background: '#fff', border: '1px solid #ede8e0', borderRadius: 12, padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1208', marginBottom: '1rem' }}>Stamps — last 30 days</div>
        {stats.chartData.every(d => d.stamps === 0) ? (
          <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 14 }}>No stamp activity yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#bbb' }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: '#bbb' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #ede8e0', borderRadius: 8, fontSize: 13 }} />
              <Line type="monotone" dataKey="stamps" stroke="#e8a24b" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#e8a24b' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top customers */}
      <div style={{ background: '#fff', border: '1px solid #ede8e0', borderRadius: 12, padding: '1.5rem' }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1208', marginBottom: '1rem' }}>Top customers</div>
        {stats.topCustomers.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#ccc', fontSize: 14 }}>
            No customers yet — start adding stamps!
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0ece4' }}>
                <th style={{ textAlign: 'left', padding: '8px 0', color: '#aaa', fontWeight: 500, fontSize: 12 }}>Customer</th>
                <th style={{ textAlign: 'right', padding: '8px 0', color: '#aaa', fontWeight: 500, fontSize: 12 }}>Stamps</th>
              </tr>
            </thead>
            <tbody>
              {stats.topCustomers.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f8f5f0' }}>
                  <td style={{ padding: '10px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#f0ece4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#c97a20', flexShrink: 0 }}>{i + 1}</div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{c.name || <span style={{ color: '#aaa', fontStyle: 'italic' }}>No name</span>}</div>
                      <div style={{ fontSize: 12, color: '#bbb' }}>{c.phone}</div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#c97a20' }}>{c.totalStamps} ☕</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
