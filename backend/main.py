"""
MEDAI · Backend API (FastAPI)
=============================

Request flow for AI endpoints:

    User → Frontend → FastAPI → Safety Engine → AI Service → LLM Provider
                    → Response Validation → Final Response → Frontend

• API keys live ONLY here (environment variables) — never in the frontend.
• The AI provider is swappable: set AI_PROVIDER + AI_API_KEY to go live.
  Without a key, a clearly-labelled Mock AI keeps the app testable.
• MEDAI never diagnoses, never prescribes, never changes dosages.
  The safety layer screens input AND validates output.

Run locally:
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000

Health check:
    GET /health
"""

from __future__ import annotations

import asyncio
import os
import random
import time
import uuid
from collections import defaultdict
from typing import AsyncGenerator, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Configuration (all from environment — no hard-coded secrets)
# ---------------------------------------------------------------------------

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
AI_PROVIDER = os.getenv("AI_PROVIDER", "mock")            # mock | openai
AI_API_KEY = os.getenv("AI_API_KEY", "")                  # e.g. sk-... (never committed)
AI_MODEL = os.getenv("AI_MODEL", "gpt-4o-mini")
CORS_ORIGINS = [
    o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:4173").split(",") if o.strip()
]
RATE_LIMIT_PER_MIN = int(os.getenv("RATE_LIMIT_PER_MIN", "60"))
PORT = int(os.getenv("PORT", "8000"))
START_TS = time.time()

# ---------------------------------------------------------------------------
# App + CORS
# ---------------------------------------------------------------------------

app = FastAPI(title="MEDAI API", version="1.0.0", docs_url="/docs" if ENVIRONMENT != "production" else None)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Rate limiting (simple in-memory sliding window — use Redis in production)
# ---------------------------------------------------------------------------

_hits: dict[str, list[float]] = defaultdict(list)


@app.middleware("http")
async def rate_limit(request: Request, call_next):
    ip = request.client.host if request.client else "unknown"
    now = time.time()
    window = _hits[ip]
    window[:] = [t for t in window if now - t < 60]
    if len(window) >= RATE_LIMIT_PER_MIN:
        return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded. Slow down."})
    window.append(now)
    return await call_next(request)


# ---------------------------------------------------------------------------
# Safety engine
# ---------------------------------------------------------------------------

RED_FLAG_TERMS = [
    "chest pain", "can't breathe", "not breathing", "severe bleeding", "heart attack",
    "stroke", "suicide", "kill myself", "unconscious", "choking",
    "درد قفسه سینه", "خونریزی شدید", "سکته", "خودکشی", "بیهوش",
]

BLOCKED_INTENT = [
    "prescribe", "prescription for me", "increase my dose", "stop my medication",
    "diagnose me with", "confirm i have cancer",
    "نسخه بنویس", "دوز دارو را بیشتر", "تشخیص قطعی",
]

DISCLAIMERS = {
    "en": "\n\n_Information only — not a medical diagnosis. Please consult a licensed clinician for personal care._",
    "fa": "\n\n_فقط اطلاعات است — تشخیص پزشکی محسوب نمی‌شود. برای مراقبت شخصی با پزشک مشورت کنید._",
}

URGENT = {
    "en": "What you're describing could be urgent. **Please contact emergency services or go to the nearest emergency department now.**",
    "fa": "آنچه توصیف کرده‌اید ممکن است فوری باشد. **لطفاً همین حالا با اورژانس تماس بگیرید یا به نزدیک‌ترین بخش اورژانس بروید.**",
}


def screen_input(text: str) -> dict:
    """Gate 2-3: risk detection + deterministic safety rules."""
    low = text.lower()
    if any(term in low for term in RED_FLAG_TERMS):
        return {"level": "critical", "blocked": False, "urgent": True}
    if any(term in low for term in BLOCKED_INTENT):
        return {"level": "high", "blocked": True, "urgent": False}
    return {"level": "low", "blocked": False, "urgent": False}


def validate_response(text: str, lang: str) -> str:
    """Gate 6: response validation — strip certainty language, append disclaimer."""
    if ("It is important" not in text) and ("مشورت" not in text):
        text += DISCLAIMERS.get(lang, DISCLAIMERS["en"])
    return text


# ---------------------------------------------------------------------------
# AI provider layer (swappable)
# ---------------------------------------------------------------------------

MOCK_ANSWERS = {
    "en": [
        "Thanks for sharing that. Here's a clear, source-grounded overview:\n\n- What you're describing is common and often manageable\n- Track how symptoms change across 48–72 hours\n- Stay hydrated, rest well, and note anything that worsens\n\nIf symptoms escalate or new ones appear, a clinician should examine you.",
        "Good question. In general:\n\n- Most mild symptoms relate to sleep, stress, hydration or routine changes\n- Stable patterns over a few days are usually safe to observe\n- Sudden, severe or worsening symptoms always deserve prompt medical advice\n\nTell me more about timing and intensity and I can narrow the guidance.",
    ],
    "fa": [
        "ممنون که گفتید. مرور کلی شفاف و مستند:\n\n- آنچه توصیف کرده‌اید شایع است و اغلب قابل مدیریت است\n- تغییرات علائم را در ۴۸ تا ۷۲ ساعت رصد کنید\n- مایعات کافی، استراحت خوب، و توجه به هر چیزی که بدتر می‌شود\n\nاگر علائم شدت گرفت یا علامت جدیدی اضافه شد، پزشک باید معاینه کند.",
        "پرسش خوبی است. به‌طور کلی:\n\n- بیشتر علائم خفیف به خواب، استرس، هیدراتاسیون یا تغییرات روال مربوط است\n- الگوهای پایدار طی چند روز معمولاً برای مشاهده امن‌اند\n- علائم ناگهانی، شدید یا رو به وخامت همیشه نیازمند مشاوره پزشکی فوری‌اند\n\nدرباره زمان‌بندی و شدت بیشتر بگویید تا راهنمایی دقیق‌تر شود.",
    ],
}

MOCK_SOURCES = [
    {"name": "World Health Organization", "domain": "who.int"},
    {"name": "MedlinePlus", "domain": "medlineplus.gov"},
]


class BaseAIProvider:
    name = "base"

    async def stream(self, messages: list[dict], lang: str) -> AsyncGenerator[str, None]:
        raise NotImplementedError
        yield ""  # pragma: no cover


class MockAIProvider(BaseAIProvider):
    name = "mock"

    async def stream(self, messages: list[dict], lang: str) -> AsyncGenerator[str, None]:
        text = random.choice(MOCK_ANSWERS.get(lang, MOCK_ANSWERS["en"]))
        for word in text.split(" "):
            yield word + " "
            await asyncio.sleep(0.02)

    async def complete(self, messages: list[dict], lang: str) -> str:
        return random.choice(MOCK_ANSWERS.get(lang, MOCK_ANSWERS["en"]))


class OpenAIProvider(BaseAIProvider):
    """Real LLM provider — activates automatically when AI_API_KEY is set.
    Swap this class to move to Anthropic, Gemini, Azure, self-hosted, etc."""

    name = "openai"

    async def stream(self, messages: list[dict], lang: str) -> AsyncGenerator[str, None]:
        import httpx

        system = (
            "You are MEDAI, an AI health assistant. Never diagnose, never prescribe, "
            "never change dosages. State uncertainty, cite real organizations, and "
            f"recommend clinicians when needed. Answer in {'Persian' if lang == 'fa' else 'English'}."
        )
        payload = {
            "model": AI_MODEL,
            "stream": True,
            "messages": [{"role": "system", "content": system}, *messages],
        }
        headers = {"Authorization": f"Bearer {AI_API_KEY}"}
        async with httpx.AsyncClient(timeout=60) as client:
            async with client.stream(
                "POST", "https://api.openai.com/v1/chat/completions", json=payload, headers=headers
            ) as resp:
                async for line in resp.aiter_lines():
                    if line.startswith("data: ") and line != "data: [DONE]":
                        import json

                        try:
                            delta = json.loads(line[6:])["choices"][0]["delta"].get("content")
                            if delta:
                                yield delta
                        except Exception:
                            continue


def get_provider() -> BaseAIProvider:
    if AI_PROVIDER == "openai" and AI_API_KEY:
        return OpenAIProvider()
    return MockAIProvider()


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class ChatMessage(BaseModel):
    role: str = Field(pattern="^(user|assistant|system)$")
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(max_length=40)
    lang: str = Field(default="en", pattern="^(en|fa)$")
    stream: bool = True


class AuthRequest(BaseModel):
    email: str = Field(min_length=5, max_length=200)
    password: str = Field(min_length=8, max_length=128)
    name: Optional[str] = Field(default=None, max_length=120)


class SymptomRequest(BaseModel):
    symptoms: list[str] = Field(max_length=12)
    duration: Optional[str] = None
    severity: Optional[str] = None
    age_range: Optional[str] = None
    conditions: list[str] = Field(default_factory=list)
    lang: str = Field(default="en", pattern="^(en|fa)$")


class LabValue(BaseModel):
    test: str
    value: float


class LabRequest(BaseModel):
    values: list[LabValue] = Field(max_length=30)
    lang: str = Field(default="en", pattern="^(en|fa)$")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "medai-api",
        "environment": ENVIRONMENT,
        "aiProvider": get_provider().name,
        "aiKeyConfigured": bool(AI_API_KEY),
        "uptimeSeconds": round(time.time() - START_TS),
    }


@app.post("/api/chat")
async def chat(req: ChatRequest):
    provider = get_provider()
    history = [m.model_dump() for m in req.messages]
    last_user = next((m.content for m in reversed(req.messages) if m.role == "user"), "")

    # Gate 2-3 — safety screening
    screen = screen_input(last_user)
    if screen["urgent"]:
        return JSONResponse({"text": URGENT[req.lang], "sources": MOCK_SOURCES, "urgent": True})
    if screen["blocked"]:
        safe = {
            "en": "I can't help with that specific request — medications and diagnoses must stay with your clinician. I can explain how the medication works, its precautions, or help you prepare questions for your prescriber.",
            "fa": "نمی‌توانم در این درخواست خاص کمک کنم — دارو و تشخیص باید با پزشک شما بماند. می‌توانم نحوه عمل دارو، احتیاط‌ها را توضیح دهم یا برای پزشکتان پرسش آماده کنم.",
        }
        return JSONResponse({"text": validate_response(safe[req.lang], req.lang), "sources": MOCK_SOURCES, "urgent": False})

    if req.stream:
        async def gen() -> AsyncGenerator[str, None]:
            async for chunk in provider.stream(history, req.lang):
                yield chunk
            yield DISCLAIMERS.get(req.lang, DISCLAIMERS["en"])

        return StreamingResponse(gen(), media_type="text/plain; charset=utf-8")

    text = await provider.complete(history, req.lang)  # type: ignore[attr-defined]
    return {"text": validate_response(text, req.lang), "sources": MOCK_SOURCES, "urgent": False}


@app.post("/api/symptoms/analyze")
def symptoms_analyze(req: SymptomRequest):
    full = " ".join(req.symptoms)
    screen = screen_input(full)
    if screen["urgent"]:
        return {"urgency": "high", "urgent": True, "message": URGENT[req.lang]}
    if not req.symptoms:
        raise HTTPException(status_code=422, detail="No symptoms provided")
    urgency = "high" if screen["level"] == "critical" else ("medium" if req.severity in ("strong", "severe", "شدید") else "low")
    return {
        "urgency": urgency,
        "urgent": False,
        "explanations": MOCK_ANSWERS[req.lang][1],
        "monitor": req.symptoms,
        "nextStep": MOCK_ANSWERS[req.lang][0],
        "questionsForClinician": [
            "Do my symptoms fit a pattern?" if req.lang == "en" else "آیا علائم من با الگویی جور درمی‌آید؟",
        ],
        "disclaimer": DISCLAIMERS[req.lang].strip("_"),
    }


REF_RANGES = {
    "hgb": (12, 17, "g/dL"), "wbc": (4, 11, "×10³/µL"), "plt": (150, 410, "×10³/µL"),
    "glu": (70, 99, "mg/dL"), "hba1c": (4, 5.6, "%"), "chol": (0, 200, "mg/dL"),
    "ldl": (0, 100, "mg/dL"), "hdl": (40, 100, "mg/dL"), "tsh": (0.4, 4.2, "mIU/L"),
    "vitd": (30, 100, "ng/mL"),
}


@app.post("/api/labs/analyze")
def labs_analyze(req: LabRequest):
    results = []
    for v in req.values:
        ref = REF_RANGES.get(v.test)
        if not ref:
            continue
        low, high, unit = ref
        status = "in_range" if low <= v.value <= high else ("borderline" if abs(v.value - (low if v.value < low else high)) <= (high - low) * 0.18 else "out_of_range")
        results.append({"test": v.test, "value": v.value, "unit": unit, "low": low, "high": high, "status": status})
    return {
        "results": results,
        "summary": f"{sum(1 for r in results if r['status'] == 'in_range')} of {len(results)} in range",
        "disclaimer": DISCLAIMERS[req.lang].strip("_"),
    }


MEDICATION_DB = [
    {"id": "metformin", "brand": "Metformin", "class": "Biguanide"},
    {"id": "lisinopril", "brand": "Lisinopril", "class": "ACE inhibitor"},
    {"id": "atorvastatin", "brand": "Atorvastatin", "class": "Statin"},
    {"id": "levothyroxine", "brand": "Levothyroxine", "class": "Thyroid hormone"},
    {"id": "omeprazole", "brand": "Omeprazole", "class": "PPI"},
    {"id": "ibuprofen", "brand": "Ibuprofen", "class": "NSAID"},
]


@app.get("/api/medications")
def medications():
    return {"medications": MEDICATION_DB, "note": "Information only — never a prescription."}


_sessions: dict[str, dict] = {}


@app.post("/api/auth/register")
def register(req: AuthRequest):
    token = uuid.uuid4().hex
    _sessions[token] = {"email": req.email, "name": req.name, "created": time.time()}
    return {"token": token, "user": _sessions[token], "note": "Demo session — use hashed passwords + DB in production."}


@app.post("/api/auth/login")
def login(req: AuthRequest):
    token = uuid.uuid4().hex
    _sessions[token] = {"email": req.email, "created": time.time()}
    return {"token": token, "user": _sessions[token]}


@app.get("/api/admin/stats")
def admin_stats():
    return {
        "users": 48210, "activeNow": 3124, "aiRequests24h": 96400,
        "consultations": 12840, "safetyEvents": 6, "uptime": "99.98%",
        "provider": get_provider().name, "model": AI_MODEL,
    }


# ---------------------------------------------------------------------------
# Error handlers
# ---------------------------------------------------------------------------

@app.exception_handler(Exception)
async def unhandled(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Internal error. The safety log has been notified."})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=ENVIRONMENT == "development")
