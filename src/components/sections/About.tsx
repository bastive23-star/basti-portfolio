'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { EASE } from '@/lib/motion'

// ── Two photos side by side with independent parallax ────────────────────────
function ParallaxPhotos() {
  const containerRef = useRef<HTMLDivElement>(null)
  const img1Ref = useRef<HTMLDivElement>(null)
  const img2Ref = useRef<HTMLDivElement>(null)
  const target1 = useRef({ x: 0, y: 0 })
  const target2 = useRef({ x: 0, y: 0 })
  const current1 = useRef({ x: 0, y: 0 })
  const current2 = useRef({ x: 0, y: 0 })
  const raf = useRef<number>(0)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const dx = (e.clientX - rect.left  - rect.width  / 2) / rect.width
      const dy = (e.clientY - rect.top   - rect.height / 2) / rect.height
      target1.current = { x: dx * 18,  y: dy * 12  }
      target2.current = { x: dx * -10, y: dy * -8  }
    }
    window.addEventListener('mousemove', onMove)

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const tick = () => {
      current1.current.x = lerp(current1.current.x, target1.current.x, 0.06)
      current1.current.y = lerp(current1.current.y, target1.current.y, 0.06)
      current2.current.x = lerp(current2.current.x, target2.current.x, 0.04)
      current2.current.y = lerp(current2.current.y, target2.current.y, 0.04)
      if (img1Ref.current) img1Ref.current.style.transform = `translate(${current1.current.x}px, ${current1.current.y}px)`
      if (img2Ref.current) img2Ref.current.style.transform = `translate(${current2.current.x}px, ${current2.current.y}px)`
      raf.current = requestAnimationFrame(tick)
    }
    tick()
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <motion.div
      ref={containerRef}
      style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', width: '100%', maxWidth: 500, margin: '0 auto' }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, ease: EASE }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Image 1 — portrait, taller, slight rotation left */}
      <motion.div
        ref={img1Ref}
        style={{ flex: '0 0 58%', willChange: 'transform' }}
        animate={{ rotate: hovered ? -1 : -2 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <motion.div
          style={{ borderRadius: 10, overflow: 'hidden', aspectRatio: '3/4', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: EASE, delay: 0.1 }}
        >
          <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/images/portrait-1.jpg`} alt="Sebastian" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
        </motion.div>
      </motion.div>

      {/* Image 2 — laugh, shorter, slight rotation right, offset down */}
      <motion.div
        ref={img2Ref}
        style={{ flex: '0 0 38%', willChange: 'transform', marginBottom: '-2rem' }}
        animate={{ rotate: hovered ? 1.5 : 3 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <motion.div
          style={{ borderRadius: 10, overflow: 'hidden', aspectRatio: '3/4', position: 'relative', boxShadow: '0 16px 40px rgba(0,0,0,0.08)' }}
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: EASE, delay: 0.25 }}
        >
          <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/images/portrait-2.jpg`} alt="Sebastian lachend" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
        </motion.div>

        {/* Available badge */}
        <motion.div
          style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 980, padding: '0.4rem 0.8rem' }}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-online)' }}
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <span className="font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-mid)' }}>
            Verfügbar
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// ── Scroll marquee ────────────────────────────────────────────────────────────
function Marquee() {
  const words = ['Video', 'Foto', 'Motion', 'Grafik', 'Animation', 'KI', 'Musik', 'Social Media']
  return (
    <div style={{ overflow: 'hidden', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '0.9rem 0', marginBottom: 'clamp(3rem, 6vh, 5rem)' }}>
      <motion.div
        style={{ display: 'flex', gap: '2.5rem', whiteSpace: 'nowrap' }}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
      >
        {[...words, ...words, ...words, ...words].map((w, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '2.5rem' }}>
            <span className="font-display" style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-faint)' }}>
              {w}
            </span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', opacity: 0.6 }} />
          </span>
        ))}
      </motion.div>
    </div>
  )
}

const stats = [
  { num: '10+',  label: 'Jahre Content-Erfahrung' },
  { num: '100+', label: 'Projekte umgesetzt' },
  { num: '6+',   label: 'Skills, eine Person' },
]

// ── Main ──────────────────────────────────────────────────────────────────────
export default function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const textY   = useTransform(scrollYProgress, [0, 1], ['14%',  '-14%'])
  const photosY = useTransform(scrollYProgress, [0, 1], ['4%',   '-20%'])
  const ghostY  = useTransform(scrollYProgress, [0, 1], ['-10%', '22%'])

  return (
    <section id="about" ref={sectionRef} style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)', overflow: 'hidden', position: 'relative' }}>
      {/* Ghost background word */}
      <motion.div
        style={{ y: ghostY, position: 'absolute', top: '10%', left: '-2%', pointerEvents: 'none', zIndex: 0, userSelect: 'none' }}
        aria-hidden
      >
        <span style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(10rem, 28vw, 26rem)', fontWeight: 800, color: 'var(--fg)', opacity: 0.025, letterSpacing: '-0.04em', whiteSpace: 'nowrap', lineHeight: 1, display: 'block' }}>
          BASTI
        </span>
      </motion.div>
      <Marquee />

      <div className="section-pad" style={{ paddingTop: 0, position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(4rem, 8vw, 9rem)', alignItems: 'center' }}>

            {/* Photos — scroll parallax on top of mouse parallax */}
            <motion.div style={{ y: photosY }}>
              <ParallaxPhotos />
            </motion.div>

            {/* Text — subtle scroll parallax */}
            <motion.div style={{ y: textY }}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <p className="tag" style={{ marginBottom: '1.5rem' }}>Über mich</p>
                <h2 style={{ fontSize: 'clamp(2.6rem, 5.5vw, 5rem)', marginBottom: '1.8rem' }}>
                  Ich bin<br />
                  <em style={{ fontFamily: 'var(--ff-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>Basti.</em>
                </h2>
                <p style={{ fontFamily: 'var(--ff-body)', fontSize: 'clamp(0.95rem, 1.3vw, 1.05rem)', color: 'var(--fg-mid)', lineHeight: 1.85, fontWeight: 300, marginBottom: '1.2rem' }}>
                  Ich drehe, schneide, animiere und fotografiere. Alles selbst, alles inhouse — keine langen Abstimmungsketten, kein Outsourcing.
                </p>
                <p style={{ fontFamily: 'var(--ff-body)', fontSize: 'clamp(0.95rem, 1.3vw, 1.05rem)', color: 'var(--fg-mid)', lineHeight: 1.85, fontWeight: 300, marginBottom: '2.5rem' }}>
                  Ich suche gerade eine Festanstellung — am liebsten in einem Team, das wirklich was machen will und jemanden braucht, der viel abdeckt.
                </p>

                <div>
                  {stats.map(({ num, label }, i) => (
                    <motion.div
                      key={i}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.1rem 0', borderBottom: '1px solid var(--border)' }}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.15 + i * 0.12, duration: 0.7, ease: EASE }}
                      whileHover={{ x: 6 }}
                    >
                      <span className="font-display" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, color: 'var(--fg)', lineHeight: 1 }}>
                        {num}
                      </span>
                      <span style={{ fontFamily: 'var(--ff-body)', fontSize: '0.82rem', color: 'var(--fg-mid)', fontWeight: 300 }}>
                        {label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  )
}
