import React from 'react';
import { formatDistance } from '../../utils/formatters';
import { Bell, CheckCircle, AlertTriangle, ShieldCheck, Lock } from 'lucide-react';

export const DonorMatchTable = ({
  donors = [],
  onNotifyDonor,
  notifiedDonorIds = [],
  notifyingId = null,
}) => {
  if (donors.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '2.5rem',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px dashed #cbd5e1',
          color: '#64748b',
        }}
      >
        <AlertTriangle size={32} color="#f59e0b" style={{ margin: '0 auto 10px auto' }} />
        <h4 style={{ color: '#0f172a', marginBottom: 4 }}>No Potential Donors Found in this Radius</h4>
        <p style={{ fontSize: '0.88rem' }}>
          No active, compatible donors match your current search radius or filters.
          Check the <strong>Nearby Blood Banks Fallback</strong> below to request reserve units.
        </p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Donor Details</th>
            <th>Blood Group</th>
            <th>Distance</th>
            <th>Area / City</th>
            <th>Screening Assessment</th>
            <th>Contact Details</th>
            <th style={{ textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {donors.map((donor) => {
            const isScreenPassed = donor.screening?.isScreeningEligible;
            const isNotified = notifiedDonorIds.includes(donor.userId);
            const isBusy = notifyingId === donor.userId;

            return (
              <tr key={donor.donorId || donor.userId}>
                <td>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{donor.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {donor.gender || 'Donor'} • Age {donor.age} • {donor.donationCount || 0} donations
                  </div>
                </td>

                <td>
                  <span
                    className="blood-group-pill"
                    style={{
                      background: donor.isExactMatch ? '#fee2e2' : '#f1f5f9',
                      color: donor.isExactMatch ? '#991b1b' : '#334155',
                      borderColor: donor.isExactMatch ? '#f87171' : '#cbd5e1',
                    }}
                  >
                    {donor.bloodGroup}
                    {donor.isExactMatch && (
                      <span style={{ fontSize: '0.68rem', marginLeft: 4 }}>Exact</span>
                    )}
                  </span>
                </td>

                <td>
                  <div style={{ fontWeight: 700, color: '#0369a1' }}>
                    {formatDistance(donor.distanceKm)}
                  </div>
                </td>

                <td>
                  <div style={{ fontSize: '0.84rem', color: '#334155' }}>
                    {donor.currentArea}
                  </div>
                </td>

                <td>
                  {isScreenPassed ? (
                    <span
                      className="badge"
                      style={{ background: '#dcfce7', color: '#166534', borderColor: '#86efac' }}
                      title={donor.screening?.screeningNote}
                    >
                      <CheckCircle size={12} /> Eligible Screen
                    </span>
                  ) : (
                    <span
                      className="badge"
                      style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fcd34d' }}
                      title={donor.screening?.screeningNote}
                    >
                      <AlertTriangle size={12} /> {donor.screening?.daysRemaining}d Hold
                    </span>
                  )}
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
                    {donor.screening?.screeningNote}
                  </div>
                </td>

                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {donor.consentShareContact ? (
                      <ShieldCheck size={14} color="#10b981" />
                    ) : (
                      <Lock size={14} color="#64748b" />
                    )}
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.84rem',
                        color: donor.consentShareContact ? '#0f172a' : '#64748b',
                      }}
                    >
                      {donor.phoneDisplay}
                    </span>
                  </div>
                  {!donor.consentShareContact && (
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      Masked until donor accepts
                    </span>
                  )}
                </td>

                <td style={{ textAlign: 'right' }}>
                  {isNotified ? (
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#059669',
                        padding: '4px 8px',
                        background: '#ecfdf5',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <CheckCircle size={14} /> Alert Sent
                    </span>
                  ) : (
                    <button
                      onClick={() => onNotifyDonor(donor)}
                      disabled={isBusy}
                      className="btn btn-primary btn-sm"
                    >
                      <Bell size={14} /> {isBusy ? 'Sending...' : 'Notify Donor'}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DonorMatchTable;
