# Connect OpenClaw to Telegram

Your `~/.openclaw/openclaw.json` already has Telegram enabled. Follow these steps to chat with OpenClaw in Telegram.

---

## 1. Ensure the gateway is running

```bash
openclaw status
# If not running or unhealthy:
openclaw gateway restart
```

Wait a few seconds, then continue.

---

## 2. Open your bot in Telegram

- Open Telegram and find your bot (the username you chose in BotFather, e.g. `@YourBotName_bot`).
- Send **`/start`** to the bot.

---

## 3. Complete pairing (if `dmPolicy` is `"pairing"`)

With **pairing** policy, the bot does not reply until you approve the chat:

1. After you send `/start` or any message, the bot may send you an **8-character pairing code** (or you see it in the gateway logs).
2. On your machine, list pending pairing requests:
   ```bash
   openclaw pairing list telegram
   ```
3. Approve your Telegram chat with the code shown:
   ```bash
   openclaw pairing approve telegram <CODE>
   ```
   Replace `<CODE>` with the 8-character code (e.g. `Ab12Cd34`).

After approval, that Telegram chat is linked to OpenClaw and the bot will reply there.

---

## 4. Optional: use token from environment

To avoid storing the bot token in `openclaw.json`, you can move it to `~/.openclaw/.env`:

1. Add to `~/.openclaw/.env`:
   ```bash
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   ```
2. In `openclaw.json`, under `channels.telegram`, set:
   ```json
   "botToken": "env:TELEGRAM_BOT_TOKEN"
   ```
3. Restart the gateway:
   ```bash
   openclaw gateway restart
   ```

---

## 5. If the bot still does not reply

- Run: `openclaw logs | tail -80` and look for Telegram-related errors.
- Confirm your bot token is valid in [@BotFather](https://t.me/BotFather) (e.g. use `/mybots` → your bot → API Token).
- In BotFather: `/setprivacy` → **Disable**, so the bot can see all messages in groups (if you use it in groups).
- See also: [OPENCLAW_NOT_RESPONDING.md](./OPENCLAW_NOT_RESPONDING.md) for general “no reply” checks.
