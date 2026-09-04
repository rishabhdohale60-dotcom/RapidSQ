import React, { useEffect, useState } from 'react';
import { useApp, calculateDistanceKm } from '../context/AppContext';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Phone, Search, Clock, ShieldAlert, XCircle, CheckCircle2, User, MapPin, Hospital, Zap, Activity, Navigation, ExternalLink, Bot, Sparkles, Navigation2 } from 'lucide-react';

const createCustomIcon = (emoji, color) => {
  return L.divIcon({
    html: `
      <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
        <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:${color}; opacity:0.3; animation:pulse 2s infinite;"></div>
        <div style="background:${color}; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; color:white; border:3px solid white; box-shadow:0 6px 16px rgba(0,0,0,0.3); z-index:2;">${emoji}</div>
      </div>
    `,
    className: '',
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });
};

const userIcon = createCustomIcon('👤', '#1E40AF');

const AutoFitBounds = ({ userPos, units }) => {
  const map = useMap();
  useEffect(() => {
    if (userPos && units && units.length > 0) {
      const points = [[userPos.lat, userPos.lng]];
      units.forEach(u => {
        if (u.currentLatitude && u.currentLongitude) {
          points.push([u.currentLatitude, u.currentLongitude]);
        }
      });
      if (points.length > 1) {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }
  }, [userPos, units, map]);
  return null;
};

// Generate realistic street waypoints between start and end coordinates
const generateStreetWaypoints = (startLat, startLng, endLat, endLng) => {
  const midLat1 = startLat + (endLat - startLat) * 0.35 + 0.0012;
  const midLng1 = startLng + (endLng - startLng) * 0.25 - 0.0008;
  
  const midLat2 = startLat + (endLat - startLat) * 0.70 - 0.0006;
  const midLng2 = startLng + (endLng - startLng) * 0.75 + 0.0010;

  return [
    [startLat, startLng],
    [midLat1, midLng1],
    [midLat2, midLng2],
    [endLat, endLng]
  ];
};

export const EmergencyTracker = () => {
  const { activeEmergency, updateEmergencyStatus, cancelEmergencyByUser, updateResponderLiveLocation } = useApp();
  
  const [graceSeconds, setGraceSeconds] = useState(activeEmergency?.graceSeconds || 6);
  const [inGracePeriod, setInGracePeriod] = useState(activeEmergency?.isGracePeriod ?? true);

  const [unitsPos, setUnitsPos] = useState(() => {
    if (activeEmergency?.dispatchedUnits && activeEmergency.dispatchedUnits.length > 0) {
      return activeEmergency.dispatchedUnits.map(u => {
        const sLat = u.currentLatitude || 21.1278;
        const sLng = u.currentLongitude || 79.0580;
        const eLat = activeEmergency.userLocation.lat;
        const eLng = activeEmergency.userLocation.lng;

        const streetPoints = generateStreetWaypoints(sLat, sLng, eLat, eLng);

        return {
          unitId: u.unitId,
          serviceType: u.serviceType,
          vehicleIconEmoji: u.vehicleIconEmoji || '🚑',
          vehicleColor: u.vehicleColor || '#DC2626',
          fullName: u.fullName,
          mobile: u.mobile,
          vehicleNumber: u.vehicleNumber,
          lat: sLat,
          lng: sLng,
          streetPoints,
          pointIndex: 0,
          distanceKm: u.distanceKm || 0.6,
          etaMinutes: u.etaMinutes || 2
        };
      });
    }
    const defaultStreetPoints = generateStreetWaypoints(21.1278, 79.0580, 21.1255, 79.0522);
    return [{
      unitId: 'RESP-AMB-101',
      serviceType: 'Ambulance',
      vehicleIconEmoji: '🚑',
      vehicleColor: '#DC2626',
      fullName: 'GMCH Govt Hospital Ambulance',
      mobile: '9876543210',
      vehicleNumber: 'MH-31-RS-1008',
      lat: 21.1278,
      lng: 79.0580,
      streetPoints: defaultStreetPoints,
      pointIndex: 0,
      distanceKm: 0.6,
      etaMinutes: 2
    }];
  });

  // Fetch Real Street Routes from OSRM Routing Machine
  useEffect(() => {
    if (!activeEmergency || inGracePeriod) return;

    const uLat = activeEmergency.userLocation.lat;
    const uLng = activeEmergency.userLocation.lng;

    unitsPos.forEach(async (u, idx) => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${u.lng},${u.lat};${uLng},${uLat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && data.routes && data.routes[0] && data.routes[0].geometry) {
            const rawCoords = data.routes[0].geometry.coordinates; // [[lng, lat], ...]
            const routePoints = rawCoords.map(c => [c[1], c[0]]); // [[lat, lng], ...]
            if (routePoints.length > 2) {
              setUnitsPos(prev => {
                const next = [...prev];
                if (next[idx]) {
                  next[idx] = { ...next[idx], streetPoints: routePoints, pointIndex: 0 };
                }
                return next;
              });
            }
          }
        }
      } catch (err) {
        console.log('OSRM routing fetch note:', err);
      }
    });
  }, [activeEmergency, inGracePeriod]);

  // 6-Second Grace Period Countdown
  useEffect(() => {
    if (!activeEmergency || !inGracePeriod) return;

    const timer = setInterval(() => {
      setGraceSeconds(prev => {
        if (prev <= 1) {
          setInGracePeriod(false);
          updateEmergencyStatus('Searching for nearby VERIFIED & ACTIVE responder...', { isGracePeriod: false, graceSeconds: 0 });
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeEmergency, inGracePeriod]);

  // Smooth movement step-by-step along actual street road waypoints
  useEffect(() => {
    if (!activeEmergency || inGracePeriod) return;

    const userLat = activeEmergency.userLocation.lat;
    const userLng = activeEmergency.userLocation.lng;

    const interval = setInterval(() => {
      setUnitsPos(prevUnits => {
        return prevUnits.map(u => {
          const pts = u.streetPoints || [];
          let nextIdx = u.pointIndex + 1;
          
          let currentLat = u.lat;
          let currentLng = u.lng;

          if (pts.length > 0 && nextIdx < pts.length) {
            currentLat = pts[nextIdx][0];
            currentLng = pts[nextIdx][1];
          } else {
            // Smoothly converge to patient if waypoints reached
            const dLat = (userLat - u.lat) * 0.25;
            const dLng = (userLng - u.lng) * 0.25;
            currentLat = parseFloat((u.lat + dLat).toFixed(4));
            currentLng = parseFloat((u.lng + dLng).toFixed(4));
          }

          const remDist = calculateDistanceKm(userLat, userLng, currentLat, currentLng);
          const remEta = Math.max(1, Math.round(remDist * 1.5));

          if (u.unitId && activeEmergency.assignedResponderId === u.unitId) {
            updateResponderLiveLocation(u.unitId, currentLat, currentLng);
          }

          return {
            ...u,
            lat: currentLat,
            lng: currentLng,
            pointIndex: nextIdx,
            distanceKm: remDist,
            etaMinutes: remEta
          };
        });
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [activeEmergency, inGracePeriod]);

  if (!activeEmergency) return null;

  const { incidentId, type, icon, userLocation, status, requiredCategory, aiInfo } = activeEmergency;

  const handleCancelClick = () => {
    const res = cancelEmergencyByUser(false);
    if (res && res.penaltyApplied) {
      alert(res.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '14px' }}>
      {/* 6-SECOND COUNTDOWN SCREEN */}
      {inGracePeriod ? (
        <div className="card" style={{ border: '2px solid var(--bright-blue)', background: 'var(--light-blue-bg)', textAlign: 'center', padding: '24px 16px' }}>
          <div style={{ background: 'var(--bright-blue)', color: 'white', display: 'inline-flex', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', marginBottom: '12px' }}>
            🚨 EMERGENCY REQUEST PENDING
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--royal-blue-dark)', marginBottom: '4px' }}>
            {icon} {type} Emergency
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Emergency request will be sent in <strong>00:0{graceSeconds}s</strong>
          </p>

          <div style={{ background: 'white', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '18px', textAlign: 'left', fontSize: '12px' }}>
            <div>Incident ID: <strong>{incidentId}</strong></div>
            <div>Required Category: <strong style={{ color: 'var(--bright-blue)' }}>{requiredCategory}</strong></div>
            <div>Patient GPS Location: <strong>{userLocation.address}</strong></div>
          </div>

          <button 
            className="btn-danger" 
            style={{ padding: '14px', fontSize: '14px', borderRadius: '12px', width: '100%' }}
            onClick={handleCancelClick}
          >
            CANCEL (₹0 Charge)
          </button>
        </div>
      ) : (
        /* LIVE STREET ROAD MAP TRACKING SCREEN */
        <>
          <div className="card" style={{ padding: '16px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <span className={`badge ${status === 'ARRIVED' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '10px' }}>
                  {status === 'ARRIVED' ? '📍 RESPONDER ARRIVED AT PATIENT' : `🚨 STATUS: ${status.toUpperCase()}`}
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--royal-blue-dark)', marginTop: '4px' }}>
                  {icon} {type} Emergency
                </h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)' }}>INCIDENT ID</div>
                <div style={{ fontSize: '14px', fontWeight: '900', color: 'var(--bright-blue)' }}>{incidentId}</div>
              </div>
            </div>

            <div style={{ background: 'var(--light-blue-bg)', padding: '12px', borderRadius: '10px', fontSize: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>📍 Patient GPS Location: <strong>{userLocation.address}</strong></div>
              <div>Coordinates: <strong>Lat {userLocation.lat}, Lng {userLocation.lng}</strong></div>
              <div>Navigation Mode: <strong style={{ color: 'var(--success-green)' }}>🛣️ Real Street Road Network Routing Active</strong></div>
            </div>
          </div>

          {/* 🤖 RAPIDSQ AI FAST-DISPATCH ENGINE CARD */}
          {aiInfo && (
            <div className="card" style={{ border: '2px solid var(--bright-blue)', background: 'linear-gradient(135deg, #EBF3FA 0%, #FFFFFF 100%)', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', padding: '4px 10px' }}>
                  <Bot size={14} color="var(--bright-blue)" /> 🤖 RAPIDSQ AI DISPATCH & ROUTE OPTIMIZER
                </span>
                <span className="badge badge-success" style={{ fontSize: '9px' }}>
                  ⚡ REAL ROAD ROUTE NAVIGATION
                </span>
              </div>

              <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--royal-blue-dark)', marginBottom: '4px' }}>
                {aiInfo.reason}
              </div>
            </div>
          )}

          {/* CLEAN REAL STREET ROAD MAP CONTAINER */}
          <div className="card" style={{ padding: '6px' }}>
            <div style={{ height: '280px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
              <MapContainer 
                center={[userLocation.lat, userLocation.lng]} 
                zoom={14} 
                zoomControl={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <AutoFitBounds userPos={userLocation} units={unitsPos} />

                {/* Patient Pin */}
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                  <Popup><strong>Patient Location</strong><br />{userLocation.address}</Popup>
                </Marker>

                {/* Dynamic Vehicle Markers (Police Van 🚔, Ambulance 🚑, Fire Truck 🚒, Medical 🏥) */}
                {unitsPos.map((u, idx) => {
                  const icon = createCustomIcon(u.vehicleIconEmoji || '🚑', u.vehicleColor || '#DC2626');
                  const remainingRoute = (u.streetPoints && u.streetPoints.length > 0)
                    ? u.streetPoints.slice(Math.min(u.pointIndex, u.streetPoints.length - 1))
                    : [[u.lat, u.lng], [userLocation.lat, userLocation.lng]];

                  return (
                    <React.Fragment key={idx}>
                      <Marker position={[u.lat, u.lng]} icon={icon}>
                        <Popup>
                          <strong>{u.vehicleIconEmoji} {u.fullName}</strong><br />
                          Service: <strong>{u.serviceType}</strong><br />
                          Vehicle: <strong>{u.vehicleNumber}</strong><br />
                          Phone: <strong>{u.mobile}</strong>
                        </Popup>
                      </Marker>

                      {/* Real Street Network Polyline Route to Patient */}
                      <Polyline 
                        positions={remainingRoute} 
                        color={u.vehicleColor || '#1656D9'} 
                        weight={5}
                        opacity={0.9}
                      />
                    </React.Fragment>
                  );
                })}
              </MapContainer>
            </div>
          </div>

          {/* DISPATCHED UNITS SUMMARY CARD */}
          <div className="card" style={{ padding: '16px', background: '#FFFFFF' }}>
            <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--royal-blue-dark)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>⚡ DISPATCHED EMERGENCY UNITS ({unitsPos.length} UNITS EN ROUTE VIA STREET ROUTE)</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {unitsPos.map((u, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: 'var(--light-blue-bg)',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '24px', background: 'white', padding: '6px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                      {u.vehicleIconEmoji}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--royal-blue-dark)' }}>
                        {u.fullName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {u.serviceType} Unit · Vehicle: <strong>{u.vehicleNumber}</strong>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--success-green)', fontWeight: '800', marginTop: '2px' }}>
                        Distance: <strong>{u.distanceKm} km away</strong> (ETA {u.etaMinutes} mins)
                      </div>
                    </div>
                  </div>

                  <a 
                    href={`tel:${u.mobile}`} 
                    className="btn-navy-primary"
                    style={{ width: 'auto', padding: '8px 12px', fontSize: '11px', borderRadius: '10px', textDecoration: 'none' }}
                  >
                    <Phone size={14} /> Call
                  </a>
                </div>
              ))}
            </div>

            <button 
              className="btn-outline" 
              style={{ width: '100%', padding: '12px', color: 'var(--emergency-red)', borderColor: 'var(--emergency-red)', fontSize: '13px', fontWeight: '800', marginTop: '14px' }}
              onClick={handleCancelClick}
            >
              <XCircle size={16} /> Cancel Emergency Request
            </button>
          </div>
        </>
      )}
    </div>
  );
};
