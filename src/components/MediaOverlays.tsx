'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EASE } from '@/lib/motion'
import Magnetic from '@/components/ui/Magnetic'

export const isVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src)

export function thumbFor(src: string) {
  const lastSlash = src.lastIndexOf('/')
  const dir  = src.slice(0, lastSlash)
  const name = src.slice(lastSlash + 1).replace(/\.mp4$/i, '')
  return `${dir}/thumbs/${name}.jpg`
}

// ── Carousel lightbox ─────────────────────────────────────────────────────────
export function CarouselLightbox({ pages, onClose }: { pages: string[]; onClose: () => void }) {
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
        style={{ position: 'fixed', left: 'clamp(1rem,3vw,2.5rem)', top: '50%', y: '-50%', zIndex: 2, background: 'none', border: 'none', padding: '1.2rem', color: 'rgba(255,255,255,0.3)', cursor: 'default' }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 3L6 10l7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </motion.button>

      <motion.button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % pages.length) }}
        initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
        whileHover={{ x: 3, color: '#fff' }} transition={{ duration: 0.25, ease: EASE }}
        style={{ position: 'fixed', right: 'clamp(1rem,3vw,2.5rem)', top: '50%', y: '-50%', zIndex: 2, background: 'none', border: 'none', padding: '1.2rem', color: 'rgba(255,255,255,0.3)', cursor: 'default' }}
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
  return (
    <Magnetic strength={0.38}>
      <motion.a href={href} target="_blank" rel="noopener noreferrer"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'var(--ff-mono)', fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.08em', textDecoration: 'none', background: 'var(--accent)', color: '#fff', padding: '0.8rem 1.4rem', borderRadius: 6 }}
        whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}
      >
        {children}
      </motion.a>
    </Magnetic>
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
export function Lightbox({ src, allSrcs, muted, onToggleMute, onClose, onPrev, onNext }: {
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
        style={{ position: 'fixed', left: 'clamp(1rem,3vw,2.5rem)', top: '50%', y: '-50%', zIndex: 2, background: 'none', border: 'none', padding: '1.2rem', color: 'rgba(255,255,255,0.3)', cursor: 'default' }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 3L6 10l7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </motion.button>

      <motion.button onClick={e => { e.stopPropagation(); onNext() }}
        initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
        whileHover={{ x: 3, color: '#fff' }} transition={{ duration: 0.25, ease: EASE }}
        style={{ position: 'fixed', right: 'clamp(1rem,3vw,2.5rem)', top: '50%', y: '-50%', zIndex: 2, background: 'none', border: 'none', padding: '1.2rem', color: 'rgba(255,255,255,0.3)', cursor: 'default' }}
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
