import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDateTime, formatDate } from '../../utils/formatters';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Hospital,
  Building2,
  Users,
  Activity,
  FileCheck,
  Search,
  Check,
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();

  const [overview, setOverview] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState({ hospitals: [], bloodBanks: [] });
  const [suspiciousRequests, setSuspiciousRequests] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('verifications'); // 'verifications' | 'suspicious' | 'users' | 'audit'

  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [rejectionReasons, setRejectionReasons] = useState({});

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [overRes, pendRes, suspRes, usersRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/pending-verifications'),
        api.get('/admin/suspicious-requests'),
        api.get('/admin/users'),
      ]);

      if (overRes.success) setOverview(overRes);
      if (pendRes.success) setPendingVerifications(pendRes.data);
      if (suspRes.success) setSuspiciousRequests(suspRes.data);
      if (usersRes.success) setUsersList(usersRes.data);
    } catch (err) {
      console.error('Admin data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerifyFacility = async (userId, decision) => {
    const reason = rejectionReasons[userId] || '';
    try {
      const res = await api.post('/admin/verify-facility', {
        userId,
        decision,
        reason,
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Medical facility registration marked as ${decision.toUpperCase()}.`,
        });
        loadAdminData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleResolveSuspicion = async (requestId, action) => {
    try {
      const res = await api.patch(`/admin/resolve-suspicion/${requestId}`, {
        action,
      });
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Suspicious request resolved (${action}).`,
        });
        loadAdminData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center', color: '#64748b' }}>
        Loading administrative console...
      </div>
    );
  }

  const stats = overview?.stats || {};
  const totalPending =
    (pendingVerifications.hospitals?.length || 0) +
    (pendingVerifications.bloodBanks?.length || 0);

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        {feedback.message && (
          <div
            style={{
              background: feedback.type === 'error' ? '#fee2e2' : '#dcfce7',
              border: `1px solid ${feedback.type === 'error' ? '#fca5a5' : '#86efac'}`,
              color: feedback.type === 'error' ? '#991b1b' : '#166534',
              padding: '12px 18px',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.88rem',
            }}
          >
            {feedback.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
            <div>{feedback.message}</div>
          </div>
        )}

        {/* Top Header Card */}
        <div
          className="card"
          style={{
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#ede9fe',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Shield size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.45rem', color: '#0f1e36', margin: 0 }}>
                Platform Administration Console
              </h2>
              <div style={{ fontSize: '0.84rem', color: '#64748b' }}>
                Signed in as: <strong>{user?.name}</strong> (Master Verification Authority)
              </div>
            </div>
          </div>

          <span
            className="badge"
            style={{ background: '#ede9fe', color: '#6b21a8', padding: '6px 14px', fontSize: '0.84rem' }}
          >
            System Status: Healthy & Monitored
          </span>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 14,
            marginBottom: '1.5rem',
          }}
        >
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Pending Facility Approvals</div>
            <div
              style={{
                fontSize: '1.8rem',
                fontWeight: 800,
                color: totalPending > 0 ? '#d97706' : '#166534',
              }}
            >
              {totalPending}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Awaiting license verification</div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Suspicious Requests</div>
            <div
              style={{
                fontSize: '1.8rem',
                fontWeight: 800,
                color: suspiciousRequests.length > 0 ? '#dc2626' : '#166534',
              }}
            >
              {suspiciousRequests.length}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Exceeding volume or anomaly threshold</div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Donors</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#dc2626' }}>
              {stats.totalDonors || 0}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Active in network</div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Registered Facilities</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0284c7' }}>
              {(stats.totalHospitals || 0) + (stats.totalBloodBanks || 0)}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Hospitals & Blood Banks</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '2px solid #e2e8f0',
            marginBottom: '1.5rem',
            gap: 20,
          }}
        >
          <button
            onClick={() => setActiveTab('verifications')}
            style={{
              padding: '10px 4px',
              fontSize: '0.95rem',
              fontWeight: 600,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'verifications' ? '#dc2626' : '#64748b',
              borderBottom: activeTab === 'verifications' ? '3px solid #dc2626' : '3px solid transparent',
              marginBottom: -2,
            }}
          >
            Pending Verifications ({totalPending})
          </button>

          <button
            onClick={() => setActiveTab('suspicious')}
            style={{
              padding: '10px 4px',
              fontSize: '0.95rem',
              fontWeight: 600,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'suspicious' ? '#dc2626' : '#64748b',
              borderBottom: activeTab === 'suspicious' ? '3px solid #dc2626' : '3px solid transparent',
              marginBottom: -2,
            }}
          >
            Suspicious Requests ({suspiciousRequests.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '10px 4px',
              fontSize: '0.95rem',
              fontWeight: 600,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'users' ? '#dc2626' : '#64748b',
              borderBottom: activeTab === 'users' ? '3px solid #dc2626' : '3px solid transparent',
              marginBottom: -2,
            }}
          >
            Platform Accounts ({usersList.length})
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            style={{
              padding: '10px 4px',
              fontSize: '0.95rem',
              fontWeight: 600,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'audit' ? '#dc2626' : '#64748b',
              borderBottom: activeTab === 'audit' ? '3px solid #dc2626' : '3px solid transparent',
              marginBottom: -2,
            }}
          >
            System Audit Trail
          </button>
        </div>

        {/* ================= TAB 1: FACILITY VERIFICATIONS ================= */}
        {activeTab === 'verifications' && (
          <div>
            {totalPending === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                <CheckCircle size={36} color="#10b981" style={{ margin: '0 auto 12px auto' }} />
                <h4 style={{ color: '#0f172a', marginBottom: 4 }}>All Facilities Verified</h4>
                <p style={{ fontSize: '0.86rem' }}>
                  There are no hospital or blood bank registrations currently awaiting review.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Pending Hospitals */}
                {pendingVerifications.hospitals?.map((hosp) => (
                  <div key={hosp._id} className="card">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 10,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Hospital size={22} color="#0284c7" />
                        <div>
                          <h4 style={{ margin: 0, color: '#0f1e36', fontSize: '1.1rem' }}>
                            {hosp.hospitalName}
                          </h4>
                          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                            Contact: {hosp.contactPerson} ({hosp.userId?.email})
                          </span>
                        </div>
                      </div>
                      <StatusBadge status="Pending" />
                    </div>

                    <div
                      style={{
                        background: '#f8fafc',
                        padding: '12px',
                        borderRadius: '6px',
                        fontSize: '0.84rem',
                        color: '#475569',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 10,
                        marginBottom: 12,
                      }}
                    >
                      <div>
                        Medical License #: <strong>{hosp.licenseNumber}</strong>
                      </div>
                      <div>
                        Emergency Line: <strong>{hosp.emergencyContact}</strong>
                      </div>
                      <div>
                        Location: <strong>{hosp.address}, {hosp.city}</strong>
                      </div>
                      <div>
                        Submitted At: <strong>{formatDateTime(hosp.createdAt)}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Rejection reason (if declining)..."
                        className="form-input"
                        style={{ maxWidth: 280, padding: '6px 12px', fontSize: '0.82rem' }}
                        value={rejectionReasons[hosp.userId?._id] || ''}
                        onChange={(e) =>
                          setRejectionReasons({
                            ...rejectionReasons,
                            [hosp.userId?._id]: e.target.value,
                          })
                        }
                      />
                      <button
                        onClick={() => handleVerifyFacility(hosp.userId?._id, 'rejected')}
                        className="btn btn-outline-red btn-sm"
                      >
                        <XCircle size={14} /> Reject Registration
                      </button>
                      <button
                        onClick={() => handleVerifyFacility(hosp.userId?._id, 'verified')}
                        className="btn btn-primary btn-sm"
                      >
                        <CheckCircle size={14} /> Verify & Approve License
                      </button>
                    </div>
                  </div>
                ))}

                {/* Pending Blood Banks */}
                {pendingVerifications.bloodBanks?.map((bank) => (
                  <div key={bank._id} className="card">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 10,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Building2 size={22} color="#16a34a" />
                        <div>
                          <h4 style={{ margin: 0, color: '#0f1e36', fontSize: '1.1rem' }}>
                            {bank.bloodBankName}
                          </h4>
                          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                            Official Email: {bank.contactEmail || bank.userId?.email}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status="Pending" />
                    </div>

                    <div
                      style={{
                        background: '#f8fafc',
                        padding: '12px',
                        borderRadius: '6px',
                        fontSize: '0.84rem',
                        color: '#475569',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 10,
                        marginBottom: 12,
                      }}
                    >
                      <div>
                        Blood Bank License #: <strong>{bank.licenseNumber}</strong>
                      </div>
                      <div>
                        Operating Phone: <strong>{bank.contactPhone}</strong>
                      </div>
                      <div>
                        Operating Hours: <strong>{bank.operatingHours}</strong>
                      </div>
                      <div>
                        Location: <strong>{bank.address}, {bank.city}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Rejection reason..."
                        className="form-input"
                        style={{ maxWidth: 280, padding: '6px 12px', fontSize: '0.82rem' }}
                        value={rejectionReasons[bank.userId?._id] || ''}
                        onChange={(e) =>
                          setRejectionReasons({
                            ...rejectionReasons,
                            [bank.userId?._id]: e.target.value,
                          })
                        }
                      />
                      <button
                        onClick={() => handleVerifyFacility(bank.userId?._id, 'rejected')}
                        className="btn btn-outline-red btn-sm"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                      <button
                        onClick={() => handleVerifyFacility(bank.userId?._id, 'verified')}
                        className="btn btn-primary btn-sm"
                      >
                        <CheckCircle size={14} /> Verify & Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: SUSPICIOUS REQUESTS ================= */}
        {activeTab === 'suspicious' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <AlertTriangle size={18} color="#dc2626" />
                Suspicious or Duplicate Requests Review Queue
              </h3>
            </div>

            {suspiciousRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                No suspicious blood requests detected by automated security filters.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {suspiciousRequests.map((req) => (
                  <div
                    key={req._id}
                    style={{
                      border: '1px solid #fca5a5',
                      borderRadius: '8px',
                      padding: '16px',
                      background: '#fff5f5',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 6,
                      }}
                    >
                      <div>
                        <strong style={{ color: '#991b1b', fontSize: '1.05rem' }}>
                          Flagged Request #{req._id} — {req.hospitalName}
                        </strong>
                        <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                          Created: {formatDateTime(req.createdAt)}
                        </div>
                      </div>
                      <StatusBadge status="Critical" type="urgency" />
                    </div>

                    <div
                      style={{
                        background: '#fee2e2',
                        border: '1px solid #f87171',
                        borderRadius: '6px',
                        padding: '10px 14px',
                        fontSize: '0.84rem',
                        color: '#7f1d1d',
                        margin: '10px 0',
                      }}
                    >
                      <strong>Suspicion Reason: </strong>
                      {req.suspicionReason || 'Excess units (>30u) requested in a single broadcast.'}
                    </div>

                    <div style={{ fontSize: '0.84rem', color: '#475569', marginBottom: 12 }}>
                      Blood Group: <strong>{req.bloodGroup}</strong> • Units: <strong>{req.unitsRequired}</strong> • Urgency: <strong>{req.urgency}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                      <button
                        onClick={() => handleResolveSuspicion(req._id, 'cancel')}
                        className="btn btn-outline-red btn-sm"
                      >
                        <XCircle size={14} /> Terminate Request
                      </button>
                      <button
                        onClick={() => handleResolveSuspicion(req._id, 'clear')}
                        className="btn btn-navy btn-sm"
                      >
                        <Check size={14} /> Clear Flag (Verified Authentic)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: PLATFORM USERS ================= */}
        {activeTab === 'users' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Platform User Accounts ({usersList.length})</h3>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Account Holder</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Registered On</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <strong>{u.name}</strong>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            textTransform: 'uppercase',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                          }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td>{u.phone || 'N/A'}</td>
                      <td>
                        <StatusBadge status={u.verificationStatus || 'verified'} />
                      </td>
                      <td>{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 4: AUDIT LOG ================= */}
        {activeTab === 'audit' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Real-Time Platform Audit Trail</h3>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Event ID</th>
                    <th>Action</th>
                    <th>Details</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {(overview?.auditLogs || []).map((log) => (
                    <tr key={log.id}>
                      <td>#{log.id}</td>
                      <td>
                        <strong style={{ color: '#0369a1' }}>{log.action}</strong>
                      </td>
                      <td style={{ color: '#334155', fontSize: '0.84rem' }}>{log.details}</td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {formatDateTime(log.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
