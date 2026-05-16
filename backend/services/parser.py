import io
import pdfplumber
from docx import Document
from fastapi import UploadFile, HTTPException


async def extract_text(file: UploadFile) -> str:
    """
    Read raw bytes from an UploadFile (backed by SpooledTemporaryFile),
    then dispatch to the appropriate extractor based on content type / filename.
    """
    raw_bytes: bytes = await file.read()

    filename = (file.filename or "").lower()

    if filename.endswith(".pdf") or file.content_type == "application/pdf":
        return _extract_pdf(raw_bytes)
    elif filename.endswith(".docx") or file.content_type in (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ):
        return _extract_docx(raw_bytes)
    elif filename.endswith(".txt") or file.content_type == "text/plain":
        return _extract_txt(raw_bytes)
    else:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported file type: '{file.filename}'. "
                   "Please upload a PDF, DOCX, or TXT file.",
        )


def _extract_pdf(data: bytes) -> str:
    """Extract text from PDF bytes using pdfplumber."""
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        pages = [page.extract_text() or "" for page in pdf.pages]
    text = "\n".join(pages).strip()
    if not text:
        raise HTTPException(
            status_code=422,
            detail="Could not extract text from PDF. "
                   "The file may be image-based (scanned). "
                   "Please use a text-based PDF.",
        )
    return text


def _extract_docx(data: bytes) -> str:
    """Extract text from DOCX bytes using python-docx."""
    doc = Document(io.BytesIO(data))
    paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
    text = "\n".join(paragraphs).strip()
    if not text:
        raise HTTPException(
            status_code=422,
            detail="Could not extract text from DOCX file.",
        )
    return text


def _extract_txt(data: bytes) -> str:
    """Decode plain text bytes, trying UTF-8 then Latin-1 fallback."""
    try:
        return data.decode("utf-8").strip()
    except UnicodeDecodeError:
        return data.decode("latin-1").strip()
