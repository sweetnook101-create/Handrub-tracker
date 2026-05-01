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
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
      </div>
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
