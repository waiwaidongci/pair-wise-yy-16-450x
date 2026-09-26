import { Link } from 'react-router-dom'
import PhotoButton from '../components/PhotoButton'
import { categories, photosForCategory, seriesForCategory } from '../data/photos'
import { usePortfolio, type FilterValue } from '../state/PortfolioContext'

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: '全部' },
  ...categories.map(c => ({ value: c.id as FilterValue, label: c.label })),
]

export default function WorkPage() {
  const { filter, setFilter, openLightbox } = usePortfolio()
  const photos = photosForCategory(filter)

  // Series shortcuts: all three when unfiltered, only the matching one when a
  // category filter is active — so the grid and the entry points always agree.
  const visibleSeries = categories
    .filter(c => filter === 'all' || c.id === filter)
    .map(c => seriesForCategory(c.id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))

  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow">作品集</p>
        <h1>所有作品</h1>
        <p className="page-lede">从贴近面孔的凝视，到远离人群的高原。</p>
      </header>

      <div className="filters" role="group" aria-label="按分类筛选作品">
        {FILTER_OPTIONS.map(option => (
          <button
            key={option.value}
            type="button"
            className="filter-chip"
            aria-pressed={filter === option.value}
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <p className="photo-count">{photos.length} 张照片</p>

      <div className="series-shortcuts">
        {visibleSeries.map(series => (
          <Link key={series.id} to={`/work/${series.id}`} className="text-link series-shortcut">
            进入《{series.title}》系列 →
          </Link>
        ))}
      </div>

      <div className="photo-grid">
        {photos.map((photo, index) => (
          <PhotoButton
            key={photo.id}
            photo={photo}
            onOpen={() => openLightbox(photos, index)}
          />
        ))}
      </div>
    </div>
  )
}
