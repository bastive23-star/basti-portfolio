import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Datenschutz — Basti' }

export default function Datenschutz() {
  return (
    <main style={{ padding: 'clamp(7rem, 15vh, 10rem) clamp(1.5rem, 5vw, 5rem) clamp(4rem, 8vh, 6rem)', maxWidth: 720, margin: '0 auto' }}>
      <Link href="/" style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--fg-mid)', textDecoration: 'none', textTransform: 'uppercase', display: 'inline-block', marginBottom: '3rem' }}>
        ← Zurück
      </Link>

      <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', color: 'var(--fg)', marginBottom: '2.5rem' }}>Datenschutzerklärung</h1>

      <div style={{ fontFamily: 'var(--ff-body)', fontSize: '0.92rem', color: 'var(--fg-mid)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <section>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--fg)', marginBottom: '0.5rem', fontFamily: 'var(--ff-body)' }}>1. Datenschutz auf einen Blick</h2>
          <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit deinen personenbezogenen Daten passiert, wenn du diese Website besuchst. Personenbezogene Daten sind alle Daten, mit denen du persönlich identifiziert werden kannst.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--fg)', marginBottom: '0.5rem', fontFamily: 'var(--ff-body)' }}>2. Verantwortliche Stelle</h2>
          <p>Sebastian Vitzthum<br />Demleitnerstraße 11<br />81371 München<br />Deutschland<br />E-Mail: sebastian.vitzthum@vizz.de</p>
        </section>
        <section>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--fg)', marginBottom: '0.5rem', fontFamily: 'var(--ff-body)' }}>3. Datenerfassung auf dieser Website</h2>
          <p><strong style={{ color: 'var(--fg)' }}>Kontaktformular:</strong> Wenn du das Kontaktformular verwendest, werden deine Angaben (Name, E-Mail, Nachricht) zur Bearbeitung deiner Anfrage gespeichert. Diese Daten geben wir nicht ohne deine Einwilligung weiter. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--fg)', marginBottom: '0.5rem', fontFamily: 'var(--ff-body)' }}>4. Cookies</h2>
          <p>Diese Website verwendet ausschließlich technisch notwendige Cookies. Für statistische Auswertungen werden Cookies nur mit deiner ausdrücklichen Einwilligung gesetzt. Du kannst deine Einwilligung jederzeit durch Löschen des Browser-Speichers widerrufen.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--fg)', marginBottom: '0.5rem', fontFamily: 'var(--ff-body)' }}>5. Google Fonts</h2>
          <p>Diese Website nutzt Google Fonts. Anbieter: Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Beim Laden der Seite werden die Schriftarten direkt von Google-Servern geladen, wodurch eine Verbindung zu Google hergestellt wird. Weitere Infos: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--fg)' }}>Google Datenschutz</a>.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--fg)', marginBottom: '0.5rem', fontFamily: 'var(--ff-body)' }}>6. Deine Rechte</h2>
          <p>Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung deiner gespeicherten personenbezogenen Daten. Wende dich dazu an: sebastian.vitzthum@vizz.de</p>
        </section>
      </div>
    </main>
  )
}
