'use client'
import MediaLibraryPage, { type LibraryRow } from '@/components/MediaLibraryPage'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const DIR  = `${BASE}/images/projects/Motion`
const v    = (f: string) => `${DIR}/${f}`

const FEATURED = {
  src: v('DB_VendoStoryVideoMainPiece_16x9.mp4'),
  client: 'Deutsche Bahn',
  title: 'Vendo',
  accent: 'Story',
}

const ROWS: LibraryRow[] = [
  {
    title: 'Deutsche Bahn',
    items: [
      'DB_VendoStoryVideoMainPiece_16x9.mp4',
      'DB_DBME24_DigitaleReisebegleitung_16x9.mp4',
      'DB_DBME24_ZukunftsvisionDBNavigator_9x16.mp4',
    ].map(v),
  },
  {
    title: 'Voith',
    items: [
      'Voith_APM_MillOneTrailer_16x9.mp4',
      'Voith_APM_NameReveal_16x9.mp4',
      'VoithSedimentCare_Short.mp4',
    ].map(v),
  },
  {
    title: 'Weitere Kunden',
    items: [
      'McD_MobileOrderAndPay.mp4',
      'PH_OneWeb_PromoVideo_16x9.mp4',
      'HydroPocketTrailer_Part1_16x9_LQ.mp4',
      'TypoAnimation_DigitalTomorrowOutro_16x9.mp4',
    ].map(v),
  },
]

export default function MotionPage() {
  return <MediaLibraryPage titleMain="Explainer &" titleAccent=" Motion" featured={FEATURED} rows={ROWS} />
}
