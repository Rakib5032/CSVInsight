import React, { useState, useEffect } from 'react';
import { Loader2, BarChart2, PieChart as PieIcon, Activity, TrendingUp } from 'lucide-react';
import { analyzeColumn } from '../services/api';
import useAppState from '../store/appState';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
} from 'recharts';

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#06b6d4', '#a855f7'];

const AnalyzePanel = () => {
  const { sessionId, csvSummary, setNotification } = useAppState();
  const [selectedColumn, setSelectedColumn] = useState('');
  const [columnAnalysis, setColumnAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vizType, setVizType] = useState('auto'); // auto, bar, line, area, pie, scatter

  useEffect(() => {
    if (selectedColumn && csvSummary && !csvSummary.column_names.includes(selectedColumn)) {
      setSelectedColumn('');
      setColumnAnalysis(null);
    }
  }, [csvSummary, selectedColumn]);

  const handleAnalyze = async (columnName) => {
    if (!columnName) return;
    
    setLoading(true);
    try {
      const response = await analyzeColumn(sessionId, columnName);
      setColumnAnalysis(response);
      setVizType('auto'); // Reset to auto when analyzing new column
    } catch (error) {
      console.error('Analysis error:', error);
      setNotification({ message: 'Error analyzing column', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedColumn) {
      handleAnalyze(selectedColumn);
    }
  }, [selectedColumn]);

  if (!csvSummary) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Please upload a CSV file first</p>
      </div>
    );
  }

  const renderVisualization = () => {
    if (!columnAnalysis) return null;

    const currentVizType = vizType === 'auto' 
      ? (columnAnalysis.type === 'numeric' ? 'bar' : 'pie')
      : vizType;

    if (columnAnalysis.type === 'numeric') {
      const data = columnAnalysis.chart_data;

      switch (currentVizType) {
        case 'bar':
          return (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis 
                dataKey="range" 
                stroke="#fff" 
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#fff" tick={{ fill: '#9ca3af' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#f3f4f6', 
                  border: '1px solid #9ca3af',
                  borderRadius: '8px',
                  color: '#111827'
                }}
                itemStyle={{ color: '#111827' }}
                labelStyle={{ color: '#111827', fontWeight: 'bold' }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          );
        
        case 'line':
          return (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis 
                dataKey="range" 
                stroke="#fff" 
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#fff" tick={{ fill: '#9ca3af' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }} 
              />
              <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} />
            </LineChart>
          );
        
        case 'area':
          return (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis 
                dataKey="range" 
                stroke="#fff" 
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#fff" tick={{ fill: '#9ca3af' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }} 
              />
              <Area type="monotone" dataKey="count" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            </AreaChart>
          );
        
        case 'scatter':
          const scatterData = data.map((item, index) => ({
            x: index,
            y: item.count,
            name: item.range
          }));
          return (
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="x" stroke="#fff" tick={{ fill: '#9ca3af' }} />
              <YAxis dataKey="y" stroke="#fff" tick={{ fill: '#9ca3af' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }} 
                cursor={{ strokeDasharray: '3 3' }}
              />
              <Scatter data={scatterData} fill="#8b5cf6" />
            </ScatterChart>
          );
        
        default:
          return null;
      }
    } else {
      // Categorical data
      const data = columnAnalysis.chart_data;

                    switch (currentVizType) {
        case 'pie':
          // Calculate percentages
          const total = data.reduce((sum, item) => sum + item.value, 0);
          const dataWithPercentage = data.map(item => ({
            ...item,
            percentage: ((item.value / total) * 100).toFixed(1)
          }));
          
          return (
            <>
              <PieChart>
                <Pie
                  data={dataWithPercentage}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  label={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataWithPercentage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f3f4f6', 
                    border: '1px solid #9ca3af',
                    borderRadius: '8px',
                    color: '#111827'
                  }}
                  itemStyle={{ color: '#111827' }}
                  labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                />
              </PieChart>
              {/* Legend below chart */}
              <div className="mt-4 grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {dataWithPercentage.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div 
                      className="w-3 h-3 rounded-sm flex-shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-gray-300 truncate flex-1" title={entry.name}>
                      {entry.name}
                    </span>
                    <span className="text-gray-400 font-medium">
                      {entry.value} ({entry.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          );
        
        case 'bar':
          return (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis 
                dataKey="name" 
                stroke="#fff" 
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis stroke="#fff" tick={{ fill: '#9ca3af' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          );
        
        default:
          return null;
      }
    }
  };

  const getAvailableVizTypes = () => {
    if (!columnAnalysis) return [];
    
    if (columnAnalysis.type === 'numeric') {
      return [
        { value: 'auto', label: 'Auto', icon: Activity },
        { value: 'bar', label: 'Bar Chart', icon: BarChart2 },
        { value: 'line', label: 'Line Chart', icon: TrendingUp },
        { value: 'area', label: 'Area Chart', icon: Activity },
        { value: 'scatter', label: 'Scatter Plot', icon: Activity },
      ];
    } else {
      return [
        { value: 'auto', label: 'Auto', icon: Activity },
        { value: 'pie', label: 'Pie Chart', icon: PieIcon },
        { value: 'bar', label: 'Bar Chart', icon: BarChart2 },
      ];
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Visualization & Analysis</h2>
        <p className="text-gray-400">Explore your data with interactive charts</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Column to Analyze</label>
        <select
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-violet-500 focus:outline-none text-white"
        >
          <option value="">Choose a column...</option>
          {csvSummary.column_names.map((col) => {
            const isNumeric = csvSummary.numeric_columns.includes(col);
            return (
              <option key={col} value={col}>
                {col} {isNumeric ? '(Numeric)' : '(Categorical)'}
              </option>
            );
          })}
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-violet-400" size={48} />
        </div>
      )}

      {columnAnalysis && !loading && (
        <>
          {/* Visualization Type Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Visualization Type</label>
            <div className="flex gap-2 flex-wrap">
              {getAvailableVizTypes().map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setVizType(type.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      vizType === type.value
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 animate-fadeIn">
            {/* Statistics Panel */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
              <h3 className="text-xl font-bold mb-4">Statistics for "{selectedColumn}"</h3>
              {columnAnalysis.type === 'numeric' ? (
                <div className="space-y-3">
                  <div className="flex justify-between p-3 rounded-lg bg-white/10">
                    <span className="text-gray-400">Minimum</span>
                    <span className="font-bold">{columnAnalysis.stats.min?.toFixed(2) ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-white/10">
                    <span className="text-gray-400">Maximum</span>
                    <span className="font-bold">{columnAnalysis.stats.max?.toFixed(2) ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-white/10">
                    <span className="text-gray-400">Mean</span>
                    <span className="font-bold">{columnAnalysis.stats.mean?.toFixed(2) ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-white/10">
                    <span className="text-gray-400">Median</span>
                    <span className="font-bold">{columnAnalysis.stats.median?.toFixed(2) ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-white/10">
                    <span className="text-gray-400">Std Deviation</span>
                    <span className="font-bold">{columnAnalysis.stats.std?.toFixed(2) ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-white/10">
                    <span className="text-gray-400">25th Percentile</span>
                    <span className="font-bold">{columnAnalysis.stats.q25?.toFixed(2) ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-white/10">
                    <span className="text-gray-400">75th Percentile</span>
                    <span className="font-bold">{columnAnalysis.stats.q75?.toFixed(2) ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-white/10">
                    <span className="text-gray-400">Null Count</span>
                    <span className={`font-bold ${columnAnalysis.stats.null_count > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {columnAnalysis.stats.null_count}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between p-3 rounded-lg bg-white/10">
                    <span className="text-gray-400">Unique Values</span>
                    <span className="font-bold">{columnAnalysis.stats.unique_count}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-white/10">
                    <span className="text-gray-400">Total Count</span>
                    <span className="font-bold">{columnAnalysis.stats.total_count}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-white/10">
                    <span className="text-gray-400">Null Count</span>
                    <span className={`font-bold ${columnAnalysis.stats.null_count > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {columnAnalysis.stats.null_count}
                    </span>
                  </div>
                  {columnAnalysis.stats.mode && (
                    <div className="flex justify-between p-3 rounded-lg bg-white/10">
                      <span className="text-gray-400">Most Common</span>
                      <span className="font-bold truncate ml-2">{columnAnalysis.stats.mode}</span>
                    </div>
                  )}
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">Top Values</p>
                    <div className="max-h-48 overflow-y-auto">
                      {columnAnalysis.stats.top_values.map((item, i) => (
                        <div key={i} className="flex justify-between p-2 text-sm hover:bg-white/5 rounded">
                          <span className="truncate mr-2">{item.name}</span>
                          <span className="text-violet-400 font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Visualization Panel */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
              <h3 className="text-xl font-bold mb-4">Visualization</h3>
              <ResponsiveContainer width="100%" height={350}>
                {renderVisualization()}
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyzePanel;