# Revora Discord Bot — Setup Guide

Red & black themed server bot with verification, tickets, invite tracking, and server rejoin.

---

## Prerequisites

- **Node.js v18+** — https://nodejs.org
- A **Discord account** with a server ready to set up

---

## Step 1 — Create your Discord Application

1. Go to https://discord.com/developers/applications
2. Click **New Application** → name it `Revora`
3. Go to **Bot** tab → click **Add Bot**
4. Copy the **Bot Token** — you'll need it
5. Under **Privileged Gateway Intents**, enable ALL THREE:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent
6. Go to **OAuth2 → General** tab
   - Copy your **Client ID** and **Client Secret**
   - Under **Redirects**, add: `http://localhost:3000/verify`
     (or your server's public URL if hosting remotely)

---

## Step 2 — Invite the Bot to your Server

1. Go to **OAuth2 → URL Generator**
2. Under **Scopes**, select: `bot`, `applications.commands`
3. Under **Bot Permissions**, select:
   - Administrator (easiest for setup)
4. Copy the generated URL → open it → select your server → **Authorise**

---

## Step 3 — Configure the Bot

```bash
cd revora-bot
cp .env.example .env
```

Open `.env` and fill in:
```
DISCORD_TOKEN=paste_your_bot_token
CLIENT_ID=paste_your_client_id
CLIENT_SECRET=paste_your_client_secret
REDIRECT_URI=http://localhost:3000/verify
PORT=3000
GUILD_ID=paste_your_server_id
```

To find your **Guild ID**: Right-click your server icon → Copy Server ID
(Enable Developer Mode in Discord Settings → Advanced → Developer Mode first)

---

## Step 4 — Install Dependencies & Register Commands

```bash
npm install
node deploy-commands.js
```

You should see: `Commands registered successfully.`

---

## Step 5 — Start the Bot

```bash
node index.js
```

You should see:
```
[Bot] Logged in as Revora#1234
[Invites] Invite cache built.
[Web] OAuth server listening on port 3000
[DB] Database initialised.
```

---

## Step 6 — Run Server Setup

In your Discord server (as Owner/Admin):

1. Type `/setup` — this creates ALL channels, roles, and permissions. Wait for it to finish.
2. Type `/post-terms` — posts Terms & Rules in #rules-and-terms
3. Type `/post-verify` — posts the verification embed in #verify-here
4. Type `/post-tickets` — posts the ticket creation embed in #create-ticket

---

## Step 7 — Set your Owner Role

After setup, manually assign yourself the **Owner** role in Discord (Server Settings → Members).

---

## Hosting (to make OAuth verification work for others)

The verification system needs a **public URL** for the OAuth callback.

**Options:**
- **Railway** (free tier) — https://railway.app → deploy from GitHub
- **Render** (free tier) — https://render.com
- **VPS** (Hetzner, DigitalOcean, etc.)
- **For testing locally** — use ngrok: `ngrok http 3000` → use the HTTPS URL as REDIRECT_URI

If hosting remotely, update `REDIRECT_URI` in your `.env` **and** in your Discord application's OAuth2 Redirects.

---

## Features

| Feature | Command / How |
|---|---|
| Full server setup | `/setup` |
| Post verification embed | `/post-verify` |
| Post ticket embed | `/post-tickets` |
| Post terms & rules | `/post-terms` |
| Rejoin users to new server | `/rejoin-server guild_id:NEW_ID` |
| Invite tracking | Automatic on member join |
| Ticket creation | Click button in #create-ticket |
| Ticket closing | Support clicks "Close Ticket" in ticket channel |
| OAuth2 verification | Web server at port 3000 |

---

## Roles Created

| Role | Color | Who gets it |
|---|---|---|
| Owner | 🔴 Red | You — assign manually |
| Admin | 🔴 Dark Red | Your admins |
| Support | 🟠 Orange-Red | Support team |
| Customer | 🔴 Light Red | Paying customers |
| Booster | 🩷 Pink | Server boosters |
| Member | 🔴 Dark Red | All verified users |
| Unverified | ⚫ Near-black | New joins (before verify) |

---

## Channel Structure

```
✅ VERIFICATION
  🔐 verify-here

📋 ABOUT REVORA
  👋 welcome
  📜 rules-and-terms
  ℹ️ about-us

📢 NEWS
  📣 announcements
  🎁 giveaways
  🚀 server-boost
  💳 payment-info
  🔄 status-updates

🛍️ PRODUCTS
  🎮 cs2-internal-external
  🎲 roblox-external
  ⛏️ minecraft-client
  🎯 bloodstrike-external
  ⚔️ combat-master-external

🎫 SUPPORT
  🎫 create-ticket
  🔊 support-vc

🔒 SUPPORT TEAM  (Support+ only)
  📋 support-logs
  💬 support-chat
  🔊 support-team-vc

💬 COMMUNITY
  💬 general
  🎁 community-giveaways
  🖼️ media

🔧 MODERATION  (Admin+ only)
  📋 mod-logs
  💬 mod-chat
  🚨 reports
  🔊 mod-vc

🎫 TICKETS  (auto-created, Support+ + ticket owner)
  ticket-1-username
  ticket-2-username
  ...
```
