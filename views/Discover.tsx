
import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Wind, SortAsc, Filter, Crown, Sparkles, Volume2, Loader2, Zap, MapPin, Map } from 'lucide-react';
import { apiService } from '../services/apiService';
import ScoreBadge from '../components/ScoreBadge';
import { Link, useNavigate } from 'react-router-dom';
import { Destination, DestinationStatus, Booking } from '../types';

const Discover = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'safety' | 'cost' | 'noise'>('safety');
  const [filterStatus, setFilterStatus] = useState<DestinationStatus | 'All'>('All');
  const [isPremium, setIsPremium] = useState(() => localStorage.getItem('starling-premium') === 'true');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [activeTrip, setActiveTrip] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    const data = await apiService.getDestinations();
    const trip = await apiService.getActiveBooking();
    setDestinations([...data]);
    setActiveTrip(trip);
    if (isInitial) setLoading(false);
  };

  useEffect(() => {
    fetchData(true);
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

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500">
      {/* Show Current Trip Button - Only visible if activeTrip exists */}
      {activeTrip && (
        <button 
          onClick={() => navigate('/trip-dashboard')}
          className="w-full bg-emerald-600 dark:bg-emerald-500 text-white p-5 rounded-3xl flex items-center justify-between shadow-2xl shadow-emerald-500/20 border border-emerald-400/30 transition-all hover:scale-[1.01] active:scale-[0.98] animate-in slide-in-from-top-4 duration-700"
        >
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
                <MapPin size={24} className="text-white" />
             </div>
             <div className="text-left space-y-0.5">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100">Live Expedition Data</div>
                <div className="text-lg font-black tracking-tight">Show Current Trip</div>
             </div>
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
            <ArrowRight size={20} />
          </div>
        </button>
      )}

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Global Intel</h1>
          {!isPremium ? (
            <Link to="/premium" className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-200 dark:border-amber-800">
              <Crown size={14} /> Unlock Truth
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-800">
              <Sparkles size={14} /> Premium Active
            </div>
          )}
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search low-impact destinations..." 
            className="w-full pl-12 pr-4 py-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:text-white transition-all shadow-sm font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <FilterButton active={sortBy === 'safety'} onClick={() => setSortBy('safety')} label="Safest" icon={<SortAsc size={14}/>} />
          <FilterButton active={sortBy === 'cost'} onClick={() => setSortBy('cost')} label="Budget" icon={<SortAsc size={14}/>} />
          <FilterButton active={filterStatus === 'Recommended'} onClick={() => setFilterStatus(filterStatus === 'Recommended' ? 'All' : 'Recommended')} label="Recommended" icon={<Filter size={14}/>} />
        </div>
      </section>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <Loader2 className="animate-spin text-emerald-500" size={48} />
          <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">Syncing Environmental Feed...</p>
        </div>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2">
          {filtered.map((dest) => (
            <Link 
              key={dest.id} 
              to={`/destination/${dest.id}`}
              className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 shadow-sm"
            >
              <div className="h-64 overflow-hidden relative">
                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent" />
                <div className="absolute top-5 left-5"><ScoreBadge status={dest.status} size="sm" /></div>
                <div className="absolute bottom-6 left-6 text-white space-y-1">
                  <div className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em]">{dest.country}</div>
                  <div className="text-2xl font-black tracking-tighter leading-none">{dest.name}</div>
                </div>
                <div className="absolute bottom-6 right-6">
                   <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-xl transition-transform group-hover:rotate-12">
                      <ArrowRight size={20} />
                   </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center">
                  <div className="flex gap-4">
                    <Metric icon={<Wind size={14}/>} value={dest.metrics.airQualityAQI} label="AQI" />
                    <Metric icon={<Zap size={14}/>} value={dest.metrics.ecoStress} label="Stress" />
                    <Metric icon={<Volume2 size={14}/>} value={dest.metrics.noiseDB} label="dB" />
                  </div>
                  <div className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-tighter">₹{dest.baseCostPerDay * 80}/day</div>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
};

const Metric = ({ icon, value, label }: { icon: any, value: number, label: string }) => (
  <div className="flex items-center gap-1.5 text-slate-500">
    <div className="text-slate-400">{icon}</div>
    <span className="text-xs font-black text-slate-700 dark:text-slate-300">{value.toFixed(0)}</span>
    <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">{label}</span>
  </div>
);

const FilterButton = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon?: any }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
      active ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default Discover;
