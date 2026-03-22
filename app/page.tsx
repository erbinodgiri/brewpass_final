'use client'
import Link from 'next/link'
import { useState } from 'react'

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{ background: '#1a1208', border: '0.5px solid rgba(232,162,75,0.15)', borderRadius: 16, padding: '1.5rem' }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(232,162,75,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: '1rem' }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#f5ede0', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'rgba(245,237,224,0.5)', lineHeight: 1.7 }}>{desc}</div>
    </div>
  )
}

function PlanCard({ name, price, sub, features, highlight }: { name: string; price: string; sub: string; features: string[]; highlight?: boolean }) {
  return (
    <div style={{ background: '#1a1208', border: highlight ? '1.5px solid #e8a24b' : '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.75rem', position: 'relative' }}>
      {highlight && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#e8a24b', color: '#0e0a06', fontSize: 11, fontWeight: 700, padding: '3px 14px', borderRadius: 50, whiteSpace: 'nowrap' }}>Most popular</div>}
      <div style={{ fontSize: 12, color: 'rgba(245,237,224,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{name}</div>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 700, color: '#f5ede0', marginBottom: 2 }}>{price}</div>
      <div style={{ fontSize: 12, color: 'rgba(245,237,224,0.4)', marginBottom: '1.5rem' }}>{sub}</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: 'rgba(245,237,224,0.7)', lineHeight: 2.2 }}>
        {features.map(f => <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#e8a24b', fontWeight: 700 }}>✓</span>{f}</li>)}
      </ul>
    </div>
  )
}

export default function LandingPage() {
  const [waitlist, setWaitlist] = useState('')
  const [joined, setJoined] = useState(false)

  const root: React.CSSProperties = { minHeight: '100vh', background: '#0e0a06', color: '#f5ede0', fontFamily: 'system-ui, -apple-system, sans-serif', overflowX: 'hidden' }
  const btnPrimary: React.CSSProperties = { background: '#e8a24b', color: '#0e0a06', border: 'none', padding: '13px 28px', borderRadius: 50, fontSize: 15, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'inline-block', whiteSpace: 'nowrap' }
  const btnOutline: React.CSSProperties = { background: 'transparent', color: '#f5ede0', border: '0.5px solid rgba(245,237,224,0.3)', padding: '13px 28px', borderRadius: 50, fontSize: 15, fontWeight: 500, cursor: 'pointer', textDecoration: 'none', display: 'inline-block', whiteSpace: 'nowrap' }

  return (
    <div style={root}>
      <style>{`
        * { box-sizing: border-box; }
        @media (max-width: 600px) {
          .hero-title { font-size: 2.2rem !important; }
          .hero-btns { flex-direction: column !important; align-items: stretch !important; }
          .hero-btns a, .hero-btns button { text-align: center; width: 100%; }
          .nav-inner { padding: 1rem 1.25rem !important; }
          .section-pad { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
          .how-steps { flex-direction: column !important; }
          .how-connector { display: none !important; }
          .compare-grid { grid-template-columns: 1fr !important; }
          .waitlist-row { flex-direction: column !important; }
          .waitlist-row input { width: 100% !important; }
        }
        @media (max-width: 400px) {
          .hero-title { font-size: 1.9rem !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(14,10,6,0.92)', backdropFilter: 'blur(12px)', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
        <div className="nav-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: '#e8a24b' }}>Brew<span style={{ color: '#f5ede0' }}>Pass</span></span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link href="/login" style={{ color: 'rgba(245,237,224,0.6)', fontSize: 14, textDecoration: 'none', padding: '8px 12px' }}>Sign in</Link>
            <Link href="/register" style={{ ...btnPrimary, padding: '9px 18px', fontSize: 13 }}>Get started free</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="section-pad" style={{ maxWidth: 900, margin: '0 auto', padding: '4.5rem 2rem 2.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(232,162,75,0.1)', color: '#e8a24b', border: '0.5px solid rgba(232,162,75,0.3)', borderRadius: 50, padding: '5px 16px', fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          🇳🇵 Made for Nepal&apos;s coffee shops
        </div>

        <h1 className="hero-title" style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2.2rem,5vw,3.8rem)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 1.25rem', color: '#f5ede0' }}>
          Your stamp card,<br /><em style={{ color: '#e8a24b', fontStyle: 'italic' }}>upgraded.</em>
        </h1>

        <p style={{ fontSize: 'clamp(15px,2.5vw,18px)', color: 'rgba(245,237,224,0.6)', lineHeight: 1.75, maxWidth: 560, margin: '0 auto 1rem' }}>
          Replace paper stamp cards with a smart digital system. Customers scan a QR code — no app needed. Staff approves each stamp. You finally see who&apos;s coming back.
        </p>

        {/* Trust line */}
        <p style={{ fontSize: 13, color: 'rgba(245,237,224,0.35)', marginBottom: '2rem' }}>
          Free to start · No credit card · Works on any phone
        </p>

        <div className="hero-btns" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" style={btnPrimary}>Start for free →</Link>
          <Link href="/login" style={btnOutline}>Sign in to dashboard</Link>
        </div>
      </section>

      {/* ── BEFORE / AFTER VISUAL ── */}
      <section className="section-pad" style={{ maxWidth: 700, margin: '0 auto', padding: '0 2rem 4rem' }}>
        <div className="compare-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Before */}
          <div style={{ background: '#1a0c0c', border: '0.5px solid rgba(220,50,50,0.25)', borderRadius: 14, padding: '1.25rem' }}>
            <div style={{ fontSize: 11, color: '#f87171', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 12 }}>❌ Paper card problems</div>
            {['Customers lose the card', 'Cards get faked or forged', 'No data on who visits', 'Staff gives stamps unfairly', 'Cards wear out and fade'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(245,237,224,0.5)', marginBottom: 8 }}>
                <span style={{ color: '#f87171', fontSize: 16, flexShrink: 0 }}>✗</span>{t}
              </div>
            ))}
          </div>
          {/* After */}
          <div style={{ background: '#0c1a0c', border: '0.5px solid rgba(34,197,94,0.25)', borderRadius: 14, padding: '1.25rem' }}>
            <div style={{ fontSize: 11, color: '#4ade80', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 12 }}>✅ BrewPass solution</div>
            {['Stored by phone number', 'Every stamp needs approval', 'Full customer dashboard', 'Staff approval required', 'Permanent digital record'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(245,237,224,0.65)', marginBottom: 8 }}>
                <span style={{ color: '#4ade80', fontSize: 16, flexShrink: 0 }}>✓</span>{t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section-pad" style={{ maxWidth: 1000, margin: '0 auto', padding: '0 2rem 5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: 11, color: '#e8a24b', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, fontWeight: 600 }}>How it works</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 700, margin: 0, color: '#f5ede0' }}>Three simple steps</h2>
        </div>

        <div className="how-steps" style={{ display: 'flex', alignItems: 'flex-start', gap: 0, justifyContent: 'center' }}>
          {[
            { step: '1', icon: '📲', title: 'Customer scans QR', desc: 'They scan your QR code at the counter and enter their phone number. No app to download.' },
            { step: '2', icon: '✅', title: 'Staff approves', desc: 'Your phone shows the request. You verify they\'re at the counter and tap Approve.' },
            { step: '3', icon: '🎁', title: 'Stamp is added', desc: 'The customer\'s card updates instantly. When they hit 7 stamps, they earn a free reward.' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div style={{ background: '#1a1208', border: '0.5px solid rgba(232,162,75,0.2)', borderRadius: 16, padding: '1.5rem', maxWidth: 240, textAlign: 'center', flex: 1 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(232,162,75,0.12)', border: '1.5px solid rgba(232,162,75,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 22 }}>{item.icon}</div>
                <div style={{ fontSize: 11, color: '#e8a24b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Step {item.step}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#f5ede0', marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(245,237,224,0.5)', lineHeight: 1.65 }}>{item.desc}</div>
              </div>
              {i < 2 && (
                <div className="how-connector" style={{ fontSize: 22, color: 'rgba(232,162,75,0.3)', padding: '1.5rem 0.5rem', marginTop: 24, flexShrink: 0 }}>→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVE CARD DEMO ── */}
      <section className="section-pad" style={{ maxWidth: 560, margin: '0 auto', padding: '0 2rem 5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 11, color: '#e8a24b', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, fontWeight: 600 }}>Live preview</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 700, margin: '0 0 8px', color: '#f5ede0' }}>This is what your customer sees</h2>
          <p style={{ fontSize: 14, color: 'rgba(245,237,224,0.4)', margin: 0 }}>A digital stamp card — on their phone, no app needed</p>
        </div>

        <div style={{ background: '#1a1208', border: '0.5px solid rgba(232,162,75,0.2)', borderRadius: 20, padding: '1.75rem' }}>
          {/* Card header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#e8a24b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>☕</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#f5ede0' }}>Cafe Piccolo</div>
              <div style={{ fontSize: 11, color: 'rgba(245,237,224,0.4)' }}>Thamel, Kathmandu</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: '#e8a24b', background: 'rgba(232,162,75,0.1)', border: '1px solid rgba(232,162,75,0.3)', borderRadius: 6, padding: '3px 10px' }}>5 / 7</div>
          </div>

          {/* Physical card style */}
          <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(232,162,75,0.2)' }}>
            <div style={{ height: 10, background: 'repeating-linear-gradient(90deg, #e8a24bcc 0px, #e8a24b66 8px, #e8a24b33 12px, #e8a24bcc 16px)' }} />
            <div style={{ background: '#f8f4ee', padding: '10px 12px 12px' }}>
              <div style={{ background: '#fff', border: '1px solid #d4c9b8', borderRadius: 4, padding: '3px 8px', marginBottom: 8, fontSize: 12, color: '#1a1208', fontWeight: 600 }}>
                <span style={{ color: '#999', fontWeight: 500 }}>Name: </span>Sita Sharma
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                {Array.from({ length: 7 }).map((_, i) => {
                  const isFree = i === 6
                  const filled = i < 5
                  return (
                    <div key={i} style={{ aspectRatio: '1', borderRadius: 6, background: isFree ? '#e8a24b' : filled ? 'rgba(232,162,75,0.15)' : '#fff', border: `1.5px solid ${filled || isFree ? '#e8a24b' : '#c8bfb0'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: filled ? 16 : 9 }}>
                      {isFree ? <><div style={{ fontSize: 14 }}>☕</div><div style={{ fontSize: 8, fontWeight: 900, color: '#0e0a06', letterSpacing: 0.3 }}>FREE</div></> : filled ? '☕' : ''}
                    </div>
                  )
                })}
              </div>
              <div style={{ textAlign: 'center', fontSize: 11, color: '#888', marginTop: 8 }}>2 more stamps for free coffee</div>
            </div>
            <div style={{ height: 10, background: 'repeating-linear-gradient(90deg, #e8a24bcc 0px, #e8a24b66 8px, #e8a24b33 12px, #e8a24bcc 16px)' }} />
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: 20, fontSize: 12, color: 'rgba(245,237,224,0.35)' }}>
            <span>☕ 5 active stamps</span>
            <span>🎁 2 rewards redeemed</span>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section-pad" style={{ maxWidth: 1000, margin: '0 auto', padding: '0 2rem 5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: 11, color: '#e8a24b', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, fontWeight: 600 }}>Features</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 700, margin: 0, color: '#f5ede0' }}>Everything a coffee shop needs</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <FeatureCard icon="📲" title="Scan & stamp in seconds" desc="Customer scans your QR — no app install needed. Works on any smartphone browser instantly." />
          <FeatureCard icon="📊" title="Know your regulars" desc="See who visits most, busiest hours, and redemption rates from a simple dashboard." />
          <FeatureCard icon="🔒" title="No fake stamps" desc="Every stamp needs staff approval. No more fraudulent cards or customers cheating the system." />
          <FeatureCard icon="🎁" title="Reward redemption" desc="Staff redeems rewards with one tap when a customer completes their stamp card." />
          <FeatureCard icon="📶" title="WiFi QR code" desc="Generate a WiFi QR code so customers connect to your network without asking for the password." />
          <FeatureCard icon="🇳🇵" title="Built for Nepal" desc="Prices in NPR. Works on basic smartphones. No credit card to start. Made for Nepali cafes." />
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="section-pad" style={{ maxWidth: 800, margin: '0 auto', padding: '0 2rem 5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: 11, color: '#e8a24b', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, fontWeight: 600 }}>Pricing</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 700, margin: '0 0 10px', color: '#f5ede0' }}>Starts free, grows with you</h2>
          <p style={{ fontSize: 14, color: 'rgba(245,237,224,0.4)', margin: 0 }}>Start free, no credit card required. Upgrade anytime.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <PlanCard name="Free" price="NPR 0" sub="forever" features={['Up to 50 customers', 'QR stamp system', 'Basic dashboard', 'WiFi QR code']} />
          <PlanCard name="Basic" price="NPR 1,500" sub="per month" features={['Unlimited customers', 'Visit analytics', 'Customer search', 'Menu display', '1 location']} highlight />
          <PlanCard name="Pro" price="NPR 3,500" sub="per month" features={['Everything in Basic', 'Multiple branches', 'Advanced reports', 'Priority support']} />
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section-pad" style={{ maxWidth: 680, margin: '0 auto', padding: '0 2rem 5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: 11, color: '#e8a24b', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, fontWeight: 600 }}>FAQ</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 700, margin: 0, color: '#f5ede0' }}>Common questions</h2>
        </div>
        {[
          { q: 'Do customers need to download an app?', a: 'No. Customers just scan your QR code with their phone camera and the page opens in their browser instantly.' },
          { q: 'Can customers cheat by scanning from home?', a: 'No. Every stamp request needs physical approval from your staff. Customers scan, then show their screen to you. You tap Approve only when they\'re at the counter.' },
          { q: 'What if a customer changes their phone number?', a: 'Their stamps are saved to their phone number. If they get a new number, you can manually transfer their stamps from the Customers page.' },
          { q: 'Can I use this for hookah, momo, or other businesses?', a: 'Yes. BrewPass works for any business that wants a loyalty stamp system — cafe, restaurant, hookah bar, bakery, or any shop.' },
          { q: 'What happens when I reach 50 customers on Free plan?', a: 'Existing customers can still earn and redeem stamps. New customers cannot be added until you upgrade to Basic or Pro plan.' },
        ].map((faq, i) => (
          <div key={i} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.07)', padding: '1.25rem 0' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#f5ede0', marginBottom: 8 }}>{faq.q}</div>
            <div style={{ fontSize: 14, color: 'rgba(245,237,224,0.5)', lineHeight: 1.7 }}>{faq.a}</div>
          </div>
        ))}
      </section>

      {/* ── WAITLIST CTA ── */}
      <section style={{ background: '#1a1208', borderTop: '0.5px solid rgba(232,162,75,0.15)', borderBottom: '0.5px solid rgba(232,162,75,0.15)', padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>☕</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 700, margin: '0 0 10px', color: '#f5ede0' }}>Ready to ditch the paper card?</h2>
          <p style={{ color: 'rgba(245,237,224,0.5)', fontSize: 15, marginBottom: '1.75rem', lineHeight: 1.7 }}>
            Join the waitlist — we&apos;ll help you get set up first. Or go ahead and create your free account right now.
          </p>
          <div style={{ marginBottom: '1.5rem' }}>
            <Link href="/register" style={{ ...btnPrimary, fontSize: 16, padding: '14px 36px' }}>Create free account →</Link>
          </div>
          {joined ? (
            <p style={{ color: '#e8a24b', fontSize: 14, fontWeight: 500 }}>🎉 You&apos;re on the waitlist! We&apos;ll be in touch soon.</p>
          ) : (
            <>
              <p style={{ fontSize: 13, color: 'rgba(245,237,224,0.3)', marginBottom: 10 }}>Or join the waitlist for a guided onboarding:</p>
              <div className="waitlist-row" style={{ display: 'flex', maxWidth: 420, margin: '0 auto', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                <input value={waitlist} onChange={e => setWaitlist(e.target.value)} placeholder="Your phone or email" style={{ flex: 1, minWidth: 200, padding: '12px 18px', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 50, color: '#f5ede0', fontSize: 14, outline: 'none' }} />
                <button onClick={async () => { if (waitlist.trim()) { await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contact: waitlist.trim() }) }).catch(() => {}); setJoined(true) } }} style={btnPrimary}>Join waitlist</button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ textAlign: 'center', padding: '2.5rem 2rem', borderTop: '0.5px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#e8a24b', marginBottom: 8 }}>Brew<span style={{ color: '#f5ede0' }}>Pass</span></div>
        <p style={{ fontSize: 13, color: 'rgba(245,237,224,0.25)', margin: '0 0 12px' }}>Digital loyalty for Nepal&apos;s coffee culture 🇳🇵</p>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" style={{ fontSize: 13, color: 'rgba(245,237,224,0.35)', textDecoration: 'none' }}>Register your cafe</Link>
          <Link href="/login" style={{ fontSize: 13, color: 'rgba(245,237,224,0.35)', textDecoration: 'none' }}>Sign in</Link>
          <Link href="/admin" style={{ fontSize: 13, color: 'rgba(245,237,224,0.2)', textDecoration: 'none' }}>Admin</Link>
        </div>
      </footer>
    </div>
  )
}