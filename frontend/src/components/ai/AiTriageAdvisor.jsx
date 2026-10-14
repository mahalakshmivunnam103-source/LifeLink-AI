import React, { useState } from 'react';
import { Sparkles, AlertTriangle, PhoneCall, Copy, Check } from 'lucide-react';
import api from '../../api/axiosClient';

export const AiTriageAdvisor = ({ bloodGroup = 'O-', units = 1, urgency = 'High' }) => {
  const [triageData, setTriageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const runAiTriage = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ai/triage', {
        bloodGroup,
        unitsRequired: units,
        urgency,
      });
      if (res.success) {
        setTriageData(res.data);
      }
    } catch (err) {
      console.error('AI Triage error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyScript = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #0b1a30 0%, #162b48 100%)',
        color: '#fff',
        borderRadius: '12px',
        padding: '1.25rem',
        border: '1px solid #234268',
        boxShadow: '0 4px 14px rgba(11, 26, 48, 0.4)',
        marginTop: '1.25rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
              borderRadius: '8px',
              padding: '6px',
              display: 'flex',
            }}
          >
            <Sparkles size={18} color="#fff" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
              AI Clinical Triage Advisor
            </h4>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Real-time Urgency Scoring & Outreach Intelligence
            </div>
          </div>
        </div>

        <button
          onClick={runAiTriage}
          disabled={loading}
          className="btn btn-primary btn-sm"
          style={{ fontSize: '0.82rem' }}
        >
          {loading ? 'Evaluating...' : triageData ? 'Re-Analyze' : 'Analyze Clinical Urgency'}
        </button>
      </div>

      {triageData ? (
        <div>
          {/* Urgency Score & Scarcity Indicator */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 12,
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '10px 14px',
                borderRadius: '8px',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Urgency Index</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171' }}>
                {triageData.urgencyScore} / 100
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '10px 14px',
                borderRadius: '8px',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Blood Scarcity</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8' }}>
                {triageData.scarcityFactor}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '10px 14px',
                borderRadius: '8px',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Outreach Batch</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#4ade80' }}>
                Top {triageData.recommendedOutreachBatch} Donors
              </div>
            </div>
          </div>

          {/* Action Recommendation */}
          <div
            style={{
              background: 'rgba(220, 38, 38, 0.15)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Recommended Clinical Protocol: </strong>
              {triageData.suggestedAction}
            </div>
          </div>

          {/* Sample Donor Outreach Script */}
          {triageData.sampleDonorScript && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <PhoneCall size={14} /> Emergency Outreach Script
                </span>
                <button
                  onClick={() => copyScript(triageData.sampleDonorScript)}
                  className="btn btn-sm"
                  style={{
                    background: 'none',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    padding: '2px 8px',
                    fontSize: '0.74rem',
                  }}
                >
                  {copied ? (
                    <>
                      <Check size={12} color="#4ade80" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={12} /> Copy Script
                    </>
                  )}
                </button>
              </div>
              <p
                style={{
                  fontSize: '0.82rem',
                  color: '#94a3b8',
                  lineHeight: 1.5,
                  margin: 0,
                  fontStyle: 'italic',
                }}
              >
                "{triageData.sampleDonorScript}"
              </p>
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
          Click <strong>Analyze Clinical Urgency</strong> to evaluate population scarcity for{' '}
          <span style={{ color: '#f87171', fontWeight: 700 }}>{bloodGroup}</span>, compute match
          risk score, and generate standardized emergency outreach instructions.
        </div>
      )}
    </div>
  );
};

export default AiTriageAdvisor;
