import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosClient';
import InventoryGrid from '../../components/tables/InventoryGrid';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDateTime } from '../../utils/formatters';
import {
  Building2,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  AlertTriangle,
  RefreshCw,
  Send,
  Inbox,
  FileCheck,
} from 'lucide-react';

export const BloodBankDashboard = () => {
  const { user, profile, isVerified } = useAuth();

  const [inventory, setInventory] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [responseNotes, setResponseNotes] = useState({});

  const loadBloodBankData = async () => {
    setLoading(true);
    try {
      const [profRes, inqRes] = await Promise.all([
        api.get('/bloodbank/profile'),
        api.get('/bloodbank/inquiries'),
      ]);

      if (profRes.success && profRes.profile) {
        setInventory(profRes.profile.inventory || []);
        setLastUpdated(profRes.profile.lastInventoryUpdate);
      }

      if (inqRes.success) {
        setInquiries(inqRes.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBloodBankData();
  }, []);

  const handleUnitChange = (bloodGroup, newUnits) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.bloodGroup === bloodGroup
          ? { ...item, unitsAvailable: newUnits }
          : item
      )
    );
  };

  const handleSaveInventory = async () => {
    setSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      const res = await api.put('/bloodbank/inventory', { inventory });
      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'Blood inventory counts and verification timestamp updated successfully!',
        });
        setLastUpdated(res.lastInventoryUpdate);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update inventory' });
    } finally {
      setSaving(false);
    }
  };

  const handleRespondInquiry = async (notificationId, status) => {
    const note = responseNotes[notificationId] || '';
    try {
      const res = await api.post('/bloodbank/respond-inquiry', {
        notificationId,
        status,
        responseNote: note,
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Inquiry status updated to ${status}. Hospital notified immediately.`,
        });
        loadBloodBankData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center', color: '#64748b' }}>
        Loading blood bank inventory...
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        {!isVerified && (
          <div
            style={{
              background: '#fef3c7',
              border: '1px solid #fde68a',
              borderLeft: '4px solid #f59e0b',
              padding: '16px 20px',
              borderRadius: '8px',
              color: '#92400e',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <AlertTriangle size={24} style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '1rem' }}>Facility Verification Under Review</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem' }}>
                Your Blood Bank license ({profile?.licenseNumber || 'Pending'}) is currently being
                reviewed by platform administrators. You can update your inventory below; once verified,
                your stock will be broadcast to nearby hospital emergency searches.
              </p>
            </div>
          </div>
        )}

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
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 style={{ fontSize: '1.45rem', color: '#0f1e36', margin: 0 }}>
                {profile?.bloodBankName || user?.name || 'Blood Bank Center'}
              </h2>
              <StatusBadge status={user?.verificationStatus} />
            </div>
            <div style={{ fontSize: '0.84rem', color: '#64748b', display: 'flex', gap: 14 }}>
              <span>
                <strong>License:</strong> {profile?.licenseNumber || 'BB-LIC-DEL-2023'}
              </span>
              <span>
                <strong>Phone:</strong> {profile?.contactPhone || user?.phone}
              </span>
              <span>
                <strong>Hours:</strong> {profile?.operatingHours || '24/7 Emergency Service'}
              </span>
            </div>
          </div>

          <button
            onClick={handleSaveInventory}
            disabled={saving}
            className="btn btn-primary"
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save & Publish Inventory'}
          </button>
        </div>

        {/* ================= INVENTORY MANAGER ================= */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Live Whole Blood & Component Inventory</h3>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Accurate inventory enables hospitals to request reserve blood when direct donors are
                unavailable.
              </div>
            </div>
          </div>

          <InventoryGrid
            inventory={inventory}
            onChangeUnits={handleUnitChange}
            editable={true}
            lastUpdated={lastUpdated}
          />

          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Note: Updating stock logs a verified timestamp visible to nearby hospitals.
            </span>
            <button
              onClick={handleSaveInventory}
              disabled={saving}
              className="btn btn-navy btn-sm"
            >
              <RefreshCw size={14} /> Commit Stock Update
            </button>
          </div>
        </div>

        {/* ================= HOSPITAL INQUIRIES ================= */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Inbox size={18} color="#0284c7" />
                Hospital Reservation Inquiries ({inquiries.length})
              </h3>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Priority unit requests sent by accredited hospital trauma desks
              </div>
            </div>
          </div>

          {inquiries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
              No pending hospital reservation inquiries at this time.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {inquiries.map((inq) => {
                const isPending = inq.responseStatus === 'Pending';
                const isConfirmed = inq.responseStatus === 'Confirmed';
                const isUnavailable = inq.responseStatus === 'Unavailable';

                return (
                  <div
                    key={inq._id}
                    style={{
                      border: `1px solid ${isPending ? '#38bdf8' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      padding: '14px',
                      background: isPending ? '#f0f9ff' : '#fff',
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
                      <strong style={{ color: '#0f1e36', fontSize: '1rem' }}>
                        {inq.title}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {formatDateTime(inq.createdAt)}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.5, marginBottom: 12 }}>
                      {inq.message}
                    </p>

                    {inq.actionPayload && (
                      <div
                        style={{
                          background: '#fff',
                          border: '1px solid #cbd5e1',
                          padding: '10px 14px',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          color: '#475569',
                          marginBottom: 12,
                          display: 'flex',
                          gap: 20,
                          flexWrap: 'wrap',
                        }}
                      >
                        <div>
                          Hospital: <strong>{inq.actionPayload.hospitalName}</strong>
                        </div>
                        <div>
                          Requested Blood Group: <strong>{inq.actionPayload.bloodGroup}</strong>
                        </div>
                        <div>
                          Units: <strong>{inq.actionPayload.unitsRequested}</strong>
                        </div>
                        <div>
                          Emergency Desk: <strong>{inq.actionPayload.emergencyContact}</strong>
                        </div>
                      </div>
                    )}

                    {isPending ? (
                      <div
                        style={{
                          display: 'flex',
                          gap: 10,
                          alignItems: 'center',
                          flexWrap: 'wrap',
                        }}
                      >
                        <input
                          type="text"
                          placeholder="Optional dispatch or reservation note..."
                          className="form-input"
                          style={{ maxWidth: 360, padding: '6px 12px', fontSize: '0.82rem' }}
                          value={responseNotes[inq._id] || ''}
                          onChange={(e) =>
                            setResponseNotes({ ...responseNotes, [inq._id]: e.target.value })
                          }
                        />

                        <button
                          onClick={() => handleRespondInquiry(inq._id, 'Confirmed')}
                          className="btn btn-primary btn-sm"
                        >
                          <CheckCircle size={14} /> Confirm Available & Reserve
                        </button>

                        <button
                          onClick={() => handleRespondInquiry(inq._id, 'Unavailable')}
                          className="btn btn-outline-red btn-sm"
                        >
                          <XCircle size={14} /> Report Unavailable
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        Decision Logged:{' '}
                        <strong
                          style={{
                            color: isConfirmed ? '#16a34a' : '#dc2626',
                          }}
                        >
                          {inq.responseStatus}
                        </strong>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BloodBankDashboard;
