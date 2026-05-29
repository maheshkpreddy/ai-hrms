# Task: Training Video System Overhaul

## Summary
Updated the eh2r AI HRMS training video system with dual-mode player, video URLs for all tutorials, video generation scripts, and comprehensive video scripts.

## Changes Made

### 1. HelpTraining.tsx - Major Update
- **Interface**: Added `videoUrl?: string` and `thumbnailUrl?: string` to `VideoTutorial` interface
- **Data**: Added `videoUrl` to all 24 video entries pointing to GitHub raw content URLs
- **Player**: Rewrote `TutorialPlayerDialog` with dual-mode support:
  - **Video Mode** (default if videoUrl exists): HTML5 `<video>` player with controls, rounded container, fullscreen support, chapters section below video
  - **Tutorial Mode** (existing step-by-step): Preserved all existing functionality
  - Mode toggle in title bar (Video/Tutorial buttons)
  - Video error fallback with "Switch to Tutorial Mode" button
  - Chapters section with clickable step items and current chapter highlighting
  - "Watch Video Instead" link on tutorial start screen when video is available
- **VideoCard**: Added video indicator badge (HD badge) when videoUrl exists, shows "Video" instead of step count
- **Learning Progress sidebar**: Added "Video Tutorials" count
- **Pro Tips**: Updated with tip about Video/Tutorial toggle
- **New imports**: `useRef`, `Maximize`, `Video`, `List`, `MonitorPlay`, `RotateCcw`

### 2. Video URLs Pattern
All 24 videos use the pattern:
`https://raw.githubusercontent.com/maheshkpreddy/ai-hrms/main/docs/training/videos/{category-slug}/{video-id}.mp4`

Category slugs: dashboard, employees, attendance, leave, payroll, recruitment, performance, learning, self-service, ai

### 3. scripts/generate-training-videos.sh
- Creates directory structure for all 10 video categories
- Creates thumbnails directory
- Generates README files in each category directory
- Provides recording instructions (--record flag)
- Provides upload instructions (--upload flag)
- Documents OBS Studio setup, naming conventions, and video optimization

### 4. docs/training/TRAINING_VIDEO_SCRIPTS.md
- Complete scripts for all 26 videos (was only 6 before)
- Each script includes: Title, Video ID, Category, Target Audience, Duration
- Each section includes: Voiceover narration, Screen actions, Key points
- Follows consistent format: Introduction → Main Content → Summary/Recap
- Covers all categories: Dashboard, Employees, Attendance, Leave, Payroll, Recruitment, Performance, Learning, Self-Service, AI Features

## Files Modified
- `/home/z/my-project/src/components/hrms/HelpTraining.tsx` - Major update with dual-mode player
- `/home/z/my-project/docs/training/TRAINING_VIDEO_SCRIPTS.md` - Complete rewrite with 26 scripts
- `/home/z/my-project/scripts/generate-training-videos.sh` - New file

## No Lint Errors
- Zero lint errors from our changes
- Pre-existing errors in ThemeProvider.tsx and app-store.ts remain
