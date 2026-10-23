'use client'
import MediaLibraryPage, { type LibraryRow } from '@/components/MediaLibraryPage'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const DIR  = `${BASE}/images/projects/Video`
const v    = (f: string) => `${DIR}/${f}`

const FEATURED = {
  src: v('Voith_APM_TheFacesBehind_E1_16x9.mp4'),
  client: 'Voith',
  title: 'The Faces',
  accent: 'Behind',
}

const ROWS: LibraryRow[] = [
  {
    title: 'Voith',
    items: [
      'Voith_APM_TheFacesBehind_E1_16x9.mp4',
      'Voith_AfterMarket_W.Hamburger_MainPiece_16x9_DE.mp4',
    ].map(v),
  },
  {
    title: 'Dachser',
    items: [
      'Dachser_PI_Start_Oktober_16x9.mp4',
      'raysonoXdachser_DigitalesTooling_16x9.mp4',
    ].map(v),
  },
  {
    title: 'Weitere Kunden',
    items: [
      'BI_KOL_Heimann_Longvideo_16x9_1.mp4',
      'BSH_IFA22_AnetteHöllemann_Solitaire_1x1-2.mp4',
      'PollmeierComponents_HQ.mp4',
      'Byte.mp4',
    ].map(v),
  },
]

export default function VideoPage() {
  return <MediaLibraryPage titleMain="Image &" titleAccent=" Eventfilm" featured={FEATURED} rows={ROWS} />
}
