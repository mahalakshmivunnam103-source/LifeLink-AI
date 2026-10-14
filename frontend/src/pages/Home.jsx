import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  Hospital,
  Building2,
  User,
  Shield,
  MapPin,
  Sparkles,
  Lock,
  ArrowRight,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { RBC_COMPATIBILITY } from '../utils/compatibility';

export const Home = ({ setActivePage }) => {
  const { isAuthenticated, role } = useAuth();

  const handlePortalClick = (targetRole) => {
    if (isAuthenticated && role === targetRole) {
      setActivePage(targetRole);
    } else {
      setActivePage('login');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-banner">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 14px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '9999px',
                  color: '#fca5a5',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  marginBottom: '1.25rem',
                }}
              >
                <Sparkles size={16} /> Verified Medical Emergency Network
              </div>

              <h1 className="hero-headline">
                Smart Blood Matching. <span>Saving Critical Lives.</span>
              </h1>

              <p className="hero-subtext">
                LifeLink AI empowers accredited hospitals to rapidly identify potentially eligible
                nearby blood donors through medically validated compatibility rules. When individual
                donors are unavailable, our network seamlessly falls back to verified blood bank
                reserves.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => setActivePage(isAuthenticated ? role : 'login')}
                  style={{ padding: '12px 24px', fontSize: '1rem' }}
                >
                  <Heart size={18} /> Access Platform
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setActivePage('register')}
                  style={{
                    padding: '12px 24px',
                    fontSize: '1rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                  }}
                >
                  Join as Donor or Facility <ArrowRight size={16} />
                </button>
              </div>

              {/* Metrics */}
              <div className="hero-metrics">
                <div className="metric-card">
                  <div className="metric-value">100%</div>
                  <div className="metric-label">Verified Facilities</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">90d / 120d</div>
                  <div className="metric-label">Screening Intervals</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">Privacy First</div>
                  <div className="metric-label">Masked Donor Details</div>
                </div>
              </div>
            </div>

            {/* Right Card: Live Emergency Request Demonstration */}
            <div>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.07)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  boxShadow: '0 20px 30px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.25rem',
                  }}
                >
                  <span
                    style={{
                      background: 'rgba(220, 38, 38, 0.3)',
                      color: '#fca5a5',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      border: '1px solid rgba(220, 38, 38, 0.5)',
                    }}
                  >
                    ● LIVE MATCHING SIMULATION
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Search Radius: 25 km</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.25rem' }}>
                  <div className="blood-group-badge">O-</div>
                  <div>
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '1.05rem' }}>
                      City General Hospital & Trauma Centre
                    </h4>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.82rem' }}>
                      Critical Requirement: 2 Units O- RBC
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    color: '#cbd5e1',
                    marginBottom: '1.25rem',
                    lineHeight: 1.6,
                  }}
                >
                  <div>✓ <strong>RBC Transfusion Rule:</strong> O- (Universal RBC Donor)</div>
                  <div>✓ <strong>Matched Nearby Donor:</strong> Rahul Sharma (~1.9 km, 115d eligible)</div>
                  <div>✓ <strong>Fallback Reserve:</strong> Red Cross Regional Blood Center (5 Units available)</div>
                </div>

                <button
                  onClick={() => handlePortalClick('hospital')}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  Enter Hospital Matching Console
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 User Role Gateways */}
      <section style={{ padding: '4rem 0 2rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', color: '#0f1e36', marginBottom: 8 }}>
              Four Specialized Medical Portals
            </h2>
            <p style={{ color: '#64748b', maxWidth: 640, margin: '0 auto', fontSize: '0.98rem' }}>
              Engineered specifically for certified hospital staff, voluntary blood donors, blood bank
              inventory managers, and system administrators.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Hospital Card */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  background: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Hospital size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 8, color: '#0f1e36' }}>
                Hospital Staff
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1.25rem', flex: 1 }}>
                Publish urgent blood requests, configure search radius, visualize nearby donors on
                OpenStreetMap, send instant alerts, and contact blood banks if donors are unavailable.
              </p>
              <button
                onClick={() => handlePortalClick('hospital')}
                className="btn btn-outline"
                style={{ width: '100%', justifyContent: 'space-between' }}
              >
                <span>Hospital Portal</span> <ArrowRight size={16} />
              </button>
            </div>

            {/* Blood Donor Card */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  background: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Heart size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 8, color: '#0f1e36' }}>
                Blood Donors
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1.25rem', flex: 1 }}>
                Manage availability toggle, control consent for contact sharing, track next eligible
                donation date countdown (90/120 days), and accept or decline incoming requests.
              </p>
              <button
                onClick={() => handlePortalClick('donor')}
                className="btn btn-outline"
                style={{ width: '100%', justifyContent: 'space-between' }}
              >
                <span>Donor Dashboard</span> <ArrowRight size={16} />
              </button>
            </div>

            {/* Blood Bank Card */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  background: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Building2 size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 8, color: '#0f1e36' }}>
                Blood Bank Staff
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1.25rem', flex: 1 }}>
                Update live unit inventory across all 8 blood groups and components, log timestamps,
                and review and confirm hospital reservation inquiries.
              </p>
              <button
                onClick={() => handlePortalClick('bloodbank')}
                className="btn btn-outline"
                style={{ width: '100%', justifyContent: 'space-between' }}
              >
                <span>Inventory Manager</span> <ArrowRight size={16} />
              </button>
            </div>

            {/* Admin Card */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  background: '#ede9fe',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Shield size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 8, color: '#0f1e36' }}>
                Platform Admin
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1.25rem', flex: 1 }}>
                Verify hospital and blood bank medical licenses, inspect flagged duplicate or
                suspicious requests, manage platform users, and review activity audit trails.
              </p>
              <button
                onClick={() => handlePortalClick('admin')}
                className="btn btn-outline"
                style={{ width: '100%', justifyContent: 'space-between' }}
              >
                <span>Admin Console</span> <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Medical Compatibility Matrix Reference */}
      <section style={{ padding: '2rem 0 4rem 0' }}>
        <div className="container">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Activity size={20} color="#dc2626" /> Medical RBC Transfusion Compatibility Rules
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Approved Standard Transfusion Guidance
              </span>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '1.25rem' }}>
              LifeLink AI matches donor blood groups strictly according to red-blood-cell compatibility.
              Cross-matching and phlebotomy eligibility are confirmed prior to transfusion.
            </p>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Recipient Blood Group</th>
                    <th>Compatible Donor Groups (Can Receive From)</th>
                    <th>Clinical Type</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(RBC_COMPATIBILITY).map(([recipient, donors]) => (
                    <tr key={recipient}>
                      <td>
                        <span
                          className="blood-group-pill"
                          style={{
                            background: recipient === 'O-' ? '#fee2e2' : '#f8fafc',
                            color: recipient === 'O-' ? '#991b1b' : '#0f172a',
                            fontWeight: 700,
                          }}
                        >
                          {recipient}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {donors.map((d) => (
                            <span
                              key={d}
                              style={{
                                padding: '2px 8px',
                                background: d === 'O-' ? '#fee2e2' : '#f1f5f9',
                                color: d === 'O-' ? '#991b1b' : '#334155',
                                borderRadius: 4,
                                fontSize: '0.8rem',
                                fontWeight: 600,
                              }}
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {recipient === 'O-'
                          ? 'Universal RBC Donor'
                          : recipient === 'AB+'
                          ? 'Universal RBC Recipient'
                          : 'Compatible Standard'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
