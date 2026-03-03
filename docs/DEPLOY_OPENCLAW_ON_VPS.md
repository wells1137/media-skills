# 云服务器部署 OpenClaw 网关（一步步来）

你已经买好了火山引擎 ECS，按下面顺序做即可。**把你的公网 IP 换成实际 IP**（例如 `163.7.8.104`）。

---

## 想最少操作？用一键脚本（推荐）

1. **在你这台电脑**打开 `docs/deploy-openclaw.sh`，把文件里第 12、13 行的 `GOOGLE_API_KEY` 和 `TELEGRAM_BOT_TOKEN` 填上（从 Google AI Studio 和 @BotFather 拿），保存。
2. 上传到服务器（在你这台电脑执行，把 `你的公网IP` 换成真实 IP）：
   ```bash
   scp docs/deploy-openclaw.sh root@你的公网IP:~/
   ```
3. **SSH 登录服务器**：`ssh root@你的公网IP`
4. **在服务器上执行**：
   ```bash
   chmod +x ~/deploy-openclaw.sh && ~/deploy-openclaw.sh
   ```
5. **回到你这台电脑**，把本机配置拷过去（把 IP 换成你的公网 IP）：
   ```bash
   scp ~/.openclaw/openclaw.json root@你的公网IP:~/.openclaw/
   ```
6. 到 Telegram 给机器人发一条消息，能回复就成功了。

下面是从头一步步做的说明，需要时可以对照。

---

## 第 0 步：在火山引擎控制台放行 SSH

1. 打开 [火山引擎控制台](https://console.volcengine.com/) → 云服务器 ECS → 你的实例。
2. 点实例名或「安全组」→ 进入安全组 → **入方向规则**。
3. 添加一条规则：**端口 22**，协议 TCP，来源 `0.0.0.0/0`（或你的固定 IP 更安全），保存。

这样你才能从本机 SSH 连上去。

---

## 第 1 步：用 SSH 登录服务器

在你**自己的电脑**上打开终端，执行（把 `你的服务器公网IP` 换成真实 IP）：

```bash
ssh root@你的服务器公网IP
```

第一次会问是否信任主机，输入 `yes`。若设置了 root 密码，会提示输入密码。

登录成功后，你会看到类似 `root@i-xxxxx:~#` 的提示符，说明已经进到服务器里了。

---

## 第 2 步：安装 Node.js 22

在服务器上**逐行**执行（复制一整段也可以）：

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
```

最后一行应显示 `v22.x.x`。没有报错就继续。

---

## 第 3 步：安装 OpenClaw

在服务器上执行（二选一）：

**方式 A（推荐，官方一键）：**

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

**方式 B（用 npm）：**

```bash
sudo npm install -g openclaw@latest
```

装好后执行：

```bash
openclaw --version
```

能打出版本号就说明安装成功。

---

## 第 4 步：建配置目录和 .env

在服务器上执行：

```bash
mkdir -p ~/.openclaw
nano ~/.openclaw/.env
```

在打开的编辑器里写入（**把下面内容里的「你的xxx」换成真实值**）：

```env
GOOGLE_API_KEY=你的Gemini的API密钥
TELEGRAM_BOT_TOKEN=你的Telegram机器人Token
```

- Gemini 密钥：打开 [Google AI Studio](https://aistudio.google.com/) 创建或复制。
- Telegram Token：在 Telegram 找 @BotFather，用 `/newbot` 创建机器人后会给你一串 token。

保存并退出：按 `Ctrl+O` 回车，再按 `Ctrl+X`。

然后限制文件权限：

```bash
chmod 600 ~/.openclaw/.env
```

---

## 第 5 步：把本机的 openclaw.json 拷到服务器（推荐）

你本机已经配过 Telegram、技能等，直接复用最省事。

在**你自己的电脑**上执行（把 `你的服务器公网IP` 换成真实 IP）：

```bash
scp ~/.openclaw/openclaw.json root@你的服务器公网IP:~/.openclaw/
```

会提示输入服务器密码。传完后，服务器上的 `~/.openclaw/openclaw.json` 就和本机一致了（含 Telegram、技能等配置）。

**如果没有本机配置**：在服务器上执行 `openclaw onboard`，按提示选运行模式、模型、Telegram 等，会生成基础配置。

---

## 第 6 步：把网关装成后台服务（开机自启）

在**服务器**上执行：

```bash
openclaw gateway install
```

按提示操作（若有）。这样会装成 systemd 服务，重启服务器也会自动拉起来。

然后启动并看状态：

```bash
openclaw gateway start
openclaw gateway status
```

若没有 `gateway install` 或报错，可以改用手动 systemd（见文末「备用：手动写 systemd」）。

---

## 第 7 步：验证是否成功

1. 在 Telegram 里给你的 bot 发一条消息（例如 `/start` 或随便一句话），看 bot 会不会回复。
2. 在服务器上看日志（如有）：

   ```bash
   openclaw logs --limit 50
   # 或若用 systemd：
   sudo journalctl -u openclaw-gateway -n 50 -f
   ```

若能收到回复、日志里没有明显报错，说明部署成功。之后可以关掉本机的 OpenClaw 网关，只用云上这一台。

---

## 常见问题

**Q：SSH 连不上？**  
- 检查火山引擎安全组是否放行了 **22** 端口。  
- 确认用的是**公网 IP**，不是内网 IP。

**Q：Telegram 不回复？**  
- 确认 `~/.openclaw/.env` 里的 `TELEGRAM_BOT_TOKEN` 正确、没多余空格。  
- 若是 pairing 模式，在服务器本机执行 `openclaw pairing list telegram`，再 `openclaw pairing approve telegram <CODE>` 批准你的账号。

**Q：想用技能（audiomind、image-studio）？**  
- 若用 Vercel 代理，在 `~/.openclaw/.env` 里可加（可选）：  
  `AUDIOMIND_PROXY_URL=https://audiomind-proxy.vercel.app`  
  `IMAGE_GEN_PROXY_URL=https://image-studio-proxy.vercel.app`  
- 技能配置在 `openclaw.json` 里，你从本机 scp 过去时已经带上了。

---

## 备用：手动写 systemd（当 gateway install 不可用时）

在服务器上执行：

```bash
sudo nano /etc/systemd/system/openclaw-gateway.service
```

写入（若你不是 root 而是用普通用户，把 `root` 和 `/root` 换成该用户名和其家目录）：

```ini
[Unit]
Description=OpenClaw Gateway
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root
Environment=NODE_ENV=production
EnvironmentFile=/root/.openclaw/.env
ExecStart=/usr/bin/npx openclaw gateway
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

保存后执行：

```bash
sudo systemctl daemon-reload
sudo systemctl enable openclaw-gateway
sudo systemctl start openclaw-gateway
sudo systemctl status openclaw-gateway
```

---

**小结顺序**：放行 22 → SSH 登录 → 装 Node 22 → 装 OpenClaw → 配 `.env` → 拷或生成 `openclaw.json` → `openclaw gateway install` 并 start → Telegram 试发消息验证。
