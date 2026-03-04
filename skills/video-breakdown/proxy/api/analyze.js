/**
 * Video Breakdown Proxy — /api/analyze
 *
 * Dual-model video analysis endpoint:
 * - model=quick  → ByteDance Seed-2.0-Mini (fast, frame-based)
 * - model=full   → Google Gemini 2.5 Pro (deep, native video)
 *
 * Required env var: OPENROUTER_API_KEY
 */

import OpenAI from "openai";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

const MODELS = {
  quick: "bytedance-seed/seed-2.0-mini",
  full: "google/gemini-2.5-pro",
};

const PROMPTS = {
  quality_critique: `You are a professional video director and cinematographer. Analyze the technical and artistic quality of this video.

Provide a rigorous critique with a score from 1 to 10 for each of the following dimensions:
1. resolution: Resolution & Sharpness
2. lighting: Lighting & Color Grading
3. audio: Audio Quality
4. stability: Camera Stability & Movement
5. composition: Composition & Framing
6. pacing: Pacing & Editing Rhythm
7. overall: Holistic Assessment

Format the output as a JSON object. Each key should contain "score" (integer 1-10) and "comment" (2-3 sentences).
Also include a top-level "summary" key with a 2-sentence overall verdict.
Return ONLY the JSON object, no markdown fences.`,

  shot_breakdown: `You are a professional film analyst specializing in shot-by-shot deconstruction (拉片).

Perform a meticulous shot-by-shot analysis of this video. For EVERY distinct shot, provide:
1. shot_number: Sequential integer starting from 1.
2. start_time: Precise timestamp in MM:SS format.
3. end_time: Precise timestamp in MM:SS format.
4. duration_seconds: Duration in seconds (integer).
5. shot_type: One of [Extreme Wide Shot, Wide Shot, Medium Wide Shot, Medium Shot, Medium Close-Up, Close-Up, Extreme Close-Up, Insert, POV, Over-the-Shoulder].
6. camera_movement: One of [Static, Pan Left, Pan Right, Tilt Up, Tilt Down, Zoom In, Zoom Out, Dolly In, Dolly Out, Tracking Shot, Handheld, Crane/Jib].
7. subject: Primary subject of this shot.
8. action: What is happening.
9. narrative_function: Narrative or emotional purpose.
10. audio_notes: Significant audio elements.

Format the output as a JSON array of shot objects.
Return ONLY the JSON array, no markdown fences.`,

  content_strategy: `You are a senior social media strategist and content analyst.

Analyze this video from a content strategy perspective and return a JSON object with:
1. hook_analysis: object with "score" (1-10) and "comment" evaluating the first 3 seconds.
2. retention_moments: array of objects with "timestamp" and "event".
3. key_messages: array of 3 strings.
4. target_audience: string.
5. platform_fit: object with TikTok, YouTube, Instagram, LinkedIn as keys, each with "score" (1-10) and "reason".
6. improvement_suggestions: array of 3 actionable strings.
7. viral_potential: object with "score" (1-10) and "comment".

Return ONLY the JSON object, no markdown fences.`,
};

function parseJsonFromText(text) {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match) return JSON.parse(match[1]);
  return JSON.parse(text);
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OPENROUTER_API_KEY is not configured." });
  }

  const { video_url, analysis_type, model = "full" } = req.body || {};

  if (!video_url) {
    return res.status(400).json({ error: "video_url is required." });
  }
  if (!PROMPTS[analysis_type]) {
    return res.status(400).json({
      error: `Invalid analysis_type. Available: ${Object.keys(PROMPTS).join(", ")}`,
    });
  }
  if (!MODELS[model]) {
    return res.status(400).json({
      error: `Invalid model. Available: ${Object.keys(MODELS).join(", ")}`,
    });
  }

  const modelName = MODELS[model];
  const prompt = PROMPTS[analysis_type];

  const client = new OpenAI({
    baseURL: OPENROUTER_BASE_URL,
    apiKey,
    defaultHeaders: {
      "HTTP-Referer": "https://clawhub.ai",
      "X-Title": "Video Breakdown Skill",
    },
  });

  try {
    let content;

    if (model === "quick") {
      // Seed-2.0-Mini: Image-based analysis (send video URL as image for frame extraction)
      // Note: Seed-2.0-Mini uses image_url for visual input
      content = [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: video_url } },
      ];
    } else {
      // Gemini 2.5 Pro: Native video URL analysis via OpenRouter
      content = [
        { type: "text", text: prompt },
        { type: "video_url", video_url: { url: video_url } },
      ];
    }

    const completion = await client.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content }],
      temperature: 0.2,
      max_tokens: 8192,
    });

    const rawText = completion.choices[0]?.message?.content?.trim();
    if (!rawText) {
      throw new Error("Model returned empty response.");
    }

    let parsedResult;
    try {
      parsedResult = parseJsonFromText(rawText);
    } catch {
      // If JSON parsing fails, return raw text
      parsedResult = { raw: rawText };
    }

    return res.status(200).json({
      model_used: modelName,
      analysis_type,
      result: parsedResult,
    });
  } catch (err) {
    console.error("Analysis error:", err);
    return res.status(500).json({
      error: err.message || "Internal server error",
      model_used: modelName,
    });
  }
}
