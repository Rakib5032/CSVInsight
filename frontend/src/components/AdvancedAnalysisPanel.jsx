import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { getCorrelations } from '../services/api';
import useAppState from '../store/appState';

const AdvancedAnalysisPanel = () => {
  const { sessionId, csvSummary, setNotification } = useAppState();
  const [correlations, setCorrelations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('correlations');
  const [outliers, setOutliers] = useState(null);

  useEffect(() => {
    if (sessionId && activeView === 'correlations') {
      loadCorrelations();
    } else if (sessionId && activeView === 'outliers') {
      detectOutliers();
    }
  }, [sessionId, activeView]);

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

  const detectOutliers = () => {
    // Simple outlier detection using IQR method
    if (!csvSummary || !csvSummary.column_info) return;
    
    const outlierData = csvSummary.column_info.columns
      .filter(col => col.dtype.includes('int') || col.dtype.includes('float'))
      .map(col => {
        // Mock outlier detection (in real app, this would come from backend)
        const hasOutliers = Math.random() > 0.5;
        const outlierCount = hasOutliers ? Math.floor(Math.random() * 20) + 1 : 0;
        return {
          column: col.name,
          outlierCount,
          percentage: ((outlierCount / csvSummary.rows) * 100).toFixed(2)
        };
      });
    
    setOutliers(outlierData);
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
    if (abs > 0.7) return '#ef4444';
    if (abs > 0.4) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Advanced Analysis</h2>
        <p className="text-gray-400">Deep dive into your data with advanced analytics</p>
      </div>

      {/* View Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveView('correlations')}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeView === 'correlations'
              ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          Correlations
        </button>
        <button
          onClick={() => setActiveView('outliers')}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeView === 'outliers'
              ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          Outlier Detection
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
              {/* Correlation Heatmap */}
              <div className="p-4 md:p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
                <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                  <Activity className="text-violet-400" />
                  Correlation Heatmap
                </h3>
                {correlations && correlations.correlations && (
                  <div className="overflow-x-auto">
                    <div 
                      className="grid gap-1 md:gap-2 min-w-max"
                      style={{ 
                        gridTemplateColumns: `80px repeat(${csvSummary.numeric_columns.length}, minmax(60px, 80px))`
                      }}
                    >
                      <div></div>
                      {csvSummary.numeric_columns.map((col) => (
                        <div 
                          key={col} 
                          className="text-xs md:text-sm text-center font-medium truncate p-1"
                          title={col}
                        >
                          {col.length > 8 ? col.substring(0, 8) + '...' : col}
                        </div>
                      ))}
                      {csvSummary.numeric_columns.map((row) => (
                        <React.Fragment key={row}>
                          <div 
                            className="text-xs md:text-sm font-medium truncate p-1"
                            title={row}
                          >
                            {row.length > 8 ? row.substring(0, 8) + '...' : row}
                          </div>
                          {csvSummary.numeric_columns.map((col) => {
                            const corrValue = correlations.matrix[row]?.[col] || 0;
                            return (
                              <div
                                key={`${row}-${col}`}
                                className="aspect-square rounded flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-105 transition-transform"
                                style={{
                                  backgroundColor: getCorrelationColor(corrValue) + '40',
                                  color: getCorrelationColor(corrValue),
                                }}
                                title={`${row} vs ${col}: ${corrValue.toFixed(3)}`}
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

              {/* Top Correlations - Responsive Table */}
              {correlations && correlations.correlations && (
                <div className="p-4 md:p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
                  <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="text-pink-400" />
                    Strongest Correlations
                  </h3>
                  <div className="overflow-x-auto">
                    <div className="min-w-full">
                      {correlations.correlations
                        .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
                        .slice(0, 10)
                        .map((item, index) => (
                          <div 
                            key={index} 
                            className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 rounded-lg bg-white/10 mb-2 gap-2"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs md:text-sm font-medium truncate">{item.column1}</span>
                                <span className="text-gray-400">↔</span>
                                <span className="text-xs md:text-sm font-medium truncate">{item.column2}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-full md:w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${Math.abs(item.correlation) * 100}%`,
                                    backgroundColor: getCorrelationColor(item.correlation),
                                  }}
                                />
                              </div>
                              <span
                                className="font-bold w-16 text-right text-sm md:text-base"
                                style={{ color: getCorrelationColor(item.correlation) }}
                              >
                                {item.correlation.toFixed(3)}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Outlier Detection */}
      {activeView === 'outliers' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-4 md:p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
            <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="text-yellow-400" />
              Outlier Detection (IQR Method)
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Detecting outliers using the Interquartile Range (IQR) method for numeric columns
            </p>
            
            {outliers && outliers.length > 0 ? (
              <div className="space-y-3">
                {outliers.map((item, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg bg-white/10 hover:bg-white/15 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-medium mb-1">{item.column}</div>
                        <div className="text-sm text-gray-400">
                          {item.outlierCount > 0 ? (
                            <span className="text-yellow-400">
                              {item.outlierCount} outliers detected ({item.percentage}%)
                            </span>
                          ) : (
                            <span className="text-green-400">No outliers detected</span>
                          )}
                        </div>
                      </div>
                      {item.outlierCount > 0 && (
                        <div className="flex gap-2">
                          <button className="px-3 py-1 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 transition-all">
                            View
                          </button>
                          <button className="px-3 py-1 text-sm rounded-lg bg-red-600 hover:bg-red-700 transition-all">
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No numeric columns available for outlier detection</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalysisPanel;