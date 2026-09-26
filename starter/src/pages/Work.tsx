import { Link } from 'react-router-dom'
import {
  categories,
  photosByFilter,
  seriesForFilter,
  type FilterId,
} from '../data/photos'
import { usePortfolio } from '../context/PortfolioContext'
import PhotoGrid from '../components/PhotoGrid'

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: '全部' },
  ...categories.map((c) => ({ id: c.id as FilterId, label: c.label })),
]

export default function Work() {
  const { filter, setFilter } = usePortfolio()
  const visiblePhotos = photosByFilter(filter)
  const jumpSeries = seriesForFilter(filter)

  return (
    <div className="section-wrap work-page">
      <header className="page-head">
        <p className="eyebrow">Portfolio</p>
        <h1>作品</h1>
        <p className="page-lede">
          十四个瞬间，分别属于《凝视》《无人之境》与《高原牧歌》。按题材筛选，或直接进入某个系列。
        </p>
      </header>

      <div className="filters" role="group" aria-label="按分类筛选照片">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 系列快捷入口：当前筛选只留下对应分类的系列，从这里进入再返回，筛选仍保留 */}
      <nav className="series-jump" aria-label="进入系列">
        <span className="series-jump-label">系列：</span>
        {jumpSeries.map((series) => (
          <Link key={series.id} to={`/work/${series.id}`}>
            《{series.title}》
          </Link>
        ))}
      </nav>

      <p className="result-count" aria-live="polite">
        共 {visiblePhotos.length} 张
      </p>

      <PhotoGrid photos={visiblePhotos} scope={visiblePhotos} />
    </div>
  )
}
