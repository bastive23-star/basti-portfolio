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
    const onScroll = () => {
      const y = window.scrollY
      const vel = y - lastY.current
      lastY.current = y
      // clamp max lean to ±3deg
      skewTarget.current = Math.max(-3, Math.min(3, vel * -0.055))
    }

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const tick = () => {
      skewCur.current    = lerp(skewCur.current,    skewTarget.current, 0.075)
      skewTarget.current = lerp(skewTarget.current, 0,                  0.1)
      if (ref.current) {
        ref.current.style.transform = `skewY(${skewCur.current.toFixed(4)}deg)`
      }
      raf.current = requestAnimationFrame(tick)
    }
    tick()

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
