// Shared animation constants — import these instead of inlining magic arrays.

/** Smooth ease-out expo — general purpose enters and state transitions */
export const EASE      = [0.16, 1, 0.3, 1]      as [number, number, number, number]

/** Snappy ease — used for clip-path / mechanical motion */
export const EASE_SNAP = [0.76, 0, 0.24, 1]      as [number, number, number, number]

/** Standard transition presets */
export const t = {
  fast:   (delay = 0) => ({ duration: 0.35, ease: EASE, delay }),
  base:   (delay = 0) => ({ duration: 0.65, ease: EASE, delay }),
  slow:   (delay = 0) => ({ duration: 1.1,  ease: EASE, delay }),
  smooth: (delay = 0) => ({ duration: 1.4,  ease: EASE, delay }),
}
