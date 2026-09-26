import { categoryLabel, photoSrc, type Photo } from '../data/photos'

interface PhotoButtonProps {
  photo: Photo
  onOpen: () => void
  /** 'grid' shows meta as a hover overlay on desktop / below the image on mobile.
   *  'story' always renders meta under the image (series narrative layout). */
  variant?: 'grid' | 'story'
}

/**
 * A photo with its aspect ratio reserved up-front (constraint #3): the wrapper
 * gets `aspect-ratio: width / height` from photos.json before the JPEG loads,
 * so the layout never shifts when the image arrives.
 */
export default function PhotoButton({ photo, onOpen, variant = 'grid' }: PhotoButtonProps) {
  return (
    <button
      type="button"
      className={`photo-button photo-button--${variant}`}
      onClick={onOpen}
      aria-label={`查看照片：${photo.title}`}
    >
      <span className="ratio-box" style={{ aspectRatio: `${photo.width} / ${photo.height}` }}>
        <img
          src={photoSrc(photo)}
          alt={photo.altText}
          width={photo.width}
          height={photo.height}
          loading="lazy"
        />
        {variant === 'grid' && (
          <span className="photo-hover" aria-hidden="true">
            <span className="photo-view">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.4" />
              </svg>
              查看
            </span>
          </span>
        )}
      </span>
      <span className="photo-meta">
        <strong>{photo.title}</strong>
        <span className="photo-category">{categoryLabel(photo.category)}</span>
      </span>
    </button>
  )
}
