from fastapi import APIRouter, UploadFile, File, Query
from fastapi.responses import JSONResponse
from datetime import datetime
from bson.objectid import ObjectId

from services.parser import extract_text
from services.groq_service import analyze_resume
from database import get_collection
from models.resume import ResumeAnalysis

router = APIRouter()


@router.post("/analyze")
async def analyze(file: UploadFile = File(...), user_id: str = Query(...)):
    """
    Accept a resume file (PDF, DOCX, TXT), extract its text,
    analyze it with Groq, save to MongoDB with user_id, and return structured JSON with ID.
    """
    text = await extract_text(file)
    result = analyze_resume(text)

    document = {
        "user_id": user_id,
        "filename": file.filename,
        "uploaded_at": datetime.utcnow(),
        "overall_score": result["overall_score"],
        "ats_score": result["ats_score"],
        "strengths": result["strengths"],
        "weaknesses": result["weaknesses"],
        "action_items": result["action_items"],
        "summary": result["summary"],
        "raw_text": text,
        "rewritten_text": None,
    }

    collection = get_collection()
    insert_result = await collection.insert_one(document)

    return JSONResponse(content={
        **result,
        "id": str(insert_result.inserted_id),
        "filename": file.filename,
    })
