'use client'
import VideoGalleryPage from '@/components/VideoGalleryPage'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const DIR  = `${BASE}/images/projects/Motion`
const v    = (f: string) => `${DIR}/${f}`

const ROW1 = [
  'DB_DBME24_DigitaleReisebegleitung_16x9.mp4',
  'DB_DBME24_ZukunftsvisionDBNavigator_9x16.mp4',
  'DB_VendoStoryVideoMainPiece_16x9.mp4',
  'HydroPocketTrailer_Part1_16x9_LQ.mp4',
  'McD_MobileOrderAndPay.mp4',
].map(v)

const ROW2 = [
  'PH_OneWeb_PromoVideo_16x9.mp4',
  'VoithSedimentCare_Short.mp4',
  'Voith_APM_MillOneTrailer_16x9.mp4',
  'Voith_APM_NameReveal_16x9.mp4',
  'TypoAnimation_DigitalTomorrowOutro_16x9.mp4',
].map(v)

export default function MotionPage() {
  return <VideoGalleryPage titleMain="Explainer &" titleAccent=" Motion" row1={ROW1} row2={ROW2} endCardRow={1} />
}
