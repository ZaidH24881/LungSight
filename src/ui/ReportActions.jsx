export default function ReportActions({ report, data }) {
    async function copyImpression() {
        await navigator.clipboard.writeText(report.overallImpression || "");
        alert("Impression copied.");
    }
    async function downloadPDF() {
        const blob = new Blob(
            [`Hackathon X-Ray Report\nTriage: ${report.triage}\n\nImpression:\n${report.overallImpression}\n\nGenerated: ${new Date().toLocaleString()}`],
            { type: "text/plain" }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `report-${data?.id || "xray"}.txt`; a.click();
        URL.revokeObjectURL(url);
    }
    return (
        <div style={{ display: "flex", gap: 8 }}>
            <button onClick={copyImpression}>Copy Impression</button>
            <button onClick={downloadPDF}>Download PDF</button>
        </div>
    );
}
