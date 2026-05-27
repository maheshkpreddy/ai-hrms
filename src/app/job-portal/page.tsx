'use client'

import { useState, useEffect, useRef } from 'react'
import { signIn } from 'next-auth/react'
import {
  Briefcase, Upload, User, Mail, Phone, MapPin, GraduationCap,
  Award, FileText, ChevronRight, ArrowLeft, Building2, Clock,
  Search, Filter, CheckCircle2, X, Sparkles, Globe, Bookmark,
  DollarSign, Calendar, FileUp, AlertCircle
} from 'lucide-react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────
interface JobOpening {
  id: string
  title: string
  department: string
  location: string
  type: string
  experience: string
  salary: string
  description: string
  skills: string[]
  postedDate: string
  status: 'open' | 'closing-soon' | 'closed'
}

// ─── Sample Job Openings ─────────────────────────────────────────────────────
const sampleJobOpenings: JobOpening[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'Bangalore, India',
    type: 'Full-Time',
    experience: '5-8 years',
    salary: '25-40 LPA',
    description: 'We are looking for a Senior Software Engineer to join our dynamic engineering team. You will be responsible for designing, developing, and maintaining scalable applications using modern web technologies.',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
    postedDate: '2026-05-20',
    status: 'open',
  },
  {
    id: '2',
    title: 'HR Manager',
    department: 'Human Resources',
    location: 'Hyderabad, India',
    type: 'Full-Time',
    experience: '8-12 years',
    salary: '20-35 LPA',
    description: 'Seeking an experienced HR Manager to lead our human resources operations. You will manage the entire employee lifecycle, from recruitment and onboarding to performance management and employee engagement.',
    skills: ['HR Management', 'Recruitment', 'Employee Relations', 'Compliance', 'HRIS'],
    postedDate: '2026-05-18',
    status: 'open',
  },
  {
    id: '3',
    title: 'Data Scientist',
    department: 'Analytics',
    location: 'Remote',
    type: 'Full-Time',
    experience: '3-6 years',
    salary: '20-35 LPA',
    description: 'Join our analytics team as a Data Scientist to build predictive models, analyze workforce data, and generate actionable insights using machine learning and statistical methods.',
    skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Data Visualization'],
    postedDate: '2026-05-15',
    status: 'open',
  },
  {
    id: '4',
    title: 'Product Designer',
    department: 'Design',
    location: 'Mumbai, India',
    type: 'Full-Time',
    experience: '3-5 years',
    salary: '15-25 LPA',
    description: 'We need a creative Product Designer to craft intuitive and engaging user experiences for our HRMS platform. You will work closely with product managers and engineers to deliver pixel-perfect designs.',
    skills: ['Figma', 'UI/UX Design', 'Prototyping', 'Design Systems', 'User Research'],
    postedDate: '2026-05-22',
    status: 'open',
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Bangalore, India',
    type: 'Full-Time',
    experience: '4-7 years',
    salary: '22-38 LPA',
    description: 'Looking for a DevOps Engineer to automate our deployment pipelines, manage cloud infrastructure, and ensure high availability of our HRMS platform.',
    skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Terraform'],
    postedDate: '2026-05-10',
    status: 'closing-soon',
  },
  {
    id: '6',
    title: 'Business Development Executive',
    department: 'Sales',
    location: 'Delhi, India',
    type: 'Full-Time',
    experience: '2-5 years',
    salary: '12-20 LPA',
    description: 'Seeking a motivated Business Development Executive to drive growth by identifying new business opportunities, building client relationships, and closing deals for our HRMS product.',
    skills: ['B2B Sales', 'CRM', 'Negotiation', 'Lead Generation', 'SaaS Sales'],
    postedDate: '2026-05-21',
    status: 'open',
  },
]

type View = 'openings' | 'apply' | 'success'

export default function JobPortalPage() {
  const [view, setView] = useState<View>('openings')
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDept, setFilterDept] = useState('all')
  const [filterType, setFilterType] = useState('all')

  // Resume form state
  const [formData, setFormData] = useState({
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
    coverNote: '',
  })
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeFileName, setResumeFileName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch job openings from API (with fallback to sample data)
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>(sampleJobOpenings)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/jobs?status=open')
        if (res.ok) {
          const data = await res.json()
          if (data.jobs && data.jobs.length > 0) {
            setJobOpenings(data.jobs)
          }
        }
      } catch {
        // Use sample data as fallback
      }
    }
    fetchJobs()
  }, [])

  // Filter jobs
  const filteredJobs = jobOpenings.filter((job) => {
    const matchesSearch =
      !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesDept = filterDept === 'all' || job.department === filterDept
    const matchesType = filterType === 'all' || job.type === filterType
    return matchesSearch && matchesDept && matchesType && job.status !== 'closed'
  })

  const departments = [...new Set(jobOpenings.map((j) => j.department))]
  const jobTypes = [...new Set(jobOpenings.map((j) => j.type))]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/pdf',
      ]
      if (!validTypes.includes(file.type) && !file.name.match(/\.(doc|docx|pdf)$/i)) {
        setError('Please upload a Word document (.doc/.docx) or PDF file')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      setResumeFile(file)
      setResumeFileName(file.name)
      setError('')
    }
  }

  const handleApply = (job: JobOpening) => {
    setSelectedJob(job)
    setView('apply')
  }

  const handleSubmitResume = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and email are required')
      return
    }

    setSubmitting(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('skills', formData.skills)
      formDataToSend.append('experience', formData.experience)
      formDataToSend.append('previousCompany', formData.previousCompany)
      formDataToSend.append('previousRole', formData.previousRole)
      formDataToSend.append('education', formData.education)
      formDataToSend.append('location', formData.location)
      formDataToSend.append('noticePeriod', formData.noticePeriod)
      formDataToSend.append('expectedSalary', formData.expectedSalary)
      formDataToSend.append('coverNote', formData.coverNote)
      formDataToSend.append('source', 'job-portal')
      if (selectedJob) {
        formDataToSend.append('jobId', selectedJob.id)
        formDataToSend.append('jobTitle', selectedJob.title)
        formDataToSend.append('department', selectedJob.department)
      }
      if (resumeFile) {
        formDataToSend.append('resume', resumeFile)
      }

      const res = await fetch('/api/public/resume-upload', {
        method: 'POST',
        body: formDataToSend,
      })

      if (res.ok) {
        setView('success')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to submit application. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Success View ───
  if (view === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6 mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
          <p className="text-slate-400 text-sm mb-2 leading-relaxed">
            Thank you, {formData.name}! Your application for <span className="text-violet-400">{selectedJob?.title || 'the position'}</span> has been submitted successfully.
          </p>
          <p className="text-slate-500 text-xs mb-6">
            Our recruitment team will review your profile and get back to you at <span className="text-emerald-400">{formData.email}</span>.
          </p>
          {resumeFile && (
            <p className="text-slate-500 text-xs mb-6">
              Resume uploaded: <span className="text-white">{resumeFileName}</span>
            </p>
          )}
          <div className="space-y-3">
            <button
              onClick={() => { setView('openings'); setSelectedJob(null); setFormData({ name: '', email: '', phone: '', skills: '', experience: '', previousCompany: '', previousRole: '', education: '', location: '', noticePeriod: '', expectedSalary: '', coverNote: '' }); setResumeFile(null); setResumeFileName('') }}
              className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all text-sm"
            >
              Browse More Openings
            </button>
            <Link
              href="/login"
              className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all text-sm flex items-center justify-center"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ─── Apply / Resume Upload View ───
  if (view === 'apply') {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => setView('openings')}
              className="flex items-center gap-1 text-slate-400 hover:text-white text-xs mb-4 transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Back to Job Openings
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30">
                <Briefcase className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{selectedJob?.title}</h2>
                <p className="text-slate-400 text-xs">{selectedJob?.department} · {selectedJob?.location}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8">
            {/* Error */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitResume} className="space-y-4">
              {/* Resume File Upload */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Upload Resume (Word / PDF) *
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative border-2 border-dashed border-white/15 rounded-lg p-6 text-center hover:border-violet-500/50 transition-colors cursor-pointer bg-white/[0.02]"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".doc,.docx,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {resumeFileName ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="size-5 text-emerald-400" />
                      <span className="text-sm text-white">{resumeFileName}</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setResumeFile(null); setResumeFileName('') }}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <FileUp className="size-8 text-violet-400/60 mx-auto mb-2" />
                      <p className="text-sm text-slate-300">Click to upload your resume</p>
                      <p className="text-xs text-slate-500 mt-1">Supports .doc, .docx, .pdf (max 10MB)</p>
                    </>
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    required
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
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
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@example.com"
                      required
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
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
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="e.g. React, Node.js, Python, SQL (comma separated)"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
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
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      placeholder="e.g. 5 years"
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Education</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      placeholder="e.g. B.Tech, MBA"
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Previous Company & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Previous Company</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={formData.previousCompany}
                      onChange={(e) => setFormData({ ...formData, previousCompany: e.target.value })}
                      placeholder="Company name"
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Previous Role</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={formData.previousRole}
                      onChange={(e) => setFormData({ ...formData, previousRole: e.target.value })}
                      placeholder="e.g. Software Engineer"
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
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
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Bangalore, India"
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Notice Period</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={formData.noticePeriod}
                      onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                      placeholder="e.g. 30 days, Immediate"
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Expected Salary */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Expected Salary (CTC)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={formData.expectedSalary}
                    onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
                    placeholder="e.g. 12 LPA"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Cover Note */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Cover Note (Optional)</label>
                <textarea
                  value={formData.coverNote}
                  onChange={(e) => setFormData({ ...formData, coverNote: e.target.value })}
                  placeholder="Tell us why you are a great fit for this role..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-medium transition-all flex items-center justify-center gap-2 text-sm mt-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload size={18} />
                    Submit Application
                  </>
                )}
              </button>
            </form>

            <p className="mt-4 text-center text-slate-500 text-[10px]">
              No account needed. Your application will be reviewed by our recruitment team.
            </p>

            {/* Google Sign-in option */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="relative mb-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[10px]">
                  <span className="px-2 bg-transparent text-slate-500">Or sign in with Google for faster application</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => signIn('google', { callbackUrl: '/job-portal' })}
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

  // ─── Job Openings View (default) ───
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/login" className="flex items-center gap-1 text-slate-400 hover:text-white text-xs transition-colors">
              <ArrowLeft className="size-3.5" />
              Back to Login
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-emerald-400" />
              <span className="text-sm font-semibold text-white">eh2r AI</span>
              <span className="text-[10px] text-emerald-400/60 uppercase tracking-wider">An AI Product of MARQ AI</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-500/20 border border-violet-500/30 mb-4">
              <Briefcase className="w-8 h-8 text-violet-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Job Portal</h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Explore exciting career opportunities. Apply directly or upload your resume — no login required.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by job title, department, or skills..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="pl-9 pr-8 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="all" className="bg-slate-800">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d} className="bg-slate-800">{d}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-9 pr-8 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="all" className="bg-slate-800">All Types</option>
                {jobTypes.map((t) => (
                  <option key={t} value={t} className="bg-slate-800">{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-slate-400 mb-4">
            Showing {filteredJobs.length} open position{filteredJobs.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {/* Job Cards */}
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="rounded-xl overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 sm:p-6 hover:border-violet-500/30 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white group-hover:text-violet-400 transition-colors">
                      {job.title}
                    </h3>
                    {job.status === 'closing-soon' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium">
                        Closing Soon
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mb-3 line-clamp-2">{job.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-300 bg-white/5 px-2 py-1 rounded-md">
                      <Building2 className="size-3" /> {job.department}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-300 bg-white/5 px-2 py-1 rounded-md">
                      <MapPin className="size-3" /> {job.location}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-300 bg-white/5 px-2 py-1 rounded-md">
                      <Clock className="size-3" /> {job.type}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-300 bg-white/5 px-2 py-1 rounded-md">
                      <Briefcase className="size-3" /> {job.experience}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                      <DollarSign className="size-3" /> {job.salary}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleApply(job)}
                  className="shrink-0 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all text-sm flex items-center gap-2"
                >
                  Apply Now
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          ))}

          {filteredJobs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="mb-3 size-12 text-slate-600" />
              <p className="text-sm font-medium text-slate-400">No open positions found</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filters</p>
              <button
                onClick={() => { setSearchQuery(''); setFilterDept('all'); setFilterType('all') }}
                className="mt-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-all"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Upload Resume Without Applying */}
        <div className="mt-10 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
          <Bookmark className="size-8 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Don&apos;t see the right role?</h3>
          <p className="text-sm text-slate-400 mb-4 max-w-md mx-auto">
            Upload your resume to our talent pool. We will reach out when a matching opportunity opens up.
          </p>
          <button
            onClick={() => { setSelectedJob(null); setView('apply') }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all text-sm"
          >
            <Upload className="size-4" />
            Upload Resume
          </button>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} MARQ AI. All rights reserved. ·{' '}
            <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
              Employee Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
