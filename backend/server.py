"""
PoliSwipe backend -- proxies to local Ollama for AI features.
Run: uvicorn backend.server:app --host 0.0.0.0 --port 8000 --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

app = FastAPI(title="PoliSwipe Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://localhost:11434/api/generate"
# llava:13b is vision-only; llama3.2 is better for text generation
MODEL = "llama3.2:latest"


class DraftRequest(BaseModel):
    headline: str
    summary: str
    rep: str
    rep_title: str
    user_major: str = "Computer Science"
    user_year: str = "Sophomore"


class ChatRequest(BaseModel):
    message: str
    card_headline: str | None = None
    card_summary: str | None = None
    history: list[dict] = []


async def query_ollama(prompt: str, system: str = "") -> str:
    """Call local Ollama instance."""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                OLLAMA_URL,
                json={
                    "model": MODEL,
                    "prompt": prompt,
                    "system": system,
                    "stream": False,
                },
            )
            resp.raise_for_status()
            return resp.json().get("response", "")
    except Exception as e:
        return f"[AI unavailable: {e}]"


@app.post("/api/draft")
async def draft_action(req: DraftRequest):
    system = (
        "You are PoliSwipe, a civic engagement assistant for college students. "
        "Write a short, compelling email draft (under 150 words) from a student to their representative. "
        "Be respectful, specific, and personal. Include the student's perspective as a university student."
    )
    prompt = (
        f"Draft an email to {req.rep} ({req.rep_title}) about: {req.headline}\n\n"
        f"Context: {req.summary}\n\n"
        f"The student is a {req.user_year} {req.user_major} major at the University of Maryland."
    )
    text = await query_ollama(prompt, system)
    return {"draft": text}


@app.post("/api/chat")
async def chat(req: ChatRequest):
    system = (
        "You are PoliSwipe's AI assistant. You help college students understand civic issues. "
        "Keep answers concise (under 100 words), factual, and actionable. "
        "If you mention dates or deadlines, be specific."
    )
    context = ""
    if req.card_headline:
        context = f"Current topic: {req.card_headline}\nDetails: {req.card_summary}\n\n"

    history_text = ""
    for msg in req.history[-4:]:
        role = "Student" if msg.get("role") == "user" else "PoliSwipe"
        history_text += f"{role}: {msg.get('text', '')}\n"

    prompt = f"{context}{history_text}Student: {req.message}\nPoliSwipe:"
    text = await query_ollama(prompt, system)
    return {"reply": text}


@app.get("/health")
async def health():
    return {"status": "ok", "model": MODEL}
