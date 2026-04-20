import type { Metadata, Viewport } from 'next'
import { DM_Sans, DM_Mono } from 'next/font/google'
import ClientShell from '@/components/ui/ClientShell'
import PasswordGate from '@/components/ui/PasswordGate'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const dmMono = DM_Mono({
  variable: '--font-dm-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#F7F5F2',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
}

const SITE_URL = 'https://basti-vitzthum.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Basti Vitzthum — Content Generalist München',
  description: 'Content Generalist aus München. Video, Film, Animation, Foto, KI, Social Media — alles aus einer Hand. Auf Jobsuche.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: SITE_URL,
    siteName: 'Basti Vitzthum',
    title: 'Basti Vitzthum — Content Generalist München',
    description: 'Video, Film, Animation, Foto, KI und Social Media aus einer Hand. Content Generalist auf Jobsuche in München.',
  },
  twitter: {
    card: 'summary',
    title: 'Basti Vitzthum — Content Generalist München',
    description: 'Video, Film, Animation, Foto, KI und Social Media aus einer Hand.',
  },
  robots: { index: true, follow: true },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Sebastian Vitzthum',
  alternateName: 'Basti',
  url: 'https://basti-vitzthum.com',
  jobTitle: 'Content Generalist',
  description: 'Content Generalist aus München — Video, Film, Animation, Foto, KI, Social Media.',
  address: { '@type': 'PostalAddress', addressLocality: 'München', addressCountry: 'DE' },
  email: 'sebastian.vitzthum@vizz.de',
  sameAs: ['https://www.linkedin.com/in/sebastian-vitzthum-101154180/'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${dmSans.variable} ${dmMono.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <ClientShell />
        <PasswordGate>{children}</PasswordGate>
      </body>
    </html>
  )
}
