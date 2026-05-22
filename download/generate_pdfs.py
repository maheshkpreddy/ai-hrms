#!/usr/bin/env python3
"""
AI-HRMS PDF Generation Script
Generates 3 formal PDF documents from markdown documentation using ReportLab pipeline.
"""

import os
import sys
import hashlib
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm, mm
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, CondPageBreak, HRFlowable
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ━━ FONT REGISTRATION ━━
# NotoSansSC is a variable font - use SarasaMonoSC for CJK fallback instead
# pdfmetrics.registerFont(TTFont('NotoSansSC', '/usr/share/fonts/truetype/chinese/NotoSansSC[wght].ttf'))
pdfmetrics.registerFont(TTFont('LiberationSans', '/usr/share/fonts/truetype/chinese/LiberationSans-Regular.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSerif', '/usr/share/fonts/truetype/chinese/LiberationSerif-Regular.ttf'))
pdfmetrics.registerFont(TTFont('SarasaMonoSC', '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('SarasaMonoSC-Bold', '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Bold.ttf'))
# Tinos is not a valid TrueType font - use Liberation Serif instead
pdfmetrics.registerFont(TTFont('LiberationSerif-Bold', '/usr/share/fonts/truetype/chinese/LiberationSerif-Regular.ttf'))  # No bold available, use regular
pdfmetrics.registerFont(TTFont('Carlito', '/usr/share/fonts/truetype/english/Carlito-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Carlito-Bold', '/usr/share/fonts/truetype/english/Carlito-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Carlito-Italic', '/usr/share/fonts/truetype/english/Carlito-Italic.ttf'))
pdfmetrics.registerFont(TTFont('Carlito-BoldItalic', '/usr/share/fonts/truetype/english/Carlito-BoldItalic.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans-Bold', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSansMono', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))

registerFontFamily('LiberationSerif', normal='LiberationSerif', bold='LiberationSerif-Bold')
registerFontFamily('Carlito', normal='Carlito', bold='Carlito-Bold', italic='Carlito-Italic', boldItalic='Carlito-BoldItalic')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans-Bold')
registerFontFamily('SarasaMonoSC', normal='SarasaMonoSC', bold='SarasaMonoSC-Bold')
registerFontFamily('LiberationSans', normal='LiberationSans', bold='LiberationSans')
registerFontFamily('LiberationSerif', normal='LiberationSerif', bold='LiberationSerif')

# ━━ COLOR PALETTE (Emerald-based) ━━
EMERALD       = colors.HexColor('#10b981')
EMERALD_DARK  = colors.HexColor('#059669')
EMERALD_LIGHT = colors.HexColor('#d1fae5')
EMERALD_PALE  = colors.HexColor('#ecfdf5')
ACCENT        = EMERALD
TEXT_PRIMARY   = colors.HexColor('#1f2937')
TEXT_MUTED     = colors.HexColor('#6b7280')
BG_PAGE       = colors.white
BG_SURFACE    = colors.HexColor('#f3f4f6')
TABLE_STRIPE  = colors.HexColor('#f9fafb')
HEADER_FILL   = EMERALD_DARK
BORDER_COLOR  = colors.HexColor('#d1d5db')

# ━━ PAGE DIMENSIONS ━━
PAGE_W, PAGE_H = A4
LEFT_MARGIN = 1.0 * inch
RIGHT_MARGIN = 1.0 * inch
TOP_MARGIN = 0.8 * inch
BOTTOM_MARGIN = 0.8 * inch
CONTENT_W = PAGE_W - LEFT_MARGIN - RIGHT_MARGIN

# ━━ STYLES ━━
styles = getSampleStyleSheet()

def make_styles(doc_title):
    s = {}
    s['body'] = ParagraphStyle(
        'Body', fontName='Carlito', fontSize=10.5, leading=16,
        alignment=TA_JUSTIFY, textColor=TEXT_PRIMARY,
        spaceBefore=0, spaceAfter=6
    )
    s['body_left'] = ParagraphStyle(
        'BodyLeft', parent=s['body'], alignment=TA_LEFT
    )
    s['h1'] = ParagraphStyle(
        'H1', fontName='Carlito-Bold', fontSize=20, leading=26,
        alignment=TA_LEFT, textColor=EMERALD_DARK,
        spaceBefore=18, spaceAfter=10
    )
    s['h2'] = ParagraphStyle(
        'H2', fontName='Carlito-Bold', fontSize=15, leading=20,
        alignment=TA_LEFT, textColor=TEXT_PRIMARY,
        spaceBefore=14, spaceAfter=8
    )
    s['h3'] = ParagraphStyle(
        'H3', fontName='Carlito-Bold', fontSize=12.5, leading=17,
        alignment=TA_LEFT, textColor=TEXT_PRIMARY,
        spaceBefore=10, spaceAfter=6
    )
    s['h4'] = ParagraphStyle(
        'H4', fontName='Carlito-Bold', fontSize=11, leading=15,
        alignment=TA_LEFT, textColor=TEXT_MUTED,
        spaceBefore=8, spaceAfter=4
    )
    s['bullet'] = ParagraphStyle(
        'Bullet', fontName='Carlito', fontSize=10.5, leading=16,
        alignment=TA_LEFT, textColor=TEXT_PRIMARY,
        leftIndent=24, bulletIndent=12, spaceBefore=2, spaceAfter=2
    )
    s['numbered'] = ParagraphStyle(
        'Numbered', fontName='Carlito', fontSize=10.5, leading=16,
        alignment=TA_LEFT, textColor=TEXT_PRIMARY,
        leftIndent=24, spaceBefore=2, spaceAfter=2
    )
    s['note'] = ParagraphStyle(
        'Note', fontName='Carlito-Italic', fontSize=10, leading=15,
        alignment=TA_JUSTIFY, textColor=TEXT_MUTED,
        leftIndent=18, rightIndent=18, spaceBefore=6, spaceAfter=6,
        backColor=EMERALD_PALE, borderPadding=6
    )
    s['code'] = ParagraphStyle(
        'Code', fontName='SarasaMonoSC', fontSize=9, leading=13,
        alignment=TA_LEFT, textColor=colors.HexColor('#374151'),
        leftIndent=18, backColor=colors.HexColor('#f8f9fa'),
        borderPadding=6, spaceBefore=4, spaceAfter=4
    )
    s['table_header'] = ParagraphStyle(
        'TH', fontName='Carlito-Bold', fontSize=9.5, leading=13,
        alignment=TA_CENTER, textColor=colors.white
    )
    s['table_cell'] = ParagraphStyle(
        'TC', fontName='Carlito', fontSize=9, leading=13,
        alignment=TA_LEFT, textColor=TEXT_PRIMARY, wordWrap='CJK'
    )
    s['table_cell_center'] = ParagraphStyle(
        'TCC', fontName='Carlito', fontSize=9, leading=13,
        alignment=TA_CENTER, textColor=TEXT_PRIMARY, wordWrap='CJK'
    )
    s['toc_h1'] = ParagraphStyle(
        'TOCH1', fontName='Carlito-Bold', fontSize=12, leading=20,
        leftIndent=20, textColor=TEXT_PRIMARY
    )
    s['toc_h2'] = ParagraphStyle(
        'TOCH2', fontName='Carlito', fontSize=10.5, leading=18,
        leftIndent=40, textColor=TEXT_MUTED
    )
    s['toc_h3'] = ParagraphStyle(
        'TOCH3', fontName='Carlito', fontSize=9.5, leading=16,
        leftIndent=60, textColor=TEXT_MUTED
    )
    s['caption'] = ParagraphStyle(
        'Caption', fontName='Carlito-Italic', fontSize=9, leading=13,
        alignment=TA_CENTER, textColor=TEXT_MUTED,
        spaceBefore=3, spaceAfter=6
    )
    return s

# ━━ TOC DOC TEMPLATE ━━
class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))

# ━━ HEADING HELPERS ━━
def add_heading(text, style, level=0):
    key = 'h_%s' % hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/>%s' % (key, text), style)
    p.bookmark_name = text
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p

H1_ORPHAN_THRESHOLD = (PAGE_H - TOP_MARGIN - BOTTOM_MARGIN) * 0.15

def add_major_section(text, style):
    return [
        CondPageBreak(H1_ORPHAN_THRESHOLD),
        add_heading(text, style, level=0),
    ]

# ━━ TABLE HELPERS ━━
def make_table(headers, rows, col_widths=None, style_dict=None):
    """Create a formatted table with header and data rows."""
    st = make_styles('')
    data = []
    header_row = [Paragraph('<b>%s</b>' % h, st['table_header']) for h in headers]
    data.append(header_row)
    for row in rows:
        data_row = [Paragraph(str(c), st['table_cell']) for c in row]
        data.append(data_row)

    if col_widths is None:
        n = len(headers)
        col_widths = [CONTENT_W / n] * n

    # Ensure table fits
    total = sum(col_widths)
    if total > CONTENT_W:
        scale = CONTENT_W / total
        col_widths = [w * scale for w in col_widths]

    tbl = Table(data, colWidths=col_widths, hAlign='CENTER', repeatRows=1)
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_FILL),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]
    # Alternating row colors
    for i in range(1, len(data)):
        bg = colors.white if i % 2 == 1 else TABLE_STRIPE
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))

    tbl.setStyle(TableStyle(style_cmds))
    return tbl

def make_wide_table(headers, rows, col_widths=None):
    """Table for wide content like RBAC matrices."""
    st = make_styles('')
    data = []
    header_row = [Paragraph('<b>%s</b>' % h, st['table_header']) for h in headers]
    data.append(header_row)
    for row in rows:
        data_row = []
        for c in row:
            text = str(c) if c and str(c).strip() else ''
            if text in ('—', '-', ''):
                data_row.append(Paragraph(text, st['table_cell_center']))
            else:
                data_row.append(Paragraph(text, st['table_cell_center']))
        data.append(data_row)

    if col_widths is None:
        n = len(headers)
        col_widths = [CONTENT_W / n] * n

    total = sum(col_widths)
    if total > CONTENT_W:
        scale = CONTENT_W / total
        col_widths = [w * scale for w in col_widths]

    tbl = Table(data, colWidths=col_widths, hAlign='CENTER', repeatRows=1)
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_FILL),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]
    for i in range(1, len(data)):
        bg = colors.white if i % 2 == 1 else TABLE_STRIPE
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))

    tbl.setStyle(TableStyle(style_cmds))
    return tbl

# ━━ PAGE FOOTER ━━
def add_page_number(canvas, doc):
    canvas.saveState()
    canvas.setFont('Carlito', 8)
    canvas.setFillColor(TEXT_MUTED)
    page_num = canvas.getPageNumber()
    text = "Page %d" % page_num
    canvas.drawCentredString(PAGE_W / 2, 0.5 * inch, text)
    # Thin accent line at top
    canvas.setStrokeColor(EMERALD)
    canvas.setLineWidth(0.5)
    canvas.line(LEFT_MARGIN, PAGE_H - TOP_MARGIN + 10, PAGE_W - RIGHT_MARGIN, PAGE_H - TOP_MARGIN + 10)
    canvas.restoreState()

# ━━ COVER HTML GENERATOR ━━
def generate_cover_html(title, subtitle, doc_type, date_str, classification, output_path):
    """Generate an HTML cover page for rendering via html2poster.js"""
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet">
<style>
@page {{ size: 794px 1123px; margin: 0; }}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
html, body {{
  width: 794px; height: 1123px;
  margin: 0; padding: 0;
  font-family: 'Inter', 'Noto Sans SC', sans-serif;
  background: #ffffff;
  overflow: hidden;
}}
.cover {{
  width: 794px; height: 1123px;
  position: relative;
  padding: 0;
}}
.safe-zone {{
  position: absolute;
  top: 12%; bottom: 12%; left: 14%; right: 14%;
  display: flex; flex-direction: column; justify-content: space-between;
}}
/* Decorative elements */
.accent-bar {{
  position: absolute;
  left: 0; top: 0;
  width: 6px; height: 100%;
  background: #10b981;
}}
.top-line {{
  position: absolute;
  left: 14%; top: 10%;
  width: 30%; height: 2px;
  background: #10b981;
}}
.kicker {{
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #10b981;
  margin-bottom: 16px;
}}
.hero-title {{
  font-size: 38px;
  font-weight: 800;
  line-height: 1.2;
  color: #1f2937;
  margin-bottom: 12px;
}}
.hero-subtitle {{
  font-size: 20px;
  font-weight: 400;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 24px;
}}
.summary-block {{
  font-size: 14px;
  font-weight: 300;
  color: #4b5563;
  line-height: 1.7;
  max-width: 80%;
  border-left: 3px solid #10b981;
  padding-left: 16px;
}}
.meta-section {{
  display: flex;
  flex-direction: column;
  gap: 6px;
}}
.meta-item {{
  font-size: 12px;
  color: #6b7280;
  font-weight: 400;
}}
.meta-label {{
  font-weight: 600;
  color: #374151;
}}
.bottom-bar {{
  position: absolute;
  left: 14%; bottom: 10%;
  right: 14%;
  height: 1px;
  background: #d1d5db;
}}
/* Geometric accent */
.geo-circle {{
  position: absolute;
  right: 10%; top: 25%;
  width: 180px; height: 180px;
  border: 2px solid rgba(16, 185, 129, 0.15);
  border-radius: 50%;
}}
.geo-line {{
  position: absolute;
  right: 14%; top: 60%;
  width: 1px; height: 120px;
  background: rgba(16, 185, 129, 0.2);
}}
</style>
</head>
<body>
<div class="cover">
  <div class="accent-bar"></div>
  <div class="top-line"></div>
  <div class="geo-circle"></div>
  <div class="geo-line"></div>
  <div class="safe-zone">
    <div>
      <div class="kicker">{doc_type}</div>
      <div class="hero-title">{title}</div>
      <div class="hero-subtitle">{subtitle}</div>
      <div class="summary-block">
        A comprehensive document for the AI-Powered Human Resource Management System,
        covering module specifications, operational procedures, and system architecture.
      </div>
    </div>
    <div class="meta-section">
      <div class="meta-item"><span class="meta-label">Classification:</span> {classification}</div>
      <div class="meta-item"><span class="meta-label">Date:</span> {date_str}</div>
      <div class="meta-item"><span class="meta-label">Organization:</span> AI-HRMS Product Team</div>
    </div>
  </div>
  <div class="bottom-bar"></div>
</div>
</body>
</html>'''
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)

# ━━ BUILD PDF ━━
def build_document(output_path, title, subtitle, doc_type, date_str, classification, story_builder_func):
    """Build a complete PDF with cover, TOC, and body content."""
    base_dir = os.path.dirname(output_path)
    base_name = os.path.splitext(os.path.basename(output_path))[0]
    body_path = os.path.join(base_dir, f'{base_name}_body.pdf')
    cover_html_path = os.path.join(base_dir, f'{base_name}_cover.html')
    cover_pdf_path = os.path.join(base_dir, f'{base_name}_cover.pdf')

    st = make_styles(title)

    # Step 1: Build body PDF (no cover)
    doc = TocDocTemplate(
        body_path,
        pagesize=A4,
        leftMargin=LEFT_MARGIN,
        rightMargin=RIGHT_MARGIN,
        topMargin=TOP_MARGIN,
        bottomMargin=BOTTOM_MARGIN,
        title=title,
        author='Z.ai',
        creator='Z.ai',
        subject=subtitle
    )

    story = []

    # TOC
    toc = TableOfContents()
    toc.levelStyles = [st['toc_h1'], st['toc_h2'], st['toc_h3']]
    story.append(Paragraph('<b>Table of Contents</b>', st['h1']))
    story.append(Spacer(1, 12))
    story.append(toc)
    story.append(PageBreak())

    # Build body content via callback
    story_builder_func(story, st)

    doc.multiBuild(story, onLaterPages=add_page_number, onFirstPage=add_page_number)

    # Step 2: Generate cover HTML and render
    generate_cover_html(title, subtitle, doc_type, date_str, classification, cover_html_path)

    scripts_dir = '/home/z/my-project/skills/pdf/scripts'
    # Render cover
    import subprocess
    result = subprocess.run(
        ['node', os.path.join(scripts_dir, 'html2poster.js'),
         cover_html_path, '--output', cover_pdf_path, '--width', '794px'],
        capture_output=True, text=True, timeout=60
    )
    if result.returncode != 0:
        print(f"Cover render warning: {result.stderr}")

    # Step 3: Merge cover + body
    from pypdf import PdfReader, PdfWriter, Transformation
    A4_W, A4_H = 595.28, 841.89

    def normalize_page_to_a4(page):
        box = page.mediabox
        w, h = float(box.width), float(box.height)
        if abs(w - A4_W) > 2 or abs(h - A4_H) > 2:
            sx, sy = A4_W / w, A4_H / h
            page.add_transformation(Transformation().scale(sx=sx, sy=sy))
            page.mediabox.lower_left = (0, 0)
            page.mediabox.upper_right = (A4_W, A4_H)
        return page

    writer = PdfWriter()
    if os.path.exists(cover_pdf_path):
        cover_page = PdfReader(cover_pdf_path).pages[0]
        writer.add_page(normalize_page_to_a4(cover_page))
    else:
        print(f"Warning: Cover PDF not found at {cover_pdf_path}")

    for page in PdfReader(body_path).pages:
        writer.add_page(normalize_page_to_a4(page))

    writer.add_metadata({
        '/Title': title,
        '/Author': 'Z.ai',
        '/Creator': 'Z.ai',
        '/Subject': subtitle
    })
    with open(output_path, 'wb') as f:
        writer.write(f)

    # Cleanup temp files
    for p in [body_path, cover_html_path, cover_pdf_path]:
        if os.path.exists(p):
            try:
                os.remove(p)
            except:
                pass

    return output_path


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DOCUMENT 1: USER SOP
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def build_user_sop(story, st):
    # Module 1: Getting Started
    story.extend(add_major_section('1. Getting Started', st['h1']))
    story.append(Paragraph('<b>1.1 Purpose</b>', st['h2']))
    story.append(Paragraph(
        'This section provides first-time users with the foundational knowledge required to log in, navigate, '
        'and begin using the AI-HRMS Smart Workspace platform effectively.', st['body']))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>1.2 System Requirements</b>', st['h2']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Requirement', 'Specification'],
        [
            ['Browser', 'Chrome 90+, Firefox 88+, Safari 15+, Edge 90+'],
            ['Screen Resolution', 'Minimum 1280x720; recommended 1920x1080'],
            ['Mobile', 'iOS 15+ / Android 12+ (responsive web app)'],
            ['Network', 'Stable internet connection (minimum 2 Mbps)'],
        ],
        col_widths=[0.35*CONTENT_W, 0.65*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>1.3 Login Procedure</b>', st['h2']))
    steps = [
        'Open your web browser and navigate to the AI-HRMS URL provided by your organization.',
        'On the login screen, enter your <b>corporate email address</b> in the Email field.',
        'Enter your <b>password</b> in the Password field. Your initial password is sent to your corporate email by the HR Admin upon onboarding.',
        'Click the <b>Sign In</b> button.',
        'If Multi-Factor Authentication (MFA) is enabled for your account, enter the 6-digit code from your authenticator app.',
        'Upon first login, you will be prompted to <b>change your password</b>. Enter your current password, then your new password (minimum 12 characters, must include uppercase, lowercase, number, and special character).',
        'After changing your password, you will be redirected to the <b>Dashboard</b>.',
    ]
    for i, step in enumerate(steps, 1):
        story.append(Paragraph('%d. %s' % (i, step), st['numbered']))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        '<b>Security Note:</b> Never share your credentials. If you suspect unauthorized access, '
        'immediately contact IT Support and change your password.', st['note']))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>1.4 Navigation Overview</b>', st['h2']))
    nav_items = [
        '<b>Sidebar (Left Panel):</b> Contains navigation links to all 10 modules, a search bar to filter modules, the Settings button, and the Logout button. The sidebar can be collapsed by clicking the Collapse button. On mobile devices, the sidebar opens as a slide-out drawer via the hamburger menu.',
        '<b>Main Content Area (Center):</b> Displays the active module content, including data tables, forms, charts, and action buttons.',
        '<b>User Profile (Sidebar Footer):</b> Shows your name, role, and avatar. Click to view your profile details.',
        '<b>Notification Bell:</b> Located in the sidebar header; displays a count badge for unread notifications.',
        '<b>AI Badge:</b> Modules with AI-powered features display a green AI badge next to their name in the sidebar.',
    ]
    for item in nav_items:
        story.append(Paragraph(item, st['bullet']))
    story.append(Spacer(1, 18))

    # Module 2: Dashboard
    story.extend(add_major_section('2. Module 1: Dashboard', st['h1']))
    story.append(Paragraph('<b>2.1 Purpose and Scope</b>', st['h2']))
    story.append(Paragraph(
        'The Dashboard module serves as the central command center for the AI-HRMS platform. It provides a high-level '
        'overview of key HR metrics, live trends, AI-driven attrition predictions, recent activities, and pending '
        'approvals - all in real time. The Dashboard is the default landing page after login.', st['body']))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>2.2 Access by Role</b>', st['h2']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Role', 'Access Level'],
        [
            ['Super Admin', 'Full dashboard with all widgets and data'],
            ['HR Admin', 'Full dashboard with all widgets and data'],
            ['Payroll Specialist', 'Payroll and attendance widgets only'],
            ['Department Manager', 'Department-specific data and pending approvals'],
            ['Employee', 'Limited personal summary (leave balance, payslips)'],
            ['Recruiter', 'Recruitment-specific widgets'],
            ['L&D Manager', 'Training and skill-related widgets'],
        ],
        col_widths=[0.30*CONTENT_W, 0.70*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>2.3 Step-by-Step Procedures</b>', st['h2']))
    story.append(Paragraph('<b>2.3.1 Viewing Key Statistics</b>', st['h3']))
    stat_steps = [
        'After login, the Dashboard loads automatically. If on another module, click Dashboard in the sidebar.',
        'The top row displays four stat cards: Total Employees, Active Positions, Attendance Rate, and Monthly Payroll.',
        'Each card shows the current value, a trend indicator, and a contextual change message.',
        'Hover over any card to see it highlighted with a colored accent bar at the bottom.',
    ]
    for i, s in enumerate(stat_steps, 1):
        story.append(Paragraph('%d. %s' % (i, s), st['numbered']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>2.3.2 Reviewing Charts</b>', st['h3']))
    story.append(Paragraph('The Dashboard features three key charts:', st['body']))
    chart_items = [
        '<b>Headcount Trend Chart:</b> An area chart displaying monthly headcount over the past 12 months.',
        '<b>Department Distribution Chart:</b> A donut chart showing employee distribution across departments.',
        '<b>AI Attrition Predictions Chart:</b> A grouped bar chart comparing predicted risk vs. actual attrition by department. This chart carries the AI badge.',
    ]
    for item in chart_items:
        story.append(Paragraph(item, st['bullet']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>2.3.3 Using Quick Actions</b>', st['h3']))
    story.append(Paragraph(
        'Locate the Quick Actions card below the charts. Click any action button (e.g., "Add Employee," '
        '"Process Payroll," "Post Job," "Run Reports," "Schedule Interview," "Approve Leaves") to navigate '
        'directly to the relevant module.', st['body']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>2.3.4 Reviewing Pending Approvals</b>', st['h3']))
    story.append(Paragraph(
        'Locate the Pending Approvals card in the bottom row. Each item displays the employee name, request type, '
        'details, and an approve button. Click the checkmark icon to approve inline, or click the item for full details.', st['body']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>2.4 UI Descriptions</b>', st['h2']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['UI Element', 'Description'],
        [
            ['Stat Cards', 'Four rectangular cards in a horizontal row, each with icon, metric value, and trend indicator'],
            ['Headcount Trend', 'Green area chart with gradient fill, interactive tooltips'],
            ['Department Distribution', 'Donut chart with color-coded legend at the bottom'],
            ['AI Attrition Predictions', 'Dual-bar chart with amber (predicted) and green (actual) bars'],
            ['Quick Actions', 'Grid of outlined buttons with icons; hover turns border emerald'],
            ['Recent Activities', 'Scrollable list with icons, description text, and timestamps'],
            ['Pending Approvals', 'Scrollable list with request details and inline approve button'],
            ['Live Badge', 'A pulsing green dot labeled "Live" in the header indicating real-time data'],
        ],
        col_widths=[0.30*CONTENT_W, 0.70*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>2.5 Common Scenarios</b>', st['h2']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Scenario', 'Action'],
        [
            ['Dashboard not loading data', 'Check network connection and refresh. Clear browser cache or try a different browser.'],
            ['Need to approve multiple leaves quickly', 'Use Pending Approvals section on Dashboard to approve inline.'],
            ['Want a quick overview before a meeting', 'Check stat cards and AI Attrition Predictions for a 30-second summary.'],
        ],
        col_widths=[0.30*CONTENT_W, 0.70*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>2.6 Troubleshooting Tips</b>', st['h2']))
    tips = [
        '<b>Charts not rendering:</b> Ensure JavaScript is enabled. Check for browser extensions that may block chart rendering.',
        '<b>Stale data displayed:</b> Click the browser refresh button or press Ctrl+F5 for a hard refresh. Dashboard data may cache for up to 60 seconds.',
        '<b>Pending approvals count mismatch:</b> Pending approvals are role-specific. If you recently delegated approval authority, items may no longer appear for your role.',
    ]
    for tip in tips:
        story.append(Paragraph(tip, st['bullet']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>2.7 Best Practices</b>', st['h2']))
    bps = [
        'Review the Dashboard at the start of each workday to stay informed on organizational metrics and pending items.',
        'Use Quick Actions to reduce navigation time for frequent tasks.',
        'Monitor the AI Attrition Predictions weekly and escalate high-risk departments to HR leadership proactively.',
    ]
    for bp in bps:
        story.append(Paragraph(bp, st['bullet']))
    story.append(Spacer(1, 18))

    # Module 3: Employee Management
    story.extend(add_major_section('3. Module 2: Employee Management', st['h1']))
    story.append(Paragraph('<b>3.1 Purpose and Scope</b>', st['h2']))
    story.append(Paragraph(
        'The Employee Management module is the central repository for all employee data. It includes the employee '
        'database, organizational chart, document management, and asset tracking. This module enables HR personnel '
        'to manage the full employee lifecycle from onboarding to offboarding.', st['body']))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>3.2 Access by Role</b>', st['h2']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Role', 'Access Level'],
        [
            ['Super Admin', 'Full CRUD on all employees, org chart, documents, assets'],
            ['HR Admin', 'Full CRUD on all employees, org chart, documents, assets'],
            ['Department Manager', 'View and edit own department employees; view org chart'],
            ['Employee', 'View own profile only (redirects to Self-Service)'],
            ['Payroll Specialist', 'View employee compensation data (read-only)'],
            ['Recruiter', 'View employee directory (read-only)'],
            ['L&D Manager', 'View employee skills and training records'],
        ],
        col_widths=[0.30*CONTENT_W, 0.70*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>3.3 Step-by-Step Procedures</b>', st['h2']))
    story.append(Paragraph('<b>3.3.1 Adding a New Employee</b>', st['h3']))
    emp_steps = [
        'Navigate to Employees in the sidebar.',
        'Click the Add Employee button (top-right of the employee list).',
        'Fill in the required fields: First Name, Last Name, Email, Phone, Department, Designation, Job Title, Join Date, Employment Type, Location, Work Mode, Reporting Manager.',
        'Click Save to create the employee record.',
        'The system sends a welcome email to the new employee with login credentials.',
    ]
    for i, s in enumerate(emp_steps, 1):
        story.append(Paragraph('%d. %s' % (i, s), st['numbered']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>3.3.2 Viewing the Organization Chart</b>', st['h3']))
    org_steps = [
        'Navigate to Employees and click the Org Chart tab.',
        'The org chart renders as an interactive tree diagram with nodes representing employees.',
        'Click a node to expand/collapse the subtree under that manager.',
        'Hover over a node to see a tooltip with employee details (name, designation, department).',
    ]
    for i, s in enumerate(org_steps, 1):
        story.append(Paragraph('%d. %s' % (i, s), st['numbered']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>3.3.3 Managing Employee Documents</b>', st['h3']))
    doc_steps = [
        "Open an employee profile by clicking their row in the employee list.",
        "Navigate to the Documents tab within the profile.",
        "Click Upload Document to add a new document.",
        "Select the document type, then choose the file from your device.",
        "Click Upload. The document appears in the list with type, upload date, and download button.",
    ]
    for i, s in enumerate(doc_steps, 1):
        story.append(Paragraph('%d. %s' % (i, s), st['numbered']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>3.3.4 Assigning Assets to Employees</b>', st['h3']))
    asset_steps = [
        'Open the employee profile and navigate to the Assets tab.',
        'Click Assign Asset.',
        'Fill in the asset details: Asset Name, Type, Serial Number, Condition.',
        'Click Assign. The asset is now linked to the employee record.',
    ]
    for i, s in enumerate(asset_steps, 1):
        story.append(Paragraph('%d. %s' % (i, s), st['numbered']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>3.4 Common Scenarios</b>', st['h2']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Scenario', 'Action'],
        [
            ['Employee transfers to another department', 'Edit the employee profile, update Department and Reporting Manager fields. The org chart updates automatically.'],
            ['Employee resigns', 'Change status to "Inactive," set last working day, initiate offboarding checklist. Recover all assigned assets.'],
            ['Document expires (e.g., work visa)', 'Set an expiry date when uploading. The system generates alerts 30/15/7 days before expiry.'],
        ],
        col_widths=[0.30*CONTENT_W, 0.70*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>3.5 Best Practices</b>', st['h2']))
    bps = [
        'Always assign a Reporting Manager when creating an employee to ensure org chart integrity.',
        'Upload all onboarding documents within the first 3 days of joining.',
        'Conduct quarterly asset audits to verify physical assets match system records.',
    ]
    for bp in bps:
        story.append(Paragraph(bp, st['bullet']))
    story.append(Spacer(1, 18))

    # Module 4: RBAC & Security
    story.extend(add_major_section('4. Module 3: RBAC and Security', st['h1']))
    story.append(Paragraph('<b>4.1 Purpose and Scope</b>', st['h2']))
    story.append(Paragraph(
        'The Role-Based Access Control (RBAC) and Security module manages user roles, permissions, audit trails, '
        'and data security policies. It ensures that every user accesses only the data and features appropriate to '
        'their role, maintaining compliance and data protection standards.', st['body']))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>4.2 Access by Role</b>', st['h2']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Role', 'Access Level'],
        [
            ['Super Admin', 'Full access: create/edit roles, assign permissions, view audit trails, configure security policies'],
            ['HR Admin', 'View roles and audit trails; request permission changes from Super Admin'],
            ['All other roles', 'No direct access to this module'],
        ],
        col_widths=[0.30*CONTENT_W, 0.70*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>4.3 Step-by-Step Procedures</b>', st['h2']))
    story.append(Paragraph('<b>4.3.1 Creating a New Role</b>', st['h3']))
    role_steps = [
        'Navigate to RBAC and Security in the sidebar.',
        'Click the Roles tab.',
        'Click Create Role.',
        'Enter the Role Name and Description.',
        'Set the Access Level (0-4, where 0 is highest privilege).',
        'Select the permissions to grant by toggling each permission checkbox.',
        'Click Save Role.',
    ]
    for i, s in enumerate(role_steps, 1):
        story.append(Paragraph('%d. %s' % (i, s), st['numbered']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>4.3.2 Viewing Audit Trails</b>', st['h3']))
    audit_steps = [
        'Navigate to the Audit Trails tab.',
        'Use the filters: Date Range, User, Action Type, Module.',
        'Click Apply Filters to load the results.',
        'Each audit entry shows: Timestamp, User, Action, Module, Affected Record ID, and IP Address.',
        'Click Export to download the audit trail as a CSV file.',
    ]
    for i, s in enumerate(audit_steps, 1):
        story.append(Paragraph('%d. %s' % (i, s), st['numbered']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>4.4 Best Practices</b>', st['h2']))
    bps = [
        'Follow the principle of least privilege: assign the minimum permissions required for each role.',
        'Review role assignments quarterly and remove unnecessary access.',
        'Enable MFA for all admin-level accounts (Level 0 and Level 1).',
        'Export audit trails monthly and archive them per your organization data retention policy.',
    ]
    for bp in bps:
        story.append(Paragraph(bp, st['bullet']))
    story.append(Spacer(1, 18))

    # Module 5: AI Talent Acquisition
    story.extend(add_major_section('5. Module 4: AI Talent Acquisition', st['h1']))
    story.append(Paragraph('<b>5.1 Purpose and Scope</b>', st['h2']))
    story.append(Paragraph(
        'The AI Talent Acquisition module streamlines the entire recruitment lifecycle - from job posting and '
        'candidate sourcing to pipeline management and AI-powered onboarding. AI features include candidate fit '
        'scoring, resume matching, interview question generation, and a compliance chatbot for onboarding.', st['body']))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>5.2 Access by Role</b>', st['h2']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Role', 'Access Level'],
        [
            ['Super Admin', 'Full access to all talent acquisition features'],
            ['HR Admin', 'Full access to all talent acquisition features'],
            ['Recruiter', 'Full access to job postings, candidate pipeline, onboarding'],
            ['Department Manager', 'View candidates for own department; approve hiring requests'],
            ['Employee', 'No access (referrals submitted via Self-Service)'],
            ['Payroll Specialist', 'No access'],
            ['L&D Manager', 'View onboarding training assignments'],
        ],
        col_widths=[0.30*CONTENT_W, 0.70*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>5.3 Step-by-Step Procedures</b>', st['h2']))
    story.append(Paragraph('<b>5.3.1 Posting a New Job</b>', st['h3']))
    job_steps = [
        'Navigate to Talent Acquisition in the sidebar.',
        'The module opens with three tabs: Job Postings, Candidate Pipeline, and AI Onboarding.',
        'On the Job Postings tab, click Post New Job.',
        'Fill in the job posting form: Job Title, Department, Location, Employment Type, Experience, Salary Range, Required Skills, Job Description.',
        'Click Publish Job to make the posting live.',
    ]
    for i, s in enumerate(job_steps, 1):
        story.append(Paragraph('%d. %s' % (i, s), st['numbered']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>5.3.2 Managing the Candidate Pipeline (Kanban)</b>', st['h3']))
    story.append(Paragraph(
        'Switch to the Candidate Pipeline tab. The pipeline displays as a horizontal Kanban board with six columns: '
        'Applied, Screening, Interview, Offered, Hired, and Rejected. Each candidate card shows Name, Current Company, '
        'Experience, Skills, Source Badge, and the AI Fit Score gauge (green >= 75, amber >= 50, red < 50). '
        'Click a candidate card to open the Candidate Detail Dialog with AI Resume Match Analysis and AI-Generated Interview Questions.', st['body']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>5.3.3 Using the AI Onboarding Assistant</b>', st['h3']))
    story.append(Paragraph(
        'Switch to the AI Onboarding tab. View onboarding progress for new hires with a checklist. '
        'Use the AI Compliance Bot (floating chat panel) to ask questions such as "What documents are pending?" '
        'or "Check IT setup status." The bot provides real-time compliance status and recommendations.', st['body']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>5.4 Best Practices</b>', st['h2']))
    bps = [
        'Always include comprehensive required skills when posting a job; the AI matching quality depends on the specificity of the job requirements.',
        'Review AI-generated interview questions before sharing them with candidates; customize them to fit your team evaluation criteria.',
        'Use the onboarding checklist consistently to ensure no compliance steps are missed for new hires.',
        'Update the pipeline status promptly after each candidate interaction to maintain accurate recruitment analytics.',
    ]
    for bp in bps:
        story.append(Paragraph(bp, st['bullet']))
    story.append(Spacer(1, 18))

    # Module 6: Time & Attendance
    story.extend(add_major_section('6. Module 5: Time and Attendance', st['h1']))
    story.append(Paragraph('<b>6.1 Purpose and Scope</b>', st['h2']))
    story.append(Paragraph(
        'The Time and Attendance module handles daily attendance tracking, leave management, shift scheduling, '
        'and geofencing for location-based attendance. It ensures accurate time records for payroll processing '
        'and compliance with labor regulations.', st['body']))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>6.2 Key Procedures</b>', st['h2']))
    story.append(Paragraph('<b>6.2.1 Clocking In/Out</b>', st['h3']))
    story.append(Paragraph(
        'Navigate to Time and Attendance in the sidebar. On the Attendance tab, click the Clock In button when '
        'starting work. If geofencing is enabled, the system prompts for location permission. A green confirmation '
        'toast appears with your clock-in time. At the end of the workday, click Clock Out.', st['body']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>6.2.2 Applying for Leave</b>', st['h3']))
    story.append(Paragraph(
        'Navigate to Time and Attendance, then Leave Management tab. Click Apply Leave. Fill in the form: '
        'Leave Type (Earned Leave, Casual Leave, Sick Leave, Comp Off, Loss of Pay), From Date and To Date, '
        'Reason, and Contact During Leave. Click Submit. The leave request is sent to your Reporting Manager '
        'for approval. Track the status: Pending then Approved/Rejected.', st['body']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>6.2.3 Managing Shifts</b>', st['h3']))
    story.append(Paragraph(
        'Navigate to the Shifts tab. View the current shift roster in a calendar or list format. To assign a shift, '
        'click Assign Shift, select the employee(s), and choose the shift template (Morning 6AM-2PM, General 9AM-6PM, '
        'Evening 2PM-10PM, Night 10PM-6AM). Click Save.', st['body']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>6.3 Best Practices</b>', st['h2']))
    bps = [
        'Clock in and out at the designated times to maintain accurate attendance records.',
        'Apply for leaves at least 3 days in advance (except Sick Leave) to allow managers to plan coverage.',
        'Review and approve leave requests within 24 hours to maintain employee trust and operational continuity.',
        'Audit geofence configurations quarterly to ensure they match current office locations.',
    ]
    for bp in bps:
        story.append(Paragraph(bp, st['bullet']))
    story.append(Spacer(1, 18))

    # Module 7: Payroll & Expenses
    story.extend(add_major_section('7. Module 6: Payroll and Expenses', st['h1']))
    story.append(Paragraph('<b>7.1 Purpose and Scope</b>', st['h2']))
    story.append(Paragraph(
        'The Payroll and Expenses module handles end-to-end payroll processing, expense claim submissions and approvals, '
        'and tax declarations. It integrates with attendance data to compute accurate compensation and supports '
        'multi-component salary structures.', st['body']))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>7.2 Key Procedures</b>', st['h2']))
    story.append(Paragraph('<b>7.2.1 Processing Payroll</b>', st['h3']))
    payroll_steps = [
        'Navigate to Payroll and Expenses in the sidebar.',
        'On the Payroll tab, select the payroll month and year.',
        'Review the employee payroll summary: gross salary, deductions (PF, ESI, TDS, Professional Tax), and net pay.',
        'Click Run Payroll to initiate the payroll calculation.',
        'Review the payroll register for accuracy. Flag any discrepancies for manual correction.',
        'Click Approve and Process to finalize. The system generates payslips and sends them to employee emails.',
    ]
    for i, s in enumerate(payroll_steps, 1):
        story.append(Paragraph('%d. %s' % (i, s), st['numbered']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>7.2.2 Submitting an Expense Claim</b>', st['h3']))
    story.append(Paragraph(
        'Navigate to the Expenses tab. Click Submit Expense. Fill in the form: Expense Category (Travel, Equipment, '
        'Meals, Training, Other), Amount, Date of Expense, Description, and Receipt Upload (max 5 MB). '
        'Click Submit. The claim is routed to the Reporting Manager for approval. '
        'Track the status: Pending then Manager Approved then Finance Approved then Reimbursed.', st['body']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>7.3 Best Practices</b>', st['h2']))
    bps = [
        'Process payroll by the 25th of each month to ensure payslips are distributed before month-end.',
        'Submit expense claims within 7 days of the expense date to avoid rejections.',
        'File tax declarations proactively at the start of the financial year to optimize monthly TDS.',
    ]
    for bp in bps:
        story.append(Paragraph(bp, st['bullet']))
    story.append(Spacer(1, 18))

    # Module 8: Performance & Talent
    story.extend(add_major_section('8. Module 7: Performance and Talent', st['h1']))
    story.append(Paragraph('<b>8.1 Purpose and Scope</b>', st['h2']))
    story.append(Paragraph(
        'The Performance and Talent module manages performance review cycles, OKR (Objectives and Key Results) tracking, '
        'and AI-powered attrition analysis. It enables continuous feedback, structured reviews, and data-driven '
        'talent retention strategies.', st['body']))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>8.2 Key Procedures</b>', st['h2']))
    story.append(Paragraph('<b>8.2.1 Initiating a Performance Review Cycle</b>', st['h3']))
    story.append(Paragraph(
        'Navigate to Performance in the sidebar. On the Reviews tab, click Create Review Cycle. '
        'Enter the cycle name, start date, end date, and review type (360, Manager-Only, Self+Manager). '
        'Select the departments and employees. Configure the rating scale (1-5 or 1-10). Click Publish. '
        'Invited employees and managers receive notifications.', st['body']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>8.2.2 Setting OKRs</b>', st['h3']))
    story.append(Paragraph(
        'Navigate to the OKRs tab. Click Add Objective. Enter the Objective and add 2-5 Key Results with '
        'measurable targets. Assign the OKR to yourself or a team member. Set the quarter and alignment '
        '(company-level, department-level, individual). Click Save. Managers approve objectives before they become active.', st['body']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>8.2.3 Using AI Attrition Analysis</b>', st['h3']))
    story.append(Paragraph(
        'Navigate to the AI Attrition tab. The dashboard displays department-wise attrition risk scores, '
        'comparison with actual attrition, and key risk factors. Click a department to drill down into individual '
        'employee risk profiles. Review AI-suggested retention actions. Export the attrition risk report for leadership review.', st['body']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>8.3 Best Practices</b>', st['h2']))
    bps = [
        'Conduct performance reviews at least twice a year (mid-year and annual).',
        'Set OKRs at the beginning of each quarter with measurable, time-bound key results.',
        'Review AI attrition predictions monthly and act on high-risk cases within 14 days.',
        'Encourage a culture of continuous feedback rather than relying solely on formal review cycles.',
    ]
    for bp in bps:
        story.append(Paragraph(bp, st['bullet']))
    story.append(Spacer(1, 18))

    # Module 9: Learning & Development
    story.extend(add_major_section('9. Module 8: Learning and Development', st['h1']))
    story.append(Paragraph('<b>9.1 Purpose and Scope</b>', st['h2']))
    story.append(Paragraph(
        'The Learning and Development (L&D) module manages the corporate course catalog, learning paths, '
        'skill inventory, and AI-driven training recommendations. It supports both self-directed and assigned '
        'learning to close skill gaps and accelerate professional growth.', st['body']))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>9.2 Key Procedures</b>', st['h2']))
    story.append(Paragraph('<b>9.2.1 Creating a Course</b>', st['h3']))
    story.append(Paragraph(
        'Navigate to Learning and Development in the sidebar. On the Course Catalog tab, click Create Course. '
        'Fill in the details: Course Title, Category (Technical, Leadership, Compliance, Soft Skills), Duration, '
        'Format (Self-paced, Instructor-led, Blended), Description, Learning Objectives, and Skills Covered. '
        'Upload course materials and configure assessments. Click Publish.', st['body']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>9.2.2 Creating a Learning Path</b>', st['h3']))
    story.append(Paragraph(
        'Navigate to the Learning Paths tab. Click Create Learning Path. Enter the path name, description, '
        'and target role/department. Add courses in the desired sequence. Set prerequisites between courses if needed. '
        'Assign the learning path to employees or departments. Click Publish.', st['body']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>9.2.3 Managing the Skill Inventory</b>', st['h3']))
    story.append(Paragraph(
        'Navigate to the Skill Inventory tab. View a matrix of employees and their skill proficiency levels '
        '(Beginner, Intermediate, Advanced, Expert). Filter by department, skill category, or proficiency level. '
        'Identify skill gaps. Click Recommend Training to auto-suggest courses (AI-powered).', st['body']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>9.3 Best Practices</b>', st['h2']))
    bps = [
        'Update the course catalog quarterly to include emerging technologies and updated compliance requirements.',
        'Map every learning path to specific OKRs to demonstrate ROI on training investments.',
        'Encourage employees to self-assess their skill proficiency at least twice a year to keep the inventory current.',
    ]
    for bp in bps:
        story.append(Paragraph(bp, st['bullet']))
    story.append(Spacer(1, 18))

    # Module 10: Analytics & Reporting
    story.extend(add_major_section('10. Module 9: Analytics and Reporting', st['h1']))
    story.append(Paragraph('<b>10.1 Purpose and Scope</b>', st['h2']))
    story.append(Paragraph(
        'The Analytics and Reporting module provides real-time dashboards, predictive analytics powered by AI, '
        'and custom report generation. It enables data-driven decision-making across all HR functions by consolidating '
        'data from every module into unified views.', st['body']))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>10.2 Key Procedures</b>', st['h2']))
    story.append(Paragraph('<b>10.2.1 Viewing Real-Time Dashboards</b>', st['h3']))
    story.append(Paragraph(
        'Navigate to Analytics and Reporting in the sidebar. Select a dashboard from the left panel: HR Overview, '
        'Recruitment, Attrition, Payroll, Learning, or Attendance. Each dashboard features interactive charts and '
        'KPI cards. Use the date range selector and department filter to narrow the view.', st['body']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>10.2.2 Using Predictive Analytics</b>', st['h3']))
    story.append(Paragraph(
        'Navigate to the Predictive Analytics tab. Available predictions include: Attrition Risk, Headcount Forecast, '
        'Time-to-Hire Projection, and Training Completion Forecast. Select a prediction model, configure parameters, '
        'and click Run Prediction. The AI model generates forecasts with confidence intervals.', st['body']))
    story.append(Spacer(1, 8))

    story.append(Paragraph('<b>10.2.3 Creating Custom Reports</b>', st['h3']))
    story.append(Paragraph(
        'Navigate to the Custom Reports tab. Click Create Report. Select data source modules, choose fields, '
        'apply filters, select the output format (Table, Bar Chart, Line Chart, Pie Chart). '
        'Click Generate to preview, then Export to download as PDF, Excel, or CSV.', st['body']))
    story.append(Spacer(1, 18))

    # Module 11: Employee Self-Service
    story.extend(add_major_section('11. Module 10: Employee Self-Service', st['h1']))
    story.append(Paragraph('<b>11.1 Purpose and Scope</b>', st['h2']))
    story.append(Paragraph(
        'The Employee Self-Service module provides employees with a centralized portal to view and manage their '
        'personal information, request time off, submit expenses, access payslips, and interact with the AI-powered '
        'HR assistant chatbot for instant answers to policy and procedure questions.', st['body']))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>11.2 Key Features</b>', st['h2']))
    features = [
        '<b>Profile Management:</b> View and update personal details, emergency contacts, and bank information.',
        '<b>Leave Requests:</b> Apply for leave, view leave balance, and track approval status.',
        '<b>Expense Submission:</b> Submit expense claims with receipt uploads and track reimbursement status.',
        '<b>Payslip Access:</b> View and download monthly payslips.',
        '<b>AI Chat Assistant:</b> Ask HR-related questions and receive instant, context-aware responses.',
        '<b>Document Access:</b> View and download personal documents (offer letters, certificates).',
        '<b>Training Enrollment:</b> Browse course catalog and enroll in learning programs.',
    ]
    for f in features:
        story.append(Paragraph(f, st['bullet']))
    story.append(Spacer(1, 18))

    # Glossary
    story.extend(add_major_section('12. Glossary of Terms', st['h1']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Term', 'Definition'],
        [
            ['AI Fit Score', 'A 0-100 score calculated by AI to assess candidate-job compatibility'],
            ['HRMS', 'Human Resource Management System'],
            ['Kanban', 'A visual workflow management method using columns to represent process stages'],
            ['MFA', 'Multi-Factor Authentication - requires two or more verification methods'],
            ['OKR', 'Objectives and Key Results - a goal-setting framework'],
            ['RBAC', 'Role-Based Access Control - restricts system access based on user roles'],
            ['SOP', 'Standard Operating Procedure - a set of step-by-step instructions for routine operations'],
            ['CTC', 'Cost to Company - total salary package including all components'],
            ['PF', 'Provident Fund - a retirement savings scheme'],
            ['ESI', 'Employee State Insurance - a social security scheme'],
            ['TDS', 'Tax Deducted at Source - advance tax collected on income'],
        ],
        col_widths=[0.25*CONTENT_W, 0.75*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 18))

    # FAQ
    story.extend(add_major_section('13. Frequently Asked Questions', st['h1']))
    faqs = [
        ('How do I reset my password?', 'Click "Forgot Password" on the login screen. Enter your corporate email. A reset link will be sent to your inbox. If you do not receive the email within 5 minutes, contact IT Support.'),
        ('Can I access AI-HRMS from my mobile device?', 'Yes. AI-HRMS is a responsive web app. Open your mobile browser and navigate to the same URL. The interface adapts to smaller screens automatically.'),
        ('What should I do if I see incorrect data on the Dashboard?', 'Dashboard data refreshes every 60 seconds. Try a hard refresh (Ctrl+F5). If the data is still incorrect, raise a support ticket through the Self-Service module or contact HR.'),
        ('How do I apply for leave retroactively?', 'Retroactive leave applications are allowed for Sick Leave only, within 2 working days. Navigate to Time and Attendance, then Leave Management, and select the past dates.'),
        ('Who should I contact for payroll issues?', 'Contact your Payroll Specialist or HR Admin. You can also use the AI Chat Assistant in the Self-Service module for general payroll queries.'),
    ]
    for q, a in faqs:
        story.append(Paragraph('<b>Q: %s</b>' % q, st['body_left']))
        story.append(Paragraph('A: %s' % a, st['body_left']))
        story.append(Spacer(1, 8))

    # Contact & Support
    story.extend(add_major_section('14. Contact and Support', st['h1']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Support Channel', 'Contact'],
        [
            ['IT Helpdesk', 'it-support@yourcompany.com | Ext: 5000'],
            ['HR Support', 'hr-support@yourcompany.com | Ext: 5100'],
            ['Payroll Queries', 'payroll@yourcompany.com | Ext: 5200'],
            ['AI Chat Assistant', 'Available 24/7 in the Self-Service module'],
            ['Emergency IT', 'emergency-it@yourcompany.com | Ext: 9999'],
        ],
        col_widths=[0.35*CONTENT_W, 0.65*CONTENT_W]
    )
    story.append(tbl)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DOCUMENT 2: TECHNICAL DOCUMENTATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def build_technical_doc(story, st):
    # Section 1: Architecture Overview
    story.extend(add_major_section('1. Architecture Overview', st['h1']))
    story.append(Paragraph('<b>1.1 System Architecture</b>', st['h2']))
    story.append(Paragraph(
        'The AI-HRMS platform follows a three-tier architecture: Client Layer (Next.js App Router with React 19 + TypeScript 5), '
        'API Layer (Next.js Route Handlers providing RESTful endpoints), and Data Layer (Prisma ORM with SQLite database). '
        'External services include z-ai-web-dev-sdk for AI chat completions.', st['body']))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>1.2 Data Flow</b>', st['h2']))
    story.append(Paragraph(
        'The application follows a unidirectional data flow pattern: User Interaction triggers Zustand store updates, '
        'components invoke REST API endpoints via fetch(), server processing executes Prisma queries, and JSON responses '
        'render through Recharts and shadcn/ui components. The /api/ai-chat endpoint proxies user messages to the '
        'z-ai-web-dev-sdk for conversational HR assistance with full conversation history support.', st['body']))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>1.3 Rendering Strategy</b>', st['h2']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Path', 'Strategy', 'Rationale'],
        [
            ['/ (main page)', 'Client-side rendering', 'Dynamic module switching requires client-side interactivity'],
            ['/api/*', 'Server-side (Route Handlers)', 'Direct Prisma access, no client DB exposure'],
            ['Layout', 'Server Component', 'Static shell with fonts, metadata, and toaster'],
        ],
        col_widths=[0.25*CONTENT_W, 0.30*CONTENT_W, 0.45*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 18))

    # Section 2: Project Structure
    story.extend(add_major_section('2. Project Structure', st['h1']))
    story.append(Paragraph(
        'The project follows a Next.js App Router structure with organized directories for API routes, '
        'business components, UI primitives, hooks, and library utilities.', st['body']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Directory', 'Contents', 'Purpose'],
        [
            ['prisma/', 'schema.prisma, seed.ts', 'Database schema (21 models) and seeder script'],
            ['src/app/api/', '12+ route handlers', 'RESTful API endpoints for all modules'],
            ['src/components/hrms/', '11 business components', 'Module-specific UI (Dashboard, Employees, etc.)'],
            ['src/components/ui/', '50+ shadcn/ui primitives', 'Copy-paste component library with Radix UI'],
            ['src/hooks/', 'use-mobile.ts, use-toast.ts', 'Custom React hooks'],
            ['src/lib/', 'data.ts, db.ts, store.ts, utils.ts', 'Mock data, Prisma singleton, Zustand store, utilities'],
        ],
        col_widths=[0.25*CONTENT_W, 0.35*CONTENT_W, 0.40*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 18))

    # Section 3: Technology Stack
    story.extend(add_major_section('3. Technology Stack', st['h1']))
    story.append(Paragraph('<b>3.1 Core Dependencies</b>', st['h2']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Technology', 'Version', 'Rationale'],
        [
            ['Next.js', '16.1.1', 'App Router, React Server Components, Route Handlers'],
            ['React', '19.0.0', 'Concurrent features, improved hydration, Server Components'],
            ['TypeScript', '5.x', 'Static type safety across the full stack'],
            ['Tailwind CSS', '4.x', 'Utility-first CSS with JIT compilation'],
            ['shadcn/ui', 'new-york style', 'Copy-paste component architecture with Radix UI primitives'],
            ['Prisma', '6.11.1', 'Type-safe ORM with auto-generated client and SQLite support'],
            ['Zustand', '5.0.6', 'Lightweight client state management with zero boilerplate'],
            ['Recharts', '2.15.4', 'Declarative charting library built on React components'],
            ['z-ai-web-dev-sdk', '0.0.17', 'AI chatbot integration with async create() pattern'],
            ['Lucide React', '0.525.0', 'Consistent icon set with tree-shakeable ESM imports'],
            ['Zod', '4.0.2', 'Runtime schema validation for API request payloads'],
            ['next-auth', '4.24.11', 'Authentication framework for future RBAC enforcement'],
            ['react-hook-form', '7.60.0', 'Performant form handling with minimal re-renders'],
        ],
        col_widths=[0.22*CONTENT_W, 0.13*CONTENT_W, 0.65*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>3.2 Supporting Libraries</b>', st['h2']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Library', 'Purpose'],
        [
            ['@tanstack/react-table', 'Headless table primitives for data grids'],
            ['@tanstack/react-query', 'Server state management and caching'],
            ['@dnd-kit/core + sortable', 'Drag-and-drop for Kanban boards and pipelines'],
            ['date-fns', 'Date manipulation and formatting'],
            ['framer-motion', 'Animation primitives for UI transitions'],
            ['sonner', 'Toast notification system'],
            ['cmdk', 'Command palette (Cmd+K) component'],
            ['next-themes', 'Dark/light mode theme switching'],
            ['react-markdown', 'Markdown rendering for AI chat responses'],
        ],
        col_widths=[0.35*CONTENT_W, 0.65*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 18))

    # Section 4: Database Schema
    story.extend(add_major_section('4. Database Schema', st['h1']))
    story.append(Paragraph('<b>4.1 Entity Relationship Overview</b>', st['h2']))
    story.append(Paragraph(
        'The database consists of 21 Prisma models with Employee as the central entity. Key relationships include: '
        'Employee has many Attendance, Leave, Payroll, Expense, Performance, Asset, EmployeeSkill, CourseEnrollment, '
        'Document, and AuditLog records. Job has many Candidates. The schema supports audit logging, '
        'approval workflows, company policies, shift management, and holiday calendars.', st['body']))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>4.2 Key Model Specifications</b>', st['h2']))
    story.append(Paragraph('<b>Employee (Central Entity)</b>', st['h3']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Field', 'Type', 'Constraints', 'Description'],
        [
            ['id', 'String', '@id @default(cuid())', 'Primary key'],
            ['employeeId', 'String', '@unique', 'Business identifier (e.g., EMP001)'],
            ['firstName / lastName', 'String', 'Required', 'Employee name'],
            ['email', 'String', '@unique', 'Corporate email'],
            ['department', 'String?', 'Optional', 'Department name (denormalized)'],
            ['status', 'String', '@default("active")', 'active, inactive, onboarding, exited'],
            ['salary', 'Float?', 'Optional', 'Annual salary in INR'],
            ['createdAt', 'DateTime', '@default(now())', 'Record creation timestamp'],
            ['updatedAt', 'DateTime', '@updatedAt', 'Auto-updated modification timestamp'],
        ],
        col_widths=[0.18*CONTENT_W, 0.15*CONTENT_W, 0.25*CONTENT_W, 0.42*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>Other Key Models</b>', st['h3']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Model', 'Key Fields', 'Purpose'],
        [
            ['Attendance', 'employeeId, date, checkIn, checkOut, status', 'Daily attendance tracking'],
            ['Leave', 'employeeId, leaveType, startDate, endDate, status', 'Leave management'],
            ['Payroll', 'employeeId, month, year, basicSalary, hra, netPay, status', 'Payroll processing'],
            ['Expense', 'employeeId, category, amount, date, status', 'Expense claims'],
            ['Performance', 'employeeId, reviewPeriod, rating, attritionRisk', 'Performance reviews'],
            ['Job', 'title, department, location, type, skills, status', 'Job postings'],
            ['Candidate', 'jobId, name, aiFitScore, status', 'Candidate pipeline'],
            ['AuditLog', 'userId, action, module, details, ipAddress', 'Audit trail'],
            ['Course', 'title, category, duration, skills', 'Learning catalog'],
            ['ApprovalWorkflow', 'type, requesterId, approverId, status', 'Multi-level approvals'],
        ],
        col_widths=[0.20*CONTENT_W, 0.50*CONTENT_W, 0.30*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 18))

    # Section 5: API Reference
    story.extend(add_major_section('5. API Reference', st['h1']))
    story.append(Paragraph('<b>5.1 Common Patterns</b>', st['h2']))
    story.append(Paragraph(
        'All API endpoints follow RESTful conventions and return JSON. All write operations create AuditLog entries. '
        'List endpoints support pagination with page and limit query parameters (default page=1, limit=10). '
        'Most list endpoints support field-specific query parameters for filtering.', st['body']))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>5.2 Endpoint Summary</b>', st['h2']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Endpoint', 'Methods', 'Key Features'],
        [
            ['/api/employees', 'GET, POST', 'List (paginated, searchable) and create employees'],
            ['/api/employees/[id]', 'GET, PUT, DELETE', 'Single employee CRUD with nested relations'],
            ['/api/attendance', 'GET, POST', 'Attendance records with date range filtering'],
            ['/api/leaves', 'GET, PATCH', 'Leave management; PATCH for approve/reject'],
            ['/api/payroll', 'GET, POST', 'Payroll processing with auto-calculation'],
            ['/api/expenses', 'GET, PATCH', 'Expense claims with status transition rules'],
            ['/api/performance', 'GET', 'Performance review data with filtering'],
            ['/api/jobs', 'GET', 'Job postings with nested candidate data'],
            ['/api/candidates', 'GET', 'Candidate pipeline with AI fit scores'],
            ['/api/courses', 'GET, POST', 'Dual-mode: catalog or enrollment operations'],
            ['/api/audit', 'GET', 'Audit log with comprehensive filtering'],
            ['/api/dashboard', 'GET', 'Aggregation: 12 parallel Prisma queries'],
            ['/api/ai-chat', 'POST', 'AI chatbot with conversation history'],
        ],
        col_widths=[0.28*CONTENT_W, 0.17*CONTENT_W, 0.55*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 18))

    # Section 6: Component Architecture
    story.extend(add_major_section('6. Component Architecture', st['h1']))
    story.append(Paragraph('<b>6.1 Module Registry Pattern</b>', st['h2']))
    story.append(Paragraph(
        'The application uses a module registry pattern. page.tsx maps ModuleKey strings to component classes. '
        'The active module is determined by useHRMSStore().activeModule, and the corresponding component is '
        'rendered dynamically.', st['body']))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>6.2 Component Specifications</b>', st['h2']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Component', 'Module Key', 'AI-Powered', 'Primary Data Sources'],
        [
            ['Dashboard', 'dashboard', 'No', '/api/dashboard'],
            ['EmployeeManagement', 'employees', 'No', '/api/employees, mock data'],
            ['RBACSecurity', 'rbac', 'No', 'Mock roles/permissions data'],
            ['TalentAcquisition', 'talent', 'Yes', '/api/jobs, /api/candidates'],
            ['TimeAttendance', 'attendance', 'No', '/api/attendance, /api/leaves'],
            ['PayrollExpense', 'payroll', 'No', '/api/payroll, /api/expenses'],
            ['Performance', 'performance', 'Yes', '/api/performance'],
            ['LearningDevelopment', 'learning', 'Yes', '/api/courses'],
            ['Analytics', 'analytics', 'Yes', '/api/dashboard, mock data'],
            ['SelfService', 'selfservice', 'No', '/api/ai-chat, employee data'],
        ],
        col_widths=[0.22*CONTENT_W, 0.17*CONTENT_W, 0.13*CONTENT_W, 0.48*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 18))

    # Section 7: Authentication & Authorization
    story.extend(add_major_section('7. Authentication and Authorization', st['h1']))
    story.append(Paragraph('<b>7.1 Authentication</b>', st['h2']))
    story.append(Paragraph(
        'The application integrates next-auth v4 for authentication infrastructure. The current implementation uses '
        'a simplified session model with plans for full OAuth2/OIDC integration.', st['body']))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>7.2 Role Hierarchy</b>', st['h2']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Level', 'Role', 'User Count', 'Scope'],
        [
            ['0', 'Super Admin', '1', 'Full system access, all modules, all permissions'],
            ['1', 'HR Admin', '3', 'HR, Payroll, Attendance, Performance (read/write/modify)'],
            ['2', 'Payroll Specialist', '2', 'Payroll (read/write/modify), HR (read), Analytics (read)'],
            ['2', 'Recruiter', '4', 'HR (read/write/modify), Learning (read), Analytics (read)'],
            ['2', 'L&D Manager', '2', 'Learning (full CRUD), Performance (read/write/modify)'],
            ['3', 'Department Manager', '8', 'Team management, leave/expense approval, reviews'],
            ['4', 'Employee', '140', 'Self-service read access, learning enrollment'],
        ],
        col_widths=[0.08*CONTENT_W, 0.22*CONTENT_W, 0.12*CONTENT_W, 0.58*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 18))

    # Section 8: AI Integration
    story.extend(add_major_section('8. AI Integration', st['h1']))
    story.append(Paragraph('<b>8.1 Chat Architecture</b>', st['h2']))
    story.append(Paragraph(
        'The AI chat endpoint (/api/ai-chat/route.ts) implements: request validation, HR-specific system prompt '
        'defining the AI persona across 8 domains, conversation history maintenance (user and assistant roles), '
        'SDK initialization using the async ZAI.create() factory pattern, response extraction with fallback error '
        'handling, and comprehensive error catching with descriptive 500 status messages.', st['body']))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>8.2 AI-Powered Features</b>', st['h2']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Feature', 'Module', 'Description'],
        [
            ['AI Chat Assistant', 'Self-Service', 'Conversational HR helpdesk via z-ai-web-dev-sdk'],
            ['AI Fit Score', 'Talent Acquisition', '0-100 candidate-job compatibility scoring'],
            ['AI Course Recommendations', 'Learning', 'Skill-gap-based course suggestions'],
            ['AI Attrition Analysis', 'Performance', 'Department-wise attrition risk prediction'],
            ['AI Interview Questions', 'Talent Acquisition', 'Auto-generated questions tailored to job and candidate'],
            ['AI Resume Matching', 'Talent Acquisition', 'Multi-dimensional match analysis with progress bars'],
            ['AI Compliance Bot', 'Talent Acquisition', 'Real-time onboarding compliance status checking'],
        ],
        col_widths=[0.25*CONTENT_W, 0.20*CONTENT_W, 0.55*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 18))

    # Section 9: State Management
    story.extend(add_major_section('9. State Management', st['h1']))
    story.append(Paragraph(
        'Client-side state is managed via Zustand (v5.0.6). The global store (src/lib/store.ts) manages: '
        'activeModule (determines which module component is rendered), sidebarOpen (mobile sidebar drawer state), '
        'and searchQuery (sidebar module search filter). Server state is managed through direct fetch() calls to API '
        'routes, with components handling loading, error, and success states locally.', st['body']))
    story.append(Spacer(1, 18))

    # Section 10: Styling System
    story.extend(add_major_section('10. Styling System', st['h1']))
    story.append(Paragraph(
        'The application uses Tailwind CSS v4 with JIT compilation for utility-first styling. Global CSS variables '
        'are defined in globals.css for theming. The shadcn/ui component library provides pre-built, accessible '
        'components using Radix UI primitives. The theme supports dark/light mode switching via next-themes. '
        'The primary accent color is Emerald (#10b981), used consistently across AI badges, active states, '
        'and interactive elements.', st['body']))
    story.append(Spacer(1, 18))

    # Section 11: Testing Strategy
    story.extend(add_major_section('11. Testing Strategy', st['h1']))
    story.append(Paragraph(
        'The testing strategy encompasses: Unit Testing (Jest + React Testing Library for component logic and utility '
        'functions), Integration Testing (API route handler testing with Prisma test database), End-to-End Testing '
        '(Playwright for critical user flows including login, CRUD operations, and AI chat), and Type Checking '
        '(TypeScript strict mode with no implicit any for compile-time safety).', st['body']))
    story.append(Spacer(1, 18))

    # Section 12: Deployment Guide
    story.extend(add_major_section('12. Deployment Guide', st['h1']))
    story.append(Paragraph(
        'The application is built on Next.js 16 with built-in optimization for deployment. Key deployment considerations: '
        'Node.js 18+ runtime requirement, SQLite database file persistence in the db/ directory, environment variable '
        'configuration for API keys and database URLs, and Prisma migration execution on deployment. '
        'The application supports standard Next.js deployment targets including Vercel, Docker containers, '
        'and Node.js server environments.', st['body']))
    story.append(Spacer(1, 18))

    # Section 13: CI/CD Pipeline
    story.extend(add_major_section('13. CI/CD Pipeline', st['h1']))
    story.append(Paragraph(
        'The CI/CD pipeline includes: Lint (ESLint with flat config for code quality), Type Check (TypeScript compiler '
        'for type safety), Test (Jest for unit and integration tests), Build (Next.js production build), and Deploy '
        '(automated deployment to the target environment). Pipeline configuration follows GitHub Actions or equivalent '
        'CI/CD platform standards.', st['body']))
    story.append(Spacer(1, 18))

    # Section 14: Environment Variables
    story.extend(add_major_section('14. Environment Variables', st['h1']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Variable', 'Purpose', 'Required'],
        [
            ['DATABASE_URL', 'Prisma connection string for SQLite', 'Yes'],
            ['NEXTAUTH_SECRET', 'Secret key for next-auth session encryption', 'Yes'],
            ['NEXTAUTH_URL', 'Base URL for next-auth callbacks', 'Yes'],
            ['ZAI_API_KEY', 'API key for z-ai-web-dev-sdk', 'Yes (for AI features)'],
            ['NEXT_PUBLIC_APP_URL', 'Public application URL', 'No'],
        ],
        col_widths=[0.28*CONTENT_W, 0.52*CONTENT_W, 0.20*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 18))

    # Section 15: Contributing Guidelines
    story.extend(add_major_section('15. Contributing Guidelines', st['h1']))
    story.append(Paragraph(
        'Contributions follow a structured workflow: Fork and clone the repository, create a feature branch from '
        'the develop branch, implement changes with appropriate test coverage, ensure all lint and type checks pass, '
        'submit a pull request with a descriptive title and summary, and obtain at least one code review approval '
        'before merging. Commit messages should follow Conventional Commits format (feat:, fix:, docs:, etc.).', st['body']))
    story.append(Spacer(1, 18))

    # Section 16: Code Style Guide
    story.extend(add_major_section('16. Code Style Guide', st['h1']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Area', 'Standard'],
        [
            ['Language', 'TypeScript strict mode (no implicit any)'],
            ['Framework', 'Next.js App Router conventions (Server/Client Components)'],
            ['Components', 'Functional components with hooks; named exports'],
            ['Styling', 'Tailwind CSS utility classes; shadcn/ui for complex components'],
            ['State', 'Zustand for global state; local state for component-specific data'],
            ['API', 'RESTful Route Handlers with Zod validation'],
            ['Naming', 'camelCase for variables/functions, PascalCase for components/types'],
            ['Imports', 'Absolute paths using @/ alias for src/ directory'],
        ],
        col_widths=[0.20*CONTENT_W, 0.80*CONTENT_W]
    )
    story.append(tbl)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DOCUMENT 3: FUNCTIONALITY DOCUMENT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def build_functionality_doc(story, st):
    # Section 1: Document Purpose
    story.extend(add_major_section('1. Document Purpose and Scope', st['h1']))
    story.append(Paragraph(
        'This document provides a comprehensive, module-wise functional specification for the AI-powered Human '
        'Resource Management System (HRMS). It serves as the authoritative reference for Development Teams, '
        'QA Teams, Product Stakeholders, and Operations Teams.', st['body']))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'This document covers ten functional modules, seven organizational roles, nine configured workflows, '
        'cross-module integration specifications, and AI feature definitions. It does not cover infrastructure, '
        'deployment topology, or non-functional requirements.', st['body']))
    story.append(Spacer(1, 18))

    # Section 2: System Overview
    story.extend(add_major_section('2. System Overview', st['h1']))
    story.append(Paragraph(
        'The AI-powered HRMS is a unified, cloud-native platform designed to digitize and automate the full spectrum '
        'of human resource operations - from talent acquisition through employee lifecycle management to offboarding. '
        'The system leverages Artificial Intelligence across modules for predictive analytics, intelligent screening, '
        'automated recommendations, and anomaly detection.', st['body']))
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>Architectural Principles</b>', st['h2']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Principle', 'Description'],
        [
            ['Role-Driven Access', 'Every feature is gated by a hierarchical RBAC model with Level 0-4 granularity'],
            ['Workflow-First Design', 'All state-changing operations traverse configurable approval workflows'],
            ['AI-Augmented Operations', 'AI assists but does not autonomously execute critical decisions without human confirmation'],
            ['Audit Trail Completeness', 'Every CREATE, UPDATE, DELETE operation is logged with actor, timestamp, and delta'],
            ['Module Independence', 'Modules are independently deployable but communicate via event bus for cross-cutting concerns'],
        ],
        col_widths=[0.28*CONTENT_W, 0.72*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 18))

    # Section 3: Role Definitions
    story.extend(add_major_section('3. Role Definitions and Hierarchy', st['h1']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Role', 'Level', 'Scope of Authority', 'Delegation'],
        [
            ['Super Admin', '0', 'Unlimited - full system configuration, all modules, all data', 'Yes'],
            ['HR Admin', '1', 'HR operations, payroll oversight, performance, attendance, lifecycle', 'Yes (HR)'],
            ['Payroll Specialist', '2', 'Payroll processing, tax declarations, statutory compliance', 'No'],
            ['Department Manager', '3', 'Team management, leave/expense approvals, performance reviews', 'Yes (acting)'],
            ['Employee', '4', 'Self-service only - view own data, submit requests', 'No'],
            ['Recruiter', '2', 'Job postings, candidate pipeline, interview scheduling, AI screening', 'No'],
            ['L&D Manager', '2', 'Course catalog, skill assessments, training program management', 'No'],
        ],
        col_widths=[0.18*CONTENT_W, 0.08*CONTENT_W, 0.55*CONTENT_W, 0.19*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>Role Hierarchy Inheritance Rules</b>', st['h2']))
    rules = [
        'Super Admin inherits all permissions of every role.',
        'HR Admin inherits Employee-level self-service permissions.',
        'Department Manager inherits Employee-level self-service permissions.',
        'Roles at the same level (Level 2) do not inherit from each other - Payroll Specialist, Recruiter, and L&D Manager have orthogonal permission sets.',
        'Delegation is time-bound (max 30 days) and auditable.',
    ]
    for i, r in enumerate(rules, 1):
        story.append(Paragraph('%d. %s' % (i, r), st['numbered']))
    story.append(Spacer(1, 18))

    # Module sections (condensed for space but comprehensive)
    modules = [
        ('4', 'Dashboard', 'central command center for all HRMS users', 'Role-Adaptive Widgets, KPI Scorecards, Pending Actions Panel, AI Insight Cards, Quick Action Buttons, Announcements Banner, Calendar Integration, Trend Charts, Document Expiry Alerts, Team Availability View',
         [('Predictive Attrition Alert', 'Employee tenure, engagement scores, salary benchmark', 'Gradient-boosted classification model with 90-day prediction window', 'Risk score (0-100), contributing factors, retention actions'),
          ('Hiring Demand Forecast', 'Historical attrition, open requisitions, growth rate', 'Time-series forecasting (ARIMA + ensemble)', '30/60/90-day hiring demand by department'),
          ('Engagement Score Predictor', 'Pulse survey responses, attendance, LMS activity', 'NLP sentiment analysis + behavioral clustering', 'Engagement score (1-10), trend direction, at-risk list')]),
        ('5', 'Employee Management', 'system of record for all employee lifecycle data', 'Employee Master Data, Employment Records, Organization Chart, Document Management, Asset Assignment, Job History Timeline, Onboarding Checklist, Offboarding Workflow, Bulk Import/Export, AI Duplicate Detection, Employee Directory, Probation Management',
         [('Duplicate Record Detection', 'Employee name, DOB, email, phone, national ID', 'Fuzzy matching with Levenshtein distance + phonetic matching', 'Potential duplicate pairs with confidence score'),
          ('Onboarding Task Prediction', 'Role, department, location, access requirements', 'ML model trained on historical onboarding patterns', 'Auto-generated onboarding checklist'),
          ('Flight Risk Assessment', 'Tenure, compensation benchmark, engagement, manager rating', 'Ensemble model (logistic regression + XGBoost)', 'Risk classification with retention strategy')]),
        ('6', 'RBAC and Security', 'enforces the principle of least privilege', 'User Account Management, Role Assignment Engine, Permission Policy Editor, MFA, Session Management, Audit Log Viewer, Data Encryption Management, IP Whitelisting, Delegation Management, Compliance Reporting, Login Analytics, API Key Management',
         [('Anomalous Login Detection', 'Login time, IP geolocation, device fingerprint', 'Isolation Forest anomaly detection', 'Risk score, suggested action, incident ticket'),
          ('Privilege Escalation Detection', 'Role change history, access patterns, permission utilization', 'Behavioral analysis: actual usage vs. granted permissions', 'Unused permission report, over-provisioning alerts'),
          ('Insider Threat Scoring', 'Data access patterns, bulk downloads, off-hours activity', 'Graph-based anomaly detection across user behavior network', 'Threat score, flagged activities, investigation actions')]),
        ('7', 'AI Talent Acquisition', 'automates and optimizes end-to-end recruitment', 'Job Requisition Management, Job Posting Multi-Channel, AI Resume Screening, Candidate Pipeline (Kanban), Interview Scheduling, Assessment Integration, Offer Letter Generation, AI Bias Detection, Candidate Communication, Referral Management, Recruitment Analytics, AI Candidate Matching, Talent Pool Management',
         [('Resume Parser and Screener', 'Resume file (PDF/DOCX), job description, required skills', 'NLP-based extraction (spaCy + custom NER)', 'Structured profile, match score (0-100), ranking'),
          ('Bias Detection Engine', 'Job description text, screening criteria, historical data', 'NLP with debiased word embeddings, statistical parity', 'Bias score per category, suggested rewording'),
          ('Candidate-Job Matching', 'Candidate profile, job requirements, team composition', 'Multi-dimensional matching: skills, experience, culture fit', 'Match percentage, ranked list, hiring recommendation')]),
        ('8', 'Time and Attendance', 'captures, validates, and processes work-time data', 'Check-In/Check-Out, Shift Management, Leave Management, Holiday Calendar, Overtime Tracking, Attendance Regularization, Comp-Off Management, Timesheet Management, AI Anomaly Detection, Attendance Policy Engine, Leave Encashment, WFH Tracking',
         [('Buddy Punching Detection', 'Check-in/out timestamps, geolocation, device IDs', 'Clustering analysis on co-located check-ins', 'Suspicious pairs report, confidence score'),
          ('Absenteeism Prediction', 'Historical leave patterns, engagement, workload', 'LSTM-based time-series model with attention', '30-day absence probability, high-risk group ID'),
          ('Optimal Shift Scheduling', 'Employee preferences, workload, labor laws, skill coverage', 'Constraint satisfaction optimization (genetic algorithm)', 'Proposed shift roster, coverage analysis')]),
        ('9', 'Payroll and Expenses', 'handles complete payroll lifecycle', 'Salary Structure Definition, Payroll Processing, Tax Calculation Engine, Statutory Compliance, Expense Claim Management, Advance Salary, Loan Management, Payslip Generation, Bank Integration, Tax Declaration, AI Payroll Anomaly Detection, Year-End Processing, Reimbursement Policies',
         [('Payroll Anomaly Detection', 'Payroll register, historical patterns, organizational averages', 'Statistical outlier detection (Z-score + IQR)', 'Flagged entries with anomaly type, severity'),
          ('Expense Fraud Detection', 'Expense claims, receipt images, historical claims', 'OCR on receipts, duplicate image detection, pattern analysis', 'Fraud probability score, flagged claims'),
          ('Salary Benchmarking AI', 'Role, experience, location, market data', 'Regression analysis on multi-source market data', 'Suggested salary band, market percentile')]),
        ('10', 'Performance and Talent', 'manages performance evaluation lifecycle', 'Goal Setting (OKR/KPI), Review Cycle Management, Self-Assessment, Peer Review (360), Manager Review, Calibration Sessions, PIP, Succession Planning, 9-Box Talent Matrix, Competency Framework, AI Performance Insights, Promotion Workflow, Skill Gap Analysis',
         [('Feedback Sentiment Analysis', 'Written feedback text from all review channels', 'NLP sentiment analysis (BERT-based), emotion detection', 'Sentiment score, key themes, flagged feedback'),
          ('Rating Bias Detector', 'Ratings by manager, department, demographics', 'Statistical parity analysis, regression for attribute correlation', 'Bias indicators, rating adjustment recommendations'),
          ('Succession Readiness Score', 'Performance history, skill assessments, leadership potential', 'Multi-factor scoring model with weighted criteria', 'Readiness score (1-100), development gap analysis')]),
        ('11', 'Learning and Development', 'manages course catalog, learning paths, and skill inventory', 'Course Catalog, Learning Paths, Skill Inventory, AI Training Recommendations, Assessment Engine, Certification Tracking, Competency Mapping, Mandatory Training Assignment, Learning Analytics, Content Management',
         [('Course Recommendation Engine', 'Employee skill profile, skill gaps, career goals, role requirements', 'Collaborative filtering + content-based filtering hybrid', 'Personalized course recommendations ranked by relevance'),
          ('Skill Gap Auto-Detection', 'Role competency model, current skill assessments, training history', 'ML model comparing actual vs. required proficiency', 'Skill gap report with priority ranking and training suggestions'),
          ('Learning Path Optimization', 'Employee learning style, available time, career trajectory', 'Reinforcement learning on learning outcome data', 'Optimized learning path sequence and pacing')]),
        ('12', 'Analytics and Reporting', 'provides dashboards, predictive analytics, and custom reports', 'Real-Time Dashboards (6 types), Predictive Analytics (4 models), Custom Report Builder, Data Export (PDF/Excel/CSV), Department-Specific Views, KPI Tracking, Trend Analysis, Benchmarking',
         [('Attrition Risk Prediction', 'Employee demographics, engagement, performance, market data', 'Gradient-boosted classification with 90-day window', 'Risk score, contributing factors, recommended actions'),
          ('Headcount Forecast', 'Historical headcount, business growth rate, seasonal patterns', 'Time-series forecasting with confidence intervals', 'Projected headcount by department for 6/12 months'),
          ('Training Completion Forecast', 'Enrollment data, course difficulty, historical completion rates', 'Survival analysis on enrollment data', 'Predicted completion dates, at-risk enrollments')]),
        ('13', 'Employee Self-Service', 'centralized portal for employee self-service', 'Profile Management, Leave Requests, Expense Submission, Payslip Access, AI Chat Assistant, Document Access, Training Enrollment, Benefit Selection, Feedback Submission, Directory Search',
         [('AI HR Assistant', 'Natural language queries about HR policies, procedures, and personal data', 'LLM-based conversational AI with HR domain fine-tuning', 'Context-aware responses with reference links and actionable suggestions'),
          ('Smart Form Completion', 'Partial form data, employee profile, historical patterns', 'Auto-fill based on profile data and learned patterns', 'Pre-populated form fields with suggestions'),
          ('Proactive Notification', 'Employee data changes, policy updates, deadline proximity', 'Rule engine + ML prediction of relevant notifications', 'Timely, personalized notifications for required actions')]),
    ]

    for mod_num, mod_title, purpose, features_str, ai_features in modules:
        story.extend(add_major_section('%s. Module: %s' % (mod_num, mod_title), st['h1']))
        story.append(Paragraph('<b>%s.1 Module Overview and Purpose</b>' % mod_num, st['h2']))
        story.append(Paragraph(
            'The %s module %s.' % (mod_title, purpose), st['body']))
        story.append(Spacer(1, 12))

        story.append(Paragraph('<b>%s.2 Feature List</b>' % mod_num, st['h2']))
        features = [f.strip() for f in features_str.split(',')]
        story.append(Spacer(1, 4))
        for i, feat in enumerate(features, 1):
            story.append(Paragraph('%d. %s' % (i, feat.strip()), st['numbered']))
        story.append(Spacer(1, 12))

        if ai_features:
            story.append(Paragraph('<b>%s.3 AI Features</b>' % mod_num, st['h2']))
            story.append(Spacer(1, 6))
            ai_data = [['AI Feature', 'Input', 'Processing', 'Output']]
            for name, inp, proc, out in ai_features:
                ai_data.append([name, inp, proc, out])
            n = len(ai_data[0])
            tbl = make_wide_table(
                ['AI Feature', 'Input', 'Processing', 'Output'],
                ai_data[1:],
                col_widths=[0.22*CONTENT_W, 0.24*CONTENT_W, 0.30*CONTENT_W, 0.24*CONTENT_W]
            )
            story.append(tbl)
            story.append(Spacer(1, 18))

    # Section 14: Configured Workflows
    story.extend(add_major_section('14. Configured Workflows', st['h1']))
    story.append(Paragraph(
        'The HRMS platform implements nine configured workflows that govern state-changing operations across modules. '
        'Each workflow follows a multi-level approval pattern with configurable escalation rules and SLA tracking.', st['body']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Workflow', 'Trigger', 'Approval Levels', 'SLA'],
        [
            ['Leave Approval', 'Employee submits leave request', 'Manager → HR (if > 3 days)', '24 hours'],
            ['Expense Approval', 'Employee submits expense claim', 'Manager → Finance', '48 hours'],
            ['Payroll Processing', 'HR Admin initiates monthly payroll', 'HR Admin → Finance verification', 'End of month'],
            ['Performance Review', 'Review cycle published', 'Self → Peer → Manager → Calibration', 'Cycle duration'],
            ['Onboarding', 'Candidate marked as "Hired"', 'IT → HR → Manager → L&D', '5 business days'],
            ['Offboarding', 'Employee status set to "Inactive"', 'IT → Finance → HR clearance', '10 business days'],
            ['Job Requisition', 'Department Manager creates requisition', 'HR Admin → Budget approval', '3 business days'],
            ['Promotion Nomination', 'Manager nominates employee', 'HR review → Committee approval', '15 business days'],
            ['Policy Update', 'HR Admin creates/updates policy', 'Legal review → HR Admin approval', '5 business days'],
        ],
        col_widths=[0.18*CONTENT_W, 0.27*CONTENT_W, 0.30*CONTENT_W, 0.25*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 18))

    # Section 15: Complete RBAC Permission Matrix
    story.extend(add_major_section('15. Complete RBAC Permission Matrix', st['h1']))
    story.append(Paragraph(
        'The following matrix summarizes the permission levels across all modules for each role. '
        'Permission levels: ADMIN = full control, WRITE = create/edit, READ = view only, - = no access.', st['body']))
    story.append(Spacer(1, 6))
    tbl = make_wide_table(
        ['Module', 'Super Admin', 'HR Admin', 'Payroll', 'Dept Mgr', 'Employee', 'Recruiter', 'L&D Mgr'],
        [
            ['Dashboard', 'ADMIN', 'ADMIN', 'READ', 'READ', 'READ(own)', 'READ', 'READ'],
            ['Employees', 'ADMIN', 'WRITE', 'READ', 'READ(team)', 'READ(own)', 'READ', 'READ'],
            ['RBAC', 'ADMIN', 'WRITE', '-', '-', '-', '-', '-'],
            ['Talent', 'ADMIN', 'WRITE', '-', 'READ(team)', '-', 'ADMIN', '-'],
            ['Attendance', 'ADMIN', 'WRITE', 'READ', 'WRITE(approve)', 'WRITE(own)', 'WRITE(own)', 'WRITE(own)'],
            ['Payroll', 'ADMIN', 'WRITE(approve)', 'ADMIN', '-', 'READ(own)', '-', '-'],
            ['Performance', 'ADMIN', 'WRITE', '-', 'WRITE(team)', 'WRITE(own)', '-', 'READ'],
            ['Learning', 'ADMIN', 'WRITE', '-', '-', 'WRITE(enroll)', '-', 'ADMIN'],
            ['Analytics', 'ADMIN', 'ADMIN', 'READ(payroll)', 'READ(team)', '-', 'READ', 'READ'],
            ['Self-Service', 'ADMIN', 'ADMIN', 'WRITE(own)', 'WRITE(own)', 'WRITE(own)', 'WRITE(own)', 'WRITE(own)'],
        ],
        col_widths=[0.14*CONTENT_W, 0.12*CONTENT_W, 0.12*CONTENT_W, 0.12*CONTENT_W, 0.14*CONTENT_W, 0.14*CONTENT_W, 0.11*CONTENT_W, 0.11*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 18))

    # Section 16: Workflow State Machines
    story.extend(add_major_section('16. Workflow State Machine Definitions', st['h1']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Workflow', 'States', 'Transitions'],
        [
            ['Leave', 'Pending → Approved/Rejected', 'Manager approves/rejects; HR overrides for > 3 days'],
            ['Expense', 'Pending → Manager Approved → Finance Approved → Reimbursed / Rejected', 'Each level approves/rejects; rejected = terminal'],
            ['Payroll', 'Draft → Processing → Verified → Paid', 'HR initiates, finance verifies, system disburses'],
            ['Candidate', 'Applied → Screening → Interview → Offered → Hired / Rejected', 'Recruiter advances/rejects at each stage'],
            ['Onboarding', 'Pending → In Progress → Completed', 'Checklist items auto-transition on completion'],
            ['Performance', 'Draft → In Review → Completed', 'Self → Manager → Calibration sequence'],
        ],
        col_widths=[0.15*CONTENT_W, 0.35*CONTENT_W, 0.50*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 18))

    # Section 17: Notification Triggers
    story.extend(add_major_section('17. Notification Triggers', st['h1']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Trigger Event', 'Recipients', 'Channel', 'Priority'],
        [
            ['Leave request submitted', 'Reporting Manager', 'Email + In-app', 'Normal'],
            ['Leave approved/rejected', 'Employee', 'Email + In-app', 'Normal'],
            ['Expense claim approved', 'Employee, Finance', 'In-app', 'Normal'],
            ['Payroll processed', 'All employees', 'Email', 'High'],
            ['AI attrition alert (high risk)', 'HR Admin, Department Manager', 'Email + In-app', 'Critical'],
            ['Document expiry warning (30/15/7 days)', 'Employee, HR Admin', 'Email + In-app', 'High'],
            ['Review cycle published', 'All participants', 'Email + In-app', 'Normal'],
            ['Onboarding task overdue', 'HR Admin, Manager, New Hire', 'Email + In-app', 'High'],
            ['Policy updated', 'All employees', 'Email + In-app', 'Normal'],
            ['Suspicious login detected', 'User, Super Admin', 'Email + SMS', 'Critical'],
        ],
        col_widths=[0.25*CONTENT_W, 0.25*CONTENT_W, 0.20*CONTENT_W, 0.30*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 18))

    # Section 18: Cross-Module Integration Map
    story.extend(add_major_section('18. Cross-Module Integration Map', st['h1']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Source Module', 'Target Module', 'Data Flow', 'Integration Type'],
        [
            ['Employee Management', 'RBAC & Security', 'New employee → user account creation', 'Write'],
            ['Employee Management', 'Payroll & Expenses', 'Bank details, salary structure', 'Write'],
            ['Time & Attendance', 'Payroll & Expenses', 'Attendance data, leave deductions, OT hours', 'Write'],
            ['AI Talent Acquisition', 'Employee Management', 'Hired candidate → new employee record', 'Write'],
            ['Performance & Talent', 'Learning & Development', 'Skill gaps → mandatory training assignments', 'Write'],
            ['All Modules', 'Dashboard', 'Aggregated metrics and KPIs', 'Read'],
            ['All Modules', 'Analytics & Reporting', 'Data for dashboards and custom reports', 'Read'],
            ['All Modules', 'Audit Log', 'CRUD operations logged with actor and delta', 'Write'],
            ['RBAC & Security', 'All Modules', 'Permission checks on every API request', 'Enforce'],
        ],
        col_widths=[0.22*CONTENT_W, 0.22*CONTENT_W, 0.35*CONTENT_W, 0.21*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 18))

    # Section 19: Data Flow Diagrams
    story.extend(add_major_section('19. Data Flow Diagrams', st['h1']))
    story.append(Paragraph(
        'The data flow architecture follows a hub-and-spoke model with Employee Management as the central hub. '
        'Employee data feeds into all other modules, while cross-module communication is event-driven. '
        'Key data flows include: Employee → Payroll (salary structure), Attendance → Payroll (time records), '
        'Talent Acquisition → Employee (new hire creation), Performance → Learning (skill gap training), '
        'and all modules → Audit Log (operation logging).', st['body']))
    story.append(Spacer(1, 18))

    # Section 20: Appendix
    story.extend(add_major_section('20. Appendix', st['h1']))
    story.append(Paragraph('<b>A. Document Revision History</b>', st['h2']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Version', 'Date', 'Author', 'Changes'],
        [
            ['1.0.0', '2025-01-15', 'HRMS Product Team', 'Initial release'],
            ['2.0.0', '2025-03-05', 'HRMS Product Team', 'Added AI features, RBAC matrices, workflows'],
        ],
        col_widths=[0.12*CONTENT_W, 0.15*CONTENT_W, 0.25*CONTENT_W, 0.48*CONTENT_W]
    )
    story.append(tbl)
    story.append(Spacer(1, 12))

    story.append(Paragraph('<b>B. Acronyms</b>', st['h2']))
    story.append(Spacer(1, 6))
    tbl = make_table(
        ['Acronym', 'Full Form'],
        [
            ['HRMS', 'Human Resource Management System'],
            ['RBAC', 'Role-Based Access Control'],
            ['OKR', 'Objectives and Key Results'],
            ['MFA', 'Multi-Factor Authentication'],
            ['LSTM', 'Long Short-Term Memory'],
            ['NER', 'Named Entity Recognition'],
            ['NLP', 'Natural Language Processing'],
            ['KPI', 'Key Performance Indicator'],
            ['CTC', 'Cost to Company'],
            ['PIP', 'Performance Improvement Plan'],
        ],
        col_widths=[0.20*CONTENT_W, 0.80*CONTENT_W]
    )
    story.append(tbl)


# ━━ MAIN ━━

if __name__ == '__main__':
    output_dir = '/home/z/my-project/download'

    print("Generating Document 1: User SOP...")
    path1 = build_document(
        os.path.join(output_dir, 'AI-HRMS_User_SOP.pdf'),
        'AI-HRMS: AI-Powered Human<br/>Resource Management System',
        'User Standard Operating Procedure (SOP)',
        'USER SOP',
        'March 2026',
        'Internal - All Employees',
        build_user_sop
    )
    print(f"  Done: {path1}")

    print("Generating Document 2: Technical Documentation...")
    path2 = build_document(
        os.path.join(output_dir, 'AI-HRMS_Technical_Documentation.pdf'),
        'AI-HRMS: AI-Powered Human<br/>Resource Management System',
        'Developer Technical Documentation',
        'TECHNICAL DOCUMENTATION',
        'March 2025',
        'Internal - Development Team',
        build_technical_doc
    )
    print(f"  Done: {path2}")

    print("Generating Document 3: Functionality Document...")
    path3 = build_document(
        os.path.join(output_dir, 'AI-HRMS_Functionality_Document.pdf'),
        'AI-HRMS: AI-Powered Human<br/>Resource Management System',
        'Module-wise Functionality Document',
        'FUNCTIONALITY DOCUMENT',
        'March 2025',
        'Internal - Confidential',
        build_functionality_doc
    )
    print(f"  Done: {path3}")

    print("\nAll 3 PDFs generated successfully!")
