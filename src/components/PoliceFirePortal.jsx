import React from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Flame, CheckCircle, AlertCircle, History } from 'lucide-react';

export const PoliceFirePortal = () => {
  const { activeEmergency, updateEmergencyStatus, completedIncidentsHistory, entities } = useApp();

  const policeUnit = entities.responders.find(r => r.serviceType === 'Police') || { fullName: 'Shivajinagar Police Station', id: 'RESP-POL-101' };
  const fireUnit = entities.responders.find(r => r.serviceType === 'Fire') || { fullName: 'Central Fire Station Unit-01', id: 'RESP-FIRE-101' };

  const isRelevantEmergency = activeEmergency && (
    activeEmergency.requiredCategory === 'Police' ||
    activeEmergency.requiredCategory === 'Fire' ||
    ['Women Safety', 'Fire', 'Accident', 'Police', 'SOS', 'Disaster'].includes(activeEmergency.type)
  );

  const policeFireHistory = completedIncidentsHistory ? completedIncidentsHistory.filter(h => ['Police', 'Fire', 'Women Safety', 'Accident', 'Disaster', 'SOS'].includes(h.type) || h.responderId === 'ALL') : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--royal-blue-dark)', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} color="var(--royal-blue-dark)" />
            <h3 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--royal-blue-dark)' }}>Police Control</h3>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Unit: <strong>{policeUnit.fullName}</strong></div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--emergency-red)', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={20} color="var(--emergency-red)" />
            <h3 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--royal-blue-dark)' }}>Fire Service</h3>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Unit: <strong>{fireUnit.fullName}</strong></div>
        </div>
      </div>

      {!isRelevantEmergency ? (
        <div className="card" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', background: '#FFFFFF' }}>
          <Shield size={32} color="var(--royal-blue-dark)" style={{ opacity: 0.3, marginBottom: '8px' }} />
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--royal-blue-dark)' }}>No Police / Fire Emergencies Active</h3>
          <p style={{ fontSize: '12px' }}>Only relevant incidents (Women Safety, Fire, Accidents, Police Calls) appear here.</p>
        </div>
      ) : (
        <div className="card" style={{ border: '2px solid var(--bright-blue)', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="badge badge-info">🚨 POLICE / FIRE DISPATCH INCIDENT</span>
            <span style={{ fontSize: '12px', fontWeight: '900', color: 'var(--bright-blue)' }}>{activeEmergency.incidentId}</span>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--royal-blue-dark)', marginBottom: '4px' }}>
            {activeEmergency.icon} {activeEmergency.type} Emergency
          </h3>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Location: <strong>{activeEmergency.userLocation.address}</strong>
          </div>

          <div style={{ background: 'var(--light-blue-bg)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '14px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div>Required Category: <strong>{activeEmergency.requiredCategory}</strong></div>
            <div>Patient/Caller: <strong>{activeEmergency.patient.fullName}</strong></div>
            <div>Mobile: <strong>{activeEmergency.patient.mobile}</strong></div>
            <div>Status: <strong style={{ color: 'var(--bright-blue)' }}>{activeEmergency.status}</strong></div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn-navy-primary"
              style={{ flex: 1, padding: '12px', fontSize: '13px' }}
              onClick={() => updateEmergencyStatus('Police/Fire Patrol Dispatched')}
            >
              <CheckCircle size={16} /> Dispatch Patrol
            </button>
            <button 
              className="btn-navy-primary"
              style={{ flex: 1, padding: '12px', fontSize: '13px', background: 'var(--royal-blue-dark)' }}
              onClick={() => updateEmergencyStatus('COMPLETED')}
            >
              🏁 Complete Incident
            </button>
          </div>
        </div>
      )}

      {/* 📋 POLICE & FIRE EMERGENCY SERVICE HISTORY LOGS */}
      <div className="card" style={{ background: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <History size={16} color="var(--bright-blue)" />
            <h3 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--royal-blue-dark)' }}>
              Police & Fire Emergency History
            </h3>
          </div>
          <span className="badge badge-info" style={{ fontSize: '10px' }}>
            {policeFireHistory.length} Total Incidents
          </span>
        </div>

        {policeFireHistory.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {policeFireHistory.map((item, idx) => (
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
                    {item.icon} {item.type} Emergency
                  </span>
                  <span className="badge badge-success" style={{ fontSize: '9px' }}>
                    ✓ {item.status}
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--bright-blue)', fontWeight: '800' }}>
                  Incident ID: {item.incidentId} · {item.completedAt}
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Caller: <strong>{item.patientName}</strong> ({item.patientMobile})
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  📍 Location: <strong>{item.locationAddress}</strong>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '12px' }}>
            No past police or fire emergency logs recorded.
          </div>
        )}
      </div>
    </div>
  );
};
