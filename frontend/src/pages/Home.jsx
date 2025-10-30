import React, { useState } from "react";
import Navbar from "../components/Navbar";
import UploadPanel from "../components/UploadPanel";
import Dashboard from "../components/Dashboard";
import AnalyzePanel from "../components/AnalyzePanel";

export default function Home() {
  const [activeModule, setActiveModule] = useState("Upload");

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar setActiveModule={setActiveModule} activeModule={activeModule} />
      {activeModule === "Upload" && (
        <>
          <UploadPanel />
          <Dashboard />
        </>
      )}
      {activeModule === "Visualization" && <AnalyzePanel />}
      {activeModule === "Preprocessing" && (
        <div className="p-6 text-center">Preprocessing module coming soon...</div>
      )}
      {activeModule === "ML" && (
        <div className="p-6 text-center">ML module coming soon...</div>
      )}
    </div>
  );
}
