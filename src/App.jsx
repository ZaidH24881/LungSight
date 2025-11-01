// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css"; // keep your styles

// Pages (create these files as shown earlier)
import UploadPage from "./pages/UploadPage";
import ResultsPage from "./pages/ResultsPage";

function App() {
  return (
    <BrowserRouter>
      {/* 🔹 Top Bar (your original styling) */}
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
        <Link to="/" style={{ color: "white", textDecoration: "none" }}>
          Hackathon X-Ray
        </Link>
      </header>

      {/* 🔹 Main Content (router outlet) */}
      <main style={{ marginTop: "6rem" }}>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/results/:id" element={<ResultsPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
