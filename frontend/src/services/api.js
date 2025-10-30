import axios from "axios";

const API_BASE = "http://localhost:8000/api";

export const uploadCSV = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axios.post(`${API_BASE}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const analyzeColumn = async (sessionId, columnName) => {
  const response = await axios.post(`${API_BASE}/analyze`, {
    session_id: sessionId,
    column_name: columnName,
  });
  return response.data;
};
