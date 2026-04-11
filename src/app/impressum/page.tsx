import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Impressum — Basti' }

export default function Impressum() {
  return (
    <main style={{ padding: 'clamp(7rem, 15vh, 10rem) clamp(1.5rem, 5vw, 5rem) clamp(4rem, 8vh, 6rem)', maxWidth: 720, margin: '0 auto' }}>
      <Link href="/" style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.62rem', letterSpacing: '0.18em', color: 'var(--fg-faint)', textDecoration: 'none', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3.5rem', transition: 'color 0.2s' }}
        onMouseEnter={undefined}
      >
        ← Zurück
      </Link>

      <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--fg)', marginBottom: '3rem', letterSpacing: '-0.02em' }}>Impressum</h1>

      <div style={{ fontFamily: 'var(--ff-body)', fontSize: '0.92rem', color: 'var(--fg-mid)', lineHeight: 1.85, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section>
          <h2 style={{ fontSize: '0.75rem', fontFamily: 'var(--ff-mono)', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-faint)', marginBottom: '0.8rem', fontWeight: 400 }}>Angaben gemäß § 5 TMG</h2>
          <p>Sebastian Vitzthum<br />Demleitnerstraße 11<br />81371 München<br />Deutschland</p>
        </section>
        <section>
          <h2 style={{ fontSize: '0.75rem', fontFamily: 'var(--ff-mono)', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-faint)', marginBottom: '0.8rem', fontWeight: 400 }}>Kontakt</h2>
          <p>E-Mail: sebastian.vitzthum@vizz.de</p>
        </section>
        <section>
          <h2 style={{ fontSize: '0.75rem', fontFamily: 'var(--ff-mono)', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-faint)', marginBottom: '0.8rem', fontWeight: 400 }}>Haftung für Inhalte</h2>
          <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '0.75rem', fontFamily: 'var(--ff-mono)', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-faint)', marginBottom: '0.8rem', fontWeight: 400 }}>Urheberrecht</h2>
          <p>Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung.</p>
        </section>
      </div>
    </main>
  )
}
