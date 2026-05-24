'use client'

import { useState } from 'react'
import { Smartphone, Download, QrCode, Bell, ArrowLeft, CheckCircle2, Tablet, Shield, Clock, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function MobileAppPage() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = () => {
    if (email) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back link */}
        <button onClick={() => window.location.href = '/'} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to eh2r AI
        </button>

        {/* Hero Section */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">eh2r AI Mobile App</h1>
          <p className="mt-2 text-lg text-muted-foreground">Take your HRMS wherever you go</p>
          <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400 font-medium">An AI Product of MARQ AI</p>
        </div>

        {/* Download Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Android Card */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-950">
                  <Smartphone className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Android App</h3>
                  <p className="text-xs text-muted-foreground">Works on Android 8.0+</p>
                </div>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">Access attendance, leaves, payslips, and more from your Android device. Mark check-in/check-out with geofencing support.</p>
              <div className="space-y-2">
                <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => window.location.href = '/'}>
                  <Download className="h-4 w-4" />
                  Install as Web App (Works Now!)
                </Button>
                <p className="text-[11px] text-muted-foreground text-center">Open in Chrome → Menu (⋮) → &quot;Add to Home Screen&quot;</p>
              </div>
            </CardContent>
          </Card>

          {/* iOS Card */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                  <Tablet className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <h3 className="font-semibold">iOS App</h3>
                  <p className="text-xs text-muted-foreground">Works on iOS 15.0+</p>
                </div>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">Full HRMS experience on your iPhone or iPad. Receive push notifications for approvals, leave requests, and announcements.</p>
              <div className="space-y-2">
                <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => window.location.href = '/'}>
                  <Download className="h-4 w-4" />
                  Install as Web App (Works Now!)
                </Button>
                <p className="text-[11px] text-muted-foreground text-center">Open in Safari → Share → &quot;Add to Home Screen&quot;</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QR Code Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
              <div className="flex h-40 w-40 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600">
                <div className="text-center">
                  <QrCode className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-xs text-muted-foreground">Scan to download</p>
                  <p className="text-[10px] text-muted-foreground/60">(Available soon)</p>
                </div>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold">Quick Download via QR Code</h3>
                <p className="mt-1 text-sm text-muted-foreground">Point your phone camera at the QR code to download the eh2r AI app directly. Available for both Android and iOS.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mb-8">
          <h2 className="mb-4 text-center text-xl font-semibold">Mobile App Features</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Clock, label: 'Check-In/Out', desc: 'Geo-fenced attendance marking' },
              { icon: Bell, label: 'Push Notifications', desc: 'Instant alerts and reminders' },
              { icon: Shield, label: 'Secure Access', desc: 'Biometric & PIN login' },
              { icon: Sparkles, label: 'AI Assistant', desc: 'Chat with HR AI on-the-go' },
            ].map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.label}>
                  <CardContent className="p-4 text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                      <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-sm font-medium">{feature.label}</p>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Notify Me */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Get Notified When Available</h3>
              <p className="mt-1 text-sm text-muted-foreground">Enter your email to be the first to know when the mobile app launches.</p>
              {!subscribed ? (
                <div className="mt-4 flex max-w-md mx-auto gap-2">
                  <Input
                    type="email"
                    placeholder="your.email@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                  />
                  <Button onClick={handleSubscribe} disabled={!email} className="gap-1.5 shrink-0">
                    <Bell className="h-4 w-4" />
                    Notify Me
                  </Button>
                </div>
              ) : (
                <div className="mt-4 flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">You&apos;ll be notified when the app is available!</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Web App Alternative */}
        <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">Use the Web App Now</h3>
              <p className="mt-1 text-sm text-muted-foreground">The eh2r AI web app is fully responsive and works great on mobile browsers. Add it to your home screen for an app-like experience.</p>
              <Button onClick={() => window.location.href = '/'} className="mt-3 gap-2 bg-emerald-600 hover:bg-emerald-700">
                Open Web App
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>eh2r AI — An AI Product of MARQ AI | AI-Powered Human Resource Management System</p>
        </div>
      </div>
    </div>
  )
}
