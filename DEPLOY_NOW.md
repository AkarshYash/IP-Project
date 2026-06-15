# 🚀 DEPLOY NOW - Step by Step

## Your project is ready! Follow these exact steps:

---

## ✅ STEP 1: Deploy Backend to Render.com (5 minutes)

### 1.1 Create Render Account
1. Go to: https://render.com
2. Click **"Get Started"**
3. Sign up with **GitHub** account
4. Authorize Render to access your repositories

### 1.2 Create New Web Service
1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Connect Account"** if needed
4. Find and select: **`AkarshYash/IP-Project`**
5. Click **"Connect"**

### 1.3 Configure Service
Fill in these EXACT settings:

```
Name: sahayak-api
Region: Oregon (US West) - or closest to you
Branch: main
Root Directory: backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Plan: Free
```

### 1.4 Add Environment Variables
Click **"Advanced"** → Scroll to **"Environment Variables"** → Click **"Add Environment Variable"**

Add these ONE BY ONE:

```
Key: PYTHON_VERSION
Value: 3.11.0

Key: DEBUG  
Value: false

Key: JWT_SECRET
Value: sahayak-super-secret-jwt-key-2026-production

Key: CORS_ORIGINS
Value: *

Key: DATABASE_URL
Value: sqlite+aiosqlite:///./sahayak.db
```

### 1.5 Deploy!
1. Click **"Create Web Service"** (bottom of page)
2. Wait 3-5 minutes while it builds
3. Watch the logs - should see: "Application startup complete"
4. Copy your URL: `https://sahayak-api.onrender.com` (or similar)

### 1.6 Test Backend
Open in browser or use curl:
```bash
https://YOUR-APP-NAME.onrender.com/health
```

Should return:
```json
{"status":"ok","service":"sahayak-api"}
```

✅ **Backend is LIVE!**

---

## ✅ STEP 2: Deploy Frontend to Vercel (3 minutes)

### 2.1 Create Vercel Account
1. Go to: https://vercel.com
2. Click **"Start Deploying"**
3. Sign up with **GitHub** account
4. Authorize Vercel

### 2.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Find **`AkarshYash/IP-Project`**
3. Click **"Import"**

### 2.3 Configure Project
Fill in these EXACT settings:

```
Framework Preset: Vite
Root Directory: react-frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node Version: 18.x
```

### 2.4 Add Environment Variable
Click **"Environment Variables"** section

Add ONE variable:

```
Name: VITE_API_URL
Value: https://YOUR-RENDER-URL.onrender.com
```

**⚠️ IMPORTANT:** Replace `YOUR-RENDER-URL` with your actual Render URL from Step 1.6

Example:
```
VITE_API_URL = https://sahayak-api-xyz123.onrender.com
```

### 2.5 Deploy!
1. Click **"Deploy"** button
2. Wait 2-3 minutes
3. You'll see: "🎉 Congratulations!"
4. Click **"Visit"** or copy your URL

Your app is at:
```
https://YOUR-PROJECT-NAME.vercel.app
```

✅ **Frontend is LIVE!**

---

## ✅ STEP 3: Update CORS (1 minute)

### 3.1 Go Back to Render
1. Open https://dashboard.render.com
2. Click on **"sahayak-api"** service
3. Click **"Environment"** tab on left

### 3.2 Update CORS_ORIGINS
Find `CORS_ORIGINS` and click **"Edit"**

Change value to:
```
https://YOUR-VERCEL-URL.vercel.app,*
```

Example:
```
https://sahayak-frontend.vercel.app,*
```

Click **"Save Changes"**

Backend will automatically redeploy (30 seconds)

✅ **CORS Updated!**

---

## 🎉 YOUR APP IS NOW LIVE!

### Your URLs:
```
Frontend: https://your-project.vercel.app
Backend API: https://your-api.onrender.com
API Docs: https://your-api.onrender.com/docs
```

### Test Your Live App:
1. Open your Vercel URL
2. Search: "Hindi plumber Noida"
3. Click on a worker
4. Try booking
5. Test chat
6. Switch languages

Everything should work exactly like localhost!

---

## 📱 Share Your App

Copy and share your Vercel URL:
```
https://YOUR-PROJECT-NAME.vercel.app
```

Anyone in the world can now access your app! 🌍

---

## 🔧 Common Issues & Fixes

### Issue 1: Backend shows "Application failed to respond"
**Fix:** 
- Check Render logs: Dashboard → your service → "Logs" tab
- Verify all environment variables are set
- Wait 30 seconds, then refresh

### Issue 2: Frontend shows "Network Error"
**Fix:**
- Check VITE_API_URL in Vercel environment variables
- Make sure it points to your Render URL
- Update CORS_ORIGINS on Render
- Redeploy both services

### Issue 3: Render free tier spins down
**Note:** Free tier sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- This is normal for free tier
- Upgrade to $7/month for 24/7 availability

### Issue 4: Workers not loading
**Fix:**
- Check backend logs on Render
- Verify `blue_collar_workers_500.csv` is in the repo
- The CSV should be at project root

---

## 🎯 What You Just Deployed

✅ **Backend API** - FastAPI with 500 workers, ML scoring, NLP  
✅ **Frontend UI** - React with maps, chat, voice search  
✅ **Real-time Features** - Live map, instant booking  
✅ **Multi-language** - 8 Indian languages  
✅ **AI/ML** - Match scoring, price prediction  

**Total Cost:** $0/month (Free tier)

---

## 📊 Free Tier Limits

### Render (Backend)
- ✅ 750 hours/month free
- ✅ Spins down after 15 min inactivity
- ✅ 512MB RAM
- ⚠️ First request after sleep: 30-60 sec

### Vercel (Frontend)
- ✅ 100 GB bandwidth/month
- ✅ Unlimited requests
- ✅ Always on (no sleep)
- ✅ Free custom domain

**Both are MORE than enough for testing and sharing!**

---

## 🚀 Upgrade Options (Optional)

### If you need 24/7 availability:
**Render Starter:** $7/month
- No sleep
- 512MB RAM
- Worth it if you're serious!

### If you need more power:
**Render Pro:** $19/month
- 2GB RAM
- Better performance

**Vercel Pro:** $20/month
- More bandwidth
- Team features

---

## 🎊 Congratulations!

You just deployed a FULL-STACK AI-powered application to the cloud!

**Your app is now:**
- ✅ Live on the internet
- ✅ Accessible worldwide
- ✅ Free to use (with limits)
- ✅ Ready to share

**Share your Vercel URL and show off your work!** 🎉

---

## Need Help?

**Render Support:**
- Discord: https://discord.gg/render
- Docs: https://render.com/docs

**Vercel Support:**
- Discord: https://vercel.com/discord
- Docs: https://vercel.com/docs

**Project Issues:**
- GitHub: https://github.com/AkarshYash/IP-Project/issues

---

**Built with ❤️ by Akarsh Chaturvedi**

Now go deploy and share your amazing project! 🚀
