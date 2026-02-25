export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    service: "AudioMind Proxy",
    version: "1.0.0",
    endpoints: {
      "POST /api/audio": "Audio generation (action: tts | sfx | music)"
    }
  });
}
