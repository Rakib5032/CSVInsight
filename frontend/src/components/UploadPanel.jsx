import React, { useState } from 'react';
import { Upload, CheckCircle, FileText, TrendingUp, Database, Activity, BarChart, Sparkles, Info, Target, Zap, BookOpen, ExternalLink, Video, FileQuestion, MessageCircle } from 'lucide-react';
import { uploadCSV } from '../services/api';
import useAppState from '../store/appState';

const UploadPanel = () => {
  const { setSessionId, csvSummary, setCsvSummary, setNotification, setLoading } = useAppState();
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState('');

  const simulateProgress = async () => {
    // Stage 1: Reading file (0-30%)
    setUploadStage('Reading file...');
    for (let i = 0; i <= 30; i += 5) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Stage 2: Uploading (30-60%)
    setUploadStage('Uploading to server...');
    for (let i = 30; i <= 60; i += 5) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Stage 3: Processing (60-90%)
    setUploadStage('Analyzing data types...');
    for (let i = 60; i <= 90; i += 5) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Stage 4: Finalizing (90-100%)
    setUploadStage('Finalizing...');
    for (let i = 90; i <= 100; i += 2) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 30));
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      setNotification({ message: 'Please upload a CSV file', type: 'error' });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setLoading(true);
    
    try {
      // Start progress simulation
      const progressPromise = simulateProgress();
      
      // Actual upload
      const response = await uploadCSV(file);
      
      // Wait for progress to finish
      await progressPromise;
      
      setSessionId(response.session_id);
      setCsvSummary(response);
      setNotification({ message: 'CSV uploaded successfully! ✨', type: 'success' });
      setIsUploading(false);
    } catch (error) {
      console.error('Upload error:', error);
      setNotification({ message: 'Error uploading CSV file', type: 'error' });
      setIsUploading(false);
      setUploadProgress(0);
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

  // Calculate data quality insights
  const getDataQuality = () => {
    if (!csvSummary || !csvSummary.column_info) return null;
    
    const totalNulls = csvSummary.column_info.columns.reduce((sum, col) => sum + col.null_count, 0);
    const totalCells = csvSummary.rows * csvSummary.columns;
    const nullPercentage = ((totalNulls / totalCells) * 100).toFixed(1);
    const quality = nullPercentage < 5 ? 'Excellent' : nullPercentage < 15 ? 'Good' : 'Needs Cleaning';
    
    return { nullPercentage, quality, totalNulls };
  };

  const dataQuality = csvSummary ? getDataQuality() : null;

  // Learning resources
  const learningResources = [
    {
      title: "Data Preprocessing Guide",
      description: "Complete guide to cleaning and preparing data",
      url: "https://www.kaggle.com/learn/data-cleaning",
      icon: BookOpen,
      color: "blue"
    },
    {
      title: "Encoding Techniques",
      description: "When to use Label vs One-Hot encoding",
      url: "https://machinelearningmastery.com/one-hot-encoding-for-categorical-data/",
      icon: FileQuestion,
      color: "purple"
    },
    {
      title: "Handling Missing Data",
      description: "Best practices for dealing with null values",
      url: "https://www.kaggle.com/learn/data-cleaning",
      icon: Target,
      color: "green"
    },
    {
      title: "Data Visualization Tips",
      description: "Choose the right chart for your data",
      url: "https://www.kaggle.com/learn/data-visualization",
      icon: Video,
      color: "pink"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {!csvSummary ? (
        <>
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 mb-4 shadow-lg">
              <Sparkles size={32} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to CSVInsight</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your intelligent companion for data analysis and preprocessing. Upload your CSV file to unlock powerful insights, visualizations, and ML-ready data transformations.
            </p>
          </div>

          {/* Features Overview */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200">
              <Target className="text-violet-600 mb-2" size={24} />
              <h3 className="font-bold text-gray-900 mb-1">Instant Analysis</h3>
              <p className="text-sm text-gray-600">Get comprehensive statistics and visualizations in seconds</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200">
              <Zap className="text-pink-600 mb-2" size={24} />
              <h3 className="font-bold text-gray-900 mb-1">Smart Preprocessing</h3>
              <p className="text-sm text-gray-600">Type-aware operations that prepare your data for ML models</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
              <Activity className="text-blue-600 mb-2" size={24} />
              <h3 className="font-bold text-gray-900 mb-1">Advanced Analytics</h3>
              <p className="text-sm text-gray-600">Correlations, outliers, and multiple visualization types</p>
            </div>
          </div>
          
          {/* Upload Area */}
          {!isUploading ? (
            <label
              className="block"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                dragActive 
                  ? 'border-violet-500 bg-violet-50' 
                  : 'border-gray-300 bg-white hover:border-violet-500 hover:bg-violet-50'
              }`}>
                <Upload size={48} className="mx-auto mb-4 text-violet-500" />
                <p className="text-lg font-medium text-gray-900 mb-2">Drop your CSV file here</p>
                <p className="text-sm text-gray-600 mb-4">or click to browse from your computer</p>
                <div className="inline-block px-6 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-medium hover:from-violet-700 hover:to-purple-700 transition-all shadow-md">
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
          ) : (
            /* Upload Progress */
            <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-lg">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100 mb-4">
                  <Upload className="text-violet-600 animate-pulse" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Uploading Your Data</h3>
                <p className="text-gray-600">{uploadStage}</p>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span className="font-bold text-violet-600">{uploadProgress}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-violet-600 to-purple-600 transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-4 gap-2 mt-6">
                <div className={`text-center p-2 rounded-lg ${uploadProgress >= 30 ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <div className={`text-xs font-medium ${uploadProgress >= 30 ? 'text-green-700' : 'text-gray-500'}`}>
                    Reading
                  </div>
                </div>
                <div className={`text-center p-2 rounded-lg ${uploadProgress >= 60 ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <div className={`text-xs font-medium ${uploadProgress >= 60 ? 'text-green-700' : 'text-gray-500'}`}>
                    Uploading
                  </div>
                </div>
                <div className={`text-center p-2 rounded-lg ${uploadProgress >= 90 ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <div className={`text-xs font-medium ${uploadProgress >= 90 ? 'text-green-700' : 'text-gray-500'}`}>
                    Analyzing
                  </div>
                </div>
                <div className={`text-center p-2 rounded-lg ${uploadProgress === 100 ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <div className={`text-xs font-medium ${uploadProgress === 100 ? 'text-green-700' : 'text-gray-500'}`}>
                    Complete
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Learning Resources */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="text-violet-600" size={24} />
              Learning Resources
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {learningResources.map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-white border border-gray-200 hover:border-violet-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-${resource.color}-100 group-hover:scale-110 transition-transform`}>
                      <resource.icon className={`text-${resource.color}-600`} size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{resource.title}</h4>
                        <ExternalLink size={14} className="text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600">{resource.description}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="mt-8 p-4 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-3">
              <Info className="text-blue-600 mt-0.5" size={20} />
              <div className="text-sm">
                <div className="font-medium text-blue-900 mb-1">💡 Pro Tips</div>
                <ul className="text-blue-700 space-y-1">
                  <li>• Ensure your CSV has headers in the first row</li>
                  <li>• Files up to 100MB are supported</li>
                  <li>• Missing values marked as "-" will be automatically detected</li>
                  <li>• All data processing happens securely in your browser session</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Dashboard Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
            <p className="text-gray-600">Comprehensive summary of your dataset with actionable insights</p>
          </div>

          {/* Data Quality Insight */}
          {dataQuality && (
            <div className={`mb-6 p-4 rounded-xl border ${
              dataQuality.quality === 'Excellent' 
                ? 'bg-green-50 border-green-200' 
                : dataQuality.quality === 'Good'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                <CheckCircle className={
                  dataQuality.quality === 'Excellent' ? 'text-green-600' :
                  dataQuality.quality === 'Good' ? 'text-yellow-600' : 'text-red-600'
                } size={24} />
                <div>
                  <div className="font-bold text-gray-900 mb-1">Data Quality: {dataQuality.quality}</div>
                  <div className="text-sm text-gray-700">
                    {dataQuality.nullPercentage}% missing values ({dataQuality.totalNulls.toLocaleString()} cells). 
                    {dataQuality.quality === 'Needs Cleaning' && ' Consider using preprocessing tools to handle missing data.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Key Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 hover:scale-105 transition-transform shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Database size={24} className="text-violet-600" />
                <div className="text-sm text-gray-600">Total Rows</div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{csvSummary.rows.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">Data points for analysis</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 hover:scale-105 transition-transform shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <BarChart size={24} className="text-pink-600" />
                <div className="text-sm text-gray-600">Total Columns</div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{csvSummary.columns}</div>
              <div className="text-xs text-gray-500 mt-1">Features in dataset</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 hover:scale-105 transition-transform shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Activity size={24} className="text-blue-600" />
                <div className="text-sm text-gray-600">Numeric</div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{csvSummary.numeric_columns.length}</div>
              <div className="text-xs text-gray-500 mt-1">Quantitative features</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 hover:scale-105 transition-transform shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <FileText size={24} className="text-green-600" />
                <div className="text-sm text-gray-600">Categorical</div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{csvSummary.categorical_columns.length}</div>
              <div className="text-xs text-gray-500 mt-1">Qualitative features</div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mb-6 p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="text-yellow-500" />
              Smart Recommendations
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {dataQuality && dataQuality.nullPercentage > 5 && (
                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <div className="text-sm font-medium text-yellow-900 mb-1">Handle Missing Values</div>
                  <div className="text-xs text-yellow-700">Use Preprocess tab to fill or remove missing data</div>
                </div>
              )}
              {csvSummary.numeric_columns.length >= 2 && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="text-sm font-medium text-blue-900 mb-1">Check Correlations</div>
                  <div className="text-xs text-blue-700">View relationships in Advanced Analysis tab</div>
                </div>
              )}
              {csvSummary.categorical_columns.length > 0 && (
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="text-sm font-medium text-purple-900 mb-1">Encode Categorical Data</div>
                  <div className="text-xs text-purple-700">Prepare for ML models using Preprocess tab</div>
                </div>
              )}
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="text-sm font-medium text-green-900 mb-1">Ready for Analysis</div>
                <div className="text-xs text-green-700">Start exploring in Analyze or Preview tabs</div>
              </div>
            </div>
          </div>

          {/* Column Information Table */}
          {csvSummary.column_info && (
            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="text-green-600" />
                Column Details
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Column</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Type</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Null Count</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Null %</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Unique</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvSummary.column_info.columns.map((col, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-900">{col.name}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            col.dtype.includes('int') || col.dtype.includes('float')
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {col.dtype}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-700">{col.null_count}</td>
                        <td className="px-3 py-2">
                          <span className={col.null_percentage > 10 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                            {col.null_percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-700">{col.unique_count}</td>
                        <td className="px-3 py-2">
                          {col.null_count > 0 ? (
                            <span className="text-yellow-600 text-xs font-medium">Needs cleaning</span>
                          ) : (
                            <span className="text-green-600 text-xs font-medium">Clean</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* All Columns List */}
          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">All Columns ({csvSummary.columns})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {csvSummary.column_names.map((col, index) => {
                const isNumeric = csvSummary.numeric_columns.includes(col);
                return (
                  <div 
                    key={index} 
                    className="px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-2 group cursor-pointer border border-gray-200"
                    title={col}
                  >
                    <span className={`w-2 h-2 rounded-full ${isNumeric ? 'bg-blue-500' : 'bg-purple-500'}`}></span>
                    <span className="text-sm truncate flex-1 text-gray-800">{col}</span>
                    <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isNumeric ? 'Num' : 'Cat'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upload New File */}
          <div className="mt-6">
            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-violet-500 transition-all cursor-pointer bg-white hover:bg-violet-50">
                <Upload size={32} className="mx-auto mb-2 text-violet-500" />
                <p className="text-sm font-medium text-gray-900 mb-1">Upload New CSV</p>
                <p className="text-xs text-gray-600">Replace current dataset</p>
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

      {/* AI Chat Placeholder */}
      <button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center group z-50"
        title="AI Assistant (Coming Soon)"
        onClick={() => setNotification({ message: 'AI Assistant coming soon! 🤖', type: 'success' })}
      >
        <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};

export default UploadPanel;