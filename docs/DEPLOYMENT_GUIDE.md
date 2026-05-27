# AI-HRMS — Complete Deployment Guide

> **Step-by-step guide** to deploying AI-HRMS to production on Vercel with GitHub Actions CI/CD.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [GitHub Repository Setup](#2-github-repository-setup)
3. [Pushing Code to GitHub](#3-pushing-code-to-github)
4. [Vercel Project Creation](#4-vercel-project-creation)
5. [Environment Variable Configuration](#5-environment-variable-configuration)
6. [Custom Domain Setup](#6-custom-domain-setup)
7. [SSL / HTTPS](#7-ssl--https)
8. [Monitoring and Logs](#8-monitoring-and-logs)
9. [Rollback Procedures](#9-rollback-procedures)
10. [Scaling Considerations](#10-scaling-considerations)
11. [Cost Estimation](#11-cost-estimation)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Prerequisites

Before deploying, ensure you have the following:

| Requirement | Version | Notes |
|------------|---------|-------|
| **GitHub Account** | — | Free or Organization account |
| **Vercel Account** | — | [Sign up](https://vercel.com/signup) (free tier works) |
| **Node.js** | ≥ 20 | [Download](https://nodejs.org/) |
| **Bun** | ≥ 1.1 | [Install](https://bun.sh/docs/installation) |
| **Git** | ≥ 2.40 | Pre-installed on most systems |
| **Domain name** (optional) | — | For custom domain (e.g., `hrms.yourcompany.com`) |
| **PostgreSQL database** (recommended) | ≥ 15 | For production (use Vercel Postgres, Supabase, Neon, or Railway) |

### Recommended Database Providers

| Provider | Free Tier | Best For |
|----------|-----------|----------|
| [Vercel Postgres](https://vercel.com/storage/postgres) | 256 MB | Easiest integration |
| [Neon](https://neon.tech/) | 0.5 GB | Serverless, auto-scaling |
| [Supabase](https://supabase.com/) | 500 MB | Extra features (auth, storage) |
| [Railway](https://railway.app/) | $5 credit | Simple setup |

---

## 2. GitHub Repository Setup

### 2.1 Create a New Repository

1. Navigate to [github.com/new](https://github.com/new)
2. Fill in the details:
   - **Repository name**: `ai-hrms`
   - **Description**: `AI-Powered Human Resource Management System — Next.js 16`
   - **Visibility**: Private (recommended for HR data) or Public
   - **Initialize**: Do **NOT** initialize with README (we already have one)
3. Click **Create repository**

### 2.2 Configure Repository Settings

Navigate to **Settings → General**:

- ✅ **Features** → Check "Issues", "Projects", "Discussions"
- ✅ **Pull Requests** → Enable "Require approvals" (for team workflows)
- ✅ **Branches** → Add branch protection rule for `main`:
  - Require PR reviews before merging
  - Require status checks to pass (CI)
  - Require linear history

### 2.3 Add GitHub Secrets

Navigate to **Settings → Secrets and variables → Actions** and add:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VERCEL_TOKEN` | Vercel API token | `xxxxxx` (see Section 4) |
| `VERCEL_ORG_ID` | Vercel organization ID | `team_xxxxxx` |
| `VERCEL_PROJECT_ID` | Vercel project ID | `prj_xxxxxx` |
| `DATABASE_URL` | Production database URL | `postgresql://...` |
| `NEXTAUTH_SECRET` | NextAuth encryption key | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Production URL | `https://hrms.yourcompany.com` |
| `ZAI_API_KEY` | AI SDK API key | Your z-ai API key |

---

## 3. Pushing Code to GitHub

### 3.1 Initialize Git (if not already)

```bash
cd ai-hrms

# Initialize git repository
git init

# Stage all files
git add .

# Create initial commit
git commit -m "feat: initial commit — AI-HRMS v0.1.0"
```

### 3.2 Connect to Remote

```bash
# Add remote origin
git remote add origin https://github.com/your-org/ai-hrms.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3.3 Verify CI Pipeline

After pushing, navigate to **Actions** tab in your GitHub repository. You should see the CI workflow running:

- ✅ Lint & Type Check
- ✅ Build
- ✅ Database Setup & Seed

---

## 4. Vercel Project Creation

### 4.1 Create a Vercel Account

If you don't have one, sign up at [vercel.com/signup](https://vercel.com/signup) using your GitHub account for easiest integration.

### 4.2 Import the Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your `ai-hrms` repository
4. Configure the project:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `./` (leave default) |
| **Build Command** | `bun run build` |
| **Install Command** | `bun install` |
| **Output Directory** | `.next` (leave default) |

5. Click **Deploy** (first deployment will fail without env vars — that's expected)

### 4.3 Get Vercel Credentials

After project creation, retrieve the IDs for GitHub Actions:

```bash
# Install Vercel CLI
bun add -g vercel@latest

# Link to your project
vercel link

# The .vercel directory will contain:
#   .vercel/project.json → orgId and projectId
```

Or find them in the Vercel Dashboard:
- **Settings → General** → Project ID
- **Organization ID** is in your account settings

### 4.4 Generate a Vercel Token

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click **Create Token**
3. Name: `GitHub Actions CI/CD`
4. Scope: **Full Account**
5. Expiration: **90 days** (or custom)
6. Copy the token and add it as `VERCEL_TOKEN` in GitHub Secrets

---

## 5. Environment Variable Configuration

### 5.1 Add Variables in Vercel Dashboard

Navigate to **Settings → Environment Variables** and add:

| Variable | Environment(s) | Value |
|----------|----------------|-------|
| `DATABASE_URL` | Production, Preview | `postgresql://user:pass@host:5432/aihrms?schema=public` |
| `NEXTAUTH_SECRET` | Production, Preview | Generated secret (see below) |
| `NEXTAUTH_URL` | Production | `https://hrms.yourcompany.com` |
| `NEXTAUTH_URL` | Preview | `https://ai-hrms-*.vercel.app` |
| `ZAI_API_KEY` | Production, Preview | Your z-ai API key |

### 5.2 Generate NEXTAUTH_SECRET

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Using Bun
bun -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 5.3 Set Up Production Database

#### Option A: Vercel Postgres

```bash
# Create a Vercel Postgres database
vercel env pull .env.local   # Pull Vercel env vars including DATABASE_URL
```

#### Option B: Neon (Recommended)

1. Sign up at [neon.tech](https://neon.tech/)
2. Create a new project
3. Copy the connection string
4. Set `DATABASE_URL` in Vercel environment variables

#### Option C: Supabase

1. Create a project at [supabase.com](https://supabase.com/)
2. Go to **Settings → Database**
3. Copy the connection string (URI format)
4. Set `DATABASE_URL` in Vercel environment variables

### 5.4 Run Migrations on Production Database

```bash
# Set the production DATABASE_URL temporarily
export DATABASE_URL="postgresql://user:pass@host:5432/aihrms"

# Push schema
bunx prisma db push

# Generate Prisma Client
bunx prisma generate

# Seed the database
bun run db:seed
```

---

## 6. Custom Domain Setup

### 6.1 Add Domain in Vercel

1. Navigate to **Settings → Domains**
2. Enter your domain: `hrms.yourcompany.com`
3. Click **Add**

### 6.2 Configure DNS Records

Add the following DNS record with your domain registrar:

| Type | Name | Value |
|------|------|-------|
| `CNAME` | `hrms` | `cname.vercel-dns.com` |

For apex domains (`yourcompany.com`):

| Type | Name | Value |
|------|------|-------|
| `A` | `@` | `76.76.21.21` |

### 6.3 Verify Domain

Vercel will automatically verify DNS propagation. This may take up to 48 hours (usually minutes).

```bash
# Verify DNS propagation
dig hrms.yourcompany.com

# Or using nslookup
nslookup hrms.yourcompany.com
```

### 6.4 Update NEXTAUTH_URL

After domain verification, update the `NEXTAUTH_URL` environment variable:

```
NEXTAUTH_URL=https://hrms.yourcompany.com
```

---

## 7. SSL / HTTPS

### 7.1 Automatic SSL

Vercel automatically provisions and renews SSL certificates for all domains via **Let's Encrypt**. No additional configuration is needed.

### 7.2 Enforce HTTPS

Vercel redirects all HTTP traffic to HTTPS by default. You can also enforce this in your Next.js configuration:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
        permanent: true,
        destination: 'https://hrms.yourcompany.com/:path*',
      },
    ];
  },
};
```

### 7.3 Security Headers

Security headers are already configured in `vercel.json`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` (API) / `SAMEORIGIN` (pages)
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` (configured for Next.js)
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 8. Monitoring and Logs

### 8.1 Vercel Analytics

Enable Vercel Analytics for performance monitoring:

1. Go to **Analytics** tab in Vercel Dashboard
2. Click **Enable**
3. Web Vitals will be tracked automatically

### 8.2 Vercel Logs

- **Real-time logs**: **Deployments → [select deployment] → Runtime Logs**
- **Function logs**: Available for serverless API routes
- **Build logs**: Available for each deployment

```bash
# Stream logs via CLI
vercel logs --follow
```

### 8.3 Error Tracking with Sentry (Optional)

```bash
# Install Sentry
bun add @sentry/nextjs

# Initialize
bunx @sentry/wizard@latest -i nextjs
```

Add to your environment variables:
- `SENTRY_DSN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`

### 8.4 Uptime Monitoring

Use one of these services for external monitoring:

| Service | Free Tier | Notes |
|---------|-----------|-------|
| [Vercel Monitoring](https://vercel.com/docs/monitoring) | Included | Basic |
| [UptimeRobot](https://uptimerobot.com/) | 50 monitors | Popular, reliable |
| [Better Stack](https://betterstack.com/) | 1 monitor | Clean UI |
| [Pingdom](https://www.pingdom.com/) | Trial | Enterprise-grade |

### 8.5 Application Health Endpoint

The application provides a health check endpoint at `/api/route.ts`. Configure your monitoring service to check:

```
GET https://hrms.yourcompany.com/api
```

Expected response: `200 OK`

---

## 9. Rollback Procedures

### 9.1 Instant Rollback via Vercel Dashboard

1. Navigate to **Deployments** tab
2. Find the last working deployment
3. Click the **⋯** menu → **Promote to Production**
4. Confirm the rollback

### 9.2 Rollback via Vercel CLI

```bash
# List recent deployments
vercel ls

# Rollback to a specific deployment
vercel rollback <deployment-url>

# Or rollback to the previous deployment
vercel rollback
```

### 9.3 Rollback via Git

```bash
# Find the last good commit
git log --oneline -10

# Revert the problematic commit
git revert <commit-hash>

# Push the revert
git push origin main

# This triggers a new deployment with the reverted code
```

### 9.4 Database Rollback

For database schema changes, always use Prisma migrations:

```bash
# Create a migration
bunx prisma migrate dev --name descriptive-name

# Apply migrations in production
bunx prisma migrate deploy

# If needed, create a rollback migration
bunx prisma migrate dev --name rollback-description
```

> ⚠️ **Warning**: Never use `prisma db push` in production. Always use `prisma migrate deploy` for production database changes.

### 9.5 Emergency Procedures

If the production application is completely down:

1. **Immediate**: Rollback to last known good deployment (Section 9.1)
2. **Investigate**: Check Vercel build logs and runtime logs
3. **Fix**: Create a hotfix branch, fix the issue, and deploy
4. **Verify**: Test on preview deployment before promoting to production
5. **Post-mortem**: Document the incident and preventive measures

---

## 10. Scaling Considerations

### 10.1 Vercel Plan Limits

| Metric | Hobby (Free) | Pro ($20/mo) | Enterprise |
|--------|-------------|--------------|------------|
| Bandwidth | 100 GB | 1 TB | Custom |
| Serverless Function Duration | 10s | 60s | Custom |
| Serverless Function Invocations | Unlimited | Unlimited | Unlimited |
| Build Time | 6,000 min/mo | 30,000 min/mo | Custom |
| Concurrent Builds | 1 | 3 | Custom |
| Edge Requests | Unlimited | Unlimited | Unlimited |

### 10.2 Database Scaling

As your organization grows, consider:

- **Read Replicas**: Offload read queries from the primary database
- **Connection Pooling**: Use PgBouncer or Neon's built-in pooler
- **Caching**: Implement Redis for frequently accessed data
- **Sharding**: Split data by organization or region

```bash
# Neon connection pooling (add ?pgbouncer=true to DATABASE_URL)
DATABASE_URL="postgresql://user:pass@host:5432/aihrms?pgbouncer=true"
```

### 10.3 API Rate Limiting

Implement rate limiting for API routes:

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimit = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const now = Date.now();
  const limit = 100; // requests per minute
  const window = 60_000; // 1 minute

  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + window });
  } else if (entry.count >= limit) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  } else {
    entry.count++;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

### 10.4 Image Optimization

Vercel automatically optimizes images via Next.js `<Image>` component. For production:

- Use a CDN for static assets
- Enable Vercel's Edge Cache
- Set appropriate `Cache-Control` headers

### 10.5 Serverless Function Optimization

- Keep API routes lean — offload heavy processing
- Use streaming for long-running AI responses
- Implement request timeouts appropriately

---

## 11. Cost Estimation

### 11.1 Small Organization (50–200 employees)

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| **Vercel** | Pro | $20 |
| **Neon Database** | Pro | $19 |
| **Domain** | — | $1–2 (annual / 12) |
| **Total** | | **~$40/month** |

### 11.2 Medium Organization (200–1,000 employees)

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| **Vercel** | Pro | $20 |
| **Neon Database** | Business | $69 |
| **Sentry** | Team | $26 |
| **UptimeRobot** | Pro | $7 |
| **Domain** | — | $1–2 (annual / 12) |
| **Total** | | **~$125/month** |

### 11.3 Large Organization (1,000+ employees)

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| **Vercel** | Enterprise | Custom (~$150+) |
| **Neon Database** | Business | $69+ |
| **Sentry** | Business | $80+ |
| **Monitoring** | Enterprise | $20+ |
| **Redis Cache** | Upstash | $10+ |
| **Total** | | **~$330+/month** |

### 11.4 Free Tier / Hobby Deployment

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| **Vercel** | Hobby (Free) | $0 |
| **Neon Database** | Free Tier | $0 |
| **Domain** | — | $1–2 (annual / 12) |
| **Total** | | **~$2/month** |

> 💡 The free tier is suitable for small teams, demos, and development. Production use with real HR data should use paid tiers for reliability and compliance.

---

## 12. Troubleshooting

### Build Failures

| Issue | Solution |
|-------|----------|
| `prisma generate` fails | Ensure `DATABASE_URL` is set in Vercel env vars |
| TypeScript errors | Run `bunx tsc --noEmit` locally to identify issues |
| Out of memory during build | Upgrade Vercel plan or optimize bundle size |
| `bun install` fails | Clear cache and retry: `bun install --no-cache` |

### Runtime Errors

| Issue | Solution |
|-------|----------|
| Database connection timeout | Check `DATABASE_URL`, ensure SSL mode is correct |
| NextAuth session errors | Verify `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set |
| AI chat not working | Check `ZAI_API_KEY` is valid |
| 504 Gateway Timeout | Increase serverless function timeout in Vercel |

### DNS Issues

```bash
# Check DNS propagation
dig hrms.yourcompany.com

# Clear DNS cache (macOS)
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Check SSL certificate
openssl s_client -connect hrms.yourcompany.com:443 -servername hrms.yourcompany.com
```

### Common Fixes

```bash
# Regenerate Prisma Client after schema changes
bunx prisma generate

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules && bun install

# Force Vercel to rebuild
git commit --allow-empty -m "chore: trigger rebuild"
git push origin main
```

---

## Quick Reference

```bash
# Deploy to production (via Git push)
git push origin main

# Manual deploy via CLI
vercel --prod

# Check deployment status
vercel ls

# View real-time logs
vercel logs --follow

# Rollback
vercel rollback

# Run migrations in production
DATABASE_URL="postgresql://..." bunx prisma migrate deploy
```

---

> 📖 For additional help, open an [issue](https://github.com/your-org/ai-hrms/issues) or consult the [Vercel Documentation](https://vercel.com/docs).
