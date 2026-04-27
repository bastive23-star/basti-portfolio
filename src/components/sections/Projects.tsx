'use client'
import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { EASE } from '@/lib/motion'

const PROJECT_SLIDES = [
  [ // 01 Video & Eventfilm
    '/images/projects/Video/thumbs/Voith_APM_TheFacesBehind_E1_16x9.jpg',
    '/images/projects/Video/thumbs/Dachser_PI_Start_Oktober_16x9.jpg',
    '/images/projects/Video/thumbs/BI_KOL_Heimann_Longvideo_16x9_1.jpg',
    '/images/projects/Video/thumbs/Byte.jpg',
  ],
  [ // 02 Motion
    '/images/projects/Motion/thumbs/DB_DBME24_DigitaleReisebegleitung_16x9.jpg',
    '/images/projects/Motion/thumbs/TypoAnimation_DigitalTomorrowOutro_16x9.jpg',
    '/images/projects/Motion/thumbs/HydroPocketTrailer_Part1_16x9_LQ.jpg',
    '/images/projects/Motion/thumbs/PH_OneWeb_PromoVideo_16x9.jpg',
  ],
  [ // 03 Social
    '/images/projects/Social/thumbs/BI_KOL_Heimann_SocialSnippet6_v2_9x16.jpg',
    '/images/projects/Social/thumbs/cB_DigitalerEuro_Reel.jpg',
    '/images/projects/Social/thumbs/BI_JAR_CRM_Focus_4x5.jpg',
    '/images/projects/Social/thumbs/cB_Kreditkartenlimit_Reel.jpg',
  ],
  [ // 04 AI Production
    '/images/projects/AI_Production/thumbs/Aral-Kaffeestudie_AI_Actionfiguren_9x16.jpg',
    '/images/projects/AI_Production/thumbs/PH_WCW_AI_Campaign_GirlsGroup_9x16.jpg',
    '/images/projects/AI_Production/thumbs/PH_Sterilium_HeroVideo_16x9.jpg',
    '/images/projects/AI_Production/thumbs/cB_ChristmasOffice.jpg',
  ],
  [ // 05 Fotografie
    '/images/projects/Fotografie/AI_AfterHour145.webp',
    '/images/projects/Fotografie/DSC09727.webp',
    '/images/projects/Fotografie/DSCF0062.webp',
    '/images/projects/Fotografie/RS_Mitarbeitershootings_2506-3634.webp',
    '/images/projects/Fotografie/DSC01010.webp',
  ],
]

const projects = [
  { num: '01', title: 'Employer Branding, Image- & Eventfilm', color: '#1C1C1C', href: '/projects/video' },
  { num: '02', title: 'Explainer & Motion Graphics',           color: '#2A1F1A', href: '/projects/motion' },
  { num: '03', title: 'Social',                                color: '#1A1F2A', href: '/projects/social' },
  { num: '04', title: 'AI Production',                         color: '#1A2A1F', href: '/projects/ai-production' },
  { num: '05', title: 'Fotografie',                             color: '#241A1A', href: '/projects/fotografie' },
]

export default function Projects() {
  const [hovered, setHovered] = useState<number | null>(null)
  const [photoIdx, setPhotoIdx] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionRef   = useRef<HTMLElement>(null)
  const rectCache    = useRef<DOMRect | null>(null)

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const headerY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])
  const listY   = useTransform(scrollYProgress, [0, 1], ['3%',   '-9%'])
  const ghostY  = useTransform(scrollYProgress, [0, 1], ['-8%',  '20%'])
  const ghostX  = useTransform(scrollYProgress, [0, 1], ['-6%',  '4%'])

  // Magnetic lag — weak spring so card pulls behind the cursor
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const cardX = useSpring(rawX, { stiffness: 90, damping: 18, mass: 1.2 })
  const cardY = useSpring(rawY, { stiffness: 90, damping: 18, mass: 1.2 })

  useEffect(() => {
    setPhotoIdx(0)
    if (hovered === null) return
    const slides = PROJECT_SLIDES[hovered]
    if (!slides || slides.length <= 1) return
    const id = setInterval(() => setPhotoIdx(i => (i + 1) % slides.length), 1600)
    return () => clearInterval(id)
  }, [hovered])

  useEffect(() => {
    const invalidate = () => { rectCache.current = null }
    window.addEventListener('scroll', invalidate, { passive: true })
    window.addEventListener('resize', invalidate)
    return () => {
      window.removeEventListener('scroll', invalidate)
      window.removeEventListener('resize', invalidate)
    }
  }, [])

  const onMouseMove = (e: React.MouseEvent) => {
    if (!rectCache.current) rectCache.current = containerRef.current?.getBoundingClientRect() ?? null
    if (rectCache.current) {
      rawX.set(e.clientX - rectCache.current.left)
      rawY.set(e.clientY - rectCache.current.top)
    }
  }

  return (
    <section id="projects" ref={sectionRef} className="section-pad" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-muted)', overflow: 'hidden', position: 'relative' }}>
      {/* Ghost background word */}
      <motion.div
        style={{ y: ghostY, x: ghostX, position: 'absolute', top: '8%', left: '-3%', pointerEvents: 'none', zIndex: 0, userSelect: 'none' }}
        aria-hidden
      >
        <span style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(9rem, 25vw, 24rem)', fontWeight: 800, color: 'var(--fg)', opacity: 0.03, letterSpacing: '-0.04em', whiteSpace: 'nowrap', lineHeight: 1, display: 'block' }}>
          PROJEKTE
        </span>
      </motion.div>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>

        <motion.div
          style={{ y: headerY, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'clamp(3rem,6vh,5rem)', flexWrap: 'wrap', gap: '1rem' }}
        >
          <div>
            <motion.p className="tag" style={{ marginBottom: '0.8rem' }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>Ausgewählte Arbeiten</motion.p>
            <div style={{ overflow: 'hidden', paddingBottom: '0.15em' }}>
              <motion.h2
                style={{ fontSize: 'clamp(2.6rem,5.5vw,5rem)' }}
                initial={{ y: '100%', opacity: 0 }}
                whileInView={{ y: '0%', opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                Schaut{' '}
                <em style={{ fontFamily: 'var(--ff-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>selbst.</em>
              </motion.h2>
            </div>
          </div>
        </motion.div>

        {/* List with floating preview */}
        <motion.div ref={containerRef} onMouseMove={onMouseMove} style={{ position: 'relative', y: listY }}>

          {/* Floating preview card — spring-lagged magnetic follow */}
          <motion.div
            style={{
              position: 'absolute', left: 0, top: 0,
              x: cardX, y: cardY,
              // Offset by half card size so cursor points to card center.
              // Using margins instead of a nested transform wrapper — Firefox has
              // rendering bugs when combining Framer Motion x/y with child transforms.
              marginLeft: -130,  // –(260/2)
              marginTop: -128,   // –(220*0.58)
              zIndex: 10, pointerEvents: 'none',
            }}
            animate={{ opacity: hovered !== null ? 1 : 0, scale: hovered !== null ? 1 : 0.82 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
              {/* Card shell — color transitions smoothly, border-radius wabbles */}
              <motion.div
                className="blob-card"
                animate={{
                  background: hovered !== null ? projects[hovered].color : '#1a1a1a',
                }}
                transition={{
                  background: { duration: 0.35, ease: EASE },
                }}
                style={{
                  width: 260, height: 220,
                  boxShadow: '0 28px 64px rgba(0,0,0,0.22)',
                  position: 'relative',
                }}
              >
                <AnimatePresence mode="sync" initial={false}>
                  {hovered !== null && PROJECT_SLIDES[hovered] && (
                    <motion.div
                      key={photoIdx}
                      initial={{ opacity: 0, scale: 1.08 }}
                      animate={{ opacity: 1,  scale: 1.0  }}
                      exit={{    opacity: 0,  scale: 0.94 }}
                      transition={{ duration: 0.65, ease: EASE }}
                      style={{ position: 'absolute', inset: 0 }}
                    >
                      <img
                        src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${PROJECT_SLIDES[hovered][photoIdx]}`}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)' }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
          </motion.div>

          {/* Project rows */}
          {projects.map(({ num, title, href }, i) => {
            const rowContent = (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.5rem' }}>
                  <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--fg-faint)' }}>{num}</span>
                  <motion.div
                    className="font-display"
                    style={{ fontSize: 'clamp(1.4rem,3.5vw,2.6rem)', fontWeight: 700, position: 'relative', display: 'inline-block' }}
                    animate={{ x: hovered === i ? 8 : 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    <span style={{ color: 'var(--fg)', display: 'block' }}>{title}</span>
                    <motion.span
                      aria-hidden
                      style={{ position: 'absolute', inset: 0, color: 'var(--accent)', display: 'block', whiteSpace: 'nowrap' }}
                      animate={{ clipPath: hovered === i ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' }}
                      transition={{ duration: 0.45, ease: EASE }}
                    >
                      {title}
                    </motion.span>
                  </motion.div>
                </div>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                  <motion.div
                    animate={{ x: hovered === i ? 4 : 0, opacity: hovered === i ? 1 : 0.3 }}
                    transition={{ duration: 0.25 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 12L12 2M12 2H5M12 2v7" stroke="var(--fg)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                </div>
              </>
            )

            const sharedStyle: React.CSSProperties = {
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: 'clamp(1.2rem,3vh,1.9rem) 0',
              borderTop: '1px solid var(--border)',
              transition: 'opacity 0.25s ease',
              opacity: hovered !== null && hovered !== i ? 0.25 : 1,
              textDecoration: 'none',
              color: 'inherit',
            }

            return href ? (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.6 }}
                onHoverStart={() => setHovered(i)}
                onHoverEnd={() => setHovered(null)}
                data-cursor="View"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <Link href={href} style={sharedStyle}>
                  {rowContent}
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key={i}
                role="button"
                tabIndex={0}
                aria-label={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.6 }}
                onHoverStart={() => setHovered(i)}
                onHoverEnd={() => setHovered(null)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
                data-cursor="View"
                style={sharedStyle}
              >
                {rowContent}
              </motion.div>
            )
          })}
          <div className="divider" />
        </motion.div>
      </div>
    </section>
  )
}
