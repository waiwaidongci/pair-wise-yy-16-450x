import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { FilterId, Photo } from '../data/photos'

/* ---------------- 筛选状态（跨页面保持） ---------------- */

const FILTER_STORAGE_KEY = 'portfolio:work-filter'
const VALID_FILTERS: FilterId[] = ['all', 'portrait', 'landscape', 'pastoral']

function readStoredFilter(): FilterId {
  try {
    const stored = window.sessionStorage.getItem(FILTER_STORAGE_KEY)
    if (stored && (VALID_FILTERS as string[]).includes(stored)) {
      return stored as FilterId
    }
  } catch {
    // sessionStorage 不可用时退回默认值
  }
  return 'all'
}

/* ---------------- 灯箱状态（全局唯一实例） ---------------- */

interface LightboxState {
  photos: Photo[]
  index: number
}

interface LightboxApi {
  open: (photos: Photo[], index: number) => void
  close: () => void
  prev: () => void
  next: () => void
  goto: (index: number) => void
}

interface PortfolioContextValue {
  filter: FilterId
  setFilter: (filter: FilterId) => void
  lightbox: LightboxState | null
  lightboxApi: LightboxApi
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null)

export function PortfolioProvider({ children }: { children: ReactNode }) {
  // 筛选状态提升到路由之外：从 /work 进入系列页再返回时，/work 重新挂载仍能读到之前的值。
  // 再叠加 sessionStorage，浏览器后退重建内存也不丢。
  const [filter, setFilterState] = useState<FilterId>(readStoredFilter)

  const setFilter = useCallback((next: FilterId) => {
    setFilterState(next)
    try {
      window.sessionStorage.setItem(FILTER_STORAGE_KEY, next)
    } catch {
      // 忽略写入失败
    }
  }, [])

  // 整个应用只有这一份灯箱状态：首页精选、/work 网格、系列详情页打开的都是同一个组件实例。
  const [lightbox, setLightbox] = useState<LightboxState | null>(null)

  const open = useCallback((list: Photo[], index: number) => {
    if (list.length === 0) return
    setLightbox({ photos: list, index: Math.min(Math.max(index, 0), list.length - 1) })
  }, [])

  const close = useCallback(() => setLightbox(null), [])

  const goto = useCallback((index: number) => {
    setLightbox((current) => {
      if (!current) return current
      const total = current.photos.length
      return { ...current, index: (index + total) % total }
    })
  }, [])

  const prev = useCallback(() => {
    setLightbox((current) => {
      if (!current) return current
      const total = current.photos.length
      return { ...current, index: (current.index - 1 + total) % total }
    })
  }, [])

  const next = useCallback(() => {
    setLightbox((current) => {
      if (!current) return current
      const total = current.photos.length
      return { ...current, index: (current.index + 1) % total }
    })
  }, [])

  // 灯箱打开时锁住所底层页面的滚动
  useEffect(() => {
    document.body.style.overflow = lightbox ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [lightbox])

  const lightboxApi = useMemo<LightboxApi>(
    () => ({ open, close, prev, next, goto }),
    [open, close, prev, next, goto],
  )

  const value = useMemo<PortfolioContextValue>(
    () => ({ filter, setFilter, lightbox, lightboxApi }),
    [filter, setFilter, lightbox, lightboxApi],
  )

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>
}

export function usePortfolio(): PortfolioContextValue {
  const ctx = useContext(PortfolioContext)
  if (!ctx) throw new Error('usePortfolio 必须在 <PortfolioProvider> 内使用')
  return ctx
}
