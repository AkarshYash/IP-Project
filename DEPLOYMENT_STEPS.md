# 🚀 COMPLETE DEPLOYMENT GUIDE - 100% FREE

## Quick Overview
We'll deploy:
- **Frontend** → Vercel (Free, unlimited bandwidth)
- **Backend** → Render.com (Free tier)
- **Database** → Supabase (Free PostgreSQL, 500MB)

Total Cost: **$0/month forever** ✅

---

## 📦 STEP 1: Prepare Backend for Deployment

### Create Render Configuration

Already done! You have `render.yaml` ready.

### Make sure backend/start.sh is executable:
```bash
chmod +x backend/start.sh
```

---

## 🗄️ STEP 2: Setup Supabase Database (5 minutes)

### A. Create Supabase Project

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (free)
4. Click "New Project"
5. Fill in:
   - **Name:** sahayak-db
   - **Database Password:** (create a strong password - SAVE THIS!)
   - **Region:** Choose closest to India (Singapore or Mumbai if available)
6. Click "Create new project"
7. Wait 2-3 minutes for database to initialize

### B. Get Your Connection Details

Once created, go to **Project Settings** → **Database**:

Copy these values:
```
Host: db.xxxxxxxxxxxxx.supabase.co
Database name: postgres
Port: 5432
User: postgres
Password: [your password from above]
```

Your connection string will be:
```
postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

### C. Initialize Database Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Click "New Query"
3. Copy and paste this SQL:

```sql
-- Create workers table
CREATE TABLE workers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    skill TEXT,
    phone TEXT,
    email TEXT,
    location TEXT,
    rating FLOAT DEFAULT 0,
    price FLOAT DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    blockchain_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    worker_id TEXT REFERENCES workers(id),
    customer_name TEXT NOT NULL,
    service TEXT NOT NULL,
    date TEXT,
    time TEXT,
    address TEXT,
    advance_amount FLOAT DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_workers_skill ON workers(skill);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created ON bookings(created_at);
```

4. Click "Run" to execute
5. You should see "Success. No rows returned"

---

## 🌐 STEP 3: Deploy Backend to Render (10 minutes)

### A. Push Code to GitHub

Already done! Your code is at: https://github.com/AkarshYash/IP-Project.git

### B. Deploy to Render

1. Go to https://render.com
2. Sign up with your GitHub account
3. Click "New +" → "Web Service"
4. Connect your GitHub repository: **AkarshYash/IP-Project**
5. Configure the service:

**Basic Settings:**
- **Name:** sahayak-backend
- **Region:** Singapore (closest to India)
- **Branch:** main
- **Root Directory:** backend
- **Runtime:** Python 3
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Advanced Settings - Environment Variables:**

Click "Add Environment Variable" for each:

```
DATABASE_URL = [Your Supabase connection string from Step 2]
OPENAI_API_KEY = [Optional - add if you have one]
GROQ_API_KEY = [Optional - we'll add later]
```

6. Select **Free** plan
7. Click "Create Web Service"
8. Wait 5-10 minutes for deployment

### C. Get Your Backend URL

Once deployed, you'll see:
```
Your service is live at: https://sahayak-backend-xxxx.onrender.com
```

**Copy this URL!** You'll need it for frontend.

### D. Test Backend

Open in browser:
```
https://sahayak-backend-xxxx.onrender.com/health
```

Should return:
```json
{"status": "healthy"}
```

---

## 🎨 STEP 4: Deploy Frontend to Vercel (5 minutes)

### A. Update Frontend Environment

1. Open `react-frontend/.env.production`
2. Update it:

```env
VITE_API_URL=https://sahayak-backend-xxxx.onrender.com
```

(Replace with YOUR backend URL from Step 3C)

### B. Commit the Change

```bash
git add react-frontend/.env.production
git commit -m "Update production API URL"
git push
```

### C. Deploy to Vercel

**Method 1: Using Vercel Dashboard (Recommended)**

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New..." → "Project"
4. Import your repository: **AkarshYash/IP-Project**
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** react-frontend
   - **Build Command:** `npm run build`
   - **Output Directory:** dist
6. Add Environment Variable:
   - Key: `VITE_API_URL`
   - Value: `https://sahayak-backend-xxxx.onrender.com`
7. Click "Deploy"
8. Wait 2-3 minutes

**Method 2: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd react-frontend
vercel --prod
```

### D. Get Your Live URL

Vercel will give you:
```
https://your-app.vercel.app
```

---

## ✅ STEP 5: Verify Everything Works

### A. Check Frontend
Visit: `https://your-app.vercel.app`

Should see:
- ✅ Beautiful landing page
- ✅ Voice assistant button working
- ✅ Can switch between Worker/Provider modes

### B. Check Backend Connection

1. Open Developer Console (F12)
2. Go to Network tab
3. Click around the app
4. Should see API calls to your Render backend
5. No CORS errors

### C. Test Worker Search

1. Switch to "Job Provider" mode
2. Search for "plumber"
3. Should see worker results from database

---

## 🎯 STEP 6: Final Configuration

### A. Update Backend CORS (if needed)

If you see CORS errors, update `backend/app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app.vercel.app",  # Add your Vercel URL
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Commit and push - Render will auto-redeploy.

### B. Add Custom Domain (Optional)

**Vercel:**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as shown

**Render:**
1. Go to Settings → Custom Domain
2. Add domain
3. Update DNS

---

## 📊 MONITORING & MAINTENANCE

### Free Tier Limits:

**Vercel:**
- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Global CDN

**Render:**
- ✅ 750 hours/month (enough for 1 service 24/7)
- ⚠️ Spins down after 15 min inactivity
- ⚠️ First request after sleep: 30-60s delay
- ✅ Auto-redeploy on git push

**Supabase:**
- ✅ 500MB database
- ✅ 50K monthly active users
- ✅ 2GB file storage
- ⚠️ Pauses after 7 days inactivity

### Keep Backend Alive (Optional)

To prevent Render from sleeping:

1. Use a free service like **UptimeRobot**
2. Ping your backend every 14 minutes:
   - URL: `https://sahayak-backend-xxxx.onrender.com/health`
   - Interval: 14 minutes

---

## 🐛 TROUBLESHOOTING

### Backend won't start on Render

**Error:** "Module not found"
**Fix:** Check `requirements.txt` includes all dependencies

**Error:** "Database connection failed"
**Fix:** Verify `DATABASE_URL` in Render environment variables

### Frontend can't connect to backend

**Error:** "Network Error" or "CORS"
**Fix:** 
1. Check backend URL in `.env.production`
2. Verify CORS origins in `main.py`
3. Make sure backend is actually running (not sleeping)

### Workers not showing up

**Fix:**
1. Check Supabase database has data
2. Run SQL query in Supabase: `SELECT * FROM workers;`
3. If empty, you need to seed data (see below)

---

## 📝 SEED DATABASE WITH SAMPLE DATA

Go to Supabase SQL Editor and run:

```sql
-- Insert sample workers
INSERT INTO workers (name, skill, phone, rating, price, location) VALUES
('Rajesh Kumar', 'Plumber', '+91-9876543210', 4.5, 500, 'Noida Sector 62'),
('Amit Singh', 'Electrician', '+91-9876543211', 4.7, 600, 'Gurgaon Sector 14'),
('Suresh Patil', 'Carpenter', '+91-9876543212', 4.3, 450, 'Delhi Rohini'),
('Vijay Sharma', 'Painter', '+91-9876543213', 4.6, 400, 'Noida Sector 18'),
('Ramesh Yadav', 'Mason', '+91-9876543214', 4.8, 550, 'Faridabad Sector 12');
```

---

## 🎉 SUCCESS CHECKLIST

After deployment, you should have:

- ✅ Live frontend URL working
- ✅ Live backend URL responding
- ✅ Database connected and accessible
- ✅ Worker search returning results
- ✅ Voice assistant functional
- ✅ Chat windows opening
- ✅ All animations working
- ✅ No console errors
- ✅ Mobile responsive
- ✅ HTTPS enabled automatically

---

## 🚀 YOUR LIVE URLs

Fill these in after deployment:

**Frontend (Vercel):**
```
https://_____________________.vercel.app
```

**Backend (Render):**
```
https://_____________________.onrender.com
```

**Database (Supabase):**
```
Dashboard: https://supabase.com/dashboard/project/_____
```

---

## 📞 NEED HELP?

If you get stuck:

1. Check Render logs: Dashboard → Logs
2. Check Vercel logs: Project → Deployments → Click deployment → Logs
3. Check browser console (F12) for frontend errors
4. Check Supabase logs: Dashboard → Logs

---

**⏱️ Total Time: ~20 minutes**  
**💰 Total Cost: $0/month**  
**✅ Production Ready!**

Let me know when you complete each step, and I'll help if you encounter any issues!
