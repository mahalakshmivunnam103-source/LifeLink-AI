import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import DonorDashboard from './pages/donor/DonorDashboard';
import BloodBankDashboard from './pages/bloodbank/BloodBankDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

const AppContent = () => {
  const { user, role, isAuthenticated, loading } = useAuth();
  const [activePage, setActivePage] = useState('home');

  // If user is authenticated and clicks home, preserve ability to view home or role
  useEffect(() => {
    if (isAuthenticated && role) {
      // If user was on login or register, route to their role dashboard
      if (activePage === 'login' || activePage === 'register') {
        setActivePage(role);
      }
    }
  }, [isAuthenticated, role]);

  const renderCurrentPage = () => {
    switch (activePage) {
      case 'home':
        return <Home setActivePage={setActivePage} />;
      case 'login':
        return <Login setActivePage={setActivePage} />;
      case 'register':
        return <Register setActivePage={setActivePage} />;
      case 'hospital':
        return isAuthenticated && (role === 'hospital' || role === 'admin') ? (
          <HospitalDashboard />
        ) : (
          <Login setActivePage={setActivePage} />
        );
      case 'donor':
        return isAuthenticated && (role === 'donor' || role === 'admin') ? (
          <DonorDashboard />
        ) : (
          <Login setActivePage={setActivePage} />
        );
      case 'bloodbank':
        return isAuthenticated && (role === 'bloodbank' || role === 'admin') ? (
          <BloodBankDashboard />
        ) : (
          <Login setActivePage={setActivePage} />
        );
      case 'admin':
        return isAuthenticated && role === 'admin' ? (
          <AdminDashboard />
        ) : (
          <Login setActivePage={setActivePage} />
        );
      default:
        return <Home setActivePage={setActivePage} />;
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b1a30',
          color: '#fff',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: '#dc2626',
              margin: '0 auto 16px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(220, 38, 38, 0.6)',
              animation: 'pulse 1.5s infinite',
            }}
          >
            ♥
          </div>
          <h3 style={{ margin: 0, fontWeight: 700 }}>LifeLink AI</h3>
          <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
            Initializing Smart Blood Network...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <main className="main-content">{renderCurrentPage()}</main>
      <Footer />
    </div>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
