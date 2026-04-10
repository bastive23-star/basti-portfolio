'use client'
import { useRef } from 'react'

interface Props {
  children: React.ReactNode
  strength?: number
  style?: React.CSSProperties
}

export default function Magnetic({ children, strength = 0.38, style }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width  / 2) * strength
    const y = (e.clientY - rect.top  - rect.height / 2) * strength
    el.style.transform = `translate(${x}px, ${y}px)`
    el.style.transition = 'transform 0.1s ease'
  }

  const onLeave = () => {
    if (!ref.current) return
    ref.current.style.transform = 'translate(0,0)'
    ref.current.style.transition = 'transform 0.7s cubic-bezier(0.16,1,0.3,1)'
  }

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ display: 'inline-block', ...style }}>
      {children}
    </div>
  )
}
