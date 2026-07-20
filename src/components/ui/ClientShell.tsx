'use client'
import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import Cursor from './Cursor'
import { useKonami, StadtLandFlussOverlay } from './StadtLandFluss'

export default function ClientShell() {
  const [showGame, setShowGame] = useState(false)
  const open  = useCallback(() => setShowGame(true),  [])
  const close = useCallback(() => setShowGame(false), [])

  useKonami(open)

  return (
    <>
      <Cursor />
      <AnimatePresence>
        {showGame && <StadtLandFlussOverlay key="slf" onClose={close} />}
      </AnimatePresence>
    </>
  )
}
