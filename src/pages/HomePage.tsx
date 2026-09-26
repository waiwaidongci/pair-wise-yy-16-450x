import { Link } from 'react-router-dom'
import { allSeries, categoryLabel, photoSrc, photosForSeries } from '../data/photos'
import { usePortfolio } from '../state/PortfolioContext'

export default function HomePage() {
  const { openLightbox } = usePortfolio()

  // Hero uses a real photo from the dataset (first pastoral frame).
  const heroPhoto = photosForSeries('highland-pastoral')[0]

  return (
    <>
      <section className="hero">
        <div className="hero-media">
          <img src={photoSrc(heroPhoto)} alt={heroPhoto.altText} width={heroPhoto.width} height={heroPhoto.height} />
        </div>
        <div className="hero-overlay">
          <p className="eyebrow">独立摄影 · 高原与面孔</p>
          <h1>在凝视与旷野之间</h1>
          <p className="hero-lede">
            记录黑白人像的细微情绪，以及高原地区自然与牧场生活的辽阔节奏。
          </p>
          <Link to="/work" className="text-link">
            浏览全部作品 →
          </Link>
        </div>
      </section>

      <section className="featured">
        <div className="section-heading">
          <p className="eyebrow">精选作品</p>
          <h2>三个系列</h2>
        </div>
        <div className="series-grid">
          {allSeries.map(series => {
            const photos = photosForSeries(series.id)
            const cover = photos[0]
            return (
              <article className="series-card" key={series.id}>
                <button
                  type="button"
                  className="series-card-media"
                  onClick={() => openLightbox(photos, 0)}
                  aria-label={`查看《${series.title}》系列照片`}
                >
                  <span className="ratio-box">
                    <img
                      src={photoSrc(cover)}
                      alt={cover.altText}
                      width={cover.width}
                      height={cover.height}
                      loading="lazy"
                    />
                  </span>
                  <span className="series-card-overlay">
                    <span className="series-card-count">{photos.length} 幅作品</span>
                  </span>
                </button>
                <div className="series-card-body">
                  <p className="eyebrow">{categoryLabel(series.category)}</p>
                  <h3>{series.title}</h3>
                  <p className="series-card-summary">{series.summary}</p>
                  <Link to={`/work/${series.id}`} className="text-link">
                    进入《{series.title}》系列 →
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </>
  )
}
