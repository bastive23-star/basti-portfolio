'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import Link from 'next/link'
import { EASE } from '@/lib/motion'

// ── Helpers ──────────────────────────────────────────────────────────────────
const isVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src)

function thumbFor(src: string) {
  const lastSlash = src.lastIndexOf('/')
  const dir  = src.slice(0, lastSlash)
  const name = src.slice(lastSlash + 1).replace(/\.mp4$/i, '')
  return `${dir}/thumbs/${name}.jpg`
}

function VideoItem({ src, delay, rowIdx, onClick }: {
  src: string; delay: number; rowIdx: number; onClick: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: rowIdx === 0 ? -12 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE, delay }}
      onClick={onClick}
      onHoverStart={() => { videoRef.current?.play().catch(() => {}); setPlaying(true) }}
      onHoverEnd={() => { videoRef.current?.pause(); if (videoRef.current) videoRef.current.currentTime = 0; setPlaying(false) }}
      data-cursor="Play"
      style={{ flexShrink: 0, borderRadius: 5, overflow: 'hidden', cursor: 'inherit', position: 'relative', height: '100%' }}
    >
      <img
        src={thumbFor(src)}
        alt=""
        style={{ height: '100%', width: 'auto', display: 'block', userSelect: 'none', pointerEvents: 'none' } as React.CSSProperties}
      />
      <video
        ref={videoRef}
        src={src}
        loop muted playsInline
        preload="none"
        style={{
          position: 'absolute', inset: 0,
          height: '100%', width: '100%', objectFit: 'cover',
          display: 'block', userSelect: 'none', pointerEvents: 'none',
          opacity: playing ? 1 : 0, transition: 'opacity 0.3s ease',
        } as React.CSSProperties}
      />
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: playing ? 0 : 1, transition: 'opacity 0.3s ease', pointerEvents: 'none',
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.16)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 2l7 4-7 4V2z" fill="white"/>
          </svg>
        </div>
      </div>
    </motion.div>
  )
}

function ImageItem({ src, delay, rowIdx, onClick }: {
  src: string; delay: number; rowIdx: number; onClick: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: rowIdx === 0 ? -12 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE, delay }}
      onClick={onClick}
      data-cursor="View"
      style={{ flexShrink: 0, borderRadius: 5, overflow: 'hidden', cursor: 'inherit', position: 'relative', height: '100%' }}
    >
      <img src={src} alt=""
        style={{ height: '100%', width: 'auto', display: 'block', userSelect: 'none', pointerEvents: 'none' } as React.CSSProperties}
      />
    </motion.div>
  )
}

function CarouselItem({ pages, delay, rowIdx, onClick }: {
  pages: string[]; delay: number; rowIdx: number; onClick: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: rowIdx === 0 ? -12 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE, delay }}
      onClick={onClick}
      data-cursor="View"
      style={{ flexShrink: 0, borderRadius: 5, overflow: 'hidden', cursor: 'inherit', position: 'relative', height: '100%' }}
    >
      <img src={pages[0]} alt=""
        style={{ height: '100%', width: 'auto', display: 'block', userSelect: 'none', pointerEvents: 'none' } as React.CSSProperties}
      />
      <div style={{
        position: 'absolute', top: 8, right: 8,
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        borderRadius: 4, padding: '3px 7px',
        display: 'flex', alignItems: 'center', gap: 5,
        color: '#fff', fontFamily: 'var(--ff-mono)', fontSize: '0.5rem', letterSpacing: '0.12em',
        pointerEvents: 'none',
      }}>
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <rect x="1" y="3" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.1"/>
          <rect x="3" y="1" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.1" strokeDasharray="2 1.5"/>
        </svg>
        {pages.length}
      </div>
    </motion.div>
  )
}

// ── Carousel lightbox ─────────────────────────────────────────────────────────
function CarouselLightbox({ pages, onClose }: { pages: string[]; onClose: () => void }) {
  const [idx, setIdx] = useState(0)
  const touchStart = useRef<number | null>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % pages.length)
      if (e.key === 'ArrowLeft')  setIdx(i => (i - 1 + pages.length) % pages.length)
    }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [onClose, pages.length])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      onClick={onClose}
      onTouchStart={e => { touchStart.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        if (touchStart.current === null) return
        const dx = e.changedTouches[0].clientX - touchStart.current
        if (dx > 50) setIdx(i => (i - 1 + pages.length) % pages.length)
        if (dx < -50) setIdx(i => (i + 1) % pages.length)
        touchStart.current = null
      }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default' }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.img
          key={idx} src={pages[idx]} alt=""
          onClick={e => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.88, filter: 'blur(12px)' }}
          animate={{ opacity: 1, scale: 1,    filter: 'blur(0px)' }}
          exit={{    opacity: 0, scale: 1.06, filter: 'blur(8px)' }}
          transition={{ duration: 0.45, ease: EASE }}
          style={{ position: 'relative', zIndex: 1, maxWidth: 'min(88vw, 1100px)', maxHeight: '86dvh', width: 'auto', height: 'auto', borderRadius: 8, boxShadow: '0 48px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)', display: 'block' } as React.CSSProperties}
        />
      </AnimatePresence>

      <motion.button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + pages.length) % pages.length) }}
        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
        whileHover={{ x: -3, color: '#fff' }} transition={{ duration: 0.25, ease: EASE }}
        style={{ position: 'fixed', left: 'clamp(1rem,3vw,2.5rem)', top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'none', border: 'none', padding: '1.2rem', color: 'rgba(255,255,255,0.3)', cursor: 'default' }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 3L6 10l7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </motion.button>

      <motion.button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % pages.length) }}
        initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
        whileHover={{ x: 3, color: '#fff' }} transition={{ duration: 0.25, ease: EASE }}
        style={{ position: 'fixed', right: 'clamp(1rem,3vw,2.5rem)', top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'none', border: 'none', padding: '1.2rem', color: 'rgba(255,255,255,0.3)', cursor: 'default' }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 3l7 7-7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </motion.button>

      <motion.button onClick={e => { e.stopPropagation(); onClose() }}
        initial={{ opacity: 0, rotate: -45 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }}
        whileHover={{ rotate: 90, color: '#fff' }} transition={{ duration: 0.3, ease: EASE }}
        style={{ position: 'fixed', top: 'clamp(1.2rem,3vh,2rem)', right: 'clamp(1.2rem,3vw,2.5rem)', zIndex: 2, background: 'none', border: 'none', padding: '0.8rem', color: 'rgba(255,255,255,0.5)', cursor: 'default' }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        style={{ position: 'fixed', bottom: 'clamp(1.4rem,3vh,2.4rem)', left: 0, right: 0, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', pointerEvents: 'none' }}
      >
        <div style={{ display: 'flex', gap: 5 }}>
          {pages.map((_, i) => (
            <motion.button key={i} onClick={e => { e.stopPropagation(); setIdx(i) }}
              style={{ pointerEvents: 'auto', background: 'none', border: 'none', padding: '4px', cursor: 'default' }}
            >
              <motion.div
                animate={{ width: i === idx ? 16 : 5, background: i === idx ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)' }}
                style={{ height: 5, borderRadius: 99 }} transition={{ duration: 0.25 }}
              />
            </motion.button>
          ))}
        </div>
        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.52rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)' }}>
          {String(idx + 1).padStart(2, '0')}&thinsp;/&thinsp;{String(pages.length).padStart(2, '0')}
        </span>
      </motion.div>
    </motion.div>
  )
}

// ── Magnetic link ─────────────────────────────────────────────────────────────
export function MagneticLink({ href, children }: { href: string; children: React.ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 280, damping: 18 })
  const sy = useSpring(y, { stiffness: 280, damping: 18 })
  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    x.set((e.clientX - (r.left + r.width  / 2)) * 0.38)
    y.set((e.clientY - (r.top  + r.height / 2)) * 0.38)
  }
  return (
    <motion.a ref={ref} href={href} target="_blank" rel="noopener noreferrer"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'var(--ff-mono)', fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.08em', textDecoration: 'none', background: 'var(--accent)', color: '#fff', padding: '0.8rem 1.4rem', borderRadius: 6, x: sx, y: sy }}
      onMouseMove={onMove} onMouseLeave={() => { x.set(0); y.set(0) }}
      whileHover={{ scale: 1.05 }} transition={{ scale: { duration: 0.2 } }}
    >
      {children}
    </motion.a>
  )
}


export function EndCardTile({ fromRow = 0 }: { fromRow?: 0 | 1 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: fromRow === 0 ? -12 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE, delay: 0.25 }}
      style={{
        flexShrink: 0,
        height: 'calc(200% + 0.6rem)',
        position: 'relative',
        top: fromRow === 1 ? 'calc(-100% - 0.6rem)' : 0,
        width: 'clamp(260px, 26vw, 400px)',
        borderRadius: 5, overflow: 'hidden',
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'flex-start',
        padding: 'clamp(1.2rem, 2vw, 1.8rem)',
        zIndex: 10,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
        <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.5rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--fg-faint)', margin: 0 }}>Let&apos;s talk</p>
        <h3 style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 'clamp(1.1rem, 1.6vw, 1.5rem)', color: 'var(--fg)', lineHeight: 1.3, margin: 0 }}>
          Lass uns bei einem<br />Cappuccino{' '}
          <em style={{ fontFamily: 'var(--ff-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>tiefer eintauchen.</em>
        </h3>
        <MagneticLink href="https://www.linkedin.com/in/sebastian-vitzthum-101154180/">
          Slide in my DMs
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 11L11 1M11 1H4M11 1v7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </MagneticLink>
      </div>
    </motion.div>
  )
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ src, allSrcs, muted, onToggleMute, onClose, onPrev, onNext }: {
  src: string; allSrcs: string[]; muted: boolean
  onToggleMute: () => void; onClose: () => void; onPrev: () => void; onNext: () => void
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
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      onClick={onClose}
      onTouchStart={e => { touchStart.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        if (touchStart.current === null) return
        const dx = e.changedTouches[0].clientX - touchStart.current
        if (dx > 50) onPrev(); if (dx < -50) onNext()
        touchStart.current = null
      }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default' }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isVideo(src) ? (
          <motion.video key={src} src={src} autoPlay loop muted={muted} playsInline
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.88, filter: 'blur(12px)' }}
            animate={{ opacity: 1, scale: 1,    filter: 'blur(0px)' }}
            exit={{    opacity: 0, scale: 1.06, filter: 'blur(8px)' }}
            transition={{ duration: 0.45, ease: EASE }}
            style={{ position: 'relative', zIndex: 1, maxWidth: 'min(88vw, 1100px)', maxHeight: '86dvh', width: 'auto', height: 'auto', borderRadius: 8, boxShadow: '0 48px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)', display: 'block' } as React.CSSProperties}
          />
        ) : (
          <motion.img key={src} src={src} alt=""
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.88, filter: 'blur(12px)' }}
            animate={{ opacity: 1, scale: 1,    filter: 'blur(0px)' }}
            exit={{    opacity: 0, scale: 1.06, filter: 'blur(8px)' }}
            transition={{ duration: 0.45, ease: EASE }}
            style={{ position: 'relative', zIndex: 1, maxWidth: 'min(88vw, 1100px)', maxHeight: '86dvh', width: 'auto', height: 'auto', borderRadius: 8, boxShadow: '0 48px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)', display: 'block' } as React.CSSProperties}
          />
        )}
      </AnimatePresence>

      <motion.button onClick={e => { e.stopPropagation(); onPrev() }}
        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
        whileHover={{ x: -3, color: '#fff' }} transition={{ duration: 0.25, ease: EASE }}
        style={{ position: 'fixed', left: 'clamp(1rem,3vw,2.5rem)', top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'none', border: 'none', padding: '1.2rem', color: 'rgba(255,255,255,0.3)', cursor: 'default' }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 3L6 10l7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </motion.button>

      <motion.button onClick={e => { e.stopPropagation(); onNext() }}
        initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
        whileHover={{ x: 3, color: '#fff' }} transition={{ duration: 0.25, ease: EASE }}
        style={{ position: 'fixed', right: 'clamp(1rem,3vw,2.5rem)', top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'none', border: 'none', padding: '1.2rem', color: 'rgba(255,255,255,0.3)', cursor: 'default' }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 3l7 7-7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </motion.button>

      <motion.button onClick={e => { e.stopPropagation(); onClose() }}
        initial={{ opacity: 0, rotate: -45 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }}
        whileHover={{ rotate: 90, color: '#fff' }} transition={{ duration: 0.3, ease: EASE }}
        style={{ position: 'fixed', top: 'clamp(1.2rem,3vh,2rem)', right: 'clamp(1.2rem,3vw,2.5rem)', zIndex: 2, background: 'none', border: 'none', padding: '0.8rem', color: 'rgba(255,255,255,0.5)', cursor: 'default' }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        style={{ position: 'fixed', bottom: 'clamp(1.4rem,3vh,2.4rem)', left: 0, right: 0, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', pointerEvents: 'none' }}
      >
        {isVideo(src) && <motion.button
          onClick={e => { e.stopPropagation(); onToggleMute() }}
          whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}
          style={{ pointerEvents: 'auto', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 999, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', padding: '0.75rem 1.6rem', cursor: 'default', display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'rgba(255,255,255,0.9)', fontFamily: 'var(--ff-mono)', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}
        >
          {muted ? (
            <><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 6.5h3l4-3.5v12l-4-3.5H2V6.5zM14 6l-3 3m0-3l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Ton an</>
          ) : (
            <><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 6.5h3l4-3.5v12l-4-3.5H2V6.5zM13 5.5a4 4 0 010 7M11 7a2 2 0 010 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Ton aus</>
          )}
        </motion.button>}
        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.52rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)' }}>
          {String(allSrcs.indexOf(src) + 1).padStart(2, '0')}&thinsp;/&thinsp;{String(allSrcs.length).padStart(2, '0')}
        </span>
      </motion.div>
    </motion.div>
  )
}

// ── Shared gallery page ───────────────────────────────────────────────────────
type GalleryItem = string | string[]

interface Props {
  titleMain: string
  titleAccent: string
  row1: GalleryItem[]
  row2: GalleryItem[]
  rowOffset?: string
  endCardRow?: 0 | 1
}

export default function VideoGalleryPage({ titleMain, titleAccent, row1, row2, rowOffset = 'clamp(1.5rem, 2vw, 2.5rem)', endCardRow = 0 }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [scrollPct, setScrollPct] = useState(0)
  const [active, setActive]   = useState<string | null>(null)
  const [carousel, setCarousel] = useState<{ pages: string[] } | null>(null)
  const [muted, setMuted]     = useState(true)

  const allItems  = [...row1, ...row2]
  const allVideos = allItems.filter((item): item is string => typeof item === 'string')
  const videoCount = allVideos.filter(isVideo).length

  const close      = useCallback(() => setActive(null), [])
  const toggleMute = useCallback(() => setMuted(m => !m), [])
  const prev = useCallback(() => setActive(s => {
    if (!s) return s
    const i = allVideos.indexOf(s)
    return allVideos[(i - 1 + allVideos.length) % allVideos.length]
  }), [allVideos])
  const next = useCallback(() => setActive(s => {
    if (!s) return s
    const i = allVideos.indexOf(s)
    return allVideos[(i + 1) % allVideos.length]
  }), [allVideos])

  // Horizontal scroll via vertical wheel
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
    return () => { track.removeEventListener('wheel', onWheel); track.removeEventListener('scroll', onScroll) }
  }, [])


  return (
    <>
      <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>

        <motion.header
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{
            flexShrink: 0, height: 56,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 clamp(1.2rem, 4vw, 3.5rem)',
            borderBottom: '1px solid var(--border)',
            background: 'rgba(247,245,242,0.92)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            zIndex: 10,
          }}
        >
          <motion.div whileHover={{ x: -2 }} transition={{ duration: 0.22, ease: EASE }}>
            <Link href="/#projects"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                fontFamily: 'var(--ff-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500,
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
            {titleMain}<em style={{ fontFamily: '"Georgia", serif', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>{titleAccent}</em>
          </span>

          <span className="font-mono" style={{ fontSize: '0.58rem', letterSpacing: '0.18em', color: 'var(--fg-faint)' }}>
            {videoCount} Videos{allVideos.length > videoCount ? ` · ${allVideos.length - videoCount} Bilder` : ''}
          </span>
        </motion.header>

        <div
          ref={trackRef}
          style={{
            flex: 1, minHeight: 0, height: 0,
            position: 'relative',
            overflowX: 'auto', overflowY: 'hidden',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none', scrollbarWidth: 'none',
            overscrollBehaviorX: 'contain',
          } as React.CSSProperties}
        >
          <style>{`::-webkit-scrollbar { display: none }`}</style>
          {[row1, row2].map((row, rowIdx) => (
            <div
              key={rowIdx}
              style={{
                position: 'absolute',
                left: rowIdx === 0
                  ? 'clamp(1rem, 3vw, 2.5rem)'
                  : `calc(clamp(1rem, 3vw, 2.5rem) + ${rowOffset})`,
                top: rowIdx === 0 ? '0.75rem' : 'calc(50% + 0.3rem)',
                height: 'calc(50% - 1.05rem)',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'stretch',
                gap: '0.6rem',
              } as React.CSSProperties}
            >
              {row.map((item, i) => {
                if (Array.isArray(item)) {
                  return <CarouselItem key={item[0]} pages={item} delay={i * 0.03} rowIdx={rowIdx} onClick={() => setCarousel({ pages: item })} />
                }
                return isVideo(item)
                  ? <VideoItem  key={item} src={item} delay={i * 0.03} rowIdx={rowIdx} onClick={() => setActive(item)} />
                  : <ImageItem  key={item} src={item} delay={i * 0.03} rowIdx={rowIdx} onClick={() => setActive(item)} />
              })}
              {rowIdx === endCardRow && <EndCardTile key="endcard" fromRow={endCardRow} />}
            </div>
          ))}

        </div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ flexShrink: 0, height: 32, display: 'flex', alignItems: 'center', padding: '0 clamp(1rem, 3vw, 2.5rem)', borderTop: '1px solid var(--border)', gap: '1rem' }}
        >
          <span className="font-mono" style={{ fontSize: '0.52rem', letterSpacing: '0.16em', color: 'var(--fg-faint)', whiteSpace: 'nowrap' }}>Scroll →</span>
          <div style={{ flex: 1, height: 2, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div style={{ height: '100%', background: 'var(--accent)', borderRadius: 99, originX: 0, scaleX: scrollPct }} />
          </div>
        </motion.div>
      </div>

      <motion.div
        animate={{ opacity: active || carousel ? 1 : 0, pointerEvents: active || carousel ? 'auto' : 'none' }}
        transition={{ duration: 0.45, ease: EASE }}
        onClick={() => { close(); setCarousel(null) }}
        style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(11,10,8,0.92)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
      />

      <AnimatePresence>
        {active && <Lightbox src={active} allSrcs={allVideos} muted={muted} onToggleMute={toggleMute} onClose={close} onPrev={prev} onNext={next} />}
      </AnimatePresence>

      <AnimatePresence>
        {carousel && <CarouselLightbox pages={carousel.pages} onClose={() => setCarousel(null)} />}
      </AnimatePresence>
    </>
  )
}
