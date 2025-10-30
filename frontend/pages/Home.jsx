import React from 'react';
import UploadPanel from '../components/UploadPanel';
import AnalyzePanel from '../components/AnalyzePanel';
import PreprocessPanel from '../components/PreprocessPanel';
import useAppState from '../store/appState';

const Home = () => {
  const { activeTab } = useAppState();

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return <UploadPanel />;
      case 'analyze':
        return <AnalyzePanel />;
      case 'preprocess':
        return <PreprocessPanel />;
      case 'ml':
        return (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">Machine Learning Models</h2>
            <p className="text-gray-400 mb-8">Coming Soon...</p>
            <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
              <p className="text-left text-gray-300">
                The ML module will include:
              </p>
              <ul className="mt-4 space-y-2 text-left text-gray-400">
                <li>• Classification models (Logistic Regression, Random Forest, SVM)</li>
                <li>• Regression models (Linear, Ridge, Lasso)</li>
                <li>• Clustering (K-Means, DBSCAN)</li>
                <li>• Model evaluation and comparison</li>
                <li>• Feature importance visualization</li>
                <li>• Export trained models</li>
              </ul>
            </div>
          </div>
        );
      default:
        return <UploadPanel />;
    }
  };

  return (
    <div className="min-h-full">
      {renderContent()}
    </div>
  );
};

export default Home;