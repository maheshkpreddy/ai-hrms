# Login Page Fix - Work Record

## Task: Fix eh2r AI HRMS Login Page Issues

### Changes Made:

1. **Created Mobile App Download API Route** (`/src/app/api/mobile/[platform]/route.ts`)
   - Returns platform-specific install instructions (Android, iOS, Web)
   - Returns the current app URL as the install link
   - Validates platform parameter

2. **Fixed "Download Mobile App" Section**
   - Removed dead `href="/mobile-app"` from all 3 links (main CTA, Android badge, iOS badge)
   - Changed `<a>` tags to `<button>` tags with `onClick={handleMobileAppClick}`
   - Made the section ALWAYS visible (not dependent on `installPrompt` being available)
   - When PWA install prompt is available, clicking triggers the native install
   - When PWA install prompt is NOT available, clicking opens the Install Instructions dialog
   - Added conditional UI: shows "Install" badge when prompt available, "Info" icon when not
   - Added quick install tips for mobile browsers (Android/iOS) inline
   - Added Install Instructions Dialog with step-by-step for Android, iOS, and Desktop

3. **Fixed "/job-portal" Link**
   - Changed from `<a href="/job-portal">` to `<button onClick={() => setView('job-portal')}>`
   - Now correctly switches to the job-portal view within the component

4. **Added "Forgot Password" Dialog**
   - Replaced plain text "Forgot password? Contact your HR Admin" with a clickable "Forgot Password?" button
   - Opens a dialog with company code (read-only) and email input fields
   - Attempts to call `/api/auth/change-password` API
   - Shows success message with HR admin contact info
   - Added "Need help?" link that opens mailto:support@marqai.com

5. **Fixed Footer Dead Links**
   - Changed `href="/privacy"` to `href="mailto:privacy@marqai.com"` (functional email link)
   - Changed `href="/terms"` to `href="mailto:legal@marqai.com"` (functional email link)

6. **PWA Install Banner Enhancement**
   - Changed from only showing when `installPrompt` is available to showing whenever NOT installed
   - When install prompt is available: shows "Install" button that triggers native PWA install
   - When install prompt is NOT available: shows "Install" button that opens instructions dialog

7. **Added New State Variables and Handlers**
   - `showForgotPassword` / `showInstallInstructions` dialog state
   - `forgotPasswordEmail` / `forgotPasswordSent` / `forgotPasswordLoading` for password reset flow
   - `handleMobileAppClick()` - unified handler for mobile app install
   - `handleForgotPassword()` - form submission for password reset

8. **Added New Imports**
   - `X`, `KeyRound`, `Info` from lucide-react
   - Dialog components from `@/components/ui/dialog`

### Verification:
- No dead `href="/..."` links remain in the file
- No references to `/mobile-app`, `/job-portal`, `/privacy`, or `/terms` as href
- Lint passes for the login page (no errors)
- TypeScript compilation passes for the login page
