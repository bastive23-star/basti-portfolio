'use client'
import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const SPRING = { stiffness: 220, damping: 18, mass: 0.6 }

interface Props {
  children: React.ReactNode
  strength?: number
  style?: React.CSSProperties
  className?: string
}

// Spring-driven so pointer jitter never restarts a CSS transition mid-flight.
export default function Magnetic({ children, strength = 0.3, style, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, SPRING)
  const sy = useSpring(y, SPRING)

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    x.set((e.clientX - r.left - r.width / 2) * strength)
    y.set((e.clientY - r.top - r.height / 2) * strength)
  }
  const reset = () => { x.set(0); y.set(0) }

  return (
    <motion.div
      ref={ref}
      className={className}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ display: 'inline-block', x: sx, y: sy, ...style }}
    >
      {children}
    </motion.div>
  )
}
