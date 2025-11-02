import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UploadPage(){
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  function onFileChange(e){
    setFile(e.target.files?.[0] ?? null);
  }
  function onAnalyze(){
    if (!file) return;
    const fakeId = Date.now().toString();
    const objectUrl = URL.createObjectURL(file);
    // Pass imageUrl and file info via router state
    navigate(`/results/${fakeId}`, { state: { imageUrl: objectUrl, fileName: file.name } });
  }

  return (
    <>
      <section className="hero">
        <h1>Hackathon X-Ray</h1>
        <p>
          Quickly analyze chest X-rays with an explainable, clinician-oriented assistant.
          Upload a de-identified scan to get model-identified findings, confidence scores, and localization heatmaps you can review and export.
        </p>
        <p style={{ color: 'var(--muted)', marginTop: 12 }}>
          Built for rapid triage: results are presented clearly with highlighted regions, a concise impression, and easy export options. Data stays local while you test — no PHI is uploaded in this demo.
        </p>
      </section>

      <section className="panel">
        <h2>Upload Chest X-Ray</h2>
        <div className="sub">PNG / JPG / DICOM (de-identified)</div>

        <div className="row">
          <label className="file-label" htmlFor="file">
            {/* upload icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="#cfcaf3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" stroke="#cfcaf3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Choose file
          </label>
          <input id="file" type="file" accept=".png,.jpg,.jpeg,.dcm" onChange={onFileChange}/>
          <button className="btn btn-primary" onClick={onAnalyze} disabled={!file}>
            Analyze
          </button>
        </div>

        <div className="file-name">
          {file ? <>Selected: <strong>{file.name}</strong></> : "No file chosen"}
        </div>

        <div className="features">
          <div className="feature">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#9f7aea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Model predictions with confidence scores
          </div>
          <div className="feature">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#9f7aea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Grad-CAM-style heatmaps highlighting regions of interest
          </div>
          <div className="feature">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#9f7aea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Structured report you can export or copy to notes
          </div>
        </div>
      </section>
    </>
  );
}