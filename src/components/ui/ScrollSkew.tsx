'use client'
import { useEffect, useRef } from 'react'

// Applies a subtle skewY based on scroll velocity — gives content physical weight.
export default function ScrollSkew({ children }: { children: React.ReactNode }) {
  const ref        = useRef<HTMLDivElement>(null)
  const lastY      = useRef(0)
  const skewCur    = useRef(0)
  const skewTarget = useRef(0)
  const raf        = useRef<number>(0)

  useEffect(() => {
    let running = false
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const tick = () => {
      skewCur.current    = lerp(skewCur.current,    skewTarget.current, 0.075)
      skewTarget.current = lerp(skewTarget.current, 0,                  0.1)
      if (ref.current) {
        ref.current.style.transform = `skewY(${skewCur.current.toFixed(4)}deg)`
      }
      // Idle-stop: skip RAF when both values have converged to zero
      if (Math.abs(skewCur.current) > 0.002 || Math.abs(skewTarget.current) > 0.002) {
        raf.current = requestAnimationFrame(tick)
      } else {
        running = false
      }
    }

    const onScroll = () => {
      const y = window.scrollY
      const vel = y - lastY.current
      lastY.current = y
      skewTarget.current = Math.max(-3, Math.min(3, vel * -0.055))
      // Restart RAF only if not already running
      if (!running) { running = true; raf.current = requestAnimationFrame(tick) }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <div ref={ref} style={{ transformOrigin: 'center center', willChange: 'transform' }}>
      {children}
    </div>
  )
}
