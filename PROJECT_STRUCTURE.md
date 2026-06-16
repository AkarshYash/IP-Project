# 🏗️ Sahayak Project Structure

## 📁 Directory Architecture

```
Blue-Collar-Web-Design-/
│
├── 📂 backend/                     # FastAPI Backend Server
│   ├── 📂 app/
│   │   ├── 📂 api/                # API Route Handlers
│   │   │   ├── analytics.py       # Analytics endpoints
│   │   │   ├── auth.py            # Authentication & JWT
│   │   │   ├── bookings.py        # Booking management
│   │   │   ├── chatbot.py         # AI Chatbot endpoints
│   │   │   ├── conversations.py   # Messaging system
│   │   │   ├── disputes.py        # Dispute handling
│   │   │   ├── jobs.py            # Job postings
│   │   │   └── workers.py         # Worker profiles
│   │   │
│   │   ├── 📂 models/             # Database Models
│   │   │   ├── database.py        # DB connection
│   │   │   ├── db_models.py       # SQLAlchemy models
│   │   │   └── supabase_models.py # Supabase schemas
│   │   │
│   │   ├── 📂 services/           # Business Logic
│   │   │   ├── chatbot_engine.py  # AI chat logic
│   │   │   ├── intent_classifier.py # NLP intent detection
│   │   │   ├── matching_engine.py  # Job matching algorithm
│   │   │   ├── moderation.py      # Content moderation
│   │   │   ├── resume_parser.py   # Resume analysis
│   │   │   ├── salary_predictor.py # ML salary prediction
│   │   │   ├── supabase_client.py # Supabase integration
│   │   │   ├── translation_service.py # Multi-language support
│   │   │   └── vision_service.py  # Image processing
│   │   │
│   │   ├── 📂 middleware/         # API Middleware
│   │   │   └── rate_limiter.py    # Rate limiting
│   │   │
│   │   ├── config.py              # App configuration
│   │   ├── config_supabase.py     # Supabase config
│   │   └── main.py                # FastAPI app entry point
│   │
│   ├── .env                        # Environment variables
│   ├── .env.example               # Env template
│   ├── requirements.txt           # Python dependencies
│   └── Dockerfile                 # Docker config
│
├── 📂 react-frontend/             # React Frontend (Vite + TypeScript)
│   ├── 📂 public/                 # Static assets
│   ├── 📂 src/
│   │   ├── 📂 components/         # React components
│   │   │   ├── ChatWindow.tsx     # Chat interface
│   │   │   ├── ProviderDashboard.tsx # Provider UI
│   │   │   └── WorkerDashboard.tsx   # Worker UI
│   │   │
│   │   ├── App.tsx                # Main app component
│   │   ├── main.tsx               # React entry point
│   │   └── index.css              # Global styles
│   │
│   ├── package.json               # Node dependencies
│   ├── tsconfig.json              # TypeScript config
│   ├── vite.config.ts             # Vite config
│   ├── tailwind.config.js         # Tailwind CSS config
│   └── vercel.json                # Vercel deployment
│
├── 📂 docs/                       # Documentation
│   ├── FREE_DEPLOYMENT_GUIDE.md   # Deployment instructions
│   ├── ENTERPRISE_UPGRADE_PLAN.md # Future features
│   ├── GET_SUPABASE_KEYS.md      # Supabase setup
│   ├── IMPLEMENTATION_GUIDE.md    # Implementation details
│   ├── QUICK_START.md            # Quick start guide
│   ├── UI_ENHANCEMENTS.md        # UI feature docs
│   └── VOICE_ASSISTANT_GUIDE.md  # Voice feature docs
│
├── .gitignore                     # Git ignore rules
├── LICENSE                        # MIT License
├── README.md                      # Main documentation
├── render.yaml                    # Render.com config
└── PROJECT_STRUCTURE.md          # This file
```

---

## 🎯 Architecture Overview

### **Backend Architecture (FastAPI)**
- **RESTful API** with FastAPI framework
- **PostgreSQL Database** via Supabase
- **JWT Authentication** for secure access
- **Rate Limiting** for API protection
- **Modular Design** with separate API, models, and services

### **Frontend Architecture (React + Vite)**
- **Component-Based** React architecture
- **TypeScript** for type safety
- **Framer Motion** for smooth animations
- **Tailwind CSS** for responsive design
- **Voice Recognition** Web API integration

### **Database Schema (Supabase PostgreSQL)**
- **workers** - Worker profiles and skills
- **bookings** - Job bookings and status
- **jobs** - Job postings from providers
- **conversations** - Chat messages
- **disputes** - Dispute management

---

## 🚀 Tech Stack

### Backend
- FastAPI 0.104.1
- SQLAlchemy 1.4.50
- Supabase 1.0.4
- Uvicorn 0.24.0
- Passlib (bcrypt)

### Frontend
- React 18.x
- Vite 5.x
- TypeScript
- Framer Motion
- Tailwind CSS
- Lucide Icons

### Infrastructure
- **Database:** Supabase (PostgreSQL)
- **Backend Hosting:** Render.com (Free Tier)
- **Frontend Hosting:** Vercel (Free Tier)
- **Version Control:** GitHub

---

## 📦 Key Features

✅ **AI-Powered Chatbot** - Multi-language support (Hindi, Punjabi, etc.)  
✅ **Voice Assistant** - Hands-free job search with live transcription  
✅ **Smart Job Matching** - ML-based worker-job matching algorithm  
✅ **3D Animated UI** - Modern glassmorphism with parallax effects  
✅ **Real-time Chat** - Provider-worker direct messaging  
✅ **Secure Authentication** - JWT-based auth with bcrypt hashing  
✅ **Dispute Management** - Built-in resolution system  
✅ **Analytics Dashboard** - Real-time metrics and insights  
✅ **Multi-language Support** - Auto-translation for regional languages  
✅ **Resume Parser** - AI-powered skill extraction  

---

## 🔐 Security Features

- **Password Hashing:** Bcrypt with salt rounds
- **JWT Tokens:** Secure authentication
- **Rate Limiting:** API abuse prevention
- **CORS Protection:** Controlled cross-origin access
- **Input Validation:** Pydantic models
- **SQL Injection Protection:** SQLAlchemy ORM

---

## 📝 Code Quality Standards

- **Type Safety:** TypeScript for frontend, Pydantic for backend
- **Modular Design:** Separation of concerns
- **Error Handling:** Comprehensive try-catch blocks
- **API Documentation:** Auto-generated Swagger docs at `/docs`
- **Environment Variables:** Secure config management
- **Git Workflow:** Feature branches and clean commits

---

## 🎨 Design Patterns

- **MVC Architecture:** Model-View-Controller separation
- **Repository Pattern:** Database abstraction layer
- **Service Layer:** Business logic separation
- **Middleware Pattern:** Request/response processing
- **Component Pattern:** Reusable React components
- **Singleton Pattern:** Database connection management

---

**Created by:** Akarsh Chaturvedi  
**Version:** 2.0.0  
**Last Updated:** June 16, 2026
