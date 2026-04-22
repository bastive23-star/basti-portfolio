'use client'
import { useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { EASE } from '@/lib/motion'

const services = [
  {
    num: '01',
    title: 'Video & Film',
    desc: 'Imagefilme, Employer Branding, Reels, Eventdokumentation — vom Dreh bis zum fertigen Schnitt, alles aus einer Hand. Kein Briefing-Stille-Post, keine externen Dienstleister.',
    tags: ['Dreh', 'Schnitt', 'Imagefilm', 'Reels', 'Eventfilm'],
  },
  {
    num: '02',
    title: 'Animation & Motion',
    desc: 'After Effects ist mein tägliches Werkzeug. Erklärvideos, Animationen, Intros — was auch immer gebraucht wird.',
    tags: ['After Effects', 'Motion Graphics', 'Logoanimation', 'Explainer'],
  },
  {
    num: '03',
    title: 'Foto & Grafik',
    desc: 'Portrait, Event, Produkt — plus alles was Photoshop, Canva und Figma so hergeben: Flyer, Key Visuals, statische Assets.',
    tags: ['Fotografie', 'Grafikdesign', 'CI', 'Key Visuals', 'Print'],
  },
  {
    num: '04',
    title: 'AI-Produktionen',
    desc: 'Flux, Kling, Runway, ElevenLabs, Nano Banana — KI als echtes Produktionswerkzeug. Synthetische Bilder, Voice-Over, generierter B-Roll — bis hin zu ganzen Kampagnen.',
    tags: ['Midjourney', 'Sora', 'ElevenLabs', 'Runway', 'ComfyUI'],
  },
  {
    num: '05',
    title: 'Social Media',
    desc: 'Von der Produktion bis zur fertigen Datei — Reels, Stories, Posts, Thumbnails für Instagram, TikTok, LinkedIn und YouTube.',
    tags: ['Instagram', 'TikTok', 'LinkedIn', 'YouTube', 'Reels'],
  },
]

// ── Clip-path text reveal ─────────────────────────────────────────────────────
function RevealText({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div style={{ overflow: 'hidden', paddingBottom: '0.15em' }}>
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        whileInView={{ y: '0%', opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: EASE, delay }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export default function Services() {
  const [open, setOpen] = useState<number | null>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const numY    = useTransform(scrollYProgress, [0, 1], ['18%',  '-18%'])
  const headerY = useTransform(scrollYProgress, [0, 1], ['-7%',  '7%'])
  const ghostY  = useTransform(scrollYProgress, [0, 1], ['-12%', '18%'])
  const ghostX  = useTransform(scrollYProgress, [0, 1], ['6%',   '-4%'])

  return (
    <section id="services" ref={sectionRef} className="section-pad" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)', overflow: 'hidden', position: 'relative' }}>
      {/* Ghost background word */}
      <motion.div
        style={{ y: ghostY, x: ghostX, position: 'absolute', top: '5%', right: '-4%', pointerEvents: 'none', zIndex: 0, userSelect: 'none' }}
        aria-hidden
      >
        <span style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(8rem, 22vw, 22rem)', fontWeight: 800, color: 'var(--fg)', opacity: 0.025, letterSpacing: '-0.04em', whiteSpace: 'nowrap', lineHeight: 1, display: 'block' }}>
          SKILLS
        </span>
      </motion.div>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>

        <motion.div style={{ y: headerY, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'clamp(3rem, 6vh, 5rem)', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <RevealText delay={0}><p className="tag" style={{ marginBottom: '0.8rem' }}>Skills</p></RevealText>
            <RevealText delay={0.1}><h2 style={{ fontSize: 'clamp(2.6rem, 5.5vw, 5rem)' }}>Alles aus<br /><em style={{ fontFamily: 'var(--ff-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>einer Hand.</em></h2></RevealText>
          </div>
          <motion.span className="tag" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
            {services.length} Skills
          </motion.span>
        </motion.div>

        <div>
          {services.map(({ num, title, desc, tags }, i) => (
            <motion.div
              key={i}
              role="button"
              tabIndex={0}
              aria-expanded={open === i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              style={{ borderTop: '1px solid var(--border)' }}
              data-cursor={open === i ? '−' : '+'}
              onClick={() => setOpen(open === i ? null : i)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(open === i ? null : i) } }}
              onHoverStart={() => setHovered(i)}
              onHoverEnd={() => setHovered(null)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'clamp(1.1rem,2.8vh,1.7rem) 0', transition: 'opacity 0.25s ease', opacity: hovered !== null && hovered !== i ? 0.25 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.5rem' }}>
                  <motion.span
                    className="font-mono"
                    style={{ fontSize: '0.6rem', color: 'var(--fg-faint)', y: numY }}
                  >
                    {num}
                  </motion.span>
                  <motion.h3
                    className="font-display"
                    style={{ fontSize: 'clamp(1.3rem,3vw,2.2rem)', fontWeight: 700, color: 'var(--fg)' }}
                    animate={{ x: hovered === i ? 8 : 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    {title}
                  </motion.h3>
                </div>
                <motion.div
                  animate={{ rotate: open === i ? 45 : 0, opacity: hovered === i ? 1 : 0.35 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 3v12M3 9h12" stroke="var(--fg-mid)" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </motion.div>
              </div>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.38, ease: EASE }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ paddingBottom: '1.8rem', paddingLeft: '3.5rem' }}>
                      <p style={{ fontFamily: 'var(--ff-body)', fontSize: '0.95rem', color: 'var(--fg-mid)', lineHeight: 1.75, marginBottom: '1.2rem', maxWidth: '52ch', fontWeight: 300 }}>{desc}</p>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {tags.map(t => (
                          <span key={t} style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.28rem 0.65rem', border: '1px solid var(--border-mid)', borderRadius: 3, color: 'var(--fg-mid)' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
          <div className="divider" />
        </div>
      </div>
    </section>
  )
}
