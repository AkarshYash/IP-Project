# 🚀 Quick Start Guide

## Your Sahayak Platform is Ready!

Both servers are now running:
- **Frontend:** http://localhost:5173 (React UI)
- **Backend:** http://localhost:8000 (FastAPI)
- **API Docs:** http://localhost:8000/docs

---

## ⚡ One-Click Start

**Windows:**
```bash
START_PROJECT.bat
```

This will automatically:
1. Start backend server (Port 8000)
2. Start frontend server (Port 5173)
3. Open browser to http://localhost:5173

---

## 🎮 How to Use

### For Clients (Job Providers)
1. Open http://localhost:5173
2. Default view is "Job Provider" mode
3. **Search for workers:**
   - Type: "Hindi plumber in Noida under 600"
   - Or click microphone icon for voice search
4. View workers on live map
5. Click **"Hire Now"** to book
6. Chat in real-time with workers

### For Workers
1. Toggle to **"Worker"** mode in header
2. View incoming job requests
3. Click **"Accept Job"**
4. Message clients via chat

---

## 🔑 Test Accounts

**Admin Login:**
- Username: `admin`
- Password: `sahayak2024`

**Test Worker ID:**
- W0048 (Veer Karpe - Plumber)
- W0320 (Priyansh Dewan - Plumber)

---

## 🧪 API Testing

### Health Check
```bash
curl http://localhost:8000/health
```

### Search Workers
```bash
curl "http://localhost:8000/api/workers/search?query=electrician"
```

### Create Booking
```bash
curl -X POST http://localhost:8000/api/bookings/ \
  -H "Content-Type: application/json" \
  -d '{
    "worker_id": "W0048",
    "customer_name": "Test User",
    "service": "Plumber",
    "date": "2026-06-15",
    "time": "ASAP",
    "address": "Noida Sector 62",
    "advance_amount": 500
  }'
```

### View All Bookings
```bash
curl http://localhost:8000/api/bookings/
```

---

## 📱 Features to Try

### 🎤 Voice Search
1. Click the microphone button (bottom-right)
2. Speak: "Hindi plumber in Noida"
3. Search populates automatically

### 🗺️ Live Map
- Workers appear as markers on the map
- Click markers to see worker details
- Map centers on Noida by default

### 💬 Real-time Chat
1. Book a worker
2. Chat window opens automatically
3. Send messages, photos, and location
4. Video/voice call buttons ready

### 🌍 Multi-language
1. Click globe icon in header
2. Select from 8 Indian languages:
   - English, Hindi, Punjabi, Gujarati
   - Kannada, Tamil, Telugu, Rajasthani
3. UI translates instantly

---

## 🐛 Troubleshooting

**Backend won't start:**
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

**Frontend won't start:**
```bash
cd react-frontend
npm install
npm run dev
```

**Port already in use:**
- Backend: Change port in command: `--port 8001`
- Frontend: Will auto-assign next available port

**Frontend can't reach backend:**
- Check `.env.local` in react-frontend:
  ```
  VITE_API_URL=http://localhost:8000
  ```

**No workers showing:**
- Ensure `blue_collar_workers_500.csv` exists in project root
- Check backend logs for CSV loading message

---

## 📊 Project Structure

```
Blue-Collar-Web-Design-/
├── backend/                 # Python FastAPI
│   ├── app/
│   │   ├── api/            # 9 API routers
│   │   ├── models/         # Database models
│   │   ├── services/       # ML & AI services
│   │   └── main.py         # Entry point
│   └── requirements.txt
│
├── react-frontend/          # React + TypeScript
│   ├── src/
│   │   ├── components/     # 3 main dashboards
│   │   ├── App.tsx         # Main app
│   │   └── i18n.ts         # Languages
│   └── package.json
│
├── blue_collar_workers_500.csv  # Worker database
├── START_PROJECT.bat            # Auto-start script
└── README.md                    # Full documentation
```

---

## 🌐 Ready to Deploy?

### Frontend → Vercel
```bash
cd react-frontend
npm install -g vercel
vercel
```

### Backend → Render.com
1. Go to https://render.com
2. Connect GitHub repo
3. Create Web Service
4. Root: `backend`
5. Build: `pip install -r requirements.txt`
6. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. Add environment variables:
   - `GROQ_API_KEY`
   - `JWT_SECRET`
   - `DATABASE_URL` (PostgreSQL)

See full deployment guide in **README.md**

---

## 🎉 Everything Working!

Your full-stack Sahayak platform is now:
- ✅ Backend API running (500 workers loaded)
- ✅ Frontend UI running (React + TypeScript)
- ✅ Real-time search working
- ✅ ML scoring active
- ✅ Map integration working
- ✅ Chat system ready
- ✅ Multi-language support active
- ✅ Voice search enabled

**Open http://localhost:5173 and start hiring workers!** 🚀

---

**Need help?** Check README.md or open an issue on GitHub.
