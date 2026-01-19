import React, { useState, useEffect } from 'react';
// 1. Import the speech library
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import './App.css';
import IncidentReportForm from './components/IncidentReportForm';
import AlertList from './components/AlertList';
import AlertDetailModal from './components/AlertDetailModal';
import LoginForm from './components/LoginForm';

function App() {
  const [activeTab, setActiveTab] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidents, setIncidents] = useState([
    {
      id: 1,
      type: 'fire',
      incidentType: 'fire',
      description: 'Large forest fire spreading rapidly near the village',
      distance: '2.3 km away',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      severity: 'high',
      location: { latitude: 12.9716, longitude: 77.5946, area: 'Bannerghatta Forest Range' },
      image: 'https://images.unsplash.com/photo-1525107226105-bd46b0c92f11?w=400',
      reporter: { name: 'Ravi Kumar', phone: '9876543210', village: 'Hosur Village' }
    }
  ]);

  // 2. Initialize Speech Recognition Hook
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    const saved = localStorage.getItem('vanrakshak_incidents');
    if (saved) {
      setIncidents(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage when incidents change
  useEffect(() => {
    localStorage.setItem('vanrakshak_incidents', JSON.stringify(incidents));
  }, [incidents]);

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
    if (window.confirm('Are you sure you want to logout?')) {
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
            {/* 3. Added Speech Control UI */}
            <div className="speech-controls" style={{ marginRight: '15px', textAlign: 'right' }}>
              {!browserSupportsSpeechRecognition ? (
                <small style={{ color: 'gray' }}>Mic not supported</small>
              ) : (
                <>
                  <button 
                    onClick={listening ? SpeechRecognition.stopListening : () => SpeechRecognition.startListening({ continuous: true })}
                    style={{ backgroundColor: listening ? '#ff4d4d' : '#4CAF50', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    {listening ? '🛑 Stop Mic' : '🎤 Start Mic'}
                  </button>
                  {transcript && <p style={{ fontSize: '10px', margin: '5px 0' }}>Listening: "{transcript.substring(0, 20)}..."</p>}
                </>
              )}
            </div>
            <p className="user-name">👤 {currentUser.name}</p>
            <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
          </div>
        </div>
      </header>

      <nav className="tab-navigation">
        <button className={activeTab === 'report' ? 'active' : ''} onClick={() => setActiveTab('report')}>
          📝 Report Incident
        </button>
        <button className={activeTab === 'alerts' ? 'active' : ''} onClick={() => setActiveTab('alerts')}>
          🔔 View Alerts ({incidents.length})
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'report' ? (
          <IncidentReportForm onSubmit={addIncident} voiceTranscript={transcript} />
        ) : (
          <AlertList alerts={incidents} onSelectAlert={setSelectedIncident} />
        )}
      </main>

      {selectedIncident && (
        <AlertDetailModal incident={selectedIncident} onClose={() => setSelectedIncident(null)} />
      )}

      <footer className="app-footer">
        <p>Emergency Helpline: 📞 1800-XXX-XXXX | Forest Department</p>
      </footer>
    </div>
  );
}

export default App;