'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn, Smartphone, Apple, Building, CheckCircle2 } from 'lucide-react'



export default function LoginPage() {
  const router = useRouter()
  const [companyCode, setCompanyCode] = useState('ACME')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [companyVerified, setCompanyVerified] = useState(false)
  const [verifyingCompany, setVerifyingCompany] = useState(false)

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
      // Allow login even if company verification fails (for local dev)
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



  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          {/* Logo & Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">eh2r AI</h1>
            <p className="text-slate-400 text-sm">An AI Product of MARQ AI</p>
          </div>

          {/* Login Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white">Welcome back</h2>
              <p className="text-slate-400 text-sm mt-1">Sign in to access your company dashboard</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

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
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all uppercase"
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
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
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
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all pr-10"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-medium transition-all flex items-center justify-center gap-2"
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

            <div className="mt-4 text-center">
              <p className="text-slate-500 text-xs">Forgot password? Contact your HR Admin</p>
            </div>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-transparent text-slate-500">Or continue with</span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>

          {/* Mobile App Download Section */}
          <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 mb-2">
                <Smartphone className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">Get the Mobile App</h3>
              <p className="text-slate-500 text-[10px] mt-0.5">Access HRMS on the go</p>
            </div>
            <div className="flex gap-3">
              <a
                href="/api/mobile/android"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.523 2.2l1.3 1.1-2.1 2.5a7.7 7.7 0 012.7 5.8h-2a5.7 5.7 0 00-2.5-4.6L12 10.1l-2.9-3.1A5.7 5.7 0 006.6 11.6h-2a7.7 7.7 0 012.7-5.8L5.2 3.3l1.3-1.1 2.9 3.1a7.6 7.6 0 015.2 0l2.9-3.1zM12 12.9c-2.2 0-4 1.8-4 4v4h8v-4c0-2.2-1.8-4-4-4zm-6 4v4H4v-4c0-2.2 1.8-4 4-4 .7 0 1.4.2 2 .5-1.2 1-2 2.5-2 3.5zm12 0c0-1-.8-2.5-2-3.5.6-.3 1.3-.5 2-.5 2.2 0 4 1.8 4 4v4h-4v-4z"/>
                </svg>
                <div className="text-left">
                  <p className="text-[9px] text-slate-400 leading-none">Download for</p>
                  <p className="text-xs font-semibold text-white leading-tight">Android</p>
                </div>
              </a>
              <a
                href="/api/mobile/ios"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <Apple className="w-5 h-5 text-slate-300" />
                <div className="text-left">
                  <p className="text-[9px] text-slate-400 leading-none">Download for</p>
                  <p className="text-xs font-semibold text-white leading-tight">iOS</p>
                </div>
              </a>
            </div>
            <p className="text-center text-slate-600 text-[9px] mt-2">Available on Google Play Store and Apple App Store</p>
          </div>
        </div>
      </div>


    </div>
  )
}
