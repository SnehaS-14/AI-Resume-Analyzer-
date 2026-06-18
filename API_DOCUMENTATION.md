# API Documentation - AI Resume Analyzer

## Overview

The AI Resume Analyzer API is a FastAPI-based REST API that provides endpoints for user authentication, resume analysis using AI, and resume rewriting capabilities.

**Base URL:** `https://ai-resume-analyzer-svry.onrender.com`

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Resume Analysis Endpoints](#resume-analysis-endpoints)
3. [History Endpoints](#history-endpoints)
4. [Rewrite Endpoints](#rewrite-endpoints)
5. [Error Handling](#error-handling)
6. [Data Models](#data-models)

---

## Authentication Endpoints

### 1. User Signup

**Endpoint:** `POST /auth/signup`

**Description:** Register a new user account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Request Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Full name of the user |
| email | string | Yes | Email address (must be valid email format) |
| password | string | Yes | Password (min 6 characters recommended) |

**Response (200 OK):**
```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "email": "john@example.com",
  "name": "John Doe",
  "message": "Signup successful"
}
```

**Possible Errors:**
| Status | Detail |
|--------|--------|
| 400 | Email already registered |
| 422 | Invalid email format or missing fields |

**Example with cURL:**
```bash
curl -X POST "https://ai-resume-analyzer-svry.onrender.com/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

---

### 2. User Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and get user credentials

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Request Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string | Yes | Registered email address |
| password | string | Yes | User password |

**Response (200 OK):**
```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "email": "john@example.com",
  "name": "John Doe",
  "message": "Login successful"
}
```

**Possible Errors:**
| Status | Detail |
|--------|--------|
| 401 | Invalid email or password |
| 422 | Missing required fields |

**Example with cURL:**
```bash
curl -X POST "https://ai-resume-analyzer-svry.onrender.com/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

---

## Resume Analysis Endpoints

### 3. Analyze Resume

**Endpoint:** `POST /analyze`

**Description:** Upload and analyze a resume using AI

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Query Parameters: `user_id` (required)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | string | Yes | MongoDB ObjectId of the user |

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | Yes | Resume file (PDF, DOCX, or TXT, max 10MB) |

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439012",
  "filename": "resume.pdf",
  "overall_score": 85,
  "ats_score": 78,
  "strengths": [
    "Strong technical background",
    "Clear career progression",
    "Relevant certifications listed"
  ],
  "weaknesses": [
    "Missing specific achievements with metrics",
    "Could improve keyword optimization",
    "Limited diversity of experiences"
  ],
  "action_items": [
    "Add quantifiable achievements (increased sales by X%)",
    "Include more industry keywords",
    "Expand skill section with technical proficiencies"
  ],
  "summary": "Your resume shows solid fundamentals with strong technical background. Consider adding more quantifiable achievements and optimizing for ATS compatibility."
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| id | string | MongoDB ObjectId of the analysis record |
| filename | string | Name of uploaded file |
| overall_score | integer | Overall resume score (0-100) |
| ats_score | integer | ATS compatibility score (0-100) |
| strengths | array | List of resume strengths |
| weaknesses | array | List of areas for improvement |
| action_items | array | Specific recommendations to improve resume |
| summary | string | AI-generated summary analysis |

**Possible Errors:**
| Status | Detail |
|--------|--------|
| 400 | Invalid file format or missing user_id |
| 413 | File too large (max 10MB) |
| 422 | Missing required fields |

**Example with cURL:**
```bash
curl -X POST "https://ai-resume-analyzer-svry.onrender.com/analyze?user_id=507f1f77bcf86cd799439011" \
  -F "file=@resume.pdf"
```

**Example with JavaScript/Fetch:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch(
  'https://ai-resume-analyzer-svry.onrender.com/analyze?user_id=USER_ID',
  {
    method: 'POST',
    body: formData
  }
);
const result = await response.json();
```

---

## History Endpoints

### 4. Get User Analysis History

**Endpoint:** `GET /history`

**Description:** Get list of past resume analyses for a user

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| user_id | string | Yes | - | MongoDB ObjectId of the user |
| limit | integer | No | 20 | Maximum number of records to return |

**Response (200 OK):**
```json
{
  "analyses": [
    {
      "id": "507f1f77bcf86cd799439012",
      "filename": "resume_v1.pdf",
      "uploaded_at": "2026-05-18T10:30:00Z",
      "overall_score": 85,
      "ats_score": 78,
      "strengths": ["Strong technical background"],
      "weaknesses": ["Missing metrics"],
      "action_items": ["Add quantifiable achievements"],
      "summary": "Good resume with room for improvement",
      "rewritten_text": null
    },
    {
      "id": "507f1f77bcf86cd799439013",
      "filename": "resume_v2.pdf",
      "uploaded_at": "2026-05-17T15:20:00Z",
      "overall_score": 88,
      "ats_score": 82,
      "strengths": ["Improved metrics"],
      "weaknesses": [],
      "action_items": [],
      "summary": "Excellent resume",
      "rewritten_text": "Improved resume text here..."
    }
  ]
}
```

**Possible Errors:**
| Status | Detail |
|--------|--------|
| 422 | Missing user_id parameter |

**Example with cURL:**
```bash
curl "https://ai-resume-analyzer-svry.onrender.com/history?user_id=507f1f77bcf86cd799439011&limit=20"
```

---

### 5. Get Analysis Details

**Endpoint:** `GET /history/{id}`

**Description:** Get full details of a specific resume analysis

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB ObjectId of the analysis |

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439012",
  "filename": "resume.pdf",
  "uploaded_at": "2026-05-18T10:30:00Z",
  "overall_score": 85,
  "ats_score": 78,
  "strengths": ["Strong technical background"],
  "weaknesses": ["Missing specific metrics"],
  "action_items": ["Add quantifiable achievements"],
  "summary": "Your resume shows solid fundamentals...",
  "raw_text": "Full resume text extracted from PDF...",
  "rewritten_text": null
}
```

**Possible Errors:**
| Status | Detail |
|--------|--------|
| 400 | Invalid ID format |
| 404 | Analysis not found |

**Example with cURL:**
```bash
curl "https://ai-resume-analyzer-svry.onrender.com/history/507f1f77bcf86cd799439012"
```

---

## Rewrite Endpoints

### 6. Rewrite Resume

**Endpoint:** `POST /rewrite/{id}`

**Description:** Generate an improved version of a resume based on AI recommendations

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB ObjectId of the analysis |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | string | Yes | MongoDB ObjectId of the user (for authorization) |

**Response (200 OK):**
```json
{
  "rewritten_text": "Improved resume text with better formatting, metrics, and keywords added based on the action items..."
}
```

**Possible Errors:**
| Status | Detail |
|--------|--------|
| 400 | Invalid ID format or analysis not found |
| 404 | Analysis not found |
| 403 | Unauthorized (user_id doesn't match) |

**Example with cURL:**
```bash
curl -X POST "https://ai-resume-analyzer-svry.onrender.com/rewrite/507f1f77bcf86cd799439012?user_id=507f1f77bcf86cd799439011"
```

---

### 7. Download Rewritten Resume

**Endpoint:** `GET /rewrite/{id}/download`

**Description:** Download the rewritten resume as a PDF file

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB ObjectId of the analysis |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | string | Yes | MongoDB ObjectId of the user |

**Response (200 OK):**
- Content-Type: `application/pdf`
- File attachment with name: `{original_filename}_rewritten.pdf`
- Body: PDF binary content of rewritten resume

**Possible Errors:**
| Status | Detail |
|--------|--------|
| 400 | Invalid ID format or resume not yet rewritten |
| 404 | Analysis not found |
| 403 | Unauthorized |
| 500 | Failed to generate PDF |

**Example with cURL:**
```bash
curl "https://ai-resume-analyzer-svry.onrender.com/rewrite/507f1f77bcf86cd799439012/download?user_id=507f1f77bcf86cd799439011" \
  -o rewritten_resume.pdf
```

---

## Health Check Endpoint

### 8. Health Check

**Endpoint:** `GET /health`

**Description:** Check API and database connectivity

**Response (200 OK):**
```json
{
  "status": "ok",
  "database": "connected"
}
```

**Example with cURL:**
```bash
curl "https://ai-resume-analyzer-svry.onrender.com/health"
```

---

## Error Handling

### Error Response Format

All errors follow this format:

```json
{
  "detail": "Description of the error"
}
```

### Common HTTP Status Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | Success - Request completed successfully |
| 400 | Bad Request - Invalid request parameters or format |
| 401 | Unauthorized - Invalid credentials |
| 403 | Forbidden - User doesn't have permission |
| 404 | Not Found - Resource doesn't exist |
| 413 | Payload Too Large - File exceeds size limit |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error - Server-side error |

---

## Data Models

### User Model
```python
{
  "_id": ObjectId,           # MongoDB ID
  "email": string,           # User email (lowercase, unique)
  "name": string,            # User full name
  "password_hash": string,   # PBKDF2 hashed password with salt
  "created_at": datetime     # Account creation timestamp
}
```

### Resume Analysis Model
```python
{
  "_id": ObjectId,           # MongoDB ID
  "user_id": string,         # User's MongoDB ID
  "filename": string,        # Original file name
  "uploaded_at": datetime,   # Upload timestamp
  "overall_score": int,      # Overall score (0-100)
  "ats_score": int,          # ATS compatibility score (0-100)
  "strengths": [string],     # List of strengths
  "weaknesses": [string],    # List of weaknesses
  "action_items": [string],  # Improvement recommendations
  "summary": string,         # AI-generated summary
  "raw_text": string,        # Extracted resume text
  "rewritten_text": string   # AI-rewritten resume (nullable)
}
```

---

## Rate Limiting

- **Free Tier:** 30 requests per minute per user
- **Groq API:** Uses shared free tier (rate limited by Groq)

---

## Authentication

This API uses **implicit authentication** via `user_id` parameter. 

**Important:** In a production environment, implement JWT tokens for secure authentication:
```javascript
// Example future implementation:
const response = await fetch('/analyze', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: formData
});
```

---

## CORS Configuration

The API accepts requests from:
- `http://localhost:5173` (local Vite dev)
- `https://ai-resume-analyzer-1-5veb.onrender.com` (Render frontend)
- `https://ai-resume-analyzer-tau-three.vercel.app` (Vercel frontend)

---

## Support & Issues

For issues or questions:
- GitHub Issues: https://github.com/SnehaS-14/AI-Resume-Analyzer-/issues
- Email: Contact through GitHub profile
