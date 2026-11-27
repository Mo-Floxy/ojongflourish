import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { AuthProvider } from './lib/auth';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Overview from './pages/dashboard/Overview';
import Chat from './pages/dashboard/Chat';
import ImageStudio from './pages/dashboard/ImageStudio';
import VoiceAssistant from './pages/dashboard/VoiceAssistant';
import Creations from './pages/dashboard/Creations';
import History from './pages/dashboard/History';
import Settings from './pages/dashboard/Settings';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/app" element={<Overview />} />
        <Route path="/app/chat" element={<Chat />} />
        <Route path="/app/images" element={<ImageStudio />} />
        <Route path="/app/voice" element={<VoiceAssistant />} />
        <Route path="/app/creations" element={<Creations />} />
        <Route path="/app/history" element={<History />} />
        <Route path="/app/settings" element={<Settings />} />
      </Route>

      <Route path="/dashboard" element={<Navigate to="/app" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
