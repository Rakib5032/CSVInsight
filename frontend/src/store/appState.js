import { create } from 'zustand';

const useAppState = create((set) => ({
  // Session data
  sessionId: null,
  csvSummary: null,
  currentCSV: null,
  
  // UI state
  activeTab: 'upload',
  loading: false,
  notification: null,
  
  // Analysis data
  selectedColumn: '',
  columnAnalysis: null,
  
  // Actions
  setSessionId: (sessionId) => set({ sessionId }),
  
  setCsvSummary: (summary) => set({ csvSummary: summary }),
  
  setCurrentCSV: (csv) => set({ currentCSV: csv }),
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setLoading: (loading) => set({ loading }),
  
  setNotification: (notification) => {
    set({ notification });
    if (notification) {
      setTimeout(() => set({ notification: null }), 3000);
    }
  },
  
  setSelectedColumn: (column) => set({ selectedColumn: column }),
  
  setColumnAnalysis: (analysis) => set({ columnAnalysis: analysis }),
  
  // Reset state
  resetSession: () => set({
    sessionId: null,
    csvSummary: null,
    currentCSV: null,
    selectedColumn: '',
    columnAnalysis: null,
  }),
  
  // Update CSV summary after preprocessing
  updateCsvSummary: (summary) => set({ csvSummary: summary }),
}));

export default useAppState;