/**
 * RAPIDSQ FIREBASE DATABASE SCHEMA DEFINITION
 * Maps 1:1 with Firebase Realtime Database / Firestore structure.
 */

export const formatUserForFirebase = (userData, userLocation) => {
  return {
    id: userData.id || `USER-${Date.now()}`,
    personalDetails: {
      fullName: userData.fullName || 'Emergency Caller',
      dob: userData.dob || '1996-05-12',
      mobile: userData.mobile || '9876543210',
      aadhaar: userData.aadhaar || '9999-8888-7777',
      bloodGroup: userData.bloodGroup || 'O+',
      allergies: userData.allergies || 'None',
      aadhaarVerified: true
    },
    emergencyContact: {
      contactName: userData.emergencyContactName || 'Family Contact',
      contactPhone: userData.emergencyContact || '9876500000'
    },
    location: {
      lat: userLocation?.lat || 21.1255,
      lng: userLocation?.lng || 79.0522,
      address: userLocation?.address || 'VNIT Campus, South Ambazari Road, Nagpur, Maharashtra 440010'
    },
    createdAt: new Date().toISOString()
  };
};

export const formatResponderForFirebase = (responderData) => {
  const serviceCat = responderData.serviceType || 'Ambulance';
  
  return {
    id: responderData.id || `RESP-${serviceCat.substring(0,3).toUpperCase()}-${Date.now()}`,
    serviceCategory: serviceCat,
    fullName: responderData.fullName,
    mobile: responderData.mobile,
    regLicenseNumber: responderData.regLicenseNumber || responderData.licenseNumber || responderData.employeeId,
    vehicleNumber: responderData.vehicleNumber || 'MH-31-RS-9999',
    ambulanceType: responderData.ambulanceType || 'Advanced Life Support (ALS)',
    employeeId: responderData.employeeId || 'EMP-1001',
    rank: responderData.rank || 'Officer',
    policeStation: responderData.policeStation || 'Bajaj Nagar Police Station',
    orgName: responderData.orgName || 'GMCH Govt Medical Hospital Ambulance Unit',
    locationCoords: {
      lat: responderData.locationCoords?.lat || responderData.latitude || 21.1255,
      lng: responderData.locationCoords?.lng || responderData.longitude || 79.0522,
      address: `${responderData.street_address || 'VNIT Campus'}, ${responderData.city || 'Nagpur'} - ${responderData.pincode || '440010'}`
    },
    verification: responderData.verificationStatus || 'Verified', // Pending | Verified | Rejected
    availability: responderData.availability || 'Active', // Active | Inactive
    createdAt: new Date().toISOString()
  };
};

export const formatEmergencyForFirebase = (incidentData) => {
  return {
    incidentId: incidentData.incidentId,
    user: {
      userId: incidentData.userId,
      patientName: incidentData.patient?.fullName || 'Patient',
      patientMobile: incidentData.patient?.mobile || '+91 Live Mobile'
    },
    location: {
      lat: incidentData.userLocation?.lat || 21.1255,
      lng: incidentData.userLocation?.lng || 79.0522,
      address: incidentData.userLocation?.address || 'VNIT Campus, South Ambazari Road, Nagpur'
    },
    emergencyType: incidentData.type,
    icon: incidentData.icon || '🚑',
    requiredCategory: incidentData.requiredCategory,
    assignedResponder: incidentData.assignedResponder ? {
      id: incidentData.assignedResponder.id,
      fullName: incidentData.assignedResponder.fullName,
      mobile: incidentData.assignedResponder.mobile,
      serviceType: incidentData.assignedResponder.serviceType
    } : null,
    status: incidentData.status, // Request Sent | ACCEPTED | EN ROUTE | ARRIVED | COMPLETED
    createdAt: incidentData.createdAt || new Date().toISOString()
  };
};

export const INITIAL_FIREBASE_DB = {
  Users: {},
  Responders: {
    AmbulanceDrivers: [
      {
        id: 'RESP-AMB-GOVT-01',
        fullName: 'GMCH Govt Hospital Ambulance (Driver Rajesh)',
        mobile: '9876543210',
        licenseNumber: 'DL-MH-2026-9901',
        vehicleNumber: 'MH-31-RS-1008',
        ambulanceType: 'Advanced Life Support (ALS ICU)',
        orgName: 'GMCH Government Medical College Nagpur',
        locationCoords: { lat: 21.1278, lng: 79.0580, address: 'GMCH Govt Emergency Base (0.7 km from VNIT)' },
        latitude: 21.1278,
        longitude: 79.0580,
        verification: 'Verified',
        availability: 'Active',
        isActiveDuty: true
      },
      {
        id: 'RESP-AMB-VNIT-02',
        fullName: 'VNIT Campus Emergency Ambulance (Driver Suresh)',
        mobile: '9876543219',
        licenseNumber: 'DL-MH-2026-8822',
        vehicleNumber: 'MH-31-RS-1002',
        ambulanceType: 'Basic Life Support (BLS)',
        orgName: 'VNIT Emergency Medical Center',
        locationCoords: { lat: 21.1258, lng: 79.0530, address: 'VNIT Health Center Base (0.2 km away)' },
        latitude: 21.1258,
        longitude: 79.0530,
        verification: 'Verified',
        availability: 'Active',
        isActiveDuty: true
      }
    ],
    Police: [
      {
        id: 'RESP-POL-201',
        fullName: 'Bajaj Nagar Police Patrol Unit (Officer Sharma)',
        mobile: '9876543211',
        employeeId: 'POL-ID-2026-01',
        rank: 'Sub-Inspector',
        policeStation: 'Bajaj Nagar Police Station Nagpur',
        locationCoords: { lat: 21.1240, lng: 79.0560, address: 'Bajaj Nagar Square (0.5 km from VNIT)' },
        latitude: 21.1240,
        longitude: 79.0560,
        verification: 'Verified',
        availability: 'Active',
        isActiveDuty: true
      }
    ],
    Fire: [
      {
        id: 'RESP-FIRE-301',
        fullName: 'Civil Lines Fire Station Rescue Unit',
        mobile: '9876543212',
        regLicenseNumber: 'FIRE-MH-3001',
        orgName: 'Civil Lines Fire Station Nagpur',
        locationCoords: { lat: 21.1350, lng: 79.0650, address: 'Fire Rescue Base Nagpur (1.8 km)' },
        latitude: 21.1350,
        longitude: 79.0650,
        verification: 'Verified',
        availability: 'Active',
        isActiveDuty: true
      }
    ],
    Doctors: [
      {
        id: 'RESP-DOC-401',
        fullName: 'Dr. Ananya Verma (GMCH Critical Care Specialist)',
        mobile: '9876543213',
        regLicenseNumber: 'MCI-REG-4001',
        orgName: 'GMCH Emergency ICU Unit',
        locationCoords: { lat: 21.1278, lng: 79.0962, address: 'Medical Square, Nagpur' },
        latitude: 21.1278,
        longitude: 79.0962,
        verification: 'Verified',
        availability: 'Active',
        isActiveDuty: true
      }
    ],
    Hospitals: [
      {
        id: 'HOSP-GOVT-01',
        name: 'Government Medical College & Hospital (GMCH) Nagpur',
        type: 'Government',
        regLicenseNumber: 'GOVT-MH-1001',
        mobile: '0712-2744401',
        icuBeds: 45,
        emergencyBeds: 25,
        locationCoords: { lat: 21.1278, lng: 79.0962, address: 'Medical Square, Hanuman Nagar, Nagpur' },
        latitude: 21.1278,
        longitude: 79.0962,
        verification: 'Verified',
        availability: 'Active',
        isActiveDuty: true
      }
    ]
  },
  Verification: {
    Pending: [],
    Verified: ['RESP-AMB-GOVT-01', 'RESP-AMB-VNIT-02', 'RESP-POL-201', 'RESP-FIRE-301', 'RESP-DOC-401', 'HOSP-GOVT-01'],
    Rejected: []
  },
  Availability: {
    Active: ['RESP-AMB-GOVT-01', 'RESP-AMB-VNIT-02', 'RESP-POL-201', 'RESP-FIRE-301', 'RESP-DOC-401', 'HOSP-GOVT-01'],
    Inactive: []
  },
  Emergencies: {},
  Notifications: {
    EmergencyAlert: [],
    AcceptDecline: [],
    StatusUpdates: []
  }
};
