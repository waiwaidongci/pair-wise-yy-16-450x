import { Link, Navigate, useParams } from 'react-router-dom'
import {
  categoryLabel,
  getSeries,
  photosBySeries,
  seriesList,
} from '../data/photos'
import PhotoButton from '../components/PhotoButton'

export default function Series() {
  const { seriesId } = useParams<{ seriesId: string }>()
  const series = seriesId ? getSeries(seriesId) : undefined

  if (!series) return <Navigate to="/work" replace />

  // 页面内容全部从同一份 photos.json 按 seriesId 派生（顺序来自 order 字段）
  const storyPhotos = photosBySeries(series.id)
  const cover = storyPhotos[0]
  const pullIndex = Math.floor(storyPhotos.length / 2)
  const otherSeries = seriesList.filter((s) => s.id !== series.id)

  return (
    <div className="series-page">
      <section className="series-hero">
        <img
          className="series-hero-image"
          src={`/${cover.file}`}
          alt={cover.altText}
        />
        <div className="series-hero-scrim" />
        <div className="series-hero-content">
          <p className="eyebrow">{categoryLabel(series.category)} · 系列</p>
          <h1>《{series.title}》</h1>
        </div>
      </section>

      <div className="section-wrap story">
        <blockquote className="series-summary">
          {series.summary}
        </blockquote>

        {storyPhotos.map((photo, i) => {
          const isPull = i === pullIndex
          return (
            <article
              key={photo.id}
              className={[
                'story-block',
                i % 2 === 1 ? 'reverse' : '',
                isPull ? 'story-pull' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className="story-figure">
                <PhotoButton scope={storyPhotos} photo={photo} overlay={false} />
              </div>
              <div className="story-text">
                <p className="story-index">No. {String(photo.order).padStart(2, '0')}</p>
                <h2>{photo.title}</h2>
                {isPull ? (
                  <blockquote className="pull-quote">{photo.caption}</blockquote>
                ) : (
                  <p className="story-caption">{photo.caption}</p>
                )}
                <span className="gold-rule" aria-hidden="true" />
              </div>
            </article>
          )
        })}

        <nav className="series-footer-nav" aria-label="系列间导航与返回">
          <Link to="/work" className="back-to-work">
            ← 返回作品
          </Link>
          <div className="other-series">
            {otherSeries.map((s) => (
              <Link key={s.id} to={`/work/${s.id}`}>
                《{s.title}》
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
