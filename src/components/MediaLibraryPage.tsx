'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { EASE } from '@/lib/motion'
import { CarouselLightbox, Lightbox, MagneticLink, thumbFor } from '@/components/MediaOverlays'

export type LibraryItem = string | string[]
export interface LibraryRow { title: string; items: LibraryItem[] }
export interface Featured { src: string; client: string; title: string; accent?: string }

interface Props {
  titleMain: string
  titleAccent: string
  featured: Featured
  rows: LibraryRow[]
}

const aspectOf = (src: string) => {
  const m = src.match(/_(\d+)x(\d+)(?=[_.\-])/)
  return m ? Number(m[1]) / Number(m[2]) : 9 / 16
}

// Filename hint first, then the thumbnail's real proportions once it loads.
function useRatio(src: string) {
  const [ratio, setRatio] = useState(() => aspectOf(src))
  const onLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget
    if (w && h) setRatio(w / h)
  }
  return [ratio, onLoad] as const
}

const labelOf = (src: string) =>
  decodeURIComponent(src.slice(src.lastIndexOf('/') + 1))
    .replace(/\.\w+$/, '')
    .replace(/_\d+x\d+.*$/, '')
    .replace(/[_-]+/g, ' ')

// Mouse drag with inertia; touch and trackpads keep native scrolling.
function useDragScroll(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let down = false, moved = false
    let startX = 0, startLeft = 0, lastX = 0, lastT = 0, vel = 0, raf = 0

    const block = (e: Event) => { e.stopPropagation(); e.preventDefault() }

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      cancelAnimationFrame(raf)
      down = true; moved = false
      startX = lastX = e.clientX
      startLeft = el.scrollLeft
      lastT = performance.now()
      vel = 0
    }
    const onMove = (e: PointerEvent) => {
      if (!down) return
      const dx = e.clientX - startX
      if (!moved) {
        if (Math.abs(dx) < 6) return
        moved = true
        el.setPointerCapture(e.pointerId)
        el.classList.add('is-dragging')
      }
      el.scrollLeft = startLeft - dx
      const now = performance.now()
      vel = (e.clientX - lastX) / Math.max(1, now - lastT)
      lastX = e.clientX; lastT = now
    }
    const onUp = () => {
      if (!down) return
      down = false
      if (!moved) return
      el.classList.remove('is-dragging')
      el.addEventListener('click', block, true)
      setTimeout(() => el.removeEventListener('click', block, true), 0)
      let v = -vel * 16
      const glide = () => {
        v *= 0.94
        el.scrollLeft += v
        if (Math.abs(v) > 0.4) raf = requestAnimationFrame(glide)
      }
      raf = requestAnimationFrame(glide)
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
    }
  }, [ref])
}

// Writes --px/--py (−1…1, distance from viewport centre) on every tile; CSS turns it into depth.
function useTileParallax() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const update = () => {
      raf = 0
      const vw = window.innerWidth, vh = window.innerHeight
      const tiles = Array.from(document.querySelectorAll<HTMLElement>('.ml-tile'))
      const rects = tiles.map(t => t.getBoundingClientRect())
      tiles.forEach((t, i) => {
        const r = rects[i]
        if (r.right < 0 || r.left > vw || r.bottom < 0 || r.top > vh) return
        const px = Math.max(-1, Math.min(1, (r.left + r.width / 2 - vw / 2) / (vw / 2)))
        const py = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh / 2)))
        t.style.setProperty('--px', px.toFixed(3))
        t.style.setProperty('--py', py.toFixed(3))
      })
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update) }
    schedule()
    document.addEventListener('scroll', schedule, { capture: true, passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('scroll', schedule, { capture: true })
      window.removeEventListener('resize', schedule)
    }
  }, [])
}

function Tile({ src, onOpen }: { src: string; onOpen: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const delay = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [playing, setPlaying] = useState(false)
  const [ratio, onLoad] = useRatio(thumbFor(src))

  // Short delay so sweeping the mouse across a row doesn't fire a dozen downloads.
  const start = () => {
    clearTimeout(delay.current)
    delay.current = setTimeout(() => { videoRef.current?.play().catch(() => {}) }, 180)
  }
  const stop = () => {
    clearTimeout(delay.current)
    setPlaying(false)
    const v = videoRef.current
    if (!v) return
    v.pause()
    v.currentTime = 0
  }

  return (
    <button
      type="button"
      className="ml-tile"
      style={{ aspectRatio: ratio }}
      onClick={onOpen}
      onPointerEnter={e => { if (e.pointerType === 'mouse') start() }}
      onPointerLeave={stop}
      onFocus={e => { if (e.currentTarget.matches(':focus-visible')) start() }}
      onBlur={stop}
      data-cursor="Play"
      aria-label={`${labelOf(src)} abspielen`}
    >
      <span className="ml-tile-media">
        <img src={thumbFor(src)} alt="" loading="lazy" decoding="async" draggable={false} onLoad={onLoad} />
      </span>
      <video
        ref={videoRef}
        className="ml-tile-video"
        data-on={playing}
        src={src}
        muted loop playsInline
        preload="none"
        onPlaying={() => setPlaying(true)}
        aria-hidden
      />
      <span className="ml-tile-shade" aria-hidden />
      <span className="ml-tile-play" aria-hidden>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 1.5l7.5 4.5L3 10.5v-9z" fill="currentColor" /></svg>
      </span>
    </button>
  )
}

function CarouselTile({ pages, onOpen }: { pages: string[]; onOpen: () => void }) {
  const [ratio, onLoad] = useRatio(pages[0])
  return (
    <button type="button" className="ml-tile" style={{ aspectRatio: ratio }} onClick={onOpen} data-cursor="View" aria-label={`Karussell mit ${pages.length} Seiten öffnen`}>
      <span className="ml-tile-media">
        <img src={pages[0]} alt="" loading="lazy" decoding="async" draggable={false} onLoad={onLoad} />
      </span>
      <span className="ml-tile-shade" aria-hidden />
      <span className="ml-tile-badge" aria-hidden>
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><rect x="1" y="3" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.1" /><rect x="3" y="1" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.1" strokeDasharray="2 1.5" /></svg>
        {pages.length}
      </span>
    </button>
  )
}

function Row({ row, onOpen, onOpenCarousel }: { row: LibraryRow; onOpen: (src: string) => void; onOpenCarousel: (pages: string[]) => void }) {
  const stripRef = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })
  useDragScroll(stripRef)

  useEffect(() => {
    const el = stripRef.current
    if (!el) return
    let raf = 0
    const check = () => {
      raf = 0
      const max = el.scrollWidth - el.clientWidth
      const next = { start: el.scrollLeft < 4, end: el.scrollLeft > max - 4 }
      setEdges(prev => (prev.start === next.start && prev.end === next.end ? prev : next))
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(check) }
    schedule()
    el.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  const page = (dir: 1 | -1) => {
    const el = stripRef.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <motion.section
      className="ml-row"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.9, ease: EASE }}
      aria-label={row.title}
    >
      <div className="ml-row-head">
        <h2 className="ml-row-title">{row.title}</h2>
        <span className="ml-row-count">{row.items.length} {row.items.length === 1 ? 'Arbeit' : 'Arbeiten'}</span>
      </div>
      <div className="ml-row-wrap">
        <button type="button" className="ml-arrow ml-arrow-prev" data-show={!edges.start} onClick={() => page(-1)} aria-label={`${row.title} zurück`} tabIndex={-1}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M14 4l-7 7 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div ref={stripRef} className="ml-strip">
          {row.items.map(item => Array.isArray(item)
            ? <CarouselTile key={item[0]} pages={item} onOpen={() => onOpenCarousel(item)} />
            : <Tile key={item} src={item} onOpen={() => onOpen(item)} />)}
        </div>
        <button type="button" className="ml-arrow ml-arrow-next" data-show={!edges.end} onClick={() => page(1)} aria-label={`${row.title} weiter`} tabIndex={-1}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M8 4l7 7-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </motion.section>
  )
}

export default function MediaLibraryPage({ titleMain, titleAccent, featured, rows }: Props) {
  const [active, setActive] = useState<string | null>(null)
  const [carousel, setCarousel] = useState<string[] | null>(null)
  const [muted, setMuted] = useState(true)
  const [heroMuted, setHeroMuted] = useState(true)
  const heroRef = useRef<HTMLElement>(null)
  const heroVideo = useRef<HTMLVideoElement>(null)
  const heroVisible = useRef(true)

  const allSrcs = useMemo(
    () => Array.from(new Set(rows.flatMap(r => r.items.filter((i): i is string => typeof i === 'string')))),
    [rows],
  )
  const carouselCount = rows.reduce((n, r) => n + r.items.filter(Array.isArray).length, 0)
  const portrait = aspectOf(featured.src) < 1

  const { scrollY } = useScroll()
  const headerBg = useTransform(scrollY, [0, 140], [0, 1])
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const mediaY     = useTransform(scrollYProgress, [0, 1], ['0%', '28%'])
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.14])
  const frameY     = useTransform(scrollYProgress, [0, 1], ['0%', '14%'])
  const contentY   = useTransform(scrollYProgress, [0, 1], ['0%', '-45%'])
  const contentOp  = useTransform(scrollYProgress, [0, 0.55], [1, 0])

  useTileParallax()

  useEffect(() => {
    const prev = document.documentElement.style.background
    document.documentElement.style.background = '#0d0c0a'
    return () => { document.documentElement.style.background = prev }
  }, [])

  // Hero video only runs while visible and no lightbox is open.
  const syncHero = useCallback((lightboxOpen: boolean) => {
    const v = heroVideo.current
    if (!v) return
    if (heroVisible.current && !lightboxOpen) v.play().catch(() => {})
    else v.pause()
  }, [])

  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      heroVisible.current = e.isIntersecting
      syncHero(false)
    }, { threshold: 0.05 })
    io.observe(el)
    return () => io.disconnect()
  }, [syncHero])

  const overlayOpen = active !== null || carousel !== null
  useEffect(() => { syncHero(overlayOpen) }, [overlayOpen, syncHero])

  const open = useCallback((src: string) => setActive(src), [])
  const close = useCallback(() => setActive(null), [])
  const closeCarousel = useCallback(() => setCarousel(null), [])
  const toggleMute = useCallback(() => setMuted(m => !m), [])
  const prev = useCallback(() => setActive(s => s && allSrcs[(allSrcs.indexOf(s) - 1 + allSrcs.length) % allSrcs.length]), [allSrcs])
  const next = useCallback(() => setActive(s => s && allSrcs[(allSrcs.indexOf(s) + 1) % allSrcs.length]), [allSrcs])

  const onRowsKeyDown = (e: React.KeyboardEvent) => {
    if (overlayOpen) return
    const tile = e.target as HTMLElement
    if (!tile.classList.contains('ml-tile')) return
    const strip = tile.parentElement as HTMLElement
    const tiles = Array.from(strip.querySelectorAll<HTMLElement>('.ml-tile'))
    const i = tiles.indexOf(tile)
    let target: HTMLElement | undefined
    if (e.key === 'ArrowRight') target = tiles[i + 1]
    else if (e.key === 'ArrowLeft') target = tiles[i - 1]
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const strips = Array.from(document.querySelectorAll<HTMLElement>('.ml-strip'))
      const other = strips[strips.indexOf(strip) + (e.key === 'ArrowDown' ? 1 : -1)]
      if (other) {
        const otherTiles = other.querySelectorAll<HTMLElement>('.ml-tile')
        target = otherTiles[Math.min(i, otherTiles.length - 1)]
      }
    }
    if (!target) return
    e.preventDefault()
    target.focus({ preventScroll: true })
    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
  }

  return (
    <div className="ml-root">
      <header className="ml-header">
        <motion.span className="ml-header-bg" style={{ opacity: headerBg }} aria-hidden />
        <Link href="/#projects" className="ml-back">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 6.5H4M6 4L3.5 6.5 6 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Zurück
        </Link>
        <span className="ml-brand">{titleMain}<em>{titleAccent}</em></span>
        <span className="ml-count">{allSrcs.length} Videos{carouselCount > 0 && ` · ${carouselCount} Karussell`}</span>
      </header>

      <section ref={heroRef} className="ml-hero" data-portrait={portrait}>
        <motion.div className="ml-hero-media" style={{ y: mediaY, scale: mediaScale }}>
          {portrait
            ? <img className="ml-hero-ambient" src={thumbFor(featured.src)} alt="" aria-hidden />
            : <video ref={heroVideo} src={featured.src} poster={thumbFor(featured.src)} autoPlay muted={heroMuted} loop playsInline preload="auto" aria-hidden />}
        </motion.div>
        {portrait && (
          <motion.div
            className="ml-hero-frame"
            style={{ y: frameY }}
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
          >
            <video ref={heroVideo} src={featured.src} poster={thumbFor(featured.src)} autoPlay muted={heroMuted} loop playsInline preload="auto" aria-hidden />
          </motion.div>
        )}
        <div className="ml-hero-fade" aria-hidden />

        <motion.div className="ml-hero-content" style={{ y: contentY, opacity: contentOp }}>
          <motion.p
            className="ml-kicker"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
          >
            <span className="ml-kicker-line" aria-hidden />Featured · {featured.client}
          </motion.p>
          <motion.h1
            className="ml-hero-title"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.3 }}
          >
            {featured.title}{featured.accent && <> <em>{featured.accent}</em></>}
          </motion.h1>
          <motion.div
            className="ml-hero-actions"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.45 }}
          >
            <button type="button" className="ml-btn-primary" onClick={() => { setMuted(false); open(featured.src) }} data-cursor="Play">
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden><path d="M3 1.5l7.5 4.5L3 10.5v-9z" fill="currentColor" /></svg>
              Abspielen
            </button>
            <a href="#library" className="ml-btn-ghost">Alle Arbeiten</a>
            <button
              type="button"
              className="ml-mute"
              onClick={() => setHeroMuted(m => !m)}
              aria-label={heroMuted ? 'Ton an' : 'Ton aus'}
            >
              {heroMuted ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 6.5h3l4-3.5v12l-4-3.5H2V6.5zM14 6l-3 3m0-3l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 6.5h3l4-3.5v12l-4-3.5H2V6.5zM13 5.5a4 4 0 010 7M11 7a2 2 0 010 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              )}
            </button>
          </motion.div>
        </motion.div>

      </section>

      <div id="library" className="ml-rows" onKeyDown={onRowsKeyDown}>
        {rows.map(row => <Row key={row.title} row={row} onOpen={open} onOpenCarousel={setCarousel} />)}
      </div>

      <footer className="ml-cta">
        <h3>
          Lass uns bei einem Cappuccino<br />
          <em>tiefer eintauchen.</em>
        </h3>
        <MagneticLink href="https://www.linkedin.com/in/sebastian-vitzthum-101154180/">
          Slide in my DMs
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 11L11 1M11 1H4M11 1v7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </MagneticLink>
      </footer>

      <motion.div
        animate={{ opacity: overlayOpen ? 1 : 0, pointerEvents: overlayOpen ? 'auto' : 'none' }}
        transition={{ duration: 0.45, ease: EASE }}
        onClick={() => { close(); closeCarousel() }}
        style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(11,10,8,0.94)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
      />
      <AnimatePresence>
        {active && <Lightbox src={active} allSrcs={allSrcs} muted={muted} onToggleMute={toggleMute} onClose={close} onPrev={prev} onNext={next} />}
      </AnimatePresence>
      <AnimatePresence>
        {carousel && <CarouselLightbox pages={carousel} onClose={closeCarousel} />}
      </AnimatePresence>
    </div>
  )
}
