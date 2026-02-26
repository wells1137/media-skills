# OpenClaw 不回复 — 排查清单

当 OpenClaw 在聊天里不回复消息时，按下面顺序自查。

## 0. 报错「No API key found for provider "google"」

若日志里出现：`All models failed ... No API key found for provider "google"`，说明 **Gemini 未配置 API key**。

**处理步骤：**

1. 打开 [Google AI Studio](https://aistudio.google.com/) → 创建或复制一个 API key。
2. 编辑 `~/.openclaw/.env`，在文件里加上或改成（把 `你的key` 换成真实 key）：
   ```bash
   GOOGLE_API_KEY=你的key
   ```
3. 重启 Gateway 让配置生效：
   ```bash
   openclaw gateway restart
   ```
4. 检查是否已识别：
   ```bash
   openclaw models status
   ```
   若仍显示 "Missing auth: google"，确认 `.env` 里 `GOOGLE_API_KEY=` 后面没有多余空格或引号，且已保存后再次执行 `openclaw gateway restart`。

## 1. 确认进程与网关

```bash
# 看 OpenClaw 是否在跑
openclaw status

# 若显示未运行或异常，重启网关
openclaw gateway restart
```

等几秒后再发一条消息试一次。

## 2. 看日志里有没有报错

```bash
# 最近日志（看有没有 crash / error）
openclaw logs | tail -80

# 和 MCP/技能相关的错误
openclaw logs | grep -i "error\|failed\|MCP"
```

若有明显报错（例如某个 MCP 连不上、技能执行失败），先按报错信息修（例如关掉有问题的 MCP 或检查配置）。

## 3. 检查配置

```bash
# 确认 openclaw.json 合法
cat ~/.openclaw/openclaw.json | jq .

# 若装了 MCP 插件，看其配置
cat ~/.openclaw/openclaw.json | jq '.plugins.entries["mcp-integration"]'
```

改过配置后执行一次：`openclaw gateway restart`。

## 4. 技能/工具是否卡住

若 OpenClaw 只有在「执行某类操作」（例如发图、发语音、调用某个 MCP）时不回复，多半是**该次工具调用卡住或超时**：

- **image-gen**：生图或 poll 时间过长，可先试简单文案对话，确认不调生图时是否正常回复。
- **audiomind**：确认本机或代理服务可达；若代理超时，也会导致整轮不回复。
- **MCP**：某个 MCP 服务器挂了或响应很慢，会导致调用该 MCP 时不回复。可在配置里暂时关掉该 MCP 或重启对应服务后再试。

## 5. 仍不回复时

- 完全退出 OpenClaw 客户端后再打开，或换一个聊天会话试一次。
- 确认本机网络正常（能访问你配置的 LLM/API）。
- 若你用的是云端或团队部署，联系管理员看服务端日志和状态。

---

**常用命令小结**

| 目的           | 命令 |
|----------------|------|
| 看状态         | `openclaw status` |
| 重启网关       | `openclaw gateway restart` |
| 看最近日志     | `openclaw logs \| tail -80` |
| 看 MCP 相关日志 | `openclaw logs \| grep MCP` |
