import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UploadPage() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const navigate = useNavigate();

    async function handleAnalyze() {
        if (!file) return setErr("Please select a chest X-ray image.");
        setErr(""); setLoading(true);
        try {
            // 🔹 TEMP: mock instead of real backend
            const res = await fetch("/mock-report.json");
            const reportBundle = await res.json(); // { id, imageUrl, report }
            navigate(`/results/${reportBundle.id}`, { state: reportBundle });
        } catch (e) {
            setErr(e.message);
        } finally { setLoading(false); }
    }

    return (
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", padding: "1rem" }}>
            <h1>Upload Chest X-Ray</h1>
            <p>PNG/JPG/DICOM (anonymized). We’ll format the AI analysis.</p>
            <input type="file" accept=".png,.jpg,.jpeg,.dcm" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            {file && <p>Selected: {file.name}</p>}
            {err && <div style={{ color: "crimson" }}>{err}</div>}
            <button disabled={loading} onClick={handleAnalyze}>{loading ? "Analyzing..." : "Analyze"}</button>
        </div>
    );
}
