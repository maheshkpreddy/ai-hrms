#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# eh2r AI HRMS - Training Video Generation & Upload Script
# ─────────────────────────────────────────────────────────────────────────────
# This script creates the directory structure for training videos,
# documents the recording workflow, and provides instructions for
# recording and uploading videos to GitHub.
#
# Usage:
#   bash scripts/generate-training-videos.sh          # Create directory structure
#   bash scripts/generate-training-videos.sh --record  # Show recording instructions
#   bash scripts/generate-training-videos.sh --upload  # Upload videos to GitHub
# ─────────────────────────────────────────────────────────────────────────────

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VIDEOS_DIR="$PROJECT_ROOT/docs/training/videos"
SCRIPTS_DIR="$PROJECT_ROOT/docs/training"

# ─── Directory Structure ─────────────────────────────────────────────────────

create_directory_structure() {
    echo -e "${BLUE}Creating training video directory structure...${NC}"
    
    # Category directories
    mkdir -p "$VIDEOS_DIR/dashboard"
    mkdir -p "$VIDEOS_DIR/employees"
    mkdir -p "$VIDEOS_DIR/attendance"
    mkdir -p "$VIDEOS_DIR/leave"
    mkdir -p "$VIDEOS_DIR/payroll"
    mkdir -p "$VIDEOS_DIR/recruitment"
    mkdir -p "$VIDEOS_DIR/performance"
    mkdir -p "$VIDEOS_DIR/learning"
    mkdir -p "$VIDEOS_DIR/self-service"
    mkdir -p "$VIDEOS_DIR/ai"
    
    # Thumbnails directory
    mkdir -p "$VIDEOS_DIR/thumbnails"
    
    echo -e "${GREEN}✓ Directory structure created at $VIDEOS_DIR${NC}"
    echo ""
    echo "Directory structure:"
    echo "  docs/training/videos/"
    echo "  ├── dashboard/        # Dashboard & Navigation videos"
    echo "  │   ├── dash-1.mp4    # Getting Started with eh2r AI Dashboard"
    echo "  │   ├── dash-2.mp4    # Admin Dashboard Deep Dive"
    echo "  │   └── dash-3.mp4    # Customizing Your Dashboard Layout"
    echo "  ├── employees/        # Employee Management videos"
    echo "  │   ├── emp-1.mp4     # Adding & Onboarding New Employees"
    echo "  │   ├── emp-2.mp4     # Managing Employee Records & Documents"
    echo "  │   └── emp-3.mp4     # Department & Team Structure Setup"
    echo "  ├── attendance/       # Time & Attendance videos"
    echo "  │   ├── att-1.mp4     # Setting Up Shifts & Work Schedules"
    echo "  │   ├── att-2.mp4     # Daily Attendance Tracking & Check-In"
    echo "  │   └── att-3.mp4     # Holiday Calendar & Leave Policies"
    echo "  ├── leave/            # Leave Management videos"
    echo "  │   ├── leave-1.mp4   # Applying for Leave & Tracking Balances"
    echo "  │   └── leave-2.mp4   # Leave Approval Workflow & Policies"
    echo "  ├── payroll/          # Payroll & Expenses videos"
    echo "  │   ├── pay-1.mp4     # Processing Monthly Payroll"
    echo "  │   ├── pay-2.mp4     # Expense Claims & Reimbursements"
    echo "  │   └── pay-3.mp4     # Tax Configuration & Compliance Reports"
    echo "  ├── recruitment/      # Recruitment & Talent videos"
    echo "  │   ├── rec-1.mp4     # Creating Job Postings & Sourcing"
    echo "  │   ├── rec-2.mp4     # Interview Scheduling & Evaluation"
    echo "  │   └── rec-3.mp4     # AI-Powered Candidate Screening"
    echo "  ├── performance/      # Performance Management videos"
    echo "  │   ├── perf-1.mp4    # Setting Up Performance Review Cycles"
    echo "  │   └── perf-2.mp4    # Goals, OKRs & Continuous Feedback"
    echo "  ├── learning/         # Learning & Development videos"
    echo "  │   ├── ld-1.mp4      # Creating Courses & Learning Paths"
    echo "  │   └── ld-2.mp4      # Certifications & Skill Tracking"
    echo "  ├── self-service/     # Self-Service Portal videos"
    echo "  │   ├── ss-1.mp4      # Employee Self-Service Overview"
    echo "  │   └── ss-2.mp4      # Using the AI HR Assistant"
    echo "  ├── ai/               # AI Features videos"
    echo "  │   ├── ai-1.mp4      # Introduction to eh2r AI Capabilities"
    echo "  │   ├── ai-2.mp4      # AI Analytics & Predictive Insights"
    echo "  │   └── ai-3.mp4      # Automating HR Workflows with AI"
    echo "  └── thumbnails/       # Video thumbnails/posters"
    echo ""
}

# ─── Recording Instructions ──────────────────────────────────────────────────

show_recording_instructions() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}         TRAINING VIDEO RECORDING INSTRUCTIONS${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}Prerequisites:${NC}"
    echo "  • OBS Studio (https://obsproject.com/) or Loom (https://www.loom.com/)"
    echo "  • Microphone for voiceover narration"
    echo "  • eh2r AI HRMS running at https://ai-hrms-rho.vercel.app"
    echo "  • Test credentials: admin@marqai.com / admin123 / Company Code: MARQ"
    echo ""
    echo -e "${YELLOW}Recording Settings:${NC}"
    echo "  • Resolution: 1920x1080 (Full HD) or 1280x720 (HD minimum)"
    echo "  • Frame rate: 30fps"
    echo "  • Format: MP4 with H.264 video codec and AAC audio"
    echo "  • Bitrate: 5-10 Mbps for 1080p, 2.5-5 Mbps for 720p"
    echo "  • Audio: Clear voiceover, 44.1kHz or 48kHz, mono or stereo"
    echo "  • File size: Keep under 100MB per video for reliable GitHub hosting"
    echo ""
    echo -e "${YELLOW}Recording Workflow:${NC}"
    echo "  1. Read the script from docs/training/TRAINING_VIDEO_SCRIPTS.md"
    echo "  2. Open eh2r AI HRMS and log in with the appropriate role"
    echo "  3. Start screen recording with OBS/Loom"
    echo "  4. Follow the script — narrate each step while performing actions on screen"
    echo "  5. Pause briefly between sections to allow viewers to follow along"
    echo "  6. End with a summary/recap of what was covered"
    echo "  7. Stop recording and export as MP4"
    echo "  8. Review the recording for quality — redo if necessary"
    echo ""
    echo -e "${YELLOW}OBS Studio Quick Setup:${NC}"
    echo "  1. Install OBS Studio from https://obsproject.com/"
    echo "  2. Set up a new Scene with 'Display Capture' or 'Window Capture'"
    echo "  3. Add an Audio Input Capture for your microphone"
    echo "  4. Settings → Output → Recording Format: mkv (convert to mp4 later)"
    echo "  5. Settings → Video → Base Resolution: 1920x1080"
    echo "  6. Settings → Video → Output (Scaled) Resolution: 1920x1080"
    echo "  7. Settings → Output → Rate Control: CBR, Bitrate: 8000 Kbps"
    echo ""
    echo -e "${YELLOW}Video Naming Convention:${NC}"
    echo "  Files must match the IDs in HelpTraining.tsx:"
    echo "  • Dashboard: dash-1.mp4, dash-2.mp4, dash-3.mp4"
    echo "  • Employees: emp-1.mp4, emp-2.mp4, emp-3.mp4"
    echo "  • Attendance: att-1.mp4, att-2.mp4, att-3.mp4"
    echo "  • Leave: leave-1.mp4, leave-2.mp4"
    echo "  • Payroll: pay-1.mp4, pay-2.mp4, pay-3.mp4"
    echo "  • Recruitment: rec-1.mp4, rec-2.mp4, rec-3.mp4"
    echo "  • Performance: perf-1.mp4, perf-2.mp4"
    echo "  • Learning: ld-1.mp4, ld-2.mp4"
    echo "  • Self-Service: ss-1.mp4, ss-2.mp4"
    echo "  • AI Features: ai-1.mp4, ai-2.mp4, ai-3.mp4"
    echo ""
}

# ─── Upload Instructions ─────────────────────────────────────────────────────

show_upload_instructions() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}         VIDEO UPLOAD INSTRUCTIONS${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}Step 1: Convert to MP4 (if needed)${NC}"
    echo "  If you recorded in MKV format with OBS, convert to MP4:"
    echo '  ffmpeg -i input.mkv -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k output.mp4'
    echo ""
    echo -e "${YELLOW}Step 2: Optimize for web playback${NC}"
    echo "  Compress the video for fast streaming:"
    echo '  ffmpeg -i input.mp4 -c:v libx264 -preset medium -crf 28 -vf "scale=1280:720" -c:a aac -b:a 96k -movflags +faststart output_optimized.mp4'
    echo ""
    echo -e "${YELLOW}Step 3: Generate thumbnail/poster${NC}"
    echo "  Create a thumbnail from the video at 5 seconds:"
    echo '  ffmpeg -i input.mp4 -ss 00:00:05 -vframes 1 -q:v 2 thumbnail.jpg'
    echo ""
    echo -e "${YELLOW}Step 4: Move videos to the correct directory${NC}"
    echo "  Place each video in the correct category directory:"
    echo "  cp dash-1.mp4 docs/training/videos/dashboard/"
    echo "  cp emp-1.mp4 docs/training/videos/employees/"
    echo "  etc."
    echo ""
    echo -e "${YELLOW}Step 5: Upload to GitHub${NC}"
    echo "  Videos are served via GitHub raw content URLs:"
    echo "  https://raw.githubusercontent.com/maheshkpreddy/ai-hrms/main/docs/training/videos/{category}/{video-id}.mp4"
    echo ""
    echo "  Upload using Git LFS (recommended for files >50MB):"
    echo "  git lfs install"
    echo "  git lfs track '*.mp4'"
    echo "  git add .gitattributes"
    echo "  git add docs/training/videos/"
    echo '  git commit -m "Add training videos"'
    echo "  git push origin main"
    echo ""
    echo -e "${YELLOW}Alternative: Upload via GitHub Web Interface${NC}"
    echo "  1. Go to https://github.com/maheshkpreddy/ai-hrms"
    echo "  2. Navigate to docs/training/videos/{category}/"
    echo "  3. Click 'Add file' → 'Upload files'"
    echo "  4. Drag and drop the MP4 files"
    echo "  5. Commit with message 'Add training videos for {category}'"
    echo ""
    echo -e "${YELLOW}Step 6: Verify playback${NC}"
    echo "  1. Open the eh2r AI HRMS app"
    echo "  2. Navigate to Help & Training → Training Videos"
    echo "  3. Click on the video card to open the player"
    echo "  4. Switch to 'Video' mode"
    echo "  5. Verify the video plays correctly"
    echo ""
}

# ─── Generate Placeholders ───────────────────────────────────────────────────

generate_placeholders() {
    echo -e "${BLUE}Generating placeholder README files in video directories...${NC}"
    
    # Dashboard
    cat > "$VIDEOS_DIR/dashboard/README.md" << 'EOF'
# Dashboard & Navigation Training Videos

- `dash-1.mp4` - Getting Started with eh2r AI Dashboard (8:24)
- `dash-2.mp4` - Admin Dashboard Deep Dive (12:15)
- `dash-3.mp4` - Customizing Your Dashboard Layout (6:42)

Record and upload videos following the instructions in `scripts/generate-training-videos.sh`.
EOF

    # Employees
    cat > "$VIDEOS_DIR/employees/README.md" << 'EOF'
# Employee Management Training Videos

- `emp-1.mp4` - Adding & Onboarding New Employees (10:30)
- `emp-2.mp4` - Managing Employee Records & Documents (9:15)
- `emp-3.mp4` - Department & Team Structure Setup (7:50)

Record and upload videos following the instructions in `scripts/generate-training-videos.sh`.
EOF

    # Attendance
    cat > "$VIDEOS_DIR/attendance/README.md" << 'EOF'
# Time & Attendance Training Videos

- `att-1.mp4` - Setting Up Shifts & Work Schedules (11:05)
- `att-2.mp4` - Daily Attendance Tracking & Check-In (6:18)
- `att-3.mp4` - Holiday Calendar & Leave Policies (8:33)

Record and upload videos following the instructions in `scripts/generate-training-videos.sh`.
EOF

    # Leave
    cat > "$VIDEOS_DIR/leave/README.md" << 'EOF'
# Leave Management Training Videos

- `leave-1.mp4` - Applying for Leave & Tracking Balances (5:45)
- `leave-2.mp4` - Leave Approval Workflow & Policies (7:22)

Record and upload videos following the instructions in `scripts/generate-training-videos.sh`.
EOF

    # Payroll
    cat > "$VIDEOS_DIR/payroll/README.md" << 'EOF'
# Payroll & Expenses Training Videos

- `pay-1.mp4` - Processing Monthly Payroll (14:10)
- `pay-2.mp4` - Expense Claims & Reimbursements (8:55)
- `pay-3.mp4` - Tax Configuration & Compliance Reports (11:30)

Record and upload videos following the instructions in `scripts/generate-training-videos.sh`.
EOF

    # Recruitment
    cat > "$VIDEOS_DIR/recruitment/README.md" << 'EOF'
# Recruitment & Talent Training Videos

- `rec-1.mp4` - Creating Job Postings & Sourcing (9:40)
- `rec-2.mp4` - Interview Scheduling & Evaluation (10:15)
- `rec-3.mp4` - AI-Powered Candidate Screening (7:50)

Record and upload videos following the instructions in `scripts/generate-training-videos.sh`.
EOF

    # Performance
    cat > "$VIDEOS_DIR/performance/README.md" << 'EOF'
# Performance Management Training Videos

- `perf-1.mp4` - Setting Up Performance Review Cycles (11:20)
- `perf-2.mp4` - Goals, OKRs & Continuous Feedback (8:45)

Record and upload videos following the instructions in `scripts/generate-training-videos.sh`.
EOF

    # Learning
    cat > "$VIDEOS_DIR/learning/README.md" << 'EOF'
# Learning & Development Training Videos

- `ld-1.mp4` - Creating Courses & Learning Paths (10:55)
- `ld-2.mp4` - Certifications & Skill Tracking (7:30)

Record and upload videos following the instructions in `scripts/generate-training-videos.sh`.
EOF

    # Self-Service
    cat > "$VIDEOS_DIR/self-service/README.md" << 'EOF'
# Self-Service Portal Training Videos

- `ss-1.mp4` - Employee Self-Service Overview (6:20)
- `ss-2.mp4` - Using the AI HR Assistant (5:10)

Record and upload videos following the instructions in `scripts/generate-training-videos.sh`.
EOF

    # AI
    cat > "$VIDEOS_DIR/ai/README.md" << 'EOF'
# AI Features Training Videos

- `ai-1.mp4` - Introduction to eh2r AI Capabilities (9:00)
- `ai-2.mp4` - AI Analytics & Predictive Insights (12:35)
- `ai-3.mp4` - Automating HR Workflows with AI (10:45)

Record and upload videos following the instructions in `scripts/generate-training-videos.sh`.
EOF

    echo -e "${GREEN}✓ README files created in each video directory${NC}"
}

# ─── Main ─────────────────────────────────────────────────────────────────────

echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  eh2r AI HRMS - Training Video Setup Script${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

case "${1:-}" in
    --record)
        show_recording_instructions
        ;;
    --upload)
        show_upload_instructions
        ;;
    --all)
        create_directory_structure
        generate_placeholders
        show_recording_instructions
        show_upload_instructions
        ;;
    *)
        create_directory_structure
        generate_placeholders
        echo ""
        echo -e "${YELLOW}Tip: Use --record for recording instructions, --upload for upload instructions${NC}"
        echo -e "${YELLOW}     Use --all to see everything${NC}"
        ;;
esac

echo ""
echo -e "${GREEN}Done! See docs/training/TRAINING_VIDEO_SCRIPTS.md for full video scripts.${NC}"
