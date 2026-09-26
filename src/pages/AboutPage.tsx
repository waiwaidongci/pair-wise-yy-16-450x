import { Link } from 'react-router-dom'
import { photoSrc, photosForSeries } from '../data/photos'

const TIMELINE = [
  { year: '2016', text: '开始长期拍摄黑白人像，把镜头对准镜头前的坦露与防备。' },
  { year: '2018', text: '第一次进入高原无人区，开始《无人之境》的四季记录。' },
  { year: '2021', text: '跟随牧民转场生活数月，《高原牧歌》由此成形。' },
  { year: '2024', text: '三个系列并行推进，在肖像与旷野之间持续往返。' },
]

export default function AboutPage() {
  // Portrait from the shared dataset — no fabricated imagery.
  const portrait = photosForSeries('gaze')[0]

  return (
    <div className="page about-page">
      <div className="about-media">
        <span className="ratio-box" style={{ aspectRatio: `${portrait.width} / ${portrait.height}` }}>
          <img
            src={photoSrc(portrait)}
            alt={portrait.altText}
            width={portrait.width}
            height={portrait.height}
          />
        </span>
      </div>

      <div className="about-body">
        <p className="eyebrow">关于</p>
        <h1>镜头前后的人</h1>
        <div className="about-bio">
          <p>
            一名独立摄影师，长期在两条线索上工作：一条贴近面孔，用黑白特写记录眼神与皮肤上的情绪；
            另一条走向高原，记录无人区的地貌、光线，以及牧场生活的日常节奏。
          </p>
          <p>
            三个正在进行的系列——《凝视》《无人之境》《高原牧歌》——共享同一种观看方式：
            不打扰，等光线自己说话。
          </p>
        </div>

        <ol className="timeline">
          {TIMELINE.map(item => (
            <li key={item.year}>
              <span className="timeline-year">{item.year}</span>
              <span className="timeline-text">{item.text}</span>
            </li>
          ))}
        </ol>

        <Link to="/contact" className="text-link">
          来信聊聊拍摄计划 →
        </Link>
      </div>
    </div>
  )
}
