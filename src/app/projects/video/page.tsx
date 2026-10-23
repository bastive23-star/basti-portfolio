'use client'
import VideoGalleryPage from '@/components/VideoGalleryPage'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const DIR  = `${BASE}/images/projects/Video`
const v    = (f: string) => `${DIR}/${f}`

const ROW1 = [
  'BI_KOL_Heimann_Longvideo_16x9_1.mp4',
  'BSH_IFA22_AnetteHöllemann_Solitaire_1x1-2.mp4',
  'Dachser_PI_Start_Oktober_16x9.mp4',
  'Voith_APM_TheFacesBehind_E1_16x9.mp4',
].map(v)

const ROW2 = [
  'Byte.mp4',
  'Voith_AfterMarket_W.Hamburger_MainPiece_16x9_DE.mp4',
  'raysonoXdachser_DigitalesTooling_16x9.mp4',
  'PollmeierComponents_HQ.mp4',
].map(v)

export default function VideoPage() {
  return <VideoGalleryPage titleMain="Image &" titleAccent=" Eventfilm" row1={ROW1} row2={ROW2} endCardRow={1} />
}
