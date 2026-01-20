import React, { useState, useEffect } from 'react';
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
  
  const [incidents, setIncidents] = useState(() => {
    const saved = localStorage.getItem('vanrakshak_incidents');
    return saved ? JSON.parse(saved) : [];
  });

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    localStorage.setItem('vanrakshak_incidents', JSON.stringify(incidents));
  }, [incidents]);

  const addIncident = (newIncident) => {
    const incident = {
      ...newIncident,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      distance: 'Your location',
      severity: (newIncident.type === 'fire' || newIncident.incidentType === 'fire') ? 'high' : 'medium',
      reporter: currentUser
    };
    setIncidents([incident, ...incidents]);
    resetTranscript();
    setActiveTab('alerts');
  };

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setActiveTab('report');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      setIncidents([]);
      localStorage.removeItem('vanrakshak_incidents');
      setCurrentUser(null);
      resetTranscript();
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
        <button className={activeTab === 'report' ? 'active' : ''} onClick={() => setActiveTab('report')}>📝 Report Incident</button>
        <button className={activeTab === 'alerts' ? 'active' : ''} onClick={() => setActiveTab('alerts')}>🔔 View Alerts ({incidents.length})</button>
      </nav>

      <main className="main-content">
        {activeTab === 'report' ? (
          <IncidentReportForm onSubmit={addIncident} voiceTranscript={transcript} />
        ) : (
          <AlertList alerts={incidents} onSelectAlert={setSelectedIncident} />
        )}
      </main>

      {selectedIncident && <AlertDetailModal incident={selectedIncident} onClose={() => setSelectedIncident(null)} />}

      <footer className="app-footer">
        <p>Emergency Helpline: 📞 1800-XXX-XXXX | Forest Department</p>
      </footer>
    </div>
  );
}

export default App;