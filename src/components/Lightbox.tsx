import { useEffect } from 'react'
import { categoryLabel, photoSrc } from '../data/photos'
import { usePortfolio } from '../state/PortfolioContext'

/**
 * The single, globally shared lightbox. Any page hands it a photo list plus a
 * start index via openLightbox(); prev/next wrap within that list only.
 * Desktop: caption area sits under the image; mobile: a bottom info bar.
 */
export default function Lightbox() {
  const { lightbox, closeLightbox, stepLightbox } = usePortfolio()

  useEffect(() => {
    if (!lightbox) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeLightbox()
      if (event.key === 'ArrowLeft') stepLightbox(-1)
      if (event.key === 'ArrowRight') stepLightbox(1)
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [lightbox, closeLightbox, stepLightbox])

  if (!lightbox) return null

  const { photos, index } = lightbox
  const photo = photos[index]

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`照片查看器：${photo.title}`}
      onClick={closeLightbox}
    >
      <button
        type="button"
        className="lightbox-close"
        aria-label="关闭"
        onClick={closeLightbox}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      <button
        type="button"
        className="lightbox-nav lightbox-prev"
        aria-label="上一张"
        onClick={event => {
          event.stopPropagation()
          stepLightbox(-1)
        }}
      >
        <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
          <path d="M14.5 5L7.5 12l7 7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <figure className="lightbox-stage" onClick={event => event.stopPropagation()}>
        <img
          className="lightbox-image"
          src={photoSrc(photo)}
          alt={photo.altText}
          width={photo.width}
          height={photo.height}
        />
        <figcaption className="lightbox-info">
          <div className="lightbox-info-main">
            <p className="eyebrow">
              {categoryLabel(photo.category)} · {index + 1} / {photos.length}
            </p>
            <h2>{photo.title}</h2>
          </div>
          <p className="lightbox-caption">{photo.caption}</p>
        </figcaption>
      </figure>

      <button
        type="button"
        className="lightbox-nav lightbox-next"
        aria-label="下一张"
        onClick={event => {
          event.stopPropagation()
          stepLightbox(1)
        }}
      >
        <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
          <path d="M9.5 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
