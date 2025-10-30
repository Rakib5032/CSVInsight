import React from "react";
import useAppState from "../store/appState";

export default function Dashboard() {
  const { csvSummary } = useAppState();

  if (!csvSummary) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">CSV Summary</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="font-semibold">Rows</p>
          <p>{csvSummary.rows}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="font-semibold">Columns</p>
          <p>{csvSummary.columns}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="font-semibold">Numeric Columns</p>
          <p>{csvSummary.numeric_columns.join(", ")}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="font-semibold">Categorical Columns</p>
          <p>{csvSummary.categorical_columns.join(", ")}</p>
        </div>
      </div>
      <h3 className="text-xl font-bold mb-2">Missing Values</h3>
      <div className="bg-white p-4 rounded shadow overflow-x-auto">
        <pre>{JSON.stringify(csvSummary.missing_values, null, 2)}</pre>
      </div>
    </div>
  );
}
