'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EASE } from '@/lib/motion'

const PASSWORD = 'basti2025'

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false)
  const [ready,    setReady]    = useState(false)
  const [value,    setValue]    = useState('')
  const [focused,  setFocused]  = useState(false)
  const [error,    setError]    = useState(false)
  const [visible,  setVisible]  = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (sessionStorage.getItem('pw-auth') === '1') {
      setUnlocked(true)
    }
    setReady(true)
    setTimeout(() => setVisible(true), 80)
  }, [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value === PASSWORD) {
      sessionStorage.setItem('pw-auth', '1')
      setUnlocked(true)
    } else {
      setError(true)
      setValue('')
      setTimeout(() => { setError(false); inputRef.current?.focus() }, 700)
    }
  }

  if (!ready) return null

  return (
    <>
      {/* Site renders behind the gate */}
      {unlocked && children}

      <AnimatePresence>
        {!unlocked && (
          <motion.div
            key="gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.9, ease: EASE } }}
            style={{
              position: 'fixed', inset: 0, zIndex: 99999,
              background: 'var(--bg)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: 'clamp(2rem, 5vw, 4rem)',
            }}
          >
            {/* Grain — same as rest of site */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
              opacity: 0.025,
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }} />

            {/* Top bar */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -12 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              style={{
                position: 'absolute', top: 'clamp(1.5rem, 4vh, 2.5rem)',
                left: 'clamp(1.5rem, 5vw, 5rem)', right: 'clamp(1.5rem, 5vw, 5rem)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                zIndex: 1,
              }}
            >
              <span className="font-display" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--fg)', letterSpacing: '-0.02em' }}>B.</span>
              <span className="tag">Privat · Nur auf Einladung</span>
            </motion.div>

            {/* Center content */}
            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420, textAlign: 'left' }}>

              <motion.p
                className="tag"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 16 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
                style={{ marginBottom: '1.4rem' }}
              >
                Passwort erforderlich
              </motion.p>

              <motion.h1
                className="font-display"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 24 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.22 }}
                style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', fontWeight: 800, lineHeight: 0.92, letterSpacing: '-0.03em', marginBottom: '1.6rem' }}
              >
                Guten{' '}
                <em style={{ fontFamily: 'var(--ff-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>Tag.</em>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 16 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.32 }}
                style={{ fontFamily: 'var(--ff-body)', fontSize: 'clamp(0.88rem, 1.2vw, 0.98rem)', color: 'var(--fg-mid)', lineHeight: 1.8, fontWeight: 300, marginBottom: 'clamp(2rem, 5vh, 3rem)' }}
              >
                Dieses Portfolio ist passwortgeschützt.<br />
                Du hast keins? Einfach bei Basti melden.
              </motion.p>

              {/* Input + button */}
              <motion.form
                onSubmit={submit}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 16 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.42 }}
              >
                {/* Field */}
                <motion.div
                  animate={error ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ position: 'relative', marginBottom: '1.8rem' }}
                >
                  {/* Floating label */}
                  <motion.label
                    htmlFor="pw-input"
                    animate={{
                      y:           focused || value.length > 0 ? 0  : 22,
                      fontSize:    focused || value.length > 0 ? '0.55rem' : '0.82rem',
                      letterSpacing: focused || value.length > 0 ? '0.18em' : '0.02em',
                      color:       error    ? 'var(--fg)'
                                 : focused  ? 'var(--accent)'
                                 : 'var(--fg-faint)',
                    }}
                    transition={{ duration: 0.28, ease: EASE }}
                    style={{
                      position: 'absolute', top: 0, left: 0,
                      fontFamily: 'var(--ff-mono)', textTransform: 'uppercase',
                      pointerEvents: 'none', transformOrigin: 'left top', display: 'block',
                    }}
                  >
                    {error ? 'Falsches Passwort' : 'Passwort'}
                  </motion.label>

                  <input
                    ref={inputRef}
                    id="pw-input"
                    type="password"
                    autoComplete="off"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: `1px solid ${error ? 'var(--fg)' : focused ? 'var(--accent)' : 'var(--border-mid)'}`,
                      padding: '1.6rem 2.5rem 0.7rem 0',
                      color: 'var(--fg)',
                      fontFamily: 'var(--ff-body)',
                      fontSize: '1rem',
                      outline: 'none',
                      letterSpacing: value.length > 0 ? '0.2em' : '0',
                      transition: 'border-color 0.3s ease',
                      cursor: 'text',
                    }}
                  />

                  {/* Accent underline */}
                  <motion.span
                    animate={{ scaleX: focused && !error ? 1 : 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      height: 1, background: 'var(--accent)',
                      transformOrigin: 'left', display: 'block',
                    }}
                  />

                  {/* Submit arrow — inside the field on the right */}
                  <motion.button
                    type="submit"
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: 'absolute', right: 0, bottom: '0.6rem',
                      background: 'none', border: 'none', padding: 0,
                      color: focused ? 'var(--fg)' : 'var(--fg-faint)',
                      transition: 'color 0.2s',
                      cursor: 'pointer',
                    }}
                    aria-label="Entsperren"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4 10h12M12 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.button>
                </motion.div>
              </motion.form>
            </div>

            {/* Bottom bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: visible ? 1 : 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.6 }}
              style={{
                position: 'absolute', bottom: 'clamp(1.5rem, 4vh, 2.5rem)',
                left: 'clamp(1.5rem, 5vw, 5rem)', right: 'clamp(1.5rem, 5vw, 5rem)',
                display: 'flex', justifyContent: 'space-between',
                zIndex: 1,
              }}
            >
              <span className="tag">© {new Date().getFullYear()} Basti</span>
              <span className="tag">München</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
