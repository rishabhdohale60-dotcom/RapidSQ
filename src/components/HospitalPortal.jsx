import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Hospital, Bed, Activity, CheckCircle2, Siren, Phone, ShieldAlert, HeartPulse, Clock, History } from 'lucide-react';

export const HospitalPortal = () => {
  const { activeEmergency, entities, completedIncidentsHistory } = useApp();

  const currentHospital = entities.hospitals[0] || {
    id: 'HOSP-GOVT-01',
    name: 'Sassoon Government General Hospital & Trauma Center',
    type: 'Government',
    icuBeds: 45,
    emergencyBeds: 25,
    capability: 'Level-1 Trauma Center & 24x7 Emergency ICU'
  };

  const [reservedBeds, setReservedBeds] = useState(false);

  const hospitalHistory = completedIncidentsHistory ? completedIncidentsHistory.filter(h => ['Medical', 'Accident', 'Cardiac', 'Stroke', 'Child Emergency', 'Blood Emergency'].includes(h.type) || h.responderId === 'ALL') : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Hospital Identity Header Card */}
      <div className="card" style={{ borderLeft: '5px solid var(--bright-blue)', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span className="badge badge-info" style={{ fontSize: '10px' }}>
            🏥 REGISTERED EMERGENCY HOSPITAL
          </span>
          <span className="badge badge-success" style={{ fontSize: '10px' }}>
            ✓ VERIFIED & ACTIVE
          </span>
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--royal-blue-dark)', marginBottom: '2px' }}>
          {currentHospital.name}
        </h2>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {currentHospital.type} Hospital · ID: <strong>{currentHospital.id}</strong>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px', background: 'var(--light-blue-bg)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '12px' }}>
          <div>Available ICU Beds: <strong style={{ color: 'var(--bright-blue)' }}>{currentHospital.icuBeds}</strong></div>
          <div>Emergency Beds: <strong style={{ color: 'var(--success-green)' }}>{currentHospital.emergencyBeds}</strong></div>
        </div>
      </div>

      {/* INCOMING EMERGENCY INCIDENT DASHBOARD */}
      {activeEmergency && activeEmergency.recommendedHospital ? (
        <div className="card" style={{ border: '2px solid var(--bright-blue)', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="badge badge-warning" style={{ fontSize: '10px' }}>
              🚨 INCOMING INBOUND AMBULANCE INCIDENT
            </span>
            <span style={{ fontSize: '12px', fontWeight: '900', color: 'var(--bright-blue)' }}>{activeEmergency.incidentId}</span>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--royal-blue-dark)', marginBottom: '4px' }}>
            {activeEmergency.icon} {activeEmergency.type} Emergency
          </h3>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Inbound Ambulance ETA: <strong style={{ color: 'var(--success-green)', fontSize: '14px' }}>{activeEmergency.etaMinutes || 4} mins</strong>
          </div>

          <div style={{ background: 'var(--light-blue-bg)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
            <div>Patient: <strong>{activeEmergency.patient.fullName}</strong></div>
            <div>Contact: <strong>{activeEmergency.patient.mobile}</strong></div>
            <div>Assigned Unit: <strong>{activeEmergency.assignedResponder?.fullName || 'RapidSQ Ambulance Unit'}</strong></div>
            <div>Required Support: <strong>ICU Bed Reservation & Emergency Trauma Team</strong></div>
            <div>Incident Status: <strong style={{ color: 'var(--bright-blue)' }}>{activeEmergency.status}</strong></div>
          </div>

          {reservedBeds ? (
            <div style={{ background: 'var(--success-green-light)', color: 'var(--success-green)', padding: '12px', borderRadius: '10px', fontWeight: '900', textAlign: 'center', fontSize: '13px' }}>
              ✓ ICU & EMERGENCY BED CONFIRMED RESERVED FOR INCIDENT {activeEmergency.incidentId}
            </div>
          ) : (
            <button 
              className="btn-navy-primary" 
              style={{ width: '100%', padding: '12px', fontSize: '13px', background: 'var(--success-green)' }}
              onClick={() => setReservedBeds(true)}
            >
              <CheckCircle2 size={16} /> CONFIRM ICU & EMERGENCY BED RESERVED
            </button>
          )}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', background: '#FFFFFF' }}>
          <Hospital size={32} color="var(--royal-blue-dark)" style={{ opacity: 0.3, marginBottom: '8px' }} />
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--royal-blue-dark)' }}>Standing By for Emergency Admissions</h3>
          <p style={{ fontSize: '12px' }}>When an ambulance is dispatched with a critical patient, the emergency alert will appear here in real-time.</p>
        </div>
      )}

      {/* 📋 HOSPITAL EMERGENCY ADMISSIONS HISTORY */}
      <div className="card" style={{ background: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <History size={16} color="var(--bright-blue)" />
            <h3 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--royal-blue-dark)' }}>
              Hospital Emergency Admissions History
            </h3>
          </div>
          <span className="badge badge-info" style={{ fontSize: '10px' }}>
            {hospitalHistory.length} Total Admissions
          </span>
        </div>

        {hospitalHistory.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {hospitalHistory.map((item, idx) => (
              <div 
                key={idx} 
                style={{
                  background: 'var(--light-blue-bg)',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '900', color: 'var(--royal-blue-dark)' }}>
                    {item.icon} {item.type} Emergency Admission
                  </span>
                  <span className="badge badge-success" style={{ fontSize: '9px' }}>
                    ✓ {item.status}
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--bright-blue)', fontWeight: '800' }}>
                  Incident ID: {item.incidentId} · {item.completedAt}
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Admitted Patient: <strong>{item.patientName}</strong> ({item.patientMobile})
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  📍 Pickup Location: <strong>{item.locationAddress}</strong>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '12px' }}>
            No emergency admission logs recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};
