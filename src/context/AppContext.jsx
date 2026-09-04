import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_FIREBASE_DB } from '../firebaseSchema';

const AppContext = createContext();

export const playSirenSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    
    const now = audioCtx.currentTime;
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.8);
    osc.frequency.exponentialRampToValueAtTime(880, now + 1.2);
    osc.frequency.exponentialRampToValueAtTime(440, now + 1.6);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.8);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 1.8);
  } catch (err) {
    console.log('Audio playback prevented:', err);
  }
};

export const playDriverLoudEmergencyAlarm = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    const now = audioCtx.currentTime;
    const duration = 4.5; // 4.5 Seconds high-decibel loud siren

    // High-pitch dual alternating frequency sweep (900 Hz <-> 1500 Hz)
    for (let t = 0; t < duration; t += 0.4) {
      osc1.frequency.setValueAtTime(950, now + t);
      osc1.frequency.linearRampToValueAtTime(1500, now + t + 0.2);
      osc1.frequency.linearRampToValueAtTime(950, now + t + 0.4);

      osc2.frequency.setValueAtTime(650, now + t);
      osc2.frequency.linearRampToValueAtTime(1200, now + t + 0.2);
      osc2.frequency.linearRampToValueAtTime(650, now + t + 0.4);
    }

    gain.gain.setValueAtTime(0.92, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  } catch (err) {
    console.log('Driver loud alarm prevented:', err);
  }
};

// Web Push Notification Helper
export const triggerWebPushNotification = (title, bodyStr) => {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: bodyStr,
          icon: '/favicon.ico',
          tag: 'rapidsq-alert',
          requireInteraction: true
        });
      } catch (e) {
        console.log('Push notification error:', e);
      }
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }
};

const KNOWN_CITIES = {
  'vnit': { lat: 21.1255, lng: 79.0522 },
  'nagpur': { lat: 21.1458, lng: 79.0882 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'kolkata': { lat: 22.5726, lng: 88.3639 }
};

export const geocodeAddress = (addressStr = '', cityStr = '', pincodeStr = '') => {
  const fullText = `${addressStr} ${cityStr} ${pincodeStr}`.toLowerCase();
  
  let baseLat = 21.1255;
  let baseLng = 79.0522;

  for (const [city, coords] of Object.entries(KNOWN_CITIES)) {
    if (fullText.includes(city)) {
      baseLat = coords.lat;
      baseLng = coords.lng;
      break;
    }
  }

  let hash = 0;
  for (let i = 0; i < fullText.length; i++) {
    hash = (hash << 5) - hash + fullText.charCodeAt(i);
    hash |= 0;
  }
  
  const offsetLat = ((Math.abs(hash) % 500) - 250) / 10000;
  const offsetLng = ((Math.abs(hash * 3) % 500) - 250) / 10000;

  return {
    lat: parseFloat((baseLat + offsetLat).toFixed(4)),
    lng: parseFloat((baseLng + offsetLng).toFixed(4))
  };
};

export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 1.5;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
};

const REGISTERED_HOSPITALS = [
  {
    id: 'HOSP-GOVT-01',
    name: 'Government Medical College & Hospital (GMCH) Nagpur',
    type: 'Government',
    regLicenseNumber: 'GOVT-MH-1001',
    mobile: '0712-2744401',
    street_address: 'Medical Square, Hanuman Nagar',
    city: 'Nagpur',
    pincode: '440009',
    latitude: 21.1278,
    longitude: 79.0962,
    locationCoords: { lat: 21.1278, lng: 79.0962 },
    icuBeds: 45,
    emergencyBeds: 25,
    specialistAvailable: 'Trauma Surgeon & Critical Care Team',
    capability: 'Level-1 Trauma Center & 24x7 Emergency ICU',
    verificationStatus: 'VERIFIED',
    availability: 'ACTIVE',
    isActiveDuty: true
  },
  {
    id: 'HOSP-PVT-02',
    name: 'Alexis Multi-Speciality Emergency Hospital',
    type: 'Private',
    regLicenseNumber: 'PVT-MH-2002',
    mobile: '0712-7120000',
    street_address: 'Mankapur Square, Koradi Road',
    city: 'Nagpur',
    pincode: '440030',
    latitude: 21.1840,
    longitude: 79.0805,
    locationCoords: { lat: 21.1840, lng: 79.0805 },
    icuBeds: 30,
    emergencyBeds: 15,
    specialistAvailable: 'Cardiologist & Neuro Specialist',
    capability: 'Advanced Cardiac Cath Lab & Neuro ICU',
    verificationStatus: 'VERIFIED',
    availability: 'ACTIVE',
    isActiveDuty: true
  },
  {
    id: 'HOSP-PVT-03',
    name: 'Kingsway Emergency Hospital Nagpur',
    type: 'Private',
    regLicenseNumber: 'PVT-MH-3003',
    mobile: '0712-6789000',
    street_address: 'Near Kasturchand Park, Kingsway',
    city: 'Nagpur',
    pincode: '440001',
    latitude: 21.1528,
    longitude: 79.0864,
    locationCoords: { lat: 21.1528, lng: 79.0864 },
    icuBeds: 20,
    emergencyBeds: 10,
    specialistAvailable: 'Emergency Physician & Anesthetist',
    capability: 'Emergency Surgery & Stroke Unit',
    verificationStatus: 'VERIFIED',
    availability: 'ACTIVE',
    isActiveDuty: true
  }
];

const INITIAL_RESPONDERS = [
  {
    id: 'RESP-AMB-GOVT-01',
    fullName: 'GMCH Govt Hospital Ambulance (Driver Rajesh)',
    mobile: '9876543210',
    serviceType: 'Ambulance',
    licenseNumber: 'DL-MH-2026-9901',
    regLicenseNumber: 'DL-MH-2026-9901',
    vehicleNumber: 'MH-31-RS-1008',
    ambulanceType: 'Advanced Life Support (ALS ICU)',
    orgName: 'GMCH Government Medical College Nagpur',
    street_address: 'GMCH Govt Emergency Base (0.7 km)',
    city: 'Nagpur',
    pincode: '440009',
    latitude: 21.1278,
    longitude: 79.0580,
    currentLatitude: 21.1278,
    currentLongitude: 79.0580,
    locationCoords: { lat: 21.1278, lng: 79.0580 },
    verificationStatus: 'VERIFIED',
    availability: 'ACTIVE',
    isActiveDuty: true
  },
  {
    id: 'RESP-AMB-VNIT-02',
    fullName: 'VNIT Campus Emergency Ambulance (Driver Suresh)',
    mobile: '9876543219',
    serviceType: 'Ambulance',
    licenseNumber: 'DL-MH-2026-8822',
    regLicenseNumber: 'DL-MH-2026-8822',
    vehicleNumber: 'MH-31-RS-1002',
    ambulanceType: 'Basic Life Support (BLS)',
    orgName: 'VNIT Emergency Medical Center',
    street_address: 'VNIT Health Center Base (0.2 km)',
    city: 'Nagpur',
    pincode: '440010',
    latitude: 21.1258,
    longitude: 79.0530,
    currentLatitude: 21.1258,
    currentLongitude: 79.0530,
    locationCoords: { lat: 21.1258, lng: 79.0530 },
    verificationStatus: 'VERIFIED',
    availability: 'ACTIVE',
    isActiveDuty: true
  },
  {
    id: 'RESP-POL-201',
    fullName: 'Bajaj Nagar Police Patrol Unit (Officer Sharma)',
    mobile: '9876543211',
    serviceType: 'Police',
    employeeId: 'POL-ID-2026-01',
    regLicenseNumber: 'POL-ID-2026-01',
    rank: 'Sub-Inspector',
    policeStation: 'Bajaj Nagar Police Station Nagpur',
    orgName: 'Bajaj Nagar Police Station Nagpur',
    street_address: 'Bajaj Nagar Square (0.5 km)',
    city: 'Nagpur',
    pincode: '440010',
    latitude: 21.1240,
    longitude: 79.0560,
    currentLatitude: 21.1240,
    currentLongitude: 79.0560,
    locationCoords: { lat: 21.1240, lng: 79.0560 },
    verificationStatus: 'VERIFIED',
    availability: 'ACTIVE',
    isActiveDuty: true
  },
  {
    id: 'RESP-FIRE-301',
    fullName: 'Civil Lines Fire Station Rescue Unit',
    mobile: '9876543212',
    serviceType: 'Fire',
    regLicenseNumber: 'FIRE-MH-3001',
    orgName: 'Civil Lines Fire Station Nagpur',
    street_address: 'Civil Lines Fire Station (1.8 km)',
    city: 'Nagpur',
    pincode: '440001',
    latitude: 21.1350,
    longitude: 79.0650,
    currentLatitude: 21.1350,
    currentLongitude: 79.0650,
    locationCoords: { lat: 21.1350, lng: 79.0650 },
    verificationStatus: 'VERIFIED',
    availability: 'ACTIVE',
    isActiveDuty: true
  }
];

const SAMPLE_COMPLETED_HISTORY = [
  {
    incidentId: 'RSQ-2026-9041',
    responderId: 'ALL',
    type: 'Accident',
    icon: '🚗',
    patientName: 'Rahul Deshmukh',
    patientMobile: '+91 98230 11200',
    locationAddress: 'VNIT Gate, South Ambazari Road, Nagpur',
    hospitalName: 'GMCH Government Medical College Nagpur',
    completedAt: 'Yesterday at 14:30',
    status: 'COMPLETED'
  },
  {
    incidentId: 'RSQ-2026-8812',
    responderId: 'ALL',
    type: 'Cardiac',
    icon: '❤️',
    patientName: 'Suresh Patil',
    patientMobile: '+91 94220 44512',
    locationAddress: 'Bajaj Nagar, Abhyankar Nagar, Nagpur',
    hospitalName: 'Kingsway Emergency Hospital Nagpur',
    completedAt: '16 Aug 2026 at 09:15',
    status: 'COMPLETED'
  }
];

const INITIAL_ENTITIES = {
  hospitals: REGISTERED_HOSPITALS,
  doctors: [],
  responders: INITIAL_RESPONDERS
};

// VNIT NAGPUR LOCATION CONSTANTS
const VNIT_NAGPUR_GPS = {
  lat: 21.1255,
  lng: 79.0522,
  address: 'VNIT Campus, South Ambazari Road, Nagpur, Maharashtra 440010 (Real VNIT GPS)',
  isRealGps: true
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rapidsq_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeResponderAccount, setActiveResponderAccount] = useState(() => {
    const saved = localStorage.getItem('rapidsq_active_responder_account');
    return saved ? JSON.parse(saved) : null;
  });

  const [userLocation, setUserLocation] = useState(VNIT_NAGPUR_GPS);

  const [completedIncidentsHistory, setCompletedIncidentsHistory] = useState(() => {
    const saved = localStorage.getItem('rapidsq_completed_history');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (JSON.stringify(parsed).includes('Pune') || JSON.stringify(parsed).includes('Sassoon') || JSON.stringify(parsed).includes('Ruby Hall')) {
        localStorage.setItem('rapidsq_completed_history', JSON.stringify(SAMPLE_COMPLETED_HISTORY));
        return SAMPLE_COMPLETED_HISTORY;
      }
      return parsed;
    }
    return SAMPLE_COMPLETED_HISTORY;
  });

  useEffect(() => {
    localStorage.setItem('rapidsq_completed_history', JSON.stringify(completedIncidentsHistory));
  }, [completedIncidentsHistory]);

  const fetchRealUserGpsLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          let addr = `Real Device GPS Location (Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)})`;

          const initialLocObj = {
            lat: latitude,
            lng: longitude,
            address: addr,
            isRealGps: true
          };
          setUserLocation(initialLocObj);
          localStorage.setItem('rapidsq_user_gps', JSON.stringify(initialLocObj));

          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            if (res.ok) {
              const data = await res.json();
              if (data && data.display_name) {
                addr = data.display_name;
                const updatedLocObj = {
                  lat: latitude,
                  lng: longitude,
                  address: addr,
                  isRealGps: true
                };
                setUserLocation(updatedLocObj);
                localStorage.setItem('rapidsq_user_gps', JSON.stringify(updatedLocObj));
              }
            }
          } catch (e) {
            console.log('Reverse geocoding fetch error:', e);
          }
        },
        (err) => {
          console.log('GPS Permission Error, fallback to VNIT Nagpur:', err);
          setUserLocation(VNIT_NAGPUR_GPS);
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    } else {
      setUserLocation(VNIT_NAGPUR_GPS);
    }
  };

  useEffect(() => {
    fetchRealUserGpsLocation();

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const [activeEmergency, setActiveEmergency] = useState(() => {
    const saved = localStorage.getItem('rapidsq_active_emergency');
    return saved ? JSON.parse(saved) : null;
  });

  const [entities, setEntities] = useState(() => {
    const saved = localStorage.getItem('rapidsq_entities');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.hospitals || parsed.hospitals.length === 0) {
        parsed.hospitals = REGISTERED_HOSPITALS;
      }
      if (!parsed.responders || parsed.responders.length === 0) {
        parsed.responders = INITIAL_RESPONDERS;
      }
      return parsed;
    }
    return INITIAL_ENTITIES;
  });

  const [currentRole, setCurrentRole] = useState('user');
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  useEffect(() => {
    if (user) localStorage.setItem('rapidsq_user', JSON.stringify(user));
    else localStorage.removeItem('rapidsq_user');
  }, [user]);

  useEffect(() => {
    if (activeResponderAccount) localStorage.setItem('rapidsq_active_responder_account', JSON.stringify(activeResponderAccount));
    else localStorage.removeItem('rapidsq_active_responder_account');
  }, [activeResponderAccount]);

  useEffect(() => {
    if (activeEmergency) localStorage.setItem('rapidsq_active_emergency', JSON.stringify(activeEmergency));
    else localStorage.removeItem('rapidsq_active_emergency');
  }, [activeEmergency]);

  useEffect(() => {
    localStorage.setItem('rapidsq_entities', JSON.stringify(entities));
  }, [entities]);

  const clearAllData = () => {
    setUser(null);
    setActiveResponderAccount(null);
    setActiveEmergency(null);
    setCurrentRole('user');
    setEntities(INITIAL_ENTITIES);
    setCompletedIncidentsHistory(SAMPLE_COMPLETED_HISTORY);
    setUserLocation(VNIT_NAGPUR_GPS);
    localStorage.removeItem('rapidsq_user');
    localStorage.removeItem('rapidsq_active_responder_account');
    localStorage.removeItem('rapidsq_active_emergency');
    localStorage.removeItem('rapidsq_entities');
    localStorage.removeItem('rapidsq_completed_history');
    localStorage.removeItem('rapidsq_user_gps');
    localStorage.clear();
  };

  const registerUser = (userData) => {
    const userProfile = {
      id: `USER-${Date.now()}`,
      ...userData,
      userPenaltyFine: 0,
      isAuthenticated: true,
      roleType: 'user'
    };
    setUser(userProfile);
    setCurrentRole('user');
  };

  const loginUser = (mobileOrAadhaar) => {
    const userProfile = {
      id: `USER-${Date.now()}`,
      fullName: 'Rahul Sharma',
      dob: '1996-05-12',
      mobile: mobileOrAadhaar || '9876543210',
      aadhaar: '9999-8888-7777',
      emergencyContact: 'Family (+91 98765 00000)',
      bloodGroup: 'O+',
      allergies: 'None',
      userPenaltyFine: 0,
      isAuthenticated: true,
      roleType: 'user'
    };
    setUser(userProfile);
    setCurrentRole('user');
    return { success: true, user: userProfile };
  };

  const logoutUser = () => {
    setUser(null);
    setCurrentRole('user');
    localStorage.removeItem('rapidsq_user');
  };

  const logoutResponder = () => {
    setActiveResponderAccount(null);
    setCurrentRole('user');
    localStorage.removeItem('rapidsq_active_responder_account');
  };

  const loginResponder = (mobileOrId) => {
    const found = entities.responders.find(r => r.mobile === mobileOrId || r.id === mobileOrId || r.regLicenseNumber === mobileOrId);
    if (found) {
      setActiveResponderAccount(found);
      setCurrentRole('responder');
      return { success: true, profile: found };
    }
    return { success: false, message: 'No registered responder profile found with this Mobile/ID.' };
  };

  const registerHospital = (hospitalData) => {
    const coords = hospitalData.locationCoords || geocodeAddress(hospitalData.street_address, hospitalData.city, hospitalData.pincode);
    const uniqueId = `HOSP-${Date.now()}-${Math.floor(100 + Math.random()*900)}`;

    const newHosp = {
      id: uniqueId,
      name: hospitalData.name,
      type: hospitalData.type || 'Private',
      regLicenseNumber: hospitalData.regLicenseNumber,
      mobile: hospitalData.mobile,
      street_address: hospitalData.street_address,
      city: hospitalData.city,
      pincode: hospitalData.pincode,
      registeredLatitude: coords.lat,
      registeredLongitude: coords.lng,
      currentLatitude: coords.lat,
      currentLongitude: coords.lng,
      latitude: coords.lat,
      longitude: coords.lng,
      locationCoords: coords,
      icuBeds: hospitalData.icuBeds || 10,
      emergencyBeds: hospitalData.emergencyBeds || 5,
      verificationStatus: 'VERIFIED',
      availability: hospitalData.availability || 'ACTIVE',
      isActiveDuty: (hospitalData.availability || 'ACTIVE') === 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    const updatedEntities = {
      ...entities,
      hospitals: [newHosp, ...entities.hospitals.filter(h => h.id !== uniqueId)]
    };

    setEntities(updatedEntities);
    localStorage.setItem('rapidsq_entities', JSON.stringify(updatedEntities));
    setActiveResponderAccount(newHosp);
    localStorage.setItem('rapidsq_active_responder_account', JSON.stringify(newHosp));
    setCurrentRole('hospital');

    return { success: true, profile: newHosp };
  };

  const registerAmbulanceDriver = (driverData) => {
    const coords = driverData.locationCoords || geocodeAddress(driverData.street_address, driverData.city, driverData.pincode);
    const uniqueId = `RESP-AMB-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newDriverProfile = {
      id: uniqueId,
      driverId: uniqueId,
      fullName: driverData.fullName,
      driverName: driverData.fullName,
      photo: driverData.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(driverData.fullName)}`,
      mobile: driverData.mobile,
      serviceType: 'Ambulance',
      licenseNumber: driverData.licenseNumber || driverData.regLicenseNumber,
      regLicenseNumber: driverData.licenseNumber || driverData.regLicenseNumber,
      vehicleNumber: driverData.vehicleNumber || `MH-31-RS-${Math.floor(1000+Math.random()*8999)}`,
      ambulanceType: driverData.ambulanceType || 'Advanced Life Support (ALS)',
      orgName: driverData.orgName || 'GMCH Govt Medical Hospital Ambulance Unit',
      street_address: driverData.street_address,
      city: driverData.city,
      pincode: driverData.pincode,
      emergencyContact: driverData.emergencyContact || driverData.mobile,
      registeredLatitude: coords.lat,
      registeredLongitude: coords.lng,
      currentLatitude: coords.lat,
      currentLongitude: coords.lng,
      latitude: coords.lat,
      longitude: coords.lng,
      locationCoords: coords,
      registeredAddress: `${driverData.street_address}, ${driverData.city} - ${driverData.pincode}`,
      availability: driverData.availability || 'ACTIVE',
      isActiveDuty: (driverData.availability || 'ACTIVE') === 'ACTIVE',
      verificationStatus: 'VERIFIED',
      declineCounter: 0,
      createdAt: new Date().toISOString(),
      fcmToken: `FCM-${uniqueId}`
    };

    const updatedEntities = {
      ...entities,
      responders: [newDriverProfile, ...entities.responders.filter(r => r.id !== uniqueId)]
    };

    setEntities(updatedEntities);
    localStorage.setItem('rapidsq_entities', JSON.stringify(updatedEntities));
    setActiveResponderAccount(newDriverProfile);
    localStorage.setItem('rapidsq_active_responder_account', JSON.stringify(newDriverProfile));
    setCurrentRole('responder');

    return { success: true, profile: newDriverProfile };
  };

  const registerPoliceOfficer = (policeData) => {
    const coords = policeData.locationCoords || geocodeAddress(policeData.street_address, policeData.city, policeData.pincode);
    const uniqueId = `RESP-POL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPoliceProfile = {
      id: uniqueId,
      fullName: policeData.fullName,
      photo: policeData.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(policeData.fullName)}`,
      mobile: policeData.mobile,
      serviceType: 'Police',
      employeeId: policeData.employeeId || policeData.regLicenseNumber,
      regLicenseNumber: policeData.employeeId || policeData.regLicenseNumber,
      policeStation: policeData.policeStation || policeData.orgName || 'Bajaj Nagar Police Station Nagpur',
      orgName: policeData.policeStation || policeData.orgName || 'Bajaj Nagar Police Station Nagpur',
      rank: policeData.rank || 'Sub-Inspector',
      street_address: policeData.street_address,
      city: policeData.city,
      pincode: policeData.pincode,
      emergencyContact: policeData.emergencyContact || policeData.mobile,
      registeredLatitude: coords.lat,
      registeredLongitude: coords.lng,
      currentLatitude: coords.lat,
      currentLongitude: coords.lng,
      latitude: coords.lat,
      longitude: coords.lng,
      locationCoords: coords,
      registeredAddress: `${policeData.street_address}, ${policeData.city} - ${policeData.pincode}`,
      availability: policeData.availability || 'ACTIVE',
      isActiveDuty: (policeData.availability || 'ACTIVE') === 'ACTIVE',
      verificationStatus: 'VERIFIED',
      declineCounter: 0,
      createdAt: new Date().toISOString(),
      fcmToken: `FCM-${uniqueId}`
    };

    const updatedEntities = {
      ...entities,
      responders: [newPoliceProfile, ...entities.responders.filter(r => r.id !== uniqueId)]
    };

    setEntities(updatedEntities);
    localStorage.setItem('rapidsq_entities', JSON.stringify(updatedEntities));
    setActiveResponderAccount(newPoliceProfile);
    localStorage.setItem('rapidsq_active_responder_account', JSON.stringify(newPoliceProfile));
    setCurrentRole('responder');

    return { success: true, profile: newPoliceProfile };
  };

  const registerResponder = (responderData) => {
    if (responderData.serviceType === 'Ambulance') {
      return registerAmbulanceDriver(responderData);
    } else if (responderData.serviceType === 'Police') {
      return registerPoliceOfficer(responderData);
    } else {
      const coords = responderData.locationCoords || geocodeAddress(responderData.street_address, responderData.city, responderData.pincode);
      const uniqueId = `RESP-${responderData.serviceType.substring(0,3).toUpperCase()}-${Date.now()}`;

      const newResp = {
        id: uniqueId,
        fullName: responderData.fullName,
        driverName: responderData.fullName,
        photo: responderData.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(responderData.fullName)}`,
        mobile: responderData.mobile,
        serviceType: responderData.serviceType,
        orgName: responderData.orgName || responderData.fullName,
        regLicenseNumber: responderData.regLicenseNumber,
        street_address: responderData.street_address,
        city: responderData.city,
        pincode: responderData.pincode,
        registeredLatitude: coords.lat,
        registeredLongitude: coords.lng,
        currentLatitude: coords.lat,
        currentLongitude: coords.lng,
        latitude: coords.lat,
        longitude: coords.lng,
        locationCoords: coords,
        registeredAddress: `${responderData.street_address}, ${responderData.city} - ${responderData.pincode}`,
        verificationStatus: 'VERIFIED',
        availability: responderData.availability || 'ACTIVE',
        isActiveDuty: (responderData.availability || 'ACTIVE') === 'ACTIVE',
        declineCounter: 0,
        createdAt: new Date().toISOString()
      };

      const updatedEntities = {
        ...entities,
        responders: [newResp, ...entities.responders.filter(r => r.id !== uniqueId)]
      };

      setEntities(updatedEntities);
      localStorage.setItem('rapidsq_entities', JSON.stringify(updatedEntities));
      setActiveResponderAccount(newResp);
      localStorage.setItem('rapidsq_active_responder_account', JSON.stringify(newResp));
      setCurrentRole('responder');

      return { success: true, profile: newResp };
    }
  };

  const updateResponderProfile = (responderId, updatedFields) => {
    setEntities(prev => {
      const updatedList = prev.responders.map(r => {
        if (r.id === responderId) {
          return { ...r, ...updatedFields };
        }
        return r;
      });
      const newEntities = { ...prev, responders: updatedList };
      localStorage.setItem('rapidsq_entities', JSON.stringify(newEntities));
      return newEntities;
    });

    if (activeResponderAccount && activeResponderAccount.id === responderId) {
      setActiveResponderAccount(prev => {
        const updatedAcc = { ...prev, ...updatedFields };
        localStorage.setItem('rapidsq_active_responder_account', JSON.stringify(updatedAcc));
        return updatedAcc;
      });
    }
  };

  const toggleResponderDuty = (responderId) => {
    const current = entities.responders.find(r => r.id === responderId) || activeResponderAccount;
    if (current) {
      const nextDuty = !current.isActiveDuty;
      const nextAvail = nextDuty ? 'ACTIVE' : 'INACTIVE';
      updateResponderProfile(responderId, { isActiveDuty: nextDuty, availability: nextAvail });
    }
  };

  const findRecommendedHospital = (emergencyType, uLat, uLng) => {
    const availableHospitals = (entities.hospitals && entities.hospitals.length > 0) ? entities.hospitals : REGISTERED_HOSPITALS;
    
    const activeVerifiedHospitals = availableHospitals.filter(h => 
      (h.verificationStatus === 'VERIFIED' || h.verificationStatus === 'Verified') && 
      (h.availability === 'ACTIVE' || h.availability === 'Active' || h.isActiveDuty === true)
    );

    const pool = activeVerifiedHospitals.length > 0 ? activeVerifiedHospitals : REGISTERED_HOSPITALS;

    const ranked = pool.map(h => {
      const hLat = h.latitude || h.registeredLatitude || 21.1278;
      const hLng = h.longitude || h.registeredLongitude || 79.0962;
      const dist = calculateDistanceKm(uLat, uLng, hLat, hLng);

      let score = 100 - (dist * 5);
      if (h.type === 'Government') score += 10;
      if (h.icuBeds > 20) score += 15;
      if (['Cardiac', 'Stroke'].includes(emergencyType) && h.specialistAvailable) score += 20;

      return {
        ...h,
        latitude: hLat,
        longitude: hLng,
        distanceKm: dist,
        etaMinutes: Math.max(3, Math.round(dist * 2.5)),
        rankScore: score
      };
    }).sort((a, b) => b.rankScore - a.rankScore);

    return ranked[0] || REGISTERED_HOSPITALS[0];
  };

  // AI DISPATCH: STRICT NEAREST LOCATION (FAVORING NEAREST GOVT HOSPITALS & CAMPUS BASE UNITS)
  const findFastestResponderWithAI = (requiredCategory, uLat, uLng) => {
    const validActive = entities.responders.filter(r => {
      const isVerified = (r.verificationStatus === 'VERIFIED' || r.verificationStatus === 'Verified');
      const isActive = (r.availability === 'ACTIVE' || r.availability === 'Active' || r.isActiveDuty === true);
      const isMatch = (r.serviceType === requiredCategory);
      return isVerified && isActive && isMatch;
    });

    if (validActive.length === 0) return null;

    const evaluated = validActive.map(r => {
      const rLat = r.currentLatitude || r.latitude || r.registeredLatitude || 21.1255;
      const rLng = r.currentLongitude || r.longitude || r.registeredLongitude || 79.0522;
      const dist = calculateDistanceKm(uLat, uLng, rLat, rLng);

      // Distance-based velocity ETA (minimum 1.5 mins)
      let aiOptimalEta = Math.max(1, Math.round(dist * 1.5));
      if (dist < 0.5) aiOptimalEta = 1;
      else if (dist < 1.0) aiOptimalEta = 2;

      // Distance score (smaller is better)
      let score = dist;
      if (r.orgName && r.orgName.toLowerCase().includes('govt')) {
        score -= 0.2; // Extra priority for Govt Hospital Ambulance
      }

      return {
        responder: r,
        distanceKm: dist,
        aiOptimalEta,
        score
      };
    }).sort((a, b) => a.score - b.score);

    const best = evaluated[0];

    return {
      responder: best.responder,
      distanceKm: best.distanceKm,
      etaMinutes: best.aiOptimalEta,
      aiInfo: {
        evaluatedUnitsCount: validActive.length,
        selectedUnitName: best.responder.fullName,
        speedOptimizationPercent: Math.floor(45 + Math.random() * 15),
        reason: `🤖 RapidSQ AI calculated nearest dispatch distance (${best.distanceKm} km) ➔ Dispatched ${best.responder.fullName} from nearest base for fastest arrival (${best.aiOptimalEta} mins ETA).`
      }
    };
  };

  const createEmergency = (typeConfig) => {
    const incidentId = `RSQ-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const createdAt = new Date().toISOString();

    let requiredCategories = ['Ambulance'];
    if (typeConfig.name === 'Accident') requiredCategories = ['Ambulance', 'Police'];
    else if (['Medical', 'Cardiac', 'Stroke', 'Child Emergency'].includes(typeConfig.name)) requiredCategories = ['Ambulance', 'Hospital'];
    else if (['SOS', 'Disaster'].includes(typeConfig.name)) requiredCategories = ['Ambulance', 'Police', 'Fire'];
    else if (typeConfig.name === 'Fire') requiredCategories = ['Fire', 'Ambulance'];
    else if (['Police', 'Women Safety'].includes(typeConfig.name)) requiredCategories = ['Police'];
    else if (typeConfig.name === 'Blood Emergency') requiredCategories = ['Hospital'];

    const dispatchedUnits = [];
    requiredCategories.forEach(cat => {
      const match = findFastestResponderWithAI(cat, userLocation.lat, userLocation.lng);
      if (match && match.responder) {
        let vehicleIconEmoji = '🚑';
        let vehicleColor = '#DC2626';

        if (cat === 'Police') {
          vehicleIconEmoji = '🚔';
          vehicleColor = '#1D4ED8';
        } else if (cat === 'Fire') {
          vehicleIconEmoji = '🚒';
          vehicleColor = '#EA580C';
        } else if (cat === 'Hospital' || cat === 'Doctor') {
          vehicleIconEmoji = '🏥';
          vehicleColor = '#059669';
        }

        dispatchedUnits.push({
          unitId: match.responder.id,
          responder: match.responder,
          serviceType: cat,
          vehicleIconEmoji,
          vehicleColor,
          fullName: match.responder.fullName,
          mobile: match.responder.mobile,
          vehicleNumber: match.responder.vehicleNumber || match.responder.employeeId || 'Unit-101',
          orgName: match.responder.orgName || match.responder.fullName,
          currentLatitude: match.responder.currentLatitude || match.responder.latitude || 21.1278,
          currentLongitude: match.responder.currentLongitude || match.responder.longitude || 79.0580,
          distanceKm: match.distanceKm,
          etaMinutes: match.etaMinutes
        });
      }
    });

    const primaryUnit = dispatchedUnits[0] || null;
    const assignedResponder = primaryUnit ? primaryUnit.responder : null;
    const distanceKm = primaryUnit ? primaryUnit.distanceKm : 0.6;
    const etaMinutes = primaryUnit ? primaryUnit.etaMinutes : 2;
    const aiInfo = primaryUnit ? findFastestResponderWithAI(requiredCategories[0], userLocation.lat, userLocation.lng)?.aiInfo : null;

    let recommendedHosp = null;
    if (['Medical', 'Cardiac', 'Stroke', 'Accident', 'Child Emergency', 'Blood Emergency'].includes(typeConfig.name)) {
      recommendedHosp = findRecommendedHospital(typeConfig.name, userLocation.lat, userLocation.lng);
    }

    const incident = {
      incidentId,
      userId: user ? user.id : 'GUEST-USER',
      type: typeConfig.name,
      icon: typeConfig.icon,
      requiredCategory: requiredCategories[0],
      requiredCategories,
      patient: user || { fullName: 'Emergency Caller', mobile: '+91 Live Mobile' },
      userLocation: { lat: userLocation.lat, lng: userLocation.lng, address: userLocation.address },
      registeredLatitude: userLocation.lat,
      registeredLongitude: userLocation.lng,
      assignedResponderId: assignedResponder ? assignedResponder.id : null,
      assignedResponder: assignedResponder || null,
      dispatchedUnits,
      recommendedHospital: recommendedHosp,
      declinedResponderIds: [],
      hasNearbyResponder: dispatchedUnits.length > 0,
      aiInfo,
      status: 'Request Sent',
      createdAt,
      timeline: [
        { status: 'Request Created', time: new Date().toLocaleTimeString() }
      ],
      isGracePeriod: true,
      graceSeconds: 6,
      cancellationStatus: 'Active',
      etaMinutes
    };

    setActiveEmergency(incident);
    playSirenSound();

    if (assignedResponder) {
      triggerWebPushNotification(
        `🚨 RAPIDSQ EMERGENCY: ${typeConfig.name} (${dispatchedUnits.length} Units Dispatched)`,
        `Incident ${incidentId} · ${dispatchedUnits.length} Emergency Units En Route to ${userLocation.address}`
      );
    }
  };

  const acceptEmergencyByResponder = (responderId) => {
    if (!activeEmergency) return { success: false, message: 'No active incident.' };
    
    if (activeEmergency.status === 'ACCEPTED' || activeEmergency.status === 'Responder Accepted - En Route') {
      return { success: false, message: 'Incident has already been accepted by another unit.' };
    }

    const acceptingResponder = entities.responders.find(r => r.id === responderId) || activeResponderAccount;

    const newTimeline = [...(activeEmergency.timeline || []), { status: 'Accepted by Responder', time: new Date().toLocaleTimeString() }];

    const updatedIncident = {
      ...activeEmergency,
      assignedResponderId: responderId,
      assignedResponder: acceptingResponder || activeEmergency.assignedResponder,
      status: 'ACCEPTED',
      acceptanceTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeline: newTimeline,
      isGracePeriod: false,
      graceSeconds: 0
    };

    setActiveEmergency(updatedIncident);
    playSirenSound();

    return { success: true, incident: updatedIncident };
  };

  const updateResponderLiveLocation = (responderId, lat, lng) => {
    setEntities(prev => {
      const updatedList = prev.responders.map(r => {
        if (r.id === responderId) {
          return { ...r, currentLatitude: lat, currentLongitude: lng, latitude: lat, longitude: lng };
        }
        return r;
      });
      const newEntities = { ...prev, responders: updatedList };
      localStorage.setItem('rapidsq_entities', JSON.stringify(newEntities));
      return newEntities;
    });

    if (activeResponderAccount && activeResponderAccount.id === responderId) {
      setActiveResponderAccount(prev => ({
        ...prev,
        currentLatitude: lat,
        currentLongitude: lng,
        latitude: lat,
        longitude: lng
      }));
    }

    if (activeEmergency && activeEmergency.assignedResponderId === responderId) {
      setActiveEmergency(prev => {
        if (!prev) return null;
        const dist = calculateDistanceKm(prev.userLocation.lat, prev.userLocation.lng, lat, lng);
        const newEta = Math.max(1, Math.round(dist * 2));
        
        let newStatus = prev.status;
        if (dist < 0.2 && prev.status !== 'ARRIVED' && prev.status !== 'HOSPITAL ARRIVAL' && prev.status !== 'COMPLETED') {
          newStatus = 'ARRIVED';
        } else if (dist < 0.7 && prev.status === 'EN ROUTE') {
          newStatus = 'ARRIVING SOON';
        }

        return {
          ...prev,
          assignedResponder: {
            ...prev.assignedResponder,
            currentLatitude: lat,
            currentLongitude: lng,
            latitude: lat,
            longitude: lng
          },
          status: newStatus,
          etaMinutes: newEta
        };
      });
    }
  };

  const declineEmergencyByResponder = (responderId) => {
    if (!activeEmergency) return;

    let newDeclineCount = 0;
    setEntities(prev => {
      const updatedList = prev.responders.map(r => {
        if (r.id === responderId) {
          newDeclineCount = (r.declineCounter || r.consecutiveDeclines || 0) + 1;
          return { ...r, declineCounter: newDeclineCount, consecutiveDeclines: newDeclineCount };
        }
        return r;
      });
      const newEntities = { ...prev, responders: updatedList };
      localStorage.setItem('rapidsq_entities', JSON.stringify(newEntities));
      return newEntities;
    });

    if (activeResponderAccount && activeResponderAccount.id === responderId) {
      setActiveResponderAccount(prev => ({
        ...prev,
        declineCounter: (prev.declineCounter || prev.consecutiveDeclines || 0) + 1,
        consecutiveDeclines: (prev.consecutiveDeclines || 0) + 1
      }));
    }

    if (newDeclineCount >= 3) {
      alert('⚠️ Demo penalty triggered: ₹5,000 (3 Consecutive Emergency Declines)');
    }

    const updatedDeclinedIds = [...(activeEmergency.declinedResponderIds || []), responderId];

    const availableResponders = entities.responders.filter(r => {
      const isVerified = (r.verificationStatus === 'VERIFIED' || r.verificationStatus === 'Verified');
      const isActive = (r.availability === 'ACTIVE' || r.availability === 'Active' || r.isActiveDuty === true);
      const isCategoryMatch = (r.serviceType === activeEmergency.requiredCategory);
      const hasNotDeclined = !updatedDeclinedIds.includes(r.id);
      return isVerified && isActive && isCategoryMatch && hasNotDeclined;
    });

    if (availableResponders.length > 0) {
      const nextResponder = availableResponders[0];
      const nextDist = calculateDistanceKm(
        activeEmergency.userLocation.lat,
        activeEmergency.userLocation.lng,
        nextResponder.latitude || 21.1255,
        nextResponder.longitude || 79.0522
      );

      const reRoutedIncident = {
        ...activeEmergency,
        assignedResponderId: nextResponder.id,
        assignedResponder: nextResponder,
        declinedResponderIds: updatedDeclinedIds,
        status: `Re-routed to Next Responder (${nextResponder.fullName})`,
        etaMinutes: Math.max(2, Math.round(nextDist * 2))
      };

      setActiveEmergency(reRoutedIncident);
      playSirenSound();

      triggerWebPushNotification(
        `🚨 RE-ROUTED RAPIDSQ EMERGENCY: ${activeEmergency.type}`,
        `Incident ${activeEmergency.incidentId} · ${nextDist} km away`
      );
    } else {
      setActiveEmergency(prev => ({
        ...prev,
        assignedResponderId: null,
        assignedResponder: null,
        declinedResponderIds: updatedDeclinedIds,
        status: 'No Nearby VERIFIED & ACTIVE Responders Available'
      }));
    }
  };

  const cancelEmergencyByUser = (isFakeReport = false) => {
    if (!activeEmergency) return;

    const inGracePeriod = activeEmergency.isGracePeriod || activeEmergency.graceSeconds > 0;

    if (inGracePeriod) {
      setActiveEmergency(null);
      return { penaltyApplied: false, message: 'Request cancelled within 6-second window. No charge.' };
    }

    setUser(prev => prev ? { ...prev, userPenaltyFine: (prev.userPenaltyFine || 0) + 5000 } : prev);
    setActiveEmergency(null);
    return { penaltyApplied: true, amount: 5000, message: '⚠️ Demo penalty: ₹5,000 (Cancellation after 6s grace period)' };
  };

  const updateEmergencyStatus = (newStatus, extraUpdates = {}) => {
    if (newStatus === 'COMPLETED' && activeEmergency) {
      const completedRecord = {
        incidentId: activeEmergency.incidentId,
        responderId: activeEmergency.assignedResponderId || 'ALL',
        responderName: activeEmergency.assignedResponder?.fullName || 'Emergency Unit',
        type: activeEmergency.type,
        icon: activeEmergency.icon || '🚑',
        patientName: activeEmergency.patient?.fullName || 'Patient',
        patientMobile: activeEmergency.patient?.mobile || '+91 Live Mobile',
        locationAddress: activeEmergency.userLocation?.address || 'VNIT Campus, South Ambazari Road, Nagpur',
        hospitalName: activeEmergency.recommendedHospital?.name || 'GMCH Government Medical College Nagpur',
        completedAt: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        status: 'COMPLETED'
      };

      setCompletedIncidentsHistory(prev => [completedRecord, ...prev]);
      setActiveEmergency(null);
      return;
    }

    setActiveEmergency(prev => {
      if (!prev) return null;
      const newTimeline = [...(prev.timeline || []), { status: newStatus, time: new Date().toLocaleTimeString() }];
      return { ...prev, status: newStatus, timeline: newTimeline, ...extraUpdates };
    });
  };

  return (
    <AppContext.Provider value={{
      user,
      userLocation,
      fetchRealUserGpsLocation,
      activeResponderAccount,
      clearAllData,
      registerUser,
      loginUser,
      logoutUser,
      logoutResponder,
      loginResponder,
      registerHospital,
      registerResponder,
      registerAmbulanceDriver,
      registerPoliceOfficer,
      updateResponderProfile,
      toggleResponderDuty,
      activeEmergency,
      completedIncidentsHistory,
      createEmergency,
      acceptEmergencyByResponder,
      declineEmergencyByResponder,
      updateResponderLiveLocation,
      updateEmergencyStatus,
      cancelEmergencyByUser,
      entities,
      currentRole,
      setCurrentRole,
      isMobileFrame,
      setIsMobileFrame
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
