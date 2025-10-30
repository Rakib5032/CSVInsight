import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-200 py-4 mt-10">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          CSVInsight &copy; {new Date().getFullYear()}. All rights reserved.
        </p>
        <p className="text-sm mt-1">
          Developed by Rakibul Haque Rabbi.
        </p>
        <p className="text-sm mt-1">
          Version 0.1.0 – Phase 1
        </p>
      </div>
    </footer>
  );
}
