import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosClient';
import { formatDateTime, formatDate } from '../../utils/formatters';
import { MEDICAL_DISCLAIMER } from '../../utils/compatibility';
import {
  Heart,
  Calendar,
  Clock,
  Shield,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Bell,
  MapPin,
  Lock,
  Unlock,
  AlertCircle,
  Save,
} from 'lucide-react';

export const DonorDashboard = () => {
  const { user, profile, refreshProfile } = useAuth();

  // Donor Profile State
  const [donorData, setDonorData] = useState(null);
  const [screening, setScreening] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form edit state
  const [currentArea, setCurrentArea] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState(true);
  const [receiveRequests, setReceiveRequests] = useState(true);
  const [consentShareContact, setConsentShareContact] = useState(false);
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const loadDonorData = async () => {
    setLoading(true);
    try {
      const [profRes, notifRes] = await Promise.all([
        api.get('/donor/profile'),
        api.get('/donor/notifications'),
      ]);

      if (profRes.success) {
        setDonorData(profRes.profile);
        setScreening(profRes.screening);
        setCurrentArea(profRes.profile.currentArea || '');
        setAvailabilityStatus(profRes.profile.availabilityStatus !== false);
        setReceiveRequests(profRes.profile.receiveRequests !== false);
        setConsentShareContact(Boolean(profRes.profile.consentShareContact));
        setLastDonationDate(
          profRes.profile.lastDonationDate
            ? new Date(profRes.profile.lastDonationDate).toISOString().split('T')[0]
            : ''
        );
      }

      if (notifRes.success) {
        setNotifications(notifRes.data);
      }
    } catch (err) {
      console.error('Error fetching donor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonorData();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      const res = await api.put('/donor/profile', {
        currentArea,
        availabilityStatus,
        receiveRequests,
        consentShareContact,
        lastDonationDate: lastDonationDate || null,
      });

      if (res.success) {
        setFeedback({ type: 'success', message: 'Profile & preferences updated successfully.' });
        loadDonorData();
        refreshProfile();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Update failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleRespondRequest = async (notificationId, response) => {
    try {
      const res = await api.post('/donor/respond', {
        notificationId,
        response,
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Request successfully ${response.toLowerCase()}! Thank you for your support.`,
        });
        loadDonorData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Could not process response' });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center', color: '#64748b' }}>
        Loading donor dashboard...
      </div>
    );
  }

  const isEligible = screening?.isScreeningEligible;

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
            {feedback.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            <div>{feedback.message}</div>
          </div>
        )}

        {/* Top Donor Banner */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="blood-group-badge">{donorData?.bloodGroup || 'O+'}</div>
            <div>
              <h2 style={{ fontSize: '1.45rem', color: '#0f1e36', margin: 0 }}>
                {user?.name}
              </h2>
              <div style={{ fontSize: '0.84rem', color: '#64748b', display: 'flex', gap: 12, marginTop: 4 }}>
                <span>Gender: <strong>{donorData?.gender || 'Donor'}</strong></span>
                <span>Age: <strong>{donorData?.age}</strong></span>
                <span>Total Voluntary Donations: <strong>{donorData?.donationCount || 0}</strong></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <span
              className="badge"
              style={{
                background: availabilityStatus ? '#dcfce7' : '#fee2e2',
                color: availabilityStatus ? '#166534' : '#991b1b',
                padding: '6px 14px',
                fontSize: '0.86rem',
              }}
            >
              {availabilityStatus ? '● Active Donor' : '○ On Pause'}
            </span>
          </div>
        </div>

        {/* Medical Screening Notice */}
        <div className="medical-disclaimer">
          <ShieldCheck size={20} color="#d97706" style={{ flexShrink: 0 }} />
          <div>{MEDICAL_DISCLAIMER}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }}>
          {/* LEFT COLUMN: REQUEST INBOX & SCREENING */}
          <div>
            {/* Screening Eligibility Card */}
            <div
              className="card"
              style={{
                marginBottom: '1.5rem',
                borderLeft: `5px solid ${isEligible ? '#10b981' : '#f59e0b'}`,
              }}
            >
              <div className="card-header">
                <h3 className="card-title">
                  <Calendar size={18} color={isEligible ? '#10b981' : '#f59e0b'} />
                  Donation Eligibility Status
                </h3>
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: isEligible ? '#059669' : '#d97706',
                  }}
                >
                  {isEligible ? 'Passed Screening Filter' : 'Interval Hold'}
                </span>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, marginBottom: '1rem' }}>
                {screening?.screeningNote}
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 12,
                  background: '#f8fafc',
                  padding: '12px',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Last Donation</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                    {formatDate(donorData?.lastDonationDate)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Reference Interval</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                    {screening?.requiredIntervalDays} Days ({donorData?.gender})
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Next Review Date</div>
                  <div style={{ fontWeight: 700, color: isEligible ? '#059669' : '#d97706', fontSize: '0.9rem' }}>
                    {screening?.nextEligibleDate ? formatDate(screening.nextEligibleDate) : 'Eligible Today'}
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Blood Requests Inbox */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <Bell size={18} color="#dc2626" />
                  Hospital Request Inbox ({notifications.length})
                </h3>
              </div>

              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  No active hospital donation requests at the moment. Keep your availability active!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {notifications.map((notif) => {
                    const isPending = notif.responseStatus === 'Pending';
                    const isAccepted = notif.responseStatus === 'Accepted';
                    const isDeclined = notif.responseStatus === 'Declined';

                    return (
                      <div
                        key={notif._id}
                        style={{
                          border: `1px solid ${isPending ? '#fca5a5' : '#e2e8f0'}`,
                          borderRadius: '8px',
                          padding: '14px',
                          background: isPending ? '#fffbfb' : '#fff',
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
                          <strong style={{ color: '#0f1e36', fontSize: '0.98rem' }}>
                            {notif.title}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {formatDateTime(notif.createdAt)}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, marginBottom: 12 }}>
                          {notif.message}
                        </p>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 10,
                          }}
                        >
                          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                            Status:{' '}
                            <strong
                              style={{
                                color: isAccepted
                                  ? '#16a34a'
                                  : isDeclined
                                  ? '#dc2626'
                                  : '#d97706',
                              }}
                            >
                              {notif.responseStatus || 'Pending'}
                            </strong>
                          </div>

                          {isPending && (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                onClick={() => handleRespondRequest(notif._id, 'Declined')}
                                className="btn btn-outline-red btn-sm"
                              >
                                <XCircle size={14} /> Decline
                              </button>
                              <button
                                onClick={() => handleRespondRequest(notif._id, 'Accepted')}
                                className="btn btn-primary btn-sm"
                              >
                                <CheckCircle size={14} /> Accept to Donate
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: PREFERENCES & PRIVACY CONTROLS */}
          <div>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <Shield size={18} color="#0284c7" />
                  Preferences & Privacy Controls
                </h3>
              </div>

              <form onSubmit={handleSaveProfile}>
                {/* Availability Toggle */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                        Availability for Donation
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Pause matching if you are traveling, unwell, or temporarily unavailable.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={availabilityStatus}
                      onChange={(e) => setAvailabilityStatus(e.target.checked)}
                      style={{ width: 18, height: 18 }}
                    />
                  </label>
                </div>

                {/* Consent Toggle */}
                <div
                  style={{
                    background: consentShareContact ? '#ecfdf5' : '#f8fafc',
                    border: `1px solid ${consentShareContact ? '#a7f3d0' : '#e2e8f0'}`,
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          color: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        {consentShareContact ? (
                          <Unlock size={14} color="#059669" />
                        ) : (
                          <Lock size={14} color="#64748b" />
                        )}
                        Share Direct Contact Number
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: 3 }}>
                        {consentShareContact
                          ? 'Consent ACTIVE: Attending trauma hospital desks can see your direct phone number for matched requests.'
                          : 'Privacy PROTECTED: Your phone number is masked. Hospitals cannot view it until you manually accept a request.'}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={consentShareContact}
                      onChange={(e) => setConsentShareContact(e.target.checked)}
                      style={{ width: 18, height: 18, marginTop: 4 }}
                    />
                  </label>
                </div>

                {/* Living Area Update */}
                <div className="form-group">
                  <label className="form-label">
                    <MapPin size={14} style={{ display: 'inline', marginRight: 4 }} />
                    Current Area / Neighborhood
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={currentArea}
                    onChange={(e) => setCurrentArea(e.target.value)}
                    placeholder="e.g. Connaught Place, New Delhi"
                  />
                  <span className="form-hint">
                    Update whenever you move to receive nearby emergency requests
                  </span>
                </div>

                {/* Last Donation Date */}
                <div className="form-group">
                  <label className="form-label">Update Last Donation Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={lastDonationDate}
                    onChange={(e) => setLastDonationDate(e.target.value)}
                  />
                  <span className="form-hint">
                    Resets the 90-day (Male) or 120-day (Female) screening interval countdown
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-navy"
                  style={{ width: '100%' }}
                >
                  <Save size={16} /> {saving ? 'Saving Preferences...' : 'Save Profile Preferences'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
