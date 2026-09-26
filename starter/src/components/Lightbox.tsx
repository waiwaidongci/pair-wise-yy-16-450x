import { useEffect } from 'react'
import { usePortfolio } from '../context/PortfolioContext'
import { categoryLabel, type Photo } from '../data/photos'

/**
 * 全局唯一灯箱：由 PortfolioContext 驱动，首页 / /work / 系列详情页共用。
 * 上一张 / 下一张只在打开时传入的照片数组内循环（该数组由各页面按当前
 * 上下文决定——筛选后的网格传入筛选子集，系列页传入系列照片）。
 */
export default function Lightbox() {
  const { lightbox, lightboxApi } = usePortfolio()

  useEffect(() => {
    if (!lightbox) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') lightboxApi.close()
      else if (event.key === 'ArrowLeft') lightboxApi.prev()
      else if (event.key === 'ArrowRight') lightboxApi.next()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [lightbox, lightboxApi])

  if (!lightbox) return null

  const { photos: list, index } = lightbox
  const photo: Photo = list[index]
  const total = list.length

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`照片大图：${photo.title}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) lightboxApi.close()
      }}
    >
      <button
        type="button"
        className="lightbox-close"
        aria-label="关闭"
        onClick={() => lightboxApi.close()}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 5l14 14M19 5L5 19" />
        </svg>
      </button>

      <button
        type="button"
        className="lightbox-nav lightbox-prev"
        aria-label="上一张"
        onClick={() => lightboxApi.prev()}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 4l-8 8 8 8" />
        </svg>
      </button>

      <div className="lightbox-stage">
        <div className="lightbox-frame">
          <img
            key={photo.id}
            className="lightbox-image"
            src={`/${photo.file}`}
            alt={photo.altText}
            draggable={false}
          />
        </div>

        {/* 桌面端：信息随图出现在画面下方；移动端：固定为视口底部信息条 */}
        <div className="lightbox-info">
          <p className="eyebrow">
            {categoryLabel(photo.category)} · {index + 1} / {total}
          </p>
          <h2>{photo.title}</h2>
          <p className="caption">{photo.caption}</p>
        </div>
      </div>

      <button
        type="button"
        className="lightbox-nav lightbox-next"
        aria-label="下一张"
        onClick={() => lightboxApi.next()}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 4l8 8-8 8" />
        </svg>
      </button>
    </div>
  )
}
