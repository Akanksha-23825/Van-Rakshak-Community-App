import React, { useState, useEffect } from 'react';
import './App.css';
import IncidentReportForm from './components/IncidentReportForm';
import AlertList from './components/AlertList';
import AlertDetailModal from './components/AlertDetailModal';
import LoginForm from './components/LoginForm';

function App() {
  const [activeTab, setActiveTab] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const saved = localStorage.getItem('vanrakshak_incidents');
    if (saved) {
      setIncidents(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever incidents change
  useEffect(() => {
    localStorage.setItem('vanrakshak_incidents', JSON.stringify(incidents));
  }, [incidents]);
  const [incidents, setIncidents] = useState([
    {
      id: 1,
      type: 'fire',
      incidentType: 'fire',
      description: 'Large forest fire spreading rapidly near the village',
      distance: '2.3 km away',
      timestamp: new Date(Date.now() - 600000).toISOString(), // 10 mins ago
      severity: 'high',
      location: { latitude: 12.9716, longitude: 77.5946, area: 'Bannerghatta Forest Range' },
      image: 'https://images.unsplash.com/photo-1525107226105-bd46b0c92f11?w=400',
      reporter: { name: 'Ravi Kumar', phone: '9876543210', village: 'Hosur Village' }
    },
    {
      id: 2,
      type: 'wildlife',
      incidentType: 'wildlife',
      description: 'Elephant herd (approx 8-10 elephants) moving towards village area',
      distance: '5.1 km away',
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      severity: 'medium',
      location: { latitude: 12.9516, longitude: 77.5846, area: 'Kaggalipura Forest Section' },
      image: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=400',
      reporter: { name: 'Lakshmi Devi', phone: '9123456789', village: 'Kaggalipura' }
    }
  ]);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const addIncident = (newIncident) => {
    const incident = {
      ...newIncident,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      distance: 'Your location',
      severity: newIncident.incidentType === 'fire' ? 'high' : 'medium',
      reporter: currentUser
    };
    
    setIncidents([incident, ...incidents]);
    setActiveTab('alerts');
  };

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setActiveTab('report');
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      setCurrentUser(null);
      setActiveTab('login');
    }
  };

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>🌿 Van Rakshak</h1>
            <p>Community Forest Protection</p>
          </div>
          <div className="user-info">
            <p className="user-name">👤 {currentUser.name}</p>
            <p className="user-village">📍 {currentUser.village}</p>
            <button className="logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="tab-navigation">
        <button 
          className={activeTab === 'report' ? 'active' : ''}
          onClick={() => setActiveTab('report')}
        >
          📝 Report Incident
        </button>
        <button 
          className={activeTab === 'alerts' ? 'active' : ''}
          onClick={() => setActiveTab('alerts')}
        >
          🔔 View Alerts ({incidents.length})
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'report' ? (
          <IncidentReportForm onSubmit={addIncident} />
        ) : (
          <AlertList alerts={incidents} onSelectAlert={setSelectedIncident} />
        )}
      </main>

      {selectedIncident && (
        <AlertDetailModal 
          incident={selectedIncident} 
          onClose={() => setSelectedIncident(null)} 
        />
      )}

      <footer className="app-footer">
        <p>Emergency Helpline: 📞 1800-XXX-XXXX | Forest Department</p>
      </footer>
    </div>
  );
}

export default App;