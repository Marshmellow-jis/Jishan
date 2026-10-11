import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './app/AuthContext';
import AppShell from './app/AppShell';
import PublicHome from './pages/PublicHome';
import LoginPage from './pages/LoginPage';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const FieldsPage = lazy(() => import('./pages/FieldsPage'));
const FieldFormPage = lazy(() => import('./pages/FieldFormPage'));
const FieldDetailPage = lazy(() => import('./pages/FieldDetailPage'));
const ScanPage = lazy(() => import('./pages/ScanPage'));
const DiagnosisPage = lazy(() => import('./pages/DiagnosisPage'));
const RiskPage = lazy(() => import('./pages/RiskPage'));
const AdvisoryPage = lazy(() => import('./pages/AdvisoryPage'));
const AlertsPage = lazy(() => import('./pages/AlertsPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ExpertPreviewPage = lazy(() => import('./pages/ExpertPreviewPage'));
const AdminPreviewPage = lazy(() => import('./pages/AdminPreviewPage'));

function RequireSession() {
  const { user, loading } = useAuth();
  if (loading) return <div className="full-screen-state"><span className="spinner" />Checking your session…</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function PageLoader({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="full-screen-state"><span className="spinner" />Loading field workspace…</div>}>{children}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicHome />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireSession />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<PageLoader><DashboardPage /></PageLoader>} />
          <Route path="onboarding" element={<PageLoader><FieldFormPage /></PageLoader>} />
          <Route path="fields" element={<PageLoader><FieldsPage /></PageLoader>} />
          <Route path="fields/:fieldId" element={<PageLoader><FieldDetailPage /></PageLoader>} />
          <Route path="scan" element={<PageLoader><ScanPage /></PageLoader>} />
          <Route path="diagnosis/:diagnosisId" element={<PageLoader><DiagnosisPage /></PageLoader>} />
          <Route path="risk" element={<PageLoader><RiskPage /></PageLoader>} />
          <Route path="advisory" element={<PageLoader><AdvisoryPage /></PageLoader>} />
          <Route path="alerts" element={<PageLoader><AlertsPage /></PageLoader>} />
          <Route path="history" element={<PageLoader><HistoryPage /></PageLoader>} />
          <Route path="expert-preview" element={<PageLoader><ExpertPreviewPage /></PageLoader>} />
          <Route path="admin-preview" element={<PageLoader><AdminPreviewPage /></PageLoader>} />
          <Route path="profile" element={<PageLoader><ProfilePage /></PageLoader>} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
