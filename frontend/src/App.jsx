import React from "react";
import Home from "./pages/Home";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Main content grows to push footer down */}
      <main className="flex-grow">
        <Home />
      </main>

      {/* Footer will stay at the bottom */}
      <Footer />
    </div>
  );
}

export default App;
