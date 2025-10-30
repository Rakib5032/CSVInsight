import React, { useState, useEffect } from 'react';
import { Zap, Settings, CheckCircle, Info } from 'lucide-react';
import {
  handleMissingValues,
  removeDuplicates,
  encodeColumns,
  normalizeData,
  dropColumns,
  getSessionInfo,
} from '../services/api';
import useAppState from '../store/appState';

const PreprocessPanel = () => {
  const { sessionId, csvSummary, setCsvSummary, setNotification, setLoading } = useAppState();
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [missingStrategy, setMissingStrategy] = useState('mean');
  const [encodeMethod, setEncodeMethod] = useState('label');

  // Refresh summary after operations
  const refreshSummary = async () => {
    try {
      const response = await getSessionInfo(sessionId);
      // Update summary with new column list
      setCsvSummary({
        ...csvSummary,
        columns: response.columns,
        column_names: response.column_names,
        rows: response.rows,
      });
    } catch (error) {
      console.error('Error refreshing summary:', error);
    }
  };

  if (!csvSummary) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Please upload a CSV file first</p>
      </div>
    );
  }

  const handleColumnSelect = (column) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((c) => c !== column)
        : [...prev, column]
    );
  };

  // Check if selected columns are numeric
  const selectedNumericColumns = selectedColumns.filter(col => 
    csvSummary.numeric_columns.includes(col)
  );

  // Check if selected columns are categorical
  const selectedCategoricalColumns = selectedColumns.filter(col => 
    csvSummary.categorical_columns.includes(col)
  );

  const canNormalize = selectedNumericColumns.length > 0;
  const canEncode = selectedCategoricalColumns.length > 0;

  const handleMissing = async () => {
    setLoading(true);
    try {
      const response = await handleMissingValues(sessionId, missingStrategy);
      setNotification({ message: response.message, type: 'success' });
      await refreshSummary();
    } catch (error) {
      setNotification({ message: 'Error handling missing values', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDuplicates = async () => {
    setLoading(true);
    try {
      const response = await removeDuplicates(sessionId);
      setNotification({ 
        message: `Removed ${response.duplicates_removed} duplicate rows`, 
        type: 'success' 
      });
      await refreshSummary();
    } catch (error) {
      setNotification({ message: 'Error removing duplicates', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEncode = async () => {
    if (selectedCategoricalColumns.length === 0) {
      setNotification({ 
        message: 'Please select categorical columns to encode', 
        type: 'error' 
      });
      return;
    }

    setLoading(true);
    try {
      const response = await encodeColumns(sessionId, selectedCategoricalColumns, encodeMethod);
      setNotification({ message: response.message, type: 'success' });
      setSelectedColumns([]);
      await refreshSummary();
    } catch (error) {
      setNotification({ message: 'Error encoding columns', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleNormalize = async () => {
    if (selectedNumericColumns.length === 0) {
      setNotification({ 
        message: 'Please select numeric columns to normalize', 
        type: 'error' 
      });
      return;
    }

    setLoading(true);
    try {
      const response = await normalizeData(sessionId, selectedNumericColumns);
      setNotification({ message: response.message, type: 'success' });
      setSelectedColumns([]);
      await refreshSummary();
    } catch (error) {
      setNotification({ message: 'Error normalizing data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDropColumns = async () => {
    if (selectedColumns.length === 0) {
      setNotification({ message: 'Please select columns to drop', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await dropColumns(sessionId, selectedColumns);
      
      // Update csvSummary to remove dropped columns
      const updatedNumericColumns = csvSummary.numeric_columns.filter(
        col => !selectedColumns.includes(col)
      );
      const updatedCategoricalColumns = csvSummary.categorical_columns.filter(
        col => !selectedColumns.includes(col)
      );
      const updatedColumnNames = csvSummary.column_names.filter(
        col => !selectedColumns.includes(col)
      );

      setCsvSummary({
        ...csvSummary,
        columns: updatedColumnNames.length,
        column_names: updatedColumnNames,
        numeric_columns: updatedNumericColumns,
        categorical_columns: updatedCategoricalColumns,
      });

      setNotification({ message: response.message, type: 'success' });
      setSelectedColumns([]);
    } catch (error) {
      setNotification({ message: 'Error dropping columns', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getColumnType = (column) => {
    if (csvSummary.numeric_columns.includes(column)) return 'numeric';
    if (csvSummary.categorical_columns.includes(column)) return 'categorical';
    return 'unknown';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Data Preprocessing</h2>
        <p className="text-gray-400">Clean and transform your data</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Actions Panel */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="text-yellow-400" />
            Quick Actions
          </h3>
          
          <div className="space-y-4">
            {/* Missing Values */}
            <div className="p-4 rounded-lg bg-white/10">
              <h4 className="font-medium mb-3">Handle Missing Values</h4>
              <select
                value={missingStrategy}
                onChange={(e) => setMissingStrategy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 mb-3 text-white"
              >
                <option value="mean">Fill with Mean (Numeric)</option>
                <option value="median">Fill with Median (Numeric)</option>
                <option value="mode">Fill with Mode (All Types)</option>
                <option value="fill_zero">Fill with Zero</option>
                <option value="drop">Drop Rows with Missing</option>
              </select>
              <button
                onClick={handleMissing}
                className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition-all font-medium"
              >
                Apply
              </button>
            </div>

            {/* Remove Duplicates */}
            <div className="p-4 rounded-lg bg-white/10">
              <h4 className="font-medium mb-3">Remove Duplicates</h4>
              <p className="text-sm text-gray-400 mb-3">
                Remove duplicate rows from the dataset
              </p>
              <button
                onClick={handleRemoveDuplicates}
                className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 transition-all font-medium"
              >
                Remove Duplicates
              </button>
            </div>
          </div>
        </div>

        {/* Column Operations Panel */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Settings className="text-blue-400" />
            Column Operations
          </h3>

          {/* Selection Info */}
          {selectedColumns.length > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-blue-400 mt-0.5" />
                <div className="text-sm">
                  <div className="text-blue-400 font-medium mb-1">
                    {selectedColumns.length} column(s) selected
                  </div>
                  {selectedNumericColumns.length > 0 && (
                    <div className="text-gray-400">
                      • {selectedNumericColumns.length} numeric (can normalize)
                    </div>
                  )}
                  {selectedCategoricalColumns.length > 0 && (
                    <div className="text-gray-400">
                      • {selectedCategoricalColumns.length} categorical (can encode)
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Column Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Select Columns ({selectedColumns.length} selected)
            </label>
            <div className="max-h-48 overflow-y-auto p-3 rounded-lg bg-white/10 border border-white/20">
              {csvSummary.column_names.map((col) => {
                const colType = getColumnType(col);
                return (
                  <label
                    key={col}
                    className="flex items-center gap-2 p-2 hover:bg-white/10 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(col)}
                      onChange={() => handleColumnSelect(col)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm flex-1">{col}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      colType === 'numeric' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {colType}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Operations */}
          <div className="space-y-3">
            <button
              onClick={handleDropColumns}
              disabled={selectedColumns.length === 0}
              className="w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all font-medium"
            >
              Drop Selected Columns
            </button>

            {/* Encoding - Only for Categorical */}
            <div className="p-3 rounded-lg bg-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Encode Categorical</span>
                {!canEncode && selectedColumns.length > 0 && (
                  <span className="text-xs text-yellow-400">Select categorical columns</span>
                )}
              </div>
              <select
                value={encodeMethod}
                onChange={(e) => setEncodeMethod(e.target.value)}
                disabled={!canEncode}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 mb-2 text-white disabled:opacity-50"
              >
                <option value="label">Label Encoding</option>
                <option value="one_hot">One-Hot Encoding</option>
              </select>
              <button
                onClick={handleEncode}
                disabled={!canEncode}
                className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all font-medium"
              >
                Encode ({selectedCategoricalColumns.length})
              </button>
            </div>

            {/* Normalize - Only for Numeric */}
            <div>
              <button
                onClick={handleNormalize}
                disabled={!canNormalize}
                className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all font-medium"
              >
                Normalize Numeric ({selectedNumericColumns.length})
              </button>
              {!canNormalize && selectedColumns.length > 0 && (
                <p className="text-xs text-yellow-400 mt-1 text-center">
                  Select numeric columns to normalize
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Current Dataset Info */}
      <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <CheckCircle className="text-green-400" />
          Current Dataset Information
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-white/10">
            <p className="text-sm text-gray-400">Rows</p>
            <p className="text-xl font-bold">{csvSummary.rows.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-white/10">
            <p className="text-sm text-gray-400">Columns</p>
            <p className="text-xl font-bold">{csvSummary.columns}</p>
          </div>
          <div className="p-3 rounded-lg bg-white/10">
            <p className="text-sm text-gray-400">Numeric</p>
            <p className="text-xl font-bold text-violet-400">
              {csvSummary.numeric_columns.length}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-white/10">
            <p className="text-sm text-gray-400">Categorical</p>
            <p className="text-xl font-bold text-pink-400">
              {csvSummary.categorical_columns.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreprocessPanel;