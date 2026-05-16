# Free Hosting Guide - Completely Free Options

Host your Resume AI completely free using Vercel, Render, and MongoDB Atlas.

## Prerequisites

1. **GitHub Account** - Already set up ✓
2. **Vercel Account** - https://vercel.com (FREE)
3. **Render Account** - https://render.com (FREE)
4. **MongoDB Atlas Account** - https://mongodb.com/cloud/atlas (FREE)
5. **Groq API Key** - https://console.groq.com (FREE)

---

## Part 1: Set Up MongoDB Atlas (FREE Database)

### Step 1: Create MongoDB Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Sign Up" (use Google or GitHub for quick signup)
3. Fill in basic info

### Step 2: Create a Free Cluster
1. Click "Create a Deployment"
2. Select **M0 FREE** (Always free)
3. Choose cloud provider: **AWS**
4. Choose region: **us-east-1** (or closest to you)
5. Click "Create Deployment"

### Step 3: Set Up Database
1. Click "Database" in left sidebar
2. Create a new user:
   - Username: `resume_admin` (or any name)
   - Password: Create a strong password
   - Click "Create User"

3. Allow network access:
   - Go to "Security" → "Network Access"
   - Click "Add IP Address"
   - Select "Allow access from anywhere" (0.0.0.0/0) for free tier
   - Click "Confirm"

### Step 4: Get Connection String
1. Click "Clusters" → "Connect"
2. Select "Drivers"
3. Copy the connection string (looks like):
   ```
   mongodb+srv://resume_admin:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password
5. Replace `myFirstDatabase` with `resume_analyzer`

**Final URL should look like:**
```
mongodb+srv://resume_admin:YourPassword123@cluster0.abc123.mongodb.net/resume_analyzer?retryWrites=true&w=majority
```

---

## Part 2: Deploy Backend on Render (FREE)

### Step 1: Deploy Backend
1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Click **"Build and deploy from a Git repository"**
4. Select your **AI-Resume-Analyzer-** repository

### Step 2: Configure Backend
Fill in the form:
- **Name**: `resume-ai-backend`
- **Environment**: Python
- **Region**: Oregon (free)
- **Branch**: main
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Root Directory**: `backend`
- **Plan**: Free

### Step 3: Add Environment Variables
Click "Advanced" and add these variables:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your MongoDB connection string (from Part 1) |
| `GROQ_API_KEY` | Get from https://console.groq.com |
| `JWT_SECRET` | Generate: `openssl rand -hex 32` |
| `DATABASE_URL` | Same as MONGODB_URI |

### Step 4: Deploy
Click **"Create Web Service"**

⏳ Wait 5-10 minutes for deployment to complete

📌 **Copy your backend URL** (will be like: `https://resume-ai-backend.onrender.com`)

---

## Part 3: Deploy Frontend on Vercel (COMPLETELY FREE & FASTER)

### Step 1: Deploy Frontend
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select your **AI-Resume-Analyzer-** repo

### Step 2: Configure Frontend
- **Project Name**: `resume-ai-frontend`
- **Framework**: Vite
- **Root Directory**: `frontend`

### Step 3: Add Environment Variables
Click "Environment Variables" and add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | Your backend URL (from Part 2, e.g., `https://resume-ai-backend.onrender.com`) |

### Step 4: Deploy
Click **"Deploy"**

⏳ Wait 2-3 minutes

✅ You'll get a live URL! (something like: `https://resume-ai-frontend.vercel.app`)

---

## Part 4: Update Backend CORS (If Using Vercel Frontend)

The code is already configured, but if using Vercel frontend, the URL will be like `https://resume-ai-frontend.vercel.app`

Backend CORS already includes it! ✓

---

## Generate JWT Secret (Required)

**On Windows PowerShell:**
```powershell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**On Mac/Linux:**
```bash
openssl rand -hex 32
```

Copy the output and use it for `JWT_SECRET` environment variable.

---

## Testing Your Deployment

1. Visit your Vercel Frontend URL
2. Sign up with email and password
3. Upload a resume (PDF, DOCX, or TXT)
4. Click "Analyze Resume"
5. Check the results!

---

## Free Tier Limitations & Solutions

| Limitation | Impact | Solution |
|-----------|--------|----------|
| Render free tier spins down after 15 min | First request takes 30s | Acceptable for testing |
| MongoDB free tier: 512MB storage | Enough for ~100 resumes | Upgrade to paid if needed |
| Vercel free tier bandwidth | 100GB/month | More than enough |
| Groq free tier rate limit | ~30 requests/min | Good for personal use |

---

## Cost Breakdown (Completely FREE)

- **Frontend (Vercel)**: $0/month ✓
- **Backend (Render)**: $0/month ✓
- **Database (MongoDB)**: $0/month ✓
- **API (Groq)**: Free tier ✓

**Total Cost: $0/month** 🎉

---

## Next Steps After Deployment

1. ✅ Visit your live app
2. ✅ Test all features (signup, upload, analyze)
3. ✅ Share with friends
4. 📈 Monitor usage in dashboards
5. 💰 Upgrade to paid plans when needed

---

## Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Render Dashboard**: https://dashboard.render.com
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Groq Console**: https://console.groq.com

---

## Troubleshooting

**Issue**: Frontend shows 502 error
- **Solution**: Backend is starting up, wait 30 seconds and refresh

**Issue**: Can't upload resume
- **Solution**: Check backend is running (`https://resume-ai-backend.onrender.com/health`)

**Issue**: Login fails
- **Solution**: Check MongoDB connection string is correct

**Issue**: Analysis not working
- **Solution**: Check Groq API key is valid in backend environment variables

---

**Deployed and running completely FREE!** 🚀

Last Updated: 2026-05-16
