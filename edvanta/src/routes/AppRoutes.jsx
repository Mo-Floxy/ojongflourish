import { Route, Routes } from 'react-router-dom';

import Home from '../pages/Home.jsx';
import NotFound from '../pages/NotFound.jsx';
import ComingSoon from '../pages/ComingSoon.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/course/:slug" element={<ComingSoon />} />
      <Route path="/coming-soon/:feature" element={<ComingSoon />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
