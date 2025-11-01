import React from "react";
import "./App.css"; // make sure this exists

function App() {
  return (
    <div>
      {/* 🔹 Top Bar */}
      <header
        style={{
          backgroundColor: "#7C3AED",
          color: "white",
          padding: "1rem 2rem",
          textAlign: "left",
          fontSize: "1.5rem",
          fontWeight: "bold",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          zIndex: 10,
        }}
      >
        Hackathon X-Ray
      </header>

      {/* 🔹 Main Content */}
      <div style={{ textAlign: "center", marginTop: "6rem" }}>
        <h1>Welcome to Hackathon X-Ray</h1>
        <p>Your AI-powered medical imaging app starts here.</p>
        <button> Upload X-Ray</button>
      </div>
    </div>
  );
}

export default App;
