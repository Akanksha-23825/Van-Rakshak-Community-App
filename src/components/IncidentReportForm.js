import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { submitIncident } from '../services/api';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
  systemInstruction: "You are a forest protection assistant. The user may speak in Kannada, Hindi, or English. Analyze spoken reports and return ONLY valid JSON with 'incidentType' (fire, wildlife, illegal, or other) and 'description'."
});

function IncidentReportForm({ onSubmit, voiceTranscript }) {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const handleVoiceParsing = async () => {
      if (voiceTranscript && voiceTranscript.length > 15 && !isAiProcessing) {
        setIsAiProcessing(true);
        try {
          const prompt = `Convert this spoken report into structured JSON: "${voiceTranscript}"`;
          const result = await model.generateContent(prompt);
          const text = result.response.text().trim();
          const jsonMatch = text.match(/\{[\s\S]*\}/s);

          if (jsonMatch && jsonMatch[0]) {
            const data = JSON.parse(jsonMatch[0]);
            if (data.incidentType) setValue('incidentType', data.incidentType, { shouldValidate: true });
            if (data.description) setValue('description', data.description, { shouldValidate: true });
          }
        } catch (error) {
          console.error("Gemini API call failed:", error);
        } finally {
          setIsAiProcessing(false);
        }
      }
    };
    const timeoutId = setTimeout(handleVoiceParsing, 1500);
    return () => clearTimeout(timeoutId);
  }, [voiceTranscript, setValue, isAiProcessing]);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({ latitude: lat, longitude: lng });
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org{lat}&lon=${lng}&format=json`);
            const data = await response.json();
            const areaName = data.address.suburb || data.address.village || data.address.town || 'Unknown Area';
            setLocationName(areaName);
          } catch (error) {
            setLocationName('Location captured');
          }
        },
        (error) => {
          console.error(`Geolocation Error: Code ${error.code}: ${error.message}`);
          alert("Unable to get location. Ensure GPS is enabled and browser permission is granted.");
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
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (data) => {
    if (!location || !imagePreview) return;
    setIsSubmitting(true);

    const reportData = {
      type: data.incidentType, description: data.description,
      location: { ...location, area: locationName || 'Unknown Area' },
      image: imagePreview, incidentType: data.incidentType, timestamp: new Date().toISOString(),
    };

    try { await submitIncident(reportData); console.log('✅ Sent to backend successfully!'); } 
    catch (error) { console.log('⚠️ Backend not connected yet, data saved locally only'); }

    onSubmit(reportData);
    
    setTimeout(() => {
        alert('Incident reported successfully! Check the Alerts tab.');
        reset(); setLocation(null); setLocationName(''); setImagePreview(null); setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="form-container">
      <h2>Report Forest Incident</h2>
      
      {isAiProcessing && (
        <div className="ai-status">
          <p>✨ AI is organizing your spoken report...</p>
        </div>
      )}

      <div className="incident-form">
        <div className="form-group">
          <label>Incident Type *</label>
          <select {...register('incidentType', { required: true })} id="incidentType">
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
            placeholder="You can type or use the microphone above..."
            rows="5"
          />
          {errors.description && <span className="error">Minimum 20 characters required</span>}
        </div>
        
        <div className="form-group">
          <label>Upload Photo *</label>
          <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} required />
          {imagePreview && <div className="image-preview"><img src={imagePreview} alt="Preview" /></div>}
        </div>

        <div className="form-group">
          <label>📍 Location *</label>
          <button type="button" onClick={getLocation} className="btn-location">
            {location ? `📍 ${locationName}` : '📍 Capture My Location'}
          </button>
        </div>

        <button 
          onClick={handleSubmit(handleFormSubmit)}
          className="btn-submit"
          disabled={isSubmitting || !imagePreview || !location}
        >
          {isSubmitting ? 'Submitting...' : '✓ Submit Report'}
        </button>
      </div>
    </div>
  );
}

export default IncidentReportForm;
