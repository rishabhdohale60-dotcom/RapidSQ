import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { NavigationHeader } from './components/NavigationHeader';
import { RegistrationFlow } from './components/RegistrationFlow';
import { UserHome } from './components/UserHome';
import { EmergencyTracker } from './components/EmergencyTracker';
import { HospitalPortal } from './components/HospitalPortal';
import { DoctorPortal } from './components/DoctorPortal';
import { ResponderPortal } from './components/ResponderPortal';
import { PoliceFirePortal } from './components/PoliceFirePortal';
import { CommandCenter } from './components/CommandCenter';
import { ProfileManager } from './components/ProfileManager';
import { DemoModeModal } from './components/DemoModeModal';

function AppContent() {
  const { user, activeResponderAccount, activeEmergency, currentRole, isMobileFrame } = useApp();
  const [showDemoModal, setShowDemoModal] = useState(false);

  const renderRoleView = () => {
    switch (currentRole) {
      case 'responder':
        if (activeResponderAccount) return <ResponderPortal />;
        return <RegistrationFlow />;
      case 'hospital':
        if (activeResponderAccount) return <HospitalPortal />;
        return <RegistrationFlow />;
      case 'doctor':
        if (activeResponderAccount) return <DoctorPortal />;
        return <RegistrationFlow />;
      case 'police_fire':
        if (activeResponderAccount) return <PoliceFirePortal />;
        return <RegistrationFlow />;
      case 'command_center':
        return <CommandCenter />;
      case 'user':
      default:
        if (user && user.isAuthenticated) {
          return activeEmergency ? <EmergencyTracker /> : <UserHome />;
        }
        if (activeResponderAccount) {
          return <ResponderPortal />;
        }
        return <RegistrationFlow />;
    }
  };

  return (
    <div className={`app-wrapper ${isMobileFrame ? 'mobile-frame-container' : ''}`}>
      <NavigationHeader onStartDemo={() => setShowDemoModal(true)} />
      <main className="main-content">
        {renderRoleView()}
      </main>

      {showDemoModal && (
        <DemoModeModal onClose={() => setShowDemoModal(false)} />
      )}
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
