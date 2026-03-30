import { useState, useEffect } from 'react';
import './App.css';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/Toast';
import MarketsPage from './pages/MarketsPage';
import PredictionsPage from './pages/PredictionsPage';
import PerformancePage from './pages/PerformancePage';
import AdminPage from './pages/AdminPage';
import NotificationPage from './pages/NotificationPage';

function App() {
  const [currentPage, setCurrentPage] = useState('markets');
  const [adminAuth, setAdminAuth] = useState(() => {
    const saved = localStorage.getItem('adminAuth');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (adminAuth) localStorage.setItem('adminAuth', JSON.stringify(adminAuth));
    else localStorage.removeItem('adminAuth');
  }, [adminAuth]);

  useEffect(() => {
    const onHashAccess = () => {
      if (window.location.hash === '#admin') {
        setCurrentPage('admin');
      }
    };

    const onSecretShortcut = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        setCurrentPage('admin');
      }
    };

    onHashAccess();
    window.addEventListener('hashchange', onHashAccess);
    window.addEventListener('keydown', onSecretShortcut);

    return () => {
      window.removeEventListener('hashchange', onHashAccess);
      window.removeEventListener('keydown', onSecretShortcut);
    };
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'markets':
        return <MarketsPage />;
      case 'predictions':
        return <PredictionsPage showToast={showToast} />;
      case 'performance':
        return <PerformancePage showToast={showToast} />;
      case 'notifications':
        return <NotificationPage showToast={showToast} />;
      case 'admin':
        return adminAuth ? (
          <AdminPage adminAuth={adminAuth} showToast={showToast} />
        ) : (
          <AdminLoginPage setAdminAuth={setAdminAuth} showToast={showToast} setCurrentPage={handleNavigate} />
        );
      default:
        return <MarketsPage />;
    }
  };

  return (
    <ErrorBoundary showToast={showToast}>
      <div className="app">
        <Header onLogout={() => {
          setAdminAuth(null);
          handleNavigate('markets');
        }} isAdmin={!!adminAuth} />
        <Navigation
          currentPage={currentPage}
          onNavigate={handleNavigate}
          isAdmin={!!adminAuth}
        />
        <main className="app-main">
          {renderPage()}
        </main>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </ErrorBoundary>
  );
}

function AdminLoginPage({ setAdminAuth, showToast, setCurrentPage }) {
  const [adminKey, setAdminKey] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBase}/api/admin/debug`, {
        headers: {
          'x-admin-key': adminKey,
          'X-API-Key': apiKey
        }
      });
      if (response.ok) {
        setAdminAuth({ adminKey, apiKey });
        showToast('Admin access granted', 'success');
        setCurrentPage('admin');
      } else {
        showToast('Invalid admin credentials', 'error');
      }
    } catch {
      showToast('Unable to verify admin credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <h2>Admin Access</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter admin secret key (x-admin-key)"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            disabled={loading}
            required
          />
          <input
            type="password"
            placeholder="Enter API key (X-API-Key)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={loading}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>
        <p className="admin-login-hint">Enter both credentials required by backend admin routes</p>
      </div>
    </div>
  );
}

export default App;
