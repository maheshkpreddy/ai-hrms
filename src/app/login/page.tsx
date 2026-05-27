'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Eye, EyeOff, LogIn, Sparkles, Building, CheckCircle2,
  Smartphone, Apple, Download, Briefcase, Upload, User,
  Mail, Phone, MapPin, GraduationCap, Award, FileText,
  ChevronRight, ArrowLeft
} from 'lucide-react'

// Extend Window interface for PWA install prompt
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type LoginView = 'login' | 'job-portal' | 'resume-success'

export default function LoginPage() {
  const router = useRouter()
  const [view, setView] = useState<LoginView>('login')

  // Login form state
  const [companyCode, setCompanyCode] = useState('MARQ')
  const [email, setEmail] = useState('admin@marqai.com')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [companyVerified, setCompanyVerified] = useState(false)
  const [verifyingCompany, setVerifyingCompany] = useState(false)

  // PWA install prompt state
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  // Job Portal resume form state
  const [resumeForm, setResumeForm] = useState({
    name: '',
    email: '',
    phone: '',
    skills: '',
    experience: '',
    previousCompany: '',
    previousRole: '',
    education: '',
    location: '',
    noticePeriod: '',
    expectedSalary: '',
  })
  const [resumeSubmitting, setResumeSubmitting] = useState(false)
  const [resumeError, setResumeError] = useState('')

  // Capture the beforeinstallprompt event
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallClick = async () => {
    if (!installPrompt) return
    setIsInstalling(true)
    try {
      await installPrompt.prompt()
      const result = await installPrompt.userChoice
      if (result.outcome === 'accepted') {
        setIsInstalled(true)
        setInstallPrompt(null)
      }
    } catch {
      // Install prompt failed, fall back to manual instructions
    } finally {
      setIsInstalling(false)
    }
  }

  const verifyCompany = async () => {
    if (!companyCode.trim()) {
      setError('Please enter a company code')
      return false
    }
    setVerifyingCompany(true)
    setError('')
    try {
      const res = await fetch(`/api/companies?code=${encodeURIComponent(companyCode.toUpperCase())}`)
      if (res.ok) {
        const data = await res.json()
        if (data.companies && data.companies.length > 0) {
          setCompanyVerified(true)
          return true
        }
      }
      setError('Invalid company code. Please check with your administrator.')
      setCompanyVerified(false)
      return false
    } catch {
      setCompanyVerified(true)
      return true
    } finally {
      setVerifyingCompany(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        companyCode: companyCode.toUpperCase(),
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResumeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setResumeError('')

    if (!resumeForm.name.trim() || !resumeForm.email.trim()) {
      setResumeError('Name and email are required')
      return
    }

    setResumeSubmitting(true)
    try {
      const res = await fetch('/api/public/resume-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...resumeForm,
          source: 'portal',
        }),
      })

      if (res.ok) {
        setView('resume-success')
      } else {
        const data = await res.json()
        setResumeError(data.error || 'Failed to submit resume. Please try again.')
      }
    } catch {
      setResumeError('Network error. Please check your connection and try again.')
    } finally {
      setResumeSubmitting(false)
    }
  }

  // Detect if user is on Android or iOS
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : ''
  const isAndroid = userAgent.includes('android')
  const isIOS = /iphone|ipad|ipod/.test(userAgent)
  const isMobile = isAndroid || isIOS

  // ─── Resume Success View ───
  if (view === 'resume-success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6 mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Resume Submitted!</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Thank you, {resumeForm.name}! Your resume has been submitted successfully. Our recruitment team will review your profile and get back to you at <span className="text-emerald-400">{resumeForm.email}</span>.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setView('job-portal')
                setResumeForm({ name: '', email: '', phone: '', skills: '', experience: '', previousCompany: '', previousRole: '', education: '', location: '', noticePeriod: '', expectedSalary: '' })
              }}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all text-sm"
            >
              Submit Another Resume
            </button>
            <button
              onClick={() => setView('login')}
              className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all text-sm"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Job Portal Resume Upload View ───
  if (view === 'job-portal') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        <div className="w-full max-w-lg">
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => setView('login')}
                className="flex items-center gap-1 text-slate-400 hover:text-white text-xs mb-4 transition-colors"
              >
                <ArrowLeft className="size-3.5" />
                Back to Login
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30">
                  <Briefcase className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Job Portal</h2>
                  <p className="text-slate-400 text-xs">Upload your resume & apply for opportunities</p>
                </div>
              </div>
            </div>

            {/* Error */}
            {resumeError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {resumeError}
              </div>
            )}

            {/* Resume Form */}
            <form onSubmit={handleResumeSubmit} className="space-y-3">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={resumeForm.name}
                    onChange={(e) => setResumeForm({ ...resumeForm, name: e.target.value })}
                    placeholder="Enter your full name"
                    required
                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                    <input
                      type="email"
                      value={resumeForm.email}
                      onChange={(e) => setResumeForm({ ...resumeForm, email: e.target.value })}
                      placeholder="your.email@example.com"
                      required
                      className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                    <input
                      type="tel"
                      value={resumeForm.phone}
                      onChange={(e) => setResumeForm({ ...resumeForm, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Skills</label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={resumeForm.skills}
                    onChange={(e) => setResumeForm({ ...resumeForm, skills: e.target.value })}
                    placeholder="e.g. React, Node.js, Python, SQL (comma separated)"
                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Experience & Education */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Years of Experience</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={resumeForm.experience}
                      onChange={(e) => setResumeForm({ ...resumeForm, experience: e.target.value })}
                      placeholder="e.g. 5 years"
                      className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Education</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={resumeForm.education}
                      onChange={(e) => setResumeForm({ ...resumeForm, education: e.target.value })}
                      placeholder="e.g. B.Tech, MBA"
                      className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Previous Company & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Previous Company</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={resumeForm.previousCompany}
                      onChange={(e) => setResumeForm({ ...resumeForm, previousCompany: e.target.value })}
                      placeholder="Company name"
                      className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Previous Role</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={resumeForm.previousRole}
                      onChange={(e) => setResumeForm({ ...resumeForm, previousRole: e.target.value })}
                      placeholder="e.g. Software Engineer"
                      className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Notice Period */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={resumeForm.location}
                      onChange={(e) => setResumeForm({ ...resumeForm, location: e.target.value })}
                      placeholder="e.g. Bangalore, India"
                      className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Notice Period</label>
                  <input
                    type="text"
                    value={resumeForm.noticePeriod}
                    onChange={(e) => setResumeForm({ ...resumeForm, noticePeriod: e.target.value })}
                    placeholder="e.g. 30 days, Immediate"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Expected Salary */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Expected Salary (CTC)</label>
                <input
                  type="text"
                  value={resumeForm.expectedSalary}
                  onChange={(e) => setResumeForm({ ...resumeForm, expectedSalary: e.target.value })}
                  placeholder="e.g. 12 LPA"
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={resumeSubmitting}
                className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-medium transition-all flex items-center justify-center gap-2 text-sm mt-2"
              >
                {resumeSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload size={18} />
                    Submit Resume
                  </>
                )}
              </button>
            </form>

            <p className="mt-4 text-center text-slate-500 text-[10px]">
              No account needed. Your resume will be reviewed by our recruitment team.
            </p>

            {/* Google Login for Job Portal */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="relative mb-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[10px]">
                  <span className="px-2 bg-transparent text-slate-500">Or sign in with Google for job portal</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => signIn('google', { callbackUrl: '/' })}
                className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium transition-all text-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Main Login View ───
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <div className="w-full max-w-[960px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10">

          {/* ─── Left Side — Branding & Illustration ─── */}
          <div className="hidden lg:flex flex-col justify-between p-8 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #064e3b 0%, #0f172a 60%, #1e1b4b 100%)' }}>
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 mb-6">
                <Sparkles className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                eh2r AI
              </h1>
              <p className="text-emerald-400/80 text-sm font-medium uppercase tracking-[0.2em]">
                An AI Product of MARQ AI
              </p>
              <p className="text-slate-300/70 text-sm mt-4 leading-relaxed max-w-xs">
                AI-Powered Human Resource Management System. Transform your HR operations with intelligent automation.
              </p>
            </div>

            <div className="relative z-10 space-y-4">
              {/* Feature highlights */}
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-emerald-500/20 p-1.5 mt-0.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">AI-Powered Recruitment</p>
                  <p className="text-xs text-slate-400">Smart screening, interview scheduling, and onboarding</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-emerald-500/20 p-1.5 mt-0.5">
                  <Building className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Client & Vendor Portals</p>
                  <p className="text-xs text-slate-400">Integrated portals for clients, vendors, and candidates</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-violet-500/20 p-1.5 mt-0.5">
                  <Briefcase className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Job Portal for Candidates</p>
                  <p className="text-xs text-slate-400">Browse openings, upload resumes, and apply — no login needed</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-emerald-500/20 p-1.5 mt-0.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Install as Web App</p>
                  <p className="text-xs text-slate-400">Access HRMS on the go — install directly from your browser</p>
                </div>
              </div>
            </div>

            <p className="relative z-10 text-slate-500 text-[10px]">
              &copy; {new Date().getFullYear()} MARQ AI. All rights reserved.
            </p>
          </div>

          {/* ─── Right Side — Login Form ─── */}
          <div className="bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-center">
            {/* Mobile-only branding */}
            <div className="lg:hidden text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 mb-3">
                <Sparkles className="w-7 h-7 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">eh2r AI</h1>
              <p className="text-emerald-400/80 text-[10px] font-medium uppercase tracking-[0.2em] mt-0.5">
                An AI Product of MARQ AI
              </p>
            </div>

            {/* Form Header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white">Welcome back</h2>
              <p className="text-slate-400 text-sm mt-1">Sign in to access your workspace</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Company Code */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Company Code</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                  <input
                    type="text"
                    value={companyCode}
                    onChange={(e) => { setCompanyCode(e.target.value.toUpperCase()); setCompanyVerified(false) }}
                    placeholder="Enter your company code"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all uppercase text-sm"
                  />
                  {companyVerified && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-emerald-400" />
                  )}
                </div>
                <p className="text-slate-600 text-[10px] mt-1">Enter the code provided by your organization</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@company.com"
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-medium transition-all flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Forgot Password */}
            <p className="mt-3 text-center text-slate-500 text-xs">
              Forgot password? Contact your HR Admin
            </p>

            {/* ─── Job Portal Link ─── */}
            <div className="mt-5 pt-5 border-t border-white/5">
              <a
                href="/job-portal"
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-lg bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/30 hover:border-violet-500/50 text-violet-400 font-medium transition-all text-sm"
              >
                <Briefcase className="w-4 h-4" />
                Job Portal — View Openings & Apply
                <ChevronRight className="w-4 h-4" />
              </a>
              <p className="text-[10px] text-slate-500 text-center mt-1.5">
                Looking for a job? Browse openings and submit your resume without login.
              </p>
            </div>

            {/* ─── Install as Web App Section ─── */}
            <div className="mt-5 pt-5 border-t border-white/5">
              {/* PWA Install Button — shown when browser supports install */}
              {installPrompt && !isInstalled && (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    disabled={isInstalling}
                    className="w-full flex items-center justify-center gap-2.5 py-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 font-medium transition-all text-sm"
                  >
                    {isInstalling ? (
                      <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Install as Web App
                  </button>
                  <p className="text-[10px] text-slate-500 text-center mt-1.5">
                    Install eh2r AI on your device for quick access — works like a native app
                  </p>
                </div>
              )}

              {/* Already installed indicator */}
              {isInstalled && (
                <div className="mb-4 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-medium">App Installed</span>
                </div>
              )}

              {/* Manual install instructions — shown when no PWA prompt but on mobile */}
              {isMobile && !installPrompt && !isInstalled && (
                <div className="mb-4">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-slate-300 font-medium mb-2 flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      Install as Web App
                    </p>
                    {isAndroid && (
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Open this page in <span className="text-white font-medium">Chrome</span>, tap the
                        <span className="text-white font-medium"> menu</span>, then select
                        <span className="text-emerald-400 font-medium"> &quot;Add to Home Screen&quot;</span>
                      </p>
                    )}
                    {isIOS && (
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Open this page in <span className="text-white font-medium">Safari</span>, tap the
                        <span className="text-white font-medium"> Share button</span>, then select
                        <span className="text-emerald-400 font-medium"> &quot;Add to Home Screen&quot;</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Mobile App Download Buttons */}
              <p className="text-center text-slate-500 text-[10px] mb-3">Get the mobile app</p>
              <div className="flex gap-3">
                <a
                  href="/api/mobile/android"
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.523 2.2l1.3 1.1-2.1 2.5a7.7 7.7 0 012.7 5.8h-2a5.7 5.7 0 00-2.5-4.6L12 10.1l-2.9-3.1A5.7 5.7 0 006.6 11.6h-2a7.7 7.7 0 012.7-5.8L5.2 3.3l1.3-1.1 2.9 3.1a7.6 7.6 0 015.2 0l2.9-3.1zM12 12.9c-2.2 0-4 1.8-4 4v4h8v-4c0-2.2-1.8-4-4-4z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[8px] text-slate-400 leading-none">Download for</p>
                    <p className="text-[11px] font-semibold text-white leading-tight">Android</p>
                  </div>
                </a>
                <a
                  href="/api/mobile/ios"
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <Apple className="w-4 h-4 text-slate-300" />
                  <div className="text-left">
                    <p className="text-[8px] text-slate-400 leading-none">Download for</p>
                    <p className="text-[11px] font-semibold text-white leading-tight">iOS</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
