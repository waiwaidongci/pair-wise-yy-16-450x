import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Lightbox from './components/Lightbox'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import WorkPage from './pages/WorkPage'
import SeriesPage from './pages/SeriesPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import { PortfolioProvider } from './state/PortfolioContext'

export default function App() {
  return (
    <PortfolioProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/work" element={<WorkPage />} />
            <Route path="/work/:seriesId" element={<SeriesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<HomePage />} />
          </Route>
        </Routes>
        {/* One shared lightbox instance for every page. */}
        <Lightbox />
      </BrowserRouter>
    </PortfolioProvider>
  )
}
