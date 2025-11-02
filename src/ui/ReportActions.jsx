// src/ui/ReportActions.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function ReportActions({ report, data }) {
  const navigate = useNavigate();

  function onDownloadPDF() {
    // your existing implementation (unchanged)
    // just a placeholder here:
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data?.fileName || data?.id || "report"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function onCompare() {
    // Navigate to compare page with the current (left) study pre-filled
    navigate("/compare", {
      state: {
        left: {
          studyId: data?.id ?? report?.studyId ?? null,
          fileName: data?.fileName ?? report?.fileName ?? null,
          imageUrl: data?.imageUrl ?? report?.imageUrl ?? null,
        },
      },
    });
  }

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button className="btn btn-primary" onClick={onDownloadPDF}>
        Download PDF
      </button>

      {/* New: Compare button */}
      <button className="btn btn-secondary" onClick={onCompare}>
        Compare…
      </button>
    </div>
  );
}
