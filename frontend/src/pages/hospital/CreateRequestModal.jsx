import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import { BLOOD_GROUPS } from '../../utils/compatibility';
import AiTriageAdvisor from '../../components/ai/AiTriageAdvisor';
import { AlertCircle, PlusCircle } from 'lucide-react';

export const CreateRequestModal = ({
  isOpen,
  onClose,
  onSubmitRequest,
  hospitalProfile,
}) => {
  const [bloodGroup, setBloodGroup] = useState('O-');
  const [unitsRequired, setUnitsRequired] = useState(2);
  const [urgency, setUrgency] = useState('Critical');
  const [patientNotes, setPatientNotes] = useState(
    'Acute trauma admission with severe blood loss. Immediate whole-blood transfusion required.'
  );
  const [searchRadiusKm, setSearchRadiusKm] = useState(25);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmitRequest({
        bloodGroup,
        unitsRequired: Number(unitsRequired),
        urgency,
        patientNotes,
        searchRadiusKm: Number(searchRadiusKm),
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Emergency Blood Request"
      maxWidth="680px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Required Blood Group *</label>
            <select
              className="form-select"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
            >
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Units Required (1-50) *</label>
            <input
              type="number"
              min={1}
              max={50}
              required
              className="form-input"
              value={unitsRequired}
              onChange={(e) => setUnitsRequired(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Clinical Urgency Level *</label>
            <select
              className="form-select"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
            >
              <option value="Critical">Critical (Immediate Phlebotomy)</option>
              <option value="High">High (Within 2-4 Hours)</option>
              <option value="Medium">Medium (Within 12 Hours)</option>
              <option value="Low">Low (Scheduled Surgery Reserve)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Search Radius (km) *</label>
            <select
              className="form-select"
              value={searchRadiusKm}
              onChange={(e) => setSearchRadiusKm(e.target.value)}
            >
              <option value={10}>10 km (Immediate Local Vicinity)</option>
              <option value={25}>25 km (Standard City Radius)</option>
              <option value={50}>50 km (Metro & Suburbs)</option>
              <option value={100}>100 km (Regional Emergency)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Clinical Patient Context (Non-identifiable)</label>
          <textarea
            rows={3}
            className="form-textarea"
            value={patientNotes}
            onChange={(e) => setPatientNotes(e.target.value)}
            placeholder="e.g. Emergency surgery patient undergoing trauma stabilization."
          />
          <span className="form-hint">
            Do not enter patient names or confidential medical records.
          </span>
        </div>

        {/* AI Triage Preview */}
        <AiTriageAdvisor
          bloodGroup={bloodGroup}
          units={unitsRequired}
          urgency={urgency}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            <PlusCircle size={16} />
            {loading ? 'Publishing Request...' : 'Publish & Broadcast Request'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateRequestModal;
