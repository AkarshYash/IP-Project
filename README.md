# 🤖 Sahayak — BlueCollar AI Chatbot v2

> Advanced AI-powered multi-lingual chatbot for the BlueCollar job platform.  
> Built by **Akarsh Chaturvedi**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?logo=tailwindcss)](https://tailwindcss.com)
[![LLM](https://img.shields.io/badge/LLM-Llama%203%2070B-orange)](https://groq.com)

---

## ✨ What's New in v2

### Frontend (React + Tailwind CSS)
- **Full SPA** with React Router — Dashboard, Chat, Analytics, Sessions, Disputes, Fraud, Workers, Settings
- **Dark / Light mode** with system preference detection
- **Real-time analytics dashboard** with Recharts (area charts, bar charts, pie charts, radial charts)
- **Advanced chat UI** — markdown rendering, voice input/output, quick replies, typing indicators, feedback
- **WebSocket-first** with automatic REST fallback
- **Session management table** with pagination, search, and filters
- **Dispute management** — expandable cards with approve/refund/reject actions
- **Fraud detection panel** — risk-scored alerts with suspend/resolve actions
- **Worker management** — verification queue with approve/reject
- **Settings page** — all config in one place with live toggles
- **Toast notifications** via react-hot-toast
- **Responsive design** — works on mobile, tablet, desktop

### Backend (FastAPI)
- **Analytics API** (`/api/analytics/dashboard`) — KPIs, hourly messages, GMV, intent distribution
- **JWT Authentication** (`/api/auth/login`, `/api/auth/me`)
- **Conversation history API** (`/api/conversations/`) — list & retrieve stored conversations
- **DB persistence** — every message now saved to PostgreSQL/SQLite
- **Prometheus metrics** (`/metrics`) — request counts, response times, active sessions
- **Public config endpoint** (`/api/config`) — feature flags for frontend
- **Request timing middleware** — `X-Process-Time` header on every response
- **Health check** (`/health`) — checks DB, Redis, LLM, RAG status

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (v2)                      │
│  Dashboard · Chat · Analytics · Sessions · Disputes · More  │
│  Tailwind CSS · Recharts · React Router · Framer Motion     │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST + WebSocket
┌──────────────────────▼──────────────────────────────────────┐
│                   FastAPI Backend (v2)                       │
│  /api/chatbot  /api/analytics  /api/auth  /api/conversations│
│  Rate Limiter · JWT Auth · CORS · Prometheus Metrics        │
└──────┬──────────────┬──────────────┬──────────────┬─────────┘
       │              │              │              │
  ┌────▼────┐   ┌─────▼─────┐  ┌───▼───┐   ┌─────▼──────┐
  │ Groq    │   │ Pinecone  │  │ Redis │   │ PostgreSQL │
  │ Llama 3 │   │ RAG Index │  │ Cache │   │ / SQLite   │
  └─────────┘   └───────────┘  └───────┘   └────────────┘
       │
  ┌────▼──────────────────────────────────────────────────┐
  │  Channels: WhatsApp · SMS · Telegram · Voice IVR      │
  └───────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Option 1 — Docker Compose (recommended)

```bash
# 1. Clone and configure
cp .env.example .env
# Edit .env with your API keys

# 2. Start everything
docker compose up --build

# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2 — Local Development

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:3000
```

---

## 🔑 API Keys (all optional — graceful fallback)

| Service    | Env Var            | Purpose                        | Get it at                    |
|------------|--------------------|--------------------------------|------------------------------|
| Groq       | `GROQ_API_KEY`     | Llama 3 70B LLM                | console.groq.com             |
| Pinecone   | `PINECONE_API_KEY` | Vector search / RAG            | pinecone.io                  |
| Twilio     | `TWILIO_*`         | WhatsApp / SMS / Voice         | twilio.com                   |
| Telegram   | `TELEGRAM_BOT_TOKEN`| Telegram bot                  | @BotFather on Telegram       |

---

## 📡 API Reference

### Chat
| Method | Endpoint                        | Description                    |
|--------|---------------------------------|--------------------------------|
| POST   | `/api/chatbot/message`          | Send a chat message            |
| WS     | `/api/chatbot/ws/{user_id}`     | Real-time WebSocket chat       |
| POST   | `/api/chatbot/feedback`         | Submit thumbs up/down          |
| POST   | `/api/chatbot/whatsapp`         | Twilio WhatsApp webhook        |
| POST   | `/api/chatbot/sms`              | Twilio SMS webhook             |
| POST   | `/api/chatbot/voice/ivr`        | Twilio Voice IVR               |

### Analytics
| Method | Endpoint                        | Description                    |
|--------|---------------------------------|--------------------------------|
| GET    | `/api/analytics/dashboard`      | Full dashboard payload         |
| GET    | `/api/analytics/sessions/recent`| Recent conversations           |

### Auth
| Method | Endpoint                        | Description                    |
|--------|---------------------------------|--------------------------------|
| POST   | `/api/auth/login`               | Get JWT token                  |
| GET    | `/api/auth/me`                  | Current user info              |

### Conversations
| Method | Endpoint                                    | Description              |
|--------|---------------------------------------------|--------------------------|
| GET    | `/api/conversations/`                       | List conversations       |
| GET    | `/api/conversations/{id}/messages`          | Get messages             |

### System
| Method | Endpoint    | Description                    |
|--------|-------------|--------------------------------|
| GET    | `/health`   | Health check (DB, Redis, LLM)  |
| GET    | `/metrics`  | Prometheus metrics             |
| GET    | `/api/config`| Public feature flags          |
| GET    | `/docs`     | Swagger UI                     |

---

## 🌐 Supported Channels

| Channel    | Protocol       | Features                                    |
|------------|----------------|---------------------------------------------|
| Web        | REST + WS      | Full UI, voice, markdown, quick replies     |
| WhatsApp   | Twilio webhook | Text, media, 100+ languages                 |
| SMS        | Twilio webhook | Keyword commands for basic phones           |
| Telegram   | Bot API        | Commands, keyboard, voice messages          |
| Voice IVR  | Twilio TwiML   | DTMF menu, TTS responses                    |

---

## 🧠 AI Pipeline

```
User Message
    │
    ▼
Language Detection (langdetect)
    │
    ▼
Translation to English (deep-translator)
    │
    ▼
Content Moderation + PII Masking
    │
    ▼
Intent Classification (rule-based, 16 intents)
    │
    ├── Known intent → Action Handler (structured response)
    │
    └── Unknown intent → RAG Context Retrieval (Pinecone)
                              │
                              ▼
                         LLM (Llama 3 70B via Groq)
                              │
                              ▼
                    Translate back to user language
                              │
                              ▼
                    Persist to DB + Save session
```

---

## 🔒 Security Features

- **JWT authentication** for admin endpoints
- **Rate limiting** — 100 req/min per IP (Redis sliding window)
- **Content moderation** — blocks harmful intent, profanity (EN + HI)
- **PII masking** — Aadhaar, PAN, card numbers, bank accounts
- **CORS** — configurable allowed origins
- **Input validation** — Pydantic v2 schemas on all endpoints

---

## 📊 Monitoring

- **Prometheus metrics** at `/metrics`
- **Health check** at `/health` — checks DB, Redis, LLM, RAG
- **Request timing** — `X-Process-Time` header on every response
- **Structured logging** — JSON-compatible with timestamps

---

## 🗂️ Project Structure

```
bluecollar-chatbot/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chatbot.py          # Chat, WebSocket, Twilio webhooks
│   │   │   ├── analytics.py        # Dashboard KPIs & charts data
│   │   │   ├── auth.py             # JWT login & user info
│   │   │   └── conversations.py    # Conversation history
│   │   ├── services/
│   │   │   ├── chatbot_engine.py   # Core orchestration
│   │   │   ├── intent_classifier.py
│   │   │   ├── action_handlers.py  # 16 intent handlers
│   │   │   ├── rag_service.py      # Pinecone + keyword fallback
│   │   │   ├── translation_service.py
│   │   │   ├── moderation.py
│   │   │   ├── sms_chatbot.py
│   │   │   └── telegram_bot.py
│   │   ├── models/
│   │   │   ├── database.py
│   │   │   └── db_models.py
│   │   ├── middleware/
│   │   │   └── rate_limiter.py
│   │   └── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/             # Sidebar, Topbar, AppLayout
│   │   │   ├── chat/               # MessageBubble, TypingIndicator, ChatInput
│   │   │   └── ChatbotWidget.jsx   # Floating chat bubble
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # KPIs + charts
│   │   │   ├── ChatPage.jsx        # Full-screen chat
│   │   │   ├── AnalyticsPage.jsx   # Deep analytics
│   │   │   ├── SessionsPage.jsx    # Session table
│   │   │   ├── DisputesPage.jsx    # Dispute management
│   │   │   ├── FraudPage.jsx       # Fraud alerts
│   │   │   ├── WorkersPage.jsx     # Worker management
│   │   │   └── SettingsPage.jsx    # Configuration
│   │   ├── hooks/
│   │   │   ├── useChat.js          # WebSocket + REST chat hook
│   │   │   └── useAnalytics.js     # Analytics polling hook
│   │   ├── context/
│   │   │   └── AppContext.jsx      # Theme, user, notifications
│   │   └── main.jsx                # Router + providers
│   ├── tailwind.config.js
│   └── package.json
│
└── docker-compose.yml
```

=## 🎥 Video Demo

<div align="center">
  <a href="https://drive.google.com/file/d/1Q45-azblnJQ6QVOnnhaSdGOoDT4tVv4U/view?usp=sharing" target="_blank">
    <img src="https://via.placeholder.com/1280x720/0a0a0f/ffffff?text=🎬+SAHAYAK+v2+DEMO+▶" 
         alt="Sahayak Demo Video Thumbnail"
         style="border-radius: 16px; border: 1px solid #2d2d3d; box-shadow: 0 20px 40px rgba(0,0,0,0.3); max-width: 100%; transition: transform 0.2s;"
         onmouseover="this.style.transform='scale(1.02)'"
         onmouseout="this.style.transform='scale(1)'">
  </a>
</div>

<div align="center">
  <br>
  <a href="https://drive.google.com/file/d/1Q45-azblnJQ6QVOnnhaSdGOoDT4tVv4U/view?usp=sharing" target="_blank">
    <img src="https://img.shields.io/badge/Google_Drive-Watch_Demo-4285F4?style=for-the-badge&logo=googledrive&logoColor=white" alt="Google Drive">
  </a>
  &nbsp;&nbsp;
  <a href="https://drive.google.com/file/d/1Q45-azblnJQ6QVOnnhaSdGOoDT4tVv4U/view?usp=sharing" target="_blank">
    <img src="https://img.shields.io/badge/Direct_Link-Click_Here-00C853?style=for-the-badge&logo=link&logoColor=white" alt="Direct Link">
  </a>
</div>

<div align="center">
  <br>
  <details>
    <summary><b>📋 Demo Chapters (Click to expand)</b></summary>
    <br>
    <table>
      <tr><td>⏱️ 0:00 - 0:45</td><td>Dashboard & KPIs overview</td></tr>
      <tr><td>⏱️ 0:45 - 2:30</td><td>Real-time chat with Llama 3 70B</td></tr>
      <tr><td>⏱️ 2:30 - 3:15</td><td>Analytics dashboard (charts & metrics)</td></tr>
      <tr><td>⏱️ 3:15 - 4:00</td><td>Fraud detection & Worker management</td></tr>
      <tr><td>⏱️ 4:00 - 4:45</td><td>Dark mode & Settings</td></tr>
      <tr><td>⏱️ 4:45 - 5:30</td><td>Mobile responsiveness demo</td></tr>
    </table>
  </details>
</div>

---

## 📝 License

MIT © Akarsh Chaturvedi
