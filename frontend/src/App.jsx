import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PaymentsPage from './pages/PaymentsPage';
import EventsPage from './pages/EventsPage';
import ConstitutionPage from './pages/ConstitutionPage';
import MembersPage from './pages/MembersPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import MeetingPage from './pages/MeetingPage';
import PaymentApprovalsPage from './pages/PaymentApprovalsPage';
import ExcoPage from './pages/ExcoPage';
import ContributionsPage from './pages/ContributionsPage';
import BirthdaysPage from './pages/BirthdaysPage';
import MemberGalleryPage from './pages/MemberGalleryPage';
import LoadingScreen from './components/LoadingScreen';

export default function App() {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/constitution" element={<ConstitutionPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/meeting" element={<MeetingPage />} />
          <Route path="/contributions" element={<ContributionsPage />} />
          <Route path="/exco" element={<ExcoPage />} />
          <Route path="/birthdays" element={<BirthdaysPage />} />
          <Route path="/gallery" element={<MemberGalleryPage />} />

          {/* Admin/Exco only */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'exco']} />}>
            <Route path="/members" element={<MembersPage />} />
            <Route path="/payment-approvals" element={<PaymentApprovalsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
