import create from "zustand";

const useAppState = create((set) => ({
  sessionId: null,
  csvSummary: null,
  setSessionId: (id) => set({ sessionId: id }),
  setCsvSummary: (summary) => set({ csvSummary: summary }),
}));

export default useAppState;
