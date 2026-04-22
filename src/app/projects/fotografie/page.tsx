'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { EASE } from '@/lib/motion'
import { EndCardTile } from '@/components/VideoGalleryPage'


const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

// Row 1 — 14 images, 5 landscape spread evenly: ↕↔↕↔↕↔↕↕↔↕↔↕↕↕
const ROW1 = [
  'AI_AfterHour145.webp',   // ↕ portrait
  'AI_AfterHour183.webp',   // ↔ landscape
  'AI_AfterHour177.webp',   // ↕ portrait
  'AI_AfterHour73.webp',    // ↔ landscape
  'AI_AfterHour184.webp',   // ↕ portrait
  'Byte_Office-74.webp',    // ↔ landscape
  'AI_AfterHour230.webp',   // ↕ portrait
  'AI_AfterHour243.webp',   // ↕ portrait
  'DSC02197.webp',          // ↔ landscape
  'DSC01010.webp',          // ↕ portrait
  'DSC02934.webp',          // ↔ landscape
  'Byte_Office-22.webp',                    // ↕ portrait
  'DSC02397.webp',                          // ↕ portrait
  'DSC09727.webp',                          // ↕ portrait
  'RS_Mitarbeitershootings_2506-967.webp',  // ↕ portrait
].map(f => `${BASE}/images/projects/Fotografie/${f}`)

// Row 2 — 17 images, 4 landscape spread evenly: ↕↕↔↕↕↕↔↕↕↕↔↕↕↕↔↕↕
const ROW2 = [
  'DSC09871-2.webp',                       // ↕ portrait
  'DSCF0161.webp',                         // ↕ portrait
  'Byte_Office-86.webp',                   // ↔ landscape
  'DSCF1055.webp',                         // ↕ portrait
  'DSCF1079.webp',                         // ↕ portrait
  'DSCF1129.webp',                         // ↕ portrait
  'DSCF0040.webp',                         // ↔ landscape
  'DSCF1131.webp',                         // ↕ portrait
  'DSCF1136.webp',                         // ↕ portrait
  'DSCF1169.webp',                         // ↕ portrait
  'DSCF0047.webp',                         // ↔ landscape
  'DSCF1175.webp',                         // ↕ portrait
  'DSCF1314.webp',                         // ↕ portrait
  'RS_Mitarbeitershootings_2506-3634.webp', // ↕ portrait
  'DSCF0062.webp',                         // ↔ landscape
  'RS_Mitarbeitershootings_2506-853.webp',  // ↕ portrait
].map(f => `${BASE}/images/projects/Fotografie/${f}`)

const ALL_IMAGES = [...ROW1, ...ROW2]
const HEADER_H = 56

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ src, onClose, onPrev, onNext }: {
  src: string; onClose: () => void; onPrev: () => void; onNext: () => void
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
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'default',
      }}
    >

      {/* Image — scales up from its grid position feel */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.img
          key={src}
          src={src}
          alt=""
          onClick={e => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.88, filter: 'blur(12px)' }}
          animate={{ opacity: 1, scale: 1,    filter: 'blur(0px)' }}
          exit={{    opacity: 0, scale: 1.06, filter: 'blur(8px)' }}
          transition={{ duration: 0.45, ease: EASE }}
          style={{
            position: 'relative', zIndex: 1,
            maxWidth: 'min(92vw, 1200px)',
            maxHeight: '88dvh',
            width: 'auto', height: 'auto',
            objectFit: 'contain',
            borderRadius: 8,
            boxShadow: '0 48px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
            display: 'block',
            userSelect: 'none',
          } as React.CSSProperties}
        />
      </AnimatePresence>

      {/* Prev */}
      <motion.button
        onClick={e => { e.stopPropagation(); onPrev() }}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        whileHover={{ x: -3, color: '#fff' }}
        transition={{ duration: 0.25, ease: EASE }}
        style={{
          position: 'fixed', left: 'clamp(1rem,3vw,2.5rem)', top: '50%', transform: 'translateY(-50%)',
          zIndex: 2, background: 'none', border: 'none', padding: '1.2rem',
          color: 'rgba(255,255,255,0.3)', cursor: 'default',
        }}
        aria-label="Vorheriges Bild"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M13 3L6 10l7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.button>

      {/* Next */}
      <motion.button
        onClick={e => { e.stopPropagation(); onNext() }}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        whileHover={{ x: 3, color: '#fff' }}
        transition={{ duration: 0.25, ease: EASE }}
        style={{
          position: 'fixed', right: 'clamp(1rem,3vw,2.5rem)', top: '50%', transform: 'translateY(-50%)',
          zIndex: 2, background: 'none', border: 'none', padding: '1.2rem',
          color: 'rgba(255,255,255,0.3)', cursor: 'default',
        }}
        aria-label="Nächstes Bild"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M7 3l7 7-7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.button>

      {/* Close */}
      <motion.button
        onClick={e => { e.stopPropagation(); onClose() }}
        initial={{ opacity: 0, rotate: -45 }}
        animate={{ opacity: 1, rotate: 0 }}
        exit={{ opacity: 0 }}
        whileHover={{ rotate: 90, color: '#fff' }}
        transition={{ duration: 0.3, ease: EASE }}
        style={{
          position: 'fixed', top: 'clamp(1.2rem,3vh,2rem)', right: 'clamp(1.2rem,3vw,2.5rem)',
          zIndex: 2, background: 'none', border: 'none', padding: '0.8rem',
          color: 'rgba(255,255,255,0.5)', cursor: 'default',
        }}
        aria-label="Schließen"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      </motion.button>

      {/* Counter */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        style={{
          position: 'fixed', bottom: '1.8rem', left: '50%', transform: 'translateX(-50%)',
          zIndex: 2, pointerEvents: 'none',
          fontFamily: 'var(--ff-mono)', fontSize: '0.55rem',
          letterSpacing: '0.24em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.22)',
        }}
      >
        {String(ALL_IMAGES.indexOf(src) + 1).padStart(2, '0')}
        &thinsp;/&thinsp;
        {String(ALL_IMAGES.length).padStart(2, '0')}
      </motion.div>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function FotografiePage() {
  const trackRef  = useRef<HTMLDivElement>(null)
  const [scrollPct, setScrollPct] = useState(0)
  const [active, setActive]       = useState<string | null>(null)

  const close = useCallback(() => setActive(null), [])
  const prev  = useCallback(() => {
    setActive(s => {
      if (!s) return s
      const i = ALL_IMAGES.indexOf(s)
      return ALL_IMAGES[(i - 1 + ALL_IMAGES.length) % ALL_IMAGES.length]
    })
  }, [])
  const next = useCallback(() => {
    setActive(s => {
      if (!s) return s
      const i = ALL_IMAGES.indexOf(s)
      return ALL_IMAGES[(i + 1) % ALL_IMAGES.length]
    })
  }, [])

  // Vertical wheel → horizontal scroll
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
          <motion.div whileHover={{ x: -2 }} transition={{ duration: 0.22, ease: EASE }}>
            <Link
              href="/#projects"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                fontFamily: 'var(--ff-mono)', fontSize: '0.62rem',
                letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500,
                color: 'var(--fg-mid)', textDecoration: 'none',
                border: '1px solid var(--border)',
                borderRadius: 6, padding: '0.4rem 0.85rem',
                background: 'transparent',
                transition: 'color 0.2s, border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'transparent' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg-mid)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent' }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M9 6.5H4M6 4L3.5 6.5 6 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Zurück
            </Link>
          </motion.div>

          <span style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.03em', color: 'var(--fg)' }}>
            Foto<em style={{ fontFamily: '"Georgia", serif', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>grafie</em>
          </span>

          <span className="font-mono" style={{ fontSize: '0.58rem', letterSpacing: '0.18em', color: 'var(--fg-faint)' }}>
            {ALL_IMAGES.length} Bilder
          </span>
        </motion.header>

        {/* ── Horizontal scroll track ── */}
        <div
          ref={trackRef}
          style={{
            flex: 1, minHeight: 0, height: 0,
            position: 'relative',
            overflowX: 'auto', overflowY: 'hidden',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            overscrollBehaviorX: 'contain',
          } as React.CSSProperties}
        >
          <style>{`::-webkit-scrollbar { display: none }`}</style>

          {[ROW1, ROW2].map((row, rowIdx) => (
            <div
              key={rowIdx}
              style={{
                position: 'absolute',
                left: 'clamp(1rem, 3vw, 2.5rem)',
                top: rowIdx === 0 ? '0.75rem' : 'calc(50% + 0.3rem)',
                height: 'calc(50% - 1.05rem)',
                display: 'flex',
                gap: '0.6rem',
                alignItems: 'stretch',
              }}
            >
              {row.map((src, i) => (
                <motion.div
                  key={src}
                  initial={{ opacity: 0, y: rowIdx === 0 ? -12 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: EASE, delay: i * 0.025 }}
                  onClick={() => setActive(src)}
                  data-cursor="View"
                  style={{
                    flexShrink: 0, borderRadius: 5,
                    overflow: 'hidden', background: 'var(--bg-muted)',
                    cursor: 'none', position: 'relative',
                    height: '100%',
                  }}
                >
                  <motion.img
                    src={src}
                    alt=""
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    style={{
                      height: '100%', width: 'auto',
                      display: 'block', userSelect: 'none',
                    } as React.CSSProperties}
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      position: 'absolute', inset: 0, pointerEvents: 'none',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)',
                    }}
                  />
                </motion.div>
              ))}
              {rowIdx === 1 && <EndCardTile fromRow={1} />}
            </div>
          ))}
        </div>

        {/* ── Scroll progress bar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
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

      {/* ── Backdrop — always mounted so blur is pre-composited, no jump on open ── */}
      <motion.div
        animate={{ opacity: active ? 1 : 0, pointerEvents: active ? 'auto' : 'none' }}
        transition={{ duration: 0.45, ease: EASE }}
        onClick={close}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(11,10,8,0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      />

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {active && (
          <Lightbox src={active} onClose={close} onPrev={prev} onNext={next} />
        )}
      </AnimatePresence>
    </>
  )
}
