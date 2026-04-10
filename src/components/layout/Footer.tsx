import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: 'clamp(2rem, 5vh, 3rem) clamp(1.5rem, 5vw, 5rem)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <span className="font-display" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--fg)', letterSpacing: '-0.02em' }}>B.</span>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <Link href="/impressum" data-cursor="→" className="tag link-underline" style={{ textDecoration: 'none' }}>Impressum</Link>
          <Link href="/datenschutz" data-cursor="→" className="tag link-underline" style={{ textDecoration: 'none' }}>Datenschutz</Link>
        </div>

        <span className="tag">© {year} Basti</span>
      </div>
    </footer>
  )
}
