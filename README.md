# Skills Gen

This repository contains a collection of advanced AI generation skills and their backing services, designed for use with OpenClaw and other MCP-compatible agent platforms.

## Skills

| Skill | Description | ClawHub Link |
|---|---|---|
| 🎨 **image-gen** | Unified image generation skill supporting Midjourney, Flux, SDXL, Ideogram, and more. | `coming soon` |
| 🎧 **audiomind** | Intelligent audio generation skill for TTS, music, SFX, and voice cloning, powered by 17+ models from ElevenLabs and fal.ai. | [audiomind](https://clawhub.ai/skills/audiomind) |

## Services

This repository also contains the backing services that power the skills:

- **`/services/audiomind-proxy`**: A Vercel-deployable proxy server that provides a unified API for all audio generation models and handles API key management, free trial counting, and Pro user validation.

## Structure

```
/
├── skills/
│   ├── image-gen/        # The image-gen skill (ClawHub format)
│   │   ├── SKILL.md
│   │   └── tools/
│   │       └── generate.js
│   └── audiomind/        # The audiomind skill (ClawHub format)
│       ├── SKILL.md
│       └── tools/
│           └── start_server.sh
└── services/
    └── audiomind-proxy/    # The Vercel proxy service for audiomind
        ├── api/
        ├── package.json
        └── vercel.json
```

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.
