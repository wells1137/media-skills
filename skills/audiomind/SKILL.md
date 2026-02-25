---
name: AudioMind
version: 2.1.0
author: "@wells1137"
emoji: "🧠"
tags:
  - audio
  - tts
  - music
  - sfx
  - voice-clone
  - elevenlabs
  - fal
description: >
  The ultimate AI audio generation skill. Intelligently routes requests to 17+ models from ElevenLabs and fal.ai for TTS, music, SFX, and voice cloning. Now with async support for long-running tasks.
---

## Description

**AudioMind** is a comprehensive, zero-configuration audio generation skill that acts as a smart dispatcher for all your audio needs. It intelligently routes your natural language requests to a vast library of over 17 specialized audio models from leading providers like **ElevenLabs** and **fal.ai**.

This version introduces an **asynchronous workflow** for long-running tasks like music generation, ensuring a smooth user experience without timeouts.

## How It Works (v2.1.0 with Async)

1.  **Request**: The user makes a request (e.g., "*Compose a 2-minute cinematic score*").
2.  **Smart Routing**: AudioMind analyzes the request and selects the best model.
3.  **Proxy Call**: The skill sends a request to the AudioMind Proxy Service.
4.  **Immediate Response**: 
    - For **fast tasks** (most TTS), the audio is returned directly.
    - For **long tasks** (music, some SFX), the proxy immediately returns a `task_id` and a `status_url`.
5.  **Polling**: The agent (or user) periodically checks the `status_url`.
6.  **Result**: Once the task is complete, the `status_url` will contain the final `audio_url`.

## Usage

**Synchronous (for TTS & fast SFX)**

```
"Narrate this: Hello, world!"
> Returns audio file directly.
```

**Asynchronous (for Music & long SFX)**

```
"Compose a 90-second lo-fi track."
> Returns: {"status": "in_progress", "task_id": "...", "status_url": "..."}

# Agent should then poll the status_url until status is "completed"
```

## Model Registry (v2.1.0)

| Type          | Model ID                    | Provider   | Status         | Notes                                      |
| :------------ | :-------------------------- | :--------- | :------------- | :----------------------------------------- |
| **TTS**       | `elevenlabs-tts-v3`         | ElevenLabs | ✅ **Stable**    | High quality, fast                         |
|               | `elevenlabs-tts-v2`         | ElevenLabs | ✅ **Stable**    |                                            |
|               | `elevenlabs-tts-turbo`      | ElevenLabs | ✅ **Stable**    | Ultra-low latency                          |
|               | `minimax-tts-2.8-turbo`     | fal.ai     | ✅ **Stable**    | Fast, good quality                         |
|               | `chatterbox-tts`            | fal.ai     | ⚠️ **Unstable**  | Often exceeds 60s timeout                  |
|               | `minimax-tts-hd`            | fal.ai     | ❌ **Offline**   | fal.ai API returns 502 error               |
|               | `minimax-tts-2.6-hd`        | fal.ai     | ❌ **Offline**   | fal.ai API returns 502 error               |
|               | `playai-dialog`             | fal.ai     | ⚠️ **Unstable**  | Often exceeds 60s timeout                  |
| **Voice Clone** | `dia-voice-clone`           | fal.ai     | ⚠️ **Unstable**  | Often exceeds 60s timeout                  |
| **Music**     | `elevenlabs-music`          | ElevenLabs | ⚠️ **Unstable**  | Requires Vercel Pro (exceeds 60s)          |
|               | `cassetteai-music`          | fal.ai     | ✅ **Stable**    | Fast, reliable                             |
|               | `beatoven-music`            | fal.ai     | ⚠️ **Unstable**  | Requires Vercel Pro (exceeds 60s)          |
| **SFX**       | `elevenlabs-sfx`            | ElevenLabs | ⚠️ **Unstable**  | Hit-or-miss on timeouts                    |
|               | `beatoven-sfx`              | fal.ai     | ⚠️ **Unstable**  | Requires Vercel Pro (exceeds 60s)          |

---

## Commercial Use

This skill includes a free tier of **100 generations** (stable models only). For unlimited use and access to all models, please upgrade to AudioMind Pro by visiting our Gumroad page (link will be provided when the free limit is reached).
