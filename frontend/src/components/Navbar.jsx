import React from "react";

export default function Navbar({ setActiveModule, activeModule }) {
  const modules = ["Upload", "Visualization", "Preprocessing", "ML"];
  return (
    <nav className="bg-indigo-600 text-white p-4 flex justify-between">
      <div className="font-bold text-xl">CSVInsight</div>
      <div className="flex gap-4">
        {modules.map((module) => (
          <button
            key={module}
            onClick={() => setActiveModule(module)}
            className={`px-4 py-2 rounded hover:bg-indigo-500 ${
              activeModule === module ? "bg-indigo-800" : ""
            }`}
          >
            {module}
          </button>
        ))}
      </div>
    </nav>
  );
}
