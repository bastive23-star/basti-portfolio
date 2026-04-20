'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import { EASE } from '@/lib/motion'

// ── 5 languages, swipe R→L ────────────────────────────────────────────────────
const HELLOS = [
  { word: 'Hallo',      lang: 'DE', font: 'var(--ff-display)', italic: false, weight: 700 },
  { word: 'Hello',      lang: 'EN', font: 'var(--ff-serif)',   italic: true,  weight: 400 },
  { word: 'Bonjour',    lang: 'FR', font: 'var(--ff-body)',    italic: false, weight: 300 },
  { word: 'Ciao',       lang: 'IT', font: 'var(--ff-display)', italic: false, weight: 700 },
  { word: 'こんにちは', lang: 'JP', font: 'var(--ff-body)',    italic: false, weight: 300 },
]

type Card = null | 'basti' | 'nice'

// ── Intro splash ──────────────────────────────────────────────────────────────
function Intro({ onDone, onContentStart }: { onDone: () => void; onContentStart: () => void }) {
  const [helloIdx,   setHelloIdx]   = useState(0)
  const [showHellos, setShowHellos] = useState(true)
  const [card,       setCard]       = useState<Card>(null)
  const [overlayOut, setOverlayOut] = useState(false)

  useEffect(() => {
    // Cycle languages rapidly — each shown for 260ms
    const id = setInterval(() => setHelloIdx(i => (i + 1) % HELLOS.length), 260)

    const ts = [
      // 3 000ms — stop swipe, blur out language block
      setTimeout(() => { clearInterval(id); setShowHellos(false) }, 3000),
      // 3 150ms — "Ich bin Basti." zooms in from blur
      setTimeout(() => setCard('basti'), 3150),
      // 5 400ms — crossfade to "Nice to meet you."
      setTimeout(() => setCard('nice'),  5400),
      // 7 800ms — nice fades out
      setTimeout(() => setCard(null),    7800),
      // 7 900ms — overlay dissolves AND hero content starts building (overlap)
      setTimeout(() => { setOverlayOut(true); onContentStart() }, 7900),
      // 9 100ms — unmount intro overlay
      setTimeout(onDone, 9100),
    ]
    return () => { clearInterval(id); ts.forEach(clearTimeout) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const h = HELLOS[helloIdx]

  return (
    <motion.div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}
      animate={{ opacity: overlayOut ? 0 : 1 }}
      transition={{ duration: 1.1, ease: 'easeInOut' }}
    >
      {/* ── Swipe container — overflow:hidden clips the flying words ─────────── */}
      <motion.div
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}
        animate={!showHellos
          ? { opacity: 0, scale: 1.08, filter: 'blur(28px)' }
          : { opacity: 1, scale: 1,    filter: 'blur(0px)' }
        }
        transition={{ duration: 0.42, ease: [0.76, 0, 0.24, 1] }}
      >
        {/* popLayout: exiting item is immediately removed from layout flow */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={helloIdx}
            style={{ position: 'absolute', textAlign: 'center', width: '100%' }}
            initial={{ x: '80vw', opacity: 0 }}
            animate={{ x: 0, opacity: 1,
              transition: { duration: 0.21, ease: EASE } }}
            exit={{ x: '-80vw', opacity: 0,
              transition: { duration: 0.17, ease: [0.76, 0, 0.24, 1] } }}
          >
            <span style={{
              display: 'block',
              fontFamily: h.font,
              fontStyle: h.italic ? 'italic' : 'normal',
              fontWeight: h.weight,
              fontSize: 'clamp(5rem, 20vw, 16rem)',
              color: 'var(--fg)',
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}>
              {h.word}
            </span>
            <span style={{
              display: 'block',
              fontFamily: 'var(--font-dm-mono)',
              fontSize: '0.48rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--fg-faint)',
              marginTop: '0.7rem',
            }}>
              {h.lang}
            </span>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── Text cards — mode="sync" = overlap for cinematic crossfade ─────────── */}
      <AnimatePresence mode="sync">

        {card === 'basti' && (
          <motion.div
            key="basti"
            style={{ position: 'absolute', textAlign: 'center', padding: '0 clamp(1.5rem,6vw,4rem)' }}
            initial={{ scale: 1.45, opacity: 0, filter: 'blur(32px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)',
              transition: { duration: 1.15, ease: EASE } }}
            exit={{ scale: 0.84, opacity: 0, filter: 'blur(26px)',
              transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] } }}
          >
            <span style={{
              display: 'block',
              fontFamily: '"Georgia", serif', fontStyle: 'italic', fontWeight: 400,
              fontSize: 'clamp(2.4rem, 7vw, 6rem)',
              color: 'var(--fg)', letterSpacing: '-0.01em', lineHeight: 1,
            }}>
              Ich bin Basti.
            </span>
          </motion.div>
        )}

        {card === 'nice' && (
          <motion.div
            key="nice"
            style={{ position: 'absolute', textAlign: 'center', padding: '0 clamp(1.5rem,6vw,4rem)' }}
            initial={{ scale: 1.35, opacity: 0, filter: 'blur(32px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)',
              transition: { duration: 1.2, ease: EASE } }}
            exit={{ opacity: 0, scale: 0.96, filter: 'blur(18px)',
              transition: { duration: 0.95, ease: 'easeIn' } }}
          >
            <span style={{
              display: 'block',
              fontFamily: '"Georgia", serif', fontStyle: 'italic', fontWeight: 400,
              fontSize: 'clamp(2.4rem, 7vw, 6rem)',
              color: 'var(--fg)', letterSpacing: '-0.01em', lineHeight: 1,
            }}>
              Nice to meet you.
            </span>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  )
}

// ── Magnetic button ───────────────────────────────────────────────────────────
function MagneticLink({ href, children }: { href: string; children: React.ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width  / 2) * 0.35
    const y = (e.clientY - rect.top  - rect.height / 2) * 0.35
    ref.current!.style.transform = `translate(${x}px, ${y}px)`
  }
  const onLeave = () => { ref.current!.style.transform = 'translate(0,0)' }
  return (
    <a
      ref={ref} href={href} data-cursor="↓"
      onMouseMove={onMove} onMouseLeave={onLeave}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
        fontFamily: 'var(--ff-body)', fontWeight: 600, fontSize: '0.82rem',
        letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none',
        color: 'var(--fg)', borderBottom: '1px solid var(--border-mid)', paddingBottom: '0.4rem',
        transition: 'color 0.2s, border-color 0.2s, transform 0.4s cubic-bezier(0.16,1,0.3,1)',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
    >
      {children}
    </a>
  )
}

// ── Local time ────────────────────────────────────────────────────────────────
function LocalTime() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const fmt = () => new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' })
    setTime(fmt())
    const id = setInterval(() => setTime(fmt()), 30000)
    return () => clearInterval(id)
  }, [])
  return <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--fg-faint)', letterSpacing: '0.12em' }}>{time} MEZ</span>
}

// ── Hero ──────────────────────────────────────────────────────────────────────
export default function Hero() {
  // sessionStorage is only available client-side — initialise conservatively
  // (show intro) and flip in an effect to avoid SSR/hydration mismatch.
  const [introVisible,   setIntroVisible]   = useState(true)
  const [contentVisible, setContentVisible] = useState(false)
  const [isMobile,       setIsMobile]       = useState(false)

  useEffect(() => {
    const mobile = window.innerWidth < 768 || navigator.maxTouchPoints > 0
    setIsMobile(mobile)
    if (sessionStorage.getItem('intro-seen') || mobile) {
      setIntroVisible(false)
      setContentVisible(true)
    }
  }, [])
  const sectionRef = useRef<HTMLElement>(null)
  const orbRef     = useRef<HTMLDivElement>(null)
  const videoRef   = useRef<HTMLVideoElement>(null)

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })

  const headlineY = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
  const headlineO = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const subY      = useTransform(scrollYProgress, [0, 1], ['0%', '36%'])
  const videoY    = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const videoScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.14])
  const videoOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const orbScrollY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const springCfg = { stiffness: 40, damping: 18, mass: 1 }
  const sX = useSpring(rawX, springCfg)
  const sY = useSpring(rawY, springCfg)
  const h1X  = useTransform(sX, v => v * 22)
  const h1Y  = useTransform(sY, v => v * 14)
  const h2X  = useTransform(sX, v => v * 14)
  const h2Y  = useTransform(sY, v => v * 9)
  const subX = useTransform(sX, v => v * -8)
  const subYp = useTransform(sY, v => v * -5)

  useEffect(() => {
    if (isMobile) return
    const onMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth  - 0.5
      const ny = e.clientY / window.innerHeight - 0.5
      rawX.set(nx)
      rawY.set(ny)
      if (orbRef.current) {
        orbRef.current.style.transform = `translate(calc(-50% + ${nx * 40}px), calc(-50% + ${ny * 20}px))`
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [rawX, rawY, isMobile])

  useEffect(() => {
    if (isMobile) return
    const video = videoRef.current
    if (!video) return
    return scrollYProgress.on('change', v => {
      if (video.readyState >= 2 && isFinite(video.duration)) {
        video.currentTime = v * video.duration
      }
    })
  }, [scrollYProgress, isMobile])

  // Smooth stagger — content starts while intro overlay is still fading out
  const d = (n: number) => ({ delay: n, duration: 1.4, ease: EASE })

  return (
    <>
      <AnimatePresence>
        {introVisible && (
          <Intro
            onContentStart={() => setContentVisible(true)}
            onDone={() => { sessionStorage.setItem('intro-seen', '1'); setIntroVisible(false) }}
          />
        )}
      </AnimatePresence>

      {/* Outer section is tall on desktop — gives scroll room so video scrubs slowly. Mobile: normal height */}
      <section ref={sectionRef} style={{ height: isMobile ? '100dvh' : '220dvh' }}>
      {/* Sticky inner — stays in viewport while the outer section scrolls */}
      <div
        style={{ position: 'sticky', top: 0, height: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 'clamp(7rem,15vh,10rem) clamp(1.5rem,5vw,5rem) clamp(3rem,8vh,5.5rem)', overflow: 'hidden', background: 'var(--bg)' }}
      >
        {/* Background video */}
        <motion.div
          className="hero-video"
          style={{ position: 'absolute', inset: '-10%', y: videoY, scale: videoScale, opacity: videoOpacity, zIndex: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: contentVisible ? 1 : 0 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
        >
          <video
            ref={videoRef}
            src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/images/hero-bg.mp4`}
            muted playsInline preload="auto"
            autoPlay={isMobile} loop={isMobile}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(to bottom, rgba(247,245,242,0.92) 0%, rgba(247,245,242,0.58) 35%, rgba(247,245,242,0.58) 65%, rgba(247,245,242,0.92) 100%), linear-gradient(to right, rgba(247,245,242,0.7) 0%, transparent 30%, transparent 70%, rgba(247,245,242,0.7) 100%)`,
          }} />
        </motion.div>

        {/* Orb — mint tint */}
        <motion.div style={{ position: 'absolute', top: '38%', left: '58%', zIndex: 1, y: orbScrollY }}>
          <div ref={orbRef} style={{ width: '48vw', height: '48vw', maxWidth: 560, maxHeight: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,201,168,0.08) 0%, transparent 70%)', transform: 'translate(-50%,-50%)', pointerEvents: 'none', willChange: 'transform' }} />
        </motion.div>

        {/* Top border */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'var(--border)', zIndex: 2 }} />

        {/* Local time */}
        <motion.div
          style={{ position: 'absolute', top: 'clamp(5.5rem,11vh,7.5rem)', right: 'clamp(1.5rem,5vw,5rem)', zIndex: 2 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: contentVisible ? 1 : 0, y: contentVisible ? 0 : 10 }}
          transition={{ delay: 0.6, duration: 1.2, ease: EASE }}
        >
          <LocalTime />
        </motion.div>

        {/* ── Headline block ── */}
        <motion.div style={{ y: headlineY, opacity: headlineO, position: 'relative', zIndex: 2 }}>

          {/* Label */}
          <motion.div
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'clamp(1.2rem,2.5vh,2rem)' }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: contentVisible ? 1 : 0, y: contentVisible ? 0 : 24 }}
            transition={d(0)}
          >
            <div style={{ width: 18, height: 1, background: 'var(--accent)' }} />
            <span className="tag">Content Generalist · München</span>
          </motion.div>

          {/* Line 1 — slides up */}
          <motion.div
            style={{ x: h1X, y: h1Y }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: contentVisible ? 1 : 0, y: contentVisible ? 0 : 50 }}
            transition={d(0.12)}
          >
            <span style={{ display: 'block', fontFamily: 'var(--ff-mono)', fontWeight: 400, fontSize: 'clamp(0.7rem, 1.1vw, 0.88rem)', color: 'var(--fg-faint)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.6em' }}>
              Video · Foto · Grafik · Motion · KI
            </span>
          </motion.div>

          {/* Line 2 — slides up, slightly delayed */}
          <motion.div
            style={{ x: h2X, y: h2Y }}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: contentVisible ? 1 : 0, y: contentVisible ? 0 : 60 }}
            transition={d(0.26)}
          >
            <h1 className="font-display" style={{ fontSize: 'clamp(3.5rem, 9vw, 8.5rem)', fontWeight: 800, color: 'var(--fg)', lineHeight: 0.92, letterSpacing: '-0.03em' }}>
              Content{' '}
              <em style={{ fontFamily: '"Georgia", serif', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>
                Generalist.
              </em>
            </h1>
          </motion.div>
        </motion.div>

        {/* Sub row */}
        <motion.div style={{ y: subY, position: 'relative', zIndex: 2 }}>
          <motion.div
            style={{ x: subX, y: subYp, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem', marginTop: 'clamp(1.8rem,4vh,3.2rem)' }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: contentVisible ? 1 : 0, y: contentVisible ? 0 : 40 }}
            transition={d(0.45)}
          >
            <p style={{ fontFamily: 'var(--ff-body)', fontSize: 'clamp(0.88rem,1.2vw,1rem)', color: 'var(--fg-mid)', maxWidth: '38ch', lineHeight: 1.8, fontWeight: 300 }}>
              Einer, der Video, Foto, Grafik, Animation und KI selbst macht — von der Idee bis zum fertigen File.
            </p>
            <MagneticLink href="#projects">
              Arbeiten ansehen
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </MagneticLink>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          style={{ position: 'absolute', bottom: '1.8rem', left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: contentVisible ? 1 : 0 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          <motion.div
            style={{ width: 1, height: 32, background: 'linear-gradient(to bottom, var(--fg-faint), transparent)' }}
            animate={{ scaleY: [0, 1, 0], originY: 0 }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
      </section>
    </>
  )
}
