export default function FindingsList({ findings = [] }) {
    if (!findings.length) return null;
    return (
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Findings</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {findings.map((f, idx) => (
                    <li key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f2f2f2" }}>
                        <span>{f.name}</span>
                        <ConfidenceBar value={f.confidence || 0} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
function ConfidenceBar({ value = 0 }) {
    const pct = Math.round(value * 100);
    const color = pct >= 90 ? "#ef4444" : pct >= 50 ? "#f59e0b" : "#22c55e";
    return (
        <div style={{ width: 160, height: 10, background: "#eee", borderRadius: 8 }}>
            <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 8 }} />
        </div>
    );
}
