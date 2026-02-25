# AudioMind Proxy

A lightweight Vercel serverless proxy that powers the **AudioMind** ClawHub skill. Users of the skill get 100 free audio generations without needing any API key. After the free trial, they can upgrade to Pro.

## Architecture

```
User's Agent
    ↓ (no API key needed)
audiomind skill (local)
    ↓ HTTP POST
AudioMind Proxy (this Vercel project)
    ↓ (uses your ElevenLabs key, stored securely in Vercel env)
ElevenLabs API
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/tts` | Audio generation (TTS, SFX, Music) |

## Request Format

```json
{
  "action": "tts",        // "tts" | "sfx" | "music"
  "text": "Hello world",  // for tts/sfx
  "prompt": "...",        // for music
  "voice_id": "...",      // optional, for tts
  "duration_seconds": 10  // optional, for sfx/music
}
```

Add header `X-Audiomind-Key: AM_PRO_xxxxx` for Pro users (unlimited usage).

## Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. Set environment variable: `ELEVENLABS_API_KEY=your_key_here`
3. Deploy: `vercel --prod`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ELEVENLABS_API_KEY` | Your ElevenLabs API key (kept secret on server) |

## Free Trial Logic

- Each user gets **100 free generations** (tracked by IP address)
- After 100 uses, the API returns a `402` error with an upgrade link
- Pro users bypass the limit by sending `X-Audiomind-Key` header
