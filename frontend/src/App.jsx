import React from 'react';
import { Upload, BarChart3, Settings, Brain, FileText, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import Home from './pages/Home';
import Footer from './components/Footer';
import useAppState from './store/appState';

function App() {
  const { activeTab, setActiveTab, csvSummary, notification, csvData } = useAppState();

  const TabButton = ({ icon: Icon, label, value }) => (
    <button
      onClick={() => setActiveTab(value)}
      disabled={!csvSummary && value !== 'upload'}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
        activeTab === value
          ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/50'
          : csvSummary || value === 'upload'
          ? 'bg-white/10 text-gray-300 hover:bg-white/20'
          : 'bg-white/5 text-gray-500 cursor-not-allowed'
      }`}
    >
      <Icon size={18} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex flex-col">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl animate-slide-in ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <BarChart3 size={24} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">CSVInsight</h1>
                <p className="text-xs text-gray-400">Intelligent Data Analysis</p>
              </div>
            </div>
            {csvSummary && (
              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10">
                  <FileText size={16} className="text-violet-400" />
                  <span>{csvSummary.rows.toLocaleString()} rows</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10">
                  <TrendingUp size={16} className="text-pink-400" />
                  <span>{csvSummary.columns} columns</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-sm bg-black/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            <TabButton icon={Upload} label="Upload" value="upload" />
            <TabButton icon={BarChart3} label="Analyze" value="analyze" />
            <TabButton icon={Settings} label="Preprocess" value="preprocess" />
            <TabButton icon={Brain} label="ML Models" value="ml" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Home />
      </main>

      {/* Footer */}
      <Footer />

      {/* Custom Styles */}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }

        /* Select styling */
        select option {
          background-color: #1f2937;
          color: white;
        }
      `}</style>
    </div>
  );
}

export default App;