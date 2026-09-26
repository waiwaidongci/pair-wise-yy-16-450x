import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Lightbox from './Lightbox'

export default function Layout() {
  const { pathname } = useLocation()

  // 每次路由切换回到页面顶部，保证叙事长页的阅读起点一致
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="site-shell">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <Lightbox />
    </div>
  )
}
