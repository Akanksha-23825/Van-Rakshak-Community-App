import React, { useState, useEffect } from 'react';

// Helper function to calculate time ago
const getTimeAgo = (timestamp) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

function AlertList({ alerts, onSelectAlert }) {
  // Auto-update time every minute
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const getAlertIcon = (type) => {
    switch(type) {
      case 'fire': return '🔥';
      case 'wildlife': return '🐘';
      case 'illegal': return '⚠️';
      default: return '📢';
    }
  };

  const getSeverityClass = (severity) => {
    return `alert-card ${severity}-severity`;
  };

  return (
    <div className="alerts-container">
      <h2>Active Alerts</h2>
      
      {alerts.length === 0 ? (
        <p className="no-alerts">No active alerts at the moment</p>
      ) : (
        <div className="alerts-list">
          {alerts.map(alert => (
            <div 
              key={alert.id} 
              className={getSeverityClass(alert.severity)}
              onClick={() => onSelectAlert(alert)}
            >
              <div className="alert-icon">{getAlertIcon(alert.type)}</div>
              <div className="alert-content">
                <h3>{alert.description.substring(0, 70)}{alert.description.length > 70 ? '...' : ''}</h3>
                <div className="alert-meta">
                  <span className="alert-meta-item">
                    📍 {alert.location.area}
                  </span>
                  <span className="alert-meta-item">
                    ⏰ {getTimeAgo(alert.timestamp)}
                  </span>
                </div>
                <p className="click-to-view">👆 Click to view full details</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AlertList;