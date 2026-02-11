
import React, { useState } from 'react';
import { ShieldCheck, User, Mail, ArrowRight, Sparkles, Globe, Lock, Eye, EyeOff } from 'lucide-react';

interface OnboardingProps {
  onComplete: (user: { name: string; email: string; passwordHash: string }) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(false);

  // Simulated hash function for secure-ish storage
  const hashPassword = (pass: string) => btoa(pass + "_salt");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name && !isLogin) {
      setError('Please enter your full name.');
      return;
    }
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    
    // In a real app, logic would differ between login/signup
    onComplete({ 
      name: isLogin ? (localStorage.getItem('ecobalance-user') ? JSON.parse(localStorage.getItem('ecobalance-user')!).name : 'Returning Traveler') : name, 
      email, 
      passwordHash: hashPassword(password) 
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors duration-500">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-4">
          <div className="bg-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
            <Globe className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">EcoBalance AI</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {isLogin ? 'Log in to your tourism profile.' : 'Secure your intelligence-driven tourism profile.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <User size={12} /> Full Name
                </label>
                <input 
                  type="text" 
                  placeholder="Jane Doe"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:text-white transition-colors"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Mail size={12} /> Email Address
              </label>
              <input 
                type="email" 
                placeholder="jane@example.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:text-white transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Lock size={12} /> Password
              </label>
              <div className="relative">
                <input 
                  type={showPass ? "text" : "password"} 
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:text-white transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {error && <p className="text-rose-500 text-xs font-bold text-center">{error}</p>}

          <button 
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200 dark:shadow-none group"
          >
            {isLogin ? 'Log In' : 'Create Account'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="text-center">
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
            </button>
          </div>
        </form>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-tighter">
            <ShieldCheck size={14} className="text-emerald-500" /> Secure Data Storage
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-tighter">
            <Sparkles size={14} className="text-amber-500" /> AI-Verified Metrics
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
