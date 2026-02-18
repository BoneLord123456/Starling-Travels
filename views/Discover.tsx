
import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Wind, Users, SortAsc, Filter, Crown, Sparkles, Volume2, Loader2, Activity } from 'lucide-react';
import { apiService } from '../services/apiService';
import ScoreBadge from '../components/ScoreBadge';
import { Link } from 'react-router-dom';
import { Destination, DestinationStatus } from '../types';

const Discover = () => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'safety' | 'cost' | 'noise'>('safety');
  const [filterStatus, setFilterStatus] = useState<DestinationStatus | 'All'>('All');
  const [isPremium, setIsPremium] = useState(() => localStorage.getItem('starling-premium') === 'true');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    const data = await apiService.getDestinations();
    setDestinations([...data]);
    if (isInitial) setLoading(false);
  };

  useEffect(() => {
    fetchData(true);

    // 5-second polling for real-time feeling
    const pollInterval = setInterval(() => fetchData(false), 5000);

    const handleStorage = () => setIsPremium(localStorage.getItem('starling-premium') === 'true');
    window.addEventListener('storage', handleStorage);
    
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const statusPriority: Record<DestinationStatus, number> = {
    'Recommended': 0,
    'Caution Advised': 1,
    'Risky': 2,
    'Not Recommended': 3
  };

  const filtered = destinations
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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80";
  };

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500">
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Eco Explorer</h1>
          {!isPremium ? (
            <Link to="/premium" className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-bold border border-amber-200 dark:border-amber-800 transition-transform active:scale-95">
              <Crown size={14} /> Get Premium
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <Sparkles size={14} /> Premium Active
            </div>
          )}
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search global destinations..." 
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:text-white transition-all shadow-sm"
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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-emerald-500" size={40} />
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Fetching Environmental Intel...</p>
        </div>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2">
          {filtered.map((dest) => {
            const isPriority = isPremium && dest.status === 'Recommended';
            const isLive = dest.id === 'demo-place-live';
            return (
              <Link 
                key={dest.id} 
                to={`/destination/${dest.id}`}
                className={`group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border transition-all duration-300 ${
                  isPriority ? 'border-emerald-500 ring-4 ring-emerald-500/5' : 'border-slate-200 dark:border-slate-800'
                } hover:shadow-2xl hover:-translate-y-1`}
              >
                <div className="h-56 overflow-hidden relative">
                  <img 
                    src={dest.image} 
                    alt={dest.name} 
                    onError={handleImageError}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  
                  {isLive && (
                    <div className="absolute top-4 right-4 bg-rose-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 shadow-lg z-10 animate-pulse">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" /> LIVE FEED
                    </div>
                  )}

                  {!isLive && isPriority && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 shadow-lg z-10">
                      <Sparkles size={10} /> Safe Haven
                    </div>
                  )}

                  <div className="absolute top-4 left-4 flex gap-2 z-10">
                    <ScoreBadge status={dest.status} size="sm" />
                  </div>

                  <div className="absolute bottom-4 left-4 text-white z-10">
                    <div className="text-[10px] font-black opacity-80 uppercase tracking-[0.2em]">{dest.country}</div>
                    <div className="text-2xl font-black tracking-tight">{dest.name}</div>
                  </div>
                  
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-white text-[10px] font-black border border-white/20 z-0">
                    ${dest.baseCostPerDay}/day
                  </div>
                </div>
                
                <div className="p-5 space-y-4">
                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed font-medium">
                    {dest.description}
                  </p>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <Wind size={16} className={dest.metrics.airQualityAQI < 50 ? 'text-emerald-500' : dest.metrics.airQualityAQI < 100 ? 'text-amber-500' : 'text-rose-500'} />
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black mt-1 uppercase tracking-tighter">{Math.round(dest.metrics.airQualityAQI)} AQI</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Users size={16} className={dest.metrics.crowdDensity < 1 ? 'text-emerald-500' : 'text-rose-500'} />
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black mt-1 uppercase tracking-tighter">{dest.metrics.crowdDensity.toFixed(1)}/m²</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Volume2 size={16} className={dest.metrics.noiseDB < 50 ? 'text-emerald-500' : 'text-rose-500'} />
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black mt-1 uppercase tracking-tighter">{Math.round(dest.metrics.noiseDB)} dB</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-widest group-hover:gap-2 transition-all">
                      Detail <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </div>
  );
};

const FilterButton = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon?: any }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
      active 
        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-200 dark:shadow-none' 
        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default Discover;
