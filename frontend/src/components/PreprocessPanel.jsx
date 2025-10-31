import React, { useState } from 'react';
import { Zap, Settings, CheckCircle, Info, Sparkles, BookOpen, AlertCircle, Check } from 'lucide-react';
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
  const { sessionId, csvSummary, setCsvSummary, setNotification, setLoading, setActiveTab } = useAppState();
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [missingStrategy, setMissingStrategy] = useState('mean');
  const [encodeMethod, setEncodeMethod] = useState('label');
  const [preprocessedColumns, setPreprocessedColumns] = useState(new Map()); // Store column -> operation mapping
  const [showTips, setShowTips] = useState(false);

  const refreshSummary = async () => {
    try {
      const response = await getSessionInfo(sessionId);
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

  const selectedNumericColumns = selectedColumns.filter(col => 
    csvSummary.numeric_columns.includes(col)
  );

  const selectedCategoricalColumns = selectedColumns.filter(col => 
    csvSummary.categorical_columns.includes(col)
  );

  const canNormalize = selectedNumericColumns.length > 0;
  const canEncode = selectedCategoricalColumns.length > 0;

  const markAsPreprocessed = (columns, operation) => {
    setPreprocessedColumns(prev => {
      const newMap = new Map(prev);
      columns.forEach(col => {
        if (!newMap.has(col)) {
          newMap.set(col, [operation]);
        } else if (!newMap.get(col).includes(operation)) {
          newMap.get(col).push(operation);
        }
      });
      return newMap;
    });
  };

  const isColumnPreprocessed = (column) => preprocessedColumns.has(column);
  const getColumnOperations = (column) => preprocessedColumns.get(column) || [];

  const checkIfAlreadyPreprocessed = (columns, operation) => {
    const alreadyProcessed = columns.filter(col => {
      const ops = getColumnOperations(col);
      return ops.includes(operation);
    });
    return alreadyProcessed;
  };

  const handleMissing = async () => {
    setLoading(true);
    try {
      const response = await handleMissingValues(sessionId, missingStrategy);
      setNotification({ message: response.message, type: 'success' });
      markAsPreprocessed(csvSummary.column_names, 'missing_handled');
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

    // Check if already encoded
    const alreadyProcessed = checkIfAlreadyPreprocessed(selectedCategoricalColumns, 'encoded');
    if (alreadyProcessed.length > 0) {
      setNotification({
        message: `Warning: ${alreadyProcessed.join(', ')} already encoded. Encoding again may cause issues.`,
        type: 'error'
      });
      return;
    }

    // Warning for one-hot encoding with high cardinality
    if (encodeMethod === 'one_hot' && csvSummary.column_info) {
      for (const col of selectedCategoricalColumns) {
        const colInfo = csvSummary.column_info.columns.find(c => c.name === col);
        if (colInfo && colInfo.unique_count > 100) {
          setNotification({
            message: `Warning: Column '${col}' has ${colInfo.unique_count} unique values. One-hot encoding is not recommended. Use Label Encoding instead.`,
            type: 'error'
          });
          return;
        }
        if (colInfo && colInfo.unique_count > 50) {
          const confirm = window.confirm(
            `Column '${col}' has ${colInfo.unique_count} unique values. ` +
            `This will create ${colInfo.unique_count} new columns. Continue?`
          );
          if (!confirm) return;
        }
      }
    }

    setLoading(true);
    try {
      const response = await encodeColumns(sessionId, selectedCategoricalColumns, encodeMethod);
      setNotification({ message: response.message, type: 'success' });
      markAsPreprocessed(selectedCategoricalColumns, 'encoded');
      setSelectedColumns([]);
      await refreshSummary();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Error encoding columns';
      setNotification({ message: errorMsg, type: 'error' });
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

    // Check if already normalized
    const alreadyProcessed = checkIfAlreadyPreprocessed(selectedNumericColumns, 'normalized');
    if (alreadyProcessed.length > 0) {
      setNotification({
        message: `Warning: ${alreadyProcessed.join(', ')} already normalized. Normalizing again will cause incorrect scaling.`,
        type: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await normalizeData(sessionId, selectedNumericColumns);
      setNotification({ message: response.message, type: 'success' });
      markAsPreprocessed(selectedNumericColumns, 'normalized');
      setSelectedColumns([]);
      await refreshSummary();
    } catch (error) {
      setNotification({ message: 'Error normalizing data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyBoth = async () => {
    if (selectedNumericColumns.length === 0 && selectedCategoricalColumns.length === 0) {
      setNotification({ message: 'Please select columns', type: 'error' });
      return;
    }

    setLoading(true);
    
    try {
      // Encode categorical first
      if (selectedCategoricalColumns.length > 0) {
        const alreadyEncoded = checkIfAlreadyPreprocessed(selectedCategoricalColumns, 'encoded');
        if (alreadyEncoded.length === 0) {
          await encodeColumns(sessionId, selectedCategoricalColumns, encodeMethod);
          markAsPreprocessed(selectedCategoricalColumns, 'encoded');
        }
      }

      // Then normalize numeric
      if (selectedNumericColumns.length > 0) {
        const alreadyNormalized = checkIfAlreadyPreprocessed(selectedNumericColumns, 'normalized');
        if (alreadyNormalized.length === 0) {
          await normalizeData(sessionId, selectedNumericColumns);
          markAsPreprocessed(selectedNumericColumns, 'normalized');
        }
      }

      setNotification({ message: 'Operations applied successfully!', type: 'success' });
      setSelectedColumns([]);
      await refreshSummary();
    } catch (error) {
      setNotification({ message: 'Error applying operations', type: 'error' });
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

      // Remove from preprocessed set
      setPreprocessedColumns(prev => {
        const newMap = new Map(prev);
        selectedColumns.forEach(col => newMap.delete(col));
        return newMap;
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
        <p className="text-gray-400">Transform your data into ML-ready format</p>
      </div>

      {/* Preprocessing Guide Button */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="text-blue-400" size={24} />
            <div>
              <div className="font-medium text-blue-400">Need help with preprocessing?</div>
              <div className="text-sm text-gray-400">Learn about each technique with examples</div>
            </div>
          </div>
          <button
            onClick={() => setShowTips(!showTips)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all font-medium"
          >
            {showTips ? 'Hide Guide' : 'View Guide'}
          </button>
        </div>
      </div>

      {/* Preprocessing Tips */}
      {showTips && (
        <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 animate-fadeIn">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="text-yellow-400" />
            Preprocessing Guide
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="font-medium text-violet-400 mb-2">Missing Values</div>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• <strong>Mean/Median:</strong> Good for numeric data without outliers</li>
                <li>• <strong>Mode:</strong> Best for categorical data or most frequent value</li>
                <li>• <strong>Drop:</strong> Remove rows with any missing values (use carefully)</li>
              </ul>
            </div>
            
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="font-medium text-pink-400 mb-2">Encoding (Categorical → Numeric)</div>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• <strong>Label Encoding:</strong> Converts categories to integers (0, 1, 2...). Use for ordinal data.</li>
                <li>• <strong>One-Hot Encoding:</strong> Creates binary columns (0, 1) for each category. Use for nominal data.</li>
                <li>• ⚠️ Required for ML models - they only work with numbers!</li>
              </ul>
            </div>
            
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="font-medium text-green-400 mb-2">Normalization (Scaling)</div>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Scales numeric features to same range (mean=0, std=1)</li>
                <li>• Important for models sensitive to scale (Neural Networks, SVM, KNN)</li>
                <li>• Apply after handling missing values</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <div className="font-medium text-yellow-400 mb-2">⚡ Pro Tips for Your Dataset</div>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Always handle missing values first</li>
                <li>• Encode categorical columns before normalization</li>
                <li>• Normalize numeric features last</li>
                <li>• Never preprocess the same column twice!</li>
                <li>• Download your preprocessed data before training models</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Preprocessed Columns Info */}
      {preprocessedColumns.size > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/30">
          <div className="flex items-start gap-2">
            <CheckCircle size={20} className="text-green-400 mt-0.5" />
            <div>
              <div className="font-medium text-green-400 mb-1">
                ✓ {preprocessedColumns.size} column(s) preprocessed
              </div>
              <div className="text-sm text-gray-400">
                Columns marked with ✓ have been modified. Hover to see operations applied.
              </div>
            </div>
          </div>
        </div>
      )}

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
                Apply to All Columns
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
                const isProcessed = isColumnPreprocessed(col);
                const operations = getColumnOperations(col);
                return (
                  <label
                    key={col}
                    className={`flex items-center gap-2 p-2 hover:bg-white/10 rounded cursor-pointer transition-all ${
                      isProcessed ? 'bg-green-500/10 border border-green-500/30 mb-1' : ''
                    }`}
                    title={isProcessed ? `Operations: ${operations.join(', ')}` : ''}
                  >
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(col)}
                      onChange={() => handleColumnSelect(col)}
                      className="w-4 h-4"
                    />
                    {isProcessed && (
                      <Check size={14} className="text-green-400" />
                    )}
                    <span className={`text-sm flex-1 ${isProcessed ? 'text-green-400 font-medium' : ''}`}>
                      {col}
                    </span>
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
                  <span className="text-xs text-yellow-400">Select categorical</span>
                )}
              </div>
              <select
                value={encodeMethod}
                onChange={(e) => setEncodeMethod(e.target.value)}
                disabled={!canEncode}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 mb-2 text-white disabled:opacity-50"
              >
                <option value="label">Label Encoding (0,1,2...)</option>
                <option value="one_hot">One-Hot Encoding (0,1)</option>
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
            <button
              onClick={handleNormalize}
              disabled={!canNormalize}
              className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all font-medium"
            >
              Normalize Numeric ({selectedNumericColumns.length})
            </button>

            {/* Apply Both */}
            {canNormalize && canEncode && (
              <button
                onClick={handleApplyBoth}
                className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition-all font-medium border-2 border-violet-400"
              >
                ⚡ Apply Both Operations
              </button>
            )}
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