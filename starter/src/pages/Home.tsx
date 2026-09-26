import { Link } from 'react-router-dom'
import { seriesCover, seriesList, seriesPhotos } from '../data/photos'
import { usePortfolio } from '../context/PortfolioContext'

export default function Home() {
  const { lightboxApi } = usePortfolio()

  return (
    <>
      <section className="hero">
        <img
          className="hero-image"
          src="/photos/landscape/landscape-05.jpg"
          alt="多雾的森林山谷，色调阴郁厚重"
        />
        <div className="hero-scrim" />
        <div className="hero-content">
          <p className="eyebrow">独立摄影师 · 肖像 / 高原地貌 / 牧场生活</p>
          <h1 className="hero-name">林白</h1>
          <p className="hero-lede">
            她拍镜头前的坦露与防备，也拍高海拔无人区里缓慢变化的光。
            <br />
            三个系列，十四个被留下的瞬间。
          </p>
          <Link to="/work" className="hero-cta">
            浏览全部作品
          </Link>
        </div>
      </section>

      <section className="featured section-wrap">
        <div className="section-heading">
          <h2>精选系列</h2>
          <span className="gold-rule" aria-hidden="true" />
        </div>

        <div className="series-cards">
          {seriesList.map((series) => {
            const cover = seriesCover(series)
            const list = seriesPhotos(series)
            return (
              <div
                key={series.id}
                className="series-card"
                role="button"
                tabIndex={0}
                aria-label={`打开《${series.title}》的照片：${cover.title}`}
                onClick={() => lightboxApi.open(list, 0)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    lightboxApi.open(list, 0)
                  }
                }}
              >
                <span className="ratio-box series-cover-box" style={{ aspectRatio: '3 / 2' }}>
                  <img src={`/${cover.file}`} alt={cover.altText} loading="lazy" />
                </span>
                <span className="series-card-overlay">
                  <span className="series-card-title">《{series.title}》</span>
                  <span className="series-card-summary">{series.summary}</span>
                  <Link
                    to={`/work/${series.id}`}
                    className="series-card-link"
                    // 阻止冒泡到卡片本身的灯箱触发
                    onClick={(e) => e.stopPropagation()}
                  >
                    进入系列
                  </Link>
                </span>
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
