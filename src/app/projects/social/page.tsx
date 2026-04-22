'use client'
import VideoGalleryPage from '@/components/VideoGalleryPage'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const DIR  = `${BASE}/images/projects/Social`
const v    = (f: string) => `${DIR}/${encodeURIComponent(f)}`

const ROW1 = [
  'Aral_UltimateKampagne_Forschung_REM_Mikroskopie_4x5_2025.mp4',
  'BI_JAR_CRM_Focus_4x5.mp4',
  'BI_KOL_Heimann_SocialSnippet6_v2_9x16.mp4',
  'BI_OFEV_Laien_Diagnosed_60Schritte_4x5.mp4',
  'cB!_DerivateKampagne_Asset2.mp4',
].map(v)

const ROW2 = [
  'BI_OFEV_Laien_Diagnosed_ IlluVideoHeinz_4x5.mp4',
  'cB_DigitalerEuro_Reel.mp4',
  'cB_Kreditkartenlimit_Reel.mp4',
  'cb!_RichPeopleSecret_9x16.mp4',
].map(v)

export default function SocialPage() {
  return <VideoGalleryPage titleMain="Social" titleAccent=" Media" row1={ROW1} row2={ROW2} />
}
