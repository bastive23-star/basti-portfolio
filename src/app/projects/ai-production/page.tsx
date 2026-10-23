'use client'
import MediaLibraryPage, { type LibraryRow } from '@/components/MediaLibraryPage'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const DIR  = `${BASE}/images/projects/AI_Production`
const v    = (f: string) => `${DIR}/${f}`

const FEATURED = {
  src: v('PH_Sterilium_HeroVideo_16x9.mp4'),
  client: 'Paul Hartmann',
  title: 'Sterillium',
  accent: 'To\u00A0Go',
}

const ROWS: LibraryRow[] = [
  {
    title: 'Paul Hartmann',
    items: [
      'PaulHartmann_IncoSalesRep_16x9.mp4',
      'PaulHartmann_IncoSalesRep_Video2_16x9.mp4',
      'AI_AfterHour_PH_AI_Campaign_9x16.mp4',
      'PH_WCW_AI_Campaign_Father&Daughter_9x16.mp4',
      'PH_WCW_AI_Campaign_GirlsGroup_9x16.mp4',
      'PH_WCW_AI_Campaign_Husband&Wife_9x16.mp4',
    ].map(v),
  },
  {
    title: 'Sterillium',
    items: [
      'PH_Sterilium_HeroVideo_16x9.mp4',
      'PH_Sterilium_2In1Wipes_Story1_PicnicInThePark_9x16.mp4',
      'PH_Sterilium_2In1Wipes_Story2_ParisCityTrip_9x16.mp4',
      'PH_Sterilium_2In1Wipes_Story3_FamilyOnTrain_9x16.mp4',
      'PH_Sterilium_2In1Wipes_Story4_Camping_9x16.mp4',
      'PH_Sterilium_2In1Wipes_Story5_Festival_9x16.mp4',
      'PH_Sterilium_SurfaceWipes_Story2_BabyFood_9x16.mp4',
    ].map(v),
  },
  {
    title: 'cB',
    items: [
      'cB_ChristmasOffice.mp4',
      'cB_NarratorTrend_AlleineWohnen.mp4',
      'cB_NarratorTrend_Zocken.mp4',
      'cB!_OstereierZeitpunktInvestieren_Reel.mp4',
      'cB_AI-Betten_TikTok.mp4',
      'cB_SwipeAIMix.mp4',
    ].map(v),
  },
  {
    title: 'Aral',
    items: [
      'Aral-Kaffeestudie_AI_Actionfiguren_9x16.mp4',
    ].map(v),
  },
]

export default function AIProductionPage() {
  return <MediaLibraryPage titleMain="AI" titleAccent=" Production" featured={FEATURED} rows={ROWS} />
}
