import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { CategoryId, Photo } from '../data/photos'

export type FilterValue = CategoryId | 'all'

interface LightboxSession {
  /** The exact photo list the lightbox may navigate within — e.g. the current
   *  filtered subset on /work, or a single series' photos on /work/:seriesId. */
  photos: Photo[]
  index: number
}

interface PortfolioContextValue {
  filter: FilterValue
  setFilter: (next: FilterValue) => void
  lightbox: LightboxSession | null
  openLightbox: (photos: Photo[], index: number) => void
  closeLightbox: () => void
  stepLightbox: (delta: 1 | -1) => void
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null)

export function PortfolioProvider({ children }: { children: ReactNode }) {
  // Filter state lives at the app root so it survives /work unmounting when the
  // user navigates into a series page and back (constraint #1).
  const [filter, setFilter] = useState<FilterValue>('all')
  const [lightbox, setLightbox] = useState<LightboxSession | null>(null)

  const openLightbox = useCallback((photos: Photo[], index: number) => {
    if (photos.length === 0) return
    setLightbox({ photos, index: Math.min(Math.max(index, 0), photos.length - 1) })
  }, [])

  const closeLightbox = useCallback(() => setLightbox(null), [])

  // Navigation wraps around *within the session's own list* — never the full
  // 14-photo dataset (constraint #2).
  const stepLightbox = useCallback((delta: 1 | -1) => {
    setLightbox(current => {
      if (!current || current.photos.length === 0) return current
      const total = current.photos.length
      const index = (current.index + delta + total) % total
      return { ...current, index }
    })
  }, [])

  const value = useMemo(
    () => ({ filter, setFilter, lightbox, openLightbox, closeLightbox, stepLightbox }),
    [filter, lightbox, openLightbox, closeLightbox, stepLightbox],
  )

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>
}

export function usePortfolio(): PortfolioContextValue {
  const ctx = useContext(PortfolioContext)
  if (!ctx) throw new Error('usePortfolio must be used within <PortfolioProvider>')
  return ctx
}
