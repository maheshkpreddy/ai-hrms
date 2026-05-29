# eh2r AI Training Videos

This directory contains training videos for the eh2r AI HRMS platform. Videos are hosted via GitHub raw content and played directly in the Help & Training section of the software.

## Available Videos

| Video File | Title | Category | Duration |
|-----------|-------|----------|----------|
| `getting-started-dashboard.mp4` | Getting Started with eh2r AI Dashboard | Dashboard & Navigation | 8:24 |
| `admin-dashboard-deep-dive.mp4` | Admin Dashboard Deep Dive | Dashboard & Navigation | 12:15 |
| `employee-onboarding.mp4` | Adding & Onboarding New Employees | Employee Management | 10:30 |
| `time-and-attendance.mp4` | Setting Up Shifts & Work Schedules | Time & Attendance | 11:05 |
| `payroll-and-expenses.mp4` | Processing Monthly Payroll | Payroll & Expenses | 14:10 |
| `recruitment-and-talent.mp4` | Creating Job Postings & Sourcing | Recruitment & Talent | 9:40 |
| `performance-management.mp4` | Setting Up Performance Review Cycles | Performance Management | 11:20 |
| `ai-features-overview.mp4` | Introduction to eh2r AI Capabilities | AI Features | 9:00 |
| `rbac-and-security.mp4` | RBAC & Security - Roles and Permissions | RBAC & Security | 15:30 |
| `multi-tenant-security.mp4` | Multi-Tenant Security & Data Isolation | RBAC & Security | 10:45 |
| `audit-compliance.mp4` | Audit Logs & Compliance Monitoring | RBAC & Security | 8:20 |

## Video Access URL Pattern

Videos are accessed via GitHub raw content URLs:
```
https://raw.githubusercontent.com/maheshkpreddy/ai-hrms/main/docs/training/videos/{filename}.mp4
```

## Adding New Videos

1. Record the training video showing the eh2r AI software screens with voiceover
2. Export as MP4 format (H.264 codec recommended for browser compatibility)
3. Keep file size under 100MB for reliable GitHub hosting
4. Name the file using kebab-case (e.g., `time-and-attendance.mp4`)
5. Upload to this directory
6. Update the `videoTutorials` array in `src/components/hrms/HelpTraining.tsx` with the new video entry

## Video Recording Guidelines

- Resolution: 1920x1080 (Full HD) or 1280x720 (HD)
- Frame rate: 30fps
- Audio: Clear voiceover explaining each step
- Format: MP4 with H.264 video and AAC audio
- Duration: 5-15 minutes per video
- Content: Show the actual eh2r AI interface while explaining each feature
