
import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Wind, Users, SortAsc, Filter, Crown, Sparkles, Volume2 } from 'lucide-react';
import { MOCK_DESTINATIONS } from '../constants';
import ScoreBadge from '../components/ScoreBadge';
import { Link } from 'react-router-dom';
import { DestinationStatus } from '../types';

const Discover = () => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'safety' | 'cost' | 'noise'>('safety');
  const [filterStatus, setFilterStatus] = useState<DestinationStatus | 'All'>('All');
  const [isPremium, setIsPremium] = useState(() => localStorage.getItem('starling-premium') === 'true');

  useEffect(() => {
    const handleStorage = () => setIsPremium(localStorage.getItem('starling-premium') === 'true');
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const statusPriority: Record<DestinationStatus, number> = {
    'Recommended': 0,
    'Caution Advised': 1,
    'Risky': 2,
    'Not Recommended': 3
  };

  const filtered = MOCK_DESTINATIONS
    .filter(d => 
      (d.name.toLowerCase().includes(search.toLowerCase()) || d.country.toLowerCase().includes(search.toLowerCase())) &&
      (filterStatus === 'All' ? true : d.status === filterStatus)
    )
    .sort((a, b) => {
      if (sortBy === 'safety') return statusPriority[a.status] - statusPriority[b.status];
      if (sortBy === 'cost') return a.baseCostPerDay - b.baseCostPerDay;
      if (sortBy === 'noise') return a.metrics.noiseDB - b.metrics.noiseDB;
      return 0;
    });

  return (
    <div className="p-4 space-y-6">
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Travel Safe</h1>
          {!isPremium ? (
            <Link to="/premium" className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-bold border border-amber-200">
              <Crown size={14} /> Get Premium
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold border border-emerald-200">
              <Sparkles size={14} /> Premium Active
            </div>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search verified destinations..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <FilterButton active={sortBy === 'safety'} onClick={() => setSortBy('safety')} label="Safest First" icon={<SortAsc size={14}/>} />
          <FilterButton active={sortBy === 'cost'} onClick={() => setSortBy('cost')} label="Budget Friendly" icon={<SortAsc size={14}/>} />
          <FilterButton active={filterStatus === 'Recommended'} onClick={() => setFilterStatus(filterStatus === 'Recommended' ? 'All' : 'Recommended')} label="Recommended Only" icon={<Filter size={14}/>} />
        </div>
      </section>

      <section className="grid gap-6">
        {filtered.map((dest) => {
          const isPriority = isPremium && dest.status === 'Recommended';
          return (
            <Link 
              key={dest.id} 
              to={`/destination/${dest.id}`}
              className={`group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border transition-all ${
                isPriority ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200 dark:border-slate-800'
              } hover:shadow-xl`}
            >
              <div className="h-48 overflow-hidden relative">
                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {isPriority && (
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white px-2 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 shadow-lg">
                    <Sparkles size={10} /> Safe Haven
                  </div>
                )}

                <div className="absolute top-4 left-4 flex gap-2">
                  <ScoreBadge status={dest.status} size="sm" />
                </div>

                <div className="absolute bottom-4 left-4 text-white">
                  <div className="text-xs font-bold opacity-80 uppercase tracking-widest">{dest.country}</div>
                  <div className="text-xl font-bold">{dest.name}</div>
                </div>
                
                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-2 py-1 rounded text-white text-[10px] font-bold border border-white/20">
                  ${dest.baseCostPerDay}/day
                </div>
              </div>
              
              <div className="p-4">
                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                  {dest.description}
                </p>

                <div className="flex justify-between items-center">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <Wind size={14} className={dest.metrics.airQualityAQI < 50 ? 'text-indigo-500' : 'text-slate-400'} />
                      <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{dest.metrics.airQualityAQI} AQI</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Users size={14} className={dest.metrics.crowdDensity < 1 ? 'text-indigo-500' : 'text-slate-400'} />
                      <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{dest.metrics.crowdDensity}/m²</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Volume2 size={14} className={dest.metrics.noiseDB < 50 ? 'text-indigo-500' : 'text-slate-400'} />
                      <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{dest.metrics.noiseDB} dB</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                    View Safest Plan <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
};

const FilterButton = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon?: any }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
      active 
        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100 dark:shadow-none' 
        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default Discover;
