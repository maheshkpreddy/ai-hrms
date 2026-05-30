'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, EyeOff, LogIn, Sparkles, Building, CheckCircle2,
  Smartphone, Download, Briefcase, Upload, User,
  Mail, Phone, MapPin, GraduationCap, Award, FileText,
  ChevronRight, ArrowLeft, Shield, Clock, Users,
  BarChart3, MessageSquare, QrCode, Lock, Globe,
  Heart, ExternalLink
} from 'lucide-react'

// Extend Window interface for PWA install prompt
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type LoginView = 'login' | 'job-portal' | 'resume-success'

// Animated feature showcase data
const FEATURES = [
  { icon: Sparkles, title: 'AI-Powered Recruitment', desc: 'Smart screening, interview scheduling & onboarding', color: 'emerald' },
  { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Live dashboards, predictive insights & reports', color: 'teal' },
  { icon: Users, title: 'Employee Lifecycle', desc: 'From hire to retire — manage everything seamlessly', color: 'emerald' },
  { icon: MessageSquare, title: 'AI Chatbot Assistant', desc: 'Instant HR answers 24/7 for your team', color: 'teal' },
  { icon: Clock, title: 'Smart Attendance', desc: 'Geo-fenced check-in/out with face recognition', color: 'emerald' },
  { icon: Shield, title: 'Compliance & Security', desc: 'SOC2 & GDPR compliant with audit trails', color: 'teal' },
]

const TRUST_BADGES = [
  { icon: Shield, label: 'SOC 2 Type II' },
  { icon: Lock, label: 'GDPR Ready' },
  { icon: Globe, label: 'ISO 27001' },
  { icon: Heart, label: '99.9% Uptime' },
]

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

  // Animated feature index
  const [activeFeature, setActiveFeature] = useState(0)

  // Job Portal resume form state
  const [resumeForm, setResumeForm] = useState({
    name: '', email: '', phone: '', skills: '', experience: '',
    previousCompany: '', previousRole: '', education: '', location: '',
    noticePeriod: '', expectedSalary: '',
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

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Rotate features
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % FEATURES.length)
    }, 3500)
    return () => clearInterval(timer)
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
      // Install prompt failed
    } finally {
      setIsInstalling(false)
    }
  }

  const verifyCompany = useCallback(async () => {
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
  }, [companyCode])

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
        body: JSON.stringify({ ...resumeForm, source: 'portal' }),
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

  // ─── Resume Success View ───
  if (view === 'resume-success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 text-center"
        >
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
        </motion.div>
      </div>
    )
  }

  // ─── Job Portal Resume Upload View ───
  if (view === 'job-portal') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
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

            {resumeError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {resumeError}
              </div>
            )}

            <form onSubmit={handleResumeSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                  <input type="text" value={resumeForm.name} onChange={(e) => setResumeForm({ ...resumeForm, name: e.target.value })} placeholder="Enter your full name" required className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                    <input type="email" value={resumeForm.email} onChange={(e) => setResumeForm({ ...resumeForm, email: e.target.value })} placeholder="your.email@example.com" required className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                    <input type="tel" value={resumeForm.phone} onChange={(e) => setResumeForm({ ...resumeForm, phone: e.target.value })} placeholder="+91 9876543210" className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Skills</label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                  <input type="text" value={resumeForm.skills} onChange={(e) => setResumeForm({ ...resumeForm, skills: e.target.value })} placeholder="e.g. React, Node.js, Python, SQL (comma separated)" className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Years of Experience</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                    <input type="text" value={resumeForm.experience} onChange={(e) => setResumeForm({ ...resumeForm, experience: e.target.value })} placeholder="e.g. 5 years" className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Education</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                    <input type="text" value={resumeForm.education} onChange={(e) => setResumeForm({ ...resumeForm, education: e.target.value })} placeholder="e.g. B.Tech, MBA" className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Previous Company</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                    <input type="text" value={resumeForm.previousCompany} onChange={(e) => setResumeForm({ ...resumeForm, previousCompany: e.target.value })} placeholder="Company name" className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Previous Role</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                    <input type="text" value={resumeForm.previousRole} onChange={(e) => setResumeForm({ ...resumeForm, previousRole: e.target.value })} placeholder="e.g. Software Engineer" className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                    <input type="text" value={resumeForm.location} onChange={(e) => setResumeForm({ ...resumeForm, location: e.target.value })} placeholder="e.g. Bangalore, India" className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Notice Period</label>
                  <input type="text" value={resumeForm.noticePeriod} onChange={(e) => setResumeForm({ ...resumeForm, noticePeriod: e.target.value })} placeholder="e.g. 30 days, Immediate" className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Expected Salary (CTC)</label>
                <input type="text" value={resumeForm.expectedSalary} onChange={(e) => setResumeForm({ ...resumeForm, expectedSalary: e.target.value })} placeholder="e.g. 12 LPA" className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm" />
              </div>
              <button type="submit" disabled={resumeSubmitting} className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-medium transition-all flex items-center justify-center gap-2 text-sm mt-2">
                {resumeSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Upload size={18} />Submit Resume</>}
              </button>
            </form>
            <p className="mt-4 text-center text-slate-500 text-[10px]">No account needed. Your resume will be reviewed by our recruitment team.</p>
          </div>
        </motion.div>
      </div>
    )
  }

  // ─── Main Login View ───
  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-6" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <div className="w-full max-w-[1040px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10">

          {/* ─── Left Side — Branding, Animated Features & Social Proof ─── */}
          <div className="hidden lg:flex flex-col justify-between p-8 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #064e3b 0%, #0f172a 60%, #1e1b4b 100%)' }}>
            {/* Decorative blobs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl" />
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-3xl"
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity }}
            />

            {/* ─── Top: Logo & Branding ─── */}
            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 mb-5">
                  <Sparkles className="w-7 h-7 text-emerald-400" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-1 tracking-tight">
                  eh2r AI
                </h1>
                <p className="text-emerald-400/80 text-sm font-medium uppercase tracking-[0.2em]">
                  An AI Product of MARQ AI
                </p>
                <p className="text-slate-300/70 text-sm mt-3 leading-relaxed max-w-xs">
                  AI-Powered Human Resource Management System. Transform your HR operations with intelligent automation.
                </p>
              </motion.div>
            </div>

            {/* ─── Middle: Animated Feature Showcase ─── */}
            <div className="relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-xl bg-white/[0.06] backdrop-blur-sm border border-white/10 p-5 mb-4"
                >
                  <div className="flex items-start gap-4">
                    <div className={`rounded-xl p-3 ${FEATURES[activeFeature].color === 'emerald' ? 'bg-emerald-500/20' : 'bg-teal-500/20'}`}>
                      {React.createElement(FEATURES[activeFeature].icon, {
                        className: `w-6 h-6 ${FEATURES[activeFeature].color === 'emerald' ? 'text-emerald-400' : 'text-teal-400'}`
                      })}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white mb-1">{FEATURES[activeFeature].title}</p>
                      <p className="text-sm text-slate-400 leading-relaxed">{FEATURES[activeFeature].desc}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Feature dots indicator */}
              <div className="flex items-center justify-center gap-1.5 mb-4">
                {FEATURES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveFeature(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === activeFeature ? 'w-6 bg-emerald-400' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
                  />
                ))}
              </div>

              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4"
              >
                <p className="text-sm font-medium text-white mb-3">Trusted by <span className="text-emerald-400">200+</span> companies worldwide</p>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {['bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-emerald-600', 'bg-teal-600'].map((bg, i) => (
                      <div key={i} className={`w-7 h-7 rounded-full ${bg} border-2 border-[#0f172a] flex items-center justify-center text-[9px] text-white font-bold`}>
                        {['MA', 'TC', 'HF', 'MP', 'RM'][i]}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-slate-400">
                    <span className="text-emerald-400 font-medium">50K+</span> employees managed
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ─── Bottom: Trust Badges & Copyright ─── */}
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-3">
                {TRUST_BADGES.map((badge) => (
                  <div key={badge.label} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors">
                    <badge.icon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-medium">{badge.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-slate-600 text-[10px]">
                &copy; {new Date().getFullYear()} MARQ AI. All rights reserved.
              </p>
            </div>
          </div>

          {/* ─── Right Side — Login Form ─── */}
          <div className="bg-white/[0.03] backdrop-blur-xl p-5 sm:p-8 flex flex-col justify-center">
            {/* Mobile-only branding */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:hidden text-center mb-6"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 mb-3">
                <Sparkles className="w-7 h-7 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">eh2r AI</h1>
              <p className="text-emerald-400/80 text-[10px] font-medium uppercase tracking-[0.2em] mt-0.5">
                An AI Product of MARQ AI
              </p>
            </motion.div>

            {/* ─── PWA Install Banner (Prominent) ─── */}
            {installPrompt && !isInstalled && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3 rounded-xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-500/20 p-2 shrink-0">
                    <Download className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">Install eh2r AI</p>
                    <p className="text-[11px] text-slate-400">Quick access like a native app</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    disabled={isInstalling}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white text-xs font-medium transition-all"
                  >
                    {isInstalling ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : 'Install'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Already installed indicator */}
            {isInstalled && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-5 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">App Installed</span>
              </motion.div>
            )}

            {/* Form Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-5"
            >
              <h2 className="text-xl font-semibold text-white">Welcome back</h2>
              <p className="text-slate-400 text-sm mt-1">Sign in to access your workspace</p>
            </motion.div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Login Form */}
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
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
                  {verifyingCompany && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                  )}
                  {companyVerified && !verifyingCompany && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-emerald-400" />
                  )}
                </div>
                <p className="text-slate-600 text-[10px] mt-1">Enter the code provided by your organization</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@company.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm"
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
            </motion.form>

            {/* Forgot Password */}
            <p className="mt-3 text-center text-slate-500 text-xs">
              Forgot password? Contact your HR Admin
            </p>

            {/* ─── Job Portal Link ─── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-5 pt-5 border-t border-white/5"
            >
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
            </motion.div>

            {/* ─── Mobile App Download Section (Prominent) ─── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-5 pt-5 border-t border-white/5"
            >
              {/* Mobile install instructions for non-PWA mobile browsers */}
              {(isAndroid || isIOS) && !installPrompt && !isInstalled && (
                <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
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
              )}

              {/* Download Mobile App Link (prominent) */}
              <a
                href="/mobile-app"
                className="w-full flex items-center gap-3 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 hover:border-emerald-500/50 hover:from-emerald-600/30 hover:to-teal-600/30 transition-all group"
              >
                <div className="rounded-lg bg-emerald-500/20 p-2 shrink-0">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">Download Mobile App</p>
                  <p className="text-[11px] text-slate-400">Android & iOS — works like a native app</p>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* QR Code & App Store Badges */}
              <div className="mt-3 flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center shrink-0">
                  <QrCode className="w-6 h-6 text-slate-500" />
                  <span className="text-[7px] text-slate-500 mt-0.5">Scan me</span>
                </div>
                <div className="flex-1 space-y-1.5">
                  <a
                    href="/mobile-app"
                    className="flex items-center gap-2 py-1.5 px-3 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <svg className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.523 2.2l1.3 1.1-2.1 2.5a7.7 7.7 0 012.7 5.8h-2a5.7 5.7 0 00-2.5-4.6L12 10.1l-2.9-3.1A5.7 5.7 0 006.6 11.6h-2a7.7 7.7 0 012.7-5.8L5.2 3.3l1.3-1.1 2.9 3.1a7.6 7.6 0 015.2 0l2.9-3.1zM12 12.9c-2.2 0-4 1.8-4 4v4h8v-4c0-2.2-1.8-4-4-4z"/>
                    </svg>
                    <div className="text-left">
                      <p className="text-[7px] text-slate-400 leading-none">Download for</p>
                      <p className="text-[10px] font-semibold text-white leading-tight">Android</p>
                    </div>
                  </a>
                  <a
                    href="/mobile-app"
                    className="flex items-center gap-2 py-1.5 px-3 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <svg className="w-4 h-4 text-slate-300 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <div className="text-left">
                      <p className="text-[7px] text-slate-400 leading-none">Download for</p>
                      <p className="text-[10px] font-semibold text-white leading-tight">iOS</p>
                    </div>
                  </a>
                </div>
              </div>
            </motion.div>

            {/* ─── Footer Links ─── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-5 pt-4 border-t border-white/5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px]"
            >
              <a href="mailto:support@marqai.com" className="text-slate-500 hover:text-emerald-400 transition-colors flex items-center gap-1">
                <Mail className="w-3 h-3" />
                Contact Support
              </a>
              <a href="/privacy" className="text-slate-500 hover:text-emerald-400 transition-colors">Privacy Policy</a>
              <a href="/terms" className="text-slate-500 hover:text-emerald-400 transition-colors">Terms of Service</a>
            </motion.div>

            {/* Mobile-only trust badges */}
            <div className="lg:hidden mt-4 flex items-center justify-center gap-3">
              {TRUST_BADGES.map((badge) => (
                <div key={badge.label} className="flex items-center gap-1 text-slate-600">
                  <badge.icon className="w-3 h-3" />
                  <span className="text-[9px] font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom copyright for mobile */}
        <p className="lg:hidden text-center text-slate-600 text-[10px] mt-4">
          &copy; {new Date().getFullYear()} MARQ AI. All rights reserved.
        </p>
      </div>
    </div>
  )
}
