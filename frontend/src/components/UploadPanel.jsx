import React, { useState } from "react";
import { uploadCSV } from "../services/api";
import useAppState from "../store/appState";

export default function UploadPanel() {
  const { setSessionId, setCsvSummary } = useAppState();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const data = await uploadCSV(file);
      setSessionId(data.session_id);
      setCsvSummary(data.summary);
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Upload CSV</h2>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
        className="border p-2 mb-4 w-full"
      />
      <button
        onClick={handleUpload}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload & Analyze"}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
