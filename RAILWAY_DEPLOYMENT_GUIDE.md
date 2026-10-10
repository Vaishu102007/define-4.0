# 🚆 Railway Deployment Master Guide — Nimad AI Conversation Copilot

> **PR007** · Real-Time Audio & Video Meeting Application with Live Speech Transcription & Instant Sidebar Q&A Copilot.

---

## 💡 Is Railway Suitable for This Project?

### **YES — Railway is 100% SUITABLE and IDEAL for this project.**

Here is the exact technical breakdown of why Railway is one of the best platforms for Nimad:

| Capability Needed | Cloudflare / Vercel Serverless | Railway (Docker / Native Container) | Why Nimad Needs This |
| :--- | :--- | :--- | :--- |
| **Persistent WebSockets (`/ws/...`)** | ❌ Hard timeouts (10s–30s) | ✅ **Full persistent connections** | Continuous real-time audio transcription & copilot streaming. |
| **FastAPI + Uvicorn Async Server** | ❌ Complex adapter required | ✅ **Native 1-click execution** | Runs Python 3.12 with async SQLAlchemy & Uvicorn out of the box. |
| **Managed PostgreSQL Database** | ❌ External database required | ✅ **1-Click Built-in Postgres** | Persistent meetings, sessions, attendees, transcripts, and insights. |
| **Full-Stack Single Container** | ⚠️ Split repos / edge proxy | ✅ **Single container deployment** | Serves both the FastAPI backend and frontend static assets under one origin. |
| **Free SSL (`https://...`)** | ✅ Yes | ✅ **Automatic HTTPS domain** | Required for browser microphone (`getUserMedia`) & speech recognition APIs. |
| **Zero Cold Starts** | ❌ Frequent cold starts | ✅ **Always-on container** | Instant response when attenders ask questions during live calls. |

---

## 📁 Railway Files Created in This Repository

1. **`Dockerfile`** (Root): Multi-stage container definition packaging Python 3.12, FastAPI backend, and frontend assets, dynamically binding to `${PORT:-8000}`.
2. **`railway.json`** (Root): Railway deployment specification configuring the Dockerfile builder, automatic `/healthz` health checks, and retry policy.
3. **`Procfile`** (Root): Fallback process runner for platforms utilizing Procfiles.
4. **`.dockerignore`** (Root): Excludes local virtual environments, test caches, and sqlite databases for rapid build times.
5. **`railway.env.example`** (Root): Template of all environment variables needed on Railway.
6. **`pr007-conversation-copilot/railway.json`** & **`pr007-conversation-copilot/Dockerfile`**: Configured if you ever choose to set Railway's root directory directly to the subfolder.

---

## 🚀 5-Minute Step-by-Step Deployment on Railway

### Step 1: Open Railway and Connect Your Repository
1. Go to [railway.com](https://railway.com/) and sign in with your GitHub account.
2. Click **+ New Project** (top right).
3. Select **Deploy from GitHub repo**.
4. Choose your repository: `Vaishu102007/define-4.0` (or `DEFINE`).
5. Click **Deploy Now**.

---

### Step 2: Add Managed PostgreSQL Database (Recommended for Persistence)
1. In your Railway project canvas, click **+ New** (or press `Ctrl+K`).
2. Select **Database** → **Add PostgreSQL**.
3. Railway will provision a managed PostgreSQL database in ~10 seconds.
4. Click on your deployed web service container → Go to **Variables** tab:
   - Click **+ New Variable** → Click **Add Reference**.
   - Select `DATABASE_URL` from the PostgreSQL service.
   *(Note: The codebase automatically handles converting `postgresql://` to `postgresql+psycopg://` asynchronously!)*

---

### Step 3: Configure Environment Variables
In your web service container → **Variables** tab, set the following:

| Variable Name | Recommended Value | Description |
| :--- | :--- | :--- |
| `APP_ENV` | `production` | Production mode |
| `APP_SECRET_KEY` | *(Click "Generate" or enter random 32+ char key)* | JWT secret key |
| `AI_PROVIDER` | `groq` | Recommended AI provider (ultra-fast responses) |
| `GROQ_API_KEY` | `your_groq_api_key_here` | Your Groq API key |
| `AI_MODEL` | `llama-3.3-70b-versatile` | Ultra-fast LLaMA 3.3 model |
| `ALLOWED_ORIGINS` | `https://*.up.railway.app,http://localhost:8000` | CORS permissions |

*(Optional)*:
- `OPENAI_API_KEY`: Fallback provider key
- `ELEVENLABS_API_KEY`: Voice synthesis for TTS copilot recitation

---

### Step 4: Generate Your Public Domain
1. In your web service, go to **Settings** → **Networking**.
2. Click **Generate Domain**.
3. Railway will instantly provide a public HTTPS URL like:
   ```
   https://define-40-production.up.railway.app
   ```

---

## 🧪 Verifying the Live Deployment

Once deployed:

1. **Check Health Check:**
   Open:
   ```
   https://<your-app>.up.railway.app/healthz
   ```
   You should see:
   ```json
   {"status":"ok","app":"Nimad","env":"production"}
   ```

2. **Open the Web Application:**
   Navigate to `https://<your-app>.up.railway.app/`
   - Log in with demo credentials:
     - **Email:** `demo@copilot.ai`
     - **Password:** `demopassword123`
   - Create or open a meeting.
   - Test **🎙️ Microphone** / **Live Transcription**.
   - Test **⚡ Attender Simulator** to watch real-time AI Easy Answers stream into the sidebar!
