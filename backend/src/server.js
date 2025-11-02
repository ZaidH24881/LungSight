// server.js
// Mock-only backend for Hackathon X-Ray (no external APIs), HOPPR-like payloads.

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ---- Static serving ----
function firstExistingDir(candidates) {
  for (const p of candidates) {
    try { if (fs.existsSync(p)) return p; } catch {}
  }
  return candidates[0];
}
const STATIC_DIR = firstExistingDir([
  path.join(__dirname, "public"),
  path.join(process.cwd(), "public"),
  path.join(__dirname, "../public"),
]);
app.use("/static", cors(), express.static(STATIC_DIR));

// ---- Uploads in memory ----
const upload = multer({ storage: multer.memoryStorage() });

// ---- Filename → studyId mapping ----
const knownFilesToStudy = {
  "07d82e7e5749cbc21633134f489a7fbf.dcm": "study_calc_01",
  "c341b3f8a0353bab2ec49147b97ce9d0.dcm": "study_calc_02",
  "17dc4a83558d835efd5f7d6f110f07f3.dcm": "study_calc_03",
  "de7c0acddd7ed5fb90f5f5e12458235b.dcm": "study_cons_01",
  "23f29ee2101fa421afeb84cf923ee9b6.dcm": "study_ild_01",
};
const STUDY_IDS = Object.values(knownFilesToStudy);

// ---- Base mock scores (we’ll enrich to HOPPR-like on the fly) ----
const BASE = {
  study_calc_01: {
    vlmFindings:
      "Suspected vascular/valvular calcifications along the aortic knob; no focal consolidation; cardiac silhouette within normal range.",
    models: [
      "mc_chestradiography_cardiomegaly:v1.20250828|0.18",
      "mc_chestradiography_calcification:v1.20250828|0.87",
      "mc_chestradiography_consolidation:v1.20250828|0.11",
      "mc_chestradiography_pleural_effusion:v1.20250828|0.09",
    ],
    meta: { modality: "CR", view: "PA" },
  },
  study_calc_02: {
    vlmFindings:
      "Patchy arterial calcifications projected over the mediastinum; no acute airspace disease identified.",
    models: [
      "mc_chestradiography_cardiomegaly:v1.20250828|0.22",
      "mc_chestradiography_calcification:v1.20250828|0.78",
      "mc_chestradiography_consolidation:v1.20250828|0.08",
      "mc_chestradiography_pneumothorax:v1.20250828|0.04",
    ],
    meta: { modality: "CR", view: "AP" },
  },
  study_calc_03: {
    vlmFindings:
      "Atherosclerotic calcifications are suggested; lungs are clear; no edema pattern.",
    models: [
      "mc_chestradiography_cardiomegaly:v1.20250828|0.25",
      "mc_chestradiography_calcification:v1.20250828|0.74",
      "mc_chestradiography_emphysema:v1.20250828|0.10",
      "mc_chestradiography_edema:v1.20250828|0.07",
    ],
    meta: { modality: "CR", view: "PA" },
  },
  study_cons_01: {
    vlmFindings:
      "Focal airspace consolidation in the right lower zone; consider infectious/inflammatory etiology. No large effusion.",
    models: [
      "mc_chestradiography_consolidation:v1.20250828|0.83",
      "mc_chestradiography_atelectasis:v1.20250828|0.31",
      "mc_chestradiography_pleural_effusion:v1.20250828|0.18",
      "mc_chestradiography_calcification:v1.20250828|0.05",
    ],
    meta: { modality: "CR", view: "PA" },
  },
  study_ild_01: {
    vlmFindings:
      "Basilar-predominant reticular opacities with subtle volume loss; pattern compatible with interstitial lung disease.",
    models: [
      "mc_chestradiography_interstitial_patterns:v1.20250828|0.81",
      "mc_chestradiography_fibrosis:v1.20250828|0.66",
      "mc_chestradiography_consolidation:v1.20250828|0.12",
      "mc_chestradiography_cardiomegaly:v1.20250828|0.20",
    ],
    meta: { modality: "CR", view: "PA" },
  },
};

// ---- Helpers ----
function pickStudyIdFromUnknown(buf) {
  const h = crypto.createHash("md5").update(buf).digest("hex");
  const all = Object.keys(BASE);
  return all[parseInt(h.slice(0, 8), 16) % all.length];
}
function resolveStudyIdByNameOrHash(file) {
  const base = path.basename((file?.originalname || "").toLowerCase());
  return knownFilesToStudy[base] || pickStudyIdFromUnknown(file.buffer || Buffer.alloc(0));
}
function previewUrl(req, studyId) {
  return `${req.protocol}://${req.get("host")}/static/studies/${studyId}.png`;
}
function heatmapUrl(req, studyId, label) {
  // optional file: public/heatmaps/<studyId>/<label>.png
  const p = path.join(STATIC_DIR, "heatmaps", studyId, `${label}.png`);
  return fs.existsSync(p)
    ? `${req.protocol}://${req.get("host")}/static/heatmaps/${studyId}/${label}.png`
    : null;
}
function parseModelId(id) {
  // "mc_chestradiography_consolidation:v1.20250828"
  const [left, version = "v1"] = id.split(":");
  let label = left;
  const marker = "_chestradiography_";
  if (left.includes(marker)) label = left.split(marker)[1];
  return { label, version };
}
function toHopprPayload(req, studyId, fileName) {
  const base = BASE[studyId];
  const uploadedAt = new Date().toISOString();

  const hopprModels = base.models.map((pair) => {
    const [id, scoreStr] = pair.split("|");
    const { label, version } = parseModelId(id);
    const score = Number(scoreStr || 0);
    const threshold = 0.5;
    const positive = score >= threshold;
    return {
      id,                 // full model id
      label,              // parsed condition label
      version,            // parsed version from id
      score,              // probability [0..1]
      threshold,          // default for demo
      positive,           // score >= threshold
      heatmap: {
        type: "png",
        url: heatmapUrl(req, studyId, label), // can be null if you didn't add a file
      },
    };
  });

  const payload = {
    // ===== HOPPR-like top-level fields =====
    studyId,
    meta: {
      fileName: fileName || null,
      uploadedAt,
      modality: base.meta.modality,
      view: base.meta.view,
      preview: {
        type: "png",
        url: previewUrl(req, studyId),
      },
    },
    models: hopprModels,
    vlm: {
      model: "cxr-vlm-experimental",
      version: "v0",
      findings: base.vlmFindings,
      grounding: [], // optional spans/regions (not used in mock)
    },

    // ===== Backwards-compatible extras for your current UI =====
    findings: base.vlmFindings,
    results: hopprModels.map((m) => ({
      label: m.label,
      score: m.score,
      modelId: m.id,
      model: m.id,
      threshold: m.threshold,
      positive: m.positive,
      heatmapUrl: m.heatmap.url,
    })),
    imageUrl: previewUrl(req, studyId),
  };

  return payload;
}

// ---- Routes ----
app.get("/health", (_req, res) => {
  res.json({ ok: true, mode: "mock", staticDir: STATIC_DIR, studies: Object.keys(BASE).length });
});

/** Upload → map filename → studyId, return HOPPR-like stub + UI extras */
app.post("/api/analyze-xray", upload.single("file"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded (field name must be 'file')." });
    const studyId = resolveStudyIdByNameOrHash(req.file);
    const payload = toHopprPayload(req, studyId, req.file.originalname);
    res.json({ studyId, id: studyId, fileName: req.file.originalname, imageUrl: payload.imageUrl });
  } catch (err) {
    console.error("analyze-xray error:", err);
    res.status(500).json({ error: "Internal error in mock analyze-xray." });
  }
});

/** Return full HOPPR-like payload (plus UI extras) */
app.get("/api/run-all", (req, res) => {
  try {
    const studyId = (req.query.studyId || req.query.id || "").toString();
    if (!studyId) return res.status(400).json({ error: "Missing 'studyId' query parameter." });
    if (!BASE[studyId]) return res.status(404).json({ error: `Unknown studyId '${studyId}'.` });
    const payload = toHopprPayload(req, studyId, null);
    res.json(payload);
  } catch (err) {
    console.error("run-all error:", err);
    res.status(500).json({ error: "Internal error in mock run-all." });
  }
});

// Debug (optional): check preview + heatmaps
app.get("/debug/study", (req, res) => {
  const studyId = (req.query.studyId || "").toString();
  const prev = path.join(STATIC_DIR, "studies", `${studyId}.png`);
  res.json({
    studyId,
    previewExists: fs.existsSync(prev),
    previewUrl: `${req.protocol}://${req.get("host")}/static/studies/${studyId}.png`,
  });
});

app.listen(PORT, () => {
  console.log(`Mock backend listening on http://localhost:${PORT}`);
  console.log(`[static] ${STATIC_DIR}`);
});
