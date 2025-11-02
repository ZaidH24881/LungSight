// src/pages/ComparePage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { analyzeXray, runAll } from "../lib/api";
import CompareViewer from "../ui/CompareViewer";

export default function ComparePage() {
  const { state } = useLocation(); // expecting { left: {studyId, fileName, imageUrl} }
  const [left, setLeft] = useState(null);
  const [right, setRight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const inputRef = useRef(null);

  // Load LEFT (existing study)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!state?.left?.studyId) return;
      try {
        setLoading(true);
        const payload = await runAll(state.left.studyId);
        if (cancelled) return;
        setLeft({
          studyId: payload.studyId,
          fileName: payload?.meta?.fileName ?? state.left.fileName ?? null,
          imageUrl: payload?.meta?.preview?.url ?? payload?.imageUrl ?? state.left.imageUrl ?? null,
          findingsText: payload?.vlm?.findings ?? payload?.findings ?? "",
          models: Array.isArray(payload?.models) ? payload.models : [],
          results: payload?.results ?? [],
        });
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Failed to load left study.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [state?.left?.studyId]);

  async function onPickRight(e) {
    const f = e.target.files?.[0];
    if (!f) return;

    setErr(null);
    setLoading(true);
    try {
      // 1) upload right file -> studyId
      const analyzed = await analyzeXray({ file: f });
      // 2) fetch right results
      const payload = await runAll(analyzed.studyId);

      setRight({
        studyId: payload.studyId,
        fileName: analyzed.fileName ?? f.name,
        imageUrl: analyzed.imageUrl ?? payload?.meta?.preview?.url ?? payload?.imageUrl ?? null,
        findingsText: payload?.vlm?.findings ?? payload?.findings ?? "",
        models: Array.isArray(payload?.models) ? payload.models : [],
        results: payload?.results ?? [],
      });
    } catch (e) {
      setErr(e?.message || "Failed to load right study.");
    } finally {
      setLoading(false);
      // clear input so same file can be selected again if needed
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="content-wrapper" style={{ padding: 24 }}>
      <div className="panel-card" style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0 }}>Compare Studies</h2>

        <label className="btn btn-secondary" style={{ cursor: "pointer" }}>
          Choose second file…
          <input
            ref={inputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.dcm,.dicom,image/png,image/jpeg,application/dicom"
            onChange={onPickRight}
            style={{ display: "none" }}
          />
        </label>

        {loading && <span style={{ color: "#666" }}>Loading…</span>}
        {err && <span style={{ color: "#b91c1c" }}>{err}</span>}
      </div>

      <CompareViewer left={left} right={right} />
    </div>
  );
}
