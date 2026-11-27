import AppRoutes from './routes/AppRoutes.jsx';
import ScrollManager from './components/common/ScrollManager.jsx';

export default function App() {
  return (
    <>
      <ScrollManager />
      <AppRoutes />
    </>
  );
}
