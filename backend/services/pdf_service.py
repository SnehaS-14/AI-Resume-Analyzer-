"""
Service for generating PDF resumes from text content.
"""

from io import BytesIO
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY


def generate_resume_pdf(resume_text: str) -> BytesIO:
    """
    Generate a professional PDF from resume text.

    Args:
        resume_text: The resume content as plain text

    Returns:
        BytesIO object containing the PDF data
    """
    # Create BytesIO buffer
    pdf_buffer = BytesIO()

    # Create PDF document
    doc = SimpleDocTemplate(
        pdf_buffer,
        pagesize=letter,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch
    )

    # Build styles
    styles = getSampleStyleSheet()

    # Custom styles for resume
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=14,
        textColor='#333333',
        spaceAfter=6,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )

    section_style = ParagraphStyle(
        'CustomSection',
        parent=styles['Heading2'],
        fontSize=11,
        textColor='#333333',
        spaceAfter=8,
        spaceBefore=8,
        fontName='Helvetica-Bold',
        borderPadding=3
    )

    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=10,
        textColor='#444444',
        spaceAfter=6,
        alignment=TA_JUSTIFY,
        leading=12
    )

    # Split text into lines and process
    story = []
    lines = resume_text.split('\n')

    for line in lines:
        line = line.strip()

        if not line:
            # Empty line - add spacer
            story.append(Spacer(1, 0.1 * inch))

        elif line.isupper() and len(line) < 100:
            # Looks like a section header
            story.append(Paragraph(line, section_style))
            story.append(Spacer(1, 0.05 * inch))

        elif line.startswith('•') or line.startswith('-'):
            # Bullet point
            story.append(Paragraph(line, body_style))

        else:
            # Regular text
            story.append(Paragraph(line, body_style))

    # Build PDF
    try:
        doc.build(story)
    except Exception as e:
        raise Exception(f"Failed to generate PDF: {str(e)}")

    # Reset buffer position to beginning
    pdf_buffer.seek(0)

    return pdf_buffer


def text_to_pdf_bytes(text: str) -> bytes:
    """
    Convert resume text to PDF bytes.

    Args:
        text: Resume text content

    Returns:
        PDF content as bytes
    """
    pdf_buffer = generate_resume_pdf(text)
    return pdf_buffer.getvalue()
