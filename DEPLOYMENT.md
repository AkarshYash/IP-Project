# 🚀 Sahayak Deployment Guide

## Overview
This guide covers deploying the Sahayak BlueCollar AI platform to production.

**Project Structure:**
- **Backend:** FastAPI (Python) — serves API + HTML templates
- **Frontend:** HTML/CSS/JS — embedded in backend templates
- **Database:** SQLite (dev) → PostgreSQL (production)
- **React Frontend:** React + Vite (optional admin dashboard)

---

## 📋 Pre-Deployment Checklist

### 1. Update Environment Variables
Copy `.env.example` to `.env` and fill in production values:

```env
# Required for AI features
GROQ_API_KEY=your_groq_production_key

# Change for production!
JWT_SECRET=generate_secure_random_string_here
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/sahayak_db

# Production settings
DEBUG=false
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 2. Update Dependencies
Ensure all dependencies are listed in `backend/requirements.txt`:
```bash
cd backend
pip install -r requirements.txt
```

### 3. Database Migration
For production, migrate from SQLite to PostgreSQL:
```python
# In backend/app/config.py, update:
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://...")
```

---

## 🌐 Deployment Options

### Option 1: Render (Recommended — Free Tier Available)

**Backend Deployment:**

1. **Create Render Account:** https://render.com

2. **Create New Web Service:**
   - Connect your GitHub repository
   - Root directory: `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Environment: Python 3.11+

3. **Add Environment Variables:**
   - Go to Environment tab
   - Add all variables from `.env.example`
   - Set `DATABASE_URL` to Render PostgreSQL URL

4. **Create PostgreSQL Database:**
   - Dashboard → New → PostgreSQL
   - Copy internal database URL
   - Add to web service as `DATABASE_URL`

5. **Deploy:**
   - Render auto-deploys on git push
   - Get your URL: `https://your-app-name.onrender.com`

**Frontend (if using React):**
1. Deploy react-frontend to Vercel/Netlify
2. Update `NEXT_PUBLIC_API_URL` to point to Render backend URL

---

### Option 2: Railway

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
railway login
```

2. **Initialize Project:**
```bash
cd backend
railway init
```

3. **Add PostgreSQL:**
```bash
railway add
# Select PostgreSQL
```

4. **Set Environment Variables:**
```bash
railway variables set GROQ_API_KEY=your_key
railway variables set JWT_SECRET=your_secret
```

5. **Deploy:**
```bash
railway up
```

---

### Option 3: Fly.io

1. **Install Fly CLI:**
```bash
curl -L https://fly.io/install.sh | sh
fly auth login
```

2. **Create fly.toml:**
```toml
app = "sahayak-bluecollar"

[build]
  builder = "paketobuildpacks/builder:base"
  buildpacks = ["gcr.io/paketo-buildpacks/python"]

[env]
  PORT = "8000"

[[services]]
  internal_port = 8000
  protocol = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port = "80"

  [[services.ports]]
    handlers = ["tls", "http"]
    port = "443"
```

3. **Deploy:**
```bash
cd backend
fly launch
fly deploy
```

---

### Option 4: Docker + Any VPS (DigitalOcean, Linode, AWS EC2)

1. **Build Docker Image:**
```bash
docker build -t sahayak-backend ./backend
```

2. **Run Container:**
```bash
docker run -d \
  -p 8000:8000 \
  -e GROQ_API_KEY=your_key \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=your_secret \
  --name sahayak \
  sahayak-backend
```

3. **Use Docker Compose (recommended):**
```bash
docker-compose up -d
```

---

## 🔒 Production Security Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Set `DEBUG=false`
- [ ] Update `CORS_ORIGINS` to only allow your domain
- [ ] Use PostgreSQL (not SQLite) for production
- [ ] Enable HTTPS (most platforms provide this automatically)
- [ ] Set rate limiting in production
- [ ] Review and secure all API endpoints
- [ ] Add monitoring (Sentry, LogRocket, etc.)
- [ ] Backup database regularly

---

## 📦 GitHub Repository Setup

### Current Repository
Your code is already connected to: https://github.com/AkarshYash/IP-Project.git

### Commit and Push Changes
```bash
cd "c:\Users\chatu\OneDrive\Desktop\IP Project\Blue-Collar-Web-Design-"

# Check status
git status

# Add all changes
git add .

# Commit with message
git commit -m "feat: Complete Sahayak v2.0 - Added all APIs, fixed auth, integrated features"

# Push to GitHub
git push origin main
```

---

## 🔄 CI/CD Setup (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Render

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Render
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
        run: |
          curl -X POST https://api.render.com/v1/services/${{ secrets.RENDER_SERVICE_ID }}/deploys \
            -H "Authorization: Bearer $RENDER_API_KEY"
```

---

## 📊 Post-Deployment Testing

### Health Check
```bash
curl https://your-domain.com/health
# Expected: {"status":"ok","service":"bluecollar-platform"}
```

### API Endpoints to Test
```bash
# Auth
curl -X POST https://your-domain.com/api/auth/login \
  -d "username=admin&password=sahayak2024"

# Workers Search
curl https://your-domain.com/api/workers/search?q=plumber+delhi

# Analytics
curl https://your-domain.com/api/analytics/dashboard
```

### Frontend Access
- Homepage: https://your-domain.com/
- Customer Portal: https://your-domain.com/customer
- Worker Portal: https://your-domain.com/worker
- Admin Portal: https://your-domain.com/admin

---

## 🐛 Troubleshooting

### Issue: 500 Internal Server Error
- Check logs: `railway logs` or Render dashboard
- Verify all environment variables are set
- Check DATABASE_URL is correct

### Issue: Database Connection Failed
- Ensure PostgreSQL is running
- Verify DATABASE_URL format: `postgresql+asyncpg://user:pass@host:port/dbname`
- Check database allows connections from your server IP

### Issue: CORS Errors
- Add your frontend domain to `CORS_ORIGINS` environment variable
- Example: `CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com`

---

## 📞 Support

For issues, contact:
- GitHub Issues: https://github.com/AkarshYash/IP-Project/issues
- Email: [Your Email]

---

**Built by Akarsh Chaturvedi**  
Version 2.0.0 | June 2026
