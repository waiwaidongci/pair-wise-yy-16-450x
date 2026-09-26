import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PortfolioProvider } from './context/PortfolioContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Work from './pages/Work'
import Series from './pages/Series'
import About from './pages/About'
import Contact from './pages/Contact'

export default function App() {
  return (
    <PortfolioProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/work" element={<Work />} />
            <Route path="/work/:seriesId" element={<Series />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PortfolioProvider>
  )
}
