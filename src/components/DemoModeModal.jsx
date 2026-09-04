import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Play, CheckCircle2, Siren, ShieldCheck, Hospital, Stethoscope, MapPin, X } from 'lucide-react';

const DEMO_STEPS = [
  { step: 1, text: '🚗 Accident Emergency Triggered', desc: 'Simulating emergency tap' },
  { step: 2, text: '📍 GPS Location Acquired', desc: 'MG Road, Pune 411001' },
  { step: 3, text: '🆔 Incident Created', desc: 'RSQ-2026-DEMO99' },
  { step: 4, text: '🚑 Ambulance Assigned', desc: 'Advanced ALS Ambulance #01' },
  { step: 5, text: '👮 Police Patrol Notified', desc: 'Shivajinagar Police Unit #03' },
  { step: 6, text: '🏥 Hospital Selected & Reasoned', desc: 'Apollo Hospital (Fastest ETA & 12 ICU beds)' },
  { step: 7, text: '👨‍⚕️ Doctor Notified in ER', desc: 'Dr. Ramesh Sharma' },
  { step: 8, text: '✅ Responder Accepted Dispatch', desc: 'Ambulance status updated to En Route' },
  { step: 9, text: '🚦 Green Corridor Optimized', desc: 'Normal ETA: 12 min → Optimized: 6 min' },
  { step: 10, text: '🗺️ Ambulance Moving on Live Map', desc: 'GPS tracking active' },
  { step: 11, text: '⏱️ ETA Updating Dynamically', desc: '6 min → 4 min → 2 min → Arriving Soon' },
  { step: 12, text: '🏥 Hospital Prepares Emergency Unit', desc: 'ICU trauma room reserved' },
  { step: 13, text: '📍 Ambulance Arrived at Scene', desc: 'Responder on site' },
  { step: 14, text: '🏁 Incident Completed', desc: 'End-to-End simulation successfully finished!' }
];

export const DemoModeModal = ({ onClose }) => {
  const { createEmergency, updateEmergencyStatus, cancelEmergency, setCurrentRole } = useApp();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    // Step 1: Start emergency
    createEmergency({ name: 'Accident', icon: '🚗' });
    setCurrentRole('user');

    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev < DEMO_STEPS.length - 1) {
          const nextIndex = prev + 1;
          
          // Trigger corresponding state updates
          if (nextIndex === 3) updateEmergencyStatus('Responder Assigned');
          if (nextIndex === 7) updateEmergencyStatus('Responder Accepted');
          if (nextIndex === 11) updateEmergencyStatus('Hospital Prepares Emergency Unit');
          if (nextIndex === 12) updateEmergencyStatus('Arrived');

          return nextIndex;
        } else {
          setIsPlaying(false);
          clearInterval(interval);
          return prev;
        }
      });
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '480px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', color: 'white', padding: '6px 10px', borderRadius: '8px', fontWeight: '800', fontSize: '13px' }}>
              ▶ AUTOMATED DEMO
            </div>
            <span className="badge badge-warning">SIMULATION MODE</span>
          </div>
          <button className="btn-outline" style={{ padding: '4px 8px' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>
          Step-by-Step RapidSQ Emergency Sequence
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Demonstrating automated responder dispatch, GPS tracking, and hospital coordination.
        </p>

        {/* Current Step Progress Card */}
        <div style={{ background: 'var(--accent-blue-light)', border: '2px solid var(--accent-blue)', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-blue)', textTransform: 'uppercase', marginBottom: '4px' }}>
            Step {currentStepIndex + 1} of {DEMO_STEPS.length}
          </div>
          <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)', marginBottom: '2px' }}>
            {DEMO_STEPS[currentStepIndex].text}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {DEMO_STEPS[currentStepIndex].desc}
          </div>
        </div>

        {/* List of Steps with Indicators */}
        <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px', marginBottom: '16px' }}>
          {DEMO_STEPS.map((s, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', opacity: idx <= currentStepIndex ? 1 : 0.4 }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: idx <= currentStepIndex ? 'var(--success-green)' : 'var(--border-color)', color: 'white', fontSize: '10px', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: '800', flexShrink: 0 }}>
                {idx < currentStepIndex ? '✓' : idx + 1}
              </div>
              <span style={{ fontWeight: idx === currentStepIndex ? '800' : '500', color: idx === currentStepIndex ? 'var(--accent-blue)' : 'inherit' }}>
                {s.text}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary btn-outline" style={{ flex: 1 }} onClick={onClose}>
            Close Demo
          </button>
          <button className="btn-primary" style={{ flex: 1 }} onClick={() => {
            setCurrentRole('user');
            onClose();
          }}>
            View Live Tracker Screen →
          </button>
        </div>
      </div>
    </div>
  );
};
