from fpdf import FPDF
from io import BytesIO
import re

def sanitize_text(text: str) -> str:
    text = text.replace('•', '-').replace('–', '-').replace('—', '-')
    return text.encode('ascii', errors='replace').decode('ascii')

def wrap_long_lines(text: str, max_length: int = 80) -> str:
    """Wrap long lines to prevent 'Not enough horizontal space' errors"""
    lines = text.split('\n')
    wrapped = []
    for line in lines:
        if len(line) > max_length:
            # Try to break at spaces
            words = line.split(' ')
            current_line = ''
            for word in words:
                if len(current_line) + len(word) + 1 <= max_length:
                    current_line += (' ' + word) if current_line else word
                else:
                    if current_line:
                        wrapped.append(current_line)
                    current_line = word
            if current_line:
                wrapped.append(current_line)
        else:
            wrapped.append(line)
    return '\n'.join(wrapped)

def parse_resume_content(text: str):
    """
    Parse resume text into structured sections.
    Returns a dict with name, title, contact, and sections.
    """
    lines = [l.strip() for l in text.split('\n') if l.strip()]

    data = {
        'name': '',
        'title': '',
        'contact': '',
        'summary': '',
        'sections': {}
    }

    current_section = None
    current_content = []

    # Common section keywords to detect
    section_keywords = [
        'PROFESSIONAL SUMMARY', 'SUMMARY', 'CAREER OBJECTIVE', 'OBJECTIVE',
        'WORK EXPERIENCE', 'PROFESSIONAL EXPERIENCE', 'EXPERIENCE',
        'EDUCATION', 'EDUCATIONAL', 'TECHNICAL SKILLS', 'SKILLS',
        'CERTIFICATIONS', 'CERTIFICATION', 'PROJECTS', 'PROJECT',
        'INTERNSHIP', 'INTERNSHIPS', 'ACHIEVEMENTS', 'ACHIEVEMENT',
        'EXTRA CURRICULAR', 'LANGUAGES', 'CONTACT', 'CONTACT INFORMATION'
    ]

    for i, line in enumerate(lines):
        clean_line = line.replace('**', '').replace('*', '').strip()

        # First non-empty line is usually the name
        if i == 0 and not data['name']:
            data['name'] = clean_line
            continue

        # Check if this is a section header
        is_section_header = False
        section_name = None

        # Check for exact matches or with colon
        line_upper = clean_line.upper().rstrip(':')
        for keyword in section_keywords:
            if keyword == line_upper or keyword in line_upper:
                is_section_header = True
                section_name = clean_line.rstrip(':').upper()
                break

        if is_section_header:
            # Save previous section
            if current_section:
                data['sections'][current_section] = [l for l in current_content if l]
            current_section = section_name
            current_content = []
        elif current_section:
            current_content.append(clean_line)
        elif i < 3 and '@' in clean_line:
            # Likely contact info
            data['contact'] = clean_line
        elif i < 3 and '|' in clean_line and not data['title']:
            # Likely title/position
            data['title'] = clean_line

    # Save last section
    if current_section:
        data['sections'][current_section] = [l for l in current_content if l]

    return data


def generate_resume_pdf_from_text(resume_text: str) -> bytes:
    """
    Generate a professional, ATS-optimized resume PDF with premium formatting.
    Matches the professional template design with proper spacing and typography.
    """
    resume_text = sanitize_text(resume_text)
    resume_text = wrap_long_lines(resume_text, max_length=70)
    data = parse_resume_content(resume_text)

    pdf = FPDF(orientation='P', unit='mm', format='A4')
    pdf.add_page()
    pdf.set_margins(left=8, top=10, right=8)
    pdf.set_auto_page_break(auto=True, margin=10)

    # ===== HEADER SECTION =====
    if data['name']:
        pdf.set_font("Helvetica", "B", 18)
        pdf.set_text_color(20, 20, 20)
        pdf.cell(0, 10, sanitize_text(data['name']), ln=True, align='C')

    if data['title']:
        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(50, 50, 50)
        pdf.cell(0, 6, sanitize_text(data['title']), ln=True, align='C')

    if data['contact']:
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(80, 80, 80)
        pdf.cell(0, 5, sanitize_text(data['contact']), ln=True, align='C')

    pdf.ln(3)

    # ===== SECTIONS =====
    for section_name, content in data['sections'].items():
        if not content:
            continue

        # Section Header with Underline
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(0, 0, 0)
        pdf.cell(0, 7, sanitize_text(section_name), ln=True)

        # Underline
        pdf.set_draw_color(0, 0, 0)
        pdf.line(8, pdf.get_y() - 2, 202, pdf.get_y() - 2)
        pdf.ln(2)

        # Content
        if section_name == 'PROFESSIONAL SUMMARY':
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(40, 40, 40)
            for line in content:
                pdf.multi_cell(0, 4, sanitize_text(line))

        elif section_name == 'WORK EXPERIENCE':
            for line in content:
                if line and not line.startswith('-'):
                    # Job title or company info
                    if any(year in line for year in ['20', '19', '–', '-', 'Present']):
                        pdf.set_font("Helvetica", "B", 10)
                        pdf.set_text_color(0, 0, 0)
                    else:
                        pdf.set_font("Helvetica", "B", 10)
                        pdf.set_text_color(20, 20, 20)
                    pdf.multi_cell(0, 4.5, sanitize_text(line))
                elif line.startswith('-') or line.startswith('•'):
                    # Bullet point
                    pdf.set_font("Helvetica", "", 9.5)
                    pdf.set_text_color(40, 40, 40)
                    clean_bullet = line.lstrip('-•').strip()
                    pdf.multi_cell(0, 4, "- " + sanitize_text(clean_bullet))
            pdf.ln(1)

        elif section_name == 'EDUCATION':
            for line in content:
                if line and not line.startswith('-'):
                    if 'Graduated:' in line or 'graduated' in line.lower():
                        pdf.set_font("Helvetica", "", 9)
                        pdf.set_text_color(60, 60, 60)
                    else:
                        pdf.set_font("Helvetica", "B", 10)
                        pdf.set_text_color(0, 0, 0)
                    pdf.multi_cell(0, 4.5, sanitize_text(line))
                elif line.startswith('-'):
                    pdf.set_font("Helvetica", "", 9.5)
                    pdf.set_text_color(40, 40, 40)
                    clean = line.lstrip('-•').strip()
                    pdf.multi_cell(0, 4, "- " + sanitize_text(clean))
            pdf.ln(1)

        elif section_name in ['SKILLS', 'CERTIFICATIONS']:
            for line in content:
                if line:
                    if line.startswith('-') or line.startswith('•'):
                        clean = line.lstrip('-•').strip()
                        text = "- " + sanitize_text(clean)
                    else:
                        text = sanitize_text(line)

                    pdf.set_font("Helvetica", "", 9.5)
                    pdf.set_text_color(40, 40, 40)
                    pdf.multi_cell(0, 4, text)
            pdf.ln(1)

        else:
            # Default formatting for other sections
            for line in content:
                if line.startswith('-') or line.startswith('•'):
                    pdf.set_font("Helvetica", "", 9.5)
                    pdf.set_text_color(40, 40, 40)
                    clean = line.lstrip('-•').strip()
                    pdf.multi_cell(0, 4, "- " + sanitize_text(clean))
                else:
                    pdf.set_font("Helvetica", "", 9)
                    pdf.set_text_color(40, 40, 40)
                    pdf.multi_cell(0, 4, sanitize_text(line))
            pdf.ln(1)

        pdf.set_text_color(0, 0, 0)

    pdf_bytes = BytesIO()
    pdf.output(pdf_bytes)
    return pdf_bytes.getvalue()


def generate_ats_resume_template() -> bytes:
    """
    Generate an ATS-optimized resume template PDF.
    Returns PDF as bytes.
    """
    pdf = FPDF(orientation='P', unit='mm', format='A4')
    pdf.add_page()
    pdf.set_margins(left=15, top=15, right=15)
    pdf.set_auto_page_break(auto=True, margin=15)

    # Title
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 8, "YOUR NAME", ln=True, align='C')

    # Contact Info
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, "(123) 456-7890 | your.email@example.com | LinkedIn.com/in/yourprofile", ln=True, align='C')

    # Add space
    pdf.ln(4)

    # Professional Summary Section
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(0, 6, "PROFESSIONAL SUMMARY", ln=True)
    pdf.set_draw_color(0, 0, 0)
    pdf.line(15, pdf.get_y(), 195, pdf.get_y())

    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(40, 40, 40)
    pdf.multi_cell(0, 5, "Brief overview of your professional background, key achievements, and career goals.")
    pdf.ln(2)

    # Experience Section
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 6, "PROFESSIONAL EXPERIENCE", ln=True)
    pdf.set_draw_color(0, 0, 0)
    pdf.line(15, pdf.get_y(), 195, pdf.get_y())

    # Job 1
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 5, "Job Title | Company Name | City, State", ln=True)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(60, 60, 60)
    pdf.cell(0, 4, "Month Year - Month Year", ln=True)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(40, 40, 40)
    pdf.cell(0, 4, "- Achievement with quantified results (40% improvement)", ln=True)
    pdf.cell(0, 4, "- Responsibility involving specific technology or methodology", ln=True)
    pdf.cell(0, 4, "- Impact on team, department, or company metrics", ln=True)
    pdf.ln(2)

    # Job 2
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 5, "Previous Job Title | Previous Company | City, State", ln=True)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(60, 60, 60)
    pdf.cell(0, 4, "Month Year - Month Year", ln=True)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(40, 40, 40)
    pdf.cell(0, 4, "- Key accomplishment with measurable impact", ln=True)
    pdf.cell(0, 4, "- Relevant skill or technology implemented", ln=True)
    pdf.cell(0, 4, "- Business value or efficiency gain", ln=True)
    pdf.ln(2)

    # Education Section
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 6, "EDUCATION", ln=True)
    pdf.set_draw_color(0, 0, 0)
    pdf.line(15, pdf.get_y(), 195, pdf.get_y())

    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 5, "Degree Name | University Name | Graduation Year", ln=True)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(40, 40, 40)
    pdf.cell(0, 4, "GPA: 3.8/4.0 | Relevant Coursework: Course1, Course2", ln=True)
    pdf.ln(2)

    # Skills Section
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 6, "TECHNICAL SKILLS", ln=True)
    pdf.set_draw_color(0, 0, 0)
    pdf.line(15, pdf.get_y(), 195, pdf.get_y())

    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(40, 40, 40)
    pdf.cell(0, 4, "Languages: Python, JavaScript, Java, SQL", ln=True)
    pdf.cell(0, 4, "Frameworks: React, Node.js, FastAPI, Docker", ln=True)
    pdf.cell(0, 4, "Databases: PostgreSQL, MongoDB, Redis", ln=True)
    pdf.cell(0, 4, "Other: Git, AWS, Linux, Agile/Scrum", ln=True)
    pdf.ln(2)

    # Certifications Section
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 6, "CERTIFICATIONS", ln=True)
    pdf.set_draw_color(0, 0, 0)
    pdf.line(15, pdf.get_y(), 195, pdf.get_y())

    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(40, 40, 40)
    pdf.cell(0, 4, "- Certification Name - Issuing Organization, Year", ln=True)
    pdf.cell(0, 4, "- Award or Recognition - Organization, Year", ln=True)

    # Return PDF as bytes
    pdf_bytes = BytesIO()
    pdf.output(pdf_bytes)
    return pdf_bytes.getvalue()
