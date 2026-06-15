# 🔗 Deployment Links & Instructions

## Quick Deploy Links (Click to Start)

### Backend (Render.com)
**Deploy Backend Now:** https://dashboard.render.com/select-repo?type=web

**Settings to use:**
```
Repository: AkarshYash/IP-Project
Branch: main
Root Directory: backend
Runtime: Python 3
Build Command: pip install -r requirements.txt  
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Frontend (Vercel)
**Deploy Frontend Now:** https://vercel.com/new

**Settings to use:**
```
Repository: AkarshYash/IP-Project
Root Directory: react-frontend
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

---

## Step-by-Step Guide

### 1️⃣ Deploy Backend (5 minutes)

#### Go to Render:
https://render.com

#### Steps:
1. **Sign up** with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect repo: **AkarshYash/IP-Project**
4. Configure:
   - Name: `sahayak-api`
   - Root: `backend`
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables:
   ```
   DEBUG=false
   JWT_SECRET=sahayak-jwt-secret-2026
   CORS_ORIGINS=*
   DATABASE_URL=sqlite+aiosqlite:///./sahayak.db
   ```
6. Click **"Create Web Service"**
7. Wait 3-5 minutes
8. Copy your URL: `https://your-app.onrender.com`

#### Test:
```
https://your-app.onrender.com/health
```
Should return: `{"status":"ok","service":"sahayak-api"}`

---

### 2️⃣ Deploy Frontend (3 minutes)

#### Go to Vercel:
https://vercel.com

#### Steps:
1. **Sign up** with GitHub
2. Click **"Add New Project"**
3. Import: **AkarshYash/IP-Project**
4. Configure:
   - Root: `react-frontend`
   - Framework: `Vite`
   - Build: `npm run build`
5. Add environment variable:
   ```
   VITE_API_URL=https://your-render-url.onrender.com
   ```
   ⚠️ Use your actual Render URL from step 1
6. Click **"Deploy"**
7. Wait 2-3 minutes
8. Click **"Visit"**

Your app is live at:
```
https://your-project.vercel.app
```

---

### 3️⃣ Update CORS (1 minute)

1. Go back to **Render Dashboard**
2. Click on your **sahayak-api** service
3. Go to **"Environment"** tab
4. Edit `CORS_ORIGINS` to:
   ```
   https://your-vercel-url.vercel.app,*
   ```
5. Save (backend will auto-redeploy)

---

## 🎉 Done!

Your URLs:
- **Frontend:** https://your-project.vercel.app
- **Backend:** https://your-api.onrender.com
- **API Docs:** https://your-api.onrender.com/docs

Share your frontend URL with anyone! 🌍

---

## Alternative: One-Click Deploy

### Railway (Backend + Frontend Together)
https://railway.app/new

1. Connect GitHub repo
2. Railway auto-detects both services
3. Add environment variables
4. Deploy both in one click

### Netlify (Frontend Alternative to Vercel)
https://app.netlify.com/start

1. Import from GitHub
2. Configure build settings
3. Add environment variable
4. Deploy

---

## Free Tier Limits

**Render:**
- 750 hours/month free
- Sleeps after 15 min inactivity
- First request wakes it up (30-60 sec)

**Vercel:**
- 100 GB bandwidth/month
- Unlimited requests
- Always on

**Both enough for testing and portfolio!**

---

## 📞 Need Help?

**Can't deploy?** Read `DEPLOY_NOW.md` for detailed instructions.

**Errors?** Check logs in platform dashboards.

**Questions?** Open GitHub issue: https://github.com/AkarshYash/IP-Project/issues

---

**Your Sahayak platform is ready to deploy!** 🚀

Click the links above and follow the steps.

Total time: **10 minutes**
