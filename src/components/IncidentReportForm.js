import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { submitIncident } from '../services/api'; 

function IncidentReportForm({ onSubmit }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setLocation({ latitude: lat, longitude: lng });
          
          // Try to get area name using reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            );
            const data = await response.json();
            const areaName = data.address.suburb || data.address.village || 
                           data.address.town || data.address.state_district || 
                           data.address.state || 'Unknown Area';
            setLocationName(areaName);
            alert(`Location captured: ${areaName}`);
          } catch (error) {
            setLocationName('Location captured');
            alert('Location captured successfully!');
          }
        },
        (error) => {
          alert('Unable to get location. Please enable GPS.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (data) => {
    if (!location) {
      alert('Please capture location first!');
      return;
    }
    
    if (!imagePreview) {
      alert('Please upload an image of the incident!');
      return;
    }

    setIsSubmitting(true);

    const reportData = {
      type: data.incidentType,
      description: data.description,
      location: { 
        ...location, 
        area: locationName || 'Unknown Area'
      },
      image: imagePreview,
      incidentType: data.incidentType
    };

    onSubmit(reportData);

    setTimeout(() => {
      alert('Incident reported successfully! Check the Alerts tab.');
      reset();
      setLocation(null);
      setLocationName('');
      setImagePreview(null);
      setIsSubmitting(false);
    }, 500);

    const handleFormSubmit = async (data) => {
  // ... validation code ...

  setIsSubmitting(true);

  const reportData = {
    type: data.incidentType,
    description: data.description,
    location: { ...location, area: locationName || 'Unknown Area' },
    image: imagePreview,
    incidentType: data.incidentType,
    timestamp: new Date().toISOString(),
  };

  try {
    // TRY to send to backend
    await submitIncident(reportData);
    console.log('✅ Sent to backend successfully!');
  } catch (error) {
    // If backend not ready, just log it
    console.log('⚠️ Backend not connected yet, data saved locally only');
  }

  // Always update local state (so app works even without backend)
  onSubmit(reportData);
  
  alert('Incident reported successfully!');
  // ... rest of code ...
};
  };

  return (
    <div className="form-container">
      <h2>Report Forest Incident</h2>
      
      <div className="incident-form">
        
        <div className="form-group">
          <label>Incident Type *</label>
          <select {...register('incidentType', { required: true })}>
            <option value="">Select type...</option>
            <option value="fire">🔥 Forest Fire</option>
            <option value="wildlife">🐘 Wildlife Sighting</option>
            <option value="illegal">⚠️ Illegal Activity (Logging/Poaching)</option>
            <option value="other">📌 Other Emergency</option>
          </select>
          {errors.incidentType && <span className="error">Please select incident type</span>}
        </div>

        <div className="form-group">
          <label>Detailed Description *</label>
          <textarea 
            {...register('description', { required: true, minLength: 20 })}
            placeholder="Describe what you observed in detail (minimum 20 characters)..."
            rows="5"
          />
          {errors.description && <span className="error">Please provide at least 20 characters</span>}
        </div>

        <div className="form-group">
          <label>Upload Photo * (Required)</label>
          <input 
            type="file" 
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
            required
          />
          {imagePreview ? (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
              <p className="success-text">✓ Image uploaded successfully</p>
            </div>
          ) : (
            <div className="warning-box">
              <span>⚠️</span>
              <p>Photo is mandatory for incident verification</p>
            </div>
          )}
        </div>

        <div className="form-group">
          <label>📍 Location *</label>
          <button type="button" onClick={getLocation} className="btn-location">
            {location ? `📍 Location: ${locationName || 'Captured'}` : '📍 Capture My Location'}
          </button>
          {location && (
            <div className="location-info">
              <p style={{fontWeight: 600}}>{locationName}</p>
              <p style={{fontSize: '12px', marginTop: '5px'}}>
                Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            </div>
          )}
        </div>

        <button 
          onClick={handleSubmit(handleFormSubmit)}
          className="btn-submit"
          disabled={isSubmitting || !imagePreview || !location}
        >
          {isSubmitting ? 'Submitting...' : '✓ Submit Report'}
        </button>

        {(!imagePreview || !location) && (
          <p style={{textAlign: 'center', color: '#999', fontSize: '14px'}}>
            {!imagePreview && !location && '⚠️ Please upload photo and capture location to submit'}
            {!imagePreview && location && '⚠️ Please upload photo to submit'}
            {imagePreview && !location && '⚠️ Please capture location to submit'}
          </p>
        )}
      </div>
    </div>
  );
}

export default IncidentReportForm;