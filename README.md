# 🔧 Sahayak - AI-Powered Blue-Collar Job Platform

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688.svg)
![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791.svg)

**Connecting skilled workers with opportunities through AI-powered matching and voice assistance**

[Live Demo](#) • [Documentation](./docs/) • [Quick Start](./docs/QUICK_START.md) • [Deployment](./docs/FREE_DEPLOYMENT_GUIDE.md)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Sahayak** is a comprehensive AI-powered platform designed to bridge the gap between blue-collar workers and service providers. Built with modern technologies, it features intelligent job matching, multi-language support, voice-based search, and real-time communication.

### 🎯 Problem It Solves

- **Language Barriers**: Multi-language support with auto-translation (Hindi, Punjabi, Tamil, etc.)
- **Digital Literacy**: Voice assistant for hands-free job search
- **Trust & Safety**: Built-in verification, ratings, and dispute resolution
- **Job Matching**: AI-powered matching based on skills, location, and preferences
- **Accessibility**: 3D animated, intuitive UI designed for all users

---

## ✨ Key Features

### 🤖 AI & Intelligence
- **Smart Job Matching** - ML-based algorithm matching workers with suitable jobs
- **AI Chatbot** - Multi-language conversational assistant
- **Voice Assistant** - Hands-free search with live transcription and audio visualization
- **Resume Parser** - Automated skill extraction from resumes
- **Salary Predictor** - ML-based salary recommendations

### 💬 Communication
- **Real-time Chat** - Direct messaging between workers and providers
- **Multi-language Support** - Auto-translation for 10+ Indian languages
- **Voice Input** - Speech recognition for text input

### 🎨 User Experience
- **3D Animated UI** - Framer Motion animations with parallax effects
- **Glassmorphism Design** - Modern, clean interface with backdrop blur
- **Responsive Layout** - Mobile-first design approach
- **Audio Visualizer** - Real-time voice input feedback

### 🔐 Security & Trust
- **JWT Authentication** - Secure token-based authentication
- **Password Encryption** - Bcrypt hashing with salt rounds
- **Rate Limiting** - API abuse prevention
- **Dispute Management** - Built-in resolution system
- **Worker Verification** - Multi-step verification process

### 📊 Business Features
- **Analytics Dashboard** - Real-time metrics and insights
- **Booking Management** - Complete job lifecycle tracking
- **Payment Integration** - Ready for payment gateway integration
- **Review System** - Ratings and feedback mechanism

---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI 0.104.1
- **Database**: PostgreSQL (via Supabase)
- **ORM**: SQLAlchemy 1.4.50
- **Authentication**: JWT with Passlib (bcrypt)
- **Server**: Uvicorn (ASGI)
- **Language Detection**: langdetect 1.0.9

### Frontend
- **Framework**: React 18.x with TypeScript
- **Build Tool**: Vite 5.x
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **3D Effects**: React Parallax Tilt
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Infrastructure
- **Database Hosting**: Supabase (PostgreSQL)
- **Backend Hosting**: Render.com (Free Tier)
- **Frontend Hosting**: Vercel (Free Tier)
- **Version Control**: GitHub
- **CI/CD**: GitHub Actions + Render Auto-Deploy

---

## 📁 Project Structure

```
sahayak/
│
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/               # API endpoints
│   │   ├── models/            # Database models
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Custom middleware
│   │   └── main.py            # FastAPI app
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile             # Docker configuration
│
├── react-frontend/            # React Frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── App.tsx           # Main app
│   │   └── main.tsx          # Entry point
│   ├── package.json          # Node dependencies
│   └── vite.config.ts        # Vite configuration
│
├── docs/                      # Documentation
│   ├── FREE_DEPLOYMENT_GUIDE.md
│   ├── QUICK_START.md
│   ├── VOICE_ASSISTANT_GUIDE.md
│   └── ...
│
├── README.md                  # This file
├── LICENSE                    # MIT License
├── PROJECT_STRUCTURE.md      # Detailed architecture
└── render.yaml               # Render deployment config
```

For detailed architecture, see [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL (or Supabase account)

### 1. Clone Repository
```bash
git clone https://github.com/AkarshYash/IP-Project.git
cd IP-Project
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run server
uvicorn app.main:app --reload
```

Backend will run at `http://localhost:8000`

### 3. Frontend Setup
```bash
cd react-frontend

# Install dependencies
npm install

# Configure environment
# Create .env file with: VITE_API_URL=http://localhost:8000

# Run development server
npm run dev
```

Frontend will run at `http://localhost:5173`

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 🌐 Deployment

### Free Hosting (No Credit Card Required)

**Backend**: Deploy to Render.com
**Frontend**: Deploy to Vercel
**Database**: Use Supabase

See detailed guide: [docs/FREE_DEPLOYMENT_GUIDE.md](./docs/FREE_DEPLOYMENT_GUIDE.md)

### Quick Deploy Commands

**Backend (Render)**:
```bash
# Render auto-deploys from GitHub
# Just push to main branch
git push origin main
```

**Frontend (Vercel)**:
```bash
cd react-frontend
vercel --prod
```

---

## 📚 Documentation

- **[Quick Start Guide](./docs/QUICK_START.md)** - Get started in 5 minutes
- **[Deployment Guide](./docs/FREE_DEPLOYMENT_GUIDE.md)** - Free hosting setup
- **[Voice Assistant Guide](./docs/VOICE_ASSISTANT_GUIDE.md)** - Voice feature documentation
- **[UI Enhancements](./docs/UI_ENHANCEMENTS.md)** - UI/UX features
- **[Implementation Guide](./docs/IMPLEMENTATION_GUIDE.md)** - Technical implementation
- **[Enterprise Plan](./docs/ENTERPRISE_UPGRADE_PLAN.md)** - Future roadmap
- **[Project Structure](./PROJECT_STRUCTURE.md)** - Architecture overview

---

## 🎯 Use Cases

### For Workers
- Find jobs matching their skills
- Communicate in their preferred language
- Use voice search for easy access
- Track bookings and earnings
- Build reputation through ratings

### For Service Providers
- Post job requirements
- Find verified skilled workers
- Manage bookings and payments
- Track worker performance
- Resolve disputes efficiently

---

## 🔧 Configuration

### Environment Variables

**Backend (.env)**:
```env
DATABASE_URL=postgresql://user:password@host:5432/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
JWT_SECRET=your-secret-key
```

**Frontend (.env)**:
```env
VITE_API_URL=https://your-backend.onrender.com
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd react-frontend
npm run test
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 👨‍💻 Author

**Akarsh Chaturvedi**

- GitHub: [@AkarshYash](https://github.com/AkarshYash)
- Project: [Sahayak Platform](https://github.com/AkarshYash/IP-Project)

---

## 🙏 Acknowledgments

- FastAPI for the excellent Python web framework
- React team for the amazing frontend library
- Supabase for the PostgreSQL hosting
- Render & Vercel for free hosting tiers
- All contributors and users of this platform

---

## 📞 Support

For support, email [support@sahayak.com](mailto:support@sahayak.com) or open an issue on GitHub.

---

<div align="center">

**⭐ Star this repo if you find it useful!**

Made with ❤️ in India

</div>
