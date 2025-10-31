import React, { useState } from 'react';
import { Upload, CheckCircle, FileText, TrendingUp, Database, AlertTriangle, Activity, BarChart } from 'lucide-react';
import { uploadCSV } from '../services/api';
import useAppState from '../store/appState';

const UploadPanel = () => {
  const { setSessionId, csvSummary, setCsvSummary, setNotification, setLoading } = useAppState();
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
    <div className="max-w-6xl mx-auto">
      {!csvSummary ? (
        <>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome to CSVInsight</h2>
            <p className="text-gray-400">Upload your CSV file to begin data analysis</p>
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
        </>
      ) : (
        <>
          {/* Dashboard Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Dashboard Overview</h2>
            <p className="text-gray-400">Summary of your dataset</p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
              <div className="flex items-center gap-3 mb-2">
                <Database size={24} className="text-violet-400" />
                <div className="text-sm text-gray-400">Total Rows</div>
              </div>
              <div className="text-3xl font-bold">{csvSummary.rows.toLocaleString()}</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30">
              <div className="flex items-center gap-3 mb-2">
                <BarChart size={24} className="text-pink-400" />
                <div className="text-sm text-gray-400">Total Columns</div>
              </div>
              <div className="text-3xl font-bold">{csvSummary.columns}</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
              <div className="flex items-center gap-3 mb-2">
                <Activity size={24} className="text-blue-400" />
                <div className="text-sm text-gray-400">Numeric Columns</div>
              </div>
              <div className="text-3xl font-bold">{csvSummary.numeric_columns.length}</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
              <div className="flex items-center gap-3 mb-2">
                <FileText size={24} className="text-green-400" />
                <div className="text-sm text-gray-400">Categorical Columns</div>
              </div>
              <div className="text-3xl font-bold">{csvSummary.categorical_columns.length}</div>
            </div>
          </div>

          {/* Column Information Table */}
          {csvSummary.column_info && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 mb-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="text-green-400" />
                Column Details
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="px-3 py-2 text-left font-medium">Column</th>
                      <th className="px-3 py-2 text-left font-medium">Type</th>
                      <th className="px-3 py-2 text-left font-medium">Null Count</th>
                      <th className="px-3 py-2 text-left font-medium">Null %</th>
                      <th className="px-3 py-2 text-left font-medium">Unique</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvSummary.column_info.columns.map((col, index) => (
                      <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                        <td className="px-3 py-2 font-medium">{col.name}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            col.dtype.includes('int') || col.dtype.includes('float')
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {col.dtype}
                          </span>
                        </td>
                        <td className="px-3 py-2">{col.null_count}</td>
                        <td className="px-3 py-2">
                          <span className={col.null_percentage > 10 ? 'text-red-400' : 'text-gray-400'}>
                            {col.null_percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-3 py-2">{col.unique_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Columns List */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
            <h3 className="text-xl font-bold mb-4">All Columns</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {csvSummary.column_names.map((col, index) => {
                const isNumeric = csvSummary.numeric_columns.includes(col);
                return (
                  <div 
                    key={index} 
                    className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all flex items-center gap-2"
                  >
                    <span className={`w-2 h-2 rounded-full ${isNumeric ? 'bg-blue-400' : 'bg-purple-400'}`}></span>
                    <span className="text-sm truncate">{col}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upload New File */}
          <div className="mt-6">
            <label className="block">
              <div className="border border-white/20 rounded-xl p-6 text-center hover:border-violet-500 transition-all cursor-pointer bg-white/5 hover:bg-white/10">
                <Upload size={32} className="mx-auto mb-2 text-violet-400" />
                <p className="text-sm font-medium mb-1">Upload New CSV</p>
                <p className="text-xs text-gray-400">Replace current dataset</p>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleChange}
                className="hidden"
              />
            </label>
          </div>
        </>
      )}
    </div>
  );
};

export default UploadPanel;