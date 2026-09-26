import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="footer-note">
          照片按下快门的瞬间已经完成，余下的只是等待被看见。
        </p>

        <nav className="footer-series" aria-label="页脚导航">
          <Link to="/">首页</Link>
          <Link to="/work">作品</Link>
          <Link to="/about">关于</Link>
          <Link to="/contact">联系</Link>
        </nav>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} 林白摄影 · 独立出版与个人委托</span>
          <Link to="/contact" className="footer-contact">
            写信给我
          </Link>
        </div>
      </div>
    </footer>
  )
}
