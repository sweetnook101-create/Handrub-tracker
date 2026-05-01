import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import LocationManager from './components/LocationManager';
import EntryForm from './components/EntryForm';

function AppContent() {
  const [view, setView] = useState('dashboard');
  const { loading } = useAuth();

if (isLineBrowser()) {
  return navigator.userAgent.toLowerCase().includes("line");
}
const [showLinePopup, setShowLinePopup] = useState(false);
function openExternal() {
  const url = window.location.href;

  if (/Android/i.test(navigator.userAgent)) {
    window.location.href = `intent://${url.replace(
      /^https?:\/\//,
      ""
    )}#Intent;scheme=https;package=com.android.chrome;end`;
  } else {
    window.location.href = url;
  }
}

useEffect(() => {
  if (isLineBrowser()) {
    document.getElementById("lineModal").style.display = "flex";
    setTimeout(openExternal, 1000);
  }
}, []);
  useEffect(() => {
  if (isLineBrowser()) {
    setShowLinePopup(true);
  }
}, []);
  if (loading) {
    return ({showLinePopup && ( ...popup... )}
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
