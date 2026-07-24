import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import ClubsPage from './pages/ClubsPage';
import ClubDetailPage from './pages/ClubDetailPage';
import HackathonsPage from './pages/HackathonsPage';
import WorkshopsPage from './pages/WorkshopsPage';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import ClubAdminDashboard from './pages/dashboards/ClubAdminDashboard';
import FacultyDashboard from './pages/dashboards/FacultyDashboard';
import SuperAdminDashboard from './pages/dashboards/SuperAdminDashboard';
import NotificationsPage from './pages/NotificationsPage';
import PrivacyPage from './pages/PrivacyPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-dark">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={getDashboard(user.role)} /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to={getDashboard(user.role)} /> : <RegisterPage />} />
      <Route path="/forgot-password" element={user ? <Navigate to={getDashboard(user.role)} /> : <ForgotPasswordPage />} />
      <Route path="/admin" element={user?.role === 'super_admin' ? <Navigate to="/admin/dashboard" /> : <AdminLoginPage />} />
      <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
      <Route path="/events/:id" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />
      <Route path="/clubs" element={<ProtectedRoute><ClubsPage /></ProtectedRoute>} />
      <Route path="/clubs/:id" element={<ProtectedRoute><ClubDetailPage /></ProtectedRoute>} />
      <Route path="/hackathons" element={<ProtectedRoute><HackathonsPage /></ProtectedRoute>} />
      <Route path="/workshops" element={<ProtectedRoute><WorkshopsPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/student/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/club/dashboard" element={<ProtectedRoute roles={['club_admin']}><ClubAdminDashboard /></ProtectedRoute>} />
      <Route path="/faculty/dashboard" element={<ProtectedRoute roles={['faculty']}><FacultyDashboard /></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['super_admin']}><SuperAdminDashboard /></ProtectedRoute>} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const getDashboard = (role) => {
  const map = {
    student: '/student/dashboard',
    club_admin: '/club/dashboard',
    faculty: '/faculty/dashboard',
    super_admin: '/admin/dashboard',
  };
  return map[role] || '/';
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1A2E',
              color: '#fff',
              border: '1px solid rgba(108,99,255,0.3)',
              borderRadius: '12px',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
