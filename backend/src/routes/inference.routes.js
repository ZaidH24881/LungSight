import express from "express";
import axios from "axios";

const router = express.Router();

const hoppr = axios.create({
  baseURL: process.env.HOPPR_BASE,
  headers: {
    Authorization: `Bearer ${process.env.HOPPR_API_KEY}`,
    "Content-Type": "application/json"
  },
  timeout: 20000
});

router.get("/models", (_, res) => {
  res.json({
    vlm: "cxr-vlm-experimental",
    exampleClassifiers: [
      "mc_chestradiography_pneumothorax:v1.20250828",
      "mc_chestradiography_pleural_effusion:v1.20250828",
      "mc_chestradiography_cardiomegaly:v1.20250828"
    ]
  });
});

router.post("/classify", async (req, res) => {
  try {
    const {
      studyId,
      models = [
        "mc_chestradiography_pneumothorax:v1.20250828",
        "mc_chestradiography_pleural_effusion:v1.20250828"
      ],
      threshold = Number(process.env.THRESHOLD ?? 0.5)
    } = req.body;

    if (!studyId) return res.status(400).json({ error: "studyId required" });

    const calls = models.map(model =>
      hoppr.post(`/studies/${studyId}/inference`, {
        model,
        prompt: "prompt is ignored for classification",
        organization: "hoppr",
        response_format: "json"
      }).then(r => ({ modelId: r.data.model_id, score: r.data.score }))
    );

    const results = await Promise.all(calls);
    res.json({
      studyId,
      threshold,
      results: results.map(r => ({ ...r, positive: r.score >= threshold }))
    });
  } catch (err) {
    res.status(502).json({ error: "HOPPR classify failed", details: err?.response?.data ?? err.message });
  }
});

router.post("/vlm", async (req, res) => {
  try {
    const { studyId, prompt = "Provide a description of the findings in the radiology image." } = req.body;
    if (!studyId) return res.status(400).json({ error: "studyId required" });

    const { data } = await hoppr.post(`/studies/${studyId}/inference`, {
      model: "cxr-vlm-experimental",
      prompt,
      response_format: "json"
    });

    res.json({ studyId, findings: data?.response?.findings ?? "" });
  } catch (err) {
    res.status(502).json({ error: "HOPPR VLM failed", details: err?.response?.data ?? err.message });
  }
});

export default router;
