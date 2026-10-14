import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BLOOD_GROUPS } from '../utils/compatibility';
import {
  Hospital,
  Heart,
  Building2,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Shield,
  FileCheck,
} from 'lucide-react';

export const Register = ({ setActivePage }) => {
  const { register } = useAuth();
  const [role, setRole] = useState('donor');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    // Donor specific
    bloodGroup: 'O+',
    gender: 'Male',
    age: 26,
    currentArea: 'Connaught Place, Central',
    latitude: 28.6139,
    longitude: 77.209,
    lastDonationDate: '',
    consentShareContact: false,
    // Hospital specific
    hospitalName: '',
    licenseNumber: '',
    address: '',
    city: 'New Delhi',
    contactPerson: '',
    emergencyContact: '',
    // Blood Bank specific
    bloodBankName: '',
    contactPhone: '',
    operatingHours: '24/7 Emergency Service',
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      let profileData = {};

      if (role === 'donor') {
        profileData = {
          bloodGroup: formData.bloodGroup,
          gender: formData.gender,
          age: Number(formData.age),
          currentArea: formData.currentArea,
          latitude: Number(formData.latitude) || 28.6139,
          longitude: Number(formData.longitude) || 77.209,
          lastDonationDate: formData.lastDonationDate || null,
          consentShareContact: formData.consentShareContact,
          availabilityStatus: true,
          receiveRequests: true,
        };
      } else if (role === 'hospital') {
        profileData = {
          hospitalName: formData.hospitalName || formData.name,
          licenseNumber: formData.licenseNumber,
          address: formData.address,
          city: formData.city,
          contactPerson: formData.contactPerson || formData.name,
          emergencyContact: formData.emergencyContact || formData.phone,
          latitude: Number(formData.latitude) || 28.6139,
          longitude: Number(formData.longitude) || 77.209,
        };
      } else if (role === 'bloodbank') {
        profileData = {
          bloodBankName: formData.bloodBankName || formData.name,
          licenseNumber: formData.licenseNumber,
          address: formData.address,
          city: formData.city,
          contactPhone: formData.contactPhone || formData.phone,
          operatingHours: formData.operatingHours,
          latitude: Number(formData.latitude) || 28.6295,
          longitude: Number(formData.longitude) || 77.218,
        };
      }

      const res = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role,
        profileData,
      });

      setSuccessMsg(res.message);
      setTimeout(() => {
        setActivePage(res.user.role);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check form fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3rem 0', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: '640px' }}>
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
              <UserPlus size={22} />
            </div>
            <h2 style={{ fontSize: '1.6rem', color: '#0f1e36', marginBottom: 4 }}>
              Register on LifeLink AI
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#64748b' }}>
              Create your account as a blood donor, hospital staff, or registered blood bank
            </p>
          </div>

          {/* Role Tabs */}
          <div className="role-tabs">
            <button
              type="button"
              className={`role-tab-btn ${role === 'donor' ? 'active' : ''}`}
              onClick={() => setRole('donor')}
            >
              <Heart size={14} /> Donor
            </button>
            <button
              type="button"
              className={`role-tab-btn ${role === 'hospital' ? 'active' : ''}`}
              onClick={() => setRole('hospital')}
            >
              <Hospital size={14} /> Hospital
            </button>
            <button
              type="button"
              className={`role-tab-btn ${role === 'bloodbank' ? 'active' : ''}`}
              onClick={() => setRole('bloodbank')}
            >
              <Building2 size={14} /> Blood Bank
            </button>
          </div>

          {/* Verification Notice for Facilities */}
          {role !== 'donor' && (
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '1.25rem',
                fontSize: '0.82rem',
                color: '#1e40af',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <FileCheck size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong>Medical Verification Required: </strong>
                All Hospital and Blood Bank accounts are subjected to administrator review of
                medical license details before full broadcast privileges are activated.
              </div>
            </div>
          )}

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
              <AlertCircle size={16} />
              <div>{error}</div>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                background: '#dcfce7',
                border: '1px solid #86efac',
                color: '#166534',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '0.84rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CheckCircle size={16} />
              <div>{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Common Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">
                  Full Name / Contact Person *
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Sarah Jenkins"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-phone">
                  Phone Number *
                </label>
                <input
                  id="reg-phone"
                  type="text"
                  required
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">
                  Email Address *
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="official@domain.org"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-pwd">
                  Password (min 6 chars) *
                </label>
                <input
                  id="reg-pwd"
                  type="password"
                  required
                  minLength={6}
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* DONOR SPECIFIC FIELDS */}
            {role === 'donor' && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '14px',
                  borderRadius: '8px',
                  marginBottom: '1.25rem',
                }}
              >
                <h4 style={{ fontSize: '0.92rem', color: '#0f1e36', marginBottom: 12 }}>
                  Donor Medical Profile
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Blood Group *</label>
                    <select
                      name="bloodGroup"
                      className="form-select"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                    >
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gender *</label>
                    <select
                      name="gender"
                      className="form-select"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="Male">Male (90d ref)</option>
                      <option value="Female">Female (120d ref)</option>
                      <option value="Other">Other (90d ref)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Age (18-65) *</label>
                    <input
                      type="number"
                      min={18}
                      max={65}
                      required
                      name="age"
                      className="form-input"
                      value={formData.age}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Current Living Area / Street *</label>
                  <input
                    type="text"
                    required
                    name="currentArea"
                    className="form-input"
                    value={formData.currentArea}
                    onChange={handleChange}
                    placeholder="e.g. Connaught Place, New Delhi"
                  />
                  <span className="form-hint">
                    Used to calculate approximate distance to emergency hospitals
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Last Whole-Blood Donation Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="lastDonationDate"
                    className="form-input"
                    value={formData.lastDonationDate}
                    onChange={handleChange}
                  />
                  <span className="form-hint">
                    Leave blank if you are a first-time voluntary blood donor
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    marginTop: 10,
                    padding: '8px',
                    background: '#fff',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                  }}
                >
                  <input
                    type="checkbox"
                    id="consent-check"
                    name="consentShareContact"
                    checked={formData.consentShareContact}
                    onChange={handleChange}
                    style={{ marginTop: 3 }}
                  />
                  <label htmlFor="consent-check" style={{ fontSize: '0.8rem', color: '#475569' }}>
                    <strong>Consent: </strong> Allow verified hospital staff to directly view my
                    phone number when a compatible emergency request matches my blood group. (If
                    unchecked, your phone remains masked until you accept the request).
                  </label>
                </div>
              </div>
            )}

            {/* HOSPITAL SPECIFIC FIELDS */}
            {role === 'hospital' && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '14px',
                  borderRadius: '8px',
                  marginBottom: '1.25rem',
                }}
              >
                <h4 style={{ fontSize: '0.92rem', color: '#0f1e36', marginBottom: 12 }}>
                  Hospital Credentials
                </h4>

                <div className="form-group">
                  <label className="form-label">Hospital / Trauma Center Official Name *</label>
                  <input
                    type="text"
                    required
                    name="hospitalName"
                    className="form-input"
                    value={formData.hospitalName}
                    onChange={handleChange}
                    placeholder="e.g. Metro City General Hospital"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Medical Establishment License # *</label>
                    <input
                      type="text"
                      required
                      name="licenseNumber"
                      className="form-input"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      placeholder="MED-REG-2026-XXXX"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">24/7 Emergency Line *</label>
                    <input
                      type="text"
                      required
                      name="emergencyContact"
                      className="form-input"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      placeholder="+91 11 2345 6789"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Hospital Address *</label>
                  <input
                    type="text"
                    required
                    name="address"
                    className="form-input"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Plot #, Health City Avenue, District"
                  />
                </div>
              </div>
            )}

            {/* BLOOD BANK SPECIFIC FIELDS */}
            {role === 'bloodbank' && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '14px',
                  borderRadius: '8px',
                  marginBottom: '1.25rem',
                }}
              >
                <h4 style={{ fontSize: '0.92rem', color: '#0f1e36', marginBottom: 12 }}>
                  Blood Bank Facility Details
                </h4>

                <div className="form-group">
                  <label className="form-label">Official Blood Bank Name *</label>
                  <input
                    type="text"
                    required
                    name="bloodBankName"
                    className="form-input"
                    value={formData.bloodBankName}
                    onChange={handleChange}
                    placeholder="e.g. Red Cross Regional Blood Center"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Blood Bank License # *</label>
                    <input
                      type="text"
                      required
                      name="licenseNumber"
                      className="form-input"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      placeholder="BB-LIC-2026-XXXX"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Operating Schedule</label>
                    <input
                      type="text"
                      name="operatingHours"
                      className="form-input"
                      value={formData.operatingHours}
                      onChange={handleChange}
                      placeholder="24/7 Emergency Service"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Facility Address *</label>
                  <input
                    type="text"
                    required
                    name="address"
                    className="form-input"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Facility street, city and pin code"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
            >
              {loading ? 'Submitting Registration...' : `Complete Registration as ${role.toUpperCase()}`}
            </button>
          </form>

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
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setActivePage('login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
