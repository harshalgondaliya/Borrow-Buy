import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { ToastProvider } from './features/toast/ToastContext';
import { ModalProvider } from './features/modal/ModalContext';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { BookingsPage } from './pages/BookingsPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { CloudOperationsPage } from './pages/CloudOperationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';
import { LoginPage } from './pages/LoginPage';
import { BecomeOwnerPage } from './pages/BecomeOwnerPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ModalProvider>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<HomePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="browse" element={<BrowsePage />} />
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="owner" element={<DashboardPage />} />
                <Route path="become-owner" element={<BecomeOwnerPage />} />
                <Route path="admin" element={<AdminPage />} />
                <Route path="cloud" element={<CloudOperationsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="help" element={<HelpPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </ModalProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
