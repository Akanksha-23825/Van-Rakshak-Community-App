import axios from 'axios';

// TODO: Replace with your friend's backend URL when ready
const API_BASE_URL = 'http://localhost:5000/api'; // Ask your friend for this URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to submit incident
export const submitIncident = async (incidentData) => {
  try {
    // This will call: POST http://localhost:5000/api/incidents
    const response = await api.post('/incidents', incidentData);
    return response.data;
  } catch (error) {
    console.error('Error submitting incident:', error);
    throw error;
  }
};

// Function to get all incidents
export const getAllIncidents = async () => {
  try {
    // This will call: GET http://localhost:5000/api/incidents
    const response = await api.get('/incidents');
    return response.data;
  } catch (error) {
    console.error('Error fetching incidents:', error);
    throw error;
  }
};

export default api;