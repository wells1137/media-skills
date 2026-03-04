/**
 * Video Breakdown Proxy — /api/health
 * Health check and service info endpoint.
 */

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  return res.status(200).json({
    service: "Video Breakdown Proxy",
    version: "2.0.0",
    status: "ok",
    models: {
      quick: "bytedance-seed/seed-2.0-mini",
      full: "google/gemini-2.5-pro",
    },
    analysis_types: ["quality_critique", "shot_breakdown", "content_strategy"],
    powered_by: "OpenRouter",
  });
}
