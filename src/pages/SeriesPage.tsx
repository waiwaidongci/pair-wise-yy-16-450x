import { Link, Navigate, useParams } from 'react-router-dom'
import PhotoButton from '../components/PhotoButton'
import { categoryLabel, photoSrc, photosForSeries, seriesById } from '../data/photos'
import { usePortfolio } from '../state/PortfolioContext'

export default function SeriesPage() {
  const { seriesId } = useParams<{ seriesId: string }>()
  const { openLightbox } = usePortfolio()

  const series = seriesId ? seriesById(seriesId) : undefined
  if (!series) return <Navigate to="/work" replace />

  // Photos, order and captions all derive from the shared data model —
  // the same photos.json entries that feed /work (constraint #4).
  const photos = photosForSeries(series.id)
  const hero = photos[0]
  // The series summary doubles as the editorial pull-quote, inserted mid-story.
  const quoteAfter = Math.max(1, Math.floor(photos.length / 2))

  return (
    <div className="series-page">
      <section className="series-hero">
        <div className="series-hero-media">
          <img src={photoSrc(hero)} alt={hero.altText} width={hero.width} height={hero.height} />
        </div>
        <div className="series-hero-overlay">
          <p className="eyebrow">
            {categoryLabel(series.category)} · {photos.length} 幅
          </p>
          <h1>{series.title}</h1>
        </div>
      </section>

      <div className="story">
        {photos.map((photo, index) => (
          <div key={photo.id}>
            <article className={`story-block ${index % 2 === 1 ? 'story-block--flip' : ''}`}>
              <div className="story-media">
                <PhotoButton photo={photo} variant="story" onOpen={() => openLightbox(photos, index)} />
              </div>
              <div className="story-text">
                <p className="story-index">{String(index + 1).padStart(2, '0')}</p>
                <h2>{photo.title}</h2>
                <p className="story-caption">{photo.caption}</p>
              </div>
            </article>
            {index + 1 === quoteAfter && (
              <blockquote className="pull-quote">
                <p>“{series.summary}”</p>
              </blockquote>
            )}
          </div>
        ))}
      </div>

      <div className="series-footer-nav">
        <Link to="/work" className="text-link">
          ← 返回作品集
        </Link>
      </div>
    </div>
  )
}
