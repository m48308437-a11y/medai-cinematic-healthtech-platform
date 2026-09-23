# MEDAI · Architecture

## 1. Big picture

```
┌────────────┐   HTTPS    ┌──────────────────────────┐   HTTPS/SSE   ┌─────────────┐
│  Frontend  │ ─────────► │  Backend (FastAPI)       │ ────────────► │ LLM Provider │
│  (React +  │            │  ┌──────────────────────┐│               │ (OpenAI,     │
│  Three.js) │ ◄───────── │  │ Safety Engine        ││ ◄──────────── │  swappable)  │
└────────────┘  stream    │  │  2 Risk detection    ││   tokens      └─────────────┘
      │                   │  │  3 Safety rules      ││
      │ VITE_API_URL      │  │  4 Medical context   ││
      ▼                   │  │  6 Response validate ││
 AI Service Layer         │  └──────────────────────┘│
 (remote | mock)          │  Rate limit · CORS · Auth│
                          │  /health · /api/*        │
                          └───────────┬──────────────┘
                                      ▼
                          PostgreSQL (schema.sql)
                          + Vector store for RAG
```

**Golden rule:** the frontend never holds secrets. `VITE_API_URL` is the only
public config; `AI_API_KEY`, `DATABASE_URL`, `SECRET_KEY` live exclusively in
backend environment variables.

## 2. Frontend layers

| Layer | Location | Notes |
|---|---|---|
| Pages | `src/pages/*` | Route-level, lazy-loaded with code splitting |
| UI kit | `src/components/ui.tsx` | MagneticButton, TiltCard, Reveal, Counter, ECG, BackgroundFX |
| Charts | `src/components/charts.tsx` | Pure animated SVG (no chart lib) — GPU-friendly |
| 3D | `src/three/*` | R3F scene + CSS fallback + `prefers-reduced-motion` support |
| i18n | `src/i18n/*` | Dot-path dictionaries EN/FA, `dir`/`lang` switching, fa-IR numerals |
| AI service | `src/services/ai.ts` | `AIProvider` interface → `RemoteAIProvider` (backend) or `MockAIProvider` (demo) |

Animations use transform/opacity only; Three.js renders at `dpr ≤ 1.75` and the
GL canvas is skipped entirely for reduced-motion users.

## 3. AI safety engine (backend)

Deterministic, model-independent gates around every AI call:

1. **User input** — validated by Pydantic (types, lengths, patterns).
2. **Risk detection** — red-flag symptom/emergency phrase screening.
3. **Safety rules** — blocked intents: prescriptions, dosage changes, definitive diagnoses.
4. **Medical context** — RAG retrieval grounds the prompt in curated sources.
5. **LLM reasoning** — provider-swappable; system prompt hard-codes MEDAI's contract.
6. **Response validation** — certainty language is blocked; disclaimer appended; citations must map to registered sources.
7. **Final response** — uncertainty stated, clinician referral attached.

Every triggered rule writes a `safety_events` row (severity critical→low),
surfaced in the Admin Safety Center with resolution tracking.

## 4. Medical RAG

```
Medical sources → processing → chunking → embeddings
              → vector database → retrieval → context → LLM
```

- Sources are **versioned** (`knowledge_documents.version`) and **re-indexable**
  (`status: pending/indexed/updating/failed`) from Admin → Medical Knowledge.
- Demo mode ships curated static content; production stores chunks + embeddings
  (pgvector recommended) and retrieves top-k per query.
- Sources can be activated/deactivated without touching code.

## 5. Provider swapping

```python
class OpenAIProvider(BaseAIProvider): ...   # today
class AnthropicProvider(BaseAIProvider): ... # tomorrow — one class, zero frontend changes
```

`get_provider()` selects by `AI_PROVIDER` + presence of `AI_API_KEY`.
No key → `MockAIProvider` (clearly labelled demo answers in EN/FA).

## 6. Environments

| | Development | Production |
|---|---|---|
| Frontend | `npm run dev` (5173) | Render static site (`npm ci && npm run build` → `dist`) |
| Backend | `uvicorn --reload` (8000) | Render web service (`--host 0.0.0.0 --port $PORT`) |
| Docs | `/docs` enabled | disabled |
| AI | mock allowed | real key expected |
| CORS | localhost:5173 | exact https origins |

## 7. Data model (core)

`users · roles · permissions · sessions · consultations · messages · symptoms ·
lab_results · medications · health_notes · reminders · medical_sources ·
knowledge_documents · safety_events · notifications · audit_logs`

See `database/schema.sql` — includes RBAC seed, indexes, and CHECK constraints.
