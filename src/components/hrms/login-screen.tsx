'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { ROLE_LABELS, type UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, UserCheck, Building2, Truck, Sparkles, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const DEMO_LOGINS: { role: UserRole; name: string; email: string; password: string; companyCode: string; icon: React.ReactNode; color: string }[] = [
  { role: 'super_admin', name: 'MARQ Admin', email: 'admin@marqai.com', password: 'admin123', companyCode: 'MARQ', icon: <Shield className="h-4 w-4" />, color: 'bg-red-500 hover:bg-red-600' },
  { role: 'company_hr_admin', name: 'Sarah Johnson', email: 'sarah.j@techcorp.com', password: 'sarah123', companyCode: 'TCG', icon: <Users className="h-4 w-4" />, color: 'bg-purple-500 hover:bg-purple-600' },
  { role: 'employee', name: 'Raj Patel', email: 'raj.p@techcorp.com', password: 'raj123', companyCode: 'TCG', icon: <UserCheck className="h-4 w-4" />, color: 'bg-emerald-500 hover:bg-emerald-600' },
  { role: 'client', name: 'Acme Corp', email: 'hr@acme.com', password: 'acme123', companyCode: 'ACME', icon: <Building2 className="h-4 w-4" />, color: 'bg-amber-500 hover:bg-amber-600' },
  { role: 'vendor', name: 'TalentHunt', email: 'info@talenthunt.com', password: 'thunt123', companyCode: 'TCG', icon: <Truck className="h-4 w-4" />, color: 'bg-teal-500 hover:bg-teal-600' },
];

export function LoginScreen() {
  const router = useRouter();
  const { isLoading, authError, login } = useAppStore();
  const [email, setEmail] = useState('admin@marqai.com');
  const [password, setPassword] = useState('admin123');
  const [companyCode, setCompanyCode] = useState('MARQ');
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) return;
    setLocalLoading(true);
    setLocalError('');

    try {
      // Sign in via NextAuth to create a server session
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

      // Also update the Zustand store
      await login(email, password);

      // Navigate to dashboard
      router.push('/');
      router.refresh();
    } catch {
      setLocalError('Network error. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleQuickLogin = async (role: UserRole, name: string, email: string, password: string, code: string) => {
    setEmail(email);
    setPassword(password);
    setCompanyCode(code);

    setLocalLoading(true);
    setLocalError('');

    try {
      // Sign in via NextAuth with companyCode
      const result = await signIn('credentials', { email, password, companyCode: code.toUpperCase(), redirect: false });

      if (result?.error) {
        setLocalError('Invalid credentials');
        setLocalLoading(false);
        return;
      }

      // Update Zustand store
      await login(email, password);

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
          className="text-center mb-8"
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl shadow-2xl shadow-emerald-500/30 mb-4"
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="h-10 w-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white tracking-tight">eh2r AI</h1>
          <p className="text-emerald-200/80 mt-2 text-sm font-medium uppercase tracking-[0.2em]">An AI Product of MARQ AI</p>
        </motion.div>

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
                <Input
                  value={companyCode}
                  onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your company code"
                  className="bg-white/10 border-white/20 text-white placeholder:text-emerald-200/50 focus:border-emerald-400 uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-emerald-100 text-sm font-medium">Email</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your email"
                  type="email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-emerald-200/50 focus:border-emerald-400"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-emerald-100 text-sm font-medium">Password</Label>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your password"
                  type="password"
                  className="bg-white/10 border-white/20 text-white placeholder:text-emerald-200/50 focus:border-emerald-400"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-300 text-sm bg-red-500/10 rounded-md p-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
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

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-transparent px-2 text-emerald-200/70">Quick Demo Login</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {DEMO_LOGINS.map((demo) => (
                  <motion.button
                    key={demo.role}
                    onClick={() => handleQuickLogin(demo.role, demo.name, demo.email, demo.password, demo.companyCode)}
                    className={`${demo.color} text-white rounded-lg px-3 py-2.5 text-xs font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : demo.icon}
                    {ROLE_LABELS[demo.role]}
                  </motion.button>
                ))}
              </div>

              <p className="text-center text-emerald-200/50 text-xs mt-2">
                Database-backed authentication with real data
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-emerald-200/40 text-xs mt-6"
        >
          &copy; {new Date().getFullYear()} MARQ AI. All rights reserved.
        </motion.p>
      </div>
    </div>
  );
}
