from fastapi import APIRouter
from fastapi.responses import Response
from pydantic import BaseModel

from services.template_service import generate_ats_resume_template, generate_resume_pdf_from_text

router = APIRouter()


class ResumeTextRequest(BaseModel):
    resume_text: str


@router.get("/template/resume/download")
async def download_resume_template():
    """
    Download an ATS-optimized resume template as PDF.
    Users can fill in their information after downloading.
    """
    pdf_bytes = generate_ats_resume_template()

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=Resume_Template.pdf"}
    )


@router.post("/template/resume/pdf")
async def generate_resume_pdf(request: ResumeTextRequest):
    """
    Generate a professional ATS-optimized PDF from resume text.
    Used for converting rewritten resumes to PDF format.
    """
    pdf_bytes = generate_resume_pdf_from_text(request.resume_text)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=Resume_Rewritten.pdf"}
    )
