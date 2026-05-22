#!/usr/bin/env python3
"""
AI-HRMS User Standard Operating Procedures PDF Generator
Cover: HTML/Playwright (Template 07 - Solid Sidebar, Authority intent)
Body:  ReportLab with auto-TOC
Merge: pypdf
"""

import os, sys, hashlib, subprocess

# ── Paths ──────────────────────────────────────────────────────────────
PDF_SKILL_DIR = "/home/z/my-project/skills/pdf"
OUTPUT_DIR    = "/home/z/my-project/download"
BODY_PDF      = os.path.join(OUTPUT_DIR, "_sop_body.pdf")
COVER_PDF     = os.path.join(OUTPUT_DIR, "_sop_cover.pdf")
FINAL_PDF     = os.path.join(OUTPUT_DIR, "AI-HRMS_User_SOP.pdf")
COVER_HTML    = os.path.join(OUTPUT_DIR, "_sop_cover.html")

# ── Palette (cascade, auto-generated) ─────────────────────────────────
from reportlab.lib import colors

PAGE_BG       = colors.HexColor('#f3f3f4')
SECTION_BG    = colors.HexColor('#eaeced')
CARD_BG       = colors.HexColor('#e9ebec')
TABLE_STRIPE  = colors.HexColor('#eef0f0')
HEADER_FILL   = colors.HexColor('#465c67')
COVER_BLOCK   = colors.HexColor('#455760')
BORDER        = colors.HexColor('#bbcbd3')
ICON          = colors.HexColor('#386a83')
ACCENT        = colors.HexColor('#d16643')
ACCENT_2      = colors.HexColor('#58cc39')
TEXT_PRIMARY   = colors.HexColor('#202224')
TEXT_MUTED     = colors.HexColor('#80868a')
SEM_SUCCESS   = colors.HexColor('#417753')
SEM_WARNING   = colors.HexColor('#a98845')
SEM_ERROR     = colors.HexColor('#ae5750')
SEM_INFO      = colors.HexColor('#507191')

TABLE_HEADER_COLOR = HEADER_FILL
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = TABLE_STRIPE

# ── Fonts ──────────────────────────────────────────────────────────────
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

pdfmetrics.registerFont(TTFont('LiberationSerif', '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSerif-Bold', '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSans', '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSans-Bold', '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))

registerFontFamily('LiberationSerif', normal='LiberationSerif', bold='LiberationSerif-Bold')
registerFontFamily('LiberationSans', normal='LiberationSans', bold='LiberationSans-Bold')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans')

# ── ReportLab imports ──────────────────────────────────────────────────
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm, mm
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, CondPageBreak, HRFlowable, ListFlowable, ListItem
)
from reportlab.platypus.tableofcontents import TableOfContents

PAGE_W, PAGE_H = A4
LEFT_MARGIN   = 1.0 * inch
RIGHT_MARGIN  = 1.0 * inch
TOP_MARGIN    = 0.85 * inch
BOTTOM_MARGIN = 0.85 * inch
CONTENT_W = PAGE_W - LEFT_MARGIN - RIGHT_MARGIN
MAX_KEEP_HEIGHT = PAGE_H * 0.4
H1_ORPHAN_THRESHOLD = (PAGE_H - TOP_MARGIN - BOTTOM_MARGIN) * 0.15

# ── Styles ─────────────────────────────────────────────────────────────
FONT = 'LiberationSerif'

styles = getSampleStyleSheet()

sH1 = ParagraphStyle('SOPH1', fontName=FONT, fontSize=20, leading=28,
                      textColor=HEADER_FILL, spaceBefore=18, spaceAfter=10,
                      alignment=TA_LEFT)
sH2 = ParagraphStyle('SOPH2', fontName=FONT, fontSize=15, leading=22,
                      textColor=HEADER_FILL, spaceBefore=14, spaceAfter=8,
                      alignment=TA_LEFT)
sH3 = ParagraphStyle('SOPH3', fontName=FONT, fontSize=12.5, leading=18,
                      textColor=ICON, spaceBefore=10, spaceAfter=6,
                      alignment=TA_LEFT)
sBody = ParagraphStyle('SOPBody', fontName=FONT, fontSize=10.5, leading=17,
                        textColor=TEXT_PRIMARY, spaceBefore=2, spaceAfter=6,
                        alignment=TA_JUSTIFY)
sBodyLeft = ParagraphStyle('SOPBodyLeft', fontName=FONT, fontSize=10.5, leading=17,
                            textColor=TEXT_PRIMARY, spaceBefore=2, spaceAfter=6,
                            alignment=TA_LEFT)
sStep = ParagraphStyle('SOPStep', fontName=FONT, fontSize=10.5, leading=17,
                        textColor=TEXT_PRIMARY, spaceBefore=2, spaceAfter=4,
                        leftIndent=18, alignment=TA_LEFT)
sNote = ParagraphStyle('SOPNote', fontName=FONT, fontSize=9.5, leading=15,
                        textColor=TEXT_MUTED, spaceBefore=4, spaceAfter=4,
                        leftIndent=18, alignment=TA_LEFT,
                        borderColor=BORDER, borderWidth=0.5,
                        borderPadding=6, backColor=colors.HexColor('#f8f9fa'))
sBullet = ParagraphStyle('SOPBullet', fontName=FONT, fontSize=10.5, leading=17,
                          textColor=TEXT_PRIMARY, spaceBefore=1, spaceAfter=3,
                          leftIndent=28, bulletIndent=14, alignment=TA_LEFT)
sTableHeader = ParagraphStyle('SOPTableHeader', fontName=FONT, fontSize=10,
                               leading=14, textColor=colors.white, alignment=TA_CENTER)
sTableCell = ParagraphStyle('SOPTableCell', fontName=FONT, fontSize=9.5,
                             leading=14, textColor=TEXT_PRIMARY, alignment=TA_LEFT)
sTableCellC = ParagraphStyle('SOPTableCellC', fontName=FONT, fontSize=9.5,
                              leading=14, textColor=TEXT_PRIMARY, alignment=TA_CENTER)
sCaption = ParagraphStyle('SOPCaption', fontName=FONT, fontSize=9, leading=13,
                           textColor=TEXT_MUTED, alignment=TA_CENTER,
                           spaceBefore=4, spaceAfter=12)

# TOC styles
sTOC1 = ParagraphStyle('TOC1', fontName=FONT, fontSize=12, leading=20,
                        leftIndent=20, textColor=TEXT_PRIMARY)
sTOC2 = ParagraphStyle('TOC2', fontName=FONT, fontSize=10.5, leading=18,
                        leftIndent=40, textColor=TEXT_MUTED)

# ── Helpers ────────────────────────────────────────────────────────────
def h1(text, level=0):
    key = 'h_%s' % hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/><b>%s</b>' % (key, text), sH1)
    p.bookmark_name = text
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p

def h2(text, level=1):
    key = 'h_%s' % hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/><b>%s</b>' % (key, text), sH2)
    p.bookmark_name = text
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p

def h3(text):
    return Paragraph('<b>%s</b>' % text, sH3)

def body(text):
    return Paragraph(text, sBody)

def body_left(text):
    return Paragraph(text, sBodyLeft)

def step(n, text):
    return Paragraph('<b>Step %d:</b> %s' % (n, text), sStep)

def note(text):
    return Paragraph('<b>Note:</b> %s' % text, sNote)

def bullet(text):
    return Paragraph(text, sBullet, bulletText='\u2022')

def make_table(headers, rows, col_ratios=None):
    """Create a professional table with header and alternating rows."""
    data = [[Paragraph('<b>%s</b>' % h, sTableHeader) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), sTableCell) for c in row])
    if col_ratios:
        cw = [r * CONTENT_W for r in col_ratios]
    else:
        cw = [CONTENT_W / len(headers)] * len(headers)
    t = Table(data, colWidths=cw, hAlign='CENTER')
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]
    for i in range(1, len(data)):
        bg = TABLE_ROW_EVEN if i % 2 == 1 else TABLE_ROW_ODD
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t

def section_break():
    return Spacer(1, 24)

def hr():
    return HRFlowable(width="100%", thickness=0.5, color=BORDER,
                      spaceBefore=6, spaceAfter=6)


# ── TocDocTemplate ─────────────────────────────────────────────────────
class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))


# =====================================================================
# COVER PAGE (HTML / Playwright)
# =====================================================================
def create_cover_html():
    """Template 07: Solid Sidebar - Authority intent for SOP."""
    html = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>AI-HRMS User SOP Cover</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800;900&display=swap" rel="stylesheet">
<style>
  @page { size: 794px 1123px; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 794px; height: 1123px; overflow: hidden; }
  body { background: #ffffff; font-family: 'Inter', sans-serif; }

  /* Layer 0 - Background */
  .page { position: relative; width: 794px; height: 1123px; background: #ffffff; }

  /* Layer 1 - Sidebar pillar */
  .sidebar {
    position: absolute; top: 0; left: 0;
    width: 79px; height: 1123px;
    background: #465c67;
    z-index: 1;
    overflow: hidden;
  }
  .sidebar-watermark {
    position: absolute;
    left: 50%; top: 50%;
    transform: translate(-50%, -50%) rotate(-90deg);
    font-size: 72px; font-weight: 900;
    color: rgba(255,255,255,0.12);
    white-space: nowrap;
    letter-spacing: 8px;
  }

  /* Layer 2 - Structure */
  .bottom-line {
    position: absolute;
    bottom: 112px; left: 119px;
    width: 600px; height: 1px;
    background: rgba(70,92,103,0.30);
    z-index: 2;
  }

  /* Layer 3 - Content */
  .content {
    position: absolute;
    left: 119px; top: 0;
    width: 600px; height: 1123px;
    z-index: 3;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 80px 0;
  }

  .kicker {
    font-size: 14px; font-weight: 400;
    letter-spacing: 4px; text-transform: uppercase;
    color: rgba(70,92,103,0.60);
    margin-bottom: 24px;
  }
  .hero-title {
    font-size: 52px; font-weight: 900;
    color: #202224; line-height: 1.12;
    margin-bottom: 14px;
  }
  .hero-subtitle {
    font-size: 22px; font-weight: 400;
    color: #465c67; line-height: 1.4;
    margin-bottom: 36px;
  }
  .summary {
    font-size: 16px; font-weight: 400;
    color: rgba(32,34,36,0.85); line-height: 1.65;
    max-width: 480px;
    margin-bottom: 44px;
  }
  .meta-line {
    font-size: 16px; font-weight: 400;
    color: #80868a; line-height: 2.0;
  }

  .footer-area {
    position: absolute;
    bottom: 60px; left: 119px;
    width: 600px;
    display: flex; justify-content: space-between;
    z-index: 3;
  }
  .footer-text {
    font-size: 14px; font-weight: 400;
    color: rgba(70,92,103,0.60);
  }
</style>
</head>
<body>
<div class="page">
  <!-- Layer 1: Sidebar -->
  <div class="sidebar">
    <div class="sidebar-watermark">SOP</div>
  </div>

  <!-- Layer 2: Structure -->
  <div class="bottom-line"></div>

  <!-- Layer 3: Content -->
  <div class="content">
    <div class="kicker">STANDARD OPERATING PROCEDURES</div>
    <div class="hero-title">AI-HRMS<br>User SOP</div>
    <div class="hero-subtitle">Comprehensive Procedures for All 9 Modules</div>
    <div class="summary">
      This document provides step-by-step user procedures for the AI-powered Human Resource
      Management System, covering Core HR, Talent Acquisition, Time &amp; Attendance, Payroll,
      Performance, Learning &amp; Development, Analytics, and Security modules.
    </div>
    <div class="meta-line">Version 1.0</div>
    <div class="meta-line">May 2026</div>
  </div>

  <div class="footer-area">
    <div class="footer-text">AI-HRMS DOCUMENTATION</div>
    <div class="footer-text">CONFIDENTIAL</div>
  </div>
</div>
</body>
</html>"""
    with open(COVER_HTML, 'w', encoding='utf-8') as f:
        f.write(html)
    return COVER_HTML


# =====================================================================
# BODY CONTENT (ReportLab)
# =====================================================================
def build_body():
    doc = TocDocTemplate(
        BODY_PDF, pagesize=A4,
        leftMargin=LEFT_MARGIN, rightMargin=RIGHT_MARGIN,
        topMargin=TOP_MARGIN, bottomMargin=BOTTOM_MARGIN,
        title='AI-HRMS User Standard Operating Procedures',
        author='Z.ai', creator='Z.ai',
        subject='User SOP for AI-HRMS Application'
    )
    story = []

    # ── TABLE OF CONTENTS ──────────────────────────────────────────────
    story.append(Paragraph('<b>Table of Contents</b>', ParagraphStyle(
        'TOCTitle', fontName=FONT, fontSize=22, leading=30,
        textColor=HEADER_FILL, spaceBefore=20, spaceAfter=20, alignment=TA_LEFT)))
    toc = TableOfContents()
    toc.levelStyles = [sTOC1, sTOC2]
    story.append(toc)
    story.append(PageBreak())

    # ==================================================================
    # 1. INTRODUCTION
    # ==================================================================
    story.append(CondPageBreak(H1_ORPHAN_THRESHOLD))
    story.append(h1('1. Introduction'))

    story.append(h2('1.1 Purpose of the SOP'))
    story.append(body(
        'This Standard Operating Procedure (SOP) document provides comprehensive, step-by-step '
        'instructions for end users of the AI-HRMS (Artificial Intelligence - Human Resource '
        'Management System). The purpose is to ensure consistent, efficient, and error-free '
        'operation of all system modules across the organization. By following these procedures, '
        'users can maximize productivity while maintaining data integrity and compliance with '
        'organizational policies.'
    ))

    story.append(h2('1.2 Scope and Audience'))
    story.append(body(
        'This SOP covers all user-facing procedures for the 9 core modules of the AI-HRMS platform. '
        'The intended audience includes:'
    ))
    story.append(bullet('Super Administrators and HR Administrators'))
    story.append(bullet('Department Managers and Team Leads'))
    story.append(bullet('Employees (all roles)'))
    story.append(bullet('Recruiters and Talent Acquisition Specialists'))
    story.append(bullet('Learning &amp; Development Managers'))
    story.append(bullet('Payroll Specialists and Finance Personnel'))
    story.append(body(
        'Technical administration, server configuration, and developer APIs are outside the scope '
        'of this document and are covered separately in the Technical Documentation.'
    ))

    story.append(h2('1.3 System Overview'))
    story.append(body(
        'AI-HRMS is an enterprise-grade, AI-powered Human Resource Management System designed '
        'to streamline HR operations through intelligent automation. The system comprises 9 '
        'integrated modules:'
    ))
    story.append(make_table(
        ['#', 'Module', 'Primary Function'],
        [
            ['1', 'Core HR &amp; Employee Management', 'Employee lifecycle, directory, org chart'],
            ['2', 'RBAC &amp; Security System', 'Role-based access, audit trails, encryption'],
            ['3', 'AI-Driven Talent Acquisition &amp; Onboarding', 'Recruitment pipeline, AI matching'],
            ['4', 'Time &amp; Attendance Management', 'Attendance, leave, shifts, holidays'],
            ['5', 'Payroll &amp; Expense Management', 'Salary processing, expenses, tax'],
            ['6', 'Performance &amp; Talent Development', 'OKRs, reviews, attrition prediction'],
            ['7', 'Learning &amp; Development', 'Courses, skills, certifications'],
            ['8', 'Analytics &amp; Reporting', 'Dashboards, forecasts, custom reports'],
            ['9', 'Employee Self-Service &amp; Collaboration', 'Self-service, chatbot, policies'],
        ],
        col_ratios=[0.06, 0.44, 0.50]
    ))
    story.append(Spacer(1, 18))

    story.append(h2('1.4 How to Use This Document'))
    story.append(body(
        'This document is organized by module. Each section contains numbered step-by-step '
        'procedures for common tasks. Use the Table of Contents to navigate directly to the '
        'procedure you need. Notes and tips are provided in highlighted boxes. Role-specific '
        'procedures are consolidated in Section 12 for quick reference.'
    ))

    # ==================================================================
    # 2. GETTING STARTED
    # ==================================================================
    story.append(section_break())
    story.append(CondPageBreak(H1_ORPHAN_THRESHOLD))
    story.append(h1('2. Getting Started'))

    story.append(h2('2.1 Accessing the System'))
    story.append(body('To access the AI-HRMS application:'))
    story.append(step(1, 'Open a supported web browser (Google Chrome 90+, Microsoft Edge 90+, or Firefox 88+).'))
    story.append(step(2, 'Navigate to the AI-HRMS URL provided by your IT department (e.g., https://hrms.yourcompany.com).'))
    story.append(step(3, 'Ensure your browser allows pop-ups and JavaScript for full functionality.'))
    story.append(note('Mobile access is available via responsive web design. For the best experience, use a desktop browser with a minimum resolution of 1280 x 720 pixels.'))

    story.append(h2('2.2 Login Procedure'))
    story.append(step(1, 'On the AI-HRMS login page, enter your corporate email address in the Username field.'))
    story.append(step(2, 'Enter your password in the Password field. Passwords are case-sensitive.'))
    story.append(step(3, 'If Multi-Factor Authentication (MFA) is enabled, enter the 6-digit code from your authenticator app.'))
    story.append(step(4, 'Click the "Sign In" button.'))
    story.append(step(5, 'On first login, you will be prompted to change your temporary password and set up security questions.'))
    story.append(note('After 5 consecutive failed login attempts, your account will be locked for 30 minutes. Contact IT support if you cannot access your account.'))

    story.append(h2('2.3 Navigation Overview'))
    story.append(body(
        'The AI-HRMS interface consists of two primary navigation elements:'
    ))
    story.append(h3('Sidebar Navigation'))
    story.append(body(
        'The collapsible sidebar on the left side of the screen provides access to all 9 modules. '
        'Click any module name to expand its sub-menu and access specific features. The sidebar '
        'can be collapsed to icon-only mode by clicking the hamburger icon at the top.'
    ))
    story.append(h3('Header Bar'))
    story.append(body(
        'The top header bar contains: your profile avatar and name (top-right), a global search '
        'bar, notification bell with badge count, and a quick-actions dropdown for frequently used tasks.'
    ))

    story.append(h2('2.4 Dashboard Overview'))
    story.append(body('After login, you are presented with the main dashboard featuring:'))
    story.append(bullet('<b>KPI Cards:</b> Quick-glance metrics such as total employees, pending approvals, open positions, and attendance rate.'))
    story.append(bullet('<b>Charts:</b> Interactive charts showing headcount trends, department distribution, and attrition rates.'))
    story.append(bullet('<b>Quick Actions:</b> One-click buttons for common tasks like "Apply Leave," "Submit Expense," or "View Payslip."'))
    story.append(bullet('<b>Pending Approvals:</b> A list of items awaiting your action (visible to managers and HR admins).'))
    story.append(bullet('<b>Announcements:</b> Company-wide and department-specific announcements from HR.'))

    # ==================================================================
    # 3. CORE HR & EMPLOYEE MANAGEMENT
    # ==================================================================
    story.append(section_break())
    story.append(CondPageBreak(H1_ORPHAN_THRESHOLD))
    story.append(h1('3. Core HR &amp; Employee Management'))

    story.append(h2('3.1 Viewing Employee Directory'))
    story.append(step(1, 'From the sidebar, click "Core HR" then "Employee Directory."'))
    story.append(step(2, 'The directory displays all employees you have permission to view in a sortable, filterable table.'))
    story.append(step(3, 'Use the search bar to find employees by name, employee ID, or department.'))
    story.append(step(4, 'Apply filters using the filter panel: Department, Status, Location, or Designation.'))
    story.append(step(5, 'Click on any employee row to view their detailed profile.'))
    story.append(note('The information visible in the directory depends on your role and the data masking policies configured by your administrator.'))

    story.append(h2('3.2 Adding a New Employee'))
    story.append(body('This procedure is available to HR Admins and Super Admins only.'))
    story.append(step(1, 'Navigate to Core HR &gt; Employee Directory.'))
    story.append(step(2, 'Click the "Add Employee" button in the top-right corner.'))
    story.append(step(3, 'Fill in the mandatory fields in the Personal Information section: First Name, Last Name, Date of Birth, Gender, and Contact Number.'))
    story.append(step(4, 'Complete the Employment Details section: Employee ID, Department, Designation, Joining Date, and Employment Type.'))
    story.append(step(5, 'Upload a profile photo (optional, JPEG/PNG, max 2 MB).'))
    story.append(step(6, 'Enter Compensation details: Basic Salary, HRA, DA, and other components.'))
    story.append(step(7, 'Assign a Role from the RBAC dropdown (default: Employee).'))
    story.append(step(8, 'Click "Save" to create the employee record. The system will auto-generate login credentials and send them to the employee email.'))
    story.append(note('If the AI onboarding module is active, a new-hire onboarding checklist will be automatically created upon saving.'))

    story.append(h2('3.3 Editing Employee Information'))
    story.append(step(1, 'Navigate to the employee profile (Core HR &gt; Employee Directory &gt; click employee name).'))
    story.append(step(2, 'Click the "Edit" button (pencil icon) on the relevant section.'))
    story.append(step(3, 'Modify the required fields.'))
    story.append(step(4, 'Click "Save" to apply changes. All edits are recorded in the audit trail.'))

    story.append(h2('3.4 Viewing Employee Details'))
    story.append(body('The employee detail page provides a comprehensive view organized into tabs:'))
    story.append(bullet('<b>Profile:</b> Personal information, contact details, emergency contacts.'))
    story.append(bullet('<b>Documents:</b> Uploaded documents with access level indicators.'))
    story.append(bullet('<b>Assets:</b> Company assets assigned to the employee.'))
    story.append(bullet('<b>History:</b> Employment history, status changes, and transfer records.'))
    story.append(bullet('<b>Compensation:</b> Current salary structure and revision history.'))

    story.append(h2('3.5 Managing Employee Documents'))
    story.append(step(1, 'Open the employee profile and click the "Documents" tab.'))
    story.append(step(2, 'Click "Upload Document" to add a new document.'))
    story.append(step(3, 'Select the document type from the dropdown (e.g., ID Proof, Offer Letter, Certificate).'))
    story.append(step(4, 'Choose the file from your device (PDF, JPEG, PNG; max 10 MB per file).'))
    story.append(step(5, 'Set the Access Level: "Public" (visible to the employee and HR), "Confidential" (HR and manager only), or "Restricted" (HR admin only).'))
    story.append(step(6, 'Click "Upload" to save the document.'))

    story.append(h2('3.6 Asset Assignment and Tracking'))
    story.append(step(1, 'Navigate to Core HR &gt; Asset Management.'))
    story.append(step(2, 'Click "Assign Asset" to issue a new asset.'))
    story.append(step(3, 'Select the employee and the asset from the inventory.'))
    story.append(step(4, 'Enter the assignment date and expected return date (if applicable).'))
    story.append(step(5, 'Click "Assign." The asset status changes from "Available" to "Assigned."'))
    story.append(step(6, 'To return an asset, select the asset record and click "Return Asset." The status reverts to "Available."'))

    story.append(h2('3.7 Employee Status Changes'))
    story.append(body('Employee status transitions in AI-HRMS follow a defined lifecycle:'))
    story.append(make_table(
        ['Status', 'Description', 'Trigger'],
        [
            ['Onboarding', 'New hire completing setup', 'Employee created in system'],
            ['Active', 'Fully onboarded and working', 'Onboarding checklist completed'],
            ['On Leave', 'Temporarily absent', 'Leave request approved'],
            ['Inactive', 'Not currently active', 'Manual status change by HR'],
            ['Exited', 'No longer with organization', 'Exit process completed'],
        ],
        col_ratios=[0.18, 0.42, 0.40]
    ))
    story.append(Spacer(1, 18))

    story.append(h2('3.8 Org Chart Navigation'))
    story.append(step(1, 'Navigate to Core HR &gt; Org Chart.'))
    story.append(step(2, 'The interactive org chart displays the reporting hierarchy starting from the top-level executive.'))
    story.append(step(3, 'Click on any node to expand or collapse subordinates.'))
    story.append(step(4, 'Use the zoom controls (+ / -) to adjust the view level.'))
    story.append(step(5, 'Click on an employee card to view their profile in a side panel.'))
    story.append(step(6, 'Use the search bar within the org chart to locate a specific employee and highlight their position in the hierarchy.'))

    # ==================================================================
    # 4. RBAC & SECURITY SYSTEM
    # ==================================================================
    story.append(section_break())
    story.append(CondPageBreak(H1_ORPHAN_THRESHOLD))
    story.append(h1('4. RBAC &amp; Security System'))

    story.append(h2('4.1 Understanding Role-Based Access'))
    story.append(body(
        'AI-HRMS implements Role-Based Access Control (RBAC) to ensure users can only access '
        'features and data relevant to their role. Each role has a defined set of permissions '
        'that govern read, write, approve, and administrative actions across all modules.'
    ))
    story.append(body('The default roles in the system are:'))
    story.append(bullet('<b>Super Admin:</b> Full system access, including user management and system configuration.'))
    story.append(bullet('<b>HR Admin:</b> Access to all HR modules, employee data, and approval workflows.'))
    story.append(bullet('<b>Department Manager:</b> Access to team data, approvals, and performance reviews.'))
    story.append(bullet('<b>Employee:</b> Self-service features, personal data, leave, and expense submission.'))
    story.append(bullet('<b>Recruiter:</b> Talent acquisition module, candidate pipeline, and interview scheduling.'))
    story.append(bullet('<b>L&amp;D Manager:</b> Learning &amp; Development module, course management, and skill tracking.'))
    story.append(bullet('<b>Payroll Specialist:</b> Payroll processing, salary structures, and tax configuration.'))

    story.append(h2('4.2 Permission Matrix Overview'))
    story.append(body(
        'The permission matrix defines granular access rights for each role across modules. '
        'To view the permission matrix:'
    ))
    story.append(step(1, 'Navigate to Security &gt; Permission Matrix.'))
    story.append(step(2, 'Select a role from the dropdown to view its permissions across all modules.'))
    story.append(step(3, 'Permissions are displayed as: Read (R), Write (W), Approve (A), Admin (X).'))
    story.append(step(4, 'To modify permissions (Super Admin only), click "Edit Matrix," adjust the checkboxes, and click "Save."'))
    story.append(note('Changes to the permission matrix take effect immediately upon saving. Users currently logged in will see updated access on their next page navigation.'))

    story.append(h2('4.3 Viewing Audit Trails'))
    story.append(step(1, 'Navigate to Security &gt; Audit Trails.'))
    story.append(step(2, 'The audit log displays all system actions with: Timestamp, User, Action Type, Module, and Details.'))
    story.append(step(3, 'Use date range filters to narrow results.'))
    story.append(step(4, 'Filter by user, module, or action type for targeted searches.'))
    story.append(step(5, 'Click "Export" to download the audit trail as a CSV or PDF report.'))

    story.append(h2('4.4 Data Masking Features'))
    story.append(body(
        'AI-HRMS supports field-level data masking to protect sensitive employee information. '
        'Fields such as Social Security Numbers, bank account details, and salary information '
        'are automatically masked based on role permissions. Masked data appears as partial '
        'values (e.g., XXX-XX-1234 for SSN). Only users with explicit "Unmask" permission '
        'can view the full data by clicking the reveal icon next to the masked field.'
    ))

    story.append(h2('4.5 Encryption Status Monitoring'))
    story.append(step(1, 'Navigate to Security &gt; Encryption Status.'))
    story.append(step(2, 'The dashboard shows encryption coverage across data categories: At Rest, In Transit, and Database Backups.'))
    story.append(step(3, 'A green indicator means encryption is active; yellow indicates partial coverage; red signals an issue.'))
    story.append(step(4, 'Click on any category for detailed encryption algorithm and key rotation information.'))

    story.append(h2('4.6 Approval Workflow Management'))
    story.append(body(
        'Multi-level approval workflows can be configured for actions such as leave requests, '
        'expense claims, and policy changes. To configure an approval workflow (HR Admin only):'
    ))
    story.append(step(1, 'Navigate to Security &gt; Approval Workflows.'))
    story.append(step(2, 'Click "Create Workflow" or select an existing workflow to edit.'))
    story.append(step(3, 'Define the trigger event (e.g., "Leave Request Submitted").'))
    story.append(step(4, 'Add approval levels: Level 1 (e.g., Direct Manager), Level 2 (e.g., HR Admin).'))
    story.append(step(5, 'Set auto-escalation rules: if not acted upon within X hours, escalate to next level.'))
    story.append(step(6, 'Click "Save and Activate" to enable the workflow.'))

    # ==================================================================
    # 5. AI-DRIVEN TALENT ACQUISITION & ONBOARDING
    # ==================================================================
    story.append(section_break())
    story.append(CondPageBreak(H1_ORPHAN_THRESHOLD))
    story.append(h1('5. AI-Driven Talent Acquisition &amp; Onboarding'))

    story.append(h2('5.1 Creating Job Postings'))
    story.append(step(1, 'Navigate to Talent Acquisition &gt; Job Postings.'))
    story.append(step(2, 'Click "Create New Posting."'))
    story.append(step(3, 'Fill in the job details: Title, Department, Location, Employment Type, and Experience Required.'))
    story.append(step(4, 'Enter the Job Description in the rich text editor. Use the "AI Assist" button to auto-generate a JD based on similar roles in the system.'))
    story.append(step(5, 'Define required skills and competencies. The AI will use these for candidate matching.'))
    story.append(step(6, 'Set the salary range and application deadline.'))
    story.append(step(7, 'Click "Publish" to make the posting live on internal and external job boards.'))

    story.append(h2('5.2 Managing Candidate Pipeline (Kanban Board)'))
    story.append(step(1, 'Navigate to Talent Acquisition &gt; Candidate Pipeline.'))
    story.append(step(2, 'The Kanban board displays candidates organized by stage: Applied, Screened, Interview, Offer, and Hired.'))
    story.append(step(3, 'Drag and drop candidate cards between columns to move them through stages.'))
    story.append(step(4, 'Click on a candidate card to view their full profile, resume, and AI-generated assessment.'))
    story.append(step(5, 'Use the filter bar to sort by job posting, AI Fit Score range, or date applied.'))

    story.append(h2('5.3 AI Fit Score Interpretation'))
    story.append(body(
        'The AI Fit Score is a machine-learning-generated metric (0-100) that indicates how well '
        'a candidate matches the job requirements. The scoring breakdown is:'
    ))
    story.append(make_table(
        ['Score Range', 'Rating', 'Recommended Action'],
        [
            ['85 - 100', 'Excellent Fit', 'Fast-track to interview'],
            ['70 - 84', 'Strong Fit', 'Schedule interview promptly'],
            ['50 - 69', 'Moderate Fit', 'Review manually; consider for interview'],
            ['30 - 49', 'Weak Fit', 'May not meet requirements; review if needed'],
            ['0 - 29', 'Poor Fit', 'Auto-reject or archive candidate'],
        ],
        col_ratios=[0.18, 0.22, 0.60]
    ))
    story.append(Spacer(1, 18))
    story.append(note('The AI Fit Score considers skills match, experience relevance, education, and cultural fit indicators. It is a recommendation tool and should be used alongside human judgment.'))

    story.append(h2('5.4 Scheduling Interviews'))
    story.append(step(1, 'Open the candidate profile from the pipeline.'))
    story.append(step(2, 'Click "Schedule Interview."'))
    story.append(step(3, 'Select the interview type: Phone Screen, Technical, Behavioral, or Final Panel.'))
    story.append(step(4, 'Choose the interviewers from the team member list.'))
    story.append(step(5, 'Select the date and time. The system will check interviewer availability and suggest open slots.'))
    story.append(step(6, 'Add interview notes or a brief for the interviewers.'))
    story.append(step(7, 'Click "Send Invitation." Calendar invites are automatically sent to all participants.'))

    story.append(h2('5.5 Moving Candidates Through Stages'))
    story.append(body('Candidates can be moved through stages via:'))
    story.append(bullet('<b>Drag and Drop:</b> On the Kanban board, drag the candidate card to the next stage column.'))
    story.append(bullet('<b>Candidate Profile:</b> Open the candidate profile, click "Advance Stage," and select the target stage.'))
    story.append(bullet('<b>Bulk Action:</b> Select multiple candidates using checkboxes, then click "Bulk Advance" and choose the stage.'))
    story.append(body(
        'Each stage transition is logged with a timestamp and the user who performed the action. '
        'Rejection actions require a mandatory reason to be entered.'
    ))

    story.append(h2('5.6 Onboarding Checklist Management'))
    story.append(step(1, 'When a candidate is moved to "Hired," the system auto-generates an onboarding checklist.'))
    story.append(step(2, 'Navigate to Talent Acquisition &gt; Onboarding to view all active onboarding tasks.'))
    story.append(step(3, 'The checklist includes items such as: Document verification, IT account setup, Asset assignment, Policy acknowledgment, and Team introduction.'))
    story.append(step(4, 'HR Admins can add or remove checklist items by clicking "Edit Checklist Template."'))
    story.append(step(5, 'Assign each checklist item to a responsible person with a due date.'))
    story.append(step(6, 'Track completion status in real-time. Items turn green when completed.'))

    story.append(h2('5.7 AI-Powered Candidate Matching'))
    story.append(body(
        'When a new job posting is published, the AI engine automatically scans existing candidate '
        'profiles in the talent pool and identifies potential matches. To review AI-suggested candidates:'
    ))
    story.append(step(1, 'Open the job posting and click the "AI Matches" tab.'))
    story.append(step(2, 'Review the list of suggested candidates ranked by Fit Score.'))
    story.append(step(3, 'Click "Invite to Apply" to send an application invitation to any suggested candidate.'))
    story.append(step(4, 'The AI also sends passive candidate alerts when profiles matching your open roles are added to the system.'))

    # ==================================================================
    # 6. TIME & ATTENDANCE MANAGEMENT
    # ==================================================================
    story.append(section_break())
    story.append(CondPageBreak(H1_ORPHAN_THRESHOLD))
    story.append(h1('6. Time &amp; Attendance Management'))

    story.append(h2('6.1 Checking Attendance Records'))
    story.append(step(1, 'Navigate to Time &amp; Attendance &gt; My Attendance.'))
    story.append(step(2, 'The calendar view shows your attendance for the current month: present (green), absent (red), leave (yellow), and holiday (blue).'))
    story.append(step(3, 'Switch to the "List View" tab for a tabular breakdown by date.'))
    story.append(step(4, 'Use the date picker to view attendance for previous months.'))
    story.append(step(5, 'Managers can view team attendance under Time &amp; Attendance &gt; Team Attendance.'))

    story.append(h2('6.2 Marking Attendance (Check-In / Check-Out)'))
    story.append(step(1, 'On the dashboard, click the "Check In" button (or navigate to Time &amp; Attendance &gt; Mark Attendance).'))
    story.append(step(2, 'If geofencing is enabled, ensure you are within the designated office geofence. The system will verify your location automatically.'))
    story.append(step(3, 'If biometric integration is active, the system syncs check-in data from the biometric device.'))
    story.append(step(4, 'At the end of the day, click "Check Out." The system calculates total working hours.'))
    story.append(note('If you forget to check out, you can submit a regularisation request the next day via Time &amp; Attendance &gt; Regularisation.'))

    story.append(h2('6.3 Applying for Leave'))
    story.append(step(1, 'Navigate to Time &amp; Attendance &gt; Apply Leave.'))
    story.append(step(2, 'Select the Leave Type from the dropdown: Casual Leave, Sick Leave, Earned Leave, or Compensatory Off.'))
    story.append(step(3, 'Select the Start Date and End Date. For half-day leave, check the "Half Day" option.'))
    story.append(step(4, 'Enter the Reason for the leave.'))
    story.append(step(5, 'If attaching a medical certificate (required for Sick Leave &gt; 2 days), click "Attach Document" and upload the file.'))
    story.append(step(6, 'Click "Submit." The leave request is sent to your reporting manager for approval.'))
    story.append(step(7, 'You will receive an email and in-app notification upon approval or rejection.'))

    story.append(h2('6.4 Leave Approval Process (For Managers)'))
    story.append(step(1, 'Navigate to Time &amp; Attendance &gt; Leave Approvals.'))
    story.append(step(2, 'Review the list of pending leave requests from your team.'))
    story.append(step(3, 'Click on a request to view details: leave type, dates, reason, and team leave calendar.'))
    story.append(step(4, 'Click "Approve" or "Reject." If rejecting, enter a mandatory reason.'))
    story.append(step(5, 'The employee is notified immediately of the decision.'))

    story.append(h2('6.5 Viewing Leave Balance'))
    story.append(step(1, 'Navigate to Time &amp; Attendance &gt; Leave Balance.'))
    story.append(step(2, 'The leave balance dashboard shows: Total allotted, Used, Pending, and Available days for each leave type.'))
    story.append(step(3, 'The balance updates in real-time when leave is approved or rejected.'))
    story.append(note('Leave carry-forward rules are configured by HR Admin. Any unused leave at year-end is handled per company policy.'))

    story.append(h2('6.6 Shift Management'))
    story.append(body('Shift management is available to HR Admins and Department Managers:'))
    story.append(step(1, 'Navigate to Time &amp; Attendance &gt; Shift Management.'))
    story.append(step(2, 'Click "Create Shift" to define a new shift: Name, Start Time, End Time, Grace Period, and Break Duration.'))
    story.append(step(3, 'Assign employees to shifts individually or in bulk.'))
    story.append(step(4, 'Use "Shift Rotation" to set up rotating shift schedules with automatic reassignment.'))
    story.append(step(5, 'The shift calendar provides a visual overview of all assigned shifts for the month.'))

    story.append(h2('6.7 Geofencing and Biometric Integration'))
    story.append(body(
        'AI-HRMS supports geofencing and biometric integration for attendance verification. '
        'When geofencing is enabled, employees must be within the defined geographic perimeter '
        'to check in. Biometric devices (fingerprint, facial recognition) sync attendance data '
        'in real-time with the system. These settings are configured by HR Admins under '
        'Time &amp; Attendance &gt; Attendance Settings.'
    ))

    story.append(h2('6.8 Holiday Calendar'))
    story.append(step(1, 'Navigate to Time &amp; Attendance &gt; Holiday Calendar.'))
    story.append(step(2, 'The calendar displays company-declared holidays for the current year.'))
    story.append(step(3, 'HR Admins can add, edit, or remove holidays by clicking the date and entering the holiday details.'))
    story.append(step(4, 'Holidays are automatically factored into leave calculations and payroll processing.'))

    # ==================================================================
    # 7. PAYROLL & EXPENSE MANAGEMENT
    # ==================================================================
    story.append(section_break())
    story.append(CondPageBreak(H1_ORPHAN_THRESHOLD))
    story.append(h1('7. Payroll &amp; Expense Management'))

    story.append(h2('7.1 Viewing Salary Slips'))
    story.append(step(1, 'Navigate to Payroll &gt; My Salary Slips.'))
    story.append(step(2, 'Select the month/year from the dropdown.'))
    story.append(step(3, 'Click "View Slip" to see the detailed salary breakdown.'))
    story.append(step(4, 'Click "Download PDF" to save a copy of the salary slip.'))

    story.append(h2('7.2 Understanding Salary Breakdown'))
    story.append(body('The salary slip in AI-HRMS provides a comprehensive breakdown:'))
    story.append(make_table(
        ['Component', 'Category', 'Description'],
        [
            ['Basic Salary', 'Earnings', 'Fixed base pay (typically 40-50% of CTC)'],
            ['House Rent Allowance (HRA)', 'Earnings', 'Tax-optimized housing component'],
            ['Dearness Allowance (DA)', 'Earnings', 'Cost of living adjustment'],
            ['Special Allowance', 'Earnings', 'Balancing component in CTC structure'],
            ['Provident Fund (PF)', 'Deductions', 'Employee contribution (12% of basic)'],
            ['Professional Tax', 'Deductions', 'State-mandated tax'],
            ['TDS', 'Deductions', 'Tax Deducted at Source per income slab'],
            ['ESI', 'Deductions', 'Employee State Insurance (if applicable)'],
        ],
        col_ratios=[0.30, 0.18, 0.52]
    ))
    story.append(Spacer(1, 18))

    story.append(h2('7.3 Processing Payroll (For HR / Payroll Admin)'))
    story.append(step(1, 'Navigate to Payroll &gt; Run Payroll.'))
    story.append(step(2, 'Select the payroll period (month and year).'))
    story.append(step(3, 'Review the employee list and verify attendance and leave data are synced.'))
    story.append(step(4, 'The system calculates gross pay, deductions, and net pay automatically.'))
    story.append(step(5, 'Review any flagged items (e.g., new joiners, exit settlements, arrears).'))
    story.append(step(6, 'Click "Process Payroll." The system generates salary slips and bank payment files.'))
    story.append(step(7, 'Click "Confirm and Disburse" to finalize. Salary slips become visible to employees.'))
    story.append(note('Payroll can be run in "Draft" mode first for review before final disbursement. Once confirmed, changes require a supplementary payroll run.'))

    story.append(h2('7.4 Submitting Expense Claims'))
    story.append(step(1, 'Navigate to Payroll &gt; Submit Expense.'))
    story.append(step(2, 'Click "New Claim."'))
    story.append(step(3, 'Select the Expense Category: Travel, Meals, Equipment, Training, or Other.'))
    story.append(step(4, 'Enter the amount and date of expense.'))
    story.append(step(5, 'Upload the receipt or supporting document (PDF, JPEG; max 5 MB).'))
    story.append(step(6, 'Add a description or notes.'))
    story.append(step(7, 'Click "Submit for Approval." The claim is routed to your manager.'))

    story.append(h2('7.5 Expense Approval Workflow'))
    story.append(step(1, 'Managers receive a notification for pending expense claims.'))
    story.append(step(2, 'Navigate to Payroll &gt; Expense Approvals.'))
    story.append(step(3, 'Review the claim details and attached receipts.'))
    story.append(step(4, 'Click "Approve," "Reject" (with mandatory reason), or "Request More Info."'))
    story.append(step(5, 'Approved claims are forwarded to Finance for reimbursement processing.'))
    story.append(step(6, 'Finance marks the claim as "Disbursed" after payment is made.'))

    story.append(h2('7.6 Tax Declaration'))
    story.append(step(1, 'Navigate to Payroll &gt; Tax Declaration.'))
    story.append(step(2, 'Select the financial year.'))
    story.append(step(3, 'Enter your investment declarations under relevant sections (e.g., Section 80C, 80D, HRA exemption).'))
    story.append(step(4, 'Upload supporting documents for each declaration.'))
    story.append(step(5, 'Click "Submit." The system recalculates your projected TDS based on declared investments.'))

    story.append(h2('7.7 Payroll Reports'))
    story.append(body('Available payroll reports include:'))
    story.append(bullet('<b>Monthly Payroll Summary:</b> Total payout, department-wise breakdown, and statutory deductions.'))
    story.append(bullet('<b>Salary Register:</b> Detailed employee-wise salary data for the selected period.'))
    story.append(bullet('<b>Statutory Compliance Report:</b> PF, ESI, and TDS compliance data for filing.'))
    story.append(bullet('<b>Bank Payment File:</b> Formatted file for bulk salary disbursement through the bank.'))

    # ==================================================================
    # 8. PERFORMANCE & TALENT DEVELOPMENT
    # ==================================================================
    story.append(section_break())
    story.append(CondPageBreak(H1_ORPHAN_THRESHOLD))
    story.append(h1('8. Performance &amp; Talent Development'))

    story.append(h2('8.1 Setting OKRs (Objectives &amp; Key Results)'))
    story.append(step(1, 'Navigate to Performance &gt; My OKRs.'))
    story.append(step(2, 'Click "Create Objective."'))
    story.append(step(3, 'Enter the Objective title and description.'))
    story.append(step(4, 'Add 2-5 Key Results with measurable targets (e.g., "Increase customer satisfaction score from 75% to 85%").'))
    story.append(step(5, 'Set the alignment (link to a parent objective if cascading from team/department OKRs).'))
    story.append(step(6, 'Set the timeline (quarterly or annual).'))
    story.append(step(7, 'Click "Submit for Approval." Your manager reviews and approves the OKRs.'))

    story.append(h2('8.2 Self-Review Submission'))
    story.append(step(1, 'Navigate to Performance &gt; My Reviews.'))
    story.append(step(2, 'Click "Start Self-Review" for the current review cycle.'))
    story.append(step(3, 'Rate yourself on each competency and OKR (1-5 scale).'))
    story.append(step(4, 'Write qualitative comments for each rating.'))
    story.append(step(5, 'Review AI-generated reflection questions and answer any that apply.'))
    story.append(step(6, 'Click "Submit Self-Review." The review is forwarded to your manager.'))

    story.append(h2('8.3 Peer Feedback'))
    story.append(step(1, 'During an active review cycle, navigate to Performance &gt; Peer Feedback.'))
    story.append(step(2, 'The system may suggest peers based on project collaboration. You can also add peers manually.'))
    story.append(step(3, 'Click "Provide Feedback" next to a peer name.'))
    story.append(step(4, 'Rate the peer on shared competencies and provide written feedback.'))
    story.append(step(5, 'Click "Submit." Feedback is anonymous and aggregated in the review report.'))

    story.append(h2('8.4 Manager Review Process'))
    story.append(step(1, 'Navigate to Performance &gt; Team Reviews.'))
    story.append(step(2, 'Select an employee from your team to review.'))
    story.append(step(3, 'Review the employee self-assessment, peer feedback (aggregated), and OKR progress.'))
    story.append(step(4, 'Provide your rating (1-5) for each competency and overall performance.'))
    story.append(step(5, 'Write development recommendations and career growth suggestions.'))
    story.append(step(6, 'Click "Submit Review." The employee can view the review and acknowledge it.'))

    story.append(h2('8.5 AI-Generated Review Questions'))
    story.append(body(
        'During the review process, the AI engine analyzes the employee role, past reviews, '
        'and project history to generate contextual review questions. These questions appear in '
        'the self-review and manager review forms as "AI-Suggested Questions." Reviewers can '
        'choose to answer or dismiss these questions. The AI adapts its suggestions based on '
        'the employee role and performance trends.'
    ))

    story.append(h2('8.6 Attrition Risk Monitoring'))
    story.append(body(
        'The AI-powered attrition risk module analyzes multiple signals to predict flight risk '
        'for each employee. Signals include: attendance patterns, engagement scores, compensation '
        'benchmark gaps, time since last promotion, and survey sentiment. To monitor attrition risk:'
    ))
    story.append(step(1, 'Navigate to Performance &gt; Attrition Risk Dashboard.'))
    story.append(step(2, 'Employees are categorized as: Low Risk (green), Medium Risk (yellow), High Risk (red).'))
    story.append(step(3, 'Click on any employee to view the risk breakdown and contributing factors.'))
    story.append(step(4, 'Use the "Retention Action" button to create a plan for high-risk employees.'))

    story.append(h2('8.7 Retention Action Plans'))
    story.append(step(1, 'From the Attrition Risk Dashboard, click "Create Retention Action" for a high-risk employee.'))
    story.append(step(2, 'Select from suggested actions: Compensation Review, Role Change, Mentorship Program, or Flexible Work Arrangement.'))
    story.append(step(3, 'Assign an action owner and set a follow-up date.'))
    story.append(step(4, 'Click "Save." The action is tracked until completion and the employee risk score is re-evaluated periodically.'))

    story.append(h2('8.8 Performance Rating Scale'))
    story.append(body('AI-HRMS uses a 1-5 rating scale for performance evaluations:'))
    story.append(make_table(
        ['Rating', 'Label', 'Description'],
        [
            ['1', 'Needs Improvement', 'Performance significantly below expectations'],
            ['2', 'Below Expectations', 'Performance does not consistently meet expectations'],
            ['3', 'Meets Expectations', 'Performance consistently meets role requirements'],
            ['4', 'Exceeds Expectations', 'Performance regularly surpasses expectations'],
            ['5', 'Outstanding', 'Exceptional performance with significant impact'],
        ],
        col_ratios=[0.10, 0.25, 0.65]
    ))
    story.append(Spacer(1, 18))

    # ==================================================================
    # 9. LEARNING & DEVELOPMENT
    # ==================================================================
    story.append(section_break())
    story.append(CondPageBreak(H1_ORPHAN_THRESHOLD))
    story.append(h1('9. Learning &amp; Development'))

    story.append(h2('9.1 Browsing Course Catalog'))
    story.append(step(1, 'Navigate to Learning &amp; Development &gt; Course Catalog.'))
    story.append(step(2, 'Browse courses by category: Technical Skills, Leadership, Compliance, Soft Skills, or Domain-Specific.'))
    story.append(step(3, 'Use the search bar to find courses by keyword.'))
    story.append(step(4, 'Filter by format (Self-Paced, Instructor-Led, Blended), duration, and skill level.'))
    story.append(step(5, 'Click on a course card to view details: description, objectives, duration, and prerequisites.'))

    story.append(h2('9.2 Enrolling in Courses'))
    story.append(step(1, 'From the course detail page, click "Enroll."'))
    story.append(step(2, 'For instructor-led courses, select a batch/schedule from available options.'))
    story.append(step(3, 'If manager approval is required, the enrollment request is sent to your manager.'))
    story.append(step(4, 'Once approved, the course appears in your "My Learning" dashboard.'))

    story.append(h2('9.3 AI-Recommended Learning Paths'))
    story.append(body(
        'The AI engine analyzes your role, skill gaps, career aspirations, and performance reviews '
        'to recommend personalized learning paths. To access recommendations:'
    ))
    story.append(step(1, 'Navigate to Learning &amp; Development &gt; My Recommendations.'))
    story.append(step(2, 'The AI displays a ranked list of courses and learning paths tailored to your profile.'))
    story.append(step(3, 'Each recommendation includes a reason: "Bridges skill gap in X," "Required for Y certification," or "Popular among peers in your role."'))
    story.append(step(4, 'Click "Start Learning Path" to enroll in all courses within a recommended path, or enroll in individual courses.'))

    story.append(h2('9.4 Tracking Course Progress'))
    story.append(step(1, 'Navigate to Learning &amp; Development &gt; My Learning.'))
    story.append(step(2, 'Active courses show progress as a percentage bar.'))
    story.append(step(3, 'Click on a course to resume where you left off.'))
    story.append(step(4, 'Completed courses show the completion date and score (if applicable).'))
    story.append(step(5, 'Managers can view team learning progress under Learning &amp; Development &gt; Team Progress.'))

    story.append(h2('9.5 Skill Inventory and Gap Analysis'))
    story.append(step(1, 'Navigate to Learning &amp; Development &gt; Skill Inventory.'))
    story.append(step(2, 'The skill inventory lists all skills defined for your role along with your current proficiency level.'))
    story.append(step(3, 'Skills are rated: Beginner, Intermediate, Advanced, or Expert.'))
    story.append(step(4, 'The Gap Analysis column highlights skills where your proficiency is below the expected level for your role.'))
    story.append(step(5, 'Click "Recommend Courses" next to a gap skill to see AI-suggested courses.'))

    story.append(h2('9.6 Certification Tracking'))
    story.append(step(1, 'Navigate to Learning &amp; Development &gt; Certifications.'))
    story.append(step(2, 'View your active certifications, expiration dates, and renewal requirements.'))
    story.append(step(3, 'Click "Add External Certification" to record a certification earned outside the system.'))
    story.append(step(4, 'Upload the certificate file and enter the valid-from and valid-to dates.'))
    story.append(step(5, 'The system sends reminders 60, 30, and 7 days before a certification expires.'))

    story.append(h2('9.7 Skill Gap Radar Chart Interpretation'))
    story.append(body(
        'The Skill Gap Radar Chart visually compares your current skill proficiency against '
        'the expected proficiency for your role. Each axis represents a skill area. The inner '
        'polygon (your current level) is compared against the outer polygon (expected level). '
        'Larger gaps between the two polygons indicate areas needing development. The chart is '
        'color-coded: green for skills meeting or exceeding expectations, yellow for moderate gaps, '
        'and red for significant gaps. Use this chart to prioritize your learning efforts.'
    ))

    # ==================================================================
    # 10. ANALYTICS & REPORTING
    # ==================================================================
    story.append(section_break())
    story.append(CondPageBreak(H1_ORPHAN_THRESHOLD))
    story.append(h1('10. Analytics &amp; Reporting'))

    story.append(h2('10.1 Dashboard Analytics Overview'))
    story.append(step(1, 'Navigate to Analytics &gt; Dashboard.'))
    story.append(step(2, 'The analytics dashboard provides interactive visualizations across key HR metrics.'))
    story.append(step(3, 'Use the time range selector to view data for the current month, quarter, or year.'))
    story.append(step(4, 'Filter by department, location, or employee category using the filter panel.'))
    story.append(step(5, 'Hover over any chart element for detailed tooltips with numbers and percentages.'))

    story.append(h2('10.2 AI-Powered Forecasts'))
    story.append(body(
        'The AI analytics engine generates predictive forecasts based on historical data. Available forecasts include:'
    ))
    story.append(bullet('<b>Headcount Forecast:</b> Projected workforce size for the next 6-12 months based on hiring plans, expected attrition, and budget.'))
    story.append(bullet('<b>Cost Forecast:</b> Projected labor costs including salary increases, new hires, and benefit changes.'))
    story.append(bullet('<b>Attrition Forecast:</b> Predicted employee departures with confidence intervals.'))
    story.append(note('AI forecasts are updated weekly. The confidence level is displayed alongside each prediction. Forecasts become more accurate as more historical data is available in the system.'))

    story.append(h2('10.3 Attrition Prediction Reports'))
    story.append(step(1, 'Navigate to Analytics &gt; Attrition Prediction.'))
    story.append(step(2, 'The report displays department-wise attrition rates (actual vs. predicted).'))
    story.append(step(3, 'The "At-Risk Employees" tab lists individuals with high attrition probability.'))
    story.append(step(4, 'Click "Generate Report" to create a detailed PDF with contributing factors and recommendations.'))
    story.append(step(5, 'Schedule the report for automatic generation (weekly or monthly) by clicking "Schedule Report."'))

    story.append(h2('10.4 Salary Benchmarking'))
    story.append(step(1, 'Navigate to Analytics &gt; Salary Benchmarking.'))
    story.append(step(2, 'Select the benchmark source: Industry average, Regional market data, or Custom benchmark data.'))
    story.append(step(3, 'The system compares your organization salary data against the selected benchmark.'))
    story.append(step(4, 'Results show: percentile position, median comparison, and employees below market rate.'))
    story.append(step(5, 'Use the data to make compensation adjustment recommendations.'))

    story.append(h2('10.5 Custom Report Builder'))
    story.append(step(1, 'Navigate to Analytics &gt; Custom Reports.'))
    story.append(step(2, 'Click "Create New Report."'))
    story.append(step(3, 'Select the data source module (e.g., Core HR, Payroll, Performance).'))
    story.append(step(4, 'Choose the fields to include by dragging them from the available fields list.'))
    story.append(step(5, 'Apply filters and groupings as needed.'))
    story.append(step(6, 'Select the visualization type: Table, Bar Chart, Line Chart, or Pie Chart.'))
    story.append(step(7, 'Click "Generate Report" to preview.'))
    story.append(step(8, 'Save the report template for future use by clicking "Save Template."'))

    story.append(h2('10.6 Exporting Reports'))
    story.append(body('Any report in the Analytics module can be exported in the following formats:'))
    story.append(bullet('<b>PDF:</b> Formatted report with charts and tables, suitable for presentations.'))
    story.append(bullet('<b>Excel (XLSX):</b> Raw data with formatting, suitable for further analysis.'))
    story.append(bullet('<b>CSV:</b> Plain-text data export for integration with other tools.'))
    story.append(body('To export, click the "Export" button on any report page and select the desired format.'))

    story.append(h2('10.7 Department-Wise Analytics'))
    story.append(step(1, 'Navigate to Analytics &gt; Department Analytics.'))
    story.append(step(2, 'Select a department from the dropdown to view its analytics snapshot.'))
    story.append(step(3, 'Metrics include: Headcount, Attrition Rate, Average Tenure, Open Positions, Training Hours, and Average Performance Rating.'))
    story.append(step(4, 'Compare multiple departments side-by-side using the comparison view.'))

    # ==================================================================
    # 11. EMPLOYEE SELF-SERVICE & COLLABORATION
    # ==================================================================
    story.append(section_break())
    story.append(CondPageBreak(H1_ORPHAN_THRESHOLD))
    story.append(h1('11. Employee Self-Service &amp; Collaboration'))

    story.append(h2('11.1 Quick Actions'))
    story.append(body(
        'The Quick Actions menu on the dashboard provides one-click access to frequently used tasks:'
    ))
    story.append(bullet('Apply Leave'))
    story.append(bullet('Submit Expense'))
    story.append(bullet('View Payslip'))
    story.append(bullet('Update Profile'))
    story.append(bullet('Browse Courses'))
    story.append(bullet('Raise Ticket'))
    story.append(body('Click any quick action tile to be taken directly to the relevant form or page.'))

    story.append(h2('11.2 Profile Management'))
    story.append(step(1, 'Click your avatar in the top-right header, then select "My Profile."'))
    story.append(step(2, 'View and edit your personal information: contact details, address, emergency contacts.'))
    story.append(step(3, 'Update your profile photo by clicking the camera icon on your avatar.'))
    story.append(step(4, 'Change your password under the "Security" tab.'))
    story.append(step(5, 'Configure your notification preferences (email, in-app, or both) under the "Notifications" tab.'))
    story.append(note('Certain fields such as designation, department, and reporting manager are managed by HR and cannot be edited by the employee.'))

    story.append(h2('11.3 Viewing Payslips'))
    story.append(step(1, 'Navigate to Self-Service &gt; My Payslips.'))
    story.append(step(2, 'Select the desired month from the list.'))
    story.append(step(3, 'Click "View" to see the salary breakdown online.'))
    story.append(step(4, 'Click "Download PDF" to save the payslip locally.'))
    story.append(note('Payslips are available from your joining date. Payslips older than 24 months can be accessed through the archive section.'))

    story.append(h2('11.4 Accessing Company Policies'))
    story.append(step(1, 'Navigate to Self-Service &gt; Company Policies.'))
    story.append(step(2, 'Browse policies by category: HR Policies, IT Policies, Leave Policies, Code of Conduct, or Data Security.'))
    story.append(step(3, 'Click on a policy document to view it.'))
    story.append(step(4, 'Some policies require acknowledgment. Click "I Acknowledge" after reading.'))

    story.append(h2('11.5 AI HR Chatbot Usage'))
    story.append(step(1, 'Click the chat bubble icon in the bottom-right corner of any page to open the AI HR Chatbot.'))
    story.append(step(2, 'Type your question in natural language (e.g., "How many casual leaves do I have left?" or "What is the leave policy for new employees?").'))
    story.append(step(3, 'The chatbot responds instantly with relevant information drawn from HR policies and your personal data.'))
    story.append(step(4, 'For complex queries, the chatbot can create a support ticket or route your question to the appropriate HR team member.'))
    story.append(step(5, 'Chat history is saved and accessible from the chatbot window.'))
    story.append(note('The AI HR Chatbot is available 24/7 and handles common queries about leave, policies, payslips, and benefits. For sensitive matters, it will direct you to an HR representative.'))

    story.append(h2('11.6 Document Requests'))
    story.append(step(1, 'Navigate to Self-Service &gt; Document Requests.'))
    story.append(step(2, 'Click "Request Document" and select the document type: Employment Certificate, Salary Certificate, Experience Letter, or Address Proof.'))
    story.append(step(3, 'Enter any specific details required (e.g., purpose, address for mailing).'))
    story.append(step(4, 'Click "Submit Request." The request is routed to HR for processing.'))
    story.append(step(5, 'Once approved, you will be notified and can download the document from the same page.'))

    # ==================================================================
    # 12. ROLE-BASED PROCEDURES
    # ==================================================================
    story.append(section_break())
    story.append(CondPageBreak(H1_ORPHAN_THRESHOLD))
    story.append(h1('12. Role-Based Procedures'))

    story.append(body(
        'This section consolidates key procedures by role for quick reference. Each role has '
        'specific system permissions and workflows as defined by the RBAC system.'
    ))

    story.append(h2('12.1 Super Admin Procedures'))
    story.append(bullet('Manage system configuration and global settings'))
    story.append(bullet('Create, modify, and deactivate user accounts across all roles'))
    story.append(bullet('Define and modify the RBAC permission matrix'))
    story.append(bullet('Monitor system-wide audit trails and security dashboards'))
    story.append(bullet('Configure approval workflows for all modules'))
    story.append(bullet('Manage integrations with third-party systems (biometric, payroll bank feeds)'))
    story.append(bullet('Override any approval or workflow in exceptional circumstances'))
    story.append(bullet('Access all data without masking restrictions'))

    story.append(h2('12.2 HR Admin Procedures'))
    story.append(bullet('Add, edit, and manage employee records and lifecycle transitions'))
    story.append(bullet('Configure leave policies, holiday calendars, and shift schedules'))
    story.append(bullet('Process monthly payroll and generate statutory compliance reports'))
    story.append(bullet('Manage job postings and oversee the recruitment pipeline'))
    story.append(bullet('Configure and monitor performance review cycles'))
    story.append(bullet('Set up L&amp;D courses, learning paths, and skill frameworks'))
    story.append(bullet('Process document requests and generate employment certificates'))
    story.append(bullet('View and export all HR analytics and reports'))

    story.append(h2('12.3 Department Manager Procedures'))
    story.append(bullet('View and manage team attendance and leave approvals'))
    story.append(bullet('Conduct performance reviews for team members'))
    story.append(bullet('Set team OKRs and cascade department objectives'))
    story.append(bullet('Approve expense claims and travel requests'))
    story.append(bullet('Monitor team attrition risk and create retention actions'))
    story.append(bullet('Review team learning progress and assign mandatory courses'))
    story.append(bullet('Participate in interview panels for hiring within the department'))

    story.append(h2('12.4 Employee Procedures'))
    story.append(bullet('Mark attendance (check-in / check-out) daily'))
    story.append(bullet('Apply for leave and view leave balance'))
    story.append(bullet('Submit expense claims with receipts'))
    story.append(bullet('Complete self-reviews and provide peer feedback during review cycles'))
    story.append(bullet('Set and track personal OKRs'))
    story.append(bullet('Browse and enroll in L&amp;D courses'))
    story.append(bullet('View payslips and submit tax declarations'))
    story.append(bullet('Use the AI HR Chatbot for quick queries'))

    story.append(h2('12.5 Recruiter Procedures'))
    story.append(bullet('Create and publish job postings'))
    story.append(bullet('Manage the candidate pipeline on the Kanban board'))
    story.append(bullet('Review AI Fit Scores and shortlist candidates'))
    story.append(bullet('Schedule and coordinate interviews'))
    story.append(bullet('Collect interview feedback and advance candidates through stages'))
    story.append(bullet('Manage the talent pool and re-engage past candidates'))
    story.append(bullet('Generate recruitment analytics reports'))

    story.append(h2('12.6 L&amp;D Manager Procedures'))
    story.append(bullet('Create and manage course content in the LMS'))
    story.append(bullet('Design learning paths aligned with organizational skill requirements'))
    story.append(bullet('Define the skill framework and proficiency levels for each role'))
    story.append(bullet('Monitor organization-wide skill gap analysis'))
    story.append(bullet('Track certification compliance and expiration'))
    story.append(bullet('Review AI-recommended learning paths and adjust as needed'))
    story.append(bullet('Generate L&amp;D analytics and training effectiveness reports'))

    story.append(h2('12.7 Payroll Specialist Procedures'))
    story.append(bullet('Process monthly payroll runs and verify calculations'))
    story.append(bullet('Manage salary structures, components, and revisions'))
    story.append(bullet('Configure tax slabs and statutory deduction rates'))
    story.append(bullet('Generate bank payment files for salary disbursement'))
    story.append(bullet('Produce statutory compliance reports (PF, ESI, TDS, Professional Tax)'))
    story.append(bullet('Process final settlements for exiting employees'))
    story.append(bullet('Reconcile payroll data with finance and audit'))

    # ==================================================================
    # 13. FAQ & TROUBLESHOOTING
    # ==================================================================
    story.append(section_break())
    story.append(CondPageBreak(H1_ORPHAN_THRESHOLD))
    story.append(h1('13. FAQ &amp; Troubleshooting'))

    story.append(h2('13.1 Common Issues and Solutions'))
    story.append(Spacer(1, 8))

    # FAQ Table
    faqs = [
        ['I cannot log in to the system.',
         '1) Verify your email and password are correct. 2) Clear browser cache and cookies. 3) If your account is locked, wait 30 minutes and try again. 4) Use the "Forgot Password" link to reset. 5) Contact IT support if the issue persists.'],
        ['I forgot to check in/out. What do I do?',
         'Navigate to Time &amp; Attendance &gt; Regularisation. Submit a regularisation request with the correct check-in/out times. Your manager must approve the request.'],
        ['My leave balance seems incorrect.',
         'Leave balances update in real-time after approvals. Check the "Leave History" tab for deductions. If the balance still seems wrong, raise a ticket with HR.'],
        ['I cannot view a colleague\'s profile.',
         'Profile visibility depends on your role and the data masking policy. Employees can only view limited information of other employees. HR Admins have broader access.'],
        ['My salary slip shows incorrect deductions.',
         'First verify your tax declaration and investment proofs are up to date. If the issue persists, raise a ticket with the Payroll team. They can run a correction in the next payroll cycle.'],
        ['The AI Fit Score seems inaccurate for a candidate.',
         'AI Fit Scores are based on skills, experience, and job requirements defined in the posting. Review the job requirements and candidate profile for alignment. You can override the AI recommendation with manual judgment.'],
        ['I cannot enroll in a course.',
         'Some courses require manager approval. Check if your enrollment is pending approval. Other courses may have prerequisites. Verify you meet all requirements before enrolling.'],
        ['The AI HR Chatbot is not responding.',
         'Refresh the page and try again. If the chatbot is unavailable, submit a support ticket through Self-Service &gt; Raise Ticket.'],
        ['How do I change my reporting manager?',
         'Reporting manager changes must be requested through HR. Navigate to Self-Service &gt; Raise Ticket, select "Organizational Change" as the category, and provide the details.'],
        ['A page is loading very slowly.',
         '1) Check your internet connection speed. 2) Clear browser cache. 3) Try a different browser. 4) If the issue persists, contact IT support with the page URL and screenshot.'],
    ]

    faq_data = [[Paragraph('<b>Issue</b>', sTableHeader), Paragraph('<b>Solution</b>', sTableHeader)]]
    for q, a in faqs:
        faq_data.append([Paragraph(q, sTableCell), Paragraph(a, sTableCell)])

    faq_table = Table(faq_data, colWidths=[0.30 * CONTENT_W, 0.70 * CONTENT_W], hAlign='CENTER')
    faq_style = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]
    for i in range(1, len(faq_data)):
        bg = TABLE_ROW_EVEN if i % 2 == 1 else TABLE_ROW_ODD
        faq_style.append(('BACKGROUND', (0, i), (-1, i), bg))
    faq_table.setStyle(TableStyle(faq_style))
    story.append(faq_table)
    story.append(Spacer(1, 18))

    story.append(h2('13.2 Contact Support'))
    story.append(body(
        'If you encounter an issue not covered in this SOP or the FAQ above, please contact '
        'the AI-HRMS support team through any of the following channels:'
    ))
    story.append(make_table(
        ['Channel', 'Details', 'Response Time'],
        [
            ['In-App Ticket', 'Self-Service &gt; Raise Ticket', '4 business hours'],
            ['AI HR Chatbot', 'Click chat bubble (bottom-right)', 'Instant for common queries'],
            ['Email Support', 'hrms-support@yourcompany.com', '8 business hours'],
            ['Phone Support', '+1-800-HRMS-HELP (ext. 2)', '2 business hours (critical issues)'],
        ],
        col_ratios=[0.20, 0.45, 0.35]
    ))
    story.append(Spacer(1, 18))
    story.append(body(
        'When contacting support, please provide: your employee ID, the module/page where the '
        'issue occurred, a description of the problem, and any error messages or screenshots. '
        'Critical issues affecting payroll or data security are prioritized.'
    ))

    # ── Build ───────────────────────────────────────────────────────────
    doc.multiBuild(story)
    print(f"Body PDF generated: {BODY_PDF}")


# =====================================================================
# COVER RENDERING (Playwright via html2poster.js)
# =====================================================================
def render_cover():
    html_path = create_cover_html()
    scripts_dir = os.path.join(PDF_SKILL_DIR, 'scripts')
    subprocess.run([
        'node', os.path.join(scripts_dir, 'html2poster.js'),
        html_path, '--output', COVER_PDF,
        '--width', '794px',
    ], check=True)
    print(f"Cover PDF generated: {COVER_PDF}")


# =====================================================================
# MERGE COVER + BODY
# =====================================================================
def merge_pdfs():
    from pypdf import PdfReader, PdfWriter, Transformation

    A4_W, A4_H = 595.28, 841.89

    def normalize_page(page):
        box = page.mediabox
        w, h = float(box.width), float(box.height)
        if abs(w - A4_W) > 2 or abs(h - A4_H) > 2:
            sx, sy = A4_W / w, A4_H / h
            page.add_transformation(Transformation().scale(sx=sx, sy=sy))
            page.mediabox.lower_left = (0, 0)
            page.mediabox.upper_right = (A4_W, A4_H)
        return page

    writer = PdfWriter()
    # Cover as page 1
    cover_page = PdfReader(COVER_PDF).pages[0]
    writer.add_page(normalize_page(cover_page))
    # Body pages
    for page in PdfReader(BODY_PDF).pages:
        writer.add_page(normalize_page(page))

    writer.add_metadata({
        '/Title': 'AI-HRMS User Standard Operating Procedures',
        '/Author': 'Z.ai',
        '/Creator': 'Z.ai',
        '/Subject': 'User SOP for AI-HRMS Application - Version 1.0, May 2026',
    })

    with open(FINAL_PDF, 'wb') as f:
        writer.write(f)

    print(f"Final PDF generated: {FINAL_PDF}")


# =====================================================================
# MAIN
# =====================================================================
if __name__ == '__main__':
    print("=" * 60)
    print("AI-HRMS User SOP PDF Generator")
    print("=" * 60)

    # Step 1: Build body PDF
    print("\n[1/3] Building body PDF with ReportLab...")
    build_body()

    # Step 2: Render cover
    print("\n[2/3] Rendering cover page with Playwright...")
    render_cover()

    # Step 3: Merge
    print("\n[3/3] Merging cover + body...")
    merge_pdfs()

    # Cleanup temp files
    for f in [BODY_PDF, COVER_PDF, COVER_HTML]:
        try:
            os.remove(f)
        except:
            pass

    print("\nDone! Final PDF: " + FINAL_PDF)
