import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, PhoneCall, User, Home, History, Shield, AlertTriangle, HeartPulse, Stethoscope, Flame, Siren, Baby, Droplet, CloudLightning, LogOut, RefreshCw } from 'lucide-react';

export const UserHome = () => {
  const { user, userLocation, fetchRealUserGpsLocation, createEmergency, logoutUser } = useApp();
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'history' | 'profile'
  const [isLocating, setIsLocating] = useState(false);

  const handleRefetchGps = () => {
    setIsLocating(true);
    fetchRealUserGpsLocation();
    setTimeout(() => {
      setIsLocating(false);
    }, 1500);
  };

  const emergencyTypes = [
    { name: 'SOS', icon: '🆘', sub: 'Instant All-Service Emergency', isSos: true },
    { name: 'Accident', icon: '🚗', sub: 'Ambulance + Police' },
    { name: 'Medical', icon: '🚑', sub: 'Ambulance + Hospital + Doctor' },
    { name: 'Cardiac', icon: '❤️', sub: 'Cardiology Critical Unit' },
    { name: 'Stroke', icon: '🧠', sub: 'Neurology Emergency Unit' },
    { name: 'Fire', icon: '🔥', sub: 'Fire Service (+ Ambulance if needed)' },
    { name: 'Police', icon: '👮', sub: 'Police Patrol Dispatch' },
    { name: 'Women Safety', icon: '👩', sub: 'Police / Women Safety Unit' },
    { name: 'Child Emergency', icon: '👶', sub: 'Pediatric ICU Ambulance' },
    { name: 'Blood Emergency', icon: '🩸', sub: 'Blood Bank & Hospital' },
    { name: 'Disaster', icon: '🌪️', sub: 'NDRF & Rescue Teams' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
      {/* Top Mobile Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #EF4444, #B91C1C)', color: 'white', fontWeight: '900', fontSize: '14px', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
            RS
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--royal-blue-dark)', lineHeight: '1.1' }}>
              Rapid<span style={{ color: 'var(--emergency-red)' }}>SQ</span>
            </div>
            <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--bright-blue)' }}>Every Second Matters.</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="badge badge-success" style={{ fontSize: '10px' }}>
            🟢 LIVE GPS ACTIVE
          </span>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'home' && (
        <>
          {/* Real Patient Device Location Card */}
          <div className="card" style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', borderLeft: '4px solid var(--bright-blue)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, paddingRight: '8px' }}>
              <div style={{ background: 'var(--light-blue-bg)', color: 'var(--bright-blue)', padding: '8px', borderRadius: '50%', flexShrink: 0 }}>
                <MapPin size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10px', fontWeight: '900', color: 'var(--bright-blue)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  📍 PATIENT REAL GPS LOCATION
                </div>
                <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--royal-blue-dark)', marginTop: '2px', wordBreak: 'break-word' }}>
                  {userLocation.address}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  Lat: {userLocation.lat}, Lng: {userLocation.lng}
                </div>
              </div>
            </div>

            <button 
              className="btn-outline" 
              style={{ width: 'auto', padding: '6px 10px', fontSize: '11px', flexShrink: 0 }}
              onClick={handleRefetchGps}
              disabled={isLocating}
            >
              <RefreshCw size={12} className={isLocating ? 'spin' : ''} /> {isLocating ? 'Locating...' : 'Refresh GPS'}
            </button>
          </div>

          {/* Emergency Grid Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 2px 0' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '900', color: 'var(--royal-blue-dark)', letterSpacing: '0.3px' }}>
              🚨 EMERGENCY SERVICES
            </h3>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700' }}>Tap for instant response</span>
          </div>

          <div className="emergency-grid">
            {emergencyTypes.map((type) => {
              if (type.isSos) {
                return (
                  <button
                    key={type.name}
                    className="emergency-btn sos-btn"
                    onClick={() => createEmergency(type)}
                  >
                    <div className="emergency-icon">{type.icon}</div>
                    <div style={{ textAlign: 'left' }}>
                      <div className="emergency-title">{type.name} EMERGENCY</div>
                      <div className="emergency-sub">{type.sub}</div>
                    </div>
                  </button>
                );
              }

              return (
                <button
                  key={type.name}
                  className="emergency-btn"
                  onClick={() => createEmergency(type)}
                >
                  <div className="emergency-icon">{type.icon}</div>
                  <div className="emergency-title">{type.name}</div>
                  <div className="emergency-sub">{type.sub}</div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="card" style={{ background: '#FFFFFF' }}>
          <h3 className="card-title" style={{ fontSize: '15px', color: 'var(--royal-blue-dark)' }}>⏱️ Emergency Incident History</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No past emergency incidents recorded.</p>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card" style={{ background: '#FFFFFF' }}>
          <h3 className="card-title" style={{ fontSize: '15px', color: 'var(--royal-blue-dark)' }}>👤 User Profile</h3>
          {user ? (
            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>Full Name: <strong>{user.fullName}</strong></div>
              <div>Mobile: <strong>{user.mobile}</strong></div>
              <div>Aadhaar: <strong>{user.aadhaar}</strong></div>
              <div>Blood Group: <strong style={{ color: 'var(--emergency-red)' }}>{user.bloodGroup}</strong></div>
              <div>Allergies: <strong>{user.allergies || 'None'}</strong></div>
              <div>Emergency Contact: <strong>{user.emergencyContact}</strong></div>

              {user.userPenaltyFine > 0 && (
                <div style={{ background: 'var(--emergency-red-light)', border: '1px solid var(--emergency-red)', color: 'var(--emergency-red)', padding: '10px', borderRadius: '8px', fontWeight: '800', marginTop: '6px' }}>
                  ⚠️ Account Fine Balance: ₹{user.userPenaltyFine}
                </div>
              )}

              <button className="btn-outline" style={{ marginTop: '12px', padding: '10px', fontSize: '13px', color: 'var(--emergency-red)', borderColor: 'var(--emergency-red)' }} onClick={logoutUser}>
                <LogOut size={16} /> Logout Account
              </button>
            </div>
          ) : (
            <p style={{ fontSize: '12px' }}>No user registered.</p>
          )}
        </div>
      )}

      {/* Native Bottom Navigation Bar */}
      <nav className="bottom-nav">
        <button className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <Home size={18} /> Home
        </button>
        <button className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <History size={18} /> History
        </button>
        <button className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <User size={18} /> Profile
        </button>
      </nav>
    </div>
  );
};
