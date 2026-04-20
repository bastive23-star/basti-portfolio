'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import Link from 'next/link'
import { EASE, EASE_SNAP } from '@/lib/motion'

const links = [
  { label: 'Über mich',  href: '#about',    num: '01' },
  { label: 'Skills',     href: '#services',  num: '02' },
  { label: 'Projekte',   href: '#projects',  num: '03' },
  { label: 'Kontakt',    href: '#contact',   num: '04' },
]

// ── Nav CTA (shown while at top) ──────────────────────────────────────────────
function CtaMagnetic() {
  const wrapRef = useRef<HTMLDivElement>(null)

  const onMove = (e: React.MouseEvent) => {
    const el = wrapRef.current; if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left - r.width  / 2) * 0.22
    const y = (e.clientY - r.top  - r.height / 2) * 0.22
    el.style.transform = `translate(${x}px, ${y}px)`
    el.style.transition = 'transform 0.1s linear'
  }
  const onLeave = () => {
    if (!wrapRef.current) return
    wrapRef.current.style.transform = 'translate(0,0)'
    wrapRef.current.style.transition = 'transform 0.8s cubic-bezier(0.16,1,0.3,1)'
  }

  return (
    <div ref={wrapRef} onMouseMove={onMove} onMouseLeave={onLeave} style={{ display: 'inline-block' }}>
      <motion.a
        href="#contact"
        data-cursor="→"
        style={{
          fontFamily: 'var(--ff-mono)', fontWeight: 500, fontSize: '0.68rem',
          letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none',
          padding: '0.62rem 1.5rem',
          border: '1px solid var(--border-mid)',
          borderRadius: 3,
          color: 'var(--fg)',
          background: 'transparent',
          display: 'inline-block',
        }}
        whileHover={{ background: 'var(--fg)', color: 'var(--bg)', borderColor: 'var(--fg)' }}
        transition={{ duration: 0.22, ease: EASE }}
      >
        Get in touch
      </motion.a>
    </div>
  )
}

// ── Floating CTA — blob dot, right-center of screen ──────────────────────────
function FloatingCTA({ visible }: { visible: boolean }) {
  const [hovered, setHovered] = useState(false)
  const wrapRef   = useRef<HTMLDivElement>(null)
  const shapeCtrl = useAnimation()

  // Idle blob frames — subtle organic wabble
  const BLOB_IDLE = [
    '50%',
    '55% 45% 52% 48%',
    '46% 54% 56% 44%',
    '52% 48% 44% 56%',
    '48% 52% 50% 50%',
    '50%',
  ]
  // Hover blob frames — more extreme wabble + pulsing size
  const BLOB_HOVER = [
    '50% 50% 50% 50% / 50% 50% 50% 50%',
    '60% 40% 55% 45% / 45% 55% 45% 55%',
    '40% 60% 45% 55% / 55% 45% 60% 40%',
    '58% 42% 48% 52% / 42% 58% 52% 48%',
    '44% 56% 60% 40% / 56% 44% 40% 60%',
    '50% 50% 50% 50% / 50% 50% 50% 50%',
  ]

  const onMove = (e: React.MouseEvent) => {
    const el = wrapRef.current; if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left - r.width  / 2) * 0.38
    const y = (e.clientY - r.top  - r.height / 2) * 0.38
    el.style.transform = `translate(${x}px, ${y}px)`
    el.style.transition = 'transform 0.1s linear'
  }
  const onLeave = () => {
    if (!wrapRef.current) return
    wrapRef.current.style.transform = 'translate(0,0)'
    wrapRef.current.style.transition = 'transform 0.8s cubic-bezier(0.16,1,0.3,1)'
    setHovered(false)
  }

  useEffect(() => {
    if (hovered) {
      shapeCtrl.stop()
      // Grow to large circle first, then start wabbling + pulsing
      shapeCtrl.start({
        width: 130, height: 130,
        borderRadius: '50%',
        boxShadow: '0 12px 40px rgba(52,201,168,0.4)',
        transition: { duration: 0.5, ease: EASE },
      }).then(() => {
        shapeCtrl.start({
          borderRadius: BLOB_HOVER,
          width: [130, 138, 126, 134, 128, 130],
          height: [130, 126, 136, 128, 134, 130],
          transition: { repeat: Infinity, repeatType: 'loop', duration: 3, ease: 'easeInOut' },
        })
      })
    } else {
      shapeCtrl.stop()
      shapeCtrl.start({
        width: 50, height: 50, borderRadius: '50%',
        boxShadow: '0 0 0 0 rgba(52,201,168,0)',
        transition: { duration: 0.45, ease: EASE },
      }).then(() => {
        shapeCtrl.start({
          borderRadius: BLOB_IDLE,
          transition: { repeat: Infinity, repeatType: 'loop', duration: 5, ease: 'easeInOut' },
        })
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovered])

  return (
    <motion.div
      className="hidden md:flex"
      style={{
        position: 'fixed',
        top:       '50%',
        right:     'clamp(1.8rem, 3.5vw, 2.8rem)',
        marginTop: -25,
        zIndex:    200,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      initial={{ opacity: 0, y: '-45vh', scale: 0.75 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : '-45vh', scale: visible ? 1 : 0.75 }}
      transition={{ duration: 0.78, ease: EASE }}
    >
      {/* Slow breathing float */}
      <motion.div
        animate={visible ? { y: [-9, 9, -9] } : { y: 0 }}
        transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut' }}
        style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {/* Sonar ring */}
        <motion.div
          style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: '1px solid rgba(52,201,168,0.45)',
            pointerEvents: 'none',
          }}
          animate={hovered
            ? { scale: 1, opacity: 0 }
            : { scale: [1, 2.2, 2.8], opacity: [0.6, 0.15, 0] }
          }
          transition={hovered
            ? { duration: 0.2 }
            : { repeat: Infinity, duration: 2.8, ease: 'easeOut', repeatDelay: 1.2 }
          }
        />

        <div ref={wrapRef} onMouseMove={onMove} onMouseLeave={onLeave}>
          <motion.a
            href="https://www.linkedin.com/in/sebastian-vitzthum-101154180/"
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="circle"
            initial={{ width: 50, height: 50, borderRadius: '50%', boxShadow: '0 0 0 0 rgba(52,201,168,0)' }}
            animate={shapeCtrl}
            onHoverStart={() => setHovered(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
              background: 'var(--accent)',
              color: 'var(--bg)',
              textDecoration: 'none',
              cursor: 'none',
              willChange: 'transform',
            }}
          >
            <motion.span
              style={{
                fontFamily: 'var(--ff-mono)', fontSize: '0.62rem', fontWeight: 500,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: '#111009',
                textAlign: 'center', lineHeight: 1.5, padding: '0 0.8rem',
                pointerEvents: 'none',
              }}
              animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.85 }}
              transition={{ duration: 0.25, delay: hovered ? 0.25 : 0 }}
            >
              Slide in<br />my DMs
            </motion.span>
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Animated burger icon ──────────────────────────────────────────────────────
function BurgerIcon({ open }: { open: boolean }) {
  const bar: React.CSSProperties = {
    display: 'block', height: 1.5, background: 'var(--fg)',
    borderRadius: 2, position: 'absolute', top: '50%', transformOrigin: 'center',
  }
  return (
    <div style={{ width: 26, height: 18, position: 'relative' }}>
      <motion.span
        animate={open ? { rotate: 45, y: 0, width: '100%' } : { rotate: 0, y: -6, width: '100%' }}
        transition={{ duration: 0.42, ease: EASE }}
        style={bar}
      />
      <motion.span
        animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.18 }}
        style={{ ...bar, width: '68%' }}
      />
      <motion.span
        animate={open ? { rotate: -45, y: 0, width: '100%' } : { rotate: 0, y: 6, width: '50%' }}
        transition={{ duration: 0.42, ease: EASE }}
        style={bar}
      />
    </div>
  )
}

// ── Liquid mobile menu ────────────────────────────────────────────────────────
// Clip-path polygon points create the organic liquid leading edge.
// CLOSED  = retracted above viewport
// BUBBLE  = mid-way bulge (surface tension effect)
// OPEN    = fully revealed
// SUCTION = pulls back (closing)
const CLOSED  = 'polygon(0% 0%, 100% 0%, 100% 0%,   87% 0%,   62% 0%,   50% 0%,   38% 0%,   13% 0%,   0% 0%)'
const BUBBLE  = 'polygon(0% 0%, 100% 0%, 100% 52%,  87% 59%,  62% 65%,  50% 68%,  38% 65%,  13% 59%,  0% 52%)'
const OPEN    = 'polygon(0% 0%, 100% 0%, 100% 100%, 87% 100%, 62% 100%, 50% 100%, 38% 100%, 13% 100%, 0% 100%)'
const SUCTION = 'polygon(0% 0%, 100% 0%, 100% 48%,  87% 41%,  62% 35%,  50% 32%,  38% 35%,  13% 41%,  0% 48%)'

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelCtrl  = useAnimation()
  const panelRef   = useRef<HTMLDivElement>(null)

  // Lock scroll + focus trap
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    // Move focus into menu after animation starts
    const t = setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>('a, button, [tabindex]')
      first?.focus()
    }, 460)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])')
      if (!focusable?.length) return
      const first = focusable[0]
      const last  = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (open) {
      panelCtrl.start({
        clipPath: [CLOSED, BUBBLE, OPEN],
        transition: { duration: 0.88, times: [0, 0.5, 1], ease: EASE_SNAP },
      })
    } else {
      panelCtrl.start({
        clipPath: [OPEN, SUCTION, CLOSED],
        transition: { duration: 0.62, times: [0, 0.38, 1], ease: EASE_SNAP },
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <motion.div
      ref={panelRef}
      initial={{ clipPath: CLOSED }}
      animate={panelCtrl}
      aria-modal={open}
      aria-label="Navigation"
      style={{
        position: 'fixed', inset: 0, zIndex: 97,
        background: 'var(--bg)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: 'clamp(6rem, 14vh, 8rem) clamp(1.5rem, 5vw, 3rem) clamp(3rem, 7vh, 4rem)',
        pointerEvents: open ? 'auto' : 'none',
        borderTop: '2px solid var(--accent)',
      }}
    >
      <nav>
        {links.map(({ label, href, num }, i) => (
          <motion.div
            key={label}
            style={{ borderBottom: '1px solid var(--border)', overflow: 'hidden' }}
            animate={{ opacity: open ? 1 : 0, y: open ? 0 : 22 }}
            initial={{ opacity: 0, y: 22 }}
            transition={{ delay: open ? 0.42 + i * 0.09 : 0, duration: open ? 0.72 : 0.12, ease: EASE }}
          >
            <a
              href={href}
              onClick={onClose}
              style={{
                textDecoration: 'none', display: 'flex',
                alignItems: 'baseline', justifyContent: 'space-between',
                padding: 'clamp(1rem,3vh,1.4rem) 0', gap: '1rem',
              }}
            >
              <span className="font-mono" style={{ fontSize: '0.5rem', color: 'var(--fg-faint)', letterSpacing: '0.2em' }}>
                {num}
              </span>
              <motion.span
                className="font-display"
                style={{ fontSize: 'clamp(2rem, 10vw, 3.8rem)', fontWeight: 800, color: 'var(--fg)', letterSpacing: '-0.03em', flex: 1, textAlign: 'right' }}
                whileHover={{ color: 'var(--accent)', x: -8 }}
                transition={{ duration: 0.28, ease: EASE }}
              >
                {label}
              </motion.span>
            </a>
          </motion.div>
        ))}
      </nav>

      <motion.div
        style={{ marginTop: 'clamp(2rem, 5vh, 3rem)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}
        animate={{ opacity: open ? 1 : 0, y: open ? 0 : 16 }}
        initial={{ opacity: 0, y: 16 }}
        transition={{ delay: open ? 0.42 + links.length * 0.09 + 0.06 : 0, duration: open ? 0.6 : 0.1, ease: EASE }}
      >
        <div>
          <span className="font-display" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--fg)', letterSpacing: '-0.02em' }}>B.</span>
          <span className="tag" style={{ display: 'block', marginTop: '0.4rem' }}>Content Generalist · München</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <motion.div
            style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-online)' }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <span className="font-mono" style={{ fontSize: '0.52rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-mid)' }}>
            Offen für Angebote
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main Nav ──────────────────────────────────────────────────────────────────
export default function Nav() {
  const [scrolled,  setScrolled]  = useState(false)
  const [hovered,   setHovered]   = useState<string | null>(null)
  const [menuOpen,  setMenuOpen]  = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const glassOpacity    = menuOpen ? 0.55 : scrolled ? 0.42 : 0.22
  const glassSaturation = scrolled ? '2.2' : '1.8'

  return (
    <>
      <motion.header
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'clamp(0.9rem, 2.2vh, 1.3rem) clamp(1.5rem, 5vw, 5rem)',
          background: `rgba(247, 245, 242, ${glassOpacity})`,
          backdropFilter: `blur(28px) saturate(${glassSaturation})`,
          WebkitBackdropFilter: `blur(28px) saturate(${glassSaturation})`,
          borderBottom: '1px solid rgba(255,255,255,0.45)',
          boxShadow: '0 1px 0 rgba(0,0,0,0.03), inset 0 -1px 0 rgba(255,255,255,0.6)',
          transition: 'background 0.45s ease',
        }}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
      >
        <Link href="/" style={{ textDecoration: 'none', zIndex: 101, position: 'relative' }}>
          <motion.span
            className="font-display"
            style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'block', color: 'var(--fg)' }}
            whileHover={{ color: 'var(--accent)' }}
            transition={{ duration: 0.2 }}
          >
            B.
          </motion.span>
        </Link>

        <nav className="hidden md:flex">
          <ul
            style={{ display: 'flex', gap: 'clamp(1.2rem, 2.5vw, 2.5rem)', listStyle: 'none', padding: 0, margin: 0 }}
            onMouseLeave={() => setHovered(null)}
          >
            {links.map(({ label, href, num }) => (
              <li key={label} style={{ position: 'relative' }}>
                <motion.a
                  href={href}
                  style={{
                    fontFamily: 'var(--ff-body)', fontSize: '0.8rem', fontWeight: 400,
                    color: hovered && hovered !== label ? 'var(--fg-faint)' : hovered === label ? 'var(--fg)' : 'var(--fg-mid)',
                    letterSpacing: '0.02em', textDecoration: 'none', display: 'block',
                    padding: '0.2rem 0', transition: 'color 0.25s ease', position: 'relative',
                  }}
                  animate={{ y: hovered === label ? -2 : 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  onMouseEnter={() => setHovered(label)}
                >
                  {/* Number that fades in above on hover */}
                  <motion.span
                    style={{
                      position: 'absolute', top: -13, left: 0,
                      fontFamily: 'var(--ff-mono)', fontSize: '0.42rem',
                      letterSpacing: '0.18em', color: 'var(--accent)',
                      pointerEvents: 'none',
                    }}
                    animate={{ opacity: hovered === label ? 1 : 0, y: hovered === label ? 0 : 4 }}
                    transition={{ duration: 0.22, ease: EASE }}
                  >
                    {num}
                  </motion.span>
                  {label}
                  {/* Accent underline */}
                  <motion.span
                    style={{ position: 'absolute', bottom: -2, left: 0, height: 1, background: 'var(--accent)', display: 'block' }}
                    animate={{ width: hovered === label ? '100%' : '0%' }}
                    transition={{ duration: 0.3, ease: EASE }}
                  />
                </motion.a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden md:block">
          <CtaMagnetic />
        </div>

        <button
          className="flex md:hidden"
          onClick={() => setMenuOpen(v => !v)}
          style={{ background: 'none', border: 'none', padding: '0.4rem', cursor: 'none', zIndex: 101, position: 'relative' }}
          aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
        >
          <BurgerIcon open={menuOpen} />
        </button>
      </motion.header>

      <FloatingCTA visible={scrolled} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
