import React, { useState } from "react";
import useAppState from "../store/appState";
import { analyzeColumn } from "../services/api";
import Plot from "react-plotly.js";

export default function AnalyzePanel() {
  const { sessionId, csvSummary } = useAppState();
  const [selectedColumn, setSelectedColumn] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!csvSummary) return <p className="p-6">Upload a CSV first.</p>;

  const handleAnalyze = async () => {
    if (!selectedColumn) return;
    setLoading(true);
    try {
      const data = await analyzeColumn(sessionId, selectedColumn);
      setAnalysis(data.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Analyze Column</h2>
      <select
        className="border p-2 mb-4 w-full"
        value={selectedColumn}
        onChange={(e) => setSelectedColumn(e.target.value)}
      >
        <option value="">Select Column</option>
        {csvSummary.column_names.map((col) => (
          <option key={col} value={col}>
            {col}
          </option>
        ))}
      </select>
      <button
        onClick={handleAnalyze}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500"
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {analysis && (
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-2">Analysis Result</h3>
          <pre className="bg-white p-4 rounded shadow mb-4">
            {JSON.stringify(analysis, null, 2)}
          </pre>

          {analysis.type === "numeric" && (
            <Plot
              data={[
                {
                  x: Array.from({ length: analysis.count }, (_, i) => i + 1),
                  y: Array.from({ length: analysis.count }, () =>
                    Math.random() * (analysis.max - analysis.min) + analysis.min
                  ),
                  type: "scatter",
                  mode: "lines+markers",
                  marker: { color: "blue" },
                },
              ]}
              layout={{ width: 700, height: 400, title: `${selectedColumn} Chart` }}
            />
          )}
        </div>
      )}
    </div>
  );
}
