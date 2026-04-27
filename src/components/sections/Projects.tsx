'use client'
import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { EASE } from '@/lib/motion'

const projects = [
  { num: '01', title: 'Employer Branding, Image- & Eventfilm', href: '/projects/video' },
  { num: '02', title: 'Explainer & Motion Graphics',           href: '/projects/motion' },
  { num: '03', title: 'Social',                                href: '/projects/social' },
  { num: '04', title: 'AI Production',                         href: '/projects/ai-production' },
  { num: '05', title: 'Fotografie',                             href: '/projects/fotografie' },
]

export default function Projects() {
  const [hovered, setHovered] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const headerY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])
  const listY   = useTransform(scrollYProgress, [0, 1], ['3%',   '-9%'])
  const ghostY  = useTransform(scrollYProgress, [0, 1], ['-8%',  '20%'])
  const ghostX  = useTransform(scrollYProgress, [0, 1], ['-6%',  '4%'])

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

        <motion.div style={{ position: 'relative', y: listY }}>
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

            return (
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
            )
          })}
          <div className="divider" />
        </motion.div>
      </div>
    </section>
  )
}
