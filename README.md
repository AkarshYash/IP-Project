# 🔧 Sahayak — AI-Powered Blue-Collar Workforce Platform

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Python](https://img.shields.io/badge/Python-3.11+-green)
![React](https://img.shields.io/badge/React-19.2-61dafb)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688)
![License](https://img.shields.io/badge/license-MIT-orange)

**Modern full-stack platform connecting skilled blue-collar workers with clients using AI, ML, and real-time communication.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [API Docs](#-api-documentation) • [Deployment](#-deployment)

</div>

---

## 📋 Overview

**Sahayak** is a production-ready, AI-powered marketplace for India's blue-collar workforce. The platform enables:

- **Clients** to find and hire skilled workers (plumbers, electricians, carpenters, etc.) using intelligent search
- **Workers** to receive job requests, accept bookings, and manage their profiles
- **Real-time communication** between clients and workers via an integrated chat system
- **AI-powered matching** using ML scoring algorithms and NLP query parsing
- **Multi-language support** for 8 Indian regional languages

---

## ✨ Features

### 🎯 For Job Providers (Clients)
- **Smart Search** — Natural language processing understands queries like "Hindi-speaking plumber in Noida under ₹600"
- **AI Match Scoring** — ML algorithm scores workers 0-100% based on skill, budget, rating, distance, and availability
- **Live Map** — Leaflet integration showing nearby workers in real-time
- **Voice Search** — Speech-to-text search in Hindi/English
- **Worker Profiles** — View ratings, reviews, experience, languages, and pricing
- **Instant Booking** — Book workers with advance payment and escrow protection
- **Real-time Chat** — Message workers, share location, send photos

### 👷 For Workers
- **Job Dashboard** — View incoming job requests in real-time
- **One-tap Accept** — Accept jobs and start communication instantly
- **Earnings Tracker** — Monitor daily earnings and completed jobs
- **Profile Management** — Update skills, languages, and availability
- **Verification** — Blockchain-simulated identity verification badges
- **Skill Quiz** — AI-generated quizzes to earn certification badges

### 🤖 AI & ML Features
- **NLP Query Parser** — Extracts skill, budget, language, and location from natural text
- **ML Match Scoring** — Weighted algorithm (40% skill + 20% budget + 15% rating + 15% distance + 10% other)
- **Success Probability** — Sigmoid classifier predicting job completion likelihood
- **Price Prediction** — Linear regression for fair pricing estimates
- **Semantic Search** — Synonym mapping (e.g., "pipe leak" → "plumber")
- **Multi-language Detection** — Auto-translates UI into Hindi, Gujarati, Punjabi, Bengali, Tamil, Telugu, Kannada, Marathi

### 💬 Communication
- **Real-time Chat** — WebSocket-ready messaging system
- **Location Sharing** — Live GPS coordinates with map preview
- **Photo Sharing** — Upload images for job requirements
- **Video/Voice Call UI** — Ready for integration with WebRTC

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19.2** | UI framework with hooks and modern patterns |
| **TypeScript** | Type-safe development |
| **Vite 8.0** | Lightning-fast build tool |
| **TailwindCSS 4.3** | Utility-first styling |
| **Framer Motion** | Smooth animations and transitions |
| **React Router** | Client-side routing |
| **Axios** | HTTP client for API requests |
| **Leaflet** | Interactive maps with real-time markers |
| **i18next** | Internationalization (8 languages) |
| **Lucide Icons** | Modern icon library |

### Backend
| Technology | Purpose |
|---|---|
| **Python 3.11+** | Core language |
| **FastAPI 0.111** | High-performance async API framework |
| **Pydantic** | Data validation and serialization |
| **SQLAlchemy** | ORM for database operations |
| **SQLite** | Development database (PostgreSQL for production) |
| **aiosqlite** | Async SQLite driver |
| **Groq API** | LLM inference (Llama 3) for chatbot |
| **JWT** | Authentication tokens |
| **bcrypt** | Password hashing |

### AI & ML
| Component | Implementation |
|---|---|
| **NLP Parser** | Custom Python regex + keyword extraction |
| **Match Scoring** | Weighted multi-criteria algorithm |
| **Price Regression** | Linear regression: `price = base + (exp × 15) + (rating × 45) ± city_index` |
| **Success Probability** | Sigmoid: `P = 1 / (1 + e^(-(1.8×rating + 0.12×exp + 0.005×reviews - 0.25×distance - 7.5)))` |
| **Synonym Mapping** | Manual dictionary for Indian context (e.g., "bijli" → "electrician") |
| **Language Detection** | langdetect library with deep-translator |

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.11+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))

### Installation

```bash
# Clone repository
git clone https://github.com/AkarshYash/IP-Project.git
cd IP-Project/Blue-Collar-Web-Design-

# Backend setup
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
cd ..

# Frontend setup
cd react-frontend
npm install
cd ..
```

### Running the Project

**Option 1: Auto-Start (Windows)**
```bash
START_PROJECT.bat
```

**Option 2: Manual Start**

Terminal 1 — Backend:
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Terminal 2 — Frontend:
```bash
cd react-frontend
npm run dev
```

### Access the Application

- **Frontend UI:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

---

## 🎮 Usage Guide

### For Clients (Job Providers)

1. Open http://localhost:5173
2. Toggle to **"Job Provider"** mode (default)
3. Search for workers:
   - Type: "Hindi plumber in Noida under ₹600"
   - Or use voice search button (bottom-right)
4. View workers on the live map
5. Click "Hire Now" to book a worker
6. Chat with the worker in real-time

### For Workers

1. Toggle to **"Worker"** mode in header
2. View incoming job requests
3. See job details (service, location, pay)
4. Click "Accept Job" to take the assignment
5. Message the client via chat

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000
```

### Authentication Endpoints

#### POST `/api/auth/login`
```json
{
  "username": "admin",
  "password": "sahayak2024"
}
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "username": "admin",
    "email": "admin@sahayak.ai",
    "role": "admin"
  }
}
```

### Worker Endpoints

#### GET `/api/workers/search?query={query}`
Search workers with natural language.

Example:
```bash
GET /api/workers/search?query=Hindi%20electrician%20Noida%20under%20500
```

Response:
```json
{
  "workers": [
    {
      "id": "W0048",
      "name": "Veer Karpe",
      "skill": "Electrician",
      "rating": 4.8,
      "price": 450,
      "distance": "1.2km",
      "match_score": 95,
      "success_rate": 87,
      "languages": ["Hindi", "English"],
      "available": true
    }
  ],
  "total": 47,
  "extracted_params": {
    "skill": "electrician",
    "budget": 500,
    "language": "Hindi"
  }
}
```

### Booking Endpoints

#### POST `/api/bookings/`
Create a new booking.

```json
{
  "worker_id": "W0048",
  "customer_id": "C-DEMO",
  "customer_name": "Anjali Sharma",
  "service": "Plumber",
  "date": "2026-06-15",
  "time": "ASAP",
  "address": "Sector 62, Noida",
  "advance_amount": 500
}
```

#### GET `/api/bookings/`
List all bookings.

#### POST `/api/bookings/{booking_id}/accept`
Worker accepts a booking.

### Full API Documentation
Visit http://localhost:8000/docs for interactive Swagger documentation.

---

## 🗂️ Project Structure

```
Blue-Collar-Web-Design-/
│
├── backend/                          # Python FastAPI backend
│   ├── app/
│   │   ├── api/                      # API route handlers
│   │   │   ├── auth.py              # Login, register, JWT
│   │   │   ├── workers.py           # Worker search, ML scoring
│   │   │   ├── bookings.py          # Booking management
│   │   │   ├── chatbot.py           # AI chatbot with RAG
│   │   │   ├── jobs.py              # Job postings
│   │   │   ├── analytics.py         # Dashboard KPIs
│   │   │   ├── disputes.py          # Dispute resolution
│   │   │   └── conversations.py     # Chat history
│   │   ├── models/
│   │   │   ├── database.py          # SQLAlchemy setup
│   │   │   └── db_models.py         # Database models
│   │   ├── services/
│   │   │   ├── matching_engine.py   # ML scoring algorithms
│   │   │   ├── chatbot_engine.py    # LLM integration
│   │   │   ├── translation_service.py # Multi-language
│   │   │   └── supabase_client.py   # External auth
│   │   ├── middleware/
│   │   │   └── rate_limiter.py      # API rate limiting
│   │   ├── main.py                  # FastAPI app entry point
│   │   └── config.py                # App configuration
│   ├── requirements.txt             # Python dependencies
│   ├── .env                         # Environment variables (gitignored)
│   └── sahayak.db                   # SQLite database
│
├── react-frontend/                   # React + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProviderDashboard.tsx # Client UI
│   │   │   ├── WorkerDashboard.tsx   # Worker UI
│   │   │   └── ChatWindow.tsx        # Real-time chat
│   │   ├── lib/
│   │   │   └── utils.ts              # Helper functions
│   │   ├── assets/                   # Images, icons
│   │   ├── App.tsx                   # Main app component
│   │   ├── main.tsx                  # React entry point
│   │   ├── i18n.ts                   # Language configuration
│   │   └── index.css                 # Global styles
│   ├── public/
│   │   └── favicon.svg
│   ├── package.json                  # Node dependencies
│   ├── vite.config.ts               # Vite configuration
│   ├── tsconfig.json                # TypeScript config
│   └── .env.local                   # Frontend env variables
│
├── blue_collar_workers_500.csv       # 500 worker profiles database
├── START_PROJECT.bat                 # One-click startup script
├── .gitignore                        # Git ignore rules
├── LICENSE                           # MIT License
└── README.md                         # This file
```

---

## 🌍 Deployment

### Frontend Deployment (Vercel)

1. **Connect GitHub repo to Vercel:**
   ```bash
   cd react-frontend
   npm install -g vercel
   vercel
   ```

2. **Configure build settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variable: `VITE_API_URL=https://your-backend-url.com`

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Backend Deployment (Render.com)

1. **Create new Web Service** on [Render.com](https://render.com)

2. **Connect GitHub repository**

3. **Configure:**
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Environment Variables:**
   ```
   GROQ_API_KEY=your_groq_key
   JWT_SECRET=your_random_secret
   DATABASE_URL=postgresql+asyncpg://...
   DEBUG=false
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```

5. **Add PostgreSQL database** (optional, for production)

### Alternative Deployment Options
- **Railway** — Full-stack deployment
- **Fly.io** — Global edge deployment
- **AWS EC2 + S3** — Complete control
- **Docker** — Containerized deployment

---

## 🔐 Environment Variables

### Backend (`.env`)
```env
# LLM API
GROQ_API_KEY=your_groq_api_key_here

# Database
DATABASE_URL=sqlite+aiosqlite:///./sahayak.db

# Auth
JWT_SECRET=your_secure_random_string
JWT_EXPIRE_MINUTES=1440

# Optional
GEMINI_API_KEY=for_google_ai
REDIS_URL=redis://localhost:6379
```

### Frontend (`.env.local`)
```env
VITE_API_URL=http://localhost:8000
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### API Manual Testing
```bash
# Health check
curl http://localhost:8000/health

# Search workers
curl "http://localhost:8000/api/workers/search?query=plumber"

# Create booking
curl -X POST http://localhost:8000/api/bookings/ \
  -H "Content-Type: application/json" \
  -d '{"worker_id":"W0048","customer_name":"Test",...}'
```

### Frontend Testing
```bash
cd react-frontend
npm run lint
npm run build  # Test production build
```

---

## 📊 Database Schema

### Users
- id, username, email, hashed_password, role, is_active, created_at, last_login

### Bookings
- id, worker_id, customer_id, service, date, time, address, advance_amount, status, created_at

### Conversations
- id, session_id, language, channel, intent_summary, is_active, created_at, updated_at

### Messages
- id, conversation_id, role, content, intent, confidence, response_time_ms, feedback, created_at

### Workers (CSV-based)
- worker_id, full_name, designation, rating, reviews_count, hourly_rate_inr, experience_years, mobile_number, state, city, languages_known, payment_method, availability, profile_summary

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Akarsh Chaturvedi**

- GitHub: [@AkarshYash](https://github.com/AkarshYash)
- Repository: [IP-Project](https://github.com/AkarshYash/IP-Project)

---

## 🙏 Acknowledgments

- **Groq** for blazing-fast LLM inference
- **Leaflet** for interactive maps
- **TailwindCSS** for beautiful styling
- **FastAPI** for modern Python APIs
- **React** team for the amazing framework

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Email: [your-email@example.com]

---

**Made with ❤️ for India's Blue-Collar Workforce**
