import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, AlertTriangle, Eye, Download } from 'lucide-react';
import { getCorrelations, previewData } from '../services/api';
import useAppState from '../store/appState';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const AdvancedAnalysisPanel = () => {
  const { sessionId, csvSummary, setNotification } = useAppState();
  const [correlations, setCorrelations] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewRows, setPreviewRows] = useState(10);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('correlations');

  useEffect(() => {
    if (sessionId && activeView === 'correlations') {
      loadCorrelations();
    } else if (sessionId && activeView === 'preview') {
      loadPreview();
    }
  }, [sessionId, activeView, previewRows]);

  const loadCorrelations = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const response = await getCorrelations(sessionId);
      setCorrelations(response);
    } catch (error) {
      console.error('Correlation error:', error);
      setNotification({ message: 'Error loading correlations', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

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

  const getCorrelationColor = (value) => {
    const abs = Math.abs(value);
    if (abs > 0.7) return '#ef4444'; // Strong correlation - red
    if (abs > 0.4) return '#f59e0b'; // Moderate correlation - orange
    return '#10b981'; // Weak correlation - green
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Advanced Analysis</h2>
        <p className="text-gray-400">Deep dive into your data with advanced analytics</p>
      </div>

      {/* View Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveView('correlations')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeView === 'correlations'
              ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          Correlations
        </button>
        <button
          onClick={() => setActiveView('preview')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeView === 'preview'
              ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          Data Preview
        </button>
        <button
          onClick={() => setActiveView('outliers')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeView === 'outliers'
              ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          Outlier Detection
        </button>
        <button
          onClick={() => setActiveView('summary')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeView === 'summary'
              ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          Summary Dashboard
        </button>
      </div>

      {/* Correlations View */}
      {activeView === 'correlations' && (
        <div className="space-y-6 animate-fadeIn">
          {csvSummary.numeric_columns.length < 2 ? (
            <div className="p-8 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 text-center">
              <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-400" />
              <p className="text-gray-300">Need at least 2 numeric columns for correlation analysis</p>
            </div>
          ) : (
            <>
              {/* Correlation Heatmap Visualization */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Activity className="text-violet-400" />
                  Correlation Heatmap
                </h3>
                {correlations && correlations.correlations && (
                  <div className="overflow-x-auto">
                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${csvSummary.numeric_columns.length}, minmax(80px, 1fr))` }}>
                      <div></div>
                      {csvSummary.numeric_columns.map((col) => (
                        <div key={col} className="text-xs text-center font-medium truncate">{col}</div>
                      ))}
                      {csvSummary.numeric_columns.map((row) => (
                        <React.Fragment key={row}>
                          <div className="text-xs font-medium truncate">{row}</div>
                          {csvSummary.numeric_columns.map((col) => {
                            const corrValue = correlations.matrix[row]?.[col] || 0;
                            return (
                              <div
                                key={`${row}-${col}`}
                                className="aspect-square rounded flex items-center justify-center text-xs font-bold"
                                style={{
                                  backgroundColor: getCorrelationColor(corrValue) + '40',
                                  color: getCorrelationColor(corrValue),
                                }}
                              >
                                {corrValue.toFixed(2)}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Top Correlations */}
              {correlations && correlations.correlations && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="text-pink-400" />
                    Strongest Correlations
                  </h3>
                  <div className="space-y-3">
                    {correlations.correlations
                      .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
                      .slice(0, 10)
                      .map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/10">
                          <div className="flex-1">
                            <span className="text-sm font-medium">{item.column1}</span>
                            <span className="text-gray-400 mx-2">↔</span>
                            <span className="text-sm font-medium">{item.column2}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.abs(item.correlation) * 100}%`,
                                  backgroundColor: getCorrelationColor(item.correlation),
                                }}
                              />
                            </div>
                            <span
                              className="font-bold w-16 text-right"
                              style={{ color: getCorrelationColor(item.correlation) }}
                            >
                              {item.correlation.toFixed(3)}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Data Preview */}
      {activeView === 'preview' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center gap-4 mb-4">
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
            </select>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Eye className="text-blue-400" />
              Dataset Preview
            </h3>
            {preview && preview.preview && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="px-3 py-2 text-left font-medium text-gray-400">#</th>
                      {preview.columns.map((col) => (
                        <th key={col} className="px-3 py-2 text-left font-medium text-gray-400">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.preview.map((row, index) => (
                      <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                        <td className="px-3 py-2 text-gray-500">{index + 1}</td>
                        {preview.columns.map((col) => (
                          <td key={col} className="px-3 py-2">
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
            )}
          </div>
        </div>
      )}

      {/* Outlier Detection */}
      {activeView === 'outliers' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 text-center">
            <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-400" />
            <h3 className="text-xl font-bold mb-2">Outlier Detection</h3>
            <p className="text-gray-400 mb-4">
              Advanced statistical outlier detection using IQR and Z-score methods
            </p>
            <p className="text-sm text-gray-500">Coming soon in the next update...</p>
          </div>
        </div>
      )}

      {/* Summary Dashboard */}
      {activeView === 'summary' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
              <div className="text-sm text-gray-400 mb-1">Total Rows</div>
              <div className="text-3xl font-bold">{csvSummary.rows.toLocaleString()}</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30">
              <div className="text-sm text-gray-400 mb-1">Total Columns</div>
              <div className="text-3xl font-bold">{csvSummary.columns}</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
              <div className="text-sm text-gray-400 mb-1">Numeric Columns</div>
              <div className="text-3xl font-bold">{csvSummary.numeric_columns.length}</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
              <div className="text-sm text-gray-400 mb-1">Categorical Columns</div>
              <div className="text-3xl font-bold">{csvSummary.categorical_columns.length}</div>
            </div>
          </div>

          {/* Column Information */}
          {csvSummary.column_info && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
              <h3 className="text-xl font-bold mb-4">Column Details</h3>
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
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalysisPanel;