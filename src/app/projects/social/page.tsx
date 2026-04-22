'use client'
import VideoGalleryPage from '@/components/VideoGalleryPage'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const DIR  = `${BASE}/images/projects/Social`
const v    = (f: string) => `${DIR}/${encodeURIComponent(f)}`
const pdf  = (f: string) => `${DIR}/cB_ConorsWrapped/${f}`

const ROW1 = [
  'Aral_UltimateKampagne_Forschung_REM_Mikroskopie_4x5_2025.mp4',
  'BI_JAR_CRM_Focus_4x5.mp4',
  'BI_KOL_Heimann_SocialSnippet6_v2_9x16.mp4',
  'cb!_RichPeopleSecret_9x16.mp4',
  'Aral_CarreraRacingNight_Highlightvideo.mp4',
  'BI_LebensphasenorientierteWeiterbildungsprogramme_9x16.mp4',
].map(v)

const CONORS_WRAPPED = ['page_01.jpg','page_02.jpg','page_03.jpg','page_04.jpg',
                        'page_05.jpg','page_06.jpg','page_07.jpg','page_08.jpg'].map(pdf)

const ROW2 = [
  v('BI_OFEV_Laien_Diagnosed_60Schritte_4x5.mp4'),
  v('cB!_DerivateKampagne_Asset2.mp4'),
  v('BI_OFEV_Laien_Diagnosed_ IlluVideoHeinz_4x5.mp4'),
  v('cB_DigitalerEuro_Reel.mp4'),
  v('cB_Kreditkartenlimit_Reel.mp4'),
  CONORS_WRAPPED,  // single carousel tile
]

export default function SocialPage() {
  return <VideoGalleryPage titleMain="Social" titleAccent=" Media" row1={ROW1} row2={ROW2} rowOffset="clamp(1.5rem, 2vw, 2.5rem)" endCardRow={1} />
}
