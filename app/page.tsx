'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'

/* ─────────────────────────────────────────
   Design tokens
───────────────────────────────────────── */
const C = {
  surface:   '#0f0c08',
  card:      '#131008',
  gold:      '#e8a24b',
  goldSoft:  'rgba(232,162,75,0.12)',
  goldBorder:'rgba(232,162,75,0.18)',
  goldDim:   'rgba(232,162,75,0.5)',
  goldGrad:  'linear-gradient(90deg, #e8a24b, #f4b966)',
  darkText:  '#0a0700',
  text:      '#f0e8d8',
  muted:     'rgba(240,232,216,0.45)',
  faint:     'rgba(240,232,216,0.22)',
}

/* Static data — defined outside component to avoid recreating on every render */
const STATS = [
  { value: 'Zero',          label: 'App downloads',      note: 'just a phone camera' },
  { value: 'Staff-verified', label: 'Every single stamp', note: 'no fakes possible' },
  { value: 'Any phone',     label: 'Works on',            note: 'iOS, Android, basic' },
  { value: 'Free forever',  label: 'Getting started',     note: 'up to 50 customers' },
]
const HERO_PILLS = ['Free to start', 'No app download', 'Any smartphone', '5 min setup']
const HOW_STEPS = [
  { n: '01', icon: '📲', title: 'Customer scans QR',    desc: 'Camera scan opens the card instantly. Customer enters their phone number. Zero app install.' },
  { n: '02', icon: '✅', title: 'Staff approves',       desc: "You get a notification. Verify they're at the counter, then tap Approve in 2 seconds." },
  { n: '03', icon: '🎁', title: 'Card updates live',    desc: 'Stamp added in real time. After 7, they earn your reward — free coffee, discount, or anything.' },
]
const PAPER_PROBLEMS = ['Customers lose the card', 'Easy to fake or forge', 'Zero data on customers', 'Staff stamps unfairly', 'Cards wear and fade', 'Nothing stops cheating']
const BP_BENEFITS    = ['Stored by phone number', 'Every stamp staff-approved', 'Full customer analytics', 'Audit trail for every stamp', 'Permanent digital record', '10-min cooldown stops spam']

/* ─────────────────────────────────────────
   Reusable components
───────────────────────────────────────── */
function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <div style={{ width: 20, height: 1, background: C.goldDim }} />
      <span style={{ fontSize: 11, color: C.gold, textTransform: 'uppercase', letterSpacing: 3, fontWeight: 700 }}>{children}</span>
      <div style={{ width: 20, height: 1, background: C.goldDim }} />
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="feature-card" style={{
      background: `linear-gradient(160deg, ${C.card} 0%, #0e0a06 100%)`,
      border: `1px solid ${C.goldBorder}`,
      borderRadius: 20,
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${C.goldSoft}, transparent)` }} />
      <div style={{ width: 48, height: 48, borderRadius: 14, background: C.goldSoft, border: `1px solid ${C.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: '1rem' }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 7, lineHeight: 1.3 }}>{title}</div>
      <div style={{ fontSize: 13, color: C.faint, lineHeight: 1.8 }}>{desc}</div>
    </div>
  )
}

function PlanCard({ name, price, sub, features, highlight, cta }: {
  name: string; price: string; sub: string; features: string[]; highlight?: boolean; cta: string
}) {
  return (
    <div style={{
      background: highlight ? 'linear-gradient(160deg, #1e1408 0%, #160f07 100%)' : C.card,
      border: highlight ? `1.5px solid rgba(232,162,75,0.5)` : `1px solid rgba(255,255,255,0.07)`,
      borderRadius: 24,
      padding: '2rem 1.75rem',
      position: 'relative',
      boxShadow: highlight ? '0 0 60px rgba(232,162,75,0.07), 0 24px 80px rgba(0,0,0,0.4)' : '0 8px 40px rgba(0,0,0,0.25)',
      flexShrink: 0,
      width: 260,
    }}>
      {highlight && (
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #e8a24b, transparent)', borderRadius: '24px 24px 0 0' }} />
          <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: C.goldGrad, color: C.darkText, fontSize: 10, fontWeight: 800, padding: '4px 16px', borderRadius: 50, whiteSpace: 'nowrap', letterSpacing: 1 }}>MOST POPULAR</div>
        </>
      )}
      <div style={{ fontSize: 10, color: C.faint, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, fontWeight: 700 }}>{name}</div>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: '2.1rem', fontWeight: 800, color: C.text, lineHeight: 1, marginBottom: 4 }}>{price}</div>
      <div style={{ fontSize: 12, color: C.faint, marginBottom: '1.75rem' }}>{sub}</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem' }}>
        {features.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'rgba(240,232,216,0.6)', marginBottom: 11, lineHeight: 1.4 }}>
            <span style={{ width: 17, height: 17, borderRadius: '50%', background: C.goldSoft, border: `1px solid ${C.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 9, color: C.gold, fontWeight: 800, marginTop: 1 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <Link href="/register" style={{ display: 'block', textAlign: 'center', background: highlight ? C.goldGrad : 'rgba(232,162,75,0.07)', color: highlight ? C.darkText : C.gold, border: highlight ? 'none' : `1px solid ${C.goldBorder}`, borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, textDecoration: 'none', letterSpacing: 0.2 }}>
        {cta}
      </Link>
    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', background: 'none', border: 'none', padding: '1.25rem 0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, textAlign: 'left', WebkitTapHighlightColor: 'transparent' }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: C.text, lineHeight: 1.5 }}>{q}</span>
        <span style={{ width: 26, height: 26, borderRadius: '50%', background: open ? C.goldSoft : 'rgba(255,255,255,0.04)', border: `1px solid ${open ? C.goldBorder : 'rgba(255,255,255,0.07)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: C.gold, fontSize: 16, transition: 'transform 0.25s, background 0.2s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      <div style={{ overflow: 'hidden', maxHeight: open ? 400 : 0, transition: 'max-height 0.35s ease', fontSize: 14, color: C.faint, lineHeight: 1.85, paddingBottom: open ? '1.25rem' : 0 }}>
        {a}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Main page
───────────────────────────────────────── */
export default function LandingPage() {
  const [waitlist, setWaitlist] = useState('')
  const [joined, setJoined] = useState(false)
  const [waitlistLoading, setWaitlistLoading] = useState(false)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => setShowStickyBar(!e.isIntersecting), { threshold: 0 })
    if (heroRef.current) ob.observe(heroRef.current)
    return () => ob.disconnect()
  }, [])

  const joinWaitlist = async () => {
    if (!waitlist.trim() || waitlistLoading) return
    setWaitlistLoading(true)
    await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contact: waitlist.trim() }) }).catch(() => {})
    setJoined(true)
    setWaitlistLoading(false)
  }

  const btnPrimary: React.CSSProperties = {
    background: C.goldGrad, color: C.darkText, border: 'none', borderRadius: 14, fontWeight: 800,
    cursor: 'pointer', textDecoration: 'none', display: 'inline-block',
    letterSpacing: 0.2, boxShadow: '0 4px 28px rgba(232,162,75,0.32)',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090705', color: C.text, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', overflowX: 'hidden' }}>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        @keyframes fadeUp   { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float    { 0%,100% { transform:translateY(0) rotate(0deg); } 50% { transform:translateY(-10px) rotate(0.4deg); } }
        @keyframes slideUp  { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
        @keyframes orb      { 0%,100% { transform:scale(1) translate(0,0); } 50% { transform:scale(1.08) translate(20px,-10px); } }

        .anim-1 { animation: fadeUp 0.65s ease-out both; }
        .anim-2 { animation: fadeUp 0.65s ease-out 0.1s both; }
        .anim-3 { animation: fadeUp 0.65s ease-out 0.2s both; }
        .float  { animation: float 6s ease-in-out infinite; }

        .feature-card { transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease; }
        .feature-card:hover { transform: translateY(-4px); border-color: rgba(232,162,75,0.35) !important; box-shadow: 0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(232,162,75,0.1); }
        .feature-card:active { transform: scale(0.98); }

        .plan-card-hover { transition: transform 0.22s ease, box-shadow 0.22s ease; }
        .plan-card-hover:hover { transform: translateY(-4px); }

        .tap-scale:active { transform: scale(0.97) !important; transition: transform 0.1s !important; }
        * { -webkit-tap-highlight-color: transparent; }

        a:hover { opacity: 0.85; }

        .sticky-bar {
          display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
          padding: 12px 20px; padding-bottom: calc(12px + env(safe-area-inset-bottom));
          background: rgba(9,7,5,0.96); backdrop-filter: blur(24px);
          border-top: 1px solid rgba(232,162,75,0.18);
        }
        .sticky-bar.visible { animation: slideUp 0.3s ease-out both; }

        /* ── MOBILE ≤ 640 ── */
        @media (max-width: 640px) {
          .sticky-bar { display: flex; }
          .page-wrap  { padding-bottom: 80px; }
          .hero-wrap  { flex-direction: column !important; text-align: center; padding: 2.5rem 1.25rem 2rem !important; }
          .hero-right { order: -1; margin-bottom: 1.75rem; width: 100%; display: flex; justify-content: center; }
          .hero-cup { width: 72vw !important; max-width: 260px !important; height: auto !important; }
          .hero-badge { margin: 0 auto 1.25rem !important; }
          .hero-title { font-size: 2rem !important; }
          .hero-sub   { font-size: 15px !important; margin-inline: auto; }
          .hero-pills { justify-content: center !important; }
          .hero-btns  { flex-direction: column !important; width: 100%; }
          .hero-btns a { width: 100% !important; text-align: center; padding: 16px !important; font-size: 16px !important; border-radius: 14px !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .how-list   { flex-direction: column !important; gap: 0 !important; align-items: stretch !important; }
          .how-card   { max-width: 100% !important; text-align: left !important; flex-direction: row !important; gap: 1rem !important; }
          .how-icon-wrap { flex-shrink: 0 !important; margin: 0 !important; }
          .how-connector { display: none !important; }
          .how-line   { display: flex !important; }
          .compare-grid { grid-template-columns: 1fr !important; }
          .vs-divider { flex-direction: row !important; height: 32px !important; width: 100%; }
          .vs-divider .vs-line { width: auto !important; height: 1px !important; flex: 1; }
          .vs-divider .vs-line-top { background: linear-gradient(to right, transparent, rgba(232,162,75,0.3)) !important; }
          .vs-divider .vs-line-bot { background: linear-gradient(to left, transparent, rgba(232,162,75,0.3)) !important; }
          .features-grid { grid-template-columns: 1fr 1fr !important; gap: 0.75rem !important; }
          .plans-scroll { overflow-x: auto !important; scrollbar-width: none; padding-bottom: 1rem; }
          .plans-scroll::-webkit-scrollbar { display: none; }
          .plans-inner  { display: flex !important; gap: 1rem !important; width: max-content !important; padding: 0.5rem 0 !important; }
          .faq-wrap   { padding: 0 1rem !important; }
          .cta-section { padding: 3.5rem 1.25rem !important; }
          .cta-title  { font-size: 2rem !important; }
          .cta-btn    { width: 100% !important; text-align: center; padding: 16px !important; font-size: 16px !important; }
          .waitlist-row { flex-direction: column !important; }
          .waitlist-row input, .waitlist-row button { width: 100% !important; padding: 14px 20px !important; border-radius: 14px !important; }
          .footer-inner { flex-direction: column !important; align-items: center !important; text-align: center; }
          .footer-links { justify-content: center !important; }
          .section-pad  { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
          .hide-mobile  { display: none !important; }
        }

        /* ── TABLET 641–1024 ── */
        @media (min-width: 641px) and (max-width: 1024px) {
          .hero-title    { font-size: 2.8rem !important; }
          .stats-grid    { grid-template-columns: 1fr 1fr !important; }
          .features-grid { grid-template-columns: 1fr 1fr !important; }
          .plans-grid    { grid-template-columns: 1fr !important; max-width: 400px; margin-inline: auto; }
          .how-list      { flex-wrap: wrap !important; justify-content: center !important; }
        }
      `}</style>

      {/* ── Ambient background orbs — outside page-wrap so position:fixed is viewport-relative ── */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,162,75,0.045) 0%, transparent 65%)', animation: 'orb 18s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '40%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,162,75,0.03) 0%, transparent 65%)', animation: 'orb 24s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,162,75,0.025) 0%, transparent 65%)', animation: 'orb 20s ease-in-out infinite 4s' }} />
      </div>

      <div className="page-wrap" style={{ position: 'relative' }}>

        {/* ══════════════ NAV ══════════════ */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(9,7,5,0.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 2rem', maxWidth: 1160, margin: '0 auto' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg, #e8a24b, #f4b966)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, boxShadow: '0 2px 10px rgba(232,162,75,0.3)' }}>☕</div>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 900, letterSpacing: -0.5, lineHeight: 1 }}>
                <span style={{ color: C.gold }}>Brew</span><span style={{ color: C.text }}>Pass</span>
              </span>
            </Link>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Link href="/login" style={{ color: C.faint, fontSize: 14, textDecoration: 'none', padding: '8px 14px', fontWeight: 500, borderRadius: 10 }}>Sign in</Link>
              <Link href="/register" className="tap-scale" style={{ ...btnPrimary, padding: '9px 20px', fontSize: 13, borderRadius: 10, boxShadow: '0 2px 16px rgba(232,162,75,0.28)' }}>Get started free</Link>
            </div>
          </div>
        </nav>

        {/* ══════════════ HERO ══════════════ */}
        <section className="section-pad" style={{ maxWidth: 1160, margin: '0 auto', padding: '5rem 2rem 2.5rem', position: 'relative', zIndex: 1 }}>
          <div className="hero-wrap anim-1" style={{ display: 'flex', alignItems: 'center', gap: '4rem' }}>

            <div style={{ flex: 1 }}>
              <div className="hero-badge" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: C.goldSoft, color: C.gold, border: `1px solid ${C.goldBorder}`, borderRadius: 50, padding: '6px 16px', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
                  🇳🇵 Made for Nepal&apos;s cafés
                </span>
              </div>

              <h1 className="hero-title" style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.08, marginBottom: '1.2rem', color: C.text, letterSpacing: -0.5 }}>
                Digital loyalty cards<br />
                <em style={{ color: C.gold, fontStyle: 'normal' }}>for your coffee shop</em>
              </h1>

              <p className="hero-sub" style={{ fontSize: 17, color: C.muted, lineHeight: 1.82, marginBottom: '1.75rem', maxWidth: 480 }}>
                Replace paper stamp cards with a smarter QR-based system. Customers scan, staff approves, card updates instantly — no app needed.
              </p>

              <div className="hero-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '2.25rem' }}>
                {HERO_PILLS.map(t => (
                  <span key={t} style={{ fontSize: 12, color: C.faint, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 50, padding: '5px 14px' }}>✓ {t}</span>
                ))}
              </div>

              <div className="hero-btns" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <Link href="/register" className="tap-scale" style={{ ...btnPrimary, padding: '15px 34px', fontSize: 15 }}>Start for free →</Link>
                <Link href="/login" style={{ color: C.muted, fontSize: 15, textDecoration: 'none', padding: '15px 8px', fontWeight: 500 }}>Sign in ↗</Link>
              </div>
            </div>

            <div className="hero-right float" style={{ flexShrink: 0, position: 'relative' }}>
              <div style={{ position: 'absolute', inset: -40, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,162,75,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <Image
                src="/americano.png"
                alt="Americano coffee"
                width={320}
                height={400}
                className="hero-cup"
                style={{ display: 'block', objectFit: 'contain', width: '100%', height: 'auto', }}
                priority
              />
            </div>
          </div>
          <div ref={heroRef} style={{ height: 1 }} />
        </section>

        {/* ══════════════ STATS BAR ══════════════ */}
        <section className="section-pad anim-2" style={{ maxWidth: 1160, margin: '0 auto', padding: '0 2rem 5rem', position: 'relative', zIndex: 1 }}>
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
            {STATS.map(s => (
              <div key={s.value} style={{ background: C.surface, padding: '1.5rem 1.25rem', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1rem, 2vw, 1.2rem)', fontWeight: 800, color: C.gold, marginBottom: 5, lineHeight: 1.2 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: C.faint }}>{s.note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════ HOW IT WORKS ══════════════ */}
        <section className="section-pad" style={{ maxWidth: 1060, margin: '0 auto', padding: '0 2rem 6rem', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <SectionEyebrow>How it works</SectionEyebrow>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: C.text, lineHeight: 1.15, marginBottom: 12 }}>Three steps. That&apos;s it.</h2>
            <p style={{ fontSize: 15, color: C.faint, maxWidth: 380, marginInline: 'auto', lineHeight: 1.7 }}>No complicated setup. Stick a QR code on your counter and you&apos;re live.</p>
          </div>

          <div className="how-list" style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center', gap: 0, position: 'relative' }}>
            <div className="how-line" style={{ display: 'none', position: 'absolute', left: 34, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${C.goldBorder}, transparent)`, zIndex: 0 }} />

            {HOW_STEPS.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'stretch', flex: 1 }}>
                <div className="how-card" style={{ background: `linear-gradient(160deg, ${C.card}, #0e0a06)`, border: `1px solid ${C.goldBorder}`, borderRadius: 22, padding: '2rem 1.6rem', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${C.goldSoft}, transparent)` }} />
                  <div className="how-icon-wrap" style={{ width: 58, height: 58, borderRadius: 18, background: C.goldSoft, border: `1px solid ${C.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 14, flexShrink: 0 }}>{step.icon}</div>
                  <div>
                    <div style={{ fontSize: 10, color: 'rgba(232,162,75,0.5)', fontWeight: 800, letterSpacing: 2.5, marginBottom: 8 }}>STEP {step.n}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 10, lineHeight: 1.3 }}>{step.title}</div>
                    <div style={{ fontSize: 13, color: C.faint, lineHeight: 1.8 }}>{step.desc}</div>
                  </div>
                </div>
                {i < 2 && (
                  <div className="how-connector" style={{ display: 'flex', alignItems: 'center', padding: '0 0.75rem', flexShrink: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      {Array.from({ length: 5 }).map((_, j) => <div key={j} style={{ width: 2, height: 2, borderRadius: '50%', background: 'rgba(232,162,75,0.25)' }} />)}
                      <div style={{ color: 'rgba(232,162,75,0.35)', fontSize: 14 }}>›</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════ WHY SWITCH ══════════════ */}
        <section className="section-pad" style={{ maxWidth: 1000, margin: '0 auto', padding: '0 2rem 6rem', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
            <SectionEyebrow>Why switch</SectionEyebrow>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: C.text, lineHeight: 1.15 }}>
              Paper cards have real problems
            </h2>
          </div>

          <div className="compare-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1.75rem', alignItems: 'center' }}>

            {/* LEFT: Paper card */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: 290 }}>
                <div style={{ background: 'linear-gradient(135deg, #ece4d2, #d8ccb4, #e4dac8)', borderRadius: 16, padding: '18px', border: '1.5px solid #baa88a', boxShadow: '3px 5px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.5)', position: 'relative', overflow: 'hidden', transform: 'rotate(-1.5deg)' }}>
                  <div style={{ position: 'absolute', top: 6, right: 12, width: 40, height: 40, borderRadius: '50%', background: 'radial-gradient(circle, rgba(120,80,40,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: 0, height: 0, borderStyle: 'solid', borderWidth: '0 0 24px 24px', borderColor: 'transparent transparent #c4b49a transparent' }} />
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#7a5c38', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, opacity: 0.85 }}>☕ Loyalty Card</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7, marginBottom: 12 }}>
                    {Array.from({ length: 8 }).map((_, i) => {
                      const s = i < 4
                      return (
                        <div key={i} style={{ aspectRatio: '1', borderRadius: 9, background: s ? 'rgba(120,60,20,0.1)' : 'rgba(255,255,255,0.55)', border: `1.5px ${s ? 'solid' : 'dashed'} ${s ? '#9b6a3a' : '#c4b498'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: s ? 16 : 10, color: s ? '#7a3e14' : '#c4b498', opacity: s ? (i === 0 ? 0.45 : i === 2 ? 0.65 : 1) : 1 }}>
                          {s ? '☕' : i === 7 ? '🎁' : ''}
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ fontSize: 9, color: '#9a7a5a', textAlign: 'center', borderTop: '1px dashed #c4b498', paddingTop: 9, opacity: 0.75 }}>Collect 8 stamps · Get 1 free coffee</div>
                </div>
                <div style={{ position: 'absolute', top: -10, left: -8, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 800, padding: '4px 11px', borderRadius: 50, letterSpacing: 0.5, boxShadow: '0 2px 10px rgba(239,68,68,0.45)', transform: 'rotate(-5deg)' }}>EASILY FAKED</div>
              </div>

              <div style={{ background: 'rgba(100,20,20,0.13)', border: '1px solid rgba(239,68,68,0.14)', borderRadius: 18, padding: '1.25rem 1.4rem', width: '100%', maxWidth: 290 }}>
                <div style={{ fontSize: 10, color: '#f87171', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700, marginBottom: 14 }}>❌ Paper stamp card</div>
                {PAPER_PROBLEMS.map(t => (
                  <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: 'rgba(240,232,216,0.38)', marginBottom: 9, lineHeight: 1.5 }}>
                    <span style={{ color: '#f87171', flexShrink: 0, fontWeight: 700 }}>✗</span>{t}
                  </div>
                ))}
              </div>
            </div>

            {/* MIDDLE VS */}
            <div className="vs-divider" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <div className="vs-line vs-line-top" style={{ width: 1, height: 70, background: 'linear-gradient(to bottom, transparent, rgba(232,162,75,0.3))' }} />
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: C.goldSoft, border: `1px solid ${C.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: C.gold, flexShrink: 0, letterSpacing: 0.5 }}>VS</div>
              <div className="vs-line vs-line-bot" style={{ width: 1, height: 70, background: 'linear-gradient(to top, transparent, rgba(232,162,75,0.3))' }} />
            </div>

            {/* RIGHT: BrewPass phone */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: 290, display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 210, backgroundColor: '#060403', borderRadius: 34, border: `2px solid ${C.goldBorder}`, padding: '10px 8px 14px', boxShadow: '0 24px 70px rgba(0,0,0,0.65), 0 0 0 1px rgba(232,162,75,0.05)' }}>
                  <div style={{ width: 62, height: 19, background: '#060403', borderRadius: 12, margin: '0 auto 9px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.09)' }} />
                    <div style={{ width: 22, height: 5, borderRadius: 6, background: 'rgba(255,255,255,0.06)' }} />
                  </div>
                  <div style={{ background: '#f5f0e8', borderRadius: 24, overflow: 'hidden' }}>
                    <div style={{ background: '#1a1208', padding: '7px 12px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(245,237,224,0.5)' }}>9:41</div>
                      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                        {[3,2,3].map((h,i) => <div key={i} style={{ width: 2, height: h*2, background: 'rgba(245,237,224,0.4)', borderRadius: 1 }} />)}
                        <div style={{ width: 10, height: 5, border: '1px solid rgba(245,237,224,0.3)', borderRadius: 1.5, marginLeft: 2, display: 'flex', alignItems: 'center', padding: '1px' }}>
                          <div style={{ width: '70%', height: '100%', background: '#4ade80', borderRadius: 1 }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ background: '#1a1208', padding: '5px 12px 10px', display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#e8a24b,#f4b966)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>☕</div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#f5ede0' }}>Cafe ABCD</div>
                        <div style={{ fontSize: 8, color: 'rgba(245,237,224,0.35)' }}>Thamel, Kathmandu</div>
                      </div>
                      <div style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 800, color: '#e8a24b', background: 'rgba(232,162,75,0.12)', border: '1px solid rgba(232,162,75,0.3)', borderRadius: 5, padding: '2px 7px' }}>4/7</div>
                    </div>
                    <div style={{ padding: '10px 10px 14px', background: '#f5f0e8' }}>
                      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #e0d8cc', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
                        <div style={{ height: 5, background: 'repeating-linear-gradient(90deg,#e8a24b 0px,rgba(232,162,75,0.45) 5px,transparent 5px,transparent 10px)' }} />
                        <div style={{ padding: '10px 10px 12px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
                            {Array.from({ length: 7 }).map((_, i) => {
                              const isFree = i === 6; const filled = i < 4
                              return (
                                <div key={i} style={{ aspectRatio: '1', borderRadius: 8, background: isFree ? 'linear-gradient(135deg,#e8a24b,#f4b966)' : filled ? '#fff8ee' : '#faf7f3', border: `1.5px solid ${isFree ? '#e8a24b' : filled ? '#e8a24b' : '#e0d8cc'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                  {isFree ? <><div style={{ fontSize: 11 }}>☕</div><div style={{ fontSize: 6, fontWeight: 900, color: C.darkText }}>FREE</div></> : filled ? <span style={{ fontSize: 13 }}>☕</span> : null}
                                </div>
                              )
                            })}
                          </div>
                          <div style={{ textAlign: 'center', fontSize: 8, color: '#bbb', marginTop: 8 }}>3 more for free coffee ☕</div>
                        </div>
                        <div style={{ height: 5, background: 'repeating-linear-gradient(90deg,#e8a24b 0px,rgba(232,162,75,0.45) 5px,transparent 5px,transparent 10px)' }} />
                      </div>
                      <div style={{ marginTop: 8, background: C.goldGrad, borderRadius: 9, padding: '9px', textAlign: 'center', fontSize: 10, fontWeight: 800, color: C.darkText, boxShadow: '0 3px 12px rgba(232,162,75,0.3)' }}>📲 Request a stamp</div>
                      <div style={{ textAlign: 'center', fontSize: 8, color: '#ccc', marginTop: 7 }}>Powered by <span style={{ color: C.gold, fontWeight: 700 }}>BrewPass</span> 🇳🇵</div>
                    </div>
                  </div>
                  <div style={{ width: 60, height: 3, background: 'rgba(245,237,224,0.12)', borderRadius: 10, margin: '8px auto 0' }} />
                </div>
                <div style={{ position: 'absolute', top: -10, right: 4, background: '#22c55e', color: '#fff', fontSize: 9, fontWeight: 800, padding: '4px 11px', borderRadius: 50, boxShadow: '0 2px 10px rgba(34,197,94,0.4)', transform: 'rotate(3deg)' }}>STAFF APPROVED</div>
              </div>

              <div style={{ background: 'rgba(15,70,35,0.13)', border: '1px solid rgba(74,222,128,0.14)', borderRadius: 18, padding: '1.25rem 1.4rem', width: '100%', maxWidth: 290 }}>
                <div style={{ fontSize: 10, color: '#4ade80', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700, marginBottom: 14 }}>✅ BrewPass</div>
                {BP_BENEFITS.map(t => (
                  <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: 'rgba(240,232,216,0.58)', marginBottom: 9, lineHeight: 1.5 }}>
                    <span style={{ color: '#4ade80', flexShrink: 0, fontWeight: 700 }}>✓</span>{t}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ══════════════ LIVE DEMO ══════════════ */}
        <section className="section-pad" style={{ maxWidth: 480, margin: '0 auto', padding: '0 2rem 6rem', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <SectionEyebrow>Live preview</SectionEyebrow>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.3rem)', fontWeight: 800, color: C.text, marginBottom: 10, lineHeight: 1.15 }}>
              What your customer sees
            </h2>
            <p style={{ fontSize: 14, color: C.faint, lineHeight: 1.7 }}>On their phone — no app, no account, just scan.</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', width: 340, height: 340, top: '15%', left: '50%', transform: 'translateX(-50%)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,162,75,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ width: 300, backgroundColor: '#060403', borderRadius: 44, border: `2px solid ${C.goldBorder}`, padding: '14px 10px 20px', boxShadow: '0 50px 120px rgba(0,0,0,0.75), 0 0 0 1px rgba(232,162,75,0.05), inset 0 1px 0 rgba(255,255,255,0.03)', position: 'relative' }}>
              <div style={{ width: 90, height: 26, backgroundColor: '#060403', borderRadius: 20, margin: '0 auto 10px', border: '1.5px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ width: 30, height: 8, borderRadius: 10, background: 'rgba(255,255,255,0.07)' }} />
              </div>

              <div style={{ background: '#f5f0e8', borderRadius: 32, overflow: 'hidden' }}>
                <div style={{ background: '#1a1208', padding: '10px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(245,237,224,0.5)' }}>9:41</div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[3,2,3].map((h,i) => <div key={i} style={{ width: 3, height: h*2+2, background: 'rgba(245,237,224,0.4)', borderRadius: 2 }} />)}
                    <div style={{ width: 14, height: 7, border: '1px solid rgba(245,237,224,0.3)', borderRadius: 2, marginLeft: 2, display: 'flex', alignItems: 'center', padding: '1px' }}>
                      <div style={{ width: '70%', height: '100%', background: '#4ade80', borderRadius: 1 }} />
                    </div>
                  </div>
                </div>
                <div style={{ background: '#1a1208', padding: '6px 16px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#e8a24b,#f4b966)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>☕</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f5ede0' }}>Cafe Piccolo</div>
                    <div style={{ fontSize: 11, color: 'rgba(245,237,224,0.35)' }}>Thamel, Kathmandu</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 800, color: '#e8a24b', background: 'rgba(232,162,75,0.12)', border: '1px solid rgba(232,162,75,0.3)', borderRadius: 7, padding: '3px 10px' }}>5 / 7</div>
                </div>
                <div style={{ padding: '16px 14px 20px', background: '#f5f0e8' }}>
                  <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #e0d8cc', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <div style={{ height: 7, background: 'repeating-linear-gradient(90deg,#e8a24b 0px,rgba(232,162,75,0.45) 7px,transparent 7px,transparent 14px)' }} />
                    <div style={{ padding: '14px 14px 16px' }}>
                      <div style={{ background: '#f8f4ef', border: '1px solid #e8e0d4', borderRadius: 8, padding: '7px 12px', marginBottom: 14, fontSize: 13, color: '#555', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: '#bbb' }}>Name:</span><strong style={{ color: '#1a1208' }}>Sita Sharma</strong>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                        {Array.from({ length: 7 }).map((_, i) => {
                          const isFree = i === 6; const filled = i < 5
                          return (
                            <div key={i} style={{ aspectRatio: '1', borderRadius: 12, background: isFree ? 'linear-gradient(135deg,#e8a24b,#f4b966)' : filled ? '#fff8ee' : '#faf7f3', border: `1.5px solid ${isFree ? '#e8a24b' : filled ? '#e8a24b' : '#e0d8cc'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: (filled||isFree) ? '0 2px 10px rgba(232,162,75,0.18)' : 'none' }}>
                              {isFree ? <><div style={{ fontSize: 17 }}>☕</div><div style={{ fontSize: 7, fontWeight: 900, color: C.darkText }}>FREE</div></> : filled ? <span style={{ fontSize: 19 }}>☕</span> : null}
                            </div>
                          )
                        })}
                      </div>
                      <div style={{ textAlign: 'center', fontSize: 11, color: '#bbb', marginTop: 12 }}>2 more stamps for a free coffee ☕</div>
                    </div>
                    <div style={{ height: 7, background: 'repeating-linear-gradient(90deg,#e8a24b 0px,rgba(232,162,75,0.45) 7px,transparent 7px,transparent 14px)' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    {[{v:'5',l:'stamps'},{v:'2',l:'rewards'},{v:'2',l:'to go',gold:true}].map(s => (
                      <div key={s.l} style={{ flex: 1, background: '#fff', border: '1px solid #ede7dd', borderRadius: 10, padding: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: s.gold ? '#e8a24b' : '#1a1208' }}>{s.v}</div>
                        <div style={{ fontSize: 10, color: '#bbb', marginTop: 1 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12, background: C.goldGrad, borderRadius: 12, padding: '13px', textAlign: 'center', fontSize: 13, fontWeight: 800, color: C.darkText, boxShadow: '0 4px 16px rgba(232,162,75,0.3)' }}>📲 Request a stamp</div>
                  <div style={{ textAlign: 'center', fontSize: 10, color: '#ccc', marginTop: 12 }}>Powered by <span style={{ color: C.gold, fontWeight: 700 }}>BrewPass</span> Nepal 🇳🇵</div>
                </div>
              </div>
              <div style={{ width: 90, height: 4, background: 'rgba(245,237,224,0.13)', borderRadius: 10, margin: '12px auto 0' }} />
            </div>
          </div>
        </section>

        {/* ══════════════ FEATURES ══════════════ */}
        <section className="section-pad" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem 6rem', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
            <SectionEyebrow>Features</SectionEyebrow>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: C.text, lineHeight: 1.15 }}>
              Everything a café needs
            </h2>
          </div>
          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <FeatureCard icon="📲" title="Scan & stamp in seconds"   desc="Any phone camera. No app, no sign-up. Scan the QR and the card opens instantly." />
            <FeatureCard icon="📊" title="Know your regulars"        desc="Dashboard shows who visits most, busiest days, and redemption rates at a glance." />
            <FeatureCard icon="🔒" title="Zero fake stamps"          desc="Every stamp needs staff approval. No more forged cards or customers cheating." />
            <FeatureCard icon="🎁" title="One-tap redemption"        desc="Staff redeems a reward instantly when a customer completes their card." />
            <FeatureCard icon="📶" title="WiFi QR code"              desc="Customers scan to join your WiFi — no more asking for the password at the counter." />
            <FeatureCard icon="🇳🇵" title="Built for Nepal"          desc="Prices in NPR. Works on basic Androids. No credit card to start." />
          </div>
        </section>

        {/* ══════════════ PRICING ══════════════ */}
        <section style={{ position: 'relative', zIndex: 1, paddingBottom: '6rem' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 0%, rgba(232,162,75,0.025) 50%, transparent 100%)', pointerEvents: 'none' }} />
          <div className="section-pad" style={{ maxWidth: 1160, margin: '0 auto', padding: '0 2rem 2.75rem', textAlign: 'center', position: 'relative' }}>
            <SectionEyebrow>Pricing</SectionEyebrow>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: C.text, marginBottom: 12, lineHeight: 1.15 }}>
              Starts free, grows with you
            </h2>
            <p style={{ fontSize: 15, color: C.faint }}>No credit card to start. Upgrade when you&apos;re ready.</p>
          </div>
          <div className="plans-scroll section-pad" style={{ padding: '0 2rem', position: 'relative' }}>
            <div className="plans-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', maxWidth: 980, margin: '0 auto' }}>
              <PlanCard name="Free" price="NPR 0" sub="forever"
                features={['Up to 50 customers','QR stamp system','Staff approval dashboard','WiFi QR code']} cta="Start for free" />
              <PlanCard name="Basic" price="NPR 1,500" sub="per month" highlight
                features={['Unlimited customers','Visit analytics & charts','Customer search','Menu display','1 location']} cta="Get Basic" />
              <PlanCard name="Pro" price="NPR 3,500" sub="per month"
                features={['Everything in Basic','Multiple branches','Advanced reports','Data export','Priority support']} cta="Get Pro" />
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: 12, color: 'rgba(240,232,216,0.18)' }}>← swipe to see all plans →</div>
        </section>

        {/* ══════════════ FAQ ══════════════ */}
        <section className="section-pad" style={{ maxWidth: 700, margin: '0 auto', padding: '0 2rem 6rem', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
            <SectionEyebrow>FAQ</SectionEyebrow>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, color: C.text, lineHeight: 1.15 }}>
              Common questions
            </h2>
          </div>
          <div className="faq-wrap" style={{ background: 'rgba(15,11,7,0.7)', border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 24, padding: '0 1.75rem', backdropFilter: 'blur(10px)' }}>
            <FaqItem q="Do customers need to download an app?"          a="No. They scan your QR code with their phone camera and the stamp card opens directly in their browser. Nothing to install, no account needed." />
            <FaqItem q="Can customers cheat by scanning from home?"     a="No. Every stamp request needs physical approval from your staff. You only tap Approve when the customer is standing at the counter." />
            <FaqItem q="What if a customer changes their phone number?" a="Their stamps are saved to their old number. You can manually transfer them from the Customers page in your dashboard." />
            <FaqItem q="Can I use this for other businesses?"           a="Yes. BrewPass works for any shop — restaurants, hookah bars, bakeries, salons, anything that wants a stamp loyalty system." />
            <FaqItem q="What happens when I hit 50 customers on Free?"  a="Existing customers keep earning and redeeming stamps. New customers can't join until you upgrade to Basic or Pro." />
            <FaqItem q="How long does setup take?"                       a="About 5 minutes. Register, print your QR code, place it on the counter — done. Customers can start scanning right away." />
          </div>
        </section>

        {/* ══════════════ CTA ══════════════ */}
        <section className="cta-section" style={{ padding: '6rem 2rem', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(232,162,75,0.05) 0%, transparent 55%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(232,162,75,0.3), transparent)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(232,162,75,0.15), transparent)' }} />
          <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,162,75,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #e8a24b, #f4b966)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px', boxShadow: '0 8px 28px rgba(232,162,75,0.35)' }}>☕</div>
            <h2 className="cta-title" style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: C.text, lineHeight: 1.1, marginBottom: 14 }}>
              Ready to ditch<br />the paper card?
            </h2>
            <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.8, marginBottom: '2.25rem' }}>
              Free account, 5 minute setup.<br />No credit card, no contract.
            </p>
            <Link href="/register" className="cta-btn tap-scale" style={{ ...btnPrimary, padding: '17px 46px', fontSize: 16, display: 'inline-block', marginBottom: '2.25rem' }}>
              Create your free account →
            </Link>

            {joined ? (
              <p style={{ color: C.gold, fontSize: 14, fontWeight: 600 }}>🎉 You&apos;re on the waitlist! We&apos;ll reach out soon.</p>
            ) : (
              <div>
                <p style={{ fontSize: 13, color: 'rgba(240,232,216,0.2)', marginBottom: 14 }}>Or join the waitlist for a guided setup call:</p>
                <div className="waitlist-row" style={{ display: 'flex', maxWidth: 420, margin: '0 auto', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <input value={waitlist} onChange={e => setWaitlist(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') joinWaitlist() }}
                    placeholder="Phone number or email"
                    style={{ flex: 1, minWidth: 180, padding: '14px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: C.text, fontSize: 15, outline: 'none', fontFamily: 'inherit' }} />
                  <button onClick={joinWaitlist} disabled={waitlistLoading} className="tap-scale" style={{ ...btnPrimary, padding: '14px 24px', fontSize: 14, opacity: waitlistLoading ? 0.6 : 1 }}>Join waitlist</button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ══════════════ FOOTER ══════════════ */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '2.25rem 2rem', paddingBottom: 'calc(2.25rem + env(safe-area-inset-bottom))', position: 'relative', zIndex: 1 }}>
          <div className="footer-inner" style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,#e8a24b,#f4b966)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>☕</div>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 900, letterSpacing: -0.5 }}>
                  <span style={{ color: C.gold }}>Brew</span><span style={{ color: 'rgba(240,232,216,0.65)' }}>Pass</span>
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(240,232,216,0.18)', margin: 0 }}>Digital loyalty for Nepal&apos;s coffee culture 🇳🇵</p>
            </div>
            <div className="footer-links" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/register" style={{ fontSize: 13, color: 'rgba(240,232,216,0.3)', textDecoration: 'none' }}>Register your café</Link>
              <Link href="/login"    style={{ fontSize: 13, color: 'rgba(240,232,216,0.3)', textDecoration: 'none' }}>Sign in</Link>
              <Link href="/admin"    style={{ fontSize: 13, color: 'rgba(240,232,216,0.12)', textDecoration: 'none' }}>Admin</Link>
            </div>
          </div>
        </footer>

      </div>

      {/* ══ STICKY MOBILE CTA ══ */}
      <div className={`sticky-bar${showStickyBar ? ' visible' : ''}`}>
        <Link href="/register" className="tap-scale" style={{ ...btnPrimary, flex: 1, textAlign: 'center', padding: '15px', fontSize: 15, borderRadius: 14 }}>
          Start for free — it&apos;s NPR 0 →
        </Link>
      </div>

    </div>
  )
}
