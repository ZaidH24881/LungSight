import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import HeatmapOverlay from "../ui/HeatmapOverlay";
import FindingsList from "../ui/FindingsList";
import ReportActions from "../ui/ReportActions";

export default function ResultsPage() {
    const { state } = useLocation(); // { id, imageUrl, report }
    const [data, setData] = useState(state && state.imageUrl ? {
        imageUrl: state.imageUrl,
        fileName: state.fileName,
        report: null,
        id: state.id || null
    } : null);
    const [loading, setLoading] = useState(false);
    const [comparison, setComparison] = useState(null);
    const fileInputRef = useRef(null);

    // If router didn't pass state (working offline / waiting backend), load mock report
    useEffect(() => {
        // If we already have report, don't fetch
        if (data && data.report) return;
        setLoading(true);
        fetch("/mock-report.json")
            .then((r) => r.json())
            .then((json) => {
                setData(prev => ({
                    ...prev,
                    report: json.report,
                    // Only use mock imageUrl if we don't already have one (i.e., not user upload)
                    imageUrl: prev && prev.imageUrl ? prev.imageUrl : json.imageUrl,
                    id: prev && prev.id ? prev.id : json.id
                }));
            })
            .catch((err) => console.warn("Failed to load mock report:", err))
            .finally(() => setLoading(false));
    }, [data]);

    if (loading) return <div className="content-wrapper" style={{ padding: 24 }}>Loading report…</div>;
    if (!data || !data.report) return <div className="content-wrapper" style={{ padding: 24 }}>No report data. Go back and upload.</div>;

    const { imageUrl, report } = data;

    return (
        <div className="results-grid content-wrapper">
            <div className="panel-card left-panel">
                {!comparison ? (
                    <HeatmapOverlay imageUrl={imageUrl} findings={report.findings} />
                ) : (
                    <div className="comparison-grid">
                        <div className="compare-card">
                            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Primary</div>
                            <HeatmapOverlay imageUrl={imageUrl} findings={report.findings} />
                        </div>
                        <div className="compare-card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                <div style={{ fontSize: 12, color: "var(--muted)" }}>Comparison</div>
                                <button onClick={() => {
                                    URL.revokeObjectURL(comparison?.objectUrl || "");
                                    setComparison(null);
                                }} style={{ fontSize: 12 }}>Remove</button>
                            </div>
                            <HeatmapOverlay imageUrl={comparison?.imageUrl} findings={comparison?.report?.findings || []} />
                        </div>
                    </div>
                )}
            </div>

            <div className="right-panel">
                <div className="panel-card impression-card">
                    <h2 style={{ marginTop: 0 }}>Impression</h2>
                    <p><strong>Triage:</strong> {report.triage}</p>
                    <p>{report.overallImpression}</p>
                </div>

                <FindingsList findings={report.findings} />

                <div className="panel-card actions-card">
                    <ReportActions report={report} data={data} />
                    <div style={{ marginLeft: 8 }}>
                        <input ref={fileInputRef} type="file" accept="image/*" id="compare-input" style={{ display: 'none' }} onChange={async (e) => {
                            const file = e.target.files && e.target.files[0];
                            if (!file) return;
                            // create object URL for preview
                            const objectUrl = URL.createObjectURL(file);
                            // fetch mock report for the new image
                            try {
                                const r = await fetch('/mock-report.json');
                                const json = await r.json();
                                const adapted = { imageUrl: objectUrl, report: json.report, id: `cmp-${Date.now()}`, objectUrl };
                                setComparison(adapted);
                            } catch (err) {
                                console.warn('Failed to get mock report for comparison', err);
                                const adapted = { imageUrl: objectUrl, report: { findings: [] }, id: `cmp-${Date.now()}`, objectUrl };
                                setComparison(adapted);
                            }
                        }} />
                        <button style={{ marginLeft: 8 }} onClick={() => fileInputRef.current?.click()}>Compare another image</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
