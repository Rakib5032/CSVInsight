import React, { useState, useEffect } from 'react';
import { Eye, Loader2, AlertCircle } from 'lucide-react';
import { previewData } from '../services/api';
import useAppState from '../store/appState';

const PreviewPanel = () => {
  const { sessionId, csvSummary, setNotification } = useAppState();
  const [preview, setPreview] = useState(null);
  const [previewRows, setPreviewRows] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadPreview();
    }
  }, [sessionId, previewRows]);

  const loadPreview = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const response = await previewData(sessionId, previewRows);
      setPreview(response);
    } catch (error) {
      console.error('Preview error:', error);
      setNotification({ message: 'Error loading preview', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!csvSummary) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Please upload a CSV file first</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Data Preview</h2>
        <p className="text-gray-400">View your dataset rows</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <label className="text-sm font-medium">Show rows:</label>
        <select
          value={previewRows}
          onChange={(e) => setPreviewRows(Number(e.target.value))}
          className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <div className="text-sm text-gray-400">
          of {csvSummary.rows.toLocaleString()} total rows
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-violet-400" size={48} />
        </div>
      ) : preview && preview.preview ? (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-white/20">
                  <th className="px-4 py-3 text-left font-medium text-gray-400 sticky left-0 bg-gray-900/90">#</th>
                  {preview.columns.map((col) => (
                    <th key={col} className="px-4 py-3 text-left font-medium text-gray-400 whitespace-nowrap min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <span>{col}</span>
                        <span className={`w-2 h-2 rounded-full ${
                          csvSummary.numeric_columns.includes(col) ? 'bg-blue-400' : 'bg-purple-400'
                        }`}></span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.preview.map((row, index) => (
                  <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                    <td className="px-4 py-3 text-gray-500 font-medium sticky left-0 bg-gray-900/90">{index + 1}</td>
                    {preview.columns.map((col) => (
                      <td key={col} className="px-4 py-3 whitespace-nowrap">
                        {row[col] === null || row[col] === undefined ? (
                          <span className="text-red-400 italic">null</span>
                        ) : (
                          <span className="text-gray-200">{String(row[col])}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-yellow-400" />
          <p className="text-gray-300">No preview data available</p>
        </div>
      )}
    </div>
  );
};

export default PreviewPanel;