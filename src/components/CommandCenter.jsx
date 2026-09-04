import React from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Hospital, Siren, Flame, Activity, MapPin, Radio, Users, Truck, CheckCircle2, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const createCustomIcon = (emoji, color) => {
  return L.divIcon({
    html: `<div style="background:${color}; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; color:white; border:2px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.25);">${emoji}</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const userIcon = createCustomIcon('👤', '#1E40AF');
const ambIcon = createCustomIcon('🚑', '#EF4444');
const polIcon = createCustomIcon('👮', '#1D4ED8');
const fireIcon = createCustomIcon('🔥', '#D97706');
const hospIcon = createCustomIcon('🏥', '#059669');

export const CommandCenter = () => {
  const { activeEmergency, entities, user } = useApp();

  const activeIncidents = activeEmergency ? [activeEmergency] : [];
  const ambulanceUnits = entities.responders.filter(r => r.serviceType === 'Ambulance');
  const policeUnits = entities.responders.filter(r => r.serviceType === 'Police');
  const fireUnits = entities.responders.filter(r => r.serviceType === 'Fire');
  const registeredHospitals = entities.hospitals || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* High-level Operational Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
        <div className="card" style={{ padding: '12px', textAlign: 'center', background: '#FFFFFF' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800' }}>ACTIVE INCIDENTS</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: activeEmergency ? 'var(--emergency-red)' : 'var(--success-green)' }}>
            {activeIncidents.length}
          </div>
        </div>

        <div className="card" style={{ padding: '12px', textAlign: 'center', background: '#FFFFFF' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800' }}>AMBULANCES</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--bright-blue)' }}>
            {ambulanceUnits.length} Units
          </div>
        </div>

        <div className="card" style={{ padding: '12px', textAlign: 'center', background: '#FFFFFF' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800' }}>POLICE PATROL</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--royal-blue-dark)' }}>
            {policeUnits.length} Units
          </div>
        </div>

        <div className="card" style={{ padding: '12px', textAlign: 'center', background: '#FFFFFF' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800' }}>HOSPITALS</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--success-green)' }}>
            {registeredHospitals.length} Linked
          </div>
        </div>
      </div>

      {/* OPERATIONAL MAP OVERVIEW */}
      <div className="card" style={{ padding: '6px', background: '#FFFFFF' }}>
        <div style={{ padding: '8px 12px', fontSize: '12px', fontWeight: '900', color: 'var(--royal-blue-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🗺️ RAPIDSQ LIVE CITY OPERATIONS MAP</span>
          <span className="badge badge-success" style={{ fontSize: '9px' }}>🟢 REAL-TIME SYNC</span>
        </div>

        <div style={{ height: '260px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
          <MapContainer center={[18.5204, 73.8567]} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Active Emergency Marker */}
            {activeEmergency && (
              <Marker position={[activeEmergency.userLocation.lat, activeEmergency.userLocation.lng]} icon={userIcon}>
                <Popup>
                  <strong>🚨 Emergency Incident {activeEmergency.incidentId}</strong><br />
                  Type: {activeEmergency.type}<br />
                  Patient: {activeEmergency.patient.fullName}
                </Popup>
              </Marker>
            )}

            {/* Responder Markers */}
            {entities.responders.map(r => (
              <Marker 
                key={r.id} 
                position={[r.latitude || 18.5204, r.longitude || 73.8567]} 
                icon={r.serviceType === 'Police' ? polIcon : r.serviceType === 'Fire' ? fireIcon : ambIcon}
              >
                <Popup>
                  <strong>{r.fullName}</strong> ({r.serviceType})<br />
                  Status: {r.isActiveDuty ? '🟢 Active' : '⚪ Inactive'}
                </Popup>
              </Marker>
            ))}

            {/* Hospital Markers */}
            {registeredHospitals.map(h => (
              <Marker key={h.id} position={[h.latitude || 18.5285, h.longitude || 73.8732]} icon={hospIcon}>
                <Popup>
                  <strong>🏥 {h.name}</strong><br />
                  ICU Beds: {h.icuBeds} Free
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Active Incident Live Dispatch View */}
      {activeEmergency ? (
        <div className="card" style={{ border: '2px solid var(--emergency-red)', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="badge badge-danger">🎛️ COMMAND CENTER LIVE MONITOR</span>
            <span style={{ fontSize: '12px', fontWeight: '900', color: 'var(--bright-blue)' }}>ID: {activeEmergency.incidentId}</span>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--royal-blue-dark)', marginBottom: '8px' }}>
            {activeEmergency.icon} {activeEmergency.type} Emergency
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', background: 'var(--light-blue-bg)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div>Patient: <strong>{activeEmergency.patient.fullName}</strong></div>
            <div>Status: <strong style={{ color: 'var(--emergency-red)' }}>{activeEmergency.status}</strong></div>
            <div>ETA: <strong style={{ color: 'var(--success-green)' }}>~{activeEmergency.etaMinutes || 4} mins</strong></div>
            <div>Assigned Category: <strong>{activeEmergency.requiredCategory}</strong></div>
            <div>Assigned Responder: <strong>{activeEmergency.assignedResponder ? activeEmergency.assignedResponder.fullName : 'Searching...'}</strong></div>
            <div>Recommended Hospital: <strong>{activeEmergency.recommendedHospital ? activeEmergency.recommendedHospital.name : 'N/A'}</strong></div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', background: '#FFFFFF' }}>
          <Radio size={32} color="var(--bright-blue)" style={{ opacity: 0.6, marginBottom: '8px' }} />
          <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--royal-blue-dark)' }}>All Dispatch Channels Operating Normally</div>
          <div style={{ fontSize: '12px' }}>No critical emergency incidents currently active.</div>
        </div>
      )}

      {/* Linked Hospitals & Fleet Overview */}
      <div className="card" style={{ background: '#FFFFFF' }}>
        <h3 className="card-title" style={{ fontSize: '14px', color: 'var(--royal-blue-dark)' }}>🏥 Registered Hospitals Directory</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {registeredHospitals.map(h => (
            <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--light-blue-bg)', padding: '10px 12px', borderRadius: '10px', fontSize: '12px', border: '1px solid var(--border-color)' }}>
              <div>
                <strong style={{ color: 'var(--royal-blue-dark)' }}>{h.name}</strong> ({h.type})
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{h.capability}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-success">ICU: {h.icuBeds} Free</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
