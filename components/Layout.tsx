
import React, { useState, useEffect } from 'react';
import { Map, Recycle, User, Trophy, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('ecobalance-theme');
    if (saved === 'dark' || saved === 'light') return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ecobalance-user');
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('ecobalance-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isPremium = currentUser?.isPremium || localStorage.getItem('starling-premium') === 'true';

  const navItems = [
    { icon: <Map size={24} />, label: 'Discover', path: '/' },
    { icon: <Recycle size={24} />, label: 'Eco-Waste', path: '/waste' },
    { icon: <Trophy size={24} />, label: 'Leaderboard', path: '/leaderboard' },
    { icon: <User size={24} />, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex justify-between items-center shadow-sm transition-colors duration-500">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 p-1.5 rounded-lg shadow-emerald-200 dark:shadow-emerald-900 shadow-md">
            <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight tracking-tight">EcoBalance</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter">AI Tourism Intel</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-90"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <Link to="/profile" className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-black text-xs border border-emerald-200 dark:border-emerald-800 relative transition-all active:scale-95">
            {currentUser?.name?.substring(0, 2).toUpperCase() || 'JD'}
            {isPremium && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white dark:border-slate-900" />
            )}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24 max-w-4xl mx-auto w-full text-slate-900 dark:text-slate-100 transition-colors duration-500">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-around items-center z-50 shadow-2xl transition-colors duration-500">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                isActive ? 'text-emerald-600 dark:text-emerald-400 scale-110' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
