export const config = { maxDuration: 60 };
const FREE_LIMIT = 100;

// In-memory usage store (keyed by IP)
const usageStore = {};

function getUsage(userId) { return usageStore[userId] || 0; }
function incrementUsage(userId) {
  const count = (usageStore[userId] || 0) + 1;
  usageStore[userId] = count;
  return count;
}
function isProUser(proKey) {
  return Boolean(proKey && proKey.startsWith("AM_PRO_"));
}

// ─────────────────────────────────────────────
// MODEL REGISTRY
// ─────────────────────────────────────────────
const MODEL_REGISTRY = {
  // TTS
  "elevenlabs-tts-v3":     { provider: "elevenlabs", type: "tts",         desc: "ElevenLabs Eleven v3 — most expressive, multilingual" },
  "elevenlabs-tts-v2":     { provider: "elevenlabs", type: "tts",         desc: "ElevenLabs Multilingual v2 — stable, 29 languages" },
  "elevenlabs-tts-turbo":  { provider: "elevenlabs", type: "tts",         desc: "ElevenLabs Turbo v2.5 — ultra-low latency, 32 languages" },
  "minimax-tts-hd":        { provider: "fal", type: "tts", falId: "fal-ai/minimax-music/speech-02-hd",    desc: "MiniMax Speech-02 HD — high quality, multilingual" },
  "minimax-tts-2.6-hd":    { provider: "fal", type: "tts", falId: "fal-ai/minimax-music/speech-2.6-hd",  desc: "MiniMax Speech-2.6 HD" },
  "minimax-tts-2.8-hd":    { provider: "fal", type: "tts", falId: "fal-ai/minimax-music/speech-2.8-hd",  desc: "MiniMax Speech-2.8 HD — latest MiniMax TTS" },
  "minimax-tts-2.8-turbo": { provider: "fal", type: "tts", falId: "fal-ai/minimax-music/speech-2.8-turbo", desc: "MiniMax Speech-2.8 Turbo — fast, low latency" },
  "chatterbox-tts":        { provider: "fal", type: "tts", falId: "fal-ai/chatterbox", desc: "Chatterbox (Resemble AI) — emotion-aware TTS" },
  "playai-dialog":         { provider: "fal", type: "tts", falId: "fal-ai/playai/tts/dialog",       desc: "PlayAI Dialog — multi-speaker dialogue generation" },
  // Voice Clone
  "dia-voice-clone":       { provider: "fal", type: "voice_clone", falId: "fal-ai/dia-tts", desc: "Dia TTS — clone any voice from audio sample" },
  // Music
  "elevenlabs-music":      { provider: "elevenlabs", type: "music",       desc: "ElevenLabs Music — composition-plan based music" },
  "beatoven-music":        { provider: "fal", type: "music", falId: "fal-ai/beatoven-ai/music-generation", desc: "Beatoven — royalty-free instrumental, 10+ genres" },
  "cassetteai-music":      { provider: "fal", type: "music", falId: "cassetteai/music-generator",   desc: "CassetteAI — fast music generation" },
  // SFX
  "elevenlabs-sfx":        { provider: "elevenlabs", type: "sfx",         desc: "ElevenLabs SFX — text-to-sound-effects" },
  "beatoven-sfx":          { provider: "fal", type: "sfx", falId: "fal-ai/beatoven-ai/sound-effect-generation", desc: "Beatoven SFX — professional sound effects" },
  "mirelo-video-to-audio": { provider: "fal", type: "sfx", falId: "fal-ai/mirelo/video-to-audio", desc: "Mirelo SFX — generate synced audio for video" },
  "mirelo-video-to-video": { provider: "fal", type: "sfx", falId: "fal-ai/mirelo/video-to-video", desc: "Mirelo SFX — add sound track to video" },
};

// ─────────────────────────────────────────────
// SMART ROUTER
// ─────────────────────────────────────────────
function smartRoute(payload) {
  if (payload.model && MODEL_REGISTRY[payload.model]) return payload.model;

  const action = (payload.action || "").toLowerCase();
  const text = (payload.text || payload.prompt || "").toLowerCase();

  if (action === "voice_clone" || payload.reference_audio_url) return "dia-voice-clone";
  if (action === "dialog" || (payload.speakers && payload.speakers.length > 1)) return "playai-dialog";
  if (action === "video_sfx" || payload.video_url) return "mirelo-video-to-audio";
  if (action === "music" || /\b(music|track|song|melody|beat|instrumental|bpm|chord|compose|jingle|soundtrack)\b/.test(text)) {
    return payload.fast ? "cassetteai-music" : "elevenlabs-music";
  }
  if (action === "sfx" || /\b(sound effect|sfx|noise|ambient|foley|explosion|rain|thunder|footstep|click|beep|whoosh)\b/.test(text)) {
    return "elevenlabs-sfx";
  }
  return "elevenlabs-tts-v3";
}

// ─────────────────────────────────────────────
// FAL.AI QUEUE HANDLER
// fal.ai uses async queue: submit → poll → result
// ─────────────────────────────────────────────
async function callFalQueue(falId, falPayload, falKey) {
  const headers = {
    "Authorization": `Key ${falKey}`,
    "Content-Type": "application/json"
  };

  // 1. Submit to queue
  const submitRes = await fetch(`https://queue.fal.run/${falId}`, {
    method: "POST",
    headers,
    body: JSON.stringify(falPayload)
  });

  if (!submitRes.ok) {
    const err = await submitRes.text();
    return { error: `fal.ai submit failed: ${err}`, status: submitRes.status };
  }

  const { request_id, status_url } = await submitRes.json();
  if (!request_id) return { error: "No request_id from fal.ai" };

  // 2. Poll for result (max 60s)
  const pollUrl = status_url || `https://queue.fal.run/${falId}/requests/${request_id}/status`;
  const resultUrl = `https://queue.fal.run/${falId}/requests/${request_id}`;

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const statusRes = await fetch(pollUrl, { headers });
    if (!statusRes.ok) continue;
    const statusData = await statusRes.json();
    if (statusData.status === "COMPLETED") {
      // 3. Fetch result
      const resultRes = await fetch(resultUrl, { headers });
      const result = await resultRes.json();
      const audioUrl = result.audio?.url || result.audio_url || result.url ||
                       result.audio_file?.url || result.output?.audio_url;
      return { audio_url: audioUrl, raw: result };
    }
    if (statusData.status === "FAILED") {
      return { error: "fal.ai generation failed", detail: statusData };
    }
  }
  return { error: "fal.ai timeout: generation took too long" };
}

// ─────────────────────────────────────────────
// FAL.AI PAYLOAD BUILDER
// ─────────────────────────────────────────────
function buildFalPayload(modelKey, payload) {
  const model = MODEL_REGISTRY[modelKey];
  if (model.type === "tts") {
    const p = { text: payload.text || "" };
    if (payload.voice_id) p.voice_id = payload.voice_id;
    if (payload.language) p.language = payload.language;
    if (payload.speed) p.speed = payload.speed;
    return p;
  }
  if (model.type === "music") {
    const p = { prompt: payload.prompt || payload.text || "" };
    if (payload.duration_seconds) p.duration = payload.duration_seconds;
    if (payload.genre) p.genre = payload.genre;
    if (payload.mood) p.mood = payload.mood;
    return p;
  }
  if (model.type === "sfx") {
    if (modelKey === "mirelo-video-to-audio" || modelKey === "mirelo-video-to-video") {
      return { video_url: payload.video_url || "" };
    }
    const p = { prompt: payload.text || payload.prompt || "" };
    if (payload.duration_seconds) p.duration = payload.duration_seconds;
    return p;
  }
  if (model.type === "voice_clone") {
    return { text: payload.text || "", reference_audio_url: payload.reference_audio_url || "" };
  }
  return payload;
}

// ─────────────────────────────────────────────
// ELEVENLABS HANDLER
// ─────────────────────────────────────────────
async function callElevenLabs(modelKey, payload, apiKey) {
  const headers = { "xi-api-key": apiKey, "Content-Type": "application/json" };

  if (modelKey.startsWith("elevenlabs-tts")) {
    const voiceId = payload.voice_id || "JBFqnCBsd6RMkjVDRZzb";
    const modelMap = {
      "elevenlabs-tts-v3": "eleven_v3",
      "elevenlabs-tts-v2": "eleven_multilingual_v2",
      "elevenlabs-tts-turbo": "eleven_turbo_v2_5"
    };
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { ...headers, "Accept": "audio/mpeg" },
      body: JSON.stringify({
        text: payload.text || "",
        model_id: modelMap[modelKey] || "eleven_v3",
        voice_settings: payload.voice_settings || { stability: 0.5, similarity_boost: 0.75 }
      })
    });
    if (!res.ok) return { error: await res.text(), status: res.status };
    const buf = await res.arrayBuffer();
    return { audio_base64: Buffer.from(buf).toString("base64"), format: "mp3" };
  }

  if (modelKey === "elevenlabs-sfx") {
    const url = "https://api.elevenlabs.io/v1/sound-generation";
    const res = await fetch(url, {
      method: "POST",
      headers: { ...headers, "Accept": "audio/mpeg" },
      body: JSON.stringify({
        text: payload.text || payload.prompt || "",
        duration_seconds: payload.duration_seconds || null,
        prompt_influence: 0.3
      })
    });
    if (!res.ok) return { error: await res.text(), status: res.status };
    const buf = await res.arrayBuffer();
    return { audio_base64: Buffer.from(buf).toString("base64"), format: "mp3" };
  }

  if (modelKey === "elevenlabs-music") {
    // ElevenLabs Music uses the /v1/text-to-sound-effects endpoint with longer timeout
    const url = "https://api.elevenlabs.io/v1/sound-generation";
    const res = await fetch(url, {
      method: "POST",
      headers: { ...headers, "Accept": "audio/mpeg" },
      body: JSON.stringify({
        text: payload.prompt || payload.text || "",
        duration_seconds: payload.duration_seconds || 15,
        prompt_influence: 0.5
      })
    });
    if (!res.ok) return { error: await res.text(), status: res.status };
    const buf = await res.arrayBuffer();
    return { audio_base64: Buffer.from(buf).toString("base64"), format: "mp3" };
  }

  return { error: `Unknown ElevenLabs model: ${modelKey}` };
}

// ─────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Audiomind-Key");

  if (req.method === "OPTIONS") return res.status(200).end();

  // GET → model registry
  if (req.method === "GET") {
    return res.status(200).json({
      service: "AudioMind Proxy",
      version: "2.0.0",
      free_limit: FREE_LIMIT,
      models: Object.entries(MODEL_REGISTRY).map(([id, m]) => ({
        id, type: m.type, provider: m.provider, description: m.desc
      }))
    });
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const payload = req.body;
  if (!payload) return res.status(400).json({ error: "Invalid JSON body" });

  const proKey = req.headers["x-audiomind-key"] || "";
  const userIp = (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown")
    .split(",")[0].trim();

  // Free trial check
  if (!isProUser(proKey)) {
    const usage = getUsage(userIp);
    if (usage >= FREE_LIMIT) {
      return res.status(402).json({
        error: "free_trial_exhausted",
        message: `You have used all ${FREE_LIMIT} free AudioMind generations. Upgrade to Pro at https://audiomind.gumroad.com`,
        used: usage, limit: FREE_LIMIT
      });
    }
  }

  const modelKey = smartRoute(payload);
  const model = MODEL_REGISTRY[modelKey];

  let result;
  try {
    if (model.provider === "elevenlabs") {
      const apiKey = process.env.ELEVENLABS_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "ElevenLabs API key not configured" });
      result = await callElevenLabs(modelKey, payload, apiKey);
    } else {
      const falKey = process.env.FAL_KEY;
      if (!falKey) return res.status(500).json({ error: "fal.ai API key not configured" });
      const falPayload = buildFalPayload(modelKey, payload);
      const falResult = await callFalQueue(model.falId, falPayload, falKey);
      result = { ...falResult, model_used: modelKey, format: "mp3" };
    }
  } catch (err) {
    return res.status(502).json({ error: "Audio service error", detail: err.message });
  }

  if (result.error) return res.status(result.status || 500).json(result);

  // Track usage
  if (!isProUser(proKey)) {
    const newCount = incrementUsage(userIp);
    const remaining = FREE_LIMIT - newCount;
    result._remaining_uses = remaining;
    result._plan = "free";
    if (remaining <= 10) {
      result._warning = `⚠️ Only ${remaining} free uses remaining. Upgrade to Pro at https://audiomind.gumroad.com`;
    }
  } else {
    result._plan = "pro";
  }

  result.model_used = modelKey;
  return res.status(200).json(result);
}
