#!/usr/bin/env node
/**
 * Local dev server for AudioMind Proxy — debug /api/audio and /api/health without Vercel.
 *
 * Usage:
 *   cd services/audiomind-proxy
 *   cp .env.example .env   # then set ELEVENLABS_API_KEY, FAL_KEY
 *   node --env-file=.env scripts/dev-server.js
 *
 * Or: export ELEVENLABS_API_KEY=... FAL_KEY=... && node scripts/dev-server.js
 *
 * Then:
 *   curl http://localhost:3123/api/health
 *   curl -X POST http://localhost:3123/api/audio -H "Content-Type: application/json" -d '{"text":"Hello"}'
 */

import http from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3123;

// Load .env manually if present (Node 20.6+ can use --env-file instead)
try {
  const envPath = join(__dirname, "..", ".env");
  const { readFileSync } = await import("node:fs");
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
} catch (_) {}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      try {
        resolve(raw ? JSON.parse(raw) : null);
      } catch {
        resolve(null);
      }
    });
    req.on("error", reject);
  });
}

function createRes(res) {
  const headers = {};
  return {
    setHeader(name, value) {
      headers[name] = value;
    },
    getHeader: (name) => headers[name],
    status(code) {
      res.statusCode = code;
      return {
        end: () => res.end(),
        json: (body) => {
          res.setHeader("Content-Type", "application/json");
          Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
          res.end(JSON.stringify(body));
        },
      };
    },
    end: () => res.end(),
    json: (body) => {
      res.statusCode = res.statusCode || 200;
      res.setHeader("Content-Type", "application/json");
      Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
      res.end(JSON.stringify(body));
    },
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${PORT}`);
  const path = url.pathname;

  const reqMock = {
    method: req.method,
    url: req.url,
    headers: req.headers,
    socket: { remoteAddress: req.socket.remoteAddress || "127.0.0.1" },
    body: null,
  };

  if (req.method === "POST" && (req.headers["content-type"] || "").includes("application/json")) {
    reqMock.body = await readBody(req);
  }

  const resMock = createRes(res);

  try {
    if (path === "/api/health") {
      const { default: health } = await import("../api/health.js");
      health(reqMock, resMock);
      return;
    }
    if (path === "/api/audio") {
      const { default: audio } = await import("../api/audio.js");
      await audio(reqMock, resMock);
      return;
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found", path }));
  } catch (err) {
    console.error(err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Server error", detail: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`AudioMind Proxy (debug) http://localhost:${PORT}`);
  console.log("  GET  /api/health  — health check");
  console.log("  GET  /api/audio  — model registry");
  console.log("  POST /api/audio  — generate (body: { text, action?, model?, ... })");
  if (!process.env.ELEVENLABS_API_KEY) console.warn("  ELEVENLABS_API_KEY not set (required for ElevenLabs models)");
  if (!process.env.FAL_KEY) console.warn("  FAL_KEY not set (required for fal.ai models)");
});
