'use client'
import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { EASE } from '@/lib/motion'

const projects = [
  { num: '01', title: 'Imagefilm Placeholder', category: 'Video & Film', year: '2025', color: '#1C1C1C', desc: 'Unternehmensfilm von A bis Z.', video: '/images/projects/projekt-1.webm', href: '' },
  { num: '02', title: 'Brand Motion Placeholder', category: 'Animation', year: '2025', color: '#2A1F1A', desc: 'Logoanimation & Motion-Set.', video: '/images/projects/projekt-2.webm', href: '' },
  { num: '03', title: 'Social Campaign Placeholder', category: 'Social Media', year: '2024', color: '#1A1F2A', desc: 'Content-Strategie & Produktion.', video: '', href: '' },
  { num: '04', title: 'AI Visual Placeholder', category: 'AI-Produktion', year: '2024', color: '#1A2A1F', desc: 'Synthetische Bildwelt für eine Kampagne.', video: '', href: '' },
  { num: '05', title: 'Zu meinen Fotos', category: 'Foto & Video', year: '2024', color: '#241A1A', desc: 'Portraits, Events & mehr.', video: '', href: '/projects/fotografie' },
]

export default function Projects() {
  const [hovered, setHovered] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionRef   = useRef<HTMLElement>(null)

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

  const onMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      rawX.set(e.clientX - rect.left)
      rawY.set(e.clientY - rect.top)
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
          <motion.a href="#contact" data-cursor="→" className="tag link-underline" style={{ color: 'var(--fg-mid)', textDecoration: 'none' }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
            Alle Projekte →
          </motion.a>
        </motion.div>

        {/* List with floating preview */}
        <motion.div ref={containerRef} onMouseMove={onMouseMove} style={{ position: 'relative', y: listY }}>

          {/* Floating preview card — spring-lagged magnetic follow */}
          <motion.div
            style={{
              position: 'absolute', left: 0, top: 0,
              x: cardX, y: cardY,
              zIndex: 10, pointerEvents: 'none',
            }}
            animate={{ opacity: hovered !== null ? 1 : 0, scale: hovered !== null ? 1 : 0.82 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            {/* Centering wrapper */}
            <motion.div style={{ transform: 'translate(-50%, -58%)' }}>
              {/* Card shell — color transitions smoothly, border-radius wabbles */}
              <motion.div
                animate={{
                  background: hovered !== null ? projects[hovered].color : '#1a1a1a',
                  borderRadius: [
                    '38% 62% 54% 46% / 48% 44% 56% 52%',
                    '46% 54% 44% 56% / 56% 52% 48% 44%',
                    '54% 46% 60% 40% / 44% 58% 42% 56%',
                    '42% 58% 48% 52% / 52% 46% 54% 48%',
                    '38% 62% 54% 46% / 48% 44% 56% 52%',
                  ],
                }}
                transition={{
                  background: { duration: 0.35, ease: EASE },
                  borderRadius: { repeat: Infinity, duration: 7, ease: 'easeInOut' },
                }}
                style={{
                  width: 260, height: 220,
                  boxShadow: '0 28px 64px rgba(0,0,0,0.22)',
                  overflow: 'hidden', position: 'relative',
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={hovered}
                    initial={{ y: '-60%', opacity: 0 }}
                    animate={{ y: '0%',   opacity: 1 }}
                    exit={{    y:  '60%', opacity: 0 }}
                    transition={{ duration: 0.32, ease: EASE }}
                    style={{ position: 'absolute', inset: 0 }}
                  >
                    {/* WebM preview — fills card when available */}
                    {hovered !== null && projects[hovered].video ? (
                      <>
                        <video
                          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${projects[hovered].video}`}
                          autoPlay loop muted playsInline
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                        {/* Subtle overlay so text stays readable */}
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)' }} />
                      </>
                    ) : null}

                    {/* Text — always shown, sits on top of video */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexDirection: 'column', gap: '0.5rem', padding: '1.2rem',
                      opacity: hovered !== null && projects[hovered].video ? 0 : 1,
                      transition: 'opacity 0.3s ease',
                    }}>
                      <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'center' }}>
                        {hovered !== null ? projects[hovered].category : ''}
                      </span>
                      <span style={{ fontFamily: 'var(--ff-body)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.52)', fontWeight: 300, textAlign: 'center' }}>
                        {hovered !== null ? projects[hovered].desc : ''}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Project rows */}
          {projects.map(({ num, title, category, year, href }, i) => {
            const rowContent = (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.5rem' }}>
                  <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--fg-faint)' }}>{num}</span>
                  {href ? (
                    // Fancy sweep: accent text slides in over fg text via clip-path
                    <motion.div
                      className="font-display"
                      style={{ fontSize: 'clamp(1.4rem,3.5vw,2.6rem)', fontWeight: 700, position: 'relative', display: 'inline-block' }}
                      animate={{ x: hovered === i ? 8 : 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                    >
                      {/* Base layer */}
                      <span style={{ color: 'var(--fg)', display: 'block' }}>{title}</span>
                      {/* Accent sweep layer */}
                      <motion.span
                        aria-hidden
                        style={{ position: 'absolute', inset: 0, color: 'var(--accent)', display: 'block', whiteSpace: 'nowrap' }}
                        animate={{ clipPath: hovered === i ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' }}
                        transition={{ duration: 0.45, ease: EASE }}
                      >
                        {title}
                      </motion.span>
                    </motion.div>
                  ) : (
                    <motion.h3
                      className="font-display"
                      style={{ fontSize: 'clamp(1.4rem,3.5vw,2.6rem)', fontWeight: 700, color: 'var(--fg)' }}
                      animate={{ x: hovered === i ? 8 : 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                    >
                      {title}
                    </motion.h3>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                  <span
                    className="tag"
                    style={{ opacity: hovered === i ? 1 : 0, transition: 'opacity 0.25s ease', pointerEvents: 'none' }}
                  >
                    {category}
                  </span>
                  <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--fg-faint)' }}>{year}</span>
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
              // href rows are real links — never dim them
              opacity: href ? 1 : (hovered !== null && hovered !== i ? 0.25 : 1),
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
                aria-label={`${title} — ${category}, ${year}`}
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
