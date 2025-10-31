import axios from 'axios';

// Use environment variable for Render deployment, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Upload CSV file
export const uploadCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Analyze a specific column
export const analyzeColumn = async (sessionId, columnName) => {
  const response = await api.post('/analyze', {
    session_id: sessionId,
    column_name: columnName,
  });
  
  return response.data;
};

// Get correlations
export const getCorrelations = async (sessionId) => {
  const response = await api.post('/correlations', {
    session_id: sessionId,
  });
  
  return response.data;
};

// Preview data
export const previewData = async (sessionId, rows = 10) => {
  const response = await api.get(`/preview/${sessionId}?rows=${rows}`);
  return response.data;
};

// Preprocessing operations
export const preprocessData = async (sessionId, operations) => {
  const response = await api.post('/preprocess', {
    session_id: sessionId,
    operations: operations,
  });
  
  return response.data;
};

export const dropColumns = async (sessionId, columns) => {
  const response = await api.post('/drop-columns', {
    session_id: sessionId,
    columns: columns,
  });
  
  return response.data;
};

export const handleMissingValues = async (sessionId, strategy) => {
  const response = await api.post('/handle-missing', {
    session_id: sessionId,
    strategy: strategy,
  });
  
  return response.data;
};

export const encodeColumns = async (sessionId, columns, method) => {
  const response = await api.post('/encode', {
    session_id: sessionId,
    columns: columns,
    method: method,
  });
  
  return response.data;
};

export const normalizeData = async (sessionId, columns = null) => {
  const response = await api.post('/normalize', {
    session_id: sessionId,
    columns: columns,
  });
  
  return response.data;
};

export const removeDuplicates = async (sessionId) => {
  const response = await api.post('/remove-duplicates', {
    session_id: sessionId,
  });
  
  return response.data;
};

// Get session info
export const getSessionInfo = async (sessionId) => {
  const response = await api.get(`/session/${sessionId}`);
  return response.data;
};

// Delete session
export const deleteSession = async (sessionId) => {
  const response = await api.delete(`/session/${sessionId}`);
  return response.data;
};

export default api;
