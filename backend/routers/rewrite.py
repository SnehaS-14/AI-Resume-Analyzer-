from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse, PlainTextResponse
from bson.objectid import ObjectId

from database import get_collection
from services.rewrite_service import rewrite_resume

router = APIRouter()


@router.post("/rewrite/{id}")
async def rewrite(id: str, user_id: str = Query(...)):
    """
    Rewrite a resume based on action items. Saves rewritten text to MongoDB.
    """
    collection = get_collection()
    try:
        doc = await collection.find_one({"_id": ObjectId(id), "user_id": user_id})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    if not doc:
        raise HTTPException(status_code=404, detail="Analysis not found")

    original_text = doc["raw_text"]
    action_items = doc["action_items"]

    rewritten_text = rewrite_resume(original_text, action_items)

    await collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"rewritten_text": rewritten_text}}
    )

    return {"rewritten_text": rewritten_text}


@router.get("/rewrite/{id}/download")
async def download_rewritten(id: str, user_id: str = Query(...)):
    """
    Download the rewritten resume as a .txt file.
    """
    collection = get_collection()
    try:
        doc = await collection.find_one({"_id": ObjectId(id), "user_id": user_id})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    if not doc:
        raise HTTPException(status_code=404, detail="Analysis not found")

    rewritten_text = doc.get("rewritten_text")
    if not rewritten_text:
        raise HTTPException(status_code=400, detail="Resume not yet rewritten")

    filename = doc["filename"].rsplit(".", 1)[0] + "_rewritten.txt"

    return PlainTextResponse(
        content=rewritten_text,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
