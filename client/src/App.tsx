import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { VipZone } from './pages/VipZone';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Todas las rutas dentro de Layout heredarán el Navbar */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="vip" element={<VipZone />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;