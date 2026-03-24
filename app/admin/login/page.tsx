"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/contexts/auth-context';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail, Anchor } from 'lucide-react';

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const { user, login } = useAuth();

  // Handle redirect if user is already logged in
  React.useEffect(() => {
    if (user) {
      router.push('/admin');
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      router.push('/admin');
    } else {
      setError(result.error || 'Login failed');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6 bg-[url('/assets/hero-bg.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-primary/90 backdrop-blur-sm" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white p-10 border border-white/10 shadow-2xl overflow-hidden">
          {/* Logo */}
          <div className="text-center mb-10">
             <div className="flex items-center justify-center gap-3 mb-4">
                <Anchor className="w-10 h-10 text-accent" />
                <h1 className="text-3xl font-bold text-primary tracking-tighter uppercase">Corona Marine</h1>
             </div>
             <p className="text-[10px] font-bold text-accent tracking-[0.4em] uppercase">Admin Login</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold uppercase tracking-widest">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="admin@coronamarine.com"
                  className="w-full px-4 py-4 pl-12 border border-border focus:border-accent outline-none text-sm transition-all bg-muted/20"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter secure password"
                  className="w-full px-4 py-4 pl-12 pr-12 border border-border focus:border-accent outline-none text-sm transition-all bg-muted/20"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-accent hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-primary text-white font-bold text-xs uppercase tracking-[0.3em] hover:bg-accent transition-all shadow-xl disabled:opacity-50"
            >
               {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-border text-center">
             <Link href="/" className="text-[10px] font-extrabold uppercase tracking-widest text-primary hover:text-accent transition-colors">Return to Home Page</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
