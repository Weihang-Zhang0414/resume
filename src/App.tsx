import { Routes, Route } from 'react-router-dom';
import { PortfolioProvider } from './context/PortfolioContext';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Layout from './components/Layout';
import { AnimatePresence } from 'framer-motion';

function App() {
  return (
    <PortfolioProvider>
      <Layout>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </PortfolioProvider>
  );
}

export default App;
