'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookie-consent')) {
      setTimeout(() => setVisible(true), 1200)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Cookie-Einstellungen"
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            zIndex: 10000,
            width: 'min(520px, calc(100vw - 2rem))',
            background: 'rgba(247,245,242,0.97)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '1.5rem',
            backdropFilter: 'blur(20px)',
          }}
          initial={{ opacity: 0, y: 24, x: '-50%' }}
          animate={{ opacity: 1, y: 0,  x: '-50%' }}
          exit={{    opacity: 0, y: 16, x: '-50%' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="tag" style={{ marginBottom: '0.6rem' }}>Cookies</p>
          <p style={{ fontFamily: 'var(--ff-body)', fontSize: '0.85rem', color: 'var(--fg-mid)', lineHeight: 1.6, marginBottom: '1.2rem' }}>
            Diese Website verwendet Cookies, um die Nutzererfahrung zu verbessern und anonyme Nutzungsstatistiken zu erheben. Weitere Infos in der{' '}
            <a href="/datenschutz" style={{ color: 'var(--fg)', textDecoration: 'underline' }}>Datenschutzerklärung</a>.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={accept}
              data-cursor="OK"
              style={{ flex: 1, minWidth: 120, padding: '0.7rem 1.2rem', background: 'var(--fg)', color: 'var(--bg)', border: 'none', borderRadius: 6, fontFamily: 'var(--ff-body)', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.04em', cursor: 'pointer' }}
            >
              Alle akzeptieren
            </button>
            <button
              onClick={decline}
              data-cursor="Nein"
              style={{ flex: 1, minWidth: 120, padding: '0.7rem 1.2rem', background: 'transparent', color: 'var(--fg-mid)', border: '1px solid var(--border)', borderRadius: 6, fontFamily: 'var(--ff-body)', fontWeight: 500, fontSize: '0.82rem', cursor: 'pointer' }}
            >
              Nur notwendige
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
