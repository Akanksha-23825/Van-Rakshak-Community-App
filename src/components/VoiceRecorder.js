// src/components/VoiceRecorder.js
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// Helper function for language codes (can be moved to a shared utility file)
const getLanguageCode = (lang) => {
  const codes = { en: 'en-US', hi: 'hi-IN', ta: 'ta-IN', kn: 'kn-IN' };
  return codes[lang] || 'en-US';
};

function VoiceRecorder({ onTranscriptChange }) {
  const { i18n } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition API
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Browser not supported.');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onstart = () => setIsRecording(true);
    recognitionRef.current.onend = () => setIsRecording(false);
    recognitionRef.current.onerror = (event) => {
      setError('Error: ' + event.error);
      setIsRecording(false);
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscriptChange(transcript); // Pass transcript back to App.js
    };

    // Cleanup function
    return () => {
      recognitionRef.current?.stop();
    };
  }, [onTranscriptChange]);

  // Update language when user changes it in the UI
  useEffect(() => {
    if (recognitionRef.current) {
        recognitionRef.current.lang = getLanguageCode(i18n.language || 'en');
    }
  }, [i18n.language]);


  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setError(null); // Clear previous errors
      // Force microphone permission request (optional but helps reliability)
      navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
          recognitionRef.current.start();
      }).catch(err => {
          setError('Microphone permission denied.');
      });
    }
  };

  return (
    <div className="voice-input-section">
      <button
        type="button"
        onClick={toggleRecording}
        className={`btn-voice ${isRecording ? 'recording' : ''}`}
        disabled={!!error}
      >
        {isRecording ? '🎤 Recording...' : '🎤 Record Voice'}
      </button>
      {error && <span className="error">{error}</span>}
    </div>
  );
}

export default VoiceRecorder;
