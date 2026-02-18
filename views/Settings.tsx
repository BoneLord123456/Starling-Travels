
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Bell, Shield, Moon, ChevronRight, LogOut, Info } from 'lucide-react';
import { apiService } from '../services/apiService';

const Settings = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await apiService.logout();
    window.location.reload(); // Hard reload to trigger onboarding state
  };

  const menuItems = [
    { 
      icon: <CreditCard className="text-indigo-500" size={20} />, 
      title: 'Subscription', 
      desc: 'Manage your premium plan and billing',
      path: '/settings/subscription'
    },
    { 
      icon: <Bell className="text-blue-500" size={20} />, 
      title: 'Notifications', 
      desc: 'Alerts for low-crowd and high-risk',
      path: '#'
    },
    { 
      icon: <Shield className="text-emerald-500" size={20} />, 
      title: 'Privacy & Security', 
      desc: 'Control your password and data',
      path: '#'
    },
    { 
      icon: <Moon className="text-purple-500" size={20} />, 
      title: 'Display', 
      desc: 'Dark mode and accessibility settings',
      path: '#'
    }
  ];

  return (
    <div className="p-6 space-y-8 pb-32 max-w-2xl mx-auto animate-in fade-in duration-500">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all active:scale-90">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Settings</h1>
      </header>

      <section className="space-y-3">
        {menuItems.map((item, idx) => (
          <Link 
            key={idx} 
            to={item.path}
            className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all shadow-sm active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                {item.icon}
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-800 dark:text-slate-100">{item.title}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{item.desc}</div>
              </div>
            </div>
            <ChevronRight className="text-slate-300 dark:text-slate-600" size={20} />
          </Link>
        ))}
      </section>

      <section className="pt-4 space-y-3">
        <h3 className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Support</h3>
        <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all active:scale-95">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <Info className="text-slate-500" size={20} />
            </div>
            <div className="font-bold text-slate-800 dark:text-slate-100">Help Center</div>
          </div>
          <ChevronRight className="text-slate-300" size={20} />
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-4 text-rose-500 font-black uppercase tracking-widest bg-rose-50 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-900/30 active:scale-[0.98] transition-all"
        >
          <LogOut size={20} />
          Log Out
        </button>
      </section>

      <footer className="text-center pt-8">
        <div className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">
          EcoBalance v1.2.0 (Global Edition)
        </div>
      </footer>
    </div>
  );
};

export default Settings;
