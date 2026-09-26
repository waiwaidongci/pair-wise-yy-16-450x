import rawData from './photos.json'

// 单一数据源：所有页面（首页 / /work / 系列详情页 / 灯箱）都从这里派生数据，
// 任何组件都不再另写一份照片列表（task.md 约束 #4）。
export type CategoryId = 'portrait' | 'landscape' | 'pastoral'
export type FilterId = 'all' | CategoryId

export interface Category {
  id: CategoryId
  label: string
}

export interface Series {
  id: string
  title: string
  category: CategoryId
  summary: string
  photoIds: string[]
}

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

interface PhotoData {
  categories: Category[]
  series: Series[]
  photos: Photo[]
}

const data = rawData as PhotoData

export const categories = data.categories
export const seriesList = data.series
export const photos = data.photos

const photoById = new Map(photos.map((p) => [p.id, p]))
const seriesByIdMap = new Map(seriesList.map((s) => [s.id, s]))
const categoryById = new Map(categories.map((c) => [c.id, c]))

export function getPhoto(id: string): Photo {
  const photo = photoById.get(id)
  if (!photo) throw new Error(`未知照片 id：${id}`)
  return photo
}

export function getSeries(id: string): Series | undefined {
  return seriesByIdMap.get(id)
}

export function categoryLabel(id: string): string {
  return categoryById.get(id as CategoryId)?.label ?? id
}

/** /work 网格：按分类过滤；"全部" 时保持 photos.json 的原始顺序。 */
export function photosByFilter(filter: FilterId): Photo[] {
  if (filter === 'all') return photos
  return photos.filter((p) => p.category === filter)
}

/** 系列详情页：按 seriesId 从同一份数据派生，并严格按 order 排序。 */
export function photosBySeries(seriesId: string): Photo[] {
  return photos
    .filter((p) => p.seriesId === seriesId)
    .sort((a, b) => a.order - b.order)
}

export function seriesPhotos(series: Series): Photo[] {
  return series.photoIds.map(getPhoto)
}

/** 系列在 /work 顶部的快捷入口顺序，沿用 photos.json 中 series 的声明顺序。 */
export function seriesForFilter(filter: FilterId): Series[] {
  if (filter === 'all') return seriesList
  return seriesList.filter((s) => s.category === filter)
}

/** 每个系列的精选封面：取 order=1 的第一张。 */
export function seriesCover(series: Series): Photo {
  return getPhoto(series.photoIds[0])
}
