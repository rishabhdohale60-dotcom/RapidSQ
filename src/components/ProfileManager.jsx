import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, UserPlus, Hospital, Siren, Stethoscope } from 'lucide-react';

export const ProfileManager = () => {
  const { entities, addEntity, deleteEntity } = useApp();
  const [activeTab, setActiveTab] = useState('doctors'); // 'doctors' | 'hospitals' | 'responders'

  // Doctor Form State
  const [doctorForm, setDoctorForm] = useState({ name: '', department: '', hospital: '', contact: '', status: 'On Duty' });

  // Hospital Form State
  const [hospitalForm, setHospitalForm] = useState({ name: '', type: 'Private', location: '', distance: '2.0 km', eta: '5 min', icuBeds: 10, emergencyBeds: 5, capability: 'General Trauma' });

  // Responder Form State
  const [responderForm, setResponderForm] = useState({ name: '', type: 'Ambulance', driver: '', contact: '', location: '', status: 'Available', equipment: 'Ventilator, Oxygen' });

  const handleAddDoctor = (e) => {
    e.preventDefault();
    if (!doctorForm.name || !doctorForm.hospital) return;
    addEntity('doctors', doctorForm);
    setDoctorForm({ name: '', department: '', hospital: '', contact: '', status: 'On Duty' });
  };

  const handleAddHospital = (e) => {
    e.preventDefault();
    if (!hospitalForm.name || !hospitalForm.location) return;
    addEntity('hospitals', hospitalForm);
    setHospitalForm({ name: '', type: 'Private', location: '', distance: '2.0 km', eta: '5 min', icuBeds: 10, emergencyBeds: 5, capability: 'General Trauma' });
  };

  const handleAddResponder = (e) => {
    e.preventDefault();
    if (!responderForm.name || !responderForm.driver) return;
    addEntity('responders', {
      ...responderForm,
      equipment: responderForm.equipment.split(',').map(s => s.trim())
    });
    setResponderForm({ name: '', type: 'Ambulance', driver: '', contact: '', location: '', status: 'Available', equipment: 'Ventilator, Oxygen' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>⚙️ Resource & Profile Manager</h2>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Add, view, and manage your custom Doctors, Hospitals, Ambulances, and Responders.
        </p>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
          <button 
            className={`btn-primary ${activeTab === 'doctors' ? '' : 'btn-outline'}`}
            style={{ flex: 1, padding: '8px 10px', fontSize: '12px' }}
            onClick={() => setActiveTab('doctors')}
          >
            👨‍⚕️ Doctors ({entities.doctors.length})
          </button>
          <button 
            className={`btn-primary ${activeTab === 'hospitals' ? '' : 'btn-outline'}`}
            style={{ flex: 1, padding: '8px 10px', fontSize: '12px' }}
            onClick={() => setActiveTab('hospitals')}
          >
            🏥 Hospitals ({entities.hospitals.length})
          </button>
          <button 
            className={`btn-primary ${activeTab === 'responders' ? '' : 'btn-outline'}`}
            style={{ flex: 1, padding: '8px 10px', fontSize: '12px' }}
            onClick={() => setActiveTab('responders')}
          >
            🚑 Responders ({entities.responders.length})
          </button>
        </div>
      </div>

      {/* Doctor Management */}
      {activeTab === 'doctors' && (
        <div className="card">
          <h3 className="card-title">👨‍⚕️ Add Doctor Profile</h3>
          <form onSubmit={handleAddDoctor} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Doctor Name *</label>
                <input className="form-input" placeholder="e.g. Dr. A. Sharma" value={doctorForm.name} onChange={e => setDoctorForm({ ...doctorForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Specialty / Dept</label>
                <input className="form-input" placeholder="e.g. Trauma Care" value={doctorForm.department} onChange={e => setDoctorForm({ ...doctorForm, department: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Hospital *</label>
                <input className="form-input" placeholder="e.g. Apollo Hospital" value={doctorForm.hospital} onChange={e => setDoctorForm({ ...doctorForm, hospital: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input className="form-input" placeholder="+91 98000 11122" value={doctorForm.contact} onChange={e => setDoctorForm({ ...doctorForm, contact: e.target.value })} />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '10px' }}>
              <Plus size={16} /> Add Doctor Profile
            </button>
          </form>

          <h4 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>Configured Doctor Profiles</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {entities.doctors.map(d => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', border: '1px solid var(--border-color)' }}>
                <div>
                  <strong>{d.name}</strong> ({d.department})
                  <div style={{ color: 'var(--text-muted)' }}>{d.hospital} · {d.contact}</div>
                </div>
                <button className="btn-outline" style={{ color: 'var(--danger-red)', padding: '4px 8px' }} onClick={() => deleteEntity('doctors', d.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hospital Management */}
      {activeTab === 'hospitals' && (
        <div className="card">
          <h3 className="card-title">🏥 Add Hospital Profile</h3>
          <form onSubmit={handleAddHospital} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Hospital Name *</label>
                <input className="form-input" placeholder="e.g. City General" value={hospitalForm.name} onChange={e => setHospitalForm({ ...hospitalForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Hospital Type</label>
                <select className="form-select" value={hospitalForm.type} onChange={e => setHospitalForm({ ...hospitalForm, type: e.target.value })}>
                  <option value="Private">🏢 Private</option>
                  <option value="Government">🏛️ Government</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Address / Location *</label>
                <input className="form-input" placeholder="e.g. Baner Road, Pune" value={hospitalForm.location} onChange={e => setHospitalForm({ ...hospitalForm, location: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Capability</label>
                <input className="form-input" placeholder="e.g. Level 1 Cardiac" value={hospitalForm.capability} onChange={e => setHospitalForm({ ...hospitalForm, capability: e.target.value })} />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '10px' }}>
              <Plus size={16} /> Add Hospital Profile
            </button>
          </form>

          <h4 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>Configured Hospitals</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {entities.hospitals.map(h => (
              <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', border: '1px solid var(--border-color)' }}>
                <div>
                  <strong>{h.name}</strong> ({h.type})
                  <div style={{ color: 'var(--text-muted)' }}>{h.location} · {h.capability}</div>
                </div>
                <button className="btn-outline" style={{ color: 'var(--danger-red)', padding: '4px 8px' }} onClick={() => deleteEntity('hospitals', h.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Responder Management */}
      {activeTab === 'responders' && (
        <div className="card">
          <h3 className="card-title">🚑 Add Responder Fleet Profile</h3>
          <form onSubmit={handleAddResponder} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Vehicle Name / Unit *</label>
                <input className="form-input" placeholder="e.g. ALS Ambulance #12" value={responderForm.name} onChange={e => setResponderForm({ ...responderForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Responder Type</label>
                <select className="form-select" value={responderForm.type} onChange={e => setResponderForm({ ...responderForm, type: e.target.value })}>
                  <option value="Ambulance">🚑 Ambulance</option>
                  <option value="Police">👮 Police</option>
                  <option value="Fire">🔥 Fire Service</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Driver / Marshal Name *</label>
                <input className="form-input" placeholder="e.g. Suresh Patil" value={responderForm.driver} onChange={e => setResponderForm({ ...responderForm, driver: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Base Location</label>
                <input className="form-input" placeholder="e.g. Station Road" value={responderForm.location} onChange={e => setResponderForm({ ...responderForm, location: e.target.value })} />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '10px' }}>
              <Plus size={16} /> Add Responder Unit
            </button>
          </form>

          <h4 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>Configured Responders</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {entities.responders.map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', border: '1px solid var(--border-color)' }}>
                <div>
                  <strong>{r.name}</strong> ({r.type})
                  <div style={{ color: 'var(--text-muted)' }}>Driver: {r.driver} · Location: {r.location}</div>
                </div>
                <button className="btn-outline" style={{ color: 'var(--danger-red)', padding: '4px 8px' }} onClick={() => deleteEntity('responders', r.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
