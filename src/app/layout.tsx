import type { Metadata } from 'next'
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

export const metadata: Metadata = {
  title: 'Basti — Content Generalist',
  description: 'Content Generalist aus München. Video, Film, Animation, Foto, KI, Social Media — alles aus einer Hand. Ich suche eine Festanstellung.',
  themeColor: '#F7F5F2',
  colorScheme: 'light',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${dmSans.variable} ${dmMono.variable}`}>
      <body>
        <ClientShell />
        <PasswordGate>{children}</PasswordGate>
      </body>
    </html>
  )
}
