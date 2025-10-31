import React, { useState, useEffect } from 'react';
import { Eye, Loader2, AlertCircle, RefreshCw, Download } from 'lucide-react';
import { previewData } from '../services/api';
import useAppState from '../store/appState';

const PreviewPanel = () => {
  const { sessionId, csvSummary, setNotification } = useAppState();
  const [preview, setPreview] = useState(null);
  const [previewRows, setPreviewRows] = useState(10);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load preview whenever session, rows count, or csvSummary changes
  useEffect(() => {
    if (sessionId) {
      loadPreview();
    }
  }, [sessionId, previewRows, csvSummary]);

  const loadPreview = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const response = await previewData(sessionId, previewRows);
      setPreview(response);
      setLastUpdated(new Date());
      setNotification({ message: 'Preview updated successfully', type: 'success' });
    } catch (error) {
      console.error('Preview error:', error);
      setNotification({ message: 'Error loading preview', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadPreview();
  };

  if (!csvSummary) {
    return (
      <div className="text-center py-12">
        <Eye size={48} className="mx-auto mb-4 text-gray-500" />
        <p className="text-gray-400">Please upload a CSV file first</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Data Preview</h2>
        <p className="text-gray-400">View the first rows of your dataset (like df.head())</p>
      </div>

      {/* Info Banner */}
      <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
        <div className="flex items-start gap-3">
          <Eye className="text-blue-400 mt-0.5" size={20} />
          <div className="text-sm flex-1">
            <div className="font-medium text-blue-400 mb-1">Live Preview</div>
            <div className="text-gray-400">
              This preview automatically updates when you preprocess your data. Any changes you make will be reflected here instantly.
            </div>
          </div>
          {lastUpdated && (
            <div className="text-xs text-gray-500">
              Updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Show rows:</label>
          <select
            value={previewRows}
            onChange={(e) => setPreviewRows(Number(e.target.value))}
            className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-all"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        
        <div className="text-sm text-gray-400">
          of <span className="font-medium text-white">{csvSummary.rows.toLocaleString()}</span> total rows
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 transition-all font-medium"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Dataset Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-white/10">
          <div className="text-xs text-gray-400 mb-1">Total Rows</div>
          <div className="text-lg font-bold">{csvSummary.rows.toLocaleString()}</div>
        </div>
        <div className="p-3 rounded-lg bg-white/10">
          <div className="text-xs text-gray-400 mb-1">Total Columns</div>
          <div className="text-lg font-bold">{csvSummary.columns}</div>
        </div>
        <div className="p-3 rounded-lg bg-white/10">
          <div className="text-xs text-gray-400 mb-1">Showing</div>
          <div className="text-lg font-bold text-violet-400">{previewRows}</div>
        </div>
        <div className="p-3 rounded-lg bg-white/10">
          <div className="text-xs text-gray-400 mb-1">Coverage</div>
          <div className="text-lg font-bold text-green-400">
            {((previewRows / csvSummary.rows) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="animate-spin text-violet-400 mb-4" size={48} />
          <p className="text-gray-400">Loading preview...</p>
        </div>
      ) : preview && preview.preview && preview.preview.length > 0 ? (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Dataset Preview</h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{preview.columns.length} columns</span>
              <span>•</span>
              <span>{preview.preview.length} rows displayed</span>
            </div>
          </div>
          
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm min-w-max">
              <thead>
                <tr className="border-b-2 border-white/20">
                  <th className="px-4 py-3 text-left font-medium text-gray-400 sticky left-0 bg-gray-900/95 backdrop-blur-sm z-10">
                    #
                  </th>
                  {preview.columns.map((col) => {
                    const isNumeric = csvSummary.numeric_columns.includes(col);
                    return (
                      <th key={col} className="px-4 py-3 text-left font-medium text-gray-400 whitespace-nowrap min-w-[150px]">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isNumeric ? 'bg-blue-400' : 'bg-purple-400'}`}></span>
                          <span className="truncate" title={col}>{col}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {preview.preview.map((row, index) => (
                  <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-gray-500 font-medium sticky left-0 bg-gray-900/95 backdrop-blur-sm z-10">
                      {index + 1}
                    </td>
                    {preview.columns.map((col) => {
                      const value = row[col];
                      const isNull = value === null || value === undefined;
                      return (
                        <td key={col} className="px-4 py-3 whitespace-nowrap">
                          {isNull ? (
                            <span className="text-red-400 italic font-medium bg-red-400/10 px-2 py-0.5 rounded">
                              null
                            </span>
                          ) : (
                            <span className="text-gray-200">{String(value)}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Column Type Legend */}
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span className="text-gray-400">Numeric Column</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span className="text-gray-400">Categorical Column</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-400 italic font-medium">null</span>
              <span className="text-gray-400">Missing Value</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-yellow-400" />
          <p className="text-gray-300 mb-2">No preview data available</p>
          <p className="text-sm text-gray-500">Try refreshing or re-uploading your CSV</p>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
        <div className="text-sm">
          <div className="font-medium text-violet-400 mb-2">💡 Pro Tips:</div>
          <ul className="text-gray-400 space-y-1">
            <li>• Preview automatically updates after any preprocessing operation</li>
            <li>• Red "null" values indicate missing data that may need preprocessing</li>
            <li>• Scroll horizontally to view all columns in wide datasets</li>
            <li>• Use Download button in navbar to export the current preprocessed data</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;