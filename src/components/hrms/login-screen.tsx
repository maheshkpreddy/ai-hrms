'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { ROLE_LABELS, type UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Shield, Users, UserCheck, Sparkles, ArrowRight, Loader2,
  AlertCircle, Eye, EyeOff, Smartphone, Download, CheckCircle2,
  QrCode, Briefcase, Lock, Mail, Building2, Heart, Globe
} from 'lucide-react';

// Demo logins matching actual company data
const DEMO_LOGINS: {
  role: UserRole;
  name: string;
  email: string;
  password: string;
  companyCode: string;
  icon: React.ReactNode;
  color: string;
  desc: string;
}[] = [
  {
    role: 'super_admin',
    name: 'MARQ Admin',
    email: 'admin@marqai.com',
    password: 'admin123',
    companyCode: 'MARQ',
    icon: <Shield className="h-4 w-4" />,
    color: 'bg-red-500/80 hover:bg-red-500',
    desc: 'Full system access',
  },
  {
    role: 'company_hr_admin',
    name: 'TechCorp HR',
    email: 'sarah.j@techcorp.com',
    password: 'sarah123',
    companyCode: 'TCG',
    icon: <Users className="h-4 w-4" />,
    color: 'bg-purple-500/80 hover:bg-purple-500',
    desc: 'HR management',
  },
  {
    role: 'employee',
    name: 'Raj Patel',
    email: 'raj.p@techcorp.com',
    password: 'raj123',
    companyCode: 'TCG',
    icon: <UserCheck className="h-4 w-4" />,
    color: 'bg-emerald-500/80 hover:bg-emerald-500',
    desc: 'Employee portal',
  },
];

// Trust badges
const TRUST_BADGES = [
  { icon: Shield, label: 'SOC 2' },
  { icon: Lock, label: 'GDPR' },
  { icon: Globe, label: 'ISO 27001' },
  { icon: Heart, label: '99.9%' },
];

// Extend Window interface for PWA install prompt
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function LoginScreen() {
  const router = useRouter();
  const { isLoading, authError, login } = useAppStore();
  const [email, setEmail] = useState('admin@marqai.com');
  const [password, setPassword] = useState('admin123');
  const [companyCode, setCompanyCode] = useState('MARQ');
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  // PWA install state
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Capture PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    setIsInstalling(true);
    try {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
    } catch {
      // Install prompt failed
    } finally {
      setIsInstalling(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return;
    setLocalLoading(true);
    setLocalError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        companyCode: companyCode.toUpperCase(),
        redirect: false,
      });

      if (result?.error) {
        setLocalError('Invalid email, password, or company code');
        setLocalLoading(false);
        return;
      }

      await login(email, password);
      router.push('/');
      router.refresh();
    } catch {
      setLocalError('Network error. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleQuickLogin = async (_role: UserRole, _name: string, qEmail: string, qPassword: string, qCode: string) => {
    setEmail(qEmail);
    setPassword(qPassword);
    setCompanyCode(qCode);

    setLocalLoading(true);
    setLocalError('');

    try {
      const result = await signIn('credentials', { email: qEmail, password: qPassword, companyCode: qCode.toUpperCase(), redirect: false });

      if (result?.error) {
        setLocalError('Invalid credentials');
        setLocalLoading(false);
        return;
      }

      await login(qEmail, qPassword);
      router.push('/');
      router.refresh();
    } catch {
      setLocalError('Network error. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  const loading = isLoading || localLoading;
  const error = authError || localError;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900" />

      {/* Animated background shapes */}
      <motion.div
        className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-400/5 rounded-full blur-3xl"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo and Branding */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-2xl shadow-emerald-500/30 mb-4 overflow-hidden"
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <img
              src="/eh2r-logo.png"
              alt="eh2r AI"
              className="w-full h-full object-contain rounded-2xl"
            />
          </motion.div>
          <h1 className="text-4xl font-bold text-white tracking-tight">eh2r AI</h1>
          <div className="flex items-center gap-1.5 justify-center mt-2">
            <img
              src="/marq-logo.png"
              alt="MARQ AI"
              className="h-4 w-4 rounded-sm object-contain"
            />
            <p className="text-emerald-200/80 text-sm font-medium uppercase tracking-[0.2em]">An AI Product of MARQ AI</p>
          </div>
        </motion.div>

        {/* PWA Install Banner */}
        {installPrompt && !isInstalled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border border-emerald-400/30 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/20 p-2 shrink-0">
                <Download className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">Install eh2r AI</p>
                <p className="text-[11px] text-emerald-200/60">Quick access like a native app</p>
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
            className="mb-4 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600/15 border border-emerald-500/20 text-emerald-300 text-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium">App Installed</span>
          </motion.div>
        )}

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                Sign In to eh2r AI
              </CardTitle>
              <CardDescription className="text-emerald-200/70">
                Enter your credentials to access the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-emerald-100 text-sm font-medium">Company Code</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-200/40" />
                  <Input
                    value={companyCode}
                    onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your company code"
                    className="bg-white/10 border-white/20 text-white placeholder:text-emerald-200/50 focus:border-emerald-400 pl-10 uppercase"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-emerald-100 text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-200/40" />
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your email"
                    type="email"
                    className="bg-white/10 border-white/20 text-white placeholder:text-emerald-200/50 focus:border-emerald-400 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-emerald-100 text-sm font-medium">Password</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-200/40" />
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your password"
                    type={showPassword ? 'text' : 'password'}
                    className="bg-white/10 border-white/20 text-white placeholder:text-emerald-200/50 focus:border-emerald-400 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-200/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-red-300 text-sm bg-red-500/10 rounded-md p-2"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <Button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold h-11 shadow-lg shadow-emerald-500/30"
                disabled={(!email || !password) || loading}
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
                ) : (
                  <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>

              {/* Forgot Password */}
              <p className="text-center text-emerald-200/50 text-xs">
                Forgot password? Contact your HR Admin
              </p>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-transparent px-2 text-emerald-200/70">Quick Demo Login</span>
                </div>
              </div>

              {/* Demo Login Buttons */}
              <div className="space-y-2">
                {DEMO_LOGINS.map((demo, index) => (
                  <motion.button
                    key={demo.role}
                    onClick={() => handleQuickLogin(demo.role, demo.name, demo.email, demo.password, demo.companyCode)}
                    className={`${demo.color} text-white rounded-lg px-4 py-2.5 text-sm font-medium flex items-center gap-3 transition-all shadow-md hover:shadow-lg disabled:opacity-50 w-full`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : demo.icon}
                    <div className="text-left flex-1">
                      <span className="font-semibold">{demo.name}</span>
                      <span className="text-white/70 ml-2 text-xs">{demo.desc}</span>
                    </div>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">{demo.companyCode}</span>
                  </motion.button>
                ))}
              </div>

              <p className="text-center text-emerald-200/50 text-xs mt-1">
                Database-backed authentication with real data
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mobile App Download Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4"
        >
          <div className="rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Smartphone className="w-4 h-4 text-emerald-300" />
              <h3 className="text-sm font-semibold text-white">Get the Mobile App</h3>
            </div>

            <div className="flex items-center gap-3">
              {/* QR Code */}
              <div className="w-16 h-16 rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center shrink-0 bg-white/5">
                <QrCode className="w-6 h-6 text-emerald-200/50" />
                <span className="text-[7px] text-emerald-200/40 mt-0.5">Scan me</span>
              </div>

              {/* App store badges */}
              <div className="flex-1 space-y-1.5">
                <a
                  href={installPrompt ? undefined : '#'}
                  onClick={installPrompt ? handleInstallClick : undefined}
                  className="flex items-center gap-2 py-2 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/15 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.523 2.2l1.3 1.1-2.1 2.5a7.7 7.7 0 012.7 5.8h-2a5.7 5.7 0 00-2.5-4.6L12 10.1l-2.9-3.1A5.7 5.7 0 006.6 11.6h-2a7.7 7.7 0 012.7-5.8L5.2 3.3l1.3-1.1 2.9 3.1a7.6 7.6 0 015.2 0l2.9-3.1zM12 12.9c-2.2 0-4 1.8-4 4v4h8v-4c0-2.2-1.8-4-4-4z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[7px] text-emerald-200/60 leading-none">Install for</p>
                    <p className="text-[11px] font-semibold text-white leading-tight">Android</p>
                  </div>
                </a>
                <a
                  href={installPrompt ? undefined : '#'}
                  onClick={installPrompt ? handleInstallClick : undefined}
                  className="flex items-center gap-2 py-2 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/15 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 text-slate-300 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[7px] text-emerald-200/60 leading-none">Install for</p>
                    <p className="text-[11px] font-semibold text-white leading-tight">iOS</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Job Portal Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-3"
        >
          <a
            href="/login"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 hover:border-violet-500/50 text-violet-300 font-medium transition-all text-sm backdrop-blur-sm"
          >
            <Briefcase className="w-4 h-4" />
            Job Portal — View Openings & Apply
            <ArrowRight className="w-3 h-3" />
          </a>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-4 flex items-center justify-center gap-4"
        >
          {TRUST_BADGES.map((badge) => (
            <div key={badge.label} className="flex items-center gap-1 text-emerald-200/30 hover:text-emerald-200/60 transition-colors">
              <badge.icon className="w-3 h-3" />
              <span className="text-[9px] font-medium">{badge.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Footer Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-3 flex items-center justify-center gap-x-4 gap-y-1 text-[11px]"
        >
          <a href="mailto:support@marqai.com" className="text-emerald-200/40 hover:text-emerald-300 transition-colors flex items-center gap-1">
            <Mail className="w-3 h-3" />
            Support
          </a>
          <a href="mailto:privacy@marqai.com" className="text-emerald-200/40 hover:text-emerald-300 transition-colors">Privacy</a>
          <a href="mailto:legal@marqai.com" className="text-emerald-200/40 hover:text-emerald-300 transition-colors">Terms</a>
        </motion.div>

        {/* Copyright */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-emerald-200/30 text-xs mt-3 mb-4"
        >
          &copy; {new Date().getFullYear()} MARQ AI. All rights reserved.
        </motion.p>
      </div>
    </div>
  );
}
