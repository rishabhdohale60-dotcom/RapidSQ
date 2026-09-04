import React from 'react';
import { useApp } from '../context/AppContext';
import { Play, Settings, Smartphone, Monitor, Trash2 } from 'lucide-react';

export const NavigationHeader = ({ onStartDemo }) => {
  const { currentRole, setCurrentRole, isMobileFrame, setIsMobileFrame, clearAllData } = useApp();

  const handleReset = () => {
    if (window.confirm('Are you sure you want to delete all saved patient and doctor/responder data? You will be able to register fresh profiles.')) {
      clearAllData();
      alert('✅ All patient and responder database records have been cleared!');
    }
  };

  return (
    <div className="floating-dev-menu">
      <span style={{ fontSize: '11px', color: 'white', fontWeight: '800' }}>⚡ Portal:</span>
      <select 
        value={currentRole} 
        onChange={(e) => setCurrentRole(e.target.value)}
      >
        <option value="user">👤 User App</option>
        <option value="responder">🚑 Responder App</option>
        <option value="hospital">🏥 Hospital Portal</option>
        <option value="doctor">👨‍⚕️ Doctor View</option>
        <option value="police_fire">👮 Police & Fire</option>
        <option value="command_center">🎛️ Command Center</option>
      </select>

      <button className="role-btn demo-btn" onClick={onStartDemo} style={{ padding: '4px 10px', fontSize: '10px' }}>
        ▶ DEMO
      </button>

      <button 
        className="role-btn" 
        style={{ padding: '4px 8px', fontSize: '10px', background: 'var(--emergency-red)', color: 'white', border: 'none' }}
        onClick={handleReset}
        title="Clear all saved database records"
      >
        <Trash2 size={11} /> RESET DATA
      </button>

      <button 
        className="role-btn btn-outline" 
        style={{ padding: '4px 6px', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
        onClick={() => setIsMobileFrame(!isMobileFrame)}
        title="Toggle Frame"
      >
        {isMobileFrame ? <Monitor size={12} /> : <Smartphone size={12} />}
      </button>
    </div>
  );
};
