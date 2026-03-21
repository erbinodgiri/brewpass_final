'use client'
import Link from 'next/link'
import { useState } from 'react'

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{ background: '#1a1208', border: '0.5px solid rgba(232,162,75,0.15)', borderRadius: 16, padding: '1.5rem' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(232,162,75,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: '1rem' }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 500, color: '#f5ede0', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'rgba(245,237,224,0.5)', lineHeight: 1.6 }}>{desc}</div>
    </div>
  )
}

function PlanCard({ name, price, sub, features, highlight }: { name: string; price: string; sub: string; features: string[]; highlight?: boolean }) {
  return (
    <div style={{ background: '#1a1208', border: highlight ? '1.5px solid #e8a24b' : '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.75rem', position: 'relative' }}>
      {highlight && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#e8a24b', color: '#0e0a06', fontSize: 11, fontWeight: 600, padding: '3px 14px', borderRadius: 50, whiteSpace: 'nowrap' }}>Most popular</div>}
      <div style={{ fontSize: 12, color: 'rgba(245,237,224,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{name}</div>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 700, color: '#f5ede0', marginBottom: 2 }}>{price}</div>
      <div style={{ fontSize: 12, color: 'rgba(245,237,224,0.4)', marginBottom: '1.25rem' }}>{sub}</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: 'rgba(245,237,224,0.65)', lineHeight: 2.2 }}>
        {features.map(f => <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#e8a24b' }}>✓</span>{f}</li>)}
      </ul>
    </div>
  )
}

export default function LandingPage() {
  const [waitlist, setWaitlist] = useState('')
  const [joined, setJoined] = useState(false)

  const root: React.CSSProperties = { minHeight: '100vh', background: '#0e0a06', color: '#f5ede0', fontFamily: 'system-ui, sans-serif', overflowX: 'hidden' }
  const btnPrimary: React.CSSProperties = { background: '#e8a24b', color: '#0e0a06', border: 'none', padding: '13px 28px', borderRadius: 50, fontSize: 15, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }
  const btnOutline: React.CSSProperties = { background: 'transparent', color: '#f5ede0', border: '0.5px solid rgba(245,237,224,0.25)', padding: '13px 28px', borderRadius: 50, fontSize: 15, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }

  return (
    <div style={root}>
      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: '#e8a24b' }}>Brew<span style={{ color: '#f5ede0' }}>Pass</span></span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/login" style={{ color: 'rgba(245,237,224,0.6)', fontSize: 14, textDecoration: 'none' }}>Sign in</Link>
          <Link href="/register" style={{ ...btnPrimary, padding: '8px 18px', fontSize: 13 }}>Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '5rem 2rem 3rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: 'rgba(232,162,75,0.1)', color: '#e8a24b', border: '0.5px solid rgba(232,162,75,0.3)', borderRadius: 50, padding: '5px 16px', fontSize: 12, fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          Made for Nepal&apos;s coffee shops
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2.2rem,5vw,4rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.25rem', margin: '0 0 1.25rem' }}>
          Your stamp card,<br /><em style={{ color: '#e8a24b', fontStyle: 'italic' }}>upgraded.</em>
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(245,237,224,0.55)', lineHeight: 1.7, maxWidth: 540, margin: '0 auto 2rem' }}>
          Replace paper loyalty cards with a smart QR system. Customers never lose their stamps. You finally know who keeps coming back.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" style={btnPrimary}>Start for free →</Link>
          <Link href="/login" style={btnOutline}>Sign in to dashboard</Link>
        </div>
      </section>

      {/* Card preview */}
      <div style={{ maxWidth: 560, margin: '0 auto 5rem', padding: '0 2rem' }}>
        <div style={{ background: '#1a1208', border: '0.5px solid rgba(232,162,75,0.2)', borderRadius: 20, padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'rgba(245,237,224,0.3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: '1.25rem' }}>Customer&apos;s digital loyalty card</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} style={{ width: 48, height: 48, borderRadius: 11, background: i < 5 ? '#e8a24b' : 'rgba(255,255,255,0.05)', border: i >= 5 ? '0.5px solid rgba(255,255,255,0.1)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: i < 5 ? 20 : 11, color: i === 6 ? 'rgba(232,162,75,0.5)' : '#fff', fontWeight: 500 }}>
                {i < 5 ? '☕' : i === 6 ? 'FREE' : ''}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(245,237,224,0.4)', marginBottom: '1rem' }}>Sita Sharma · 5 of 7 stamps</div>
          <hr style={{ border: 'none', borderTop: '0.5px solid rgba(255,255,255,0.06)', margin: '1rem 0' }} />
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', fontSize: 12, color: 'rgba(245,237,224,0.35)', flexWrap: 'wrap' }}>
            <span><span style={{ color: '#e74c3c' }}>●</span> Paper: lost, faked, no data</span>
            <span><span style={{ color: '#27ae60' }}>●</span> BrewPass: tracked, verified</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 2rem 5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: 11, color: '#e8a24b', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Features</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem,3vw,2.5rem)', fontWeight: 700, margin: 0, color: '#f5ede0' }}>Everything a coffee shop needs</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1.25rem' }}>
          <FeatureCard icon="📲" title="Scan & stamp in seconds" desc="Customer scans your QR — no app install. Works on any smartphone browser." />
          <FeatureCard icon="📊" title="Know your regulars" desc="See who visits most, peak hours, and redemption rates from a simple dashboard." />
          <FeatureCard icon="🔒" title="No fake stamps" desc="Every stamp is logged digitally. No more fraudulent cards or staff misuse." />
          <FeatureCard icon="🎁" title="Reward redemption" desc="Staff redeems rewards with one tap when a customer hits their stamp goal." />
          <FeatureCard icon="🔍" title="Customer search" desc="Find any customer by name or phone. See their full stamp history instantly." />
          <FeatureCard icon="🇳🇵" title="Built for Nepal" desc="No credit card to start. Works on basic smartphones. Nepali-friendly." />
        </div>
      </section>

      {/* Pricing */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 2rem 5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: 11, color: '#e8a24b', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Pricing</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem,3vw,2.5rem)', fontWeight: 700, margin: 0, color: '#f5ede0' }}>Starts free, grows with you</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.25rem' }}>
          <PlanCard name="Free" price="NPR 0" sub="forever" features={['Up to 50 customers','QR stamp system','Basic dashboard']} />
          <PlanCard name="Basic" price="NPR 1,500" sub="per month" features={['Unlimited customers','Visit analytics','Customer search','1 location']} highlight />
          <PlanCard name="Pro" price="NPR 3,500" sub="per month" features={['Everything in Basic','Bulk messaging','Multiple branches','Advanced reports']} />
        </div>
      </section>

      {/* Waitlist CTA */}
      <section style={{ background: '#1a1208', borderTop: '0.5px solid rgba(232,162,75,0.15)', borderBottom: '0.5px solid rgba(232,162,75,0.15)', padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem,3vw,2.5rem)', fontWeight: 700, marginBottom: 8, color: '#f5ede0', margin: '0 0 8px' }}>Ready to ditch the stamp card?</h2>
        <p style={{ color: 'rgba(245,237,224,0.5)', fontSize: 15, marginBottom: '1.75rem' }}>Join the waitlist — we&apos;ll onboard your café first.</p>
        {joined ? (
          <p style={{ color: '#e8a24b', fontSize: 15, fontWeight: 500 }}>🎉 Thanks! We&apos;ll be in touch soon.</p>
        ) : (
          <div style={{ display: 'flex', maxWidth: 420, margin: '0 auto', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <input value={waitlist} onChange={e => setWaitlist(e.target.value)} placeholder="Phone number or email" style={{ flex: 1, minWidth: 200, padding: '12px 18px', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 50, color: '#f5ede0', fontSize: 14, outline: 'none' }} />
            <button onClick={async () => { if (waitlist.trim()) { await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contact: waitlist.trim() }) }).catch(() => {}); setJoined(true) } }} style={btnPrimary}>Join waitlist</button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '2.5rem 2rem', borderTop: '0.5px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: '#e8a24b', marginBottom: 6 }}>Brew<span style={{ color: '#f5ede0' }}>Pass</span></div>
        <p style={{ fontSize: 13, color: 'rgba(245,237,224,0.25)', margin: 0 }}>Built in Nepal, for Nepal&apos;s coffee culture. 🇳🇵</p>
      </footer>
    </div>
  )
}
