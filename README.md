<div align="center">

# 🩺 MEDAI — Your Health. Reimagined.

**A cinematic, bilingual (Persian/English, RTL/LTR) AI HealthTech platform — production-grade, GitHub-ready and Render-ready.**

MEDAI is an **AI health assistant — not a doctor, and never a replacement for one.**
It never diagnoses, never prescribes, never changes dosages.

</div>

---

## ✨ What's inside

| Layer | Stack |
|---|---|
| Frontend | React 19 · TypeScript · Vite · Tailwind CSS v4 · Three.js (React Three Fiber) · Framer Motion |
| Backend | Python · FastAPI · Pydantic v2 · Uvicorn |
| Database | PostgreSQL (schema in `database/schema.sql`) |
| AI | Swappable provider layer · Streaming chat · RAG-ready · Safety Engine (pre + post) |
| i18n | Full EN/FA dictionaries · Automatic RTL/LTR mirroring · Vazirmatn + Space Grotesk typography |

**Modules:** AI Chat (streaming, sources, regenerate, search) · Symptom Checker wizard · Lab Analyzer (manual + upload) · Medication Information · Health Dashboard (charts, journal, reminders) · Clinician Summary Generator · Admin Command Center (`/admin` — users, analytics, AI control, safety center, knowledge base, RBAC, audit logs, settings).

---

## 📁 Repository layout

```
MEDAI/
├── src/                  # ← Frontend (React + Vite + TS) lives at repo root
│   ├── components/       # UI kit: magnetic buttons, tilt cards, SVG charts, navbar/footer
│   ├── three/            # 3D "Vitality Core" (R3F + bloom, CSS fallback + reduced-motion)
│   ├── pages/            # Home, Assistant, Symptoms, Labs, Medications, Dashboard, Admin, Auth
│   ├── i18n/             # EN/FA dictionaries + language provider (RTL/LTR)
│   ├── services/ai.ts    # AI service layer (Remote → fastapi | Mock demo provider)
│   └── data/demo.ts      # Demo-mode data (medications, labs, admin, dashboard)
├── backend/              # FastAPI service — deployable as-is on Render
│   ├── main.py           # Chat (SSE), symptoms, labs, meds, auth, admin, /health, safety, rate-limit
│   └── requirements.txt
├── database/schema.sql   # users, roles, sessions, consultations, messages, labs, RAG docs, safety…
├── docs/ARCHITECTURE.md  # System design, safety engine, RAG pipeline
├── render.yaml           # One-click Render Blueprint (backend + frontend)
├── .env.example          # Every variable, explained — copy to .env
└── .gitignore            # Secrets-safe defaults
```

---

## 🚀 Quick start — step by step (beginner friendly)

### 1) Get the code from GitHub

```bash
git clone https://github.com/<you>/medai.git
cd medai
```

### 2) Install dependencies

**Frontend** (Node 20+):
```bash
npm install
```

**Backend** (Python 3.11+):
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 3) Create your `.env`

```bash
cp .env.example .env
```

Fill it in (all safe to leave empty for the demo — the app falls back to **Mock AI** which is clearly labelled and never claims to be real AI).

| Variable | What it does |
|---|---|
| `AI_PROVIDER` | `openai` or `mock` |
| `AI_API_KEY` | Your LLM key — **backend only, never in the frontend** |
| `AI_MODEL` | Model name, e.g. `gpt-4o-mini` |
| `SECRET_KEY` | Random string: `openssl rand -hex 32` |
| `DATABASE_URL` | Postgres connection string (when you add a DB) |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |
| `VITE_API_URL` | Where the frontend finds the backend (`http://localhost:8000` locally) |

### 4) Run the frontend

```bash
npm run dev
# → http://localhost:5173
```

### 5) Run the backend

```bash
cd backend && source .venv/bin/activate
uvicorn main:app --reload --port 8000
# → http://localhost:8000  (docs at /docs in development)
```

### 6) Connect real AI (when you're ready)

1. Get an API key from your provider (e.g. console.openai.com).
2. Put it in `.env` → `AI_API_KEY=sk-...`, `AI_PROVIDER=openai`.
3. Restart uvicorn.
4. Set `VITE_API_URL=http://localhost:8000` for the frontend and restart `npm run dev`.

That's it — the chat automatically streams from the real model through the **Safety Engine**. To switch providers later (Anthropic, Azure, self-hosted), edit one class in `backend/main.py` (`OpenAIProvider`) — the frontend never changes.

---

## ☁️ Deploy to Render (production)

### 7) Create the backend service

1. Push this repo to GitHub.
2. On [render.com](https://render.com): **New → Blueprint** → pick the repo.
3. Render reads `render.yaml` and creates **two services**: `medai-api` (FastAPI) and `medai-web` (static site).

### 8) Add environment variables in Render

For `medai-api` → **Environment** tab:

```
AI_PROVIDER=openai
AI_API_KEY=<paste your key here>     # secret — never in Git
SECRET_KEY=<generate>
CORS_ORIGINS=https://<your-frontend>.onrender.com
ENVIRONMENT=production
RATE_LIMIT_PER_MIN=60
```

For `medai-web`:

```
VITE_API_URL=https://<your-backend>.onrender.com
```

### 9) Connect Render ↔ GitHub

Blueprint deploys are already Git-connected: every `git push` to `main` redeploys both services automatically. (Manual alternative: **New → Web Service → connect repo → rootDir `backend`, build `pip install -r requirements.txt`, start `uvicorn main:app --host 0.0.0.0 --port $PORT`.)

### 10) Test `/health`

```bash
curl https://<your-backend>.onrender.com/health
# {"status":"ok","service":"medai-api","aiProvider":"openai", ...}
```

### 11) Attach the frontend to the backend

Set `VITE_API_URL` (step 8), trigger a redeploy of `medai-web`, then open your site:
- Chat streams from the real backend
- The demo-mode badge disappears
- Admin shows `provider: openai`

> **Note:** the hosted preview you may have seen runs in **Demo Mode** (Mock AI). Everything works identically — real AI turns on the moment you add a key.

---

## 🛡️ Safety engine (always on)

```
User Input → Risk Detection → Safety Rules → Medical Context (RAG)
          → LLM → Response Validation → Final Response
```

- Red-flag phrases (chest pain, breathing, self-harm…) → **immediate emergency guidance**, no chat answer.
- Prescription/dosage/diagnosis requests → **blocked & redirected** to clinician-prep help.
- Every response gets validation + disclaimer. Uncertainty is always stated.
- Admin → **Safety Center** shows critical/high/medium/low events with resolutions.

**MEDAI will never:** diagnose, prescribe, change dosages, claim 100% accuracy, invent citations, or replace a doctor.

---

## 🔐 Security checklist

- [x] API keys server-side only (env vars) · [x] CORS allowlist · [x] Rate limiting middleware
- [x] Pydantic input validation (XSS/SQLi surface minimized) · [x] Session tokens hashed in schema
- [x] RBAC roles (super admin / admin / medical / support / analyst) · [x] Audit log table & UI
- [x] `.env` git-ignored · [x] `noindex` on `/admin` · [x] Health data models isolation-ready

## 🧪 Testing

```bash
# Frontend type/lint gate
npx tsc --noEmit

# Backend smoke test
cd backend && uvicorn main:app &
curl http://localhost:8000/health
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"hello"}],"lang":"en","stream":false}'
```

## 📡 API surface

`GET /health` · `POST /api/chat` (stream) · `POST /api/symptoms/analyze` · `POST /api/labs/analyze` · `GET /api/medications` · `POST /api/auth/register|login` · `GET /api/admin/stats`

Roadmap stubs: `/api/users` · `/api/consultations` · `/api/reminders` · `/api/safety` · `/api/medical-sources`

---

<div align="center">
Built with a safety-first architecture · فارسی و English ·
<strong>MEDAI explains and organizes — doctors decide.</strong>
</div>
