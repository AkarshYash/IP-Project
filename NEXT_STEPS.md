# 🎯 YOUR NEXT STEPS (Based on Your Supabase)

## ✅ You've Created Supabase! Great!

Your Supabase URL: `https://wuysrqpstqfxzwdkhwwl.supabase.co`

---

## 📋 COMPLETE THESE 5 SIMPLE STEPS:

### STEP 1: Get Your Database Connection String (2 min)

1. In your Supabase dashboard (the page you showed me)
2. Click **"Project Settings"** (gear icon at bottom left)
3. Click **"Database"** in the left menu
4. Scroll down to **"Connection string"** section
5. Select **"URI"** tab
6. Copy the entire connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.wuysrqpstqfxzwdkhwwl.supabase.co:5432/postgres
   ```
7. **IMPORTANT:** Replace `[YOUR-PASSWORD]` with the password you created

---

### STEP 2: Create Database Tables (3 min)

1. In Supabase dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"+ New Query"**
3. Copy and paste this SQL:

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workers_skill ON workers(skill);
CREATE INDEX IF NOT EXISTS idx_workers_rating ON workers(rating DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at DESC);

-- Insert sample workers for testing
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

4. Click **"Run"** (or press Ctrl+Enter)
5. You should see "Success. No rows returned" or "10 rows affected"

---

### STEP 3: Update Backend Environment File (2 min)

1. In your project, open file: `backend/.env`
2. If it doesn't exist, create it
3. Add these lines (replace with YOUR values):

```env
# Supabase Configuration
SUPABASE_URL=https://wuysrqpstqfxzwdkhwwl.supabase.co
SUPABASE_KEY=your-anon-key-here
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.wuysrqpstqfxzwdkhwwl.supabase.co:5432/postgres

# Optional (can add later)
GROQ_API_KEY=
GEMINI_API_KEY=
OPENAI_API_KEY=
```

**To get SUPABASE_KEY:**
- In Supabase dashboard → Project Settings → API
- Copy the `anon` `public` key

---

### STEP 4: Test Backend Locally (2 min)

Run these commands:

```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

Then test in browser: http://localhost:8000/health

Should return:
```json
{"status": "healthy"}
```

Test workers endpoint: http://localhost:8000/api/workers/search?query=plumber

Should return list of plumbers!

---

### STEP 5: Deploy to Render.com (10 min)

Now that everything works locally, deploy to production:

1. Go to https://render.com
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect repository: `AkarshYash/IP-Project`
5. Configure:
   ```
   Name: sahayak-backend
   Region: Singapore
   Root Directory: backend
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
6. Add Environment Variable:
   - Key: `DATABASE_URL`
   - Value: (Your connection string from Step 1)
7. Click **"Create Web Service"**
8. Wait 5-10 minutes
9. **Copy your backend URL:** `https://xxxxx.onrender.com`

---

### STEP 6: Deploy Frontend to Vercel (5 min)

1. Update `react-frontend/.env.production`:
   ```
   VITE_API_URL=https://xxxxx.onrender.com
   ```
   (Use YOUR Render URL from Step 5)

2. Commit & push:
   ```bash
   git add .
   git commit -m "Production backend URL"
   git push
   ```

3. Go to https://vercel.com
4. Sign up with GitHub
5. Click **"Add New..."** → **"Project"**
6. Import: `AkarshYash/IP-Project`
7. Configure:
   ```
   Framework: Vite
   Root Directory: react-frontend
   Build Command: npm run build
   Output Directory: dist
   ```
8. Add Environment Variable:
   - Key: `VITE_API_URL`
   - Value: (Your Render backend URL)
9. Click **"Deploy"**
10. Wait 3 minutes

---

## 🎉 DONE! Your App is Live!

Your app will be at: `https://your-app.vercel.app`

---

## 📝 Quick Reference

**Your URLs:**
- Supabase: https://wuysrqpstqfxzwdkhwwl.supabase.co
- Backend (after deploy): https://_____.onrender.com
- Frontend (after deploy): https://_____.vercel.app

**What to Test:**
✅ Search for "plumber" - should show 2 workers
✅ Search for "electrician" - should show 2 workers
✅ Voice assistant - click mic button and speak
✅ Chat - click on a worker card
✅ Language switcher - try Hindi, Punjabi, etc.

---

## 🐛 Need Help?

**Database not connecting?**
- Check your password in DATABASE_URL
- Make sure you replaced `[YOUR-PASSWORD]`

**Workers not showing?**
- Run the SQL script again in Supabase
- Check if data exists: `SELECT * FROM workers;` in SQL Editor

**Backend error?**
- Check Render logs in dashboard
- Verify DATABASE_URL environment variable

---

## ⏱️ Total Time: ~25 minutes
## 💰 Total Cost: $0/month
## ✅ Production Ready!

Start with STEP 1 above and let me know when you need help! 🚀
