import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp, geocodeAddress } from '../context/AppContext';
import { ShieldCheck, Siren, Building2, Key, MapPin, User, Hospital, Truck, LogIn, CheckCircle2, AlertCircle, Compass, Edit3, Flame, Stethoscope, ChevronRight, Zap } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

const locationPinIcon = L.divIcon({
  html: `<div style="background:#1E40AF; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; color:white; border:3px solid white; box-shadow:0 4px 14px rgba(30,64,175,0.5); font-weight:bold;">📍</div>`,
  className: '',
  iconSize: [38, 38],
  iconAnchor: [19, 19]
});

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], 14);
    }
  }, [center, map]);
  return null;
}

function DraggableMapMarker({ position, setPosition, onPositionChange }) {
  const markerRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          const newPos = { lat: parseFloat(latLng.lat.toFixed(4)), lng: parseFloat(latLng.lng.toFixed(4)) };
          setPosition(newPos);
          if (onPositionChange) onPositionChange(newPos);
        }
      },
    }),
    [setPosition, onPositionChange]
  );

  useMapEvents({
    click(e) {
      const newPos = { lat: parseFloat(e.latlng.lat.toFixed(4)), lng: parseFloat(e.latlng.lng.toFixed(4)) };
      setPosition(newPos);
      if (onPositionChange) onPositionChange(newPos);
    },
  });

  return position ? (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={[position.lat, position.lng]}
      ref={markerRef}
      icon={locationPinIcon}
    >
      <Popup minWidth={140}>
        <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: '700' }}>
          📍 Drag marker or tap anywhere on map
        </div>
      </Popup>
    </Marker>
  ) : null;
}

export const RegistrationFlow = () => {
  const { registerUser, loginUser, registerHospital, registerResponder, userLocation, activeResponderAccount, setCurrentRole, loginResponder } = useApp();
  
  // Track selection: null (Welcome Screen) | 'user' | 'responder_category_select' | 'responder_form' | 'login_responder'
  const [selectedTrack, setSelectedTrack] = useState(null);
  
  // Responder Category: 'Ambulance' | 'Police' | 'Hospital' | 'Doctor' | 'Fire'
  const [responderCategory, setResponderCategory] = useState(null);

  // User Mode: 'login' | 'register'
  const [userMode, setUserMode] = useState('login');
  const [userLoginMobile, setUserLoginMobile] = useState('');

  // User Form State
  const [userForm, setUserForm] = useState({
    fullName: '', dob: '', mobile: '', aadhaar: '', emergencyContact: '', bloodGroup: 'O+', allergies: ''
  });

  // Responder Registration Form State
  const [respForm, setRespForm] = useState({
    fullName: '',
    mobile: '',
    orgName: '',
    regLicenseNumber: '',
    vehicleNumber: '',
    ambulanceType: 'Advanced Life Support (ALS)',
    employeeId: '',
    policeStation: '',
    rank: 'Sub-Inspector',
    street_address: 'VNIT Campus, South Ambazari Road',
    city: 'Nagpur',
    pincode: '440010',
    emergencyContact: '',
    availability: 'ACTIVE'
  });

  // Login Mobile / ID Input
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Validation Error State
  const [mobileError, setMobileError] = useState('');

  // Coordinates State - Default VNIT Nagpur
  const [pickedCoords, setPickedCoords] = useState({
    lat: 21.1255,
    lng: 79.0522
  });

  const [reverseAddress, setReverseAddress] = useState('VNIT Campus, South Ambazari Road, Nagpur');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync coords with userLocation when real GPS returns
  useEffect(() => {
    if (userLocation && userLocation.lat && userLocation.lng) {
      setPickedCoords({ lat: userLocation.lat, lng: userLocation.lng });
      fetchReverseGeocode(userLocation.lat, userLocation.lng);
    }
  }, [userLocation]);

  // Reverse Geocode
  const fetchReverseGeocode = async (lat, lng) => {
    setReverseAddress(`Lat: ${lat}, Lng: ${lng} (Fetching address...)`);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        setReverseAddress(data.display_name);
        return;
      }
    } catch (err) {
      console.log('Reverse geocode error:', err);
    }
    setReverseAddress(`${respForm.street_address}, ${respForm.city} (${lat}, ${lng})`);
  };

  // Auto geocode on address change
  useEffect(() => {
    if (respForm.street_address || respForm.city || respForm.pincode) {
      const coords = geocodeAddress(respForm.street_address, respForm.city, respForm.pincode);
      setPickedCoords(coords);
      fetchReverseGeocode(coords.lat, coords.lng);
    }
  }, [respForm.street_address, respForm.city, respForm.pincode]);

  const handleUserInputChange = (field, value) => {
    if (field === 'mobile') {
      const numericVal = value.replace(/\D/g, '').slice(0, 10);
      setUserForm(prev => ({ ...prev, mobile: numericVal }));
      return;
    }
    setUserForm(prev => ({ ...prev, [field]: value }));
  };

  const handleRespMobileChange = (e) => {
    const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setRespForm(prev => ({ ...prev, mobile: numericOnly }));

    if (numericOnly.length > 0 && numericOnly.length < 10) {
      setMobileError('Enter a valid 10-digit mobile number.');
    } else {
      setMobileError('');
    }
  };

  const handleRespInputChange = (field, value) => {
    setRespForm(prev => ({ ...prev, [field]: value }));
  };

  const handleMarkerPositionChange = (newCoords) => {
    setPickedCoords(newCoords);
    fetchReverseGeocode(newCoords.lat, newCoords.lng);
  };

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = {
            lat: parseFloat(pos.coords.latitude.toFixed(4)),
            lng: parseFloat(pos.coords.longitude.toFixed(4))
          };
          setPickedCoords(newPos);
          fetchReverseGeocode(newPos.lat, newPos.lng);
        },
        () => {
          setPickedCoords({ lat: 21.1255, lng: 79.0522 });
          setReverseAddress('VNIT Campus, South Ambazari Road, Nagpur');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  const handleSelectCategory = (categoryKey) => {
    setResponderCategory(categoryKey);
    setSelectedTrack('responder_form');
  };

  const handleUserQuickLogin = () => {
    loginUser('9876543210');
  };

  const handleUserMobileLoginSubmit = (e) => {
    e.preventDefault();
    if (!userLoginMobile || userLoginMobile.length < 4) {
      alert('Please enter a valid mobile number or Aadhaar number.');
      return;
    }
    loginUser(userLoginMobile);
  };

  const handleUserRegisterSubmit = (e) => {
    e.preventDefault();
    if (!userForm.fullName || !userForm.mobile || !userForm.aadhaar) {
      alert('Please fill out Full Name, Mobile Number, and Aadhaar Number.');
      return;
    }
    if (userForm.mobile.length !== 10) {
      alert('Enter a valid 10-digit mobile number.');
      return;
    }
    setShowOtpModal(true);
  };

  const handleGoogleSignIn = () => {
    registerUser({
      fullName: 'Rahul Sharma (Google Account)',
      dob: '1996-05-12',
      mobile: '9876543210',
      aadhaar: '9999-8888-7777',
      emergencyContact: 'Family (9876500000)',
      bloodGroup: 'O+',
      allergies: 'None',
      aadhaarVerified: true
    });
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otpInput.trim() === '1234' || otpInput.trim().length === 4) {
      registerUser({ ...userForm, aadhaarVerified: true });
      setShowOtpModal(false);
    } else {
      setOtpError('Invalid OTP. Use 1234 for prototype demo verification.');
    }
  };

  const handleResponderLoginSubmit = (e) => {
    e.preventDefault();
    const res = loginResponder(loginInput.trim());
    if (res.success) {
      setLoginError('');
      setSuccessMessage(`✅ Welcome back, ${res.profile.fullName}! Opening profile...`);
      setTimeout(() => setCurrentRole('responder'), 1000);
    } else {
      setLoginError(res.message);
    }
  };

  const handleResponderSubmit = (e) => {
    e.preventDefault();
    
    if (respForm.mobile.length !== 10) {
      setMobileError('Enter a valid 10-digit mobile number.');
      alert('Enter a valid 10-digit mobile number.');
      return;
    }

    if (!respForm.fullName || (!respForm.regLicenseNumber && !respForm.employeeId)) {
      alert('Please fill out Full Name and License/Employee Number.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      fullName: respForm.fullName,
      mobile: respForm.mobile,
      serviceType: responderCategory,
      orgName: respForm.orgName || respForm.policeStation || respForm.fullName,
      licenseNumber: respForm.regLicenseNumber,
      regLicenseNumber: respForm.regLicenseNumber || respForm.employeeId,
      vehicleNumber: respForm.vehicleNumber,
      ambulanceType: respForm.ambulanceType,
      employeeId: respForm.employeeId,
      policeStation: respForm.policeStation,
      rank: respForm.rank,
      street_address: respForm.street_address,
      city: respForm.city,
      pincode: respForm.pincode,
      emergencyContact: respForm.emergencyContact || respForm.mobile,
      locationCoords: pickedCoords,
      availability: respForm.availability
    };

    let result = null;
    if (responderCategory === 'Hospital') {
      result = registerHospital(payload);
    } else {
      result = registerResponder(payload);
    }

    if (result && result.success) {
      setSuccessMessage(`✅ Registration Successful! Profile Saved to Database (ID: ${result.profile.id})`);
      setIsSubmitting(false);
      
      setTimeout(() => {
        setCurrentRole('responder');
      }, 1000);
    } else {
      setIsSubmitting(false);
      alert('Database write error. Please try again.');
    }
  };

  const responderServicesList = [
    {
      id: 'Ambulance',
      icon: '🚑',
      title: 'Ambulance Service / Driver',
      desc: 'ALS, BLS, and Patient Transport Emergency Ambulances',
      badge: 'TRAUMA & MEDICAL',
      color: '#EF4444'
    },
    {
      id: 'Police',
      icon: '👮',
      title: 'Police Station / Patrol Officer',
      desc: 'Police Stations, PCR Vans, and Women Safety Patrol Units',
      badge: 'LAW & ORDER',
      color: '#1E40AF'
    },
    {
      id: 'Hospital',
      icon: '🏥',
      title: 'Hospital / Emergency Medical Center',
      desc: 'Government & Private Hospital Emergency ICU Departments',
      badge: 'ICU & SURGERY',
      color: '#059669'
    },
    {
      id: 'Doctor',
      icon: '👨‍⚕️',
      title: 'Doctor / Medical Specialist',
      desc: 'Cardiologists, Neurologists, and Critical Care Specialists',
      badge: 'SPECIALIST',
      color: '#7C3AED'
    },
    {
      id: 'Fire',
      icon: '🔥',
      title: 'Fire Station / Fire Rescue Unit',
      desc: 'City Fire Stations and Disaster Rescue Operations',
      badge: 'FIRE & RESCUE',
      color: '#D97706'
    }
  ];

  // WELCOME SCREEN
  if (!selectedTrack) {
    return (
      <div style={{ textAlign: 'center', padding: '36px 14px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: '76px',
          height: '76px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #0A2540 0%, #1E40AF 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '18px',
          boxShadow: '0 10px 30px rgba(10, 37, 64, 0.25)'
        }}>
          <Siren size={38} color="#FFFFFF" />
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--royal-blue-dark)', marginBottom: '4px', letterSpacing: '-0.8px' }}>
          Rapid<span style={{ color: 'var(--bright-blue)' }}>SQ</span>
        </h1>
        <p style={{ color: 'var(--bright-blue)', fontWeight: '700', fontSize: '14px', marginBottom: '36px' }}>
          Every Second Matters.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '340px' }}>
          <button 
            className="btn-navy-primary"
            style={{ padding: '20px', fontSize: '16px', borderRadius: '18px' }}
            onClick={() => setSelectedTrack('user')}
          >
            👤 USER (Patient Log In / Register)
          </button>

          <button 
            className="btn-outline-card"
            style={{ padding: '20px', fontSize: '16px', borderRadius: '18px', borderColor: 'var(--royal-blue-dark)', color: 'var(--royal-blue-dark)', background: '#FFFFFF' }}
            onClick={() => setSelectedTrack('responder_category_select')}
          >
            🚨 EMERGENCY RESPONDER
          </button>

          <button 
            className="btn-outline"
            style={{ padding: '12px', fontSize: '13px', borderRadius: '12px', marginTop: '6px' }}
            onClick={() => setSelectedTrack('login_responder')}
          >
            🔑 Log In to Existing Responder Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: '440px', margin: '0 auto', background: '#FFFFFF' }}>
      <button 
        className="btn-outline" 
        style={{ padding: '6px 12px', fontSize: '12px', marginBottom: '16px', width: 'auto' }} 
        onClick={() => {
          if (selectedTrack === 'responder_form') setSelectedTrack('responder_category_select');
          else setSelectedTrack(null);
        }}
      >
        ← Back
      </button>

      {successMessage && (
        <div style={{ background: 'var(--success-green-light)', color: 'var(--success-green)', padding: '12px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', marginBottom: '14px' }}>
          {successMessage}
        </div>
      )}

      {/* LOGIN EXISTING RESPONDER */}
      {selectedTrack === 'login_responder' && (
        <>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--royal-blue-dark)', marginBottom: '4px' }}>
            🔑 Log In to Responder Profile
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Enter your registered Mobile Number or Unique Responder ID.
          </p>

          <form onSubmit={handleResponderLoginSubmit}>
            <div className="form-group">
              <label className="form-label">Registered Mobile Number or Unique ID *</label>
              <input 
                className="form-input" 
                placeholder="e.g. 9876543210 or RESP-AMB-101" 
                value={loginInput} 
                onChange={e => setLoginInput(e.target.value)} 
                required 
              />
            </div>

            {loginError && (
              <div style={{ color: 'var(--emergency-red)', fontSize: '11px', fontWeight: '700', marginBottom: '10px' }}>
                {loginError}
              </div>
            )}

            <button type="submit" className="btn-navy-primary">
              Fetch & Open My Saved Profile
            </button>
          </form>
        </>
      )}

      {/* USER LOGIN & REGISTRATION SELECTION */}
      {selectedTrack === 'user' && (
        <>
          <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--royal-blue-dark)', marginBottom: '4px' }}>
            👤 Patient User Portal
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Log in to your patient account or create a new user profile.
          </p>

          {/* Mode Switcher Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
            <button 
              type="button" 
              className={`nav-tab ${userMode === 'login' ? 'active' : ''}`}
              style={{ flex: 1, padding: '10px', fontSize: '13px' }}
              onClick={() => setUserMode('login')}
            >
              🔑 Log In to Account
            </button>
            <button 
              type="button" 
              className={`nav-tab ${userMode === 'register' ? 'active' : ''}`}
              style={{ flex: 1, padding: '10px', fontSize: '13px' }}
              onClick={() => setUserMode('register')}
            >
              📝 Register New User
            </button>
          </div>

          {userMode === 'login' && (
            <>
              {/* Quick 1-Tap Login Button */}
              <button 
                type="button"
                className="btn-navy-primary"
                style={{ padding: '14px', fontSize: '14px', marginBottom: '16px', background: 'linear-gradient(135deg, #1E40AF, #3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={handleUserQuickLogin}
              >
                <Zap size={18} /> ⚡ 1-Tap Quick Log In (Demo Patient Rahul Sharma)
              </button>

              <button className="btn-outline-card" style={{ marginBottom: '16px', padding: '12px' }} onClick={handleGoogleSignIn}>
                🌐 Sign In with Google
              </button>

              <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '14px', fontWeight: '700' }}>
                — OR ENTER YOUR REGISTERED MOBILE / AADHAAR —
              </div>

              <form onSubmit={handleUserMobileLoginSubmit}>
                <div className="form-group">
                  <label className="form-label">Registered Mobile Number / Aadhaar *</label>
                  <input 
                    className="form-input" 
                    placeholder="e.g. 9876543210 or 9999-8888-7777" 
                    value={userLoginMobile}
                    onChange={e => setUserLoginMobile(e.target.value)}
                    required 
                  />
                </div>

                <button type="submit" className="btn-navy-primary" style={{ marginTop: '10px' }}>
                  Log In Patient Account
                </button>
              </form>
            </>
          )}

          {userMode === 'register' && (
            <form onSubmit={handleUserRegisterSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input 
                  className="form-input" 
                  placeholder="Rahul Sharma" 
                  value={userForm.fullName} 
                  onChange={e => handleUserInputChange('fullName', e.target.value)} 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input 
                    className="form-input" 
                    type="date" 
                    value={userForm.dob} 
                    onChange={e => handleUserInputChange('dob', e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input 
                    className="form-input" 
                    placeholder="9876543210" 
                    maxLength={10}
                    value={userForm.mobile} 
                    onChange={e => handleUserInputChange('mobile', e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Aadhaar Number * (DEMO OTP Flow)</label>
                <input 
                  className="form-input" 
                  placeholder="12-digit Aadhaar Number" 
                  value={userForm.aadhaar} 
                  onChange={e => handleUserInputChange('aadhaar', e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Contact *</label>
                <input 
                  className="form-input" 
                  placeholder="Contact Name & Number (9876500000)" 
                  value={userForm.emergencyContact} 
                  onChange={e => handleUserInputChange('emergencyContact', e.target.value)} 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Blood Group (Optional)</label>
                  <select className="form-select" value={userForm.bloodGroup} onChange={e => handleUserInputChange('bloodGroup', e.target.value)}>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Allergies / Medical Info</label>
                  <input 
                    className="form-input" 
                    placeholder="e.g. Penicillin, Asthma" 
                    value={userForm.allergies} 
                    onChange={e => handleUserInputChange('allergies', e.target.value)} 
                  />
                </div>
              </div>

              <button type="submit" className="btn-navy-primary" style={{ marginTop: '10px' }}>
                <ShieldCheck size={18} /> Verify Aadhaar & Register User
              </button>
            </form>
          )}
        </>
      )}

      {/* STEP 1: EMERGENCY SERVICES SELECTION IN ROWS */}
      {selectedTrack === 'responder_category_select' && (
        <>
          <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--royal-blue-dark)', marginBottom: '4px' }}>
            🚨 Select Emergency Service Category
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '18px' }}>
            Tap your service type below to fill out your basic info and register your persistent profile.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {responderServicesList.map(service => (
              <div 
                key={service.id}
                onClick={() => handleSelectCategory(service.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'var(--light-blue-bg)',
                  border: '1.5px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  fontSize: '26px',
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(10,37,64,0.08)',
                  flexShrink: 0
                }}>
                  {service.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '900', color: 'var(--royal-blue-dark)' }}>
                      {service.title}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
                    {service.desc}
                  </div>
                </div>

                <ChevronRight size={20} color="var(--bright-blue)" />
              </div>
            ))}
          </div>
        </>
      )}

      {/* STEP 1 SUBMIT FORM FOR PARTICULAR SELECTED EMERGENCY SERVICE */}
      {selectedTrack === 'responder_form' && responderCategory && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '24px' }}>
              {responderServicesList.find(s => s.id === responderCategory)?.icon}
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--royal-blue-dark)' }}>
              {responderServicesList.find(s => s.id === responderCategory)?.title} Form
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Fill basic details for <strong>{responderCategory}</strong>. Profile will be saved persistently.
          </p>

          <form onSubmit={handleResponderSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input 
                className="form-input" 
                placeholder="e.g. Officer / Driver / Doctor Name" 
                value={respForm.fullName} 
                onChange={e => handleRespInputChange('fullName', e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number * (10 Digits)</label>
              <input 
                className="form-input" 
                placeholder="9876543210" 
                maxLength={10}
                value={respForm.mobile} 
                onChange={handleRespMobileChange} 
                required 
              />
              {mobileError && (
                <div style={{ color: 'var(--emergency-red)', fontSize: '11px', fontWeight: '700', marginTop: '3px' }}>
                  {mobileError}
                </div>
              )}
            </div>

            {/* Category Specific Profile Fields */}
            {responderCategory === 'Ambulance' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Driving License No *</label>
                    <input 
                      className="form-input" 
                      placeholder="DL-MH-2026-99" 
                      value={respForm.regLicenseNumber} 
                      onChange={e => handleRespInputChange('regLicenseNumber', e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ambulance Vehicle No</label>
                    <input 
                      className="form-input" 
                      placeholder="MH-31-RS-9999" 
                      value={respForm.vehicleNumber} 
                      onChange={e => handleRespInputChange('vehicleNumber', e.target.value)} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Ambulance Type</label>
                    <select className="form-select" value={respForm.ambulanceType} onChange={e => handleRespInputChange('ambulanceType', e.target.value)}>
                      <option value="Advanced Life Support (ALS)">Advanced Life Support (ALS)</option>
                      <option value="Basic Life Support (BLS)">Basic Life Support (BLS)</option>
                      <option value="Patient Transport Ambulance">Patient Transport Ambulance</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Organization Name</label>
                    <input 
                      className="form-input" 
                      placeholder="VNIT Emergency Ambulance Unit" 
                      value={respForm.orgName} 
                      onChange={e => handleRespInputChange('orgName', e.target.value)} 
                    />
                  </div>
                </div>
              </>
            )}

            {responderCategory === 'Police' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Police Employee ID *</label>
                    <input 
                      className="form-input" 
                      placeholder="POL-ID-2026-01" 
                      value={respForm.employeeId} 
                      onChange={e => handleRespInputChange('employeeId', e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rank</label>
                    <select className="form-select" value={respForm.rank} onChange={e => handleRespInputChange('rank', e.target.value)}>
                      <option value="Sub-Inspector">Sub-Inspector</option>
                      <option value="Inspector">Inspector</option>
                      <option value="Constable">Constable</option>
                      <option value="Head Constable">Head Constable</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Police Station Name</label>
                  <input 
                    className="form-input" 
                    placeholder="Bajaj Nagar Police Station Nagpur" 
                    value={respForm.policeStation} 
                    onChange={e => handleRespInputChange('policeStation', e.target.value)} 
                  />
                </div>
              </>
            )}

            {['Hospital', 'Doctor', 'Fire'].includes(responderCategory) && (
              <>
                <div className="form-group">
                  <label className="form-label">Reg / License / Badge No *</label>
                  <input 
                    className="form-input" 
                    placeholder="MH-REG-2026-99" 
                    value={respForm.regLicenseNumber} 
                    onChange={e => handleRespInputChange('regLicenseNumber', e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Organization Name</label>
                  <input 
                    className="form-input" 
                    placeholder="Organization / Hospital / Station Name" 
                    value={respForm.orgName} 
                    onChange={e => handleRespInputChange('orgName', e.target.value)} 
                  />
                </div>
              </>
            )}

            {/* Address & Geocoding Fields */}
            <div className="form-group">
              <label className="form-label">Street Address *</label>
              <input 
                className="form-input" 
                placeholder="e.g. VNIT Campus, South Ambazari Road" 
                value={respForm.street_address} 
                onChange={e => handleRespInputChange('street_address', e.target.value)} 
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">City *</label>
                <input 
                  className="form-input" 
                  placeholder="Nagpur" 
                  value={respForm.city} 
                  onChange={e => handleRespInputChange('city', e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode *</label>
                <input 
                  className="form-input" 
                  placeholder="440010" 
                  value={respForm.pincode} 
                  onChange={e => handleRespInputChange('pincode', e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Availability Status</label>
              <select className="form-select" value={respForm.availability} onChange={e => handleRespInputChange('availability', e.target.value)}>
                <option value="ACTIVE">🟢 ACTIVE (Can receive emergency requests)</option>
                <option value="INACTIVE">⚪ INACTIVE (Cannot receive emergency requests)</option>
              </select>
            </div>

            {/* REAL INTERACTIVE MAP COMPONENT */}
            <div className="form-group" style={{ marginTop: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label">📍 Base Location Map</label>
                <button 
                  type="button"
                  className="btn-outline"
                  style={{ padding: '3px 8px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={handleUseCurrentLocation}
                >
                  <Compass size={12} /> Use My Current Location
                </button>
              </div>

              <div style={{ height: '180px', width: '100%', borderRadius: '14px', overflow: 'hidden', border: '1.5px solid var(--border-color)', marginBottom: '8px' }}>
                <MapContainer center={[pickedCoords.lat, pickedCoords.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapRecenter center={pickedCoords} />
                  <DraggableMapMarker 
                    position={pickedCoords} 
                    setPosition={setPickedCoords} 
                    onPositionChange={handleMarkerPositionChange} 
                  />
                </MapContainer>
              </div>

              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--royal-blue-dark)' }}>
                Registered Latitude: {pickedCoords.lat}, Registered Longitude: {pickedCoords.lng}
              </div>
            </div>

            <button type="submit" className="btn-navy-primary" disabled={isSubmitting} style={{ marginTop: '12px' }}>
              {isSubmitting ? 'Saving to Database...' : `Save & Open ${responderCategory} Dashboard`}
            </button>
          </form>
        </>
      )}

      {/* DEMO OTP MODAL */}
      {showOtpModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ background: 'var(--light-blue-bg)', color: 'var(--bright-blue)', padding: '8px', borderRadius: '50%' }}>
                <Key size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '800' }}>Demo Aadhaar OTP Verification</h4>
                <span className="badge badge-warning">PROTOTYPE DEMO</span>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Enter demo OTP <strong>1234</strong> to verify registration.
            </p>

            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label className="form-label">4-Digit OTP Code</label>
                <input 
                  className="form-input" 
                  type="text" 
                  maxLength={4} 
                  placeholder="1234" 
                  value={otpInput} 
                  onChange={e => setOtpInput(e.target.value)} 
                  autoFocus 
                  required 
                />
              </div>

              {otpError && <p style={{ color: 'var(--emergency-red)', fontSize: '11px', marginBottom: '8px' }}>{otpError}</p>}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="btn-outline" onClick={() => setShowOtpModal(false)}>Cancel</button>
                <button type="submit" className="btn-navy-primary">Verify & Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
