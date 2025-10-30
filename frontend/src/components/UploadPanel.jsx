import React, { useState } from 'react';
import { Upload, CheckCircle, FileText, TrendingUp } from 'lucide-react';
import { uploadCSV } from '../services/api';
import useAppState from '../store/appState';

const UploadPanel = () => {
  const { setSessionId, setCsvSummary, setActiveTab, setNotification, setLoading, csvSummary } = useAppState();
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      setNotification({ message: 'Please upload a CSV file', type: 'error' });
      return;
    }

    setLoading(true);
    
    try {
      const response = await uploadCSV(file);
      setSessionId(response.session_id);
      setCsvSummary(response);
      setNotification({ message: 'CSV uploaded successfully!', type: 'success' });
      setActiveTab('analyze');
    } catch (error) {
      console.error('Upload error:', error);
      setNotification({ message: 'Error uploading CSV file', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Upload Your CSV</h2>
        <p className="text-gray-400">Get started by uploading your dataset</p>
      </div>
      
      <label
        className="block"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
          dragActive 
            ? 'border-violet-500 bg-violet-500/10' 
            : 'border-white/20 bg-white/5 hover:border-violet-500 hover:bg-white/10'
        }`}>
          <Upload size={48} className="mx-auto mb-4 text-violet-400" />
          <p className="text-lg font-medium mb-2">Drop your CSV file here</p>
          <p className="text-sm text-gray-400 mb-4">or click to browse</p>
          <div className="inline-block px-6 py-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg font-medium">
            Choose File
          </div>
        </div>
        <input
          type="file"
          accept=".csv"
          onChange={handleChange}
          className="hidden"
        />
      </label>

      {csvSummary && (
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 animate-fadeIn">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-400" />
            Dataset Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-white/10">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={20} className="text-violet-400" />
                <p className="text-sm text-gray-400">Total Rows</p>
              </div>
              <p className="text-2xl font-bold">{csvSummary.rows.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-lg bg-white/10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={20} className="text-pink-400" />
                <p className="text-sm text-gray-400">Total Columns</p>
              </div>
              <p className="text-2xl font-bold">{csvSummary.columns}</p>
            </div>
            <div className="p-4 rounded-lg bg-white/10">
              <p className="text-sm text-gray-400 mb-1">Numeric Columns</p>
              <p className="text-2xl font-bold text-violet-400">{csvSummary.numeric_columns.length}</p>
            </div>
            <div className="p-4 rounded-lg bg-white/10">
              <p className="text-sm text-gray-400 mb-1">Categorical Columns</p>
              <p className="text-2xl font-bold text-pink-400">{csvSummary.categorical_columns.length}</p>
            </div>
          </div>
          
          <div className="mt-4 p-4 rounded-lg bg-white/10">
            <p className="text-sm text-gray-400 mb-2">Columns:</p>
            <div className="flex flex-wrap gap-2">
              {csvSummary.column_names.map((col, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-white/10 rounded-full text-sm"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPanel;