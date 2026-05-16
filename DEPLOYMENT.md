# Deployment Guide - Render

This guide will help you deploy the AI Resume Analyzer on Render.

## Prerequisites

1. **GitHub Account** - Project is already pushed to GitHub
2. **Render Account** - Sign up at https://render.com
3. **MongoDB Atlas Account** - For database (https://www.mongodb.com/cloud/atlas)
4. **Groq API Key** - Get from https://console.groq.com

## Step-by-Step Deployment

### 1. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (Free tier is fine)
3. Create a database user with username and password
4. Get your connection string (it will look like: `mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority`)
5. Create a database named `resume_analyzer`

### 2. Deploy on Render

#### Option A: Using render.yaml (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +"
3. Select "Blueprint"
4. Connect your GitHub repository
5. Select "resume-ai" repository
6. Confirm the blueprint will be deployed
7. Add environment variables in the next step

#### Option B: Manual Deployment

**Deploy Backend:**

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `resume-ai-backend`
   - **Environment**: Python
   - **Region**: Oregon (or closest to you)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend`

5. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `GROQ_API_KEY`: Your Groq API key
   - `JWT_SECRET`: Generate a strong random secret (e.g., using `openssl rand -hex 32`)
   - `DATABASE_URL`: Same as MONGODB_URI

6. Click "Create Web Service"

**Deploy Frontend:**

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `resume-ai-frontend`
   - **Environment**: Node
   - **Region**: Oregon
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Root Directory**: `frontend`

5. Add Environment Variable:
   - `VITE_API_URL`: The URL of your deployed backend (e.g., `https://resume-ai-backend.onrender.com`)

6. Click "Create Static Site"

### 3. Environment Variables Guide

**Backend (.env):**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/resume_analyzer?retryWrites=true&w=majority
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_generated_secret_key
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/resume_analyzer?retryWrites=true&w=majority
```

**Frontend (Build Variable):**
```
VITE_API_URL=https://resume-ai-backend.onrender.com
```

### 4. Update CORS Origins

The backend is already configured with production CORS origins:
- `https://resume-ai-frontend.onrender.com`

### 5. Generate JWT Secret

Run this command to generate a secure JWT secret:

**On Windows PowerShell:**
```powershell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**On Linux/Mac:**
```bash
openssl rand -hex 32
```

### 6. Test the Deployment

1. Visit your frontend URL: `https://resume-ai-frontend.onrender.com`
2. Try to sign up and upload a resume
3. Check the Render dashboard logs if there are any errors

### 7. Troubleshooting

**Backend not connecting to MongoDB:**
- Verify MongoDB URI in environment variables
- Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for Render)
- Ensure database name is correct

**Frontend can't connect to backend:**
- Verify `VITE_API_URL` is correct in frontend build variables
- Check backend CORS configuration in `main.py`
- Use browser DevTools to see the actual API requests

**Port issues:**
- Render automatically assigns a port, don't hardcode port numbers
- Use the `$PORT` environment variable (already configured)

### 8. Database Maintenance

To connect to your MongoDB Atlas database from your local machine:

1. Add your IP to MongoDB Atlas IP Whitelist
2. Use MongoDB Compass with your connection string
3. Connect to the `resume_analyzer` database

### 9. Update Services

To update your services after pushing changes to GitHub:

1. Render automatically deploys on push if you connected your repo
2. Check deployment status in Render dashboard
3. View logs if deployment fails

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 503 Service Unavailable | Backend is still starting, wait a moment and refresh |
| CORS error | Update `VITE_API_URL` in frontend build variables |
| MongoDB connection error | Verify URI and IP whitelist in MongoDB Atlas |
| Groq API errors | Check GROQ_API_KEY is correct |
| File upload fails | Check backend service is running |

## Performance Notes

- Free tier on Render may have cold starts (takes 15-30s after inactivity)
- MongoDB Atlas free tier has limited resources
- For production use, consider upgrading to paid plans

## Support

- Render Docs: https://render.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- Groq Docs: https://console.groq.com/docs

---

**Last Updated**: 2026-05-16
