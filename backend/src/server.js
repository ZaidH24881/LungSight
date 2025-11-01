import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import inferenceRoutes from "./routes/inference.routes.js";

dotenv.config();
const app = express();

// Middleware
app.use(morgan("dev"));
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

// Health
app.get("/health", (_, res) => res.json({ ok: true, ts: Date.now() }));

// API routes
app.use("/api", inferenceRoutes);

// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
