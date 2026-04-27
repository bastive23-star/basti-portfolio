'use client'
import { useEffect, useRef, useState } from 'react'

export default function Cursor() {
  const dotRef    = useRef<HTMLDivElement>(null)
  const ringRef   = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  // Store expanded in a ref so the rAF tick always sees current value
  const expandedRef = useRef(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    expandedRef.current = expanded
  }, [expanded])

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return

    document.documentElement.classList.add('custom-cursor')

    let mx = 0, my = 0
    let rx = 0, ry = 0
    let raf: number

    // Dot: 6×6, offset -3 to centre on cursor
    const DOT_HALF  = 3
    // Ring sizes
    const RING_SM   = 36
    const RING_LG   = 56
    const RING_SM_H = RING_SM / 2
    const RING_LG_H = RING_LG / 2

    const applyDot = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx - DOT_HALF}px, ${my - DOT_HALF}px)`
      }
    }

    const applyRing = () => {
      if (ringRef.current) {
        const half = expandedRef.current ? RING_LG_H : RING_SM_H
        ringRef.current.style.transform = `translate(${rx - half}px, ${ry - half}px)`
        const size = expandedRef.current ? RING_LG : RING_SM
        ringRef.current.style.width  = `${size}px`
        ringRef.current.style.height = `${size}px`
        ringRef.current.style.borderColor = expandedRef.current
          ? 'rgba(20,18,16,0.55)'
          : 'rgba(20,18,16,0.25)'
      }
    }

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const tick = () => {
      rx = lerp(rx, mx, 0.12)
      ry = lerp(ry, my, 0.12)
      applyRing()
      if (Math.abs(mx - rx) > 0.1 || Math.abs(my - ry) > 0.1) {
        raf = requestAnimationFrame(tick)
      } else {
        raf = 0
      }
    }

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
      setVisible(true)
      applyDot()
      if (!raf) raf = requestAnimationFrame(tick)
    }

    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      const dataCursorEl = el.closest('[data-cursor]')
      const clickable    = el.closest('a, button, [role="button"], [tabindex]')
      const next = !!(dataCursorEl || clickable)
      setExpanded(next)
      expandedRef.current = next
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      cancelAnimationFrame(raf)
      document.documentElement.classList.remove('custom-cursor')
    }
  }, [])

  return (
    <>
      {/* Dot — position: fixed, centred via JS transform */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 6, height: 6,
          borderRadius: '50%',
          background: 'var(--fg)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.2s',
          zIndex: 999999,
          pointerEvents: 'none',
        }}
      />
      {/* Ring — position: fixed, size + centering fully via JS */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 36, height: 36,
          borderRadius: '50%',
          border: '1.5px solid rgba(20,18,16,0.25)',
          background: 'transparent',
          opacity: visible ? 1 : 0,
          transition: 'width 0.25s var(--ease-out-expo), height 0.25s var(--ease-out-expo), border-color 0.2s, opacity 0.2s',
          zIndex: 999999,
          pointerEvents: 'none',
        }}
      />
    </>
  )
}
