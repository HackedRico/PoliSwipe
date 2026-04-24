# PoliSwipe Backend & Actions

This document covers the full backend stack: the FastAPI server that proxies to Ollama for AI features, the frontend API client that auto-discovers the server on the local network, the action modules (calendar, email, share), and the startup script that launches everything.

---

## Table of Contents

1. [FastAPI Server (`backend/server.py`)](#1-fastapi-server)
2. [Ollama Integration](#2-ollama-integration)
3. [Frontend API Client (`actions/api.ts`)](#3-frontend-api-client)
4. [Calendar Action (`actions/calendar.ts`)](#4-calendar-action)
5. [Email Action (`actions/email.ts`)](#5-email-action)
6. [Share Action (`actions/share.ts`)](#6-share-action)
7. [System Prompts](#7-system-prompts)
8. [Error Handling and Fallback Strategy](#8-error-handling-and-fallback-strategy)
9. [Startup Script (`start.sh`)](#9-startup-script)

---

## 1. FastAPI Server

**File: `backend/server.py`**

The server is a lightweight FastAPI application that acts as a proxy between the React Native frontend and a local Ollama LLM instance. It exposes two AI endpoints (`/api/draft` and `/api/chat`) plus a health check.

### Complete Source

```python
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
```

### Endpoints

| Method | Path          | Purpose                                      | Request Body       | Response         |
|--------|---------------|----------------------------------------------|--------------------|------------------|
| POST   | `/api/draft`  | Generate an AI-drafted email to a rep        | `DraftRequest`     | `{ draft: str }` |
| POST   | `/api/chat`   | Conversational Q&A about a civic issue       | `ChatRequest`      | `{ reply: str }` |
| GET    | `/health`     | Liveness check; returns the active model name | (none)             | `{ status, model }` |

### CORS

The server permits all origins, methods, and headers (`allow_origins=["*"]`). This is necessary because the Expo Go client makes requests from a dynamic LAN IP, so a restrictive allow-list is impractical during development.

---

## 2. Ollama Integration

### The Proxy Pattern

The React Native app cannot call Ollama directly for two reasons:

1. Ollama runs on `localhost:11434` on the development machine. The phone is a separate device on the LAN and cannot reach `localhost` on the Mac.
2. Centralizing AI logic in a Python backend keeps prompts, model selection, and error handling in one place, away from the mobile client.

The architecture is:

```
Phone (Expo Go)  --->  FastAPI (:8000)  --->  Ollama (:11434)
      LAN                  Mac                    Mac
```

The FastAPI server sits on port 8000 with `--host 0.0.0.0` so it is reachable from any device on the LAN. It receives structured requests from the frontend, constructs a prompt, forwards it to Ollama's `/api/generate` endpoint, and returns the plain-text response.

### Model

```python
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.2:latest"
```

- **Ollama URL** -- the default local Ollama API endpoint.
- **Model** -- `llama3.2:latest` is used for text generation. A comment in the source notes that `llava:13b` was considered but is vision-only and not suitable for text tasks.

### `query_ollama` Helper

```python
async def query_ollama(prompt: str, system: str = "") -> str:
```

This async helper is shared by both endpoints. Key details:

- Uses `httpx.AsyncClient` with a **30-second timeout**.
- Sends the payload with `"stream": False` so Ollama returns the full response in a single JSON object rather than streaming tokens.
- Extracts the `"response"` field from Ollama's JSON reply.
- On any exception (network error, timeout, Ollama not running), it returns the string `"[AI unavailable: {e}]"` instead of raising, so the frontend always gets a 200 with a message.

---

## 3. Frontend API Client

**File: `actions/api.ts`**

This module is the frontend's interface to the backend. It handles URL discovery and provides two async functions that mirror the two backend endpoints.

### Complete Source

```typescript
import Constants from 'expo-constants';
import type { Card, ChatMessage } from '@/types';

function getBackendUrl(): string {
  // In Expo Go, debuggerHost gives us the dev machine's LAN IP
  const host = Constants.expoConfig?.hostUri?.split(':')[0]
    ?? Constants.manifest2?.extra?.expoGo?.debuggerHost?.split(':')[0]
    ?? 'localhost';
  return `http://${host}:8000`;
}

export async function fetchAIDraft(card: Card): Promise<string | null> {
  try {
    const resp = await fetch(`${getBackendUrl()}/api/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        headline: card.headline,
        summary: card.summary,
        rep: card.rep,
        rep_title: card.repTitle,
      }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.draft ?? null;
  } catch {
    return null;
  }
}

export async function fetchAIChat(
  message: string,
  card: Card | null,
  history: ChatMessage[],
): Promise<string | null> {
  try {
    const resp = await fetch(`${getBackendUrl()}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        card_headline: card?.headline ?? null,
        card_summary: card?.summary ?? null,
        history: history.slice(-4).map(m => ({ role: m.role, text: m.text })),
      }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.reply ?? null;
  } catch {
    return null;
  }
}
```

### Auto LAN IP Detection (`getBackendUrl`)

The critical problem this solves: the phone needs to know the Mac's LAN IP address to reach the FastAPI server, and that IP changes across networks.

```typescript
function getBackendUrl(): string {
  const host = Constants.expoConfig?.hostUri?.split(':')[0]
    ?? Constants.manifest2?.extra?.expoGo?.debuggerHost?.split(':')[0]
    ?? 'localhost';
  return `http://${host}:8000`;
}
```

The function tries three sources, in order:

1. **`Constants.expoConfig?.hostUri`** -- In current Expo SDK versions, this contains the dev machine's LAN IP and Expo port as `"192.168.x.x:8081"`. Splitting on `:` and taking index 0 extracts just the IP.
2. **`Constants.manifest2?.extra?.expoGo?.debuggerHost`** -- An older/alternate path that Expo Go uses in some SDK versions. Same split logic.
3. **`'localhost'`** -- Final fallback, used when running in a simulator on the same machine.

The extracted IP is combined with port `8000` to produce the backend URL (e.g., `http://192.168.1.42:8000`). This means **zero manual configuration** is required -- as long as the phone and Mac are on the same WiFi network and the backend is running, the frontend will find it automatically.

### `fetchAIDraft`

Calls `POST /api/draft` with the card's headline, summary, rep name, and rep title. Returns the generated email draft as a string, or `null` on any failure.

### `fetchAIChat`

Calls `POST /api/chat` with the user's message, optional card context, and the last 4 messages of conversation history. Returns the AI reply as a string, or `null` on any failure.

Both functions map TypeScript `camelCase` field names (e.g., `repTitle`) to the Python `snake_case` equivalents (e.g., `rep_title`) expected by the Pydantic models.

---

## 4. Calendar Action

**File: `actions/calendar.ts`**

Adds a rally or event from a card to the user's native device calendar using `expo-calendar`.

### Complete Source

```typescript
import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import type { Card } from '@/types';

export async function addRallyToCalendar(card: Card) {
  if (!card.when?.isoStart) return;
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') return;

  let calendarId: string;
  if (Platform.OS === 'ios') {
    const def = await Calendar.getDefaultCalendarAsync();
    calendarId = def.id;
  } else {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const def = calendars.find(c => c.isPrimary) || calendars[0];
    calendarId = def.id;
  }

  await Calendar.createEventAsync(calendarId, {
    title: card.headline,
    startDate: new Date(card.when.isoStart),
    endDate:   new Date(card.when.isoEnd ?? card.when.isoStart),
    location:  card.where?.address,
    notes:     card.summary,
    alarms:    [{ relativeOffset: -30 }],
  });
}
```

### How It Works

1. **Guard** -- If the card has no `when.isoStart` field, the function returns immediately. Not all cards represent timed events.
2. **Permission** -- Requests calendar permission via `Calendar.requestCalendarPermissionsAsync()`. Silently aborts if denied.
3. **Calendar selection** -- Platform-specific logic:
   - **iOS**: Uses `getDefaultCalendarAsync()` which returns the user's default calendar.
   - **Android**: Fetches all event calendars, then picks the primary one (or falls back to the first available).
4. **Event creation** -- Creates the event with:
   - `title` from the card headline.
   - `startDate` and `endDate` from ISO strings on the card (if `isoEnd` is missing, `isoStart` is used for both).
   - `location` from the card's address.
   - `notes` from the card summary.
   - A single alarm set to fire **30 minutes before** the event (`relativeOffset: -30`).

---

## 5. Email Action

**File: `actions/email.ts`**

Opens the user's default mail app with a pre-filled email to their representative.

### Complete Source

```typescript
import * as Linking from 'expo-linking';
import type { Card } from '@/types';

export async function emailRep(card: Card, toAddress = 'rep@example.gov') {
  const subject = encodeURIComponent(`Re: ${card.headline}`);
  const body    = encodeURIComponent(card.draft);
  const url = `mailto:${toAddress}?subject=${subject}&body=${body}`;
  const ok = await Linking.canOpenURL(url);
  if (ok) Linking.openURL(url);
}
```

### How It Works

1. Takes a `Card` and an optional `toAddress` (defaults to `rep@example.gov`).
2. Constructs a `mailto:` URL with the subject line set to `Re: {headline}` and the body set to the AI-generated draft stored on the card.
3. Both subject and body are `encodeURIComponent`-encoded to handle special characters.
4. Checks if the device can open `mailto:` URLs via `Linking.canOpenURL`. If so, opens it, which launches the default mail client (Apple Mail, Gmail, etc.) with the fields pre-populated.

---

## 6. Share Action

**File: `actions/share.ts`**

Shares a card's content through the native OS share sheet (AirDrop, Messages, social media, etc.).

### Complete Source

```typescript
import { Share } from 'react-native';
import type { Card } from '@/types';

export function shareCard(card: Card) {
  return Share.share({
    message: `${card.headline}\n\n${card.summary}\n\nvia PoliSwipe`,
    title: card.headline,
  });
}
```

### How It Works

Uses React Native's built-in `Share` API. The shared message includes the headline, a double-newline, the summary, and a "via PoliSwipe" attribution line. The `title` field is used by some share targets (e.g., email subject lines) on Android.

---

## 7. System Prompts

The backend uses two distinct system prompts depending on the endpoint.

### Draft Prompt (`/api/draft`)

```
You are PoliSwipe, a civic engagement assistant for college students.
Write a short, compelling email draft (under 150 words) from a student to their representative.
Be respectful, specific, and personal. Include the student's perspective as a university student.
```

The user prompt is then constructed as:

```
Draft an email to {rep} ({rep_title}) about: {headline}

Context: {summary}

The student is a {user_year} {user_major} major at the University of Maryland.
```

This produces a ready-to-send email that the student can review and send via the email action.

### Chat Prompt (`/api/chat`)

```
You are PoliSwipe's AI assistant. You help college students understand civic issues.
Keep answers concise (under 100 words), factual, and actionable.
If you mention dates or deadlines, be specific.
```

The user prompt is built dynamically:

1. If a card is attached, a context block is prepended: `Current topic: {headline}\nDetails: {summary}`.
2. The last 4 messages of conversation history are formatted as alternating `Student:` / `PoliSwipe:` lines.
3. The new user message is appended as `Student: {message}`, followed by `PoliSwipe:` to cue the model to respond in character.

The 4-message history window keeps the prompt short enough to stay within the model's context window while preserving enough conversational context for coherent multi-turn dialogue.

---

## 8. Error Handling and Fallback Strategy

The system uses a **graceful degradation** pattern at every layer:

### Backend Layer (`query_ollama`)

```python
except Exception as e:
    return f"[AI unavailable: {e}]"
```

The `query_ollama` function wraps the entire Ollama call in a try/except that catches **all exceptions**. Instead of raising an HTTP error, it returns a bracketed error string. This means both `/api/draft` and `/api/chat` always return HTTP 200 with a text body, even when Ollama is down or the model is not loaded. The frontend can display the message as-is.

### Frontend Layer (`fetchAIDraft`, `fetchAIChat`)

```typescript
catch {
    return null;
}
```

Both frontend API functions wrap their entire fetch call in a try/catch. On any failure (network error, DNS failure, backend unreachable, non-200 status), they return `null`. The UI components that call these functions are expected to check for `null` and either show a fallback message or hide the AI feature.

### Calendar Action

The function silently returns (no-op) if:
- The card has no date information (`!card.when?.isoStart`).
- Calendar permission is not granted.

### Email Action

The function checks `Linking.canOpenURL` before attempting to open the mail client. If the device has no mail app configured, nothing happens.

### Summary of the Fallback Chain

```
Ollama down?       -> Backend returns "[AI unavailable: ...]" string
Backend down?      -> Frontend returns null
Network error?     -> Frontend returns null
No calendar perm?  -> Calendar action silently skips
No mail app?       -> Email action silently skips
```

The app never crashes due to a backend or AI failure. Features degrade gracefully to their non-AI equivalents.

---

## 9. Startup Script

**File: `start.sh`**

A single script that launches both the backend and the Expo dev server, with cleanup, health checks, and coordinated shutdown.

### Complete Source

```bash
#!/bin/bash

echo "=== PoliSwipe Startup ==="

# Kill any existing Expo and backend processes
echo "Cleaning up old processes..."
pkill -f "expo start" 2>/dev/null
pkill -f "uvicorn backend" 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null
lsof -ti:8000 | xargs kill -9 2>/dev/null
sleep 1

# Clear Expo cache
echo "Clearing Expo cache..."
rm -rf .expo

# Start backend
echo "Starting backend on :8000..."
uvicorn backend.server:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
sleep 2

# Check backend health
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
  echo "Backend is healthy"
else
  echo "Warning: Backend may not be connected to Ollama"
fi

# Start Expo
echo "Starting Expo on :8081..."
npx expo start --clear &
EXPO_PID=$!

echo ""
echo "=== Running ==="
echo "Expo:    http://localhost:8081  (PID $EXPO_PID)"
echo "Backend: http://localhost:8000  (PID $BACKEND_PID)"
echo ""
echo "Scan the QR code with Expo Go on your iPhone."
echo "Press Ctrl+C to stop everything."

# Trap Ctrl+C to kill both
trap "echo 'Shutting down...'; kill $BACKEND_PID $EXPO_PID 2>/dev/null; exit" INT TERM
wait
```

### Line-by-Line Explanation

**Lines 3**: Print a startup banner.

**Lines 5-10: Process Cleanup**
```bash
pkill -f "expo start" 2>/dev/null
pkill -f "uvicorn backend" 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null
lsof -ti:8000 | xargs kill -9 2>/dev/null
sleep 1
```
- `pkill -f "expo start"` -- Kills any running Expo dev server by matching the command string.
- `pkill -f "uvicorn backend"` -- Kills any running backend server.
- `lsof -ti:8081 | xargs kill -9` -- As a fallback, finds anything listening on port 8081 (Expo's default) and force-kills it. This catches orphaned processes that `pkill` might miss.
- `lsof -ti:8000 | xargs kill -9` -- Same for port 8000 (the backend).
- `sleep 1` -- Brief pause to let ports be released by the OS.
- All commands redirect stderr to `/dev/null` so "no matching processes" warnings are suppressed.

**Lines 12-13: Cache Clearing**
```bash
rm -rf .expo
```
Removes the `.expo` directory, which contains cached bundle data. This prevents stale-cache issues after code changes.

**Lines 15-18: Backend Launch**
```bash
uvicorn backend.server:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
sleep 2
```
- Starts the FastAPI server via Uvicorn.
- `--host 0.0.0.0` -- Binds to all network interfaces so the phone can reach it over LAN.
- `--port 8000` -- The port the frontend expects.
- `--reload` -- Enables auto-reload on file changes (development convenience).
- `&` -- Backgrounds the process.
- `$!` -- Captures the PID of the backgrounded process for later cleanup.
- `sleep 2` -- Waits for the server to initialize before checking health.

**Lines 20-24: Health Check**
```bash
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
  echo "Backend is healthy"
else
  echo "Warning: Backend may not be connected to Ollama"
fi
```
Sends a silent `GET /health` request. If it succeeds (the server is up), prints a confirmation. If it fails, prints a warning. Note: this checks that the FastAPI server started, not that Ollama itself is running -- a separate step the developer must handle.

**Lines 26-28: Expo Launch**
```bash
npx expo start --clear &
EXPO_PID=$!
```
- Starts the Expo development server with `--clear` to flush its internal cache.
- Backgrounded and PID captured, same as the backend.

**Lines 30-36: Status Output**
Prints the URLs and PIDs of both processes and instructs the developer to scan the QR code with Expo Go.

**Lines 38-39: Coordinated Shutdown**
```bash
trap "echo 'Shutting down...'; kill $BACKEND_PID $EXPO_PID 2>/dev/null; exit" INT TERM
wait
```
- `trap ... INT TERM` -- Registers a signal handler for `Ctrl+C` (SIGINT) and SIGTERM. When triggered, it kills both the backend and Expo processes by their stored PIDs, then exits.
- `wait` -- Blocks the script so it stays alive (and the trap remains active) until `Ctrl+C` is pressed or both child processes exit.

### Usage

```bash
chmod +x start.sh   # first time only
./start.sh
```

Prerequisites:
- Ollama must be running separately (`ollama serve` or the Ollama desktop app).
- The `llama3.2:latest` model must be pulled (`ollama pull llama3.2`).
- Python dependencies must be installed (`pip install fastapi uvicorn httpx`).
- Node dependencies must be installed (`npm install`).
