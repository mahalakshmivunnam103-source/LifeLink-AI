import React from 'react';
import { Heart, ShieldCheck, AlertCircle } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#0b1a30',
        color: '#94a3b8',
        borderTop: '1px solid #1a365d',
        padding: '3rem 0 2rem 0',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        {/* Medical Screening Disclaimer */}
        <div
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '8px',
            padding: '14px 18px',
            marginBottom: '2rem',
            color: '#fef3c7',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            fontSize: '0.84rem',
            lineHeight: 1.5,
          }}
        >
          <AlertCircle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong style={{ color: '#fde68a' }}>Important Medical Notice: </strong>
            Donation intervals (default 90 days for male, 120 days for female whole-blood donors)
            serve as an initial platform screening filter only, not a clinical guarantee of donor
            eligibility. Final donor health evaluation, hemoglobin levels, and blood cross-matching
            must always be conducted and verified by qualified hospital and blood bank medical
            staff prior to transfusion.
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff', marginBottom: 12 }}>
              <Heart size={20} fill="#dc2626" color="#dc2626" />
              <strong style={{ fontSize: '1.15rem' }}>LifeLink AI</strong>
            </div>
            <p style={{ fontSize: '0.86rem', lineHeight: 1.6 }}>
              A secure, verified network connecting accredited hospitals with eligible nearby blood
              donors and registered blood banks during critical medical emergencies.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#fff', marginBottom: 12, fontSize: '0.95rem' }}>Core Safety Principles</h4>
            <ul style={{ listStyle: 'none', fontSize: '0.84rem', lineHeight: 1.9 }}>
              <li>✓ Verified Hospital & Blood Bank Credentials</li>
              <li>✓ Strict RBC Transfusion Compatibility Rules</li>
              <li>✓ Configurable Reference Intervals (90d / 120d)</li>
              <li>✓ Privacy Protection & Masked Donor Contacts</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#fff', marginBottom: 12, fontSize: '0.95rem' }}>System Security</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem' }}>
              <ShieldCheck size={18} color="#10b981" />
              <span>Role-Based Access Control & Encrypted Sessions</span>
            </div>
            <p style={{ fontSize: '0.8rem', marginTop: 10, color: '#64748b' }}>
              Donor phone numbers and exact coordinates are protected. Contact details are only
              shared with verified hospital staff upon authorized donor consent.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '1.5rem',
            fontSize: '0.8rem',
            color: '#64748b',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            © {new Date().getFullYear()} LifeLink AI — Smart Blood Donor & Blood Bank Network.
          </div>
          <div>Development Build — Safe Sample Healthcare Environment</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
