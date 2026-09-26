import type { Photo } from '../data/photos'
import { categoryLabel } from '../data/photos'
import { usePortfolio } from '../context/PortfolioContext'

interface PhotoButtonProps {
  /** 当前浏览上下文内的照片集合——灯箱只在这个集合里翻页。 */
  scope: Photo[]
  photo: Photo
  /** 桌面网格是否在图上覆盖标题浮层（移动端一律落到图下方）。 */
  overlay?: boolean
  /** masonry 网格分配的 grid-row 跨度。 */
  rowSpan?: number
  className?: string
}

/**
 * 所有照片缩略图的唯一入口：点击后打开全局灯箱。
 * ratio-box 直接使用 photos.json 的真实宽高，图片未加载时也已撑开正确比例（防 CLS）。
 */
export default function PhotoButton({
  scope,
  photo,
  overlay = true,
  rowSpan,
  className = '',
}: PhotoButtonProps) {
  const { lightboxApi } = usePortfolio()
  const indexInScope = scope.findIndex((p) => p.id === photo.id)

  return (
    <button
      type="button"
      className={`photo-button${overlay ? '' : ' no-overlay'}${className ? ` ${className}` : ''}`}
      style={rowSpan ? { gridRow: `span ${rowSpan}` } : undefined}
      onClick={() => lightboxApi.open(scope, indexInScope)}
      aria-label={`查看照片：${photo.title}`}
    >
      <span
        className="ratio-box"
        style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
      >
        <img src={`/${photo.file}`} alt={photo.altText} loading="lazy" />
      </span>
      <span className="photo-meta">
        <strong>{photo.title}</strong>
        <span className="photo-category">{categoryLabel(photo.category)}</span>
      </span>
    </button>
  )
}
