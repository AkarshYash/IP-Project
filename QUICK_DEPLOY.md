# ⚡ SUPER QUICK DEPLOY (10 Minutes)

## 🎯 3-Step Deployment (Fastest Path)

### STEP 1: Supabase (2 min)
1. Open https://supabase.com → Sign up → New Project
2. Copy connection string (looks like: `postgresql://postgres:xxxxx@db....`)
3. Save it!

### STEP 2: Render (5 min)
1. Open https://render.com → Sign up with GitHub
2. New Web Service → Connect repo `AkarshYash/IP-Project`
3. Settings:
   - Root: `backend`
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add env var: `DATABASE_URL` = [your Supabase connection]
5. Deploy! (Free plan)
6. Copy your URL: `https://xxxxx.onrender.com`

### STEP 3: Vercel (3 min)
1. Update `react-frontend/.env.production`:
   ```
   VITE_API_URL=https://xxxxx.onrender.com
   ```
2. Commit & push:
   ```bash
   git add .
   git commit -m "Production URL"
   git push
   ```
3. Open https://vercel.com → Import project
4. Select `react-frontend` folder
5. Deploy!

## ✅ DONE!

Your app is live at: `https://your-app.vercel.app`

---

## 🔥 Even Faster? Use These Buttons!

### Deploy Backend to Render
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Deploy Frontend to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AkarshYash/IP-Project)

---

## 📝 After Deployment

1. **Seed Database:** Copy worker data from `blue_collar_workers_500.csv` to Supabase
2. **Test:** Open your Vercel URL and search for workers
3. **Monitor:** Both platforms have free monitoring dashboards

**That's it! Your AI chatbot is live! 🎉**
