#!/usr/bin/env python3
"""AI-HRMS Module-Wise Functionality & Workflow Document - Body PDF Generator"""

import sys, os, hashlib
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, CondPageBreak, HRFlowable
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ============================================================
# FONT REGISTRATION
# ============================================================
pdfmetrics.registerFont(TTFont('LiberationSerif', '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSerif-Bold', '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSans', '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSans-Bold', '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))
registerFontFamily('LiberationSerif', normal='LiberationSerif', bold='LiberationSerif-Bold')
registerFontFamily('LiberationSans', normal='LiberationSans', bold='LiberationSans-Bold')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans')

# ============================================================
# COLOR PALETTE (from cascade palette)
# ============================================================
ACCENT       = colors.HexColor('#c65733')
TEXT_PRIMARY  = colors.HexColor('#212425')
TEXT_MUTED    = colors.HexColor('#81878a')
BG_SURFACE   = colors.HexColor('#e6e8e9')
BG_PAGE      = colors.HexColor('#f2f3f4')
HEADER_FILL  = colors.HexColor('#476776')
CARD_BG      = colors.HexColor('#edeff0')
BORDER_COLOR = colors.HexColor('#aebabf')
ICON_COLOR   = colors.HexColor('#517a8f')

TABLE_HEADER_COLOR = HEADER_FILL
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = colors.HexColor('#ecedee')

# ============================================================
# PAGE DIMENSIONS
# ============================================================
PAGE_W, PAGE_H = A4
LEFT_MARGIN = 1.0 * inch
RIGHT_MARGIN = 1.0 * inch
TOP_MARGIN = 0.8 * inch
BOTTOM_MARGIN = 0.8 * inch
AVAILABLE_W = PAGE_W - LEFT_MARGIN - RIGHT_MARGIN

# ============================================================
# STYLES
# ============================================================
h1_style = ParagraphStyle(
    name='H1', fontName='LiberationSerif', fontSize=20, leading=28,
    textColor=HEADER_FILL, spaceBefore=18, spaceAfter=10, alignment=TA_LEFT
)
h2_style = ParagraphStyle(
    name='H2', fontName='LiberationSerif', fontSize=15, leading=22,
    textColor=ACCENT, spaceBefore=14, spaceAfter=8, alignment=TA_LEFT
)
h3_style = ParagraphStyle(
    name='H3', fontName='LiberationSerif', fontSize=12, leading=18,
    textColor=TEXT_PRIMARY, spaceBefore=10, spaceAfter=6, alignment=TA_LEFT
)
body_style = ParagraphStyle(
    name='Body', fontName='LiberationSerif', fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, spaceBefore=0, spaceAfter=6, alignment=TA_JUSTIFY
)
bullet_style = ParagraphStyle(
    name='Bullet', fontName='LiberationSerif', fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, spaceBefore=2, spaceAfter=2,
    leftIndent=20, bulletIndent=8, alignment=TA_LEFT
)
workflow_style = ParagraphStyle(
    name='Workflow', fontName='LiberationSerif', fontSize=10, leading=16,
    textColor=TEXT_PRIMARY, spaceBefore=0, spaceAfter=2,
    leftIndent=15, alignment=TA_LEFT
)
caption_style = ParagraphStyle(
    name='Caption', fontName='LiberationSerif', fontSize=9, leading=14,
    textColor=TEXT_MUTED, spaceBefore=3, spaceAfter=6, alignment=TA_CENTER
)
toc_h1_style = ParagraphStyle(
    name='TOCH1', fontName='LiberationSerif', fontSize=13, leading=22,
    leftIndent=20, textColor=TEXT_PRIMARY
)
toc_h2_style = ParagraphStyle(
    name='TOCH2', fontName='LiberationSerif', fontSize=11, leading=18,
    leftIndent=40, textColor=TEXT_MUTED
)

# Table cell styles
header_cell_style = ParagraphStyle(
    name='HeaderCell', fontName='LiberationSerif', fontSize=9.5, leading=14,
    textColor=colors.white, alignment=TA_CENTER
)
cell_style = ParagraphStyle(
    name='Cell', fontName='LiberationSerif', fontSize=9, leading=13,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER
)
cell_left_style = ParagraphStyle(
    name='CellLeft', fontName='LiberationSerif', fontSize=9, leading=13,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT
)
cell_small_style = ParagraphStyle(
    name='CellSmall', fontName='LiberationSerif', fontSize=8, leading=11,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER
)

# ============================================================
# HELPER FUNCTIONS
# ============================================================
def P(text, style=body_style):
    return Paragraph(text, style)

def HP(text, style=header_cell_style):
    return Paragraph('<b>' + text + '</b>', style)

def CP(text, style=cell_style):
    return Paragraph(text, style)

def CLP(text, style=cell_left_style):
    return Paragraph(text, style)

def workflow_box(title, steps):
    """Create a workflow as a styled table block."""
    elements = []
    elements.append(P('<b>' + title + '</b>', h3_style))
    step_text = '  '.join(['<b>Step {}</b>: {}'.format(i+1, s) for i, s in enumerate(steps)])
    elements.append(P(step_text, workflow_style))
    return elements

def make_table(headers, rows, col_widths=None):
    """Create a styled table with header row."""
    data = [[HP(h) for h in headers]]
    for row in rows:
        data.append([CP(str(c)) for c in row])
    
    if col_widths is None:
        n = len(headers)
        col_widths = [AVAILABLE_W / n] * n
    
    t = Table(data, colWidths=col_widths, hAlign='CENTER')
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]
    for i in range(1, len(data)):
        bg = TABLE_ROW_ODD if i % 2 == 0 else TABLE_ROW_EVEN
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    
    t.setStyle(TableStyle(style_cmds))
    return t

def make_role_matrix(roles_access):
    """Create a role access matrix table. roles_access: dict of {role: {feature: access_level}}"""
    roles = list(roles_access.keys())
    features = list(list(roles_access.values())[0].keys())
    
    headers = ['Feature'] + roles
    col_widths = [AVAILABLE_W * 0.22] + [AVAILABLE_W * 0.78 / len(roles)] * len(roles)
    
    data = [[HP(h) for h in headers]]
    for feat in features:
        row = [CLP(feat)]
        for role in roles:
            val = roles_access[role].get(feat, '-')
            row.append(CP(val, cell_small_style))
        data.append(row)
    
    t = Table(data, colWidths=col_widths, hAlign='CENTER')
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]
    for i in range(1, len(data)):
        bg = TABLE_ROW_ODD if i % 2 == 0 else TABLE_ROW_EVEN
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t


# ============================================================
# TOC DOCUMENT TEMPLATE
# ============================================================
class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))

def add_heading(text, style, level=0):
    key = 'h_%s' % hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/>%s' % (key, text), style)
    p.bookmark_name = text
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p

ORPHAN_THRESHOLD = (PAGE_H - TOP_MARGIN - BOTTOM_MARGIN) * 0.15

def add_section(text, style, level=0):
    return [
        CondPageBreak(ORPHAN_THRESHOLD),
        add_heading(text, style, level=level),
    ]

# ============================================================
# BUILD DOCUMENT
# ============================================================
output_path = '/home/z/my-project/download/func_body.pdf'

doc = TocDocTemplate(
    output_path,
    pagesize=A4,
    leftMargin=LEFT_MARGIN,
    rightMargin=RIGHT_MARGIN,
    topMargin=TOP_MARGIN,
    bottomMargin=BOTTOM_MARGIN,
    title='AI-HRMS Module-Wise Functionality & Workflow Document',
    author='Z.ai',
    creator='Z.ai',
)

story = []

# ─────────────────────────────────────
# TABLE OF CONTENTS
# ─────────────────────────────────────
story.append(P('<b>Table of Contents</b>', h1_style))
story.append(Spacer(1, 6))
toc = TableOfContents()
toc.levelStyles = [toc_h1_style, toc_h2_style]
story.append(toc)
story.append(PageBreak())

# ═══════════════════════════════════════
# MODULE 1: Core HR & Employee Management
# ═══════════════════════════════════════
story.extend(add_section('1. Core HR & Employee Management', h1_style, level=0))

story.append(P('The Core HR module serves as the foundational layer of the AI-HRMS platform, managing the complete employee lifecycle from hire to retire. It centralizes all employee data, organizational structures, and HR administrative functions.', body_style))

# Features
story.append(P('<b>1.1 Features List</b>', h2_style))
features_m1 = [
    'Employee Master Data Management (personal, professional, emergency contacts)',
    'Organizational Chart & Hierarchy Management',
    'Job Position & Designation Management',
    'Employee Onboarding Checklist Automation',
    'Offboarding & Separation Processing',
    'Document Management (upload, verify, archive)',
    'Employee Transfer & Promotion Workflows',
    'Probation Period Tracking & Confirmation',
    'Company Policy & Handbook Distribution',
    'Employee Directory & Search',
    'Custom Fields & Dynamic Forms',
    'Bulk Data Import/Export (CSV, Excel)',
    'Audit Trail & Change Log for All Records',
    'AI-Powered Duplicate Employee Detection',
    'Automated Compliance Reminders',
]
for f in features_m1:
    story.append(P('- ' + f, bullet_style))
story.append(Spacer(1, 8))

# Workflows
story.append(P('<b>1.2 Configured Workflows</b>', h2_style))

story.extend(workflow_box('Workflow 1: Employee Onboarding', [
    'HR Creates Offer', 'Employee Accepts Offer', 'Auto-Generate Employee ID',
    'Provision IT Assets', 'Assign Onboarding Checklist', 'Manager Welcomes & Assigns Buddy',
    'Complete Mandatory Training', 'Probation Period Starts'
]))
story.append(Spacer(1, 6))

story.extend(workflow_box('Workflow 2: Employee Transfer', [
    'Manager Initiates Transfer Request', 'Current Manager Approves',
    'Receiving Manager Approves', 'HR Reviews & Validates', 'Update Organizational Records',
    'Reassign Reporting Lines', 'Notify Payroll for Changes', 'Transfer Effective Date Activated'
]))
story.append(Spacer(1, 6))

story.extend(workflow_box('Workflow 3: Employee Separation', [
    'Initiate Resignation/Termination', 'Manager Acknowledges', 'Exit Interview Scheduled',
    'Clearance Checklist Generated', 'Asset Recovery Verified', 'Final Settlement Calculated',
    'Knowledge Transfer Completed', 'Account Deactivated on Exit Date'
]))
story.append(Spacer(1, 10))

# Role Access Matrix
story.append(P('<b>1.3 Role Access Matrix</b>', h2_style))
m1_access = {
    'Super Admin': {'Employee Data': 'Full', 'Org Chart': 'Full', 'Transfers': 'Full', 'Offboarding': 'Full', 'Documents': 'Full', 'Audit Trail': 'Full'},
    'HR Admin': {'Employee Data': 'Full', 'Org Chart': 'Full', 'Transfers': 'Full', 'Offboarding': 'Full', 'Documents': 'Full', 'Audit Trail': 'Full'},
    'Payroll Specialist': {'Employee Data': 'Read', 'Org Chart': 'Read', 'Transfers': 'None', 'Offboarding': 'Read', 'Documents': 'Read', 'Audit Trail': 'None'},
    'Department Manager': {'Employee Data': 'Team Only', 'Org Chart': 'Read', 'Transfers': 'Initiate', 'Offboarding': 'Initiate', 'Documents': 'Team Only', 'Audit Trail': 'None'},
    'Employee': {'Employee Data': 'Self Only', 'Org Chart': 'Read', 'Transfers': 'None', 'Offboarding': 'None', 'Documents': 'Self Only', 'Audit Trail': 'None'},
    'Recruiter': {'Employee Data': 'Limited', 'Org Chart': 'Read', 'Transfers': 'None', 'Offboarding': 'None', 'Documents': 'None', 'Audit Trail': 'None'},
    'L&D Manager': {'Employee Data': 'Read', 'Org Chart': 'Read', 'Transfers': 'None', 'Offboarding': 'None', 'Documents': 'None', 'Audit Trail': 'None'},
}
story.append(make_role_matrix(m1_access))
story.append(Spacer(1, 18))


# ═══════════════════════════════════════
# MODULE 2: RBAC & Security System
# ═══════════════════════════════════════
story.extend(add_section('2. RBAC & Security System', h1_style, level=0))

story.append(P('The Role-Based Access Control module provides granular permission management across the entire HRMS platform. It enforces the principle of least privilege, ensures data security, and maintains comprehensive audit trails for compliance.', body_style))

story.append(P('<b>2.1 Features List</b>', h2_style))
for f in [
    'Role Definition & Management (7 default roles, custom roles)',
    'Permission Assignment (module-level, feature-level, field-level)',
    'User Account Management & Authentication',
    'Multi-Factor Authentication (MFA) Enforcement',
    'Single Sign-On (SSO) Integration (SAML, OAuth 2.0)',
    'Session Management & Timeout Policies',
    'Data Encryption (at rest and in transit)',
    'IP Whitelisting & Geographic Access Controls',
    'API Key Management & Rate Limiting',
    'Security Policy Configuration (password complexity, lockout)',
    'Comprehensive Audit Logging',
    'Suspicious Activity Detection & Alerts',
    'Data Masking for Sensitive Fields',
    'Role Hierarchy & Inheritance',
    'Temporary Access Elevation with Approval',
]:
    story.append(P('- ' + f, bullet_style))
story.append(Spacer(1, 8))

story.append(P('<b>2.2 Configured Workflows</b>', h2_style))
story.extend(workflow_box('Workflow 1: New Role Creation', [
    'Admin Defines Role Name & Description', 'Assign Module Permissions',
    'Set Feature-Level Access', 'Configure Field-Level Visibility',
    'Define Role Hierarchy', 'Stakeholder Review & Approval', 'Role Activated in System'
]))
story.append(Spacer(1, 6))
story.extend(workflow_box('Workflow 2: Access Elevation Request', [
    'User Requests Temporary Access', 'Manager Reviews Justification',
    'Security Team Evaluates Risk', 'Time-Bound Access Granted',
    'Activity Monitored During Period', 'Access Auto-Revoked at Expiry', 'Audit Entry Created'
]))
story.append(Spacer(1, 6))
story.extend(workflow_box('Workflow 3: Security Incident Response', [
    'Anomaly Detected by System', 'Alert Sent to Security Team',
    'Account Suspended Preemptively', 'Investigation Initiated',
    'Root Cause Identified', 'Remediation Applied', 'Account Restored with Enhanced Monitoring'
]))
story.append(Spacer(1, 10))

story.append(P('<b>2.3 Role Access Matrix</b>', h2_style))
m2_access = {
    'Super Admin': {'Role Mgmt': 'Full', 'Permissions': 'Full', 'MFA Config': 'Full', 'Audit Logs': 'Full', 'Security Policies': 'Full', 'API Keys': 'Full'},
    'HR Admin': {'Role Mgmt': 'Read', 'Permissions': 'Limited', 'MFA Config': 'None', 'Audit Logs': 'Read', 'Security Policies': 'None', 'API Keys': 'None'},
    'Payroll Specialist': {'Role Mgmt': 'None', 'Permissions': 'None', 'MFA Config': 'Self', 'Audit Logs': 'None', 'Security Policies': 'None', 'API Keys': 'None'},
    'Department Manager': {'Role Mgmt': 'None', 'Permissions': 'None', 'MFA Config': 'Self', 'Audit Logs': 'Team Only', 'Security Policies': 'None', 'API Keys': 'None'},
    'Employee': {'Role Mgmt': 'None', 'Permissions': 'None', 'MFA Config': 'Self', 'Audit Logs': 'None', 'Security Policies': 'None', 'API Keys': 'None'},
    'Recruiter': {'Role Mgmt': 'None', 'Permissions': 'None', 'MFA Config': 'Self', 'Audit Logs': 'None', 'Security Policies': 'None', 'API Keys': 'None'},
    'L&D Manager': {'Role Mgmt': 'None', 'Permissions': 'None', 'MFA Config': 'Self', 'Audit Logs': 'None', 'Security Policies': 'None', 'API Keys': 'None'},
}
story.append(make_role_matrix(m2_access))
story.append(Spacer(1, 18))


# ═══════════════════════════════════════
# MODULE 3: AI-Driven Talent Acquisition & Onboarding
# ═══════════════════════════════════════
story.extend(add_section('3. AI-Driven Talent Acquisition & Onboarding', h1_style, level=0))

story.append(P('This module leverages artificial intelligence to streamline the entire recruitment pipeline, from job requisition to candidate onboarding. AI-powered resume screening, interview scheduling, and predictive hiring analytics reduce time-to-hire and improve quality of hire.', body_style))

story.append(P('<b>3.1 Features List</b>', h2_style))
for f in [
    'Job Requisition & Approval Workflow',
    'AI-Powered Job Description Generator',
    'Multi-Channel Job Posting (internal, portals, social media)',
    'AI Resume Screening & Ranking (NLP-based matching)',
    'Candidate Pipeline Management (Kanban view)',
    'Automated Interview Scheduling with Calendar Integration',
    'Structured Interview Scorecards',
    'AI-Driven Candidate Assessment Tests',
    'Offer Letter Generation & E-Signature',
    'Background Verification Integration',
    'Pre-Onboarding Task Automation',
    'Onboarding Buddy Assignment System',
    'New Hire 30-60-90 Day Check-in',
    'Recruitment Analytics & Funnel Reports',
    'Candidate Experience Survey & NPS Tracking',
]:
    story.append(P('- ' + f, bullet_style))
story.append(Spacer(1, 8))

story.append(P('<b>3.2 Configured Workflows</b>', h2_style))
story.extend(workflow_box('Workflow 1: End-to-End Recruitment', [
    'Hiring Manager Creates Requisition', 'HR Approves Requisition',
    'AI Generates Job Description', 'Post to Multiple Channels',
    'AI Screens & Ranks Applications', 'Shortlisted for Interview',
    'Panel Conducts Interviews', 'Offer Extended & Accepted'
]))
story.append(Spacer(1, 6))
story.extend(workflow_box('Workflow 2: Interview Scheduling', [
    'Recruiter Selects Interviewers', 'System Checks Calendar Availability',
    'Automated Invite Sent to All Parties', 'Candidate Confirms Time Slot',
    'Interview Link/Location Generated', 'Scorecard Template Assigned',
    'Post-Interview Feedback Collected', 'Consolidated Rating Computed'
]))
story.append(Spacer(1, 6))
story.extend(workflow_box('Workflow 3: Pre-Onboarding Automation', [
    'Offer Accepted', 'Background Verification Initiated',
    'IT Asset Request Generated', 'System Access Provisioned',
    'Welcome Kit Dispatched', 'Day-1 Schedule Created',
    'Buddy Assigned', 'Employee Marked as Active'
]))
story.append(Spacer(1, 10))

story.append(P('<b>3.3 Role Access Matrix</b>', h2_style))
m3_access = {
    'Super Admin': {'Job Requisition': 'Full', 'Resume Screening': 'Full', 'Interview Mgmt': 'Full', 'Offer Letters': 'Full', 'Onboarding': 'Full', 'Analytics': 'Full'},
    'HR Admin': {'Job Requisition': 'Full', 'Resume Screening': 'Full', 'Interview Mgmt': 'Full', 'Offer Letters': 'Full', 'Onboarding': 'Full', 'Analytics': 'Full'},
    'Payroll Specialist': {'Job Requisition': 'None', 'Resume Screening': 'None', 'Interview Mgmt': 'None', 'Offer Letters': 'Read', 'Onboarding': 'Read', 'Analytics': 'None'},
    'Department Manager': {'Job Requisition': 'Initiate', 'Resume Screening': 'Review', 'Interview Mgmt': 'Full', 'Offer Letters': 'Approve', 'Onboarding': 'Full', 'Analytics': 'Team Only'},
    'Employee': {'Job Requisition': 'None', 'Resume Screening': 'None', 'Interview Mgmt': 'None', 'Offer Letters': 'None', 'Onboarding': 'Self Only', 'Analytics': 'None'},
    'Recruiter': {'Job Requisition': 'Full', 'Resume Screening': 'Full', 'Interview Mgmt': 'Full', 'Offer Letters': 'Draft', 'Onboarding': 'Full', 'Analytics': 'Full'},
    'L&D Manager': {'Job Requisition': 'None', 'Resume Screening': 'None', 'Interview Mgmt': 'None', 'Offer Letters': 'None', 'Onboarding': 'Read', 'Analytics': 'None'},
}
story.append(make_role_matrix(m3_access))
story.append(Spacer(1, 18))


# ═══════════════════════════════════════
# MODULE 4: Time & Attendance Management
# ═══════════════════════════════════════
story.extend(add_section('4. Time & Attendance Management', h1_style, level=0))

story.append(P('This module automates time tracking, attendance monitoring, and leave management with AI-driven anomaly detection. It integrates with biometric devices, GPS, and calendar systems for accurate workforce time data.', body_style))

story.append(P('<b>4.1 Features List</b>', h2_style))
for f in [
    'Multi-Mode Attendance Capture (Biometric, GPS, Web, Mobile)',
    'Real-Time Attendance Dashboard',
    'Shift Management & Scheduling (Rotational, Fixed, Flexible)',
    'AI-Powered Attendance Anomaly Detection',
    'Leave Management (Apply, Approve, Balance Tracking)',
    'Leave Policy Configuration (Carry-forward, Encashment)',
    'Holiday Calendar Management (Multi-Region)',
    'Overtime Tracking & Auto-Calculation',
    'Comp-Off Request & Approval',
    'Timesheet Submission & Approval',
    'Project-Based Time Tracking',
    'Attendance Regularization Workflow',
    'Late Arrival / Early Departure Tracking',
    'AI-Driven Absenteeism Pattern Analysis',
    'Integration with Payroll for Salary Calculation',
]:
    story.append(P('- ' + f, bullet_style))
story.append(Spacer(1, 8))

story.append(P('<b>4.2 Configured Workflows</b>', h2_style))
story.extend(workflow_box('Workflow 1: Leave Application', [
    'Employee Applies for Leave', 'System Validates Leave Balance',
    'Auto-Route to Manager', 'Manager Approves/Rejects',
    'Team Calendar Updated', 'HR Notified for Records',
    'Leave Balance Deducted', 'Payroll Adjustment Triggered'
]))
story.append(Spacer(1, 6))
story.extend(workflow_box('Workflow 2: Attendance Regularization', [
    'Employee Identifies Discrepancy', 'Submits Regularization Request',
    'Manager Reviews & Verifies', 'HR Validates Supporting Evidence',
    'Attendance Record Updated', 'Payroll Impact Assessment',
    'System Log Updated', 'Anomaly Score Recalculated'
]))
story.append(Spacer(1, 6))
story.extend(workflow_box('Workflow 3: Shift Schedule Change', [
    'Manager Initiates Shift Change', 'System Checks Coverage Requirements',
    'Affected Employees Notified', 'Employee Acknowledges Change',
    'HR Reviews Compliance', 'Shift Calendar Updated',
    'Attendance Rules Adjusted', 'Payroll Rules Synced'
]))
story.append(Spacer(1, 10))

story.append(P('<b>4.3 Role Access Matrix</b>', h2_style))
m4_access = {
    'Super Admin': {'Attendance': 'Full', 'Leave Mgmt': 'Full', 'Shift Mgmt': 'Full', 'Timesheets': 'Full', 'Anomaly Detection': 'Full', 'Reports': 'Full'},
    'HR Admin': {'Attendance': 'Full', 'Leave Mgmt': 'Full', 'Shift Mgmt': 'Full', 'Timesheets': 'Full', 'Anomaly Detection': 'Read', 'Reports': 'Full'},
    'Payroll Specialist': {'Attendance': 'Read', 'Leave Mgmt': 'Read', 'Shift Mgmt': 'Read', 'Timesheets': 'Read', 'Anomaly Detection': 'None', 'Reports': 'Read'},
    'Department Manager': {'Attendance': 'Team Only', 'Leave Mgmt': 'Approve', 'Shift Mgmt': 'Team Only', 'Timesheets': 'Approve', 'Anomaly Detection': 'Team Only', 'Reports': 'Team Only'},
    'Employee': {'Attendance': 'Self Only', 'Leave Mgmt': 'Self Only', 'Shift Mgmt': 'Read', 'Timesheets': 'Self Only', 'Anomaly Detection': 'None', 'Reports': 'None'},
    'Recruiter': {'Attendance': 'None', 'Leave Mgmt': 'None', 'Shift Mgmt': 'None', 'Timesheets': 'None', 'Anomaly Detection': 'None', 'Reports': 'None'},
    'L&D Manager': {'Attendance': 'Read', 'Leave Mgmt': 'None', 'Shift Mgmt': 'None', 'Timesheets': 'None', 'Anomaly Detection': 'None', 'Reports': 'None'},
}
story.append(make_role_matrix(m4_access))
story.append(Spacer(1, 18))


# ═══════════════════════════════════════
# MODULE 5: Payroll & Expense Management
# ═══════════════════════════════════════
story.extend(add_section('5. Payroll & Expense Management', h1_style, level=0))

story.append(P('The Payroll module delivers end-to-end salary processing with automated tax calculations, statutory compliance, and multi-country payroll support. The Expense module streamlines claim submission, approval, and reimbursement with policy-based validation.', body_style))

story.append(P('<b>5.1 Features List</b>', h2_style))
for f in [
    'Automated Salary Calculation (Basic, HRA, Allowances, Deductions)',
    'Tax Computation & TDS Management (Multi-Country)',
    'Statutory Compliance (PF, ESI, PT, LWF)',
    'Bank Integration for Salary Disbursement',
    'Payslip Generation & Distribution (PDF, Email)',
    'Salary Structure Configuration & Versioning',
    'Investment Declaration & Proof Collection',
    'Form 16 / Tax Certificate Generation',
    'Expense Claim Submission with Receipt Upload',
    'Multi-Level Expense Approval Workflow',
    'Policy-Based Expense Auto-Validation',
    'Mileage & Travel Expense Calculator',
    'Corporate Card Integration & Reconciliation',
    'Advance Salary & Loan Management',
    'Payroll Analytics & Cost Distribution Reports',
]:
    story.append(P('- ' + f, bullet_style))
story.append(Spacer(1, 8))

story.append(P('<b>5.2 Configured Workflows</b>', h2_style))
story.extend(workflow_box('Workflow 1: Monthly Payroll Processing', [
    'Payroll Admin Initiates Run', 'System Pulls Attendance & Leave Data',
    'OT & Deductions Calculated', 'Tax & Statutory Computed',
    'Draft Paysheets Generated', 'Manager Review & Approval',
    'Bank File Created & Uploaded', 'Payslips Distributed to Employees'
]))
story.append(Spacer(1, 6))
story.extend(workflow_box('Workflow 2: Expense Claim Processing', [
    'Employee Submits Claim with Receipts', 'AI Validates Against Policy',
    'Auto-Route to Manager', 'Manager Approves/Queries',
    'Finance Team Reviews', 'Reimbursement Scheduled',
    'Payment Processed', 'Employee Notified of Settlement'
]))
story.append(Spacer(1, 6))
story.extend(workflow_box('Workflow 3: Investment Declaration', [
    'Employee Declares Investments', 'System Validates Limits & Rules',
    'Manager Reviews if Required', 'HR Acknowledges Declaration',
    'TDS Adjusted for Remaining Months', 'Proof Collection Deadline Set',
    'Proofs Submitted & Verified', 'Final Tax Computation Updated'
]))
story.append(Spacer(1, 10))

story.append(P('<b>5.3 Role Access Matrix</b>', h2_style))
m5_access = {
    'Super Admin': {'Salary Processing': 'Full', 'Tax Mgmt': 'Full', 'Expense Claims': 'Full', 'Payslips': 'Full', 'Statutory': 'Full', 'Analytics': 'Full'},
    'HR Admin': {'Salary Processing': 'Full', 'Tax Mgmt': 'Read', 'Expense Claims': 'Full', 'Payslips': 'Full', 'Statutory': 'Read', 'Analytics': 'Full'},
    'Payroll Specialist': {'Salary Processing': 'Full', 'Tax Mgmt': 'Full', 'Expense Claims': 'Process', 'Payslips': 'Full', 'Statutory': 'Full', 'Analytics': 'Full'},
    'Department Manager': {'Salary Processing': 'None', 'Tax Mgmt': 'None', 'Expense Claims': 'Approve', 'Payslips': 'None', 'Statutory': 'None', 'Analytics': 'Team Cost Only'},
    'Employee': {'Salary Processing': 'None', 'Tax Mgmt': 'Self Only', 'Expense Claims': 'Self Only', 'Payslips': 'Self Only', 'Statutory': 'Self Only', 'Analytics': 'None'},
    'Recruiter': {'Salary Processing': 'None', 'Tax Mgmt': 'None', 'Expense Claims': 'Self Only', 'Payslips': 'Self Only', 'Statutory': 'None', 'Analytics': 'None'},
    'L&D Manager': {'Salary Processing': 'None', 'Tax Mgmt': 'None', 'Expense Claims': 'Self Only', 'Payslips': 'Self Only', 'Statutory': 'None', 'Analytics': 'None'},
}
story.append(make_role_matrix(m5_access))
story.append(Spacer(1, 18))


# ═══════════════════════════════════════
# MODULE 6: Performance & Talent Development
# ═══════════════════════════════════════
story.extend(add_section('6. Performance & Talent Development', h1_style, level=0))

story.append(P('This module enables continuous performance management through configurable review cycles, 360-degree feedback, goal alignment (OKRs/KPIs), and AI-driven talent identification for succession planning and career development.', body_style))

story.append(P('<b>6.1 Features List</b>', h2_style))
for f in [
    'Configurable Performance Review Cycles (Annual, Bi-Annual, Quarterly)',
    'Goal Setting & Tracking (OKRs, KPIs, MBOs)',
    'Cascading Goals (Company > Department > Individual)',
    '360-Degree Feedback Collection',
    'Continuous Feedback & Check-ins',
    'Performance Rating Scales (Customizable)',
    'AI-Powered Performance Bias Detection',
    'Talent Matrix / 9-Box Grid',
    'Succession Planning & Pipeline',
    'Career Path & Development Plans',
    'Competency Framework & Assessment',
    'Calibration Sessions for Rating Normalization',
    'PIP (Performance Improvement Plan) Management',
    'Promotion & Increment Recommendation Engine',
    'Performance Analytics & Trend Reports',
]:
    story.append(P('- ' + f, bullet_style))
story.append(Spacer(1, 8))

story.append(P('<b>6.2 Configured Workflows</b>', h2_style))
story.extend(workflow_box('Workflow 1: Annual Performance Review', [
    'HR Initiates Review Cycle', 'Employee Completes Self-Assessment',
    'Manager Rates & Reviews', '360 Feedback Collected',
    'Calibration Session Held', 'Final Rating Assigned',
    'Employee Acknowledges', 'Development Plan Created'
]))
story.append(Spacer(1, 6))
story.extend(workflow_box('Workflow 2: PIP (Performance Improvement Plan)', [
    'Manager Identifies Low Performance', 'HR Validates & Reviews',
    'PIP Created with Milestones', 'Employee Acknowledges PIP',
    'Regular Check-ins Scheduled', 'Progress Assessed at Checkpoints',
    'PIP Completed - Pass/Fail', 'Next Action (Recovery/Separation)'
]))
story.append(Spacer(1, 6))
story.extend(workflow_box('Workflow 3: Succession Planning', [
    'Identify Critical Positions', 'Define Competency Requirements',
    'AI Ranks Potential Successors', 'HR Reviews Shortlist',
    'Development Plans Assigned', 'Readiness Assessment Conducted',
    'Succession Map Updated', 'Board Review & Approval'
]))
story.append(Spacer(1, 10))

story.append(P('<b>6.3 Role Access Matrix</b>', h2_style))
m6_access = {
    'Super Admin': {'Goal Setting': 'Full', 'Reviews': 'Full', '360 Feedback': 'Full', 'Talent Matrix': 'Full', 'Succession': 'Full', 'PIP': 'Full'},
    'HR Admin': {'Goal Setting': 'Full', 'Reviews': 'Full', '360 Feedback': 'Full', 'Talent Matrix': 'Full', 'Succession': 'Full', 'PIP': 'Full'},
    'Payroll Specialist': {'Goal Setting': 'None', 'Reviews': 'None', '360 Feedback': 'None', 'Talent Matrix': 'None', 'Succession': 'None', 'PIP': 'None'},
    'Department Manager': {'Goal Setting': 'Team Only', 'Reviews': 'Team Only', '360 Feedback': 'Provide', 'Talent Matrix': 'Team Only', 'Succession': 'Initiate', 'PIP': 'Initiate'},
    'Employee': {'Goal Setting': 'Self Only', 'Reviews': 'Self Only', '360 Feedback': 'Provide', 'Talent Matrix': 'None', 'Succession': 'None', 'PIP': 'Self Only'},
    'Recruiter': {'Goal Setting': 'None', 'Reviews': 'None', '360 Feedback': 'None', 'Talent Matrix': 'None', 'Succession': 'None', 'PIP': 'None'},
    'L&D Manager': {'Goal Setting': 'Read', 'Reviews': 'Read', '360 Feedback': 'Read', 'Talent Matrix': 'Read', 'Succession': 'Read', 'PIP': 'Support'},
}
story.append(make_role_matrix(m6_access))
story.append(Spacer(1, 18))


# ═══════════════════════════════════════
# MODULE 7: Learning & Development
# ═══════════════════════════════════════
story.extend(add_section('7. Learning & Development', h1_style, level=0))

story.append(P('The L&D module provides a comprehensive learning management platform with AI-curated learning paths, course management, certification tracking, and skills gap analysis to build a future-ready workforce.', body_style))

story.append(P('<b>7.1 Features List</b>', h2_style))
for f in [
    'Learning Management System (LMS) with Course Catalog',
    'AI-Powered Learning Path Recommendations',
    'Course Creation & Content Management (SCORM, Video, Docs)',
    'Assessment & Quiz Engine',
    'Certification Management & Tracking',
    'Skills Gap Analysis (AI-Driven)',
    'Training Budget Allocation & Tracking',
    'External Training Request & Approval',
    'Compliance Training Automation',
    'Gamification (Badges, Points, Leaderboards)',
    'Instructor-Led Training (ILT) Scheduling',
    'Virtual Classroom Integration',
    'Learning Analytics & ROI Measurement',
    'Mentorship Program Management',
    'Knowledge Base & Resource Library',
]:
    story.append(P('- ' + f, bullet_style))
story.append(Spacer(1, 8))

story.append(P('<b>7.2 Configured Workflows</b>', h2_style))
story.extend(workflow_box('Workflow 1: Training Nomination', [
    'L&D Publishes Training Calendar', 'Manager Nominates Employee',
    'Employee Accepts Nomination', 'Prerequisites Checked',
    'Enrollment Confirmed', 'Training Delivered (Online/ILT)',
    'Assessment Completed', 'Certificate Issued & Skills Updated'
]))
story.append(Spacer(1, 6))
story.extend(workflow_box('Workflow 2: External Training Request', [
    'Employee Submits Request with Details', 'Manager Reviews & Approves',
    'L&D Validates Budget & Relevance', 'Finance Approves Budget',
    'Vendor Coordination', 'Employee Attends Training',
    'Knowledge Sharing Session Conducted', 'Skills Profile Updated'
]))
story.append(Spacer(1, 6))
story.extend(workflow_box('Workflow 3: Compliance Training Cycle', [
    'System Identifies Due Compliance Trainings', 'Auto-Enroll Affected Employees',
    'Deadline Notifications Sent', 'Employee Completes Training',
    'Assessment Score Evaluated', 'Non-Compliance Escalated to Manager',
    'HR Compliance Dashboard Updated', 'Audit Report Generated'
]))
story.append(Spacer(1, 10))

story.append(P('<b>7.3 Role Access Matrix</b>', h2_style))
m7_access = {
    'Super Admin': {'Course Mgmt': 'Full', 'Learning Paths': 'Full', 'Certifications': 'Full', 'Budget': 'Full', 'Analytics': 'Full', 'Compliance': 'Full'},
    'HR Admin': {'Course Mgmt': 'Full', 'Learning Paths': 'Full', 'Certifications': 'Full', 'Budget': 'Read', 'Analytics': 'Full', 'Compliance': 'Full'},
    'Payroll Specialist': {'Course Mgmt': 'None', 'Learning Paths': 'None', 'Certifications': 'None', 'Budget': 'Read', 'Analytics': 'None', 'Compliance': 'None'},
    'Department Manager': {'Course Mgmt': 'Nominate', 'Learning Paths': 'Team Only', 'Certifications': 'Team Only', 'Budget': 'None', 'Analytics': 'Team Only', 'Compliance': 'Team Only'},
    'Employee': {'Course Mgmt': 'Enroll', 'Learning Paths': 'Self Only', 'Certifications': 'Self Only', 'Budget': 'None', 'Analytics': 'Self Only', 'Compliance': 'Self Only'},
    'Recruiter': {'Course Mgmt': 'None', 'Learning Paths': 'None', 'Certifications': 'Read', 'Budget': 'None', 'Analytics': 'None', 'Compliance': 'None'},
    'L&D Manager': {'Course Mgmt': 'Full', 'Learning Paths': 'Full', 'Certifications': 'Full', 'Budget': 'Full', 'Analytics': 'Full', 'Compliance': 'Full'},
}
story.append(make_role_matrix(m7_access))
story.append(Spacer(1, 18))


# ═══════════════════════════════════════
# MODULE 8: Analytics & Reporting
# ═══════════════════════════════════════
story.extend(add_section('8. Analytics & Reporting', h1_style, level=0))

story.append(P('The Analytics module provides data-driven insights across all HR functions with interactive dashboards, configurable reports, and AI-powered predictive analytics for workforce planning and strategic decision-making.', body_style))

story.append(P('<b>8.1 Features List</b>', h2_style))
for f in [
    'Executive HR Dashboard (Real-Time KPIs)',
    'Headcount & Workforce Demographics Analytics',
    'Attrition Analysis & Prediction (AI-Driven)',
    'Recruitment Funnel & Time-to-Hire Reports',
    'Attendance & Leave Pattern Analytics',
    'Payroll Cost Distribution & Trend Reports',
    'Performance Distribution & Calibration Analytics',
    'Training Effectiveness & ROI Reports',
    'Diversity, Equity & Inclusion (DEI) Metrics',
    'Custom Report Builder (Drag & Drop)',
    'Scheduled Report Generation & Email Distribution',
    'Data Export (Excel, CSV, PDF, API)',
    'AI-Powered Anomaly Detection in HR Data',
    'Benchmarking Against Industry Standards',
    'Predictive Workforce Planning Models',
]:
    story.append(P('- ' + f, bullet_style))
story.append(Spacer(1, 8))

story.append(P('<b>8.2 Configured Workflows</b>', h2_style))
story.extend(workflow_box('Workflow 1: Scheduled Report Generation', [
    'Admin Configures Report Parameters', 'Set Schedule (Daily/Weekly/Monthly)',
    'Define Recipient List', 'System Generates Report at Schedule',
    'AI Quality Check on Data', 'Report Emailed to Recipients',
    'Archived in Report Repository', 'Usage Tracking Logged'
]))
story.append(Spacer(1, 6))
story.extend(workflow_box('Workflow 2: Attrition Prediction', [
    'AI Model Ingests Employee Data', 'Risk Scores Calculated per Employee',
    'High-Risk Profiles Flagged', 'Manager Notified with Insights',
    'Retention Action Plan Suggested', 'Manager Initiates Intervention',
    'Follow-Up Tracking Activated', 'Model Retrained with Outcomes'
]))
story.append(Spacer(1, 6))
story.extend(workflow_box('Workflow 3: Custom Report Creation', [
    'User Selects Data Source', 'Choose Dimensions & Metrics',
    'Apply Filters & Date Range', 'Preview Report Output',
    'Configure Visualization Type', 'Save Report Template',
    'Set Sharing Permissions', 'Publish or Schedule'
]))
story.append(Spacer(1, 10))

story.append(P('<b>8.3 Role Access Matrix</b>', h2_style))
m8_access = {
    'Super Admin': {'Dashboards': 'Full', 'Custom Reports': 'Full', 'Predictive': 'Full', 'Export': 'Full', 'Scheduling': 'Full', 'Benchmarking': 'Full'},
    'HR Admin': {'Dashboards': 'Full', 'Custom Reports': 'Full', 'Predictive': 'Full', 'Export': 'Full', 'Scheduling': 'Full', 'Benchmarking': 'Full'},
    'Payroll Specialist': {'Dashboards': 'Payroll Only', 'Custom Reports': 'Payroll Only', 'Predictive': 'None', 'Export': 'Payroll Only', 'Scheduling': 'Payroll Only', 'Benchmarking': 'None'},
    'Department Manager': {'Dashboards': 'Team Only', 'Custom Reports': 'Team Only', 'Predictive': 'Team Only', 'Export': 'Team Only', 'Scheduling': 'Team Only', 'Benchmarking': 'None'},
    'Employee': {'Dashboards': 'None', 'Custom Reports': 'None', 'Predictive': 'None', 'Export': 'None', 'Scheduling': 'None', 'Benchmarking': 'None'},
    'Recruiter': {'Dashboards': 'Recruitment Only', 'Custom Reports': 'Recruitment Only', 'Predictive': 'None', 'Export': 'Recruitment Only', 'Scheduling': 'Recruitment Only', 'Benchmarking': 'None'},
    'L&D Manager': {'Dashboards': 'L&D Only', 'Custom Reports': 'L&D Only', 'Predictive': 'None', 'Export': 'L&D Only', 'Scheduling': 'L&D Only', 'Benchmarking': 'None'},
}
story.append(make_role_matrix(m8_access))
story.append(Spacer(1, 18))


# ═══════════════════════════════════════
# MODULE 9: Employee Self-Service & Collaboration
# ═══════════════════════════════════════
story.extend(add_section('9. Employee Self-Service & Collaboration', h1_style, level=0))

story.append(P('The ESS module empowers employees with self-service capabilities for common HR tasks, while the collaboration features enable seamless communication, team coordination, and knowledge sharing across the organization.', body_style))

story.append(P('<b>9.1 Features List</b>', h2_style))
for f in [
    'Employee Self-Service Portal (Profile, Documents, Requests)',
    'Manager Self-Service (Team Actions, Approvals)',
    'Company Announcement Board',
    'Team Calendar & Event Management',
    'Employee Directory with Org Chart Navigation',
    'Help Desk & Ticket System (HR Queries)',
    'AI Chatbot for HR Policy Queries',
    'Document Request & Verification',
    'Service Certificate Generation',
    'Peer Recognition & Rewards Program',
    'Survey & Poll Management',
    'Discussion Forums & Knowledge Sharing',
    'Meeting Room Booking System',
    'Mobile App with Full ESS Features',
    'Push Notifications & Communication Hub',
]:
    story.append(P('- ' + f, bullet_style))
story.append(Spacer(1, 8))

story.append(P('<b>9.2 Configured Workflows</b>', h2_style))
story.extend(workflow_box('Workflow 1: HR Help Desk Ticket', [
    'Employee Submits Ticket', 'AI Categorizes & Routes',
    'Assigned to HR Team Member', 'Agent Investigates Issue',
    'Resolution Proposed', 'Employee Confirms/Rejects',
    'Ticket Closed & Rated', 'Knowledge Base Updated'
]))
story.append(Spacer(1, 6))
story.extend(workflow_box('Workflow 2: Peer Recognition', [
    'Employee Nominates Peer', 'Selects Recognition Category',
    'Adds Appreciation Message', 'Manager Endorses (Optional)',
    'Recognition Posted on Wall', 'Points/Credits Awarded',
    'Monthly Leaderboard Updated', 'Quarterly Rewards Processed'
]))
story.append(Spacer(1, 6))
story.extend(workflow_box('Workflow 3: Document Request', [
    'Employee Requests Document', 'System Validates Eligibility',
    'Auto-Generated if Template-Based', 'HR Reviews if Manual Required',
    'Manager Approval if Needed', 'Document Prepared & Uploaded',
    'Employee Downloads Document', 'Request Archived'
]))
story.append(Spacer(1, 10))

story.append(P('<b>9.3 Role Access Matrix</b>', h2_style))
m9_access = {
    'Super Admin': {'Self-Service': 'Full', 'Announcements': 'Full', 'Help Desk': 'Full', 'Recognition': 'Full', 'Directory': 'Full', 'Surveys': 'Full'},
    'HR Admin': {'Self-Service': 'Full', 'Announcements': 'Full', 'Help Desk': 'Full', 'Recognition': 'Full', 'Directory': 'Full', 'Surveys': 'Full'},
    'Payroll Specialist': {'Self-Service': 'Self Only', 'Announcements': 'Read', 'Help Desk': 'Self Only', 'Recognition': 'Participate', 'Directory': 'Read', 'Surveys': 'Participate'},
    'Department Manager': {'Self-Service': 'Team Only', 'Announcements': 'Create', 'Help Desk': 'Team Only', 'Recognition': 'Endorse', 'Directory': 'Full', 'Surveys': 'Create'},
    'Employee': {'Self-Service': 'Self Only', 'Announcements': 'Read', 'Help Desk': 'Self Only', 'Recognition': 'Participate', 'Directory': 'Read', 'Surveys': 'Participate'},
    'Recruiter': {'Self-Service': 'Self Only', 'Announcements': 'Read', 'Help Desk': 'Self Only', 'Recognition': 'Participate', 'Directory': 'Read', 'Surveys': 'Participate'},
    'L&D Manager': {'Self-Service': 'Self Only', 'Announcements': 'Create', 'Help Desk': 'Self Only', 'Recognition': 'Participate', 'Directory': 'Read', 'Surveys': 'Create'},
}
story.append(make_role_matrix(m9_access))
story.append(Spacer(1, 24))


# ═══════════════════════════════════════
# CROSS-MODULE WORKFLOWS
# ═══════════════════════════════════════
story.extend(add_section('10. Cross-Module Workflows', h1_style, level=0))

story.append(P('Cross-module workflows span multiple HRMS modules to enable end-to-end business processes that require coordination across different functional areas. These workflows ensure data consistency, eliminate manual handoffs, and provide unified employee experiences.', body_style))

# Employee Lifecycle
story.append(P('<b>10.1 Employee Lifecycle Workflow</b>', h2_style))
story.append(P('This workflow tracks the complete journey of an employee from candidate to alumni, spanning Modules 3 (Recruitment), 1 (Core HR), 4 (Attendance), 5 (Payroll), 6 (Performance), 7 (L&D), and 9 (ESS).', body_style))
story.extend(workflow_box('Complete Employee Lifecycle', [
    'Recruitment (Module 3)', 'Onboarding (Module 1)',
    'Probation Confirmation (Module 1)', 'Attendance Tracking (Module 4)',
    'Performance Reviews (Module 6)', 'Learning & Development (Module 7)',
    'Payroll Processing (Module 5)', 'Separation & Alumni (Module 1)'
]))
story.append(Spacer(1, 12))

# Approval Hierarchy
story.append(P('<b>10.2 Approval Hierarchy Workflow</b>', h2_style))
story.append(P('A unified approval framework that applies across all modules for consistent governance. Any request (leave, expense, transfer, training) follows this standardized hierarchy.', body_style))
story.extend(workflow_box('Unified Approval Hierarchy', [
    'Employee Initiates Request', 'System Validates Against Policy (AI)',
    'Auto-Approve if Within Threshold', 'Route to Direct Manager',
    'Escalate to Department Head if Exceeds Limit', 'HR Review for Compliance',
    'Finance Approval if Budget Impact', 'Action Executed & Stakeholders Notified'
]))
story.append(Spacer(1, 12))

# Notification System
story.append(P('<b>10.3 Notification System Workflow</b>', h2_style))
story.append(P('The notification system provides real-time, context-aware communications across all modules, ensuring stakeholders are informed at every critical juncture.', body_style))
story.extend(workflow_box('Notification Dispatch', [
    'Event Triggered in Any Module', 'Notification Engine Evaluates Rules',
    'Determine Recipients by Role & Context', 'Select Channel (Email/Push/SMS/In-App)',
    'Personalize Message Content', 'Schedule Based on Urgency',
    'Deliver Notification', 'Track Delivery & Read Receipts'
]))
story.append(Spacer(1, 24))


# ═══════════════════════════════════════
# COMPLETE ROLE-MODULE ACCESS MATRIX
# ═══════════════════════════════════════
story.extend(add_section('11. Complete Role-Module Access Matrix', h1_style, level=0))

story.append(P('The following matrix provides a consolidated view of access levels for all 7 roles across all 9 modules. Access levels are: <b>Full</b> (complete read/write/admin), <b>Read</b> (view only), <b>Limited</b> (role-specific partial access), <b>None</b> (no access).', body_style))
story.append(Spacer(1, 10))

modules = [
    'Core HR', 'RBAC & Security', 'Talent Acquisition',
    'Time & Attendance', 'Payroll & Expense', 'Performance & Talent',
    'Learning & Development', 'Analytics & Reporting', 'ESS & Collaboration'
]
roles = ['Super Admin', 'HR Admin', 'Payroll Specialist', 'Dept. Manager', 'Employee', 'Recruiter', 'L&D Manager']

access_data = {
    'Core HR':               ['Full', 'Full', 'Read',  'Limited', 'Self', 'Limited', 'Read'],
    'RBAC & Security':       ['Full', 'Limited','None', 'None',    'Self', 'None',    'None'],
    'Talent Acquisition':    ['Full', 'Full',  'None',  'Limited', 'None', 'Full',    'Read'],
    'Time & Attendance':     ['Full', 'Full',  'Read',  'Limited', 'Self', 'None',    'Read'],
    'Payroll & Expense':     ['Full', 'Full',  'Full',  'Limited', 'Self', 'Self',    'Self'],
    'Performance & Talent':  ['Full', 'Full',  'None',  'Limited', 'Self', 'None',    'Read'],
    'Learning & Development':['Full', 'Full',  'None',  'Limited', 'Self', 'Read',    'Full'],
    'Analytics & Reporting': ['Full', 'Full',  'Limited','Limited','None', 'Limited', 'Limited'],
    'ESS & Collaboration':   ['Full', 'Full',  'Self',  'Limited', 'Self', 'Self',    'Self'],
}

headers_rm = ['Module'] + roles
col_widths_rm = [AVAILABLE_W * 0.18] + [AVAILABLE_W * 0.82 / len(roles)] * len(roles)

data_rm = [[HP(h) for h in headers_rm]]
for mod in modules:
    row = [CLP(mod)]
    for i, role in enumerate(roles):
        val = access_data[mod][i]
        row.append(CP(val, cell_small_style))
    data_rm.append(row)

rm_table = Table(data_rm, colWidths=col_widths_rm, hAlign='CENTER')
rm_style_cmds = [
    ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
    ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 5),
    ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#edeff0')),
]
for i in range(1, len(data_rm)):
    bg = TABLE_ROW_ODD if i % 2 == 0 else TABLE_ROW_EVEN
    rm_style_cmds.append(('BACKGROUND', (1, i), (-1, i), bg))
rm_table.setStyle(TableStyle(rm_style_cmds))

story.append(rm_table)
story.append(P('Table 1: Complete Role-Module Access Matrix (7 Roles x 9 Modules)', caption_style))
story.append(Spacer(1, 24))


# ═══════════════════════════════════════
# WORKFLOW CONFIGURATION GUIDE
# ═══════════════════════════════════════
story.extend(add_section('12. Workflow Configuration Guide', h1_style, level=0))

story.append(P('This guide provides administrators with the framework for configuring, customizing, and managing workflows across the AI-HRMS platform.', body_style))

story.append(P('<b>12.1 Workflow Configuration Principles</b>', h2_style))
for f in [
    '<b>Principle of Least Privilege:</b> Workflows should only grant access and trigger actions necessary for the specific business process.',
    '<b>Fail-Safe Design:</b> Every workflow must have timeout handling, escalation paths, and rollback mechanisms.',
    '<b>Audit-First Approach:</b> All workflow state transitions must be logged with timestamp, actor, and reason.',
    '<b>AI-Assisted Routing:</b> Leverage the AI engine for intelligent routing, policy validation, and anomaly detection at each workflow step.',
    '<b>Modular Composition:</b> Complex workflows should be composed from reusable sub-workflows for maintainability.',
]:
    story.append(P('- ' + f, bullet_style))
story.append(Spacer(1, 10))

story.append(P('<b>12.2 Workflow Configuration Parameters</b>', h2_style))
config_headers = ['Parameter', 'Description', 'Example']
config_rows = [
    ['Trigger Event', 'The event that initiates the workflow', 'Employee submits leave request'],
    ['Participants', 'Roles/users involved in the workflow', 'Employee, Manager, HR Admin'],
    ['Steps', 'Sequential actions in the workflow', 'Submit > Validate > Approve > Execute'],
    ['Conditions', 'Business rules evaluated at each step', 'Leave balance > 0, Probation completed'],
    ['Timeout', 'Maximum time before escalation', '48 hours for manager approval'],
    ['Escalation', 'Action when timeout is reached', 'Auto-escalate to Department Head'],
    ['Notifications', 'Alerts sent at each transition', 'Email to manager, Push to employee'],
    ['Rollback', 'Actions if workflow is rejected', 'Restore leave balance, Notify employee'],
    ['Audit Fields', 'Data captured for compliance', 'Approver, Timestamp, Comments'],
    ['AI Integration', 'AI features within the workflow', 'Policy validation, Anomaly detection'],
]
cw = [AVAILABLE_W * 0.18, AVAILABLE_W * 0.50, AVAILABLE_W * 0.32]
story.append(make_table(config_headers, config_rows, cw))
story.append(P('Table 2: Workflow Configuration Parameters', caption_style))
story.append(Spacer(1, 14))

story.append(P('<b>12.3 Workflow Lifecycle Management</b>', h2_style))
story.extend(workflow_box('Workflow Lifecycle', [
    'Define Requirements', 'Design Workflow Steps & Rules',
    'Configure in Admin Panel', 'Test with Sample Data',
    'Stakeholder Approval', 'Deploy to Production',
    'Monitor Performance & Bottlenecks', 'Iterate & Optimize'
]))
story.append(Spacer(1, 10))

story.append(P('<b>12.4 Best Practices</b>', h2_style))
for f in [
    'Always start with a standard template before customizing workflows.',
    'Keep approval chains short - ideally no more than 3 levels.',
    'Use AI auto-approval for low-risk, policy-compliant requests to reduce bottlenecks.',
    'Set up monitoring dashboards for workflow completion rates and average processing times.',
    'Conduct quarterly workflow audits to identify unused or redundant steps.',
    'Document all custom workflows with clear business justification.',
    'Test all workflow changes in a sandbox environment before production deployment.',
    'Ensure all workflows have defined SLAs for each approval step.',
]:
    story.append(P('- ' + f, bullet_style))
story.append(Spacer(1, 14))

story.append(P('<b>12.5 Troubleshooting Common Issues</b>', h2_style))
trouble_headers = ['Issue', 'Root Cause', 'Resolution']
trouble_rows = [
    ['Workflow stuck at approval step', 'Approver inactive or unassigned', 'Set auto-escalation timeout; verify approver mapping'],
    ['Incorrect data passed between steps', 'Field mapping misconfiguration', 'Validate field bindings in workflow designer'],
    ['Duplicate notifications sent', 'Multiple trigger rules active', 'Audit notification rules; consolidate duplicates'],
    ['AI validation producing false rejections', 'Overly strict policy rules', 'Review AI model confidence thresholds; add exceptions'],
    ['Workflow not visible to user', 'Role permission gap', 'Check RBAC module for workflow access assignment'],
]
tw = [AVAILABLE_W * 0.25, AVAILABLE_W * 0.35, AVAILABLE_W * 0.40]
story.append(make_table(trouble_headers, trouble_rows, tw))
story.append(P('Table 3: Common Workflow Issues and Resolutions', caption_style))

# ============================================================
# BUILD
# ============================================================
doc.multiBuild(story)
print(f"Body PDF generated: {output_path}")
