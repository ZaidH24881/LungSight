import { useState } from "react";
export default function ChatPanel({ context }) {
    const [messages, setMessages] = useState([]);
    const [q, setQ] = useState("");
    async function send() {
        if (!q.trim()) return;
        setMessages(m => [...m, { role: "user", content: q }]);
        setQ("");
        // TODO: call backend /chat with { question:q, context }
        setMessages(m => [...m, { role: "assistant", content: "AI answer placeholder (wired later)." }]);
    }
    return (
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Ask AI about this study</h3>
            <div style={{ maxHeight: 180, overflowY: "auto", marginBottom: 8, border: "1px solid #f2f2f2", padding: 8, borderRadius: 8 }}>
                {messages.map((m, i) => <div key={i}><strong>{m.role === "user" ? "You" : "AI"}:</strong> {m.content}</div>)}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g., Why is pneumothorax flagged?" style={{ flex: 1 }} />
                <button onClick={send}>Send</button>
            </div>
        </div>
    );
}
