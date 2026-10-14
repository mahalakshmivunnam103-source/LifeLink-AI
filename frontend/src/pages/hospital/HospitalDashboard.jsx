import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosClient';
import { BLOOD_GROUPS, MEDICAL_DISCLAIMER } from '../../utils/compatibility';
import { formatDistance, formatDateTime } from '../../utils/formatters';
import DonorMatchTable from '../../components/tables/DonorMatchTable';
import NetworkMap from '../../components/maps/NetworkMap';
import StatusBadge from '../../components/common/StatusBadge';
import CreateRequestModal from './CreateRequestModal';
import {
  Hospital,
  Plus,
  Search,
  Filter,
  MapPin,
  Building2,
  Phone,
  CheckCircle,
  AlertTriangle,
  Clock,
  Send,
  Activity,
  ShieldCheck,
} from 'lucide-react';

export const HospitalDashboard = () => {
  const { user, profile, isVerified } = useAuth();

  // Search Filters
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('O-');
  const [radiusKm, setRadiusKm] = useState(25);
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(true);

  // Data States
  const [matchingResults, setMatchingResults] = useState(null);
  const [requestsList, setRequestsList] = useState([]);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [notifyingDonorId, setNotifyingDonorId] = useState(null);
  const [notifiedDonorIds, setNotifiedDonorIds] = useState([]);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('match'); // 'match' | 'requests'

  // Success / error message
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // 1. Fetch matching donors & blood banks
  const fetchMatchingDonors = async () => {
    setLoadingMatch(true);
    setFeedback({ type: '', message: '' });
    try {
      const queryParams = new URLSearchParams({
        bloodGroup: selectedBloodGroup,
        radius: radiusKm,
        onlyEligible: String(onlyEligible),
        onlyAvailable: String(onlyAvailable),
      });

      const res = await api.get(`/hospital/matching-donors?${queryParams.toString()}`);
      if (res.success) {
        setMatchingResults(res.data);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to match donors' });
    } finally {
      setLoadingMatch(false);
    }
  };

  // 2. Fetch hospital requests
  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await api.get('/hospital/requests');
      if (res.success) {
        setRequestsList(res.data);
        // Collect IDs of already notified donors across active requests
        const notified = [];
        res.data.forEach((r) => {
          (r.notifiedDonors || []).forEach((nd) => notified.push(nd.donorUserId));
        });
        setNotifiedDonorIds(notified);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchMatchingDonors();
    fetchRequests();
  }, [selectedBloodGroup, radiusKm, onlyEligible, onlyAvailable]);

  // Handle Create Request
  const handleCreateRequest = async (requestPayload) => {
    try {
      const res = await api.post('/hospital/requests', requestPayload);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Blood request for ${requestPayload.unitsRequired} unit(s) of ${requestPayload.bloodGroup} published!`,
        });
        fetchRequests();
        setSelectedBloodGroup(requestPayload.bloodGroup);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Could not create blood request' });
    }
  };

  // Handle Notify Donor
  const handleNotifyDonor = async (donor) => {
    // Find active request matching this blood group or use most recent request
    const matchedReq =
      requestsList.find(
        (r) => r.status === 'Pending' || r.status === 'Contacted'
      ) || requestsList[0];

    if (!matchedReq) {
      setFeedback({
        type: 'error',
        message: 'Please create an active blood request first before dispatching donor notifications.',
      });
      setIsCreateModalOpen(true);
      return;
    }

    setNotifyingDonorId(donor.userId);
    try {
      const res = await api.post('/hospital/notify-donor', {
        donorUserId: donor.userId,
        requestId: matchedReq._id,
      });

      if (res.success) {
        setNotifiedDonorIds((prev) => [...prev, donor.userId]);
        setFeedback({
          type: 'success',
          message: `Emergency notification dispatched to ${donor.name} (~${formatDistance(donor.distanceKm)}).`,
        });
        fetchRequests();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Notification failed' });
    } finally {
      setNotifyingDonorId(null);
    }
  };

  // Handle Inquire Blood Bank
  const handleContactBloodBank = async (bank) => {
    const matchedReq =
      requestsList.find(
        (r) => r.status === 'Pending' || r.status === 'Contacted'
      ) || requestsList[0];

    if (!matchedReq) {
      setFeedback({
        type: 'error',
        message: 'Please create an active blood request first before contacting a blood bank.',
      });
      setIsCreateModalOpen(true);
      return;
    }

    try {
      const res = await api.post('/hospital/contact-bloodbank', {
        bloodBankUserId: bank.userId,
        requestId: matchedReq._id,
        units: 2,
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Priority reservation inquiry submitted to ${bank.bloodBankName}!`,
        });
        fetchRequests();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to contact blood bank' });
    }
  };

  // Handle Request Status Change
  const handleStatusChange = async (requestId, newStatus) => {
    try {
      const res = await api.patch(`/hospital/requests/${requestId}/status`, {
        status: newStatus,
      });
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Request status updated to ${newStatus}.`,
        });
        fetchRequests();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const hospitalCenter = profile?.location
    ? [profile.location.latitude, profile.location.longitude]
    : [28.6139, 77.209];

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        {/* Verification Warning if Facility is Pending Admin Review */}
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
              <strong style={{ fontSize: '1rem' }}>Medical Facility Verification Pending</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem' }}>
                Your hospital registration (License: {profile?.licenseNumber || 'Under Review'}) is
                currently awaiting review by platform administrators. You can explore the matching
                console, but full emergency broadcasts will be activated upon admin signoff.
              </p>
            </div>
          </div>
        )}

        {/* Feedback Alert */}
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
            {feedback.type === 'error' ? (
              <AlertTriangle size={18} />
            ) : (
              <CheckCircle size={18} />
            )}
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
                {profile?.hospitalName || user?.name || 'Hospital Clinical Desk'}
              </h2>
              <StatusBadge status={user?.verificationStatus} />
            </div>
            <div style={{ fontSize: '0.84rem', color: '#64748b', display: 'flex', gap: 14 }}>
              <span>
                <strong>License:</strong> {profile?.licenseNumber || 'MED-REG-DEL-2024'}
              </span>
              <span>
                <strong>Trauma Desk:</strong> {profile?.emergencyContact || user?.phone}
              </span>
              <span>
                <strong>City:</strong> {profile?.city || 'Metro Central'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-primary"
            >
              <Plus size={16} /> New Blood Request
            </button>
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
            onClick={() => setActiveTab('match')}
            style={{
              padding: '10px 4px',
              fontSize: '0.95rem',
              fontWeight: 600,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'match' ? '#dc2626' : '#64748b',
              borderBottom: activeTab === 'match' ? '3px solid #dc2626' : '3px solid transparent',
              marginBottom: -2,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Search size={18} /> Donor Matching & Network Map
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            style={{
              padding: '10px 4px',
              fontSize: '0.95rem',
              fontWeight: 600,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'requests' ? '#dc2626' : '#64748b',
              borderBottom:
                activeTab === 'requests' ? '3px solid #dc2626' : '3px solid transparent',
              marginBottom: -2,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Activity size={18} /> Active Blood Requests ({requestsList.length})
          </button>
        </div>

        {/* ================= TAB 1: DONOR MATCHING & MAP ================= */}
        {activeTab === 'match' && (
          <div>
            {/* Filter Bar */}
            <div
              className="card"
              style={{
                marginBottom: '1.5rem',
                background: '#fff',
                padding: '1.25rem',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 16,
                  alignItems: 'center',
                }}
              >
                <div>
                  <label className="form-label">Recipient Blood Group</label>
                  <select
                    className="form-select"
                    value={selectedBloodGroup}
                    onChange={(e) => setSelectedBloodGroup(e.target.value)}
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Search Radius: {radiusKm} km</label>
                  <select
                    className="form-select"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                  >
                    <option value={10}>10 km (Immediate Area)</option>
                    <option value={25}>25 km (City Center)</option>
                    <option value={50}>50 km (Metropolitan)</option>
                    <option value={100}>100 km (Regional)</option>
                  </select>
                </div>

                <div style={{ paddingTop: 20 }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: '0.85rem',
                      color: '#0f172a',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={onlyEligible}
                      onChange={(e) => setOnlyEligible(e.target.checked)}
                    />
                    <span>Strict 90/120d Screen Pass</span>
                  </label>
                </div>

                <div style={{ paddingTop: 20 }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: '0.85rem',
                      color: '#0f172a',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={onlyAvailable}
                      onChange={(e) => setOnlyAvailable(e.target.checked)}
                    />
                    <span>Available Donors Only</span>
                  </label>
                </div>

                <div style={{ paddingTop: 20 }}>
                  <button
                    onClick={fetchMatchingDonors}
                    disabled={loadingMatch}
                    className="btn btn-navy"
                    style={{ width: '100%' }}
                  >
                    <Search size={16} /> {loadingMatch ? 'Searching...' : 'Refresh Matches'}
                  </button>
                </div>
              </div>
            </div>

            {/* Medical Screening Notice */}
            <div className="medical-disclaimer">
              <ShieldCheck size={20} color="#d97706" style={{ flexShrink: 0 }} />
              <div>{MEDICAL_DISCLAIMER}</div>
            </div>

            {/* Interactive Leaflet OpenStreetMap */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={18} color="#dc2626" />
                  <strong style={{ fontSize: '0.98rem', color: '#0f1e36' }}>
                    OpenStreetMap Live Network Radar
                  </strong>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Showing: {matchingResults?.matchedDonors?.length || 0} Donors •{' '}
                  {matchingResults?.nearbyBloodBanks?.length || 0} Blood Banks
                </span>
              </div>

              <NetworkMap
                center={hospitalCenter}
                hospital={{
                  hospitalName: profile?.hospitalName || user?.name,
                  address: profile?.address,
                  location: profile?.location || { latitude: 28.6139, longitude: 77.209 },
                }}
                donors={matchingResults?.matchedDonors || []}
                bloodBanks={matchingResults?.nearbyBloodBanks || []}
                searchRadiusKm={radiusKm}
              />
            </div>

            {/* Matched Donors Section */}
            <div className="card" style={{ marginBottom: '2rem' }}>
              <div className="card-header">
                <div>
                  <h3 className="card-title">
                    Compatible Donors Found ({matchingResults?.matchedDonors?.length || 0})
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Compatible with recipient{' '}
                    <span style={{ color: '#dc2626', fontWeight: 700 }}>{selectedBloodGroup}</span>{' '}
                    within {radiusKm} km
                  </div>
                </div>
              </div>

              <DonorMatchTable
                donors={matchingResults?.matchedDonors || []}
                onNotifyDonor={handleNotifyDonor}
                notifiedDonorIds={notifiedDonorIds}
                notifyingId={notifyingDonorId}
              />
            </div>

            {/* ================= BLOOD BANK FALLBACK SECTION ================= */}
            <div
              className="card"
              style={{
                border: matchingResults?.fallbackActive
                  ? '2px solid #ef4444'
                  : '1px solid #e2e8f0',
                background: matchingResults?.fallbackActive ? '#fffbfb' : '#fff',
              }}
            >
              <div className="card-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Building2 size={20} color="#0284c7" />
                    <h3 className="card-title" style={{ margin: 0 }}>
                      Nearby Registered Blood Banks (Reserve Fallback)
                    </h3>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4 }}>
                    If individual donors are unavailable or delayed, request units from verified
                    blood bank reserves.
                  </div>
                </div>

                {matchingResults?.fallbackActive && (
                  <span
                    className="badge"
                    style={{
                      background: '#fee2e2',
                      color: '#991b1b',
                      borderColor: '#fca5a5',
                      padding: '4px 12px',
                    }}
                  >
                    ● Fallback Active (Zero Available Donors)
                  </span>
                )}
              </div>

              {matchingResults?.nearbyBloodBanks?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  No registered blood banks within this radius. Try expanding the search radius.
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 16,
                  }}
                >
                  {matchingResults?.nearbyBloodBanks?.map((bank) => (
                    <div
                      key={bank.bloodBankId}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: 6,
                          }}
                        >
                          <h4 style={{ margin: 0, color: '#0f1e36', fontSize: '1.05rem' }}>
                            {bank.bloodBankName}
                          </h4>
                          <span
                            style={{
                              fontWeight: 700,
                              color: '#0284c7',
                              fontSize: '0.86rem',
                            }}
                          >
                            {formatDistance(bank.distanceKm)}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 10 }}>
                          {bank.address} • License: {bank.licenseNumber}
                        </div>

                        {/* Compatible inventory summary */}
                        <div
                          style={{
                            background: '#fff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            padding: '10px 12px',
                            marginBottom: 12,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: 6,
                            }}
                          >
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              Compatible Reserves ({selectedBloodGroup}):
                            </span>
                            <span
                              style={{
                                fontSize: '1.05rem',
                                fontWeight: 800,
                                color: bank.totalCompatibleUnits > 0 ? '#15803d' : '#b91c1c',
                              }}
                            >
                              {bank.totalCompatibleUnits} units
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {bank.inventory
                              .filter((i) => i.isCompatible)
                              .map((i) => (
                                <span
                                  key={i.bloodGroup}
                                  style={{
                                    fontSize: '0.74rem',
                                    padding: '2px 6px',
                                    borderRadius: 4,
                                    background: i.isExact ? '#fee2e2' : '#f1f5f9',
                                    color: i.isExact ? '#991b1b' : '#334155',
                                    fontWeight: 600,
                                  }}
                                >
                                  {i.bloodGroup}: {i.unitsAvailable}u
                                </span>
                              ))}
                          </div>
                        </div>

                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 12 }}>
                          <div>📞 <strong>Phone:</strong> {bank.contactPhone}</div>
                          <div>🕒 <strong>Hours:</strong> {bank.operatingHours}</div>
                          <div>
                            🔄 <strong>Last Verified:</strong> {formatDateTime(bank.lastInventoryUpdate)}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleContactBloodBank(bank)}
                        className="btn btn-navy btn-sm"
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        <Send size={14} /> Send Priority Reservation Inquiry
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: ACTIVE BLOOD REQUESTS ================= */}
        {activeTab === 'requests' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Hospital Blood Request Management</h3>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn btn-primary btn-sm"
              >
                <Plus size={14} /> Create Request
              </button>
            </div>

            {loadingRequests ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                Loading requests...
              </div>
            ) : requestsList.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                No blood requests published yet. Click "New Blood Request" to broadcast a requirement.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Blood Group</th>
                      <th>Units</th>
                      <th>Urgency</th>
                      <th>Created At</th>
                      <th>Status</th>
                      <th>Donors Alerted</th>
                      <th>AI Urgency Index</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requestsList.map((req) => (
                      <tr key={req._id}>
                        <td>
                          <span className="blood-group-pill">{req.bloodGroup}</span>
                        </td>
                        <td>
                          <strong>{req.unitsRequired} unit(s)</strong>
                        </td>
                        <td>
                          <StatusBadge status={req.urgency} type="urgency" />
                        </td>
                        <td>{formatDateTime(req.createdAt)}</td>
                        <td>
                          <StatusBadge status={req.status} />
                        </td>
                        <td>
                          <div style={{ fontSize: '0.84rem' }}>
                            {req.notifiedDonors?.length || 0} Alerted
                          </div>
                          {req.notifiedDonors?.some((d) => d.status === 'Accepted') && (
                            <span
                              style={{
                                fontSize: '0.72rem',
                                color: '#16a34a',
                                fontWeight: 700,
                              }}
                            >
                              ✓ Donor Accepted!
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#f87171' }}>
                            {req.aiTriage?.urgencyScore || 75}/100
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {req.aiTriage?.scarcityFactor || 'Standard'}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            {req.status !== 'Fulfilled' && (
                              <button
                                onClick={() => handleStatusChange(req._id, 'Fulfilled')}
                                className="btn btn-outline btn-sm"
                                style={{
                                  borderColor: '#86efac',
                                  color: '#166534',
                                  fontSize: '0.75rem',
                                }}
                              >
                                Mark Fulfilled
                              </button>
                            )}
                            {req.status !== 'Cancelled' && (
                              <button
                                onClick={() => handleStatusChange(req._id, 'Cancelled')}
                                className="btn btn-outline btn-sm"
                                style={{
                                  borderColor: '#fca5a5',
                                  color: '#991b1b',
                                  fontSize: '0.75rem',
                                }}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Create Request Modal */}
        <CreateRequestModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmitRequest={handleCreateRequest}
          hospitalProfile={profile}
        />
      </div>
    </div>
  );
};

export default HospitalDashboard;
