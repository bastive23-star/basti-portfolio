'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { EASE } from '@/lib/motion'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const DIR  = `${BASE}/images/projects/AI_Production`

// Row 1 — landscape 16:9 mixed in for variety
const ROW1 = [
  'Aral-Kaffeestudie_AI_Actionfiguren_9x16.mp4',
  'PH_Sterilium_2In1Wipes_Story2_ParisCityTrip_9x16.mp4',
  'PH_Sterilium_HeroVideo_16x9.mp4',
  'PH_Sterilium_2In1Wipes_Story3_FamilyOnTrain_9x16.mp4',
  'PH_WCW_AI_Campaign_Father&Daughter_9x16.mp4',
  'PH_Sterilium_2In1Wipes_Story5_Festival_9x16.mp4',
  'cB_ChristmasOffice.mp4',
  'cB_SwipeAIMix.mp4',
].map(f => `${DIR}/${f}`)

// Row 2
const ROW2 = [
  'PH_WCW_AI_Campaign_GirlsGroup_9x16.mp4',
  'cB_NarratorTrend_AlleineWohnen.mp4',
  'PH_Sterilium_SurfaceWipes_Story2_BabyFood_9x16.mp4',
  'PH_WCW_AI_Campaign_Husband&Wife_9x16.mp4',
  'cB_NarratorTrend_Zocken.mp4',
  'cB!_OstereierZeitpunktInvestieren_Reel.mp4',
  'cB_AI-Betten_TikTok.mp4',
].map(f => `${DIR}/${f}`)

const ALL_VIDEOS = [...ROW1, ...ROW2]
const HEADER_H   = 56

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ src, muted, onToggleMute, onClose, onPrev, onNext }: {
  src: string
  muted: boolean
  onToggleMute: () => void
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const touchStart = useRef<number | null>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'ArrowLeft')  onPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [onClose, onPrev, onNext])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      onClick={onClose}
      onTouchStart={e => { touchStart.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        if (touchStart.current === null) return
        const dx = e.changedTouches[0].clientX - touchStart.current
        if (dx > 50) onPrev()
        if (dx < -50) onNext()
        touchStart.current = null
      }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.video
          key={src}
          src={src}
          autoPlay
          loop
          muted={muted}
          playsInline
          onClick={e => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.88, filter: 'blur(12px)' }}
          animate={{ opacity: 1, scale: 1,    filter: 'blur(0px)' }}
          exit={{    opacity: 0, scale: 1.06, filter: 'blur(8px)' }}
          transition={{ duration: 0.45, ease: EASE }}
          style={{
            position: 'relative', zIndex: 1,
            maxWidth: 'min(88vw, 1100px)',
            maxHeight: '86dvh',
            width: 'auto', height: 'auto',
            borderRadius: 8,
            boxShadow: '0 48px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
            display: 'block',
          } as React.CSSProperties}
        />
      </AnimatePresence>

      {/* Prev */}
      <motion.button
        onClick={e => { e.stopPropagation(); onPrev() }}
        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
        whileHover={{ x: -3, color: '#fff' }} transition={{ duration: 0.25, ease: EASE }}
        style={{ position: 'fixed', left: 'clamp(1rem,3vw,2.5rem)', top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'none', border: 'none', padding: '1.2rem', color: 'rgba(255,255,255,0.3)', cursor: 'none' }}
        aria-label="Vorheriges Video"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M13 3L6 10l7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.button>

      {/* Next */}
      <motion.button
        onClick={e => { e.stopPropagation(); onNext() }}
        initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
        whileHover={{ x: 3, color: '#fff' }} transition={{ duration: 0.25, ease: EASE }}
        style={{ position: 'fixed', right: 'clamp(1rem,3vw,2.5rem)', top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'none', border: 'none', padding: '1.2rem', color: 'rgba(255,255,255,0.3)', cursor: 'none' }}
        aria-label="Nächstes Video"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M7 3l7 7-7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.button>

      {/* Close */}
      <motion.button
        onClick={e => { e.stopPropagation(); onClose() }}
        initial={{ opacity: 0, rotate: -45 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }}
        whileHover={{ rotate: 90, color: '#fff' }} transition={{ duration: 0.3, ease: EASE }}
        style={{ position: 'fixed', top: 'clamp(1.2rem,3vh,2rem)', right: 'clamp(1.2rem,3vw,2.5rem)', zIndex: 2, background: 'none', border: 'none', padding: '0.8rem', color: 'rgba(255,255,255,0.35)', cursor: 'none' }}
        aria-label="Schließen"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      </motion.button>

      {/* Mute toggle */}
      <motion.button
        onClick={e => { e.stopPropagation(); onToggleMute() }}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
        whileHover={{ color: '#fff' }} transition={{ duration: 0.25, ease: EASE }}
        style={{ position: 'fixed', top: 'clamp(1.2rem,3vh,2rem)', left: 'clamp(1.2rem,3vw,2.5rem)', zIndex: 2, background: 'none', border: 'none', padding: '0.8rem', color: 'rgba(255,255,255,0.35)', cursor: 'none' }}
        aria-label={muted ? 'Ton einschalten' : 'Ton ausschalten'}
      >
        {muted ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 6.5h3l4-3.5v12l-4-3.5H2V6.5zM14 6l-3 3m0-3l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 6.5h3l4-3.5v12l-4-3.5H2V6.5zM13 5.5a4 4 0 010 7M11 7a2 2 0 010 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </motion.button>

      {/* Counter */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        style={{
          position: 'fixed', bottom: '1.8rem', left: '50%', transform: 'translateX(-50%)',
          zIndex: 2, pointerEvents: 'none',
          fontFamily: 'var(--ff-mono)', fontSize: '0.55rem',
          letterSpacing: '0.24em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.22)',
        }}
      >
        {String(ALL_VIDEOS.indexOf(src) + 1).padStart(2, '0')}
        &thinsp;/&thinsp;
        {String(ALL_VIDEOS.length).padStart(2, '0')}
      </motion.div>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AIProductionPage() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [scrollPct, setScrollPct] = useState(0)
  const [active, setActive]       = useState<string | null>(null)
  const [muted, setMuted]         = useState(true)

  const close         = useCallback(() => setActive(null), [])
  const toggleMute    = useCallback(() => setMuted(m => !m), [])
  const prev = useCallback(() => {
    setActive(s => {
      if (!s) return s
      const i = ALL_VIDEOS.indexOf(s)
      return ALL_VIDEOS[(i - 1 + ALL_VIDEOS.length) % ALL_VIDEOS.length]
    })
  }, [])
  const next = useCallback(() => {
    setActive(s => {
      if (!s) return s
      const i = ALL_VIDEOS.indexOf(s)
      return ALL_VIDEOS[(i + 1) % ALL_VIDEOS.length]
    })
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
      e.preventDefault()
      track.scrollLeft += e.deltaY * 1.4
    }
    const onScroll = () => {
      const max = track.scrollWidth - track.clientWidth
      setScrollPct(max > 0 ? track.scrollLeft / max : 0)
    }
    track.addEventListener('wheel', onWheel, { passive: false })
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      track.removeEventListener('wheel', onWheel)
      track.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <>
      <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>

        {/* ── Header ── */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{
            flexShrink: 0, height: HEADER_H,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 clamp(1.2rem, 4vw, 3.5rem)',
            borderBottom: '1px solid var(--border)',
            background: 'rgba(247,245,242,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            zIndex: 10,
          }}
        >
          <motion.div whileHover={{ x: -3 }} transition={{ duration: 0.22, ease: EASE }}>
            <Link
              href="/#projects"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                fontFamily: 'var(--ff-mono)', fontSize: '0.65rem',
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'var(--fg-mid)', textDecoration: 'none', transition: 'color 0.2s',
                fontWeight: 500,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-mid)')}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M9 6.5H4M6 4L3.5 6.5 6 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Zurück
            </Link>
          </motion.div>

          <span style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.03em', color: 'var(--fg)' }}>
            AI<em style={{ fontFamily: '"Georgia", serif', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}> Production</em>
          </span>

          <span className="font-mono" style={{ fontSize: '0.58rem', letterSpacing: '0.18em', color: 'var(--fg-faint)' }}>
            {ALL_VIDEOS.length} Videos
          </span>
        </motion.header>

        {/* ── Horizontal scroll track ── */}
        <div
          ref={trackRef}
          style={{
            flex: 1, minHeight: 0,
            overflowX: 'auto', overflowY: 'hidden',
            display: 'flex', flexDirection: 'column',
            gap: '0.6rem',
            padding: '0.75rem 0 0.75rem clamp(1rem, 3vw, 2.5rem)',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          <style>{`::-webkit-scrollbar { display: none }`}</style>

          {[ROW1, ROW2].map((row, rowIdx) => (
            <div
              key={rowIdx}
              style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'row', gap: '0.6rem', alignItems: 'stretch' }}
            >
              {row.map((src, i) => (
                <motion.div
                  key={src}
                  initial={{ opacity: 0, y: rowIdx === 0 ? -12 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: EASE, delay: i * 0.03 }}
                  onClick={() => setActive(src)}
                  data-cursor="Play"
                  style={{ flexShrink: 0, borderRadius: 5, overflow: 'hidden', background: 'var(--bg-muted)', cursor: 'none', position: 'relative' }}
                >
                  <motion.video
                    src={src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    style={{ height: '100%', width: 'auto', display: 'block', userSelect: 'none', pointerEvents: 'none' } as React.CSSProperties}
                  />
                  {/* Play icon on hover */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(0,0,0,0.18)', pointerEvents: 'none',
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(8px)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 2l7 4-7 4V2z" fill="white"/>
                      </svg>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
              <div style={{ flexShrink: 0, width: 'clamp(1rem, 3vw, 2.5rem)' }} />
            </div>
          ))}
        </div>

        {/* ── Scroll progress bar ── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{
            flexShrink: 0, height: 32,
            display: 'flex', alignItems: 'center',
            padding: '0 clamp(1rem, 3vw, 2.5rem)',
            borderTop: '1px solid var(--border)',
            gap: '1rem',
          }}
        >
          <span className="font-mono" style={{ fontSize: '0.52rem', letterSpacing: '0.16em', color: 'var(--fg-faint)', whiteSpace: 'nowrap' }}>
            Scroll →
          </span>
          <div style={{ flex: 1, height: 2, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div style={{ height: '100%', background: 'var(--accent)', borderRadius: 99, originX: 0, scaleX: scrollPct }} />
          </div>
        </motion.div>
      </div>

      {/* ── Backdrop ── */}
      <motion.div
        animate={{ opacity: active ? 1 : 0, pointerEvents: active ? 'auto' : 'none' }}
        transition={{ duration: 0.45, ease: EASE }}
        onClick={close}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(11,10,8,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      />

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {active && (
          <Lightbox src={active} muted={muted} onToggleMute={toggleMute} onClose={close} onPrev={prev} onNext={next} />
        )}
      </AnimatePresence>
    </>
  )
}
