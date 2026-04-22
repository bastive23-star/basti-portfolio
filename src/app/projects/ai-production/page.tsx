'use client'
import VideoGalleryPage from '@/components/VideoGalleryPage'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const DIR  = `${BASE}/images/projects/AI_Production`
const v    = (f: string) => `${DIR}/${f}`

const ROW1 = [
  'Aral-Kaffeestudie_AI_Actionfiguren_9x16.mp4',
  'PH_Sterilium_2In1Wipes_Story2_ParisCityTrip_9x16.mp4',
  'PH_Sterilium_HeroVideo_16x9.mp4',
  'PH_Sterilium_2In1Wipes_Story3_FamilyOnTrain_9x16.mp4',
  'PH_WCW_AI_Campaign_Father&Daughter_9x16.mp4',
  'PH_Sterilium_2In1Wipes_Story5_Festival_9x16.mp4',
  'cB_ChristmasOffice.mp4',
].map(v)

const ROW2 = [
  'PH_WCW_AI_Campaign_GirlsGroup_9x16.mp4',
  'cB_NarratorTrend_AlleineWohnen.mp4',
  'PH_Sterilium_SurfaceWipes_Story2_BabyFood_9x16.mp4',
  'PH_WCW_AI_Campaign_Husband&Wife_9x16.mp4',
  'cB_NarratorTrend_Zocken.mp4',
  'cB!_OstereierZeitpunktInvestieren_Reel.mp4',
  'cB_AI-Betten_TikTok.mp4',
  'cB_SwipeAIMix.mp4',
].map(v)

export default function AIProductionPage() {
  return <VideoGalleryPage titleMain="AI" titleAccent=" Production" row1={ROW1} row2={ROW2} />
}
