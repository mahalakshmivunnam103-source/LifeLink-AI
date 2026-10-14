import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Hospital,
  Heart,
  Building2,
  Shield,
  LogIn,
  AlertCircle,
  KeyRound,
  Mail,
  UserCheck,
} from 'lucide-react';

export const Login = ({ setActivePage }) => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('hospital');
  const [email, setEmail] = useState('hospital@citymed.org');
  const [password, setPassword] = useState('Hospital123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: 'hospital', label: 'Hospital Staff', icon: Hospital },
    { id: 'donor', label: 'Blood Donor', icon: Heart },
    { id: 'bloodbank', label: 'Blood Bank', icon: Building2 },
    { id: 'admin', label: 'Administrator', icon: Shield },
  ];

  // Quick fill demo helper
  const handleRoleTabChange = (roleId) => {
    setSelectedRole(roleId);
    setError('');
    switch (roleId) {
      case 'hospital':
        setEmail('hospital@citymed.org');
        setPassword('Hospital123!');
        break;
      case 'donor':
        setEmail('donor.rahul@gmail.com');
        setPassword('Donor123!');
        break;
      case 'bloodbank':
        setEmail('staff@redcross-central.org');
        setPassword('Bank123!');
        break;
      case 'admin':
        setEmail('admin@lifelink.org');
        setPassword('Admin123!');
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password, selectedRole);
      // Route to user's dashboard
      setActivePage(res.user.role);
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3rem 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        <div className="card" style={{ padding: '2rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.35)',
                marginBottom: 10,
              }}
            >
              <LogIn size={22} />
            </div>
            <h2 style={{ fontSize: '1.6rem', color: '#0f1e36', marginBottom: 4 }}>
              LifeLink Portal Access
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#64748b' }}>
              Select your role and authenticate with your secure credentials
            </p>
          </div>

          {/* Role Tabs */}
          <div className="role-tabs">
            {roles.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  type="button"
                  className={`role-tab-btn ${selectedRole === r.id ? 'active' : ''}`}
                  onClick={() => handleRoleTabChange(r.id)}
                >
                  <Icon size={14} />
                  <span>{r.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Fill Notification Banner */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '0.8rem',
              color: '#475569',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>
              Demo Profile Ready: <strong>{email}</strong>
            </span>
            <span
              style={{
                background: '#e0f2fe',
                color: '#0369a1',
                padding: '2px 8px',
                borderRadius: 4,
                fontWeight: 600,
                fontSize: '0.72rem',
              }}
            >
              Pre-filled
            </span>
          </div>

          {error && (
            <div
              style={{
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                color: '#991b1b',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '0.84rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email-input">
                Official Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email-input"
                  type="email"
                  required
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.org"
                />
                <Mail
                  size={16}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: 12, top: 12 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password-input">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password-input"
                  type="password"
                  required
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <KeyRound
                  size={16}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: 12, top: 12 }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '12px' }}
            >
              {loading ? (
                'Verifying Credentials...'
              ) : (
                <>
                  <UserCheck size={18} /> Sign In as {roles.find((r) => r.id === selectedRole)?.label}
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid #f1f5f9',
              fontSize: '0.84rem',
              color: '#64748b',
            }}
          >
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={() => setActivePage('register')}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Register here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
