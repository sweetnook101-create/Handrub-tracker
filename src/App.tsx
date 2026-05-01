import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import LocationManager from './components/LocationManager';
import EntryForm from './components/EntryForm';

function AppContent() {
  const [view, setView] = useState('dashboard');
  const { loading } = useAuth();

  if (loading) {
    return (
  <>
    {/* ✅ Popup */}
    <div id="lineModal" className="modal">
      <div style={{background:"white", padding:"20px", borderRadius:"12px"}}>
        <h3>กรุณาเปิดผ่าน Chrome</h3>
        <button onClick={openExternal}>เปิด</button>
      </div>
    </div>

    {/* ✅ Layout หลัก */}
    <Layout activeView={view} onViewChange={setView}>
      <div className="py-4">
        {view === 'dashboard' && <Dashboard />}
        {view === 'locations' && <LocationManager />}
        {view === 'entry' && <EntryForm onComplete={() => setView('dashboard')} />}
      </div>
    </Layout>
  </>
);
  }

  return (
    <Layout activeView={view} onViewChange={setView}>
      <div className="py-4">
        {view === 'dashboard' && <Dashboard />}
        {view === 'locations' && <LocationManager />}
        {view === 'entry' && <EntryForm onComplete={() => setView('dashboard')} />}
      </div>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
