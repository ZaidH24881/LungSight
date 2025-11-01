import { useLocation } from "react-router-dom";
import HeatmapOverlay from "../ui/HeatmapOverlay";
import FindingsList from "../ui/FindingsList";
import ChatPanel from "../ui/ChatPanel";
import ReportActions from "../ui/ReportActions";

export default function ResultsPage() {
    const { state } = useLocation(); // { id, imageUrl, report }
    if (!state) return <div style={{ padding: 16 }}>No report data. Go back and upload.</div>;
    const { imageUrl, report } = state;

    return (
        <div style={{ 
            display: "grid", 
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
            gap: "1rem", 
            padding: "1rem",
            maxHeight: "100vh",
            overflow: "hidden",
            '@media (max-width: 768px)': {
                gridTemplateColumns: "1fr",
                maxHeight: "none",
                overflow: "auto"
            }
        }}>
            <div style={{ 
                border: "1px solid #eee", 
                borderRadius: 12, 
                padding: 12,
                maxHeight: "calc(100vh - 2rem)",
                overflow: "auto"
            }}>
                <HeatmapOverlay imageUrl={imageUrl} findings={report.findings} />
            </div>
            <div style={{ 
                display: "grid", 
                gap: "1rem",
                maxHeight: "calc(100vh - 2rem)",
                overflow: "auto"
            }}>
                <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                    <h2 style={{ marginTop: 0 }}>Impression</h2>
                    <p><strong>Triage:</strong> {report.triage}</p>
                    <p>{report.overallImpression}</p>
                </div>
                <FindingsList findings={report.findings} />
                <ReportActions report={report} data={state} />
                <ChatPanel context={report} />
            </div>
        </div>
    );
}
