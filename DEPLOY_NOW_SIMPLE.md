# 🚀 DEPLOY NOW - SUPER SIMPLE

## ✅ Everything is configured! Just follow these steps:

### STEP 1: Create Database Tables (2 min)

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/wuysrqpstqfxzwdkhwwl
2. Click **"SQL Editor"** (left sidebar)
3. Click **"+ New query"**
4. Copy and paste this SQL:

```sql
-- Create workers table
CREATE TABLE IF NOT EXISTS workers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    skill TEXT,
    phone TEXT,
    email TEXT,
    location TEXT,
    distance TEXT DEFAULT '5 km',
    rating FLOAT DEFAULT 4.5,
    price FLOAT DEFAULT 500,
    verified BOOLEAN DEFAULT false,
    blockchain_verified BOOLEAN DEFAULT false,
    languages TEXT[] DEFAULT ARRAY['Hindi', 'English'],
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    worker_id TEXT,
    worker_name TEXT,
    customer_id TEXT,
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
CREATE INDEX IF NOT EXISTS idx_workers_skill ON workers(skill);
CREATE INDEX IF NOT EXISTS idx_workers_rating ON workers(rating DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Insert 10 sample workers
INSERT INTO workers (name, skill, phone, rating, price, location, verified, languages) VALUES
('Rajesh Kumar', 'Plumber', '+91-9876543210', 4.8, 500, 'Noida Sector 62', true, ARRAY['Hindi', 'English']),
('Amit Singh', 'Electrician', '+91-9876543211', 4.7, 600, 'Gurgaon Sector 14', true, ARRAY['Hindi', 'Punjabi']),
('Suresh Patil', 'Carpenter', '+91-9876543212', 4.5, 450, 'Delhi Rohini', true, ARRAY['Hindi', 'Marathi']),
('Vijay Sharma', 'Painter', '+91-9876543213', 4.6, 400, 'Noida Sector 18', false, ARRAY['Hindi']),
('Ramesh Yadav', 'Mason', '+91-9876543214', 4.9, 550, 'Faridabad Sector 12', true, ARRAY['Hindi', 'English']),
('Dinesh Verma', 'Plumber', '+91-9876543215', 4.4, 480, 'Delhi Dwarka', true, ARRAY['Hindi']),
('Prakash Joshi', 'Electrician', '+91-9876543216', 4.7, 580, 'Noida Sector 50', true, ARRAY['Hindi', 'English']),
('Ashok Gupta', 'Carpenter', '+91-9876543217', 4.3, 420, 'Ghaziabad', false, ARRAY['Hindi']),
('Manoj Tiwari', 'Painter', '+91-9876543218', 4.8, 390, 'Noida Sector 15', true, ARRAY['Hindi', 'Bhojpuri']),
('Sanjay Rao', 'Mason', '+91-9876543219', 4.6, 530, 'Greater Noida', true, ARRAY['Hindi', 'Telugu'])
ON CONFLICT (id) DO NOTHING;
```

5. Click **"Run"** (bottom-right)
6. Should see: "Success. 10 rows returned" ✅

---

### STEP 2: Deploy Backend to Render (5 min)

**One-Click Deploy!**

1. Click this button → [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/AkarshYash/IP-Project)

OR Manual:

1. Go to https://render.com
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect repository: **AkarshYash/IP-Project**
5. Settings:
   ```
   Name: sahayak-backend
   Region: Singapore (closest to your ap-northeast-2)
   Root Directory: backend
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   Plan: Free
   ```
6. Environment Variables - Add this ONE variable:
   - Key: `DATABASE_URL`
   - Value: `postgresql://postgres:Akardhyash@2021to2026@db.wuysrqpstqfxzwdkhwwl.supabase.co:5432/postgres`
7. Click **"Create Web Service"**
8. Wait 5-10 minutes (first deploy is slow)
9. **Copy your backend URL**: `https://xxxxx.onrender.com`

---

### STEP 3: Deploy Frontend to Vercel (3 min)

1. Update `react-frontend/.env.production`:
   ```
   VITE_API_URL=https://xxxxx.onrender.com
   ```
   (Replace with YOUR backend URL from Step 2)

2. Commit and push:
   ```bash
   git add .
   git commit -m "Production URL"
   git push
   ```

3. Go to https://vercel.com
4. Sign up with GitHub
5. Click **"Add New..."** → **"Project"**
6. Select: **AkarshYash/IP-Project**
7. Settings:
   ```
   Framework Preset: Vite
   Root Directory: react-frontend
   Build Command: npm run build
   Output Directory: dist
   ```
8. Environment Variables - Add ONE variable:
   - Key: `VITE_API_URL`
   - Value: `https://xxxxx.onrender.com` (your backend URL)
9. Click **"Deploy"**
10. Wait 2-3 minutes

---

## 🎉 DONE! Your App is Live!

**Your URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`
- Database: https://supabase.com/dashboard/project/wuysrqpstqfxzwdkhwwl

---

## ✅ Test Your Live App:

1. Go to your Vercel URL
2. Search for "plumber"
3. Should see 2 plumbers!
4. Try voice assistant
5. Click on a worker to chat

---

## 🐛 Troubleshooting:

**Backend shows error?**
- Check Render logs
- Make sure DATABASE_URL is exactly: `postgresql://postgres:Akardhyash@2021to2026@db.wuysrqpstqfxzwdkhwwl.supabase.co:5432/postgres`

**No workers showing?**
- Run the SQL script again in Supabase
- Check if data exists: `SELECT * FROM workers;`

**CORS errors?**
- Normal on first load
- Refresh the page

---

## ⏱️ Total Time: 10 minutes
## 💰 Total Cost: $0
## ✅ Production Ready!

**Start with STEP 1 - Create the database tables! Then deploy!** 🚀
