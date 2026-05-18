# Project Flow & Architecture - AI Resume Analyzer

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Technology Stack](#technology-stack)
4. [Data Flow](#data-flow)
5. [User Flows](#user-flows)
6. [System Components](#system-components)
7. [Database Schema](#database-schema)
8. [Deployment Architecture](#deployment-architecture)

---

## Project Overview

**AI Resume Analyzer** is a web application that helps job seekers improve their resumes using AI-powered analysis. It provides:

- ✅ Resume upload and analysis
- ✅ AI-driven feedback with scores
- ✅ Action items for improvement
- ✅ Resume rewriting with AI
- ✅ Analysis history tracking
- ✅ Download rewritten resumes

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     END USER (Browser)                       │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (React + TypeScript)                   │
│         Render: ai-resume-analyzer-1-5veb.onrender.com      │
│                    Vercel Alternative                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  LoginPage   │  │ UploadZone   │  │ ResultPanel  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ SignupPage   │  │ HistoryPanel │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────┬────────────────────────────────────┘
                         │ API Calls (axios)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         BACKEND (FastAPI + Python)                          │
│     Render: ai-resume-analyzer-svry.onrender.com            │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ FastAPI Main Application (main.py)                │    │
│  │ - CORS Middleware                                 │    │
│  │ - Request/Response handling                        │    │
│  │ - Database connectivity                            │    │
│  └────────────────────────────────────────────────────┘    │
│                       ▼                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Auth Router │  │ Analyze      │  │ History      │      │
│  │ - Signup     │  │ Router       │  │ Router       │      │
│  │ - Login      │  │ - Upload     │  │ - Get List   │      │
│  └──────────────┘  │ - Analyze    │  │ - Get Detail │      │
│                    └──────────────┘  └──────────────┘      │
│  ┌──────────────┐                                           │
│  │  Rewrite     │                                           │
│  │  Router      │                                           │
│  │ - Rewrite    │                                           │
│  │ - Download   │                                           │
│  └──────────────┘                                           │
│                       ▼                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Parser      │  │  Groq AI     │  │  Rewrite     │      │
│  │  Service     │  │  Service     │  │  Service     │      │
│  │ - PDF Parser │  │ - Analyze    │  │ - AI Rewrite │      │
│  │ - DOCX Parse │  │ - Scoring    │  │ - Formatting │      │
│  │ - Text Read  │  │ - Feedback   │  └──────────────┘      │
│  └──────────────┘  └──────────────┘                         │
│                       ▼                                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Database Layer (database.py)                      │    │
│  │ - Motor (async MongoDB driver)                    │    │
│  │ - Collection management                           │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────┬────────────────────────────────────┘
                         │ Async Requests
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                               │
│                                                              │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │  MongoDB Atlas   │        │   Groq API       │          │
│  │  (Cloud Database)│        │   (AI Service)   │          │
│  │                  │        │                  │          │
│  │  Collections:    │        │  - Resume        │          │
│  │  - users         │        │    Analysis      │          │
│  │  - analyses      │        │  - Resume        │          │
│  │                  │        │    Rewriting     │          │
│  └──────────────────┘        └──────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | React 19.2 | UI rendering |
| Language | TypeScript 6.0 | Type safety |
| Build Tool | Vite 8.0 | Fast bundling |
| Styling | Inline CSS + Tailwind | Responsive design |
| HTTP Client | Axios 1.16 | API requests |
| Deployment | Render/Vercel | Static hosting |

### Backend
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | FastAPI | REST API server |
| Language | Python 3.11 | Server-side logic |
| Server | Uvicorn | ASGI server |
| Database | MongoDB | NoSQL document store |
| Driver | Motor | Async MongoDB driver |
| AI API | Groq | LLM-powered analysis |
| File Parsing | pdfplumber, python-docx | Resume extraction |
| Auth | Passlib + bcrypt | Password hashing |

### Infrastructure
| Service | Provider | Purpose |
|---------|----------|---------|
| Database | MongoDB Atlas | Cloud database |
| Backend Hosting | Render | PaaS platform |
| Frontend Hosting | Render/Vercel | Static site hosting |
| AI Model | Groq | LLM inference |

---

## Data Flow

### 1. User Registration Flow

```
User Input (Email, Password, Name)
         │
         ▼
Frontend (LoginPage.tsx)
    - Validate inputs
    - POST /auth/signup
         │
         ▼
Backend (auth.py)
    - Hash password (PBKDF2)
    - Check if email exists
    - Insert user to DB
         │
         ▼
MongoDB (users collection)
    - Store user document
         │
         ▼
Response (user_id, email, name)
    ▼
Frontend
    - Save to localStorage
    - Redirect to main app
```

### 2. Resume Analysis Flow

```
User Upload Resume File
         │
         ▼
Frontend (UploadZone.tsx)
    - Send file + user_id
    - POST /analyze?user_id=XXX
         │
         ▼
Backend (analyze.py)
    - Receive file
    - Extract text (Parser Service)
         │
         ├─ PDF → pdfplumber
         ├─ DOCX → python-docx
         └─ TXT → read directly
         │
         ▼
Parser Service (parser.py)
    - Returns extracted text
         │
         ▼
Groq Service (groq_service.py)
    - Send text to Groq API
    - LLM analyzes resume
    - Returns:
      * overall_score
      * ats_score
      * strengths
      * weaknesses
      * action_items
      * summary
         │
         ▼
Database Layer (database.py)
    - Create analysis document
    - Save to MongoDB
         │
         ▼
MongoDB (analyses collection)
    - Store analysis with:
      * user_id
      * filename
      * scores
      * AI feedback
      * raw_text
         │
         ▼
Response (JSON with analysis + document ID)
    ▼
Frontend (ResultPanel.tsx)
    - Display scores
    - Show feedback
    - Offer rewrite option
```

### 3. Resume Rewrite Flow

```
User Clicks "Rewrite Resume"
         │
         ▼
Frontend (ResultPanel.tsx)
    - POST /rewrite/{analysis_id}?user_id=XXX
         │
         ▼
Backend (rewrite.py)
    - Fetch analysis from DB
    - Get raw_text and action_items
         │
         ▼
Rewrite Service (rewrite_service.py)
    - Send to Groq API:
      * Original resume text
      * Action items to fix
    - LLM rewrites resume
    - Returns improved text
         │
         ▼
Database Update (database.py)
    - Update analysis document
    - Save rewritten_text
         │
         ▼
MongoDB (analyses collection)
    - Update rewritten_text field
         │
         ▼
Response (rewritten resume text)
    ▼
Frontend
    - Display improved resume
    - Show download button
```

### 4. History Retrieval Flow

```
User Clicks "History" Tab
         │
         ▼
Frontend (HistoryPanel.tsx)
    - GET /history?user_id=XXX&limit=20
         │
         ▼
Backend (history.py)
    - Query MongoDB for user_id
    - Sort by upload date (desc)
    - Limit results
         │
         ▼
MongoDB Query
    - Find documents where user_id matches
    - Return last 20 analyses
         │
         ▼
Response (Array of analyses)
    - id, filename, scores, feedback
         │
         ▼
Frontend (HistoryPanel.tsx)
    - Display as card list
    - Show scores and dates
    - Click to view details
         │
         ▼
User Selects Item
    │
    ├─ View Details:
    │  GET /history/{id}
    │
    └─ Download Rewritten:
       GET /rewrite/{id}/download
```

---

## User Flows

### User Journey: First-Time User

```
1. Landing Page
   └─→ "Sign Up" Button
       └─→ SignupPage
           ├─ Enter: Name, Email, Password
           └─→ POST /auth/signup
               └─→ Account Created ✓
                   └─→ Redirect to Main App

2. Main App (Authenticated)
   └─→ Upload Resume
       ├─ Drag & drop or browse
       └─→ POST /analyze
           └─→ Processing... ⏳
               └─→ Results Displayed ✓
                   ├─ Overall Score
                   ├─ ATS Score
                   ├─ Strengths
                   ├─ Weaknesses
                   ├─ Action Items
                   └─ Summary

3. View Results
   └─→ See Analysis
       ├─ Read Feedback
       └─→ Click "Rewrite Resume"
           └─→ POST /rewrite/{id}
               └─→ Processing... ⏳
                   └─→ Improved Resume ✓
                       ├─ Download Button
                       └─→ Save to History
```

### User Journey: Returning User

```
1. Login Page
   └─→ Enter: Email, Password
       └─→ POST /auth/login
           └─→ Authenticated ✓
               └─→ Redirect to App

2. View History
   └─→ Click "History" Tab
       └─→ GET /history
           └─→ Load Past Analyses ✓
               ├─ Show as Cards
               ├─ Latest First
               └─→ Click to View Details
                   └─→ GET /history/{id}
                       └─→ Full Analysis ✓
                           ├─ Download Rewritten
                           ├─ View Original
                           └─→ Download Button
                               └─→ GET /rewrite/{id}/download
                                   └─→ Download .txt File ✓

3. Upload New Resume
   └─→ Same as first-time flow
```

---

## System Components

### Frontend Components

| Component | Path | Purpose |
|-----------|------|---------|
| App | `src/App.tsx` | Main app container, routing, state management |
| LoginPage | `src/components/LoginPage.tsx` | User login form |
| SignupPage | `src/components/SignupPage.tsx` | User registration form |
| UploadZone | `src/components/UploadZone.tsx` | Resume drag-drop upload |
| ResultPanel | `src/components/ResultPanel.tsx` | Display analysis results |
| HistoryPanel | `src/components/HistoryPanel.tsx` | Show past analyses |

### Backend Services

| Service | Path | Purpose |
|---------|------|---------|
| Parser | `backend/services/parser.py` | Extract text from files |
| Groq Service | `backend/services/groq_service.py` | AI analysis & scoring |
| Rewrite Service | `backend/services/rewrite_service.py` | AI-powered resume rewriting |
| Database | `backend/database.py` | MongoDB connection & collections |

### Backend Routers

| Router | Path | Endpoints |
|--------|------|-----------|
| Auth | `backend/routers/auth.py` | `/auth/signup`, `/auth/login` |
| Analyze | `backend/routers/analyze.py` | `POST /analyze` |
| History | `backend/routers/history.py` | `GET /history`, `GET /history/{id}` |
| Rewrite | `backend/routers/rewrite.py` | `POST /rewrite/{id}`, `GET /rewrite/{id}/download` |

---

## Database Schema

### MongoDB Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  email: string (unique, lowercase),
  name: string,
  password_hash: string,
  created_at: Date
}
```

**Indexes:**
- `email` (unique)
- `created_at`

#### Analyses Collection
```javascript
{
  _id: ObjectId,
  user_id: string (ObjectId),
  filename: string,
  uploaded_at: Date,
  overall_score: number (0-100),
  ats_score: number (0-100),
  strengths: [string],
  weaknesses: [string],
  action_items: [string],
  summary: string,
  raw_text: string (large text),
  rewritten_text: string (optional, large text)
}
```

**Indexes:**
- `user_id` (for querying user's analyses)
- `uploaded_at` (for sorting by date)
- Compound: `(user_id, uploaded_at)`

---

## Deployment Architecture

### Development Environment

```
Local Machine
├─ Frontend: http://localhost:5173 (Vite)
│  └─ npm run dev
│
└─ Backend: http://localhost:9000 (FastAPI)
   └─ python main.py
   
Environment: .env.local
├─ VITE_API_URL=http://localhost:9000
└─ Backend: MONGODB_URI, GROQ_API_KEY, JWT_SECRET
```

### Production Environment (Render)

```
Render Platform
├─ Frontend Service (Static Site)
│  ├─ Name: resume-ai-frontend
│  ├─ Framework: Vite (Node)
│  ├─ Build: npm install && npm run build
│  ├─ Output: frontend/dist
│  └─ URL: https://ai-resume-analyzer-1-5veb.onrender.com
│
└─ Backend Service (Web Service)
   ├─ Name: resume-ai-backend
   ├─ Language: Python 3.11
   ├─ Build: pip install -r requirements.txt
   ├─ Start: uvicorn main:app --host 0.0.0.0 --port $PORT
   ├─ Environment Variables:
   │  ├─ MONGODB_URI
   │  ├─ GROQ_API_KEY
   │  ├─ JWT_SECRET
   │  └─ DATABASE_URL
   └─ URL: https://ai-resume-analyzer-svry.onrender.com

External Services
├─ MongoDB Atlas (Cloud Database)
│  └─ Connection: MONGODB_URI
│
└─ Groq API (LLM Service)
   └─ API Key: GROQ_API_KEY
```

### Alternative: Vercel Frontend + Render Backend

```
Vercel (Frontend only)
├─ Static hosting for React build
├─ CDN for fast delivery
└─ URL: https://ai-resume-analyzer-tau-three.vercel.app

Render (Backend only)
├─ Same as above
└─ URL: https://ai-resume-analyzer-svry.onrender.com
```

---

## Request/Response Cycle Example

### Complete Flow: Resume Upload to Analysis

**Client Request:**
```
POST /analyze?user_id=507f1f77bcf86cd799439011 HTTP/1.1
Host: ai-resume-analyzer-svry.onrender.com
Content-Type: multipart/form-data

[Binary file data...]
```

**Server Processing (Sequence):**
```
1. Receive multipart request
2. Validate user_id
3. Extract file
4. Call Parser Service
   └─ pdfplumber / python-docx / plain text
   └─ Returns: text string
5. Call Groq Service
   └─ POST to Groq API
   └─ Send resume text
   └─ Receive analysis JSON
6. Create MongoDB document:
   {
     user_id: "...",
     filename: "resume.pdf",
     uploaded_at: "2026-05-18T...",
     overall_score: 85,
     ats_score: 78,
     strengths: [...],
     weaknesses: [...],
     action_items: [...],
     summary: "...",
     raw_text: "...",
     rewritten_text: null
   }
7. Insert into DB
8. Get inserted document ID
9. Return response
```

**Server Response:**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "507f1f77bcf86cd799439012",
  "filename": "resume.pdf",
  "overall_score": 85,
  "ats_score": 78,
  "strengths": [...],
  "weaknesses": [...],
  "action_items": [...],
  "summary": "..."
}
```

**Client Handling:**
```
1. Receive 200 response
2. Parse JSON
3. Update UI with results
4. Save analysis ID for future reference
5. Display scores and feedback
6. Offer rewrite option
```

---

## Security Measures

1. **Password Security**
   - PBKDF2-HMAC-SHA256 hashing
   - 100,000 iterations
   - Random salt (32 bytes)

2. **CORS Protection**
   - Whitelist specific origins
   - Allow only necessary methods
   - Validate headers

3. **Input Validation**
   - Email validation (EmailStr)
   - File type checking
   - File size limits (10MB)

4. **Authorization**
   - user_id parameter validation
   - User can only access their own data
   - MongoDB ObjectId validation

5. **Database Security**
   - MongoDB Atlas IP whitelist
   - Connection string in environment variables
   - No sensitive data in logs

---

## Performance Considerations

| Component | Optimization |
|-----------|--------------|
| Frontend | Vite bundling, code splitting, lazy loading |
| Backend | Async/await with Motor, connection pooling |
| Database | Indexes on user_id and uploaded_at |
| File Upload | Streaming multipart, size validation |
| AI Requests | Cached credentials, optimized prompts |

---

## Future Enhancements

- [ ] JWT token-based authentication
- [ ] Email verification
- [ ] Password reset flow
- [ ] Resume templates
- [ ] Batch resume analysis
- [ ] Export to PDF
- [ ] Collaboration features
- [ ] Resume optimization tracking
- [ ] Mobile app
- [ ] WebSocket real-time updates

---

## Support & Contribution

For questions or contributions:
- GitHub: https://github.com/SnehaS-14/AI-Resume-Analyzer-
- Issues: Create issue for bugs or features
- Documentation: Update as features evolve
