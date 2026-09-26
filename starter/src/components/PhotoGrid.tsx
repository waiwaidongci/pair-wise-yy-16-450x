import { useLayoutEffect, useRef, useState } from 'react'
import type { Photo } from '../data/photos'
import PhotoButton from './PhotoButton'

// 必须与 styles.css 中对应的值保持一致
const ROW_HEIGHT = 8
const GAP = 22
const WRAP = 1200
const PAD_DESKTOP = 32
const PAD_MOBILE = 20

function columnsFor(width: number): number {
  return width <= 640 ? 1 : width <= 900 ? 2 : 3
}

/** 不依赖 DOM 测量的首帧估算：保证 JS 首次提交时行跨度已经接近正确。 */
function estimateSpans(photos: Photo[], viewportWidth: number): { cols: number; spans: number[] } {
  const cols = columnsFor(viewportWidth)
  const padding = cols === 1 ? PAD_MOBILE : PAD_DESKTOP
  const wrapWidth = Math.min(viewportWidth, WRAP)
  const innerWidth = Math.max(wrapWidth - padding * 2, 0)
  const colWidth = (innerWidth - GAP * (cols - 1)) / cols
  const spans = photos.map((p) =>
    Math.max(1, Math.ceil((colWidth * (p.height / p.width) + GAP) / (ROW_HEIGHT + GAP))),
  )
  return { cols, spans }
}

/**
 * 行优先的 masonry：grid-auto-rows + 每张照片按自身真实宽高计算的 row span。
 * 三张一行按数据顺序排布（不是 CSS columns 的列优先），高度由 photos.json
 * 的 width/height 决定；图片本身另有 aspect-ratio 占位，加载前后都不抖动。
 */
export default function PhotoGrid({ photos, scope }: { photos: Photo[]; scope: Photo[] }) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [measured, setMeasured] = useState<{ cols: number; spans: number[] }>(() =>
    estimateSpans(photos, typeof window === 'undefined' ? WRAP : window.innerWidth),
  )

  // 用真实容器宽度在绘制前校正首帧估算（ResizeObserver 负责后续视口变化）
  useLayoutEffect(() => {
    const el = gridRef.current
    if (!el) return

    const compute = () => {
      const width = el.clientWidth
      const cols = columnsFor(width)
      const colWidth = (width - GAP * (cols - 1)) / cols
      const spans = photos.map((p) =>
        Math.max(1, Math.ceil((colWidth * (p.height / p.width) + GAP) / (ROW_HEIGHT + GAP))),
      )
      setMeasured((prev) =>
        prev.cols === cols && prev.spans.length === spans.length &&
        prev.spans.every((s, i) => s === spans[i])
          ? prev
          : { cols, spans },
      )
    }

    compute()
    const observer = new ResizeObserver(compute)
    observer.observe(el)
    return () => observer.disconnect()
  }, [photos])

  return (
    <div
      ref={gridRef}
      className="photo-grid"
      data-cols={measured.cols}
    >
      {photos.map((photo, i) => (
        <PhotoButton
          key={photo.id}
          scope={scope}
          photo={photo}
          rowSpan={measured.spans[i]}
        />
      ))}
    </div>
  )
}
