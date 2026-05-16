from fastapi import APIRouter, HTTPException, Query
from bson.objectid import ObjectId

from database import get_collection

router = APIRouter()


@router.get("/history")
async def get_history(user_id: str = Query(...), limit: int = 20):
    """
    Get list of past resume analyses for a specific user (last 20 by default), ordered by date descending.
    """
    collection = get_collection()
    cursor = collection.find({"user_id": user_id}).sort("uploaded_at", -1).limit(limit)
    analyses = []

    async for doc in cursor:
        analyses.append({
            "id": str(doc["_id"]),
            "filename": doc["filename"],
            "uploaded_at": doc["uploaded_at"].isoformat(),
            "overall_score": doc["overall_score"],
            "ats_score": doc["ats_score"],
            "strengths": doc.get("strengths", []),
            "weaknesses": doc.get("weaknesses", []),
            "action_items": doc.get("action_items", []),
            "summary": doc["summary"],
            "rewritten_text": doc.get("rewritten_text"),
        })

    return {"analyses": analyses}


@router.get("/history/{id}")
async def get_history_detail(id: str):
    """
    Get full details of a specific resume analysis by MongoDB ObjectId.
    """
    collection = get_collection()
    try:
        doc = await collection.find_one({"_id": ObjectId(id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    if not doc:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return {
        "id": str(doc["_id"]),
        "filename": doc["filename"],
        "uploaded_at": doc["uploaded_at"].isoformat(),
        "overall_score": doc["overall_score"],
        "ats_score": doc["ats_score"],
        "strengths": doc["strengths"],
        "weaknesses": doc["weaknesses"],
        "action_items": doc["action_items"],
        "summary": doc["summary"],
        "raw_text": doc["raw_text"],
        "rewritten_text": doc.get("rewritten_text"),
    }
