import React, { useState, useEffect } from 'react';
import { useApp, playSirenSound, playDriverLoudEmergencyAlarm, calculateDistanceKm } from '../context/AppContext';
import { Siren, MapPin, Volume2, XCircle, LogOut, CheckCircle2, User, Phone, Shield, Edit2, Save, AlertTriangle, Navigation, CheckSquare, Truck, History, Clock, Home as HomeIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

const patientIcon = L.divIcon({
  html: `<div style="background:#EF4444; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; color:white; border:3px solid white; box-shadow:0 4px 12px rgba(239,68,68,0.4);">👤</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

const vehicleIcon = L.divIcon({
  html: `<div style="background:#1E40AF; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; color:white; border:3px solid white; box-shadow:0 4px 12px rgba(30,64,175,0.4);">🚑</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

export const ResponderPortal = () => {
  const { activeResponderAccount, logoutResponder, updateResponderProfile, toggleResponderDuty, activeEmergency, completedIncidentsHistory, acceptEmergencyByResponder, declineEmergencyByResponder, updateEmergencyStatus, updateResponderLiveLocation, entities, setCurrentRole } = useApp();

  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'profile' | 'history'

  const [selectedResponderId, setSelectedResponderId] = useState(() => {
    return activeResponderAccount?.id || (entities.responders[0]?.id || '');
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    mobile: '',
    street_address: '',
    city: '',
    pincode: ''
  });

  useEffect(() => {
    if (activeResponderAccount && activeResponderAccount.id) {
      setSelectedResponderId(activeResponderAccount.id);
    }
  }, [activeResponderAccount]);

  const currentResponder = entities.responders.find(r => r.id === selectedResponderId) || activeResponderAccount || entities.responders[0];

  // Auto-play loud siren alarm sound repeatedly every 5s whenever a new patient emergency call arrives
  useEffect(() => {
    if (activeEmergency && currentResponder) {
      const isTargeted = (activeEmergency.requiredCategory === currentResponder.serviceType || (activeEmergency.requiredCategories && activeEmergency.requiredCategories.includes(currentResponder.serviceType)));
      const isAssigned = (activeEmergency.assignedResponderId === currentResponder.id);
      const isDeclined = (activeEmergency.declinedResponderIds || []).includes(currentResponder.id);
      
      if (isTargeted && currentResponder.isActiveDuty && !isDeclined && !isAssigned) {
        playDriverLoudEmergencyAlarm();

        // Continuously ring loud siren alarm every 5 seconds until driver responds
        const sirenInterval = setInterval(() => {
          playDriverLoudEmergencyAlarm();
        }, 5000);

        return () => clearInterval(sirenInterval);
      }
    }
  }, [activeEmergency, currentResponder]);

  useEffect(() => {
    if (currentResponder) {
      setEditForm({
        fullName: currentResponder.fullName || '',
        mobile: currentResponder.mobile || '',
        street_address: currentResponder.street_address || '',
        city: currentResponder.city || '',
        pincode: currentResponder.pincode || ''
      });
    }
  }, [currentResponder]);

  if (!currentResponder && entities.responders.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '36px 20px', background: '#FFFFFF' }}>
        <Siren size={44} color="var(--emergency-red)" style={{ opacity: 0.8, marginBottom: '14px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--royal-blue-dark)', marginBottom: '6px' }}>
          No Registered Responder Profiles
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', maxWidth: '320px', margin: '0 auto 20px' }}>
          Please select your Emergency Service category and register your profile.
        </p>
        <button className="btn-navy-primary" style={{ maxWidth: '280px', margin: '0 auto' }} onClick={() => setCurrentRole('user')}>
          + Register Responder Profile
        </button>
      </div>
    );
  }

  const isAmbulance = currentResponder?.serviceType === 'Ambulance';
  const isPolice = currentResponder?.serviceType === 'Police';
  const isHospital = currentResponder?.serviceType === 'Hospital';
  const isDoctor = currentResponder?.serviceType === 'Doctor';
  const isFire = currentResponder?.serviceType === 'Fire';

  const isAssignedToMe = activeEmergency && (activeEmergency.assignedResponderId === currentResponder?.id || activeEmergency.assignedResponder?.id === currentResponder?.id);
  const hasAlreadyDeclined = activeEmergency && activeEmergency.declinedResponderIds?.includes(currentResponder?.id);
  const isTargetedForCategory = activeEmergency && activeEmergency.requiredCategory === currentResponder?.serviceType;

  // Filter completed emergency history for this specific responder
  const myCompletedHistory = completedIncidentsHistory ? completedIncidentsHistory.filter(h => h.responderId === currentResponder?.id || h.responderId === 'ALL') : [];

  const patientDistanceKm = activeEmergency && currentResponder
    ? calculateDistanceKm(
        currentResponder.latitude || 21.1255,
        currentResponder.longitude || 79.0522,
        activeEmergency.userLocation.lat,
        activeEmergency.userLocation.lng
      )
    : 1.5;

  const handleAcceptEmergency = () => {
    if (currentResponder) {
      const res = acceptEmergencyByResponder(currentResponder.id);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  const handleDeclineEmergency = () => {
    if (currentResponder) {
      declineEmergencyByResponder(currentResponder.id);
    }
  };

  const handleStartJourney = () => {
    updateEmergencyStatus('EN ROUTE');
  };

  const handleMarkArrived = () => {
    updateEmergencyStatus('ARRIVED');
  };

  const handleCompleteIncident = () => {
    updateEmergencyStatus('COMPLETED');
  };

  const handleSaveEditProfile = (e) => {
    e.preventDefault();
    updateResponderProfile(currentResponder.id, editForm);
    setIsEditing(false);
    alert('✅ Profile updated successfully!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
      {/* Top Mobile Header */}
      <div className="card" style={{ padding: '12px 14px', background: '#FFFFFF', borderLeft: `5px solid var(--bright-blue)` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '10px', fontWeight: '900', color: 'var(--bright-blue)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              {currentResponder?.serviceType?.toUpperCase()} WORKER PORTAL
            </span>
            <div style={{ fontSize: '15px', fontWeight: '900', color: 'var(--royal-blue-dark)', lineHeight: '1.2' }}>
              {currentResponder?.fullName}
            </div>
          </div>

          <button 
            className={`btn-primary ${currentResponder?.isActiveDuty ? '' : 'btn-danger'}`}
            style={{ padding: '6px 12px', fontSize: '11px', width: 'auto' }}
            onClick={() => toggleResponderDuty(currentResponder.id)}
          >
            {currentResponder?.isActiveDuty ? '🟢 ACTIVE' : '⚪ INACTIVE'}
          </button>
        </div>
      </div>

      {/* 🏠 TAB 1: HOME (DASHBOARD) */}
      {activeTab === 'home' && (
        <>
          {/* STEP 4 - RESPONDER LIVE NAVIGATION & JOURNEY SCREEN (AFTER ACCEPT) */}
          {activeEmergency && isAssignedToMe && (
            <div className="card" style={{ borderLeft: '5px solid var(--success-green)', background: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-success" style={{ fontSize: '11px' }}>
                  ✓ ACTIVE INCIDENT ACCEPTED — EN ROUTE
                </span>
                <span style={{ fontSize: '12px', fontWeight: '900', color: 'var(--royal-blue-dark)' }}>{activeEmergency.incidentId}</span>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--royal-blue-dark)', marginBottom: '4px' }}>
                {activeEmergency.icon} {activeEmergency.type} Emergency
              </h3>

              <div style={{ fontSize: '13px', color: 'var(--royal-blue-dark)', background: 'var(--light-blue-bg)', padding: '10px 12px', borderRadius: '10px', marginBottom: '10px', border: '1px solid var(--border-color)' }}>
                <div>📍 <strong>Patient Location:</strong> {activeEmergency.userLocation.address}</div>
                <div>👤 <strong>Patient Name:</strong> {activeEmergency.patient.fullName}</div>
                <div>📞 <strong>Contact Phone:</strong> {activeEmergency.patient.mobile}</div>
              </div>

              {/* Interactive Navigation Map */}
              <div style={{ height: '180px', width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px', border: '1px solid var(--border-color)' }}>
                <MapContainer 
                  center={[activeEmergency.userLocation.lat, activeEmergency.userLocation.lng]} 
                  zoom={13} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[activeEmergency.userLocation.lat, activeEmergency.userLocation.lng]} icon={patientIcon}>
                    <Popup>Patient Location</Popup>
                  </Marker>
                  <Marker position={[currentResponder.latitude || 21.1255, currentResponder.longitude || 79.0522]} icon={vehicleIcon}>
                    <Popup>Your Unit</Popup>
                  </Marker>
                  <Polyline 
                    positions={[
                      [currentResponder.latitude || 21.1255, currentResponder.longitude || 79.0522],
                      [activeEmergency.userLocation.lat, activeEmergency.userLocation.lng]
                    ]}
                    color="#1E40AF"
                    dashArray="6,6"
                  />
                </MapContainer>
              </div>

              {/* ZERO-FRICTION DRIVER NAVIGATION CONTROLS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${activeEmergency.userLocation.lat},${activeEmergency.userLocation.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-navy-primary" 
                  style={{ padding: '12px', fontSize: '13px', textDecoration: 'none', background: 'var(--bright-blue)' }}
                >
                  <Navigation size={16} /> 🗺️ START TURN-BY-TURN GOOGLE MAPS NAVIGATION
                </a>

                <a 
                  href={`tel:${activeEmergency.patient.mobile || '9876543210'}`}
                  className="btn-outline-card" 
                  style={{ padding: '10px', fontSize: '12px', textDecoration: 'none' }}
                >
                  <Phone size={14} /> 📞 CALL PATIENT ({activeEmergency.patient.mobile})
                </a>

                {activeEmergency.status === 'ACCEPTED' && (
                  <button className="btn-navy-primary" style={{ padding: '12px', fontSize: '13px' }} onClick={handleStartJourney}>
                    ⚡ START JOURNEY (EN ROUTE TO PATIENT)
                  </button>
                )}

                {(activeEmergency.status === 'EN ROUTE' || activeEmergency.status === 'ARRIVING SOON') && (
                  <button className="btn-navy-primary" style={{ padding: '12px', fontSize: '13px', background: 'var(--success-green)' }} onClick={handleMarkArrived}>
                    📍 MARK ARRIVED AT PATIENT LOCATION
                  </button>
                )}

                {activeEmergency.status === 'ARRIVED' && (
                  <button className="btn-navy-primary" style={{ padding: '12px', fontSize: '13px', background: 'var(--royal-blue-dark)' }} onClick={handleCompleteIncident}>
                    🏁 COMPLETE INCIDENT & CLEAR FLEET
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3 INCOMING UNACCEPTED EMERGENCY ALERT CARD WITH LOUD SIREN ALARM */}
          {activeEmergency && isTargetedForCategory && currentResponder.isActiveDuty && !hasAlreadyDeclined && !isAssignedToMe && (
            <div className="card" style={{ border: '3px solid var(--emergency-red)', background: 'var(--emergency-red-light)', animation: 'pulse 1.5s infinite' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '6px 12px' }}>
                  <Volume2 size={16} /> 🔊 HIGH-PRIORITY PATIENT CALL ALARM
                </span>
                <span style={{ fontSize: '12px', fontWeight: '900', color: 'var(--emergency-red)' }}>{activeEmergency.incidentId}</span>
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--royal-blue-dark)', marginBottom: '4px' }}>
                {activeEmergency.icon} {activeEmergency.type} Emergency Call
              </h2>

              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--bright-blue)', marginBottom: '6px' }}>
                📍 Patient GPS: {activeEmergency.userLocation.address}
              </div>

              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--success-green)', marginBottom: '12px' }}>
                Distance to Patient: <strong>{patientDistanceKm} km away</strong>
              </div>

              <button 
                type="button"
                className="btn-navy-primary"
                style={{ background: 'var(--royal-blue-dark)', width: '100%', marginBottom: '12px', padding: '10px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={() => playDriverLoudEmergencyAlarm()}
              >
                🔊 REPLAY LOUD PATIENT ALARM SIREN
              </button>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button 
                  className="btn-navy-primary" 
                  style={{ flex: 2, background: 'var(--success-green)', fontSize: '14px', padding: '14px' }}
                  onClick={handleAcceptEmergency}
                >
                  🟢 ACCEPT EMERGENCY
                </button>

                <button 
                  className="btn-danger" 
                  style={{ flex: 1, fontSize: '13px', padding: '14px' }}
                  onClick={handleDeclineEmergency}
                >
                  🔴 DECLINE
                </button>
              </div>
            </div>
          )}

          {/* OFF DUTY NOTICE */}
          {!currentResponder.isActiveDuty && (
            <div style={{ background: 'var(--emergency-red-light)', border: '1px solid var(--emergency-red)', padding: '12px 16px', borderRadius: '10px', fontSize: '12px', color: 'var(--emergency-red)', fontWeight: '700' }}>
              ⚪ INACTIVE (OFF DUTY): Emergency notifications are paused. Switch to ACTIVE to receive incoming requests.
            </div>
          )}

          {/* DASHBOARD QUICK METRICS CARD */}
          <div className="card" style={{ background: '#FFFFFF' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--royal-blue-dark)', marginBottom: '10px' }}>
              ⚡ Operational Status Dashboard
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: 'var(--light-blue-bg)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--bright-blue)' }}>
                  {myCompletedHistory.length}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700' }}>Incidents Responded</div>
              </div>

              <div style={{ background: 'var(--light-blue-bg)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--success-green)' }}>
                  100%
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700' }}>Verification Score</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 👤 TAB 2: PROFILE */}
      {activeTab === 'profile' && (
        <div className="card" style={{ background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--royal-blue-dark)' }}>
              👤 Responder Saved Profile
            </h3>
            <button 
              className="btn-outline" 
              style={{ width: 'auto', padding: '4px 10px', fontSize: '11px' }}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--light-blue-bg)',
              border: '2px solid var(--bright-blue)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <img 
                src={currentResponder.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentResponder.fullName)}`} 
                alt="Profile Avatar" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--royal-blue-dark)' }}>
                {currentResponder.fullName}
              </div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--bright-blue)' }}>
                {currentResponder.serviceType} Emergency Unit
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                ID: <strong>{currentResponder.id}</strong>
              </div>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveEditProfile} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={editForm.fullName} onChange={e => setEditForm(prev => ({ ...prev, fullName: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input className="form-input" value={editForm.mobile} onChange={e => setEditForm(prev => ({ ...prev, mobile: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input className="form-input" value={editForm.street_address} onChange={e => setEditForm(prev => ({ ...prev, street_address: e.target.value }))} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" value={editForm.city} onChange={e => setEditForm(prev => ({ ...prev, city: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input className="form-input" value={editForm.pincode} onChange={e => setEditForm(prev => ({ ...prev, pincode: e.target.value }))} required />
                </div>
              </div>
              <button type="submit" className="btn-navy-primary" style={{ marginTop: '6px' }}>Save Changes</button>
            </form>
          ) : (
            <div style={{ background: 'var(--light-blue-bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>Service Category: <strong>{currentResponder.serviceType}</strong></div>
              <div>Mobile Number: <strong>{currentResponder.mobile}</strong></div>
              <div>Reg / License / Badge ID: <strong>{currentResponder.regLicenseNumber || currentResponder.licenseNumber || 'MH-REG-2026'}</strong></div>
              {currentResponder.vehicleNumber && <div>Vehicle No: <strong>{currentResponder.vehicleNumber}</strong></div>}
              {currentResponder.policeStation && <div>Police Station: <strong>{currentResponder.policeStation}</strong></div>}
              {currentResponder.orgName && <div>Organization / Hospital: <strong>{currentResponder.orgName}</strong></div>}
              <div>Base Address: <strong>{currentResponder.registeredAddress || `${currentResponder.street_address}, ${currentResponder.city}`}</strong></div>
              <div>Base GPS Coordinates: <strong>Lat {currentResponder.latitude || 21.1255}, Lng {currentResponder.longitude || 79.0522}</strong></div>
              <div>Duty Status: <strong style={{ color: currentResponder.isActiveDuty ? 'var(--success-green)' : 'var(--emergency-red)' }}>{currentResponder.isActiveDuty ? '🟢 ACTIVE' : '⚪ INACTIVE'}</strong></div>
            </div>
          )}

          <button className="btn-outline" style={{ marginTop: '16px', width: '100%', color: 'var(--emergency-red)', borderColor: 'var(--emergency-red)' }} onClick={logoutResponder}>
            <LogOut size={14} /> Logout Responder Account
          </button>
        </div>
      )}

      {/* ⏱️ TAB 3: HISTORY */}
      {activeTab === 'history' && (
        <div className="card" style={{ background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <History size={16} color="var(--bright-blue)" />
              <h3 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--royal-blue-dark)' }}>
                Emergency Incident History
              </h3>
            </div>
            <span className="badge badge-info" style={{ fontSize: '10px' }}>
              {myCompletedHistory.length} Total Incidents
            </span>
          </div>

          {myCompletedHistory.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myCompletedHistory.map((item, idx) => (
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
                    Patient: <strong>{item.patientName}</strong> ({item.patientMobile})
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    📍 Location: <strong>{item.locationAddress}</strong>
                  </div>

                  {item.hospitalName && (
                    <div style={{ fontSize: '11px', color: 'var(--success-green)', fontWeight: '700', marginTop: '2px' }}>
                      🏥 Destination: {item.hospitalName}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
              No completed emergency incidents recorded yet.
            </div>
          )}
        </div>
      )}

      {/* Native Bottom Navigation Bar for Responder */}
      <nav className="bottom-nav">
        <button className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <HomeIcon size={18} /> Home
        </button>
        <button className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <User size={18} /> Profile
        </button>
        <button className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <History size={18} /> History
        </button>
      </nav>
    </div>
  );
};
