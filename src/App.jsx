// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import UploadPage from "./pages/UploadPage";
import ResultsPage from "./pages/ResultsPage";

function App() {
  return (
    <BrowserRouter>
      {/*
      🔹 Header temporarily disabled
      <header className="app-header">
        <div className="container header-inner">
          <Link to="/" className="brand">Hackathon X-Ray</Link>
        </div>
      </header>
      */}

      <main className="app-main centered">
        <div className="content-wrapper">
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/results/:id" element={<ResultsPage />} />
          </Routes>
        </div>
      </main>

      <footer className="app-footer">
        © 2025 Hackathon X-Ray — Accelerating healthcare through AI.
      </footer>
    </BrowserRouter>
  );
}

export default App;