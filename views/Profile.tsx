
import React, { useState, useEffect } from 'react';
import { Award, TreePine, MapPin, TrendingUp, ChevronRight, Globe, Shield, Zap, Target, CheckCircle2, Settings as SettingsIcon, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const [bottles, setBottles] = useState(() => parseInt(localStorage.getItem('starling-bottles') || '12'));

  useEffect(() => {
    const handleStorage = () => setBottles(parseInt(localStorage.getItem('starling-bottles') || '12'));
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const stats = [
    { label: 'Global Rank', value: '#248', icon: <TrophyIcon className="text-indigo-500" /> },
    { label: 'Eco Impact', value: '45.2kg', icon: <TreePine className="text-emerald-500" /> },
    { label: 'Bottles Earned', value: `${bottles}`, icon: <Droplets className="text-blue-500" /> },
  ];

  const weeklyChallenges = [
    { id: '1', title: 'Zero Waste Warrior', description: 'Log 3 waste collections this week', progress: 66, reward: '5 Bottles' },
    { id: '2', title: 'Quiet Explorer', description: 'Visit a place with noise level < 30', progress: 0, reward: '10 Bottles' },
    { id: '3', title: 'Segregation Master', description: 'Get a 95%+ quality score on a scan', progress: 100, reward: 'Badge Unlocked' },
  ];

  return (
    <div className="p-6 space-y-8 pb-20">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-400 border-4 border-white shadow-xl overflow-hidden">
              <img src="https://picsum.photos/seed/starling-user/200" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1.5 rounded-full border-2 border-white">
              <Shield size={16} />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Jane Starling</h1>
            <p className="text-slate-500 flex items-center gap-1 text-sm">
              <MapPin size={14} /> Amsterdam, NL
            </p>
            <div className="mt-2 flex gap-2">
              {/* Correctly implement user badge instead of misusing ScoreBadge component which expects DestinationStatus */}
              <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-black uppercase border border-emerald-200 dark:border-emerald-800 shadow-sm">
                Eco-Champ
              </div>
              <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                <Zap size={10} fill="currentColor" /> Lvl 14
              </div>
            </div>
          </div>
        </div>
        <Link 
          to="/settings"
          className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <SettingsIcon size={24} />
        </Link>
      </header>

      <section className="grid grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-2 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto">
              {stat.icon}
            </div>
            <div className="text-lg font-bold text-slate-800 dark:text-white">{stat.value}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Weekly Challenges */}
      <section className="space-y-4">
        <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Target size={18} className="text-indigo-500" />
          Weekly Challenges
        </h2>
        <div className="space-y-3">
          {weeklyChallenges.map(challenge => (
            <div key={challenge.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{challenge.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{challenge.description}</p>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2 py-1 rounded-lg uppercase">
                  {challenge.reward}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>Progress</span>
                  <span>{challenge.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${challenge.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${challenge.progress}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Award size={18} className="text-amber-500" /> Achievements
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          <Badge icon="🌱" label="Seed Sower" />
          <Badge icon="🛡️" label="Safe Scout" />
          <Badge icon="🚲" label="Low Carbon" />
          <Badge icon="🧴" label="Plastics Free" />
          <Badge icon="🏔️" label="Peak Protector" />
          <Badge icon="🎖️" label="Zero Waste" />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-slate-800 dark:text-white">Recent Activity</h2>
          <button className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">History</button>
        </div>
        <div className="space-y-3">
          <ActivityItem 
            title="Waste Verified: Kyoto" 
            subtitle="Earned 6 Water Bottles" 
            date="2 days ago" 
            type="waste"
          />
          <ActivityItem 
            title="Visited: Azores" 
            subtitle="Score: 18/100 (Safe)" 
            date="1 week ago" 
            type="trip"
          />
        </div>
      </section>

      <Link 
        to="/premium"
        className="bg-indigo-600 rounded-2xl p-6 text-white flex items-center justify-between shadow-indigo-200 dark:shadow-none shadow-xl active:scale-[0.98] transition-transform"
      >
        <div className="space-y-1">
          <h3 className="font-bold">Starling Premium Safety</h3>
          <p className="text-indigo-100 text-xs opacity-80">Access noise-level alerts 24h early.</p>
        </div>
        <ChevronRight className="text-indigo-300" />
      </Link>
    </div>
  );
};

const TrophyIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
    <path d="M4 22h16"></path>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
  </svg>
);

const Badge = ({ icon, label }: { icon: string, label: string }) => (
  <div className="flex flex-col items-center gap-2 shrink-0">
    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-3xl shadow-sm hover:scale-110 transition-transform">
      {icon}
    </div>
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter text-center w-16 leading-tight">{label}</span>
  </div>
);

const ActivityItem = ({ title, subtitle, date, type }: { title: string, subtitle: string, date: string, type: string }) => {
  const getIcon = () => {
    switch(type) {
      case 'waste': return <TreePine className="text-emerald-500" size={18} />;
      case 'trip': return <Globe className="text-blue-500" size={18} />;
      case 'badge': return <Award className="text-amber-500" size={18} />;
      default: return <Shield className="text-slate-500" size={18} />;
    }
  };

  return (
    <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1">
        <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</div>
      </div>
      <div className="text-[10px] font-bold text-slate-400 uppercase">{date}</div>
    </div>
  );
};

export default Profile;
