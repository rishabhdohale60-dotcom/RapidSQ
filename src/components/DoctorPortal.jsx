import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Stethoscope, PhoneCall, CheckCircle, FileText, User } from 'lucide-react';

export const DoctorPortal = () => {
  const { activeEmergency, updateEmergencyStatus, entities } = useApp();
  const [calling, setCalling] = useState(false);
  const [markedReady, setMarkedReady] = useState(false);
  const [showCaseModal, setShowCaseModal] = useState(false);

  const assignedDoc = entities.doctors[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="card" style={{ borderLeft: '4px solid var(--success-green)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'var(--success-green-light)', color: 'var(--success-green)', padding: '10px', borderRadius: '50%' }}>
            <Stethoscope size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800' }}>{assignedDoc.name}</h2>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{assignedDoc.department} · {assignedDoc.hospital}</div>
          </div>
        </div>
      </div>

      {!activeEmergency ? (
        <div className="card" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
          <Stethoscope size={36} style={{ opacity: 0.3, marginBottom: '10px' }} />
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary)' }}>No Assigned Active Cases</h3>
          <p style={{ fontSize: '12px' }}>You will receive real-time notifications when a patient case is assigned to you.</p>
        </div>
      ) : (
        <div className="card" style={{ border: '2px solid var(--accent-blue)', background: 'var(--accent-blue-light)' }}>
          <span className="badge badge-info" style={{ marginBottom: '10px' }}>🚨 INCOMING EMERGENCY CASE</span>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px' }}>
            {activeEmergency.icon} {activeEmergency.type} Emergency
          </h3>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Incident ID: <strong>{activeEmergency.incidentId}</strong>
          </div>

          <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '14px', fontSize: '12px' }}>
            <div>Patient Name: <strong>{activeEmergency.patient.fullName}</strong></div>
            <div>Blood Group: <strong style={{ color: 'var(--danger-red)' }}>{activeEmergency.patient.bloodGroup}</strong></div>
            <div>Allergies/Conditions: <strong>{activeEmergency.patient.allergies || 'None'}</strong></div>
            <div>Ambulance ETA: <strong style={{ color: 'var(--success-green)' }}>~{activeEmergency.etaMinutes} mins</strong></div>
            <div>Hospital: <strong>{activeEmergency.assignedHospital.name}</strong></div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              className="btn-primary"
              style={{ flex: 1, minWidth: '110px' }}
              onClick={() => setShowCaseModal(true)}
            >
              <FileText size={14} /> View Case
            </button>

            <button 
              className="btn-primary btn-outline"
              style={{ flex: 1, minWidth: '110px' }}
              onClick={() => {
                setCalling(true);
                setTimeout(() => setCalling(false), 3000);
              }}
            >
              <PhoneCall size={14} /> {calling ? 'Calling Paramedic...' : 'Simulate Call'}
            </button>

            <button 
              className="btn-primary"
              style={{ flex: 1, minWidth: '110px', background: markedReady ? 'var(--success-green)' : 'var(--primary)' }}
              onClick={() => {
                setMarkedReady(true);
                updateEmergencyStatus('Doctor Ready in ER');
              }}
            >
              <CheckCircle size={14} /> {markedReady ? '✓ Doctor Ready' : 'Mark Ready'}
            </button>
          </div>
        </div>
      )}

      {/* View Case Modal */}
      {showCaseModal && activeEmergency && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '10px' }}>📋 Patient Clinical Summary</h3>
            <div style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--primary)', marginBottom: '16px' }}>
              <p><strong>Patient:</strong> {activeEmergency.patient.fullName} (Aadhaar Verified)</p>
              <p><strong>DOB:</strong> {activeEmergency.patient.dob}</p>
              <p><strong>Blood Group:</strong> {activeEmergency.patient.bloodGroup}</p>
              <p><strong>Known Allergies:</strong> {activeEmergency.patient.allergies}</p>
              <p><strong>Emergency Contact:</strong> {activeEmergency.patient.emergencyContact}</p>
              <p><strong>Selected Emergency:</strong> {activeEmergency.type}</p>
              <p><strong>Assigned Unit:</strong> {activeEmergency.assignedResponder.name}</p>
            </div>
            <button className="btn-primary" onClick={() => setShowCaseModal(false)}>Close Summary</button>
          </div>
        </div>
      )}
    </div>
  );
};
