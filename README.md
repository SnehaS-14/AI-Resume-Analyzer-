# AI Resume Analyzer - Full Stack Application

A professional AI-powered resume analysis platform built with **FastAPI**, **React + TypeScript**, **Groq LLM**, and **MongoDB**.

## 🎯 Features

### Backend (FastAPI + Python)
- **Resume Analysis**: Upload PDF, DOCX, or TXT files → AI-powered analysis via Groq
- **MongoDB Persistence**: All analyses saved to MongoDB Atlas with full audit trail
- **Resume Rewrite**: AI-powered resume rewriting incorporating action items
- **History API**: Browse and manage past resume analyses
- **Async Architecture**: High-performance async/await with Motor (async MongoDB driver)

### Frontend (React + TypeScript + Vite)
- **Professional UI**: Modern dark theme with glassmorphism cards and gradients
- **Tab-based Navigation**: Switch between "Analyze" and "History" tabs
- **Real-time Analysis**: Drag-and-drop file upload with animated UI
- **Score Visualization**: SVG circular progress rings (Overall Score & ATS Score)
- **Detailed Insights**: Strengths, weaknesses, action items with color-coded lists
- **Resume Rewrite**: One-click AI rewrite + download as .txt file

## 📊 Analysis Results

Each resume analysis includes:
- **Overall Score** (0-100): Holistic resume quality
- **ATS Score** (0-100): Applicant Tracking System compatibility
- **Strengths**: 3+ key strengths of the resume
- **Weaknesses**: 3+ areas for improvement
- **Action Items**: Specific, actionable recommendations
- **Summary**: Professional narrative assessment

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 20+
- MongoDB Atlas account (free tier works great)

### Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Update .env with your Groq API key and MongoDB URI
# Example .env:
# GROQ_API_KEY=gsk_...
# MODEL_NAME=llama-3.3-70b-versatile
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster0

# Start the server
python -m uvicorn main:app --reload --port 8000
```

**Backend runs on**: http://localhost:8000
**API Docs**: http://localhost:8000/docs (Swagger UI)

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Frontend runs on**: http://localhost:5173 (or next available port)

## 📡 API Endpoints

### Analyze Resume
```
POST /analyze
Content-Type: multipart/form-data
Body: file (PDF, DOCX, or TXT)

Response:
{
  "id": "ObjectId string",
  "filename": "resume.pdf",
  "overall_score": 85,
  "ats_score": 90,
  "strengths": [...],
  "weaknesses": [...],
  "action_items": [...],
  "summary": "..."
}
```

### Get Analysis History
```
GET /history?limit=20

Response:
{
  "analyses": [
    {
      "id": "...",
      "filename": "...",
      "uploaded_at": "2026-05-09T17:00:00Z",
      "overall_score": 85,
      "ats_score": 90,
      ...
    }
  ]
}
```

### Get Specific Analysis
```
GET /history/{id}

Response: Full analysis details including raw_text and rewritten_text
```

### Rewrite Resume
```
POST /rewrite/{id}

Response:
{
  "rewritten_text": "..."
}
```

### Download Rewritten Resume
```
GET /rewrite/{id}/download

Response: .txt file download
```

## 🗄️ MongoDB Schema

Collection: `resume_analyzer.analyses`

```json
{
  "_id": ObjectId,
  "filename": "resume.pdf",
  "uploaded_at": ISODate("2026-05-09T17:00:00Z"),
  "overall_score": 85,
  "ats_score": 90,
  "strengths": ["...", "...", "..."],
  "weaknesses": ["...", "...", "..."],
  "action_items": ["...", "...", "..."],
  "summary": "...",
  "raw_text": "... full resume text ...",
  "rewritten_text": null or "... rewritten resume ..."
}
```

## 🎨 Color Scheme (Professional Dark Theme)

- **Background**: `#0a0a0f` (near black with gradient)
- **Cards**: `rgba(255,255,255,0.05)` (glassmorphism)
- **Primary**: `#6366f1` (indigo)
- **Success**: `#22c55e` (green)
- **Warning**: `#ef4444` (red)
- **Text**: `#f1f5f9` (light slate)
- **Muted**: `#94a3b8` (slate)

## 📁 Project Structure

```
d:\AI Resume analyser\
├── backend\
│   ├── main.py                 # FastAPI app with lifespan
│   ├── database.py             # MongoDB connection (Motor)
│   ├── requirements.txt         # Python dependencies
│   ├── .env                     # API keys & credentials
│   ├── models\
│   │   └── resume.py          # Pydantic models
│   ├── services\
│   │   ├── parser.py          # PDF/DOCX/TXT extraction
│   │   ├── groq_service.py    # Groq LLM calls
│   │   └── rewrite_service.py # Resume rewriting
│   ├── routers\
│   │   ├── analyze.py         # POST /analyze
│   │   ├── history.py         # GET /history
│   │   └── rewrite.py         # POST /rewrite & GET /rewrite/.../download
│   └── prompts\
│       └── resume_prompt.py   # LLM system prompt
│
└── frontend\
    ├── src\
    │   ├── App.tsx            # Main app with tabs
    │   ├── types.ts           # TypeScript interfaces
    │   ├── index.css          # Tailwind + base styles
    │   ├── main.tsx           # React entry point
    │   └── components\
    │       ├── UploadZone.tsx     # Drag-and-drop uploader
    │       ├── ResultPanel.tsx    # Analysis results display
    │       └── HistoryPanel.tsx   # Past analyses grid
    ├── vite.config.ts         # Vite configuration
    ├── tailwind.config.cjs     # Tailwind CSS config
    ├── postcss.config.cjs      # PostCSS config
    ├── package.json
    └── tsconfig.json
```

## 🔧 Technology Stack

### Backend
- **FastAPI**: Modern async web framework
- **Motor**: Async MongoDB driver
- **Groq API**: LLM for analysis and rewriting (llama-3.3-70b-versatile)
- **pdfplumber**: PDF text extraction
- **python-docx**: DOCX text extraction

### Frontend
- **React 19**: UI framework
- **TypeScript**: Type safety
- **Vite**: Lightning-fast build tool
- **Axios**: HTTP client
- **Tailwind CSS**: Utility-first CSS (configuration included)

## 🧪 Testing the Application

### 1. Upload a Resume
1. Open http://localhost:5173 (or the displayed port)
2. Drag and drop a PDF, DOCX, or TXT resume
3. Click "Analyze Resume"
4. View the AI-powered analysis with scores and recommendations

### 2. Rewrite Resume
1. After analysis, click "✏️ Rewrite My Resume"
2. Wait for Groq to incorporate the action items
3. View the rewritten resume in the text box
4. Click "📥 Download Resume" to save as .pdf file

### 3. View History
1. Click the "📋 History" tab
2. See all past analyses as cards
3. Each card shows filename, date, and scores at a glance

### 4. API Testing (Swagger)
1. Visit http://localhost:8000/docs
2. Try out any endpoint directly from the interactive UI

## ⚡ Performance

- **Resume Upload**: < 2 seconds (file extraction)
- **AI Analysis**: 3-8 seconds (Groq API call)
- **Resume Rewrite**: 5-12 seconds (LLM generation)
- **Frontend Load**: < 1 second (Vite optimized)
- **Database Queries**: < 100ms (MongoDB Atlas)

## 🔐 Security Notes

- **API Keys**: Stored in `.env` (never commit to git)
- **CORS**: Allow-all for local development (restrict in production)
- **MongoDB**: Uses connection string from `.env` with basic auth
- **File Upload**: Validates file type (PDF, DOCX, TXT only)

## 📈 Future Enhancements

- [ ] User authentication & accounts
- [ ] Resume templates & formatting
- [ ] Job description matching
- [ ] Skill gap analysis
- [ ] Batch resume processing
- [ ] Resume scoring benchmarks
- [ ] Export analysis as PDF report
- [ ] Browser-based resume editor
- [ ] Multi-language support

## 🤝 Contributing

Contributions welcome! Please:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📝 License

MIT License - feel free to use for personal or commercial projects

## 💬 Support

For issues or questions:
1. Check the existing GitHub issues
2. Open a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/logs if applicable

---

**Built with ❤️ using Groq, FastAPI, React, and MongoDB**
