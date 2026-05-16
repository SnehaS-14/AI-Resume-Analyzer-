# Quick Start Guide

## 🎯 30-Second Setup

### Step 1: Backend (Terminal 1)
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```
✅ You'll see: `Application startup complete`

### Step 2: Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
✅ You'll see: `Local: http://localhost:XXXX`

### Step 3: Open Browser
👉 Go to http://localhost:5173 (or the port shown in Terminal 2)

---

## 📋 What You Get

| Feature | Status |
|---------|--------|
| Upload & Analyze Resumes | ✅ Working |
| AI-Powered Scoring | ✅ Working |
| Rewrite Resumes | ✅ Ready |
| Save to MongoDB | ✅ Ready |
| History & Browser | ✅ Ready |
| Professional UI | ✅ Deployed |

---

## 🚀 First Test

1. **Get a sample resume** (or use your own):
   ```
   Save this as `resume.txt`:
   
   JOHN DOE
   john@example.com | LinkedIn.com/in/johndoe
   
   EXPERIENCE
   Senior Engineer | TechCorp | 2023-Present
   - Led team of 5 engineers
   - Delivered 3 major products
   - 40% performance improvement
   
   EDUCATION
   B.S. Computer Science | State University | 2018
   
   SKILLS
   Languages: Python, JavaScript, Go
   Frameworks: React, Node.js, FastAPI
   ```

2. **Upload it**: Drag-drop into the app or click to browse

3. **Get Analysis**: Wait 3-8 seconds for AI scoring

4. **Rewrite**: Click "Rewrite My Resume" to get AI suggestions incorporated

5. **Download**: Save your improved resume as .txt

---

## 🔌 Backend Endpoints

### Analyze Resume
```bash
curl -X POST \
  -F "file=@resume.pdf" \
  http://localhost:8000/analyze
```

### Get History
```bash
curl http://localhost:8000/history
```

### Health Check
```bash
curl http://localhost:8000/health
```

### API Docs
👉 Open http://localhost:8000/docs in your browser

---

## ⚙️ Configuration

### Backend `.env`
```
GROQ_API_KEY=gsk_your_key_here
MODEL_NAME=llama-3.3-70b-versatile
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster0
```

### Frontend Settings
- API URL: `http://localhost:8000` (hardcoded in `src/App.tsx`)
- Port: Auto-detects next available (5173+)
- Theme: Dark mode (glassmorphism cards)

---

## 🎨 UI Overview

### Header (Gradient Purple)
- Logo + Title
- MongoDB + Groq badges

### Tabs
- **📤 Analyze**: Upload and analyze resumes
- **📋 History**: Browse past analyses

### Analysis Results
- Score rings (overall + ATS)
- Summary card
- 3-column layout (Strengths, Weaknesses, Action Items)
- Rewrite button
- Download button

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use different port
python -m uvicorn main:app --port 8001
```

### MongoDB Connection Failed
- Check `.env` has correct MONGODB_URI
- Verify IP whitelist in MongoDB Atlas (allow 0.0.0.0/0 for local dev)
- Run `curl http://localhost:8000/health` to see error

### Frontend Not Loading
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)
- Check console (F12) for errors

### Resume Upload Fails
- Ensure file is PDF, DOCX, or TXT
- File size < 10 MB
- Check backend logs for details

---

## 📊 Example Output

```json
{
  "overall_score": 85,
  "ats_score": 90,
  "strengths": [
    "Clear accomplishments with quantified metrics",
    "Strong technical skills and relevant experience",
    "Good formatting and readability"
  ],
  "weaknesses": [
    "Missing keywords from job description",
    "Summary could be more targeted",
    "Dates could be more specific"
  ],
  "action_items": [
    "Add metrics to education section",
    "Include more action verbs",
    "Tailor summary to target role"
  ],
  "summary": "Strong resume with solid experience. Consider adding more specificity and metrics to strengthen ATS compatibility."
}
```

---

## 📱 Demo Workflow

### 1️⃣ Upload Phase
```
[Drag file here] → Validation → Extraction
```

### 2️⃣ Analysis Phase
```
Extract text → Send to Groq → Parse JSON → Save to MongoDB
```

### 3️⃣ Display Phase
```
Show scores → Show insights → Enable rewrite button
```

### 4️⃣ Rewrite Phase (Optional)
```
Click rewrite → Send to Groq → Save result → Show preview → Download
```

---

## 🎓 Learning Resources

- **Groq API**: https://console.groq.com/docs
- **FastAPI**: https://fastapi.tiangolo.com/
- **React TypeScript**: https://react.dev/learn/typescript
- **MongoDB**: https://docs.mongodb.com/
- **Vite**: https://vitejs.dev/guide/

---

## 🎉 You're All Set!

Your AI Resume Analyzer is now ready to use. Start uploading resumes and see AI-powered insights in action!

**Questions?** Check the main README.md for detailed documentation.

Happy analyzing! 🚀
