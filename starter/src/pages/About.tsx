import { Link } from 'react-router-dom'
import { seriesList } from '../data/photos'

// 关于页文案：仅围绕 mock-data 里真实存在的三个系列展开，不虚构作品或奖项。
const TIMELINE = [
  {
    year: '2017',
    text: '开始拍摄《凝视》——在借来的小房间里，用一盏窗光记录人在镜头前的坦露与防备。',
  },
  {
    year: '2019',
    text: '第一次进入高海拔无人区，《无人之境》的第一张雾谷就此诞生，之后连续数年重返同一片山脊。',
  },
  {
    year: '2021',
    text: '跟随牧人的转场路线走完一整个夏天，《高原牧歌》从旅途中的随手记录变成长期项目。',
  },
  {
    year: '至今',
    text: '继续在肖像与旷野之间往返，接受限量纸本出版与少量个人委托拍摄。',
  },
]

export default function About() {
  return (
    <div className="section-wrap about-page">
      <div className="about-grid">
        <div className="about-portrait">
          <span className="ratio-box" style={{ aspectRatio: '3 / 4' }}>
            <img
              src="/photos/portrait/portrait-01.jpg"
              alt="黑白半脸特写，女性侧脸，眼部与嘴唇局部特写"
            />
          </span>
        </div>

        <div className="about-bio">
          <p className="eyebrow">About</p>
          <h1>关于林白</h1>
          <p>
            林白是一名独立摄影师，长期在两类题材之间往返：黑白人像的极近特写，
            以及高原地区的自然风光与牧场生活。她相信照片的力量来自克制——
            光线只落在该落下的地方，其余留给阴影。
          </p>
          <p>
            她的作品汇为三个系列：《凝视》里是眼神、皮肤纹理与停顿的呼吸；
            《无人之境》记录高海拔无人区在四季光线下变化的山脊、草甸与雾气；
            《高原牧歌》则跟随牧人的日常节奏，写牧场、牛群与人之间安静的共生。
          </p>

          <ol className="timeline">
            {TIMELINE.map((item) => (
              <li key={item.year}>
                <span className="timeline-dot" aria-hidden="true" />
                <span className="timeline-year">{item.year}</span>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <section className="browse-guide">
        <div className="section-heading">
          <h2>如何浏览这些作品</h2>
          <span className="gold-rule" aria-hidden="true" />
        </div>
        <div className="guide-steps">
          <div className="guide-step">
            <span className="guide-no">01</span>
            <h3>进入作品页</h3>
            <p>
              在<Link to="/work">作品页</Link>按「肖像 / 风光 / 牧野」筛选，
              或一次看完全部十四张照片；点击任意照片即可打开灯箱细读。
            </p>
          </div>
          <div className="guide-step">
            <span className="guide-no">02</span>
            <h3>按系列阅读</h3>
            <p>每个系列都有真实的叙事顺序：
              {seriesList.map((s, i) => (
                <Link key={s.id} to={`/work/${s.id}`}>
                  《{s.title}》{i < seriesList.length - 1 ? '、' : ''}
                </Link>
              ))}
              在长页中逐张阅读图文与引言。
            </p>
          </div>
          <div className="guide-step">
            <span className="guide-no">03</span>
            <h3>在灯箱内翻看</h3>
            <p>灯箱支持左右切换（也可用键盘方向键，Esc 关闭），翻页始终停留在你当前浏览的分类或系列之内。</p>
          </div>
          <div className="guide-step">
            <span className="guide-no">04</span>
            <h3>来信联系</h3>
            <p>看完之后若有意委托、出版或展出合作，可前往<Link to="/contact">联系页</Link>写信，通常会在一周内收到回复。</p>
          </div>
        </div>
      </section>
    </div>
  )
}
