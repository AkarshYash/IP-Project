# ⚡ START YOUR DEPLOYMENT HERE

## 🎯 Follow These Steps IN ORDER

### ✅ STEP 1: Supabase Database (5 min)

1. Open this link → **[Create Supabase Project](https://supabase.com/dashboard/new/_)**
2. Sign up with GitHub
3. Create new project:
   - Name: `sahayak`
   - Password: (create strong password - SAVE IT!)
   - Region: Singapore
4. Wait 2 minutes for setup
5. Go to **Project Settings** → **Database**
6. Copy your connection string (looks like: `postgresql://postgres:xxxxx@db....`)
7. **SAVE THIS URL!**

---

### ✅ STEP 2: Deploy Backend (10 min)

1. Open → **[https://render.com](https://render.com)**
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect repository: `AkarshYash/IP-Project`
5. Settings:
   ```
   Name: sahayak-backend
   Region: Singapore
   Root Directory: backend
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   Plan: Free
   ```
6. Add Environment Variable:
   - Key: `DATABASE_URL`
   - Value: (paste your Supabase connection from Step 1)
7. Click **"Create Web Service"**
8. Wait 5-10 minutes
9. Copy your backend URL: `https://xxxxx.onrender.com`
10. **SAVE THIS URL!**

---

### ✅ STEP 3: Update Frontend Config (2 min)

1. Open file: `react-frontend/.env.production`
2. Change to:
   ```
   VITE_API_URL=https://xxxxx.onrender.com
   ```
   (Use YOUR backend URL from Step 2)
3. Save file
4. Run these commands:
   ```bash
   git add .
   git commit -m "Production backend URL"
   git push
   ```

---

### ✅ STEP 4: Deploy Frontend (5 min)

1. Open → **[https://vercel.com](https://vercel.com)**
2. Sign up with GitHub
3. Click **"Add New..."** → **"Project"**
4. Import: `AkarshYash/IP-Project`
5. Settings:
   ```
   Framework: Vite
   Root Directory: react-frontend
   Build Command: npm run build
   Output Directory: dist
   ```
6. Add Environment Variable:
   - Key: `VITE_API_URL`
   - Value: (your backend URL from Step 2)
7. Click **"Deploy"**
8. Wait 3 minutes
9. Your app is live at: `https://xxxxx.vercel.app`

---

## 🎉 DONE! Your App is LIVE!

Visit your Vercel URL and test:
- ✅ Search for workers
- ✅ Voice assistant
- ✅ Chat features
- ✅ Animations working

---

## 📝 Your Deployment URLs

**Fill these in:**

Frontend: `https://_________________.vercel.app`  
Backend: `https://_________________.onrender.com`  
Database: `https://supabase.com/dashboard/project/_______`

---

## 🐛 Having Issues?

### Backend not responding?
- Check Render logs
- Verify DATABASE_URL is correct
- Wait for first deployment (takes 10 min)

### Frontend showing errors?
- Check browser console (F12)
- Verify `.env.production` has correct backend URL
- Check Vercel deployment logs

### Need help?
Read the full guide: **[DEPLOYMENT_STEPS.md](./DEPLOYMENT_STEPS.md)**

---

## ⏱️ Total Time: 22 minutes
## 💰 Total Cost: $0/month
## ✅ You're Live on Production!
