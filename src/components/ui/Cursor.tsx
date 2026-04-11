'use client'
import { useEffect, useRef, useState } from 'react'

export default function Cursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [label, setLabel]     = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Touch-only devices don't need a custom cursor
    if (navigator.maxTouchPoints > 0) return

    let mx = 0, my = 0
    let rx = 0, ry = 0
    let raf: number

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
      setVisible(true)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx}px, ${my}px)`
      }
    }

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const tick = () => {
      rx = lerp(rx, mx, 0.12)
      ry = lerp(ry, my, 0.12)
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${rx}px, ${ry}px)`
      }
      raf = requestAnimationFrame(tick)
    }
    tick()

    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)
      const dataCursorEl = el.closest('[data-cursor]')
      const clickable = el.closest('a, button, [role="button"], [tabindex]')
      setLabel(dataCursorEl?.getAttribute('data-cursor') ?? (clickable ? 'circle' : ''))
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      cancelAnimationFrame(raf)
    }
  }, [])

  const expanded = label !== ''

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999999, pointerEvents: 'none' }}>
      {/* Dot */}
      <div
        ref={dotRef}
        style={{
          position: 'absolute',
          top: -3, left: -3,
          width: 6, height: 6,
          borderRadius: '50%',
          background: 'var(--fg)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.2s',
          willChange: 'transform',
        }}
      />
      {/* Ring — grows on hover, never fills */}
      <div
        ref={ringRef}
        style={{
          position: 'absolute',
          top:  expanded ? -28 : -18,
          left: expanded ? -28 : -18,
          width:  expanded ? 56 : 36,
          height: expanded ? 56 : 36,
          borderRadius: '50%',
          border: `1.5px solid ${expanded ? 'rgba(20,18,16,0.55)' : 'rgba(20,18,16,0.25)'}`,
          background: 'transparent',
          opacity: visible ? 1 : 0,
          transition: 'width 0.25s var(--ease-out-expo), height 0.25s var(--ease-out-expo), top 0.25s var(--ease-out-expo), left 0.25s var(--ease-out-expo), border-color 0.2s, opacity 0.2s',
          willChange: 'transform',
        }}
      />
    </div>
  )
}
