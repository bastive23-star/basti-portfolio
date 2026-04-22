'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { EASE } from '@/lib/motion'

// ── Video grid item — img thumbnail always visible, video fades in on hover ───
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
      style={{ flexShrink: 0, borderRadius: 5, overflow: 'hidden', cursor: 'none', position: 'relative', height: '100%' }}
    >
      {/* Thumbnail — always visible, sets the item width */}
      <img
        src={thumbFor(src)}
        alt=""
        style={{ height: '100%', width: 'auto', display: 'block', userSelect: 'none', pointerEvents: 'none' } as React.CSSProperties}
      />
      {/* Video — loads on hover, fades over the thumbnail */}
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
      {/* Play icon — fades out while playing */}
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

// ── End card ─────────────────────────────────────────────────────────────────
function EndCard() {
  return (
    <div style={{
      flexShrink: 0,
      alignSelf: 'stretch',
      width: 'clamp(220px, 20vw, 290px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: '1.4rem',
      paddingLeft: 'clamp(2.5rem, 4vw, 4rem)',
      paddingRight: 'clamp(2rem, 3vw, 3rem)',
      borderLeft: '1px solid var(--border)',
    }}>
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}
      >
        <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.5rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--fg-faint)' }}>
          Noch mehr
        </p>
        <h3 style={{
          fontFamily: 'var(--ff-serif)', fontStyle: 'italic', fontWeight: 400,
          fontSize: 'clamp(1.7rem, 2.2vw, 2.2rem)',
          color: 'var(--accent)', lineHeight: 1.25,
        }}>
          Ich erzähle dir<br />gerne mehr.
        </h3>
        <p style={{ fontFamily: 'var(--ff-body)', fontSize: '0.78rem', color: 'var(--fg-mid)', fontWeight: 300, lineHeight: 1.8, maxWidth: '20ch' }}>
          Hinter jedem Projekt steckt eine Geschichte.
        </p>
        <Link
          href="/#contact"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', fontFamily: 'var(--ff-mono)', fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--fg)', textDecoration: 'none' }}
        >
          <span>Gespräch anfragen</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 12L12 2M12 2H5M12 2v7" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </motion.div>
    </div>
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
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.video
          key={src}
          src={src}
          autoPlay loop muted={muted} playsInline
          onClick={e => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.88, filter: 'blur(12px)' }}
          animate={{ opacity: 1, scale: 1,    filter: 'blur(0px)' }}
          exit={{    opacity: 0, scale: 1.06, filter: 'blur(8px)' }}
          transition={{ duration: 0.45, ease: EASE }}
          style={{
            position: 'relative', zIndex: 1,
            maxWidth: 'min(88vw, 1100px)', maxHeight: '86dvh',
            width: 'auto', height: 'auto',
            borderRadius: 8,
            boxShadow: '0 48px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
            display: 'block',
          } as React.CSSProperties}
        />
      </AnimatePresence>

      {/* Prev */}
      <motion.button onClick={e => { e.stopPropagation(); onPrev() }}
        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
        whileHover={{ x: -3, color: '#fff' }} transition={{ duration: 0.25, ease: EASE }}
        style={{ position: 'fixed', left: 'clamp(1rem,3vw,2.5rem)', top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'none', border: 'none', padding: '1.2rem', color: 'rgba(255,255,255,0.3)', cursor: 'none' }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 3L6 10l7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </motion.button>

      {/* Next */}
      <motion.button onClick={e => { e.stopPropagation(); onNext() }}
        initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
        whileHover={{ x: 3, color: '#fff' }} transition={{ duration: 0.25, ease: EASE }}
        style={{ position: 'fixed', right: 'clamp(1rem,3vw,2.5rem)', top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'none', border: 'none', padding: '1.2rem', color: 'rgba(255,255,255,0.3)', cursor: 'none' }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 3l7 7-7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </motion.button>

      {/* Close */}
      <motion.button onClick={e => { e.stopPropagation(); onClose() }}
        initial={{ opacity: 0, rotate: -45 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }}
        whileHover={{ rotate: 90, color: '#fff' }} transition={{ duration: 0.3, ease: EASE }}
        style={{ position: 'fixed', top: 'clamp(1.2rem,3vh,2rem)', right: 'clamp(1.2rem,3vw,2.5rem)', zIndex: 2, background: 'none', border: 'none', padding: '0.8rem', color: 'rgba(255,255,255,0.35)', cursor: 'none' }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
      </motion.button>

      {/* Mute toggle */}
      <motion.button onClick={e => { e.stopPropagation(); onToggleMute() }}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
        whileHover={{ color: '#fff' }} transition={{ duration: 0.25, ease: EASE }}
        style={{ position: 'fixed', top: 'clamp(1.2rem,3vh,2rem)', left: 'clamp(1.2rem,3vw,2.5rem)', zIndex: 2, background: 'none', border: 'none', padding: '0.8rem', color: 'rgba(255,255,255,0.35)', cursor: 'none' }}
      >
        {muted ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 6.5h3l4-3.5v12l-4-3.5H2V6.5zM14 6l-3 3m0-3l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 6.5h3l4-3.5v12l-4-3.5H2V6.5zM13 5.5a4 4 0 010 7M11 7a2 2 0 010 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}
      </motion.button>

      {/* Counter */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        style={{ position: 'fixed', bottom: '1.8rem', left: '50%', transform: 'translateX(-50%)', zIndex: 2, pointerEvents: 'none', fontFamily: 'var(--ff-mono)', fontSize: '0.55rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)' }}
      >
        {String(allSrcs.indexOf(src) + 1).padStart(2, '0')}&thinsp;/&thinsp;{String(allSrcs.length).padStart(2, '0')}
      </motion.div>
    </motion.div>
  )
}

// ── Shared gallery page ───────────────────────────────────────────────────────
interface Props {
  titleMain: string
  titleAccent: string
  row1: string[]
  row2: string[]
  rowOffset?: string
}

export default function VideoGalleryPage({ titleMain, titleAccent, row1, row2, rowOffset = 'clamp(4rem, 8vw, 8rem)' }: Props) {
  const trackRef      = useRef<HTMLDivElement>(null)
  const [scrollPct, setScrollPct] = useState(0)
  const [active, setActive]       = useState<string | null>(null)
  const [muted, setMuted]         = useState(true)
  const allVideos = [...row1, ...row2]

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

  const HEADER_H = 56

  return (
    <>
      <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{
            flexShrink: 0, height: HEADER_H,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 clamp(1.2rem, 4vw, 3.5rem)',
            borderBottom: '1px solid var(--border)',
            background: 'rgba(247,245,242,0.92)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            zIndex: 10,
          }}
        >
          <motion.div whileHover={{ x: -3 }} transition={{ duration: 0.22, ease: EASE }}>
            <Link
              href="/#projects"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--ff-mono)', fontSize: '0.65rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-mid)', textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500 }}
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
            {titleMain}<em style={{ fontFamily: '"Georgia", serif', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>{titleAccent}</em>
          </span>

          <span className="font-mono" style={{ fontSize: '0.58rem', letterSpacing: '0.18em', color: 'var(--fg-faint)' }}>
            {allVideos.length} Videos
          </span>
        </motion.header>

        {/* Scroll track */}
        <div
          ref={trackRef}
          style={{
            flex: 1, minHeight: 0, height: 0,
            overflowX: 'auto', overflowY: 'hidden',
            display: 'flex', flexDirection: 'row', alignItems: 'stretch',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none', scrollbarWidth: 'none',
            paddingLeft: 'clamp(1rem, 3vw, 2.5rem)',
          }}
        >
          <style>{`::-webkit-scrollbar { display: none }`}</style>
          {/* Two video rows stacked */}
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '0.75rem 0' }}>
              {[row1, row2].map((row, rowIdx) => (
                <div
                  key={rowIdx}
                  style={{
                    flex: 1, minHeight: 0,
                    display: 'flex', flexDirection: 'row', gap: '0.6rem',
                    paddingLeft: rowIdx === 1 ? rowOffset : 0,
                  }}
                >
                  {row.map((src, i) => (
                    <VideoItem key={src} src={src} delay={i * 0.03} rowIdx={rowIdx} onClick={() => setActive(src)} />
                  ))}
                </div>
              ))}
            </div>
          {/* End card — sibling to the rows column, aligned via parent's alignItems: stretch */}
          <EndCard />
        </div>

        {/* Progress bar */}
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

      {/* Backdrop */}
      <motion.div
        animate={{ opacity: active ? 1 : 0, pointerEvents: active ? 'auto' : 'none' }}
        transition={{ duration: 0.45, ease: EASE }}
        onClick={close}
        style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(11,10,8,0.92)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
      />

      {/* Lightbox */}
      <AnimatePresence>
        {active && <Lightbox src={active} allSrcs={allVideos} muted={muted} onToggleMute={toggleMute} onClose={close} onPrev={prev} onNext={next} />}
      </AnimatePresence>
    </>
  )
}
