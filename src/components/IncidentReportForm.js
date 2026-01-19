import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next'; // Added for translation
import { submitIncident } from '../services/api';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
  systemInstruction: "You are a forest protection assistant. The user may speak in Kannada, Hindi, or English. Analyze spoken reports and return ONLY valid JSON with 'incidentType' (fire, wildlife, illegal, or other) and 'description'."
});

function IncidentReportForm({ onSubmit, voiceTranscript }) {
  const { t, i18n } = useTranslation(); // Hook for translations
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();
  
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Language change handler
  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  // Voice recording logic (remains unchanged for accessibility)
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
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await response.json();
            const areaName = data.address.suburb || data.address.village || data.address.town || 'Unknown Area';
            setLocationName(areaName);
          } catch (error) {
            setLocationName(t('report.locationCaptured'));
          }
        },
        () => alert(t('report.captureLocationFirst'))
      );
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (data) => {
    if (!location || !imagePreview) {
      if (!imagePreview) alert(t('report.uploadImage'));
      if (!location) alert(t('report.captureLocationFirst'));
      return;
    }
    setIsSubmitting(true);

    const reportData = {
      type: data.incidentType,
      description: data.description,
      location: { ...location, area: locationName || 'Unknown Area' },
      image: imagePreview,
      timestamp: new Date().toISOString(),
    };

    try { await submitIncident(reportData); } catch (error) { console.log('API Error'); }

    onSubmit(reportData);
    alert(t('report.success'));
    reset(); setLocation(null); setLocationName(''); setImagePreview(null); setIsSubmitting(false);
  };

  return (
    <div className="form-container">
      {/* Language Dropdown Selector */}
      <div className="language-selector" style={{ textAlign: 'right', marginBottom: '15px' }}>
        <select onChange={changeLanguage} value={i18n.language}>
          <option value="en">English</option>
          <option value="hi">हिन्दी (Hindi)</option>
          <option value="kn">ಕನ್ನಡ (Kannada)</option>
          <option value="ta">தமிழ் (Tamil)</option>
        </select>
      </div>

      <h2>{t('report.title')}</h2>
      
      {isAiProcessing && (
        <div className="ai-status">
          <p>✨ {t('report.aiProcessing')}</p>
        </div>
      )}

      <div className="incident-form">
        <div className="form-group">
          <label>{t('report.type')} *</label>
          <select {...register('incidentType', { required: true })}>
            <option value="">{t('report.typePlaceholder')}</option>
            <option value="fire">🔥 {t('report.fire')}</option>
            <option value="wildlife">🐘 {t('report.wildlife')}</option>
            <option value="illegal">⚠️ {t('report.illegal')}</option>
            <option value="other">📌 {t('report.other')}</option>
          </select>
          {errors.incidentType && <span className="error">{t('report.selectType')}</span>}
        </div>

        <div className="form-group">
          <label>{t('report.description')} *</label>
          <textarea 
            {...register('description', { required: true, minLength: 20 })}
            placeholder={t('report.descriptionPlaceholder')}
            rows="5"
          />
          {errors.description && <span className="error">{t('report.minDescription')}</span>}
        </div>
        
        <div className="form-group">
          <label>{t('report.uploadPhoto')} *</label>
          <input type="file" accept="image/*" onChange={handleImageChange} required />
          {imagePreview && <div className="image-preview"><img src={imagePreview} alt="Preview" /></div>}
        </div>

        <div className="form-group">
          <label>📍 {t('report.location')} *</label>
          <button type="button" onClick={getLocation} className="btn-location">
            {location ? `📍 ${locationName}` : `📍 ${t('report.captureLocation')}`}
          </button>
        </div>

        <button onClick={handleSubmit(handleFormSubmit)} className="btn-submit" disabled={isSubmitting}>
          {isSubmitting ? t('report.submitting') : `✓ ${t('report.submit')}`}
        </button>
      </div>
    </div>
  );
}

export default IncidentReportForm;