'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, animate } from 'framer-motion'
import { EASE } from '@/lib/motion'

function MagneticBtn({ children, type, onClick }: { children: React.ReactNode; type?: 'submit' | 'button'; onClick?: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)

  const onMove = (e: React.MouseEvent) => {
    const el = wrapRef.current; if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left - r.width  / 2) * 0.1
    const y = (e.clientY - r.top  - r.height / 2) * 0.1
    el.style.transform = `translate(${x}px, ${y}px)`
    el.style.transition = 'transform 0.18s ease'
  }
  const onLeave = () => {
    if (!wrapRef.current) return
    wrapRef.current.style.transform = 'translate(0,0)'
    wrapRef.current.style.transition = 'transform 0.8s cubic-bezier(0.16,1,0.3,1)'
  }

  return (
    <div ref={wrapRef} onMouseMove={onMove} onMouseLeave={onLeave} style={{ display: 'inline-block' }}>
      <motion.button
        type={type ?? 'button'}
        onClick={onClick}
        style={{
          fontFamily: 'var(--ff-mono)', fontWeight: 500, fontSize: '0.68rem',
          letterSpacing: '0.14em', textTransform: 'uppercase',
          padding: '0.62rem 1.5rem',
          border: '1px solid var(--border-mid)',
          borderRadius: 3,
          color: 'var(--fg)',
          background: 'transparent',
          cursor: 'none',
          display: 'inline-block',
        }}
        whileHover={{ background: 'var(--fg)', color: 'var(--bg)', borderColor: 'var(--fg)' }}
        transition={{ duration: 0.22, ease: EASE }}
      >
        {children}
      </motion.button>
    </div>
  )
}

function AnimatedField({
  id, label, type, placeholder, value, onChange, rows, invalid,
}: {
  id: string; label: string; type?: string; placeholder: string
  value: string; onChange: (v: string) => void; rows?: number; invalid?: boolean
}) {
  const [focused,          setFocused]          = useState(false)
  const [hovered,          setHovered]          = useState(false)
  const [textColor,        setTextColor]        = useState('var(--fg)')
  const [typedPlaceholder, setTypedPlaceholder] = useState('')
  const prevLenRef  = useRef(0)
  const rafRef      = useRef<number | undefined>(undefined)
  const typeTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const active     = focused || hovered || value.length > 0
  const hasContent = value.length > 0

  // Typewriter effect for placeholder — types in on focus, clears on blur
  useEffect(() => {
    clearInterval(typeTimerRef.current)
    if (!focused) {
      setTypedPlaceholder('')
      return
    }
    let i = 0
    typeTimerRef.current = setInterval(() => {
      i++
      setTypedPlaceholder(placeholder.slice(0, i))
      if (i >= placeholder.length) clearInterval(typeTimerRef.current)
    }, 38)
    return () => clearInterval(typeTimerRef.current)
  }, [focused, placeholder])

  // Fade in text when value jumps by > 2 chars at once (autofill / paste)
  useEffect(() => {
    const prev = prevLenRef.current
    prevLenRef.current = value.length
    if (value.length - prev > 2) {
      cancelAnimationFrame(rafRef.current!)
      setTextColor('transparent')
      // Two rAFs: first lets the transparent state paint, second starts the transition
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => setTextColor('var(--fg)'))
      })
    }
    return () => cancelAnimationFrame(rafRef.current!)
  }, [value])

  const baseStyle: React.CSSProperties = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: `1px solid ${focused ? 'var(--accent)' : 'var(--border-mid)'}`,
    padding: '1.6rem 0 0.7rem',
    color: textColor,
    fontFamily: 'var(--ff-body)',
    fontSize: '0.92rem',
    outline: 'none',
    transition: textColor === 'transparent'
      ? 'border-color 0.3s ease'
      : 'color 0.55s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease',
    minHeight: rows ? undefined : 48,
    borderRadius: 0,
    resize: 'none',
    display: 'block',
  }

  return (
    <motion.div
      animate={invalid ? { x: [0, -7, 7, -5, 5, -3, 0] } : { x: 0 }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
      style={{ position: 'relative', marginBottom: '1.4rem' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Floating label */}
      <motion.label
        htmlFor={id}
        animate={{
          y: active ? 0 : 22,
          fontSize: active ? '0.55rem' : '0.82rem',
          letterSpacing: active ? '0.18em' : '0.02em',
          color: invalid ? '#e05555' : focused ? 'var(--accent)' : active ? 'var(--fg-faint)' : 'var(--fg-faint)',
        }}
        transition={{ duration: 0.28, ease: EASE }}
        style={{
          position: 'absolute', top: 0, left: 0,
          fontFamily: 'var(--ff-mono)', textTransform: 'uppercase',
          pointerEvents: 'none', transformOrigin: 'left top',
          display: 'block',
        }}
      >
        {label}
      </motion.label>

      {/* Character count dot — appears when typing */}
      <AnimatePresence>
        {hasContent && (
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute', top: 6, right: 0,
              fontFamily: 'var(--ff-mono)', fontSize: '0.5rem',
              color: 'var(--fg-faint)', letterSpacing: '0.05em',
            }}
          >
            {value.length}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Accent underline fill */}
      <motion.span
        animate={{ scaleX: focused || hovered ? 1 : 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 1, background: 'var(--accent)',
          transformOrigin: 'left', display: 'block',
        }}
      />

      {rows ? (
        <textarea
          id={id} required rows={rows} placeholder={typedPlaceholder}
          value={value} onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={baseStyle}
        />
      ) : (
        <input
          id={id} type={type ?? 'text'} required
          placeholder={typedPlaceholder}
          value={value} onChange={e => onChange(e.target.value)}
          autoComplete={id}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={baseStyle}
        />
      )}
    </motion.div>
  )
}

// ─── Slider CAPTCHA ───────────────────────────────────────────────────────────
const THUMB = 52
const BURST_COLORS = ['#C8E600', '#ffffff', '#d4f857', '#f0ff70', '#8fdb00', '#e8ffb0']

function SliderVerify({ onComplete, sending, error }: { onComplete: () => void; sending: boolean; error: boolean }) {
  const trackRef  = useRef<HTMLDivElement>(null)
  const x         = useMotionValue(0)
  const [done, setDone]           = useState(false)
  const [confetti, setConfetti]   = useState(false)

  // Reset when submission fails
  useEffect(() => {
    if (error) {
      setDone(false)
      animate(x, 0, { type: 'spring', stiffness: 380, damping: 28 })
    }
  }, [error, x])

  const fillW       = useTransform(x, v => `${Math.max(v + THUMB, 0)}px`)
  const fillOpacity = useTransform(x, [0, 80, 240], [0.18, 0.7, 1])
  const blobScale   = useTransform(x, [0, 100, 240], [1, 1.12, 1.03])
  const fillHue     = useTransform(x, [0, 240], [60, 80]) // lime shifts slightly warmer

  const particles = useMemo(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id:      i,
      angle:   (360 / 28) * i + (Math.random() * 18 - 9),
      dist:    52 + Math.random() * 72,
      color:   BURST_COLORS[i % BURST_COLORS.length],
      size:    4 + Math.random() * 4,
      circle:  Math.random() > 0.45,
      delay:   Math.random() * 0.1,
    }))
  , [])

  const handleDragEnd = () => {
    const trackW = trackRef.current?.offsetWidth ?? 320
    if (x.get() >= trackW - THUMB - 6) {
      x.set(trackW - THUMB)
      setDone(true)
      setConfetti(true)
      setTimeout(() => setConfetti(false), 1400)
      onComplete()
    } else {
      animate(x, 0, { type: 'spring', stiffness: 380, damping: 28 })
    }
  }

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>

      {/* Confetti burst */}
      <AnimatePresence>
        {confetti && (
          <div aria-hidden style={{ position: 'absolute', left: '50%', top: '50%', pointerEvents: 'none', zIndex: 10 }}>
            {particles.map(p => {
              const rad = (p.angle * Math.PI) / 180
              return (
                <motion.span
                  key={p.id}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{
                    x: Math.cos(rad) * p.dist,
                    y: Math.sin(rad) * p.dist,
                    scale: [0, 1.3, 1],
                    opacity: [1, 1, 0],
                    rotate: Math.random() * 540 - 270,
                  }}
                  transition={{ duration: 0.7 + p.delay * 2, ease: 'easeOut', delay: p.delay }}
                  style={{
                    position: 'absolute', display: 'block',
                    width: p.size, height: p.size,
                    borderRadius: p.circle ? '50%' : 2,
                    background: p.color,
                    transform: 'translate(-50%,-50%)',
                  }}
                />
              )
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Track */}
      <div
        ref={trackRef}
        style={{
          position: 'relative', height: 52, overflow: 'hidden',
          background: 'var(--bg)',
          border: `1px solid ${done ? 'transparent' : 'var(--border-mid)'}`,
          borderRadius: 3,
          transition: 'border-color 0.4s ease',
        }}
      >
        {/* Liquid fill */}
        <motion.div style={{
          position: 'absolute', top: '-20%', bottom: '-20%', left: 0,
          width: done ? '110%' : fillW,
          background: done
            ? 'var(--accent)'
            : `hsl(${fillHue}, 100%, 52%)`,
          opacity: done ? 1 : fillOpacity,
          scaleY: done ? 1 : blobScale,
          borderRadius: done ? 0 : '0 40% 40% 0 / 0 50% 50% 0',
          transition: done ? 'width 0.22s ease, border-radius 0.3s ease, opacity 0.2s' : undefined,
          transformOrigin: 'left center',
        }} />

        {/* Label */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="ok"
                initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: EASE }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2 6.5l3.5 3.5 5.5-6" stroke="var(--bg)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.58rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--bg)' }}>
                  {sending ? 'Wird gesendet …' : 'Bestätigt'}
                </span>
              </motion.div>
            ) : (
              <motion.div key="hint" exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}
              >
                <motion.svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                >
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="var(--fg-mid)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </motion.svg>
                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.58rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-mid)' }}>
                  Ziehen zum Senden
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Thumb */}
        {!done && (
          <motion.div
            drag="x" dragConstraints={trackRef} dragElastic={0} dragMomentum={false}
            style={{
              x, position: 'absolute', top: 0, left: 0, bottom: 0,
              width: THUMB, zIndex: 3,
              background: 'var(--fg)', borderRadius: '2px 0 0 2px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'grab', touchAction: 'none',
            }}
            whileDrag={{ cursor: 'grabbing' }}
            onDragEnd={handleDragEnd}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3.5L9 7l-4 3.5" stroke="var(--bg)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const titleY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])
  const ghostY = useTransform(scrollYProgress, [0, 1], ['-6%',  '16%'])
  const ghostX = useTransform(scrollYProgress, [0, 1], ['-8%',  '4%'])

  const [error, setError]       = useState(false)
  const [sending, setSending]   = useState(false)
  const [invalidFields, setInvalidFields] = useState<string[]>([])

  const validate = () => {
    const missing = (['name', 'email', 'message'] as const).filter(k => !form[k].trim())
    setInvalidFields(missing)
    return missing.length === 0
  }

  const submitForm = async () => {
    if (!validate()) return
    setSending(true)
    setError(false)
    try {
      const res = await fetch('https://formspree.io/f/mkokvnpg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, message: form.message }),
      })
      if (res.ok) setSent(true)
      else setError(true)
    } catch {
      setError(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="contact" ref={sectionRef} className="section-pad" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)', overflow: 'hidden', position: 'relative' }}>
      {/* Ghost background word */}
      <motion.div
        style={{ y: ghostY, x: ghostX, position: 'absolute', top: '0%', right: '-5%', pointerEvents: 'none', zIndex: 0, userSelect: 'none' }}
        aria-hidden
      >
        <span style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(8rem, 22vw, 20rem)', fontWeight: 800, color: 'var(--fg)', opacity: 0.025, letterSpacing: '-0.04em', whiteSpace: 'nowrap', lineHeight: 1, display: 'block' }}>
          KONTAKT
        </span>
      </motion.div>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(3rem, 8vw, 9rem)', alignItems: 'start' }}>

          {/* Left */}
          <motion.div
            style={{ y: titleY }}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <p className="tag" style={{ marginBottom: '1.5rem' }}>Kontakt</p>
            <h2 style={{ fontSize: 'clamp(2.6rem, 5.5vw, 5rem)', color: 'var(--fg)', marginBottom: '1.8rem' }}>
              Klingt das<br />
              <em style={{ fontFamily: 'var(--ff-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>interessant?</em>
            </h2>
            <p style={{ fontFamily: 'var(--ff-body)', fontSize: 'clamp(0.92rem, 1.2vw, 1rem)', color: 'var(--fg-mid)', lineHeight: 1.85, fontWeight: 300, marginBottom: '0.9rem', maxWidth: '36ch' }}>
              Ich suche gerade eine Festanstellung in München. Content Generalist — Video, Foto, Grafik, Animation, Musik, KI. Alles selbst produziert.
            </p>
            <p style={{ fontFamily: 'var(--ff-body)', fontSize: 'clamp(0.92rem, 1.2vw, 1rem)', color: 'var(--fg-mid)', lineHeight: 1.85, fontWeight: 300, marginBottom: '2.5rem', maxWidth: '36ch' }}>
              Wenn du denkst, ich passe zu euch — schreib mir.<br />Ich antworte schnell.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {[
                { label: 'Mail', href: 'mailto:sebastian.vitzthum@vizz.de', text: 'sebastian.vitzthum@vizz.de', cursor: 'Mail' },
                { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sebastian-vitzthum-101154180/', text: 'linkedin.com/in/sebastian-vitzthum', cursor: '→' },
              ].map(({ label, href, text, cursor }) => (
                <motion.div
                  key={label}
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1.2rem', borderBottom: '1px solid var(--border)' }}
                  whileHover={{ x: 6 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <span className="tag" style={{ minWidth: '4rem' }}>{label}</span>
                  <motion.a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" data-cursor={cursor}
                    style={{ fontFamily: 'var(--ff-body)', fontSize: '0.88rem', color: 'var(--fg-mid)', textDecoration: 'none' }}
                    whileHover={{ color: 'var(--fg)' }}
                    transition={{ duration: 0.2 }}
                  >
                    {text}
                  </motion.a>
                </motion.div>
              ))}
            </div>

            {/* Availability badge */}
            <motion.div
              style={{ marginTop: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: 980 }}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-online)' }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <span className="font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-mid)' }}>
                Offen für Angebote
              </span>
            </motion.div>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
          >
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: EASE }}
                style={{ padding: '4rem 2rem', textAlign: 'center', border: '1px solid var(--border)', borderRadius: 8 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
                  style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10l5 5 8-8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
                <p className="font-display" style={{ fontSize: '1.6rem', color: 'var(--fg)', marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>Danke!</p>
                <p style={{ fontFamily: 'var(--ff-body)', fontSize: '0.88rem', color: 'var(--fg-mid)', fontWeight: 300 }}>Ich melde mich innerhalb von 24 Stunden.</p>
              </motion.div>
            ) : (
              <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Honeypot — bots fill this, humans don't see it */}
                <input name="_gotcha" type="text" tabIndex={-1} aria-hidden style={{ display: 'none' }} />
                <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.6 }}>
                  <AnimatedField id="name" label="Dein Name *" type="text" placeholder="Max Mustermann"
                    value={form.name} invalid={invalidFields.includes('name')}
                    onChange={v => { setForm(f => ({ ...f, name: v })); setInvalidFields(f => f.filter(x => x !== 'name')) }} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.6 }}>
                  <AnimatedField id="email" label="E-Mail-Adresse *" type="email" placeholder="max@unternehmen.de"
                    value={form.email} invalid={invalidFields.includes('email')}
                    onChange={v => { setForm(f => ({ ...f, email: v })); setInvalidFields(f => f.filter(x => x !== 'email')) }} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.6 }} style={{ marginBottom: '2rem' }}>
                  <AnimatedField id="message" label="Was suchst du? *" placeholder="Welche Rolle, welches Team, was du dir vorstellst..."
                    value={form.message} invalid={invalidFields.includes('message')}
                    onChange={v => { setForm(f => ({ ...f, message: v })); setInvalidFields(f => f.filter(x => x !== 'message')) }} rows={4} />
                </motion.div>

                <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.55rem', color: 'var(--fg-faint)', lineHeight: 1.7, marginBottom: '1.8rem' }}>
                  * Pflichtfeld · Daten werden nur zur Kontaktaufnahme genutzt.{' '}
                  <a href="/datenschutz" style={{ color: 'var(--fg-mid)' }}>Datenschutz</a>
                </p>

                {error && (
                  <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.6rem', color: '#e05', marginBottom: '1rem', letterSpacing: '0.08em' }}>
                    Etwas ist schiefgelaufen — bitte versuch es nochmal.
                  </p>
                )}

                <SliderVerify onComplete={submitForm} sending={sending} error={error} />
              </form>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  )
}
