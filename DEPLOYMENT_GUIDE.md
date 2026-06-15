# 🚀 Complete Deployment Guide

## Overview
Deploy Sahayak platform in 15 minutes:
- **Backend** → Render.com (Free tier)
- **Frontend** → Vercel (Free tier)
- **Total Cost:** $0/month (with limitations)

---

## Part 1: Deploy Backend API (Render.com)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub account
3. Authorize Render to access your repositories

### Step 2: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect repository: `AkarshYash/IP-Project`
3. Configure service:
   ```
   Name: sahayak-api
   Region: Oregon (US West) or closest to you
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   Plan: Free
   ```

### Step 3: Add Environment Variables
In Render dashboard → Environment tab, add:

```env
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=generate_random_string_here
DEBUG=false
CORS_ORIGINS=*
DATABASE_URL=sqlite+aiosqlite:///./sahayak.db
```

**Get Groq API Key:**
1. Visit https://console.groq.com
2. Sign up → Create API Key
3. Copy and paste into Render

**Generate JWT Secret:**
```bash
# On your computer
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Wait 3-5 minutes for build
3. Once deployed, copy your URL: `https://sahayak-api.onrender.com`

### Step 5: Test Backend
```bash
curl https://sahayak-api.onrender.com/health
# Should return: {"status":"ok","service":"sahayak-api"}

curl "https://sahayak-api.onrender.com/api/workers/search?query=plumber"
# Should return workers array
```

✅ **Backend deployed!**

---

## Part 2: Deploy Frontend (Vercel)

### Step 1: Update Frontend API URL
1. Go to your project:
   ```bash
   cd react-frontend
   ```

2. Update `.env.local`:
   ```env
   VITE_API_URL=https://sahayak-api.onrender.com
   ```

3. Commit and push:
   ```bash
   git add .env.local
   git commit -m "Update API URL for production"
   git push origin main
   ```

### Step 2: Deploy to Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click **"Add New Project"**
4. Import `AkarshYash/IP-Project`
5. Configure:
   ```
   Framework Preset: Vite
   Root Directory: react-frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

6. Add Environment Variable:
   ```
   VITE_API_URL = https://sahayak-api.onrender.com
   ```

7. Click **"Deploy"**

### Step 3: Get Your URL
After 2-3 minutes:
- Your app will be live at: `https://sahayak-frontend.vercel.app`
- Or custom domain: `https://your-project-name.vercel.app`

### Step 4: Update Backend CORS
Go back to Render → Environment:
```env
CORS_ORIGINS=https://sahayak-frontend.vercel.app,https://your-project-name.vercel.app
```

Click **"Save Changes"** (backend will redeploy)

✅ **Frontend deployed!**

---

## Part 3: Final Testing

### Test Full Stack
1. Open `https://sahayak-frontend.vercel.app`
2. Search for "Hindi plumber Noida"
3. Click on a worker
4. Try to book
5. Check if chat opens

### Expected Behavior:
- ✅ Search returns workers
- ✅ Map shows markers
- ✅ Booking creates successfully
- ✅ Chat opens
- ✅ Multi-language switching works

---

## 🎯 Production Optimizations (Optional)

### 1. Add PostgreSQL Database
**Current:** SQLite (resets on every deploy)  
**Better:** PostgreSQL (persistent data)

On Render:
1. Create **"New +"** → **"PostgreSQL"**
2. Name: `sahayak-db`
3. Copy **Internal Database URL**
4. Add to backend environment:
   ```env
   DATABASE_URL=postgresql+asyncpg://user:pass@host/db
   ```

### 2. Add Redis Cache
For session management and rate limiting:

On Render:
1. Create **"New +"** → **"Redis"**
2. Copy connection URL
3. Add to backend:
   ```env
   REDIS_URL=redis://...
   ```

### 3. Custom Domain
**Vercel (Frontend):**
1. Settings → Domains → Add Domain
2. Follow DNS instructions

**Render (Backend):**
1. Settings → Custom Domain
2. Add CNAME record

### 4. Enable HTTPS (Auto-enabled on both platforms)

### 5. Set Up Monitoring
- **Vercel:** Built-in analytics
- **Render:** Built-in metrics dashboard
- **External:** Add Sentry for error tracking

---

## 📊 Deployment Checklist

### Pre-Deployment
- [x] Backend API working locally
- [x] Frontend connecting to backend locally
- [x] All environment variables identified
- [x] Git repository up to date

### Backend Deployment
- [ ] Render account created
- [ ] Web service created
- [ ] Environment variables set
- [ ] Health check passing
- [ ] API endpoints tested

### Frontend Deployment
- [ ] Vercel account created
- [ ] Repository imported
- [ ] Build successful
- [ ] API URL configured
- [ ] Frontend loads correctly

### Post-Deployment
- [ ] Full search flow tested
- [ ] Booking creation tested
- [ ] Chat functionality tested
- [ ] Mobile responsive checked
- [ ] Multi-language tested

---

## 🐛 Common Issues & Solutions

### Issue 1: Build fails on Render
**Error:** `ModuleNotFoundError: No module named 'X'`

**Solution:**
```bash
# Add missing package to backend/requirements.txt
echo "package-name==version" >> backend/requirements.txt
git commit -am "Add missing dependency"
git push
```

### Issue 2: Frontend can't connect to backend
**Error:** `Network Error` or `CORS policy`

**Solution:**
1. Check `VITE_API_URL` in Vercel environment variables
2. Update `CORS_ORIGINS` in Render to include Vercel URL
3. Verify backend is running: `curl https://your-api.onrender.com/health`

### Issue 3: 502 Bad Gateway on Render
**Cause:** Free tier spins down after 15 min inactivity

**Solution:**
- First request after sleep takes 30-60 seconds
- Upgrade to paid plan for 24/7 availability ($7/month)
- Or use a cron job to ping every 14 minutes

### Issue 4: Database resets on every deploy
**Cause:** Using SQLite (file-based, not persistent on free tier)

**Solution:**
- Add PostgreSQL database (see Production Optimizations above)
- Update `DATABASE_URL` environment variable

### Issue 5: Workers not loading
**Error:** `CSV file not found`

**Solution:**
```bash
# Ensure CSV is in correct location
ls backend/../blue_collar_workers_500.csv

# If missing, it should be at project root
```

---

## 🎉 Success Metrics

Your deployment is successful when:
1. ✅ Backend health check returns `200 OK`
2. ✅ Frontend loads without errors
3. ✅ Search returns workers
4. ✅ Map displays correctly
5. ✅ Booking flow completes
6. ✅ Chat opens and functions
7. ✅ Language switching works
8. ✅ Mobile view is responsive

---

## 📞 Support

**Deployment Issues:**
- Render Discord: https://discord.gg/render
- Vercel Discord: https://vercel.com/discord

**Project Issues:**
- GitHub Issues: https://github.com/AkarshYash/IP-Project/issues

**Quick Help:**
- Backend logs: Render Dashboard → Logs tab
- Frontend logs: Vercel Dashboard → Deployments → View Function Logs

---

## 🌟 Next Steps After Deployment

1. **Share Your Link:**
   ```
   Frontend: https://your-project.vercel.app
   Backend API: https://your-api.onrender.com
   API Docs: https://your-api.onrender.com/docs
   ```

2. **Monitor Usage:**
   - Watch Render dashboard for API calls
   - Check Vercel analytics for visitors

3. **Get Feedback:**
   - Share with friends/colleagues
   - Test on different devices
   - Iterate based on usage

4. **Scale When Ready:**
   - Upgrade Render to paid ($7/month for always-on)
   - Add PostgreSQL for data persistence
   - Add Redis for better performance
   - Configure custom domain

---

**Congratulations! Your Sahayak platform is now live! 🎉**

Share your deployment URL and start connecting workers with clients!
