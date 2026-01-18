import React from 'react';

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

function AlertDetailModal({ incident, onClose }) {
  const getIncidentIcon = () => {
    switch(incident.type) {
      case 'fire': return '🔥';
      case 'wildlife': return '🐘';
      case 'illegal': return '⚠️';
      default: return '📢';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-header">
          <h2>
            <span style={{fontSize: '32px'}}>{getIncidentIcon()}</span>
            Incident Details
          </h2>
        </div>

        <div className="modal-body">
          {incident.image && (
            <img src={incident.image} alt="Incident" className="modal-image" />
          )}

          <div className="detail-section">
            <h3>📋 Description</h3>
            <p>{incident.description}</p>
          </div>

          <div className="detail-section">
            <h3>📍 Location Information</h3>
            <p><strong>Area:</strong> {incident.location.area}</p>
            <p><strong>Coordinates:</strong> {incident.location.latitude.toFixed(6)}, {incident.location.longitude.toFixed(6)}</p>
            <p><strong>Distance:</strong> {incident.distance}</p>
          </div>

          <div className="detail-section">
            <h3>⏰ Time Information</h3>
            <p><strong>Reported:</strong> {getTimeAgo(incident.timestamp)}</p>
            <p><strong>Exact Time:</strong> {new Date(incident.timestamp).toLocaleString()}</p>
          </div>

          <div className="detail-section">
            <h3>👤 Reporter Information</h3>
            <p><strong>Name:</strong> {incident.reporter.name}</p>
            <p><strong>Phone:</strong> {incident.reporter.phone}</p>
            <p><strong>Village:</strong> {incident.reporter.village}</p>
          </div>

          <div className={`severity-badge ${incident.severity}-severity`}>
            <strong>Priority Level:</strong> {incident.severity.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlertDetailModal;