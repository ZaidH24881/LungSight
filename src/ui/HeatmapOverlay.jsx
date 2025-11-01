export default function HeatmapOverlay({ imageUrl, findings = [] }) {
    return (
        <div style={{ 
            position: "relative", 
            width: "100%", 
            maxWidth: "100%",
            overflow: "hidden",
            aspectRatio: "1" // This assumes a square image, adjust if needed
        }}>
            <img 
                src={imageUrl} 
                alt="Chest X-Ray" 
                style={{ 
                    width: "100%", 
                    height: "100%",
                    objectFit: "contain",
                    display: "block" 
                }} 
            />
            {findings.map((f, i) => (f.localization || []).map((b, j) => (
                <div key={`${i}-${j}`} title={`${f.name} (${Math.round((f.confidence || 0) * 100)}%)`}
                    style={{
                        position: "absolute", left: `${b.x}%`, top: `${b.y}%`,
                        width: `${b.w}%`, height: `${b.h}%`,
                        border: "2px solid rgba(255,0,0,0.85)",
                        boxShadow: "0 0 8px rgba(255,0,0,0.6) inset",
                        borderRadius: 6, pointerEvents: "none"
                    }}
                />
            )))}
        </div>
    );
}
