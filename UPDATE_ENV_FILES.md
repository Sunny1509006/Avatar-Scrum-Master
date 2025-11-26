# AI Gym Avatar - LiveKit Configuration Update

## 🔧 Manual Update Required

The `.env` files are protected by gitignore. Please manually update them with the following values:

---

## Backend `.env` File

**Location:** `d:\personal projects\AI Avatar\AI Gym Avatar\backend\.env`

**Replace the first 3 lines with:**

```bash
LIVEKIT_URL=wss://livekit.softwarebari.com
LIVEKIT_API_KEY=APImpTrdwkdZUwb
LIVEKIT_API_SECRET=GklskfxXG8AFypTfnLz73t5g9HXb9O7zenDYpcM6DwDA
```

**Keep the rest of the file as is** (OPENAI_API_KEY, PERSONA_ID, REPLICA_ID, TAVUS_API_KEY, etc.)

---

## Website `.env` File

**Location:** `d:\personal projects\AI Avatar\AI Gym Avatar\website\.env`

**Replace the entire content with:**

```bash
VITE_LIVEKIT_URL=wss://livekit.softwarebari.com
```

---

## ⚠️ Important DNS Requirement

Before the avatar will connect, ensure these DNS records point to your server IP:
- livekit.softwarebari.com
- livekit-turn.softwarebari.com
- livekit-whip.softwarebari.com

Without proper DNS configuration, you'll see endless loading.

---

## 🧪 Quick Test

After updating, restart your backend and website:

```bash
# Terminal 1 - Backend
cd "d:\personal projects\AI Avatar\AI Gym Avatar\backend"
python agent.py

# Terminal 2 - Server
cd "d:\personal projects\AI Avatar\AI Gym Avatar\backend"
python server.py

# Terminal 3 - Website
cd "d:\personal projects\AI Avatar\AI Gym Avatar\website"
npm run dev
```

Check browser console (F12) for any WebSocket connection errors.
