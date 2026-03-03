# 🎬 skills-gen

A collection of open-source **Agent Skills** for AI-powered video production, image generation, audio production, and more.

> Compatible with [Claude Code](https://code.claude.com/docs/en/skills), [Codex](https://developers.openai.com), [Gemini CLI](https://geminicli.com), [Antigravity](https://antigravity.google), [Kiro](https://kiro.dev), and other agents supporting the [Agent Skills](https://agentskills.io) standard.

## Skills

| Skill | Description | Category |
|-------|-------------|----------|
| [audiomind](skills/audiomind/) | AI audio production studio — scripting, voice-overs, music, and final mixing | 🎵 Audio |
| [image-gen](skills/image-gen/) | Unified image generation — Midjourney, Flux, SDXL, Nano Banana, Ideogram, Recraft | 🎨 Image |
| [overlay-skill](skills/overlay-skill/) | Add professional packaging to videos — intros, outros, subtitles, transitions, watermarks | 🎬 Video |
| [seedance-prompt-designer](skills/seedance-prompt-designer/) | Smart prompt generation for Seedance 2.0 multimodal video generation | 🎬 Video |
| [transition-design](skills/transition-design/) | Analyze boundary frames between clips and design optimal transition effects | 🎬 Video |
| [mcp-hass](skills/mcp-hass/) | Home Assistant MCP integration | 🔧 Integration |
| [openclaw-mcp-plugin](skills/openclaw-mcp-plugin/) | OpenClaw MCP plugin for skill discovery and management | 🔧 Integration |
| [playwright-mcp](skills/playwright-mcp/) | Playwright browser automation via MCP | 🔧 Integration |

## Quick Start

### Using with Claude Code
```bash
# Clone and add to your project
git clone https://github.com/wells1137/skills-gen.git
cp -r skills-gen/skills/transition-design .claude/skills/
```

### Using with skills.sh
```bash
npx skills add wells1137/skills-gen/skills/transition-design
```

### Using with OpenClaw / ClawHub
```bash
clawhub install wells1137/skills-gen
```

## Skill Format

Each skill follows the [Agent Skills Specification](https://agentskills.io/specification):

```
skill-name/
├── SKILL.md              # Required: Instructions and metadata
├── references/           # Optional: Knowledge base files
├── scripts/              # Optional: Executable scripts
└── assets/               # Optional: Static resources
```

## Contributing

Contributions are welcome! To add a new skill:

1. Create a directory under `skills/` with your skill name
2. Add a `SKILL.md` with proper YAML frontmatter (`name` and `description`)
3. Include any reference files, scripts, or assets
4. Submit a pull request

## License

MIT
