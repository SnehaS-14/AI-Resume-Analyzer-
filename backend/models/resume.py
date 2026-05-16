from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ResumeAnalysis(BaseModel):
    filename: str
    uploaded_at: datetime
    overall_score: int
    ats_score: int
    strengths: list[str]
    weaknesses: list[str]
    action_items: list[str]
    summary: str
    raw_text: str
    rewritten_text: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "filename": "resume.pdf",
                "uploaded_at": "2026-05-09T17:00:00Z",
                "overall_score": 85,
                "ats_score": 78,
                "strengths": ["Clear accomplishments"],
                "weaknesses": ["Missing keywords"],
                "action_items": ["Add metrics"],
                "summary": "Strong resume with room for improvement",
                "raw_text": "...",
                "rewritten_text": None,
            }
        }
