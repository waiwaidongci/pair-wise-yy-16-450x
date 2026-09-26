import rawData from './photos.json'

export type CategoryId = 'portrait' | 'landscape' | 'pastoral'

export interface Photo {
  id: string
  category: CategoryId
  seriesId: string
  file: string
  title: string
  altText: string
  caption: string
  width: number
  height: number
  order: number
}

export interface Series {
  id: string
  title: string
  category: CategoryId
  summary: string
  photoIds: string[]
}

export interface Category {
  id: CategoryId
  label: string
}

export interface PhotoData {
  categories: Category[]
  series: Series[]
  photos: Photo[]
}

// mock-data/photos.json is the single authoritative content source.
// Every page derives its photo list from this module — nothing is hardcoded.
export const photoData = rawData as PhotoData

export const categories: Category[] = photoData.categories
export const allSeries: Series[] = photoData.series
export const allPhotos: Photo[] = photoData.photos

const categoryOrder = new Map(categories.map((c, i) => [c.id, i]))

/** All photos in a stable editorial order: category order, then `order` within a series. */
export function orderedPhotos(photos: Photo[]): Photo[] {
  return [...photos].sort((a, b) => {
    const byCategory = (categoryOrder.get(a.category) ?? 0) - (categoryOrder.get(b.category) ?? 0)
    if (byCategory !== 0) return byCategory
    if (a.seriesId !== b.seriesId) return a.seriesId.localeCompare(b.seriesId)
    return a.order - b.order
  })
}

export function photosForCategory(category: CategoryId | 'all'): Photo[] {
  const pool = category === 'all' ? allPhotos : allPhotos.filter(p => p.category === category)
  return orderedPhotos(pool)
}

export function photosForSeries(seriesId: string): Photo[] {
  return allPhotos.filter(p => p.seriesId === seriesId).sort((a, b) => a.order - b.order)
}

export function seriesById(seriesId: string): Series | undefined {
  return allSeries.find(s => s.id === seriesId)
}

export function seriesForCategory(categoryId: CategoryId): Series | undefined {
  return allSeries.find(s => s.category === categoryId)
}

export function categoryLabel(categoryId: CategoryId): string {
  return categories.find(c => c.id === categoryId)?.label ?? categoryId
}

export function photoSrc(photo: Photo): string {
  return `/${photo.file}`
}
