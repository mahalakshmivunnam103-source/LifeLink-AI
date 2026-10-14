import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Heart,
  Activity,
  Hospital,
  Building2,
  Shield,
  User,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';

export const Navbar = ({ activePage, setActivePage }) => {
  const { user, role, isAuthenticated, logout } = useAuth();

  const getRoleBadgeClass = () => {
    switch (role) {
      case 'admin':
        return 'badge-admin';
      case 'hospital':
        return 'badge-hospital';
      case 'bloodbank':
        return 'badge-bloodbank';
      case 'donor':
      default:
        return 'badge-donor';
    }
  };

  return (
    <header className="navbar">
      <div className="container">
        <div className="navbar-inner">
          {/* Brand Logo */}
          <div
            className="brand-logo"
            style={{ cursor: 'pointer' }}
            onClick={() => setActivePage('home')}
          >
            <div className="brand-icon-box">
              <Heart size={24} fill="#fff" color="#fff" />
            </div>
            <div>
              <span className="brand-title">LifeLink AI</span>
              <span className="brand-tag">Smart Network</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="nav-links">
            <button
              className={`nav-btn ${activePage === 'home' ? 'active' : ''}`}
              onClick={() => setActivePage('home')}
            >
              <Activity size={16} /> Home
            </button>

            {/* Role-Specific Portal Links */}
            {isAuthenticated && role === 'hospital' && (
              <button
                className={`nav-btn ${activePage === 'hospital' ? 'active' : ''}`}
                onClick={() => setActivePage('hospital')}
              >
                <Hospital size={16} /> Hospital Console
              </button>
            )}

            {isAuthenticated && role === 'donor' && (
              <button
                className={`nav-btn ${activePage === 'donor' ? 'active' : ''}`}
                onClick={() => setActivePage('donor')}
              >
                <User size={16} /> Donor Dashboard
              </button>
            )}

            {isAuthenticated && role === 'bloodbank' && (
              <button
                className={`nav-btn ${activePage === 'bloodbank' ? 'active' : ''}`}
                onClick={() => setActivePage('bloodbank')}
              >
                <Building2 size={16} /> Blood Bank Inventory
              </button>
            )}

            {isAuthenticated && role === 'admin' && (
              <button
                className={`nav-btn ${activePage === 'admin' ? 'active' : ''}`}
                onClick={() => setActivePage('admin')}
              >
                <Shield size={16} /> Admin Console
              </button>
            )}

            {/* Auth Actions */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="user-pill">
                  <span className={`user-role-badge ${getRoleBadgeClass()}`}>
                    {role}
                  </span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>
                    {user?.name?.split(' ')[0]}
                  </span>
                </div>
                <button
                  className="nav-btn"
                  onClick={() => {
                    logout();
                    setActivePage('login');
                  }}
                  title="Sign out"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  className={`nav-btn ${activePage === 'login' ? 'active' : ''}`}
                  onClick={() => setActivePage('login')}
                >
                  <LogIn size={16} /> Sign In
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setActivePage('register')}
                >
                  <UserPlus size={16} /> Register
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
