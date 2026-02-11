
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MOCK_DESTINATIONS, MOCK_ROUTES, EXPERIENCE_IMAGES } from '../constants';
import { getTripOptimizationInsight } from '../services/geminiService';
import { ArrowLeft, Users, Calendar, Wallet, Loader2, Plane, Train, Car, Shuffle, Info, Sparkles, TrendingUp, ChevronRight, CheckCircle2, Crown, Lock, LayoutPanelLeft } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const TripOptimizer = () => {
  const { destId } = useParams<{ destId: string }>();
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = useState(() => localStorage.getItem('starling-premium') === 'true');
  const destination = MOCK_DESTINATIONS.find(d => d.id === destId);

  const [travelers, setTravelers] = useState(1);
  const [duration, setDuration] = useState(7);
  const [budget, setBudget] = useState(1000);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationData, setOptimizationData] = useState<any>(null);

  useEffect(() => {
    const handleStorage = () => setIsPremium(localStorage.getItem('starling-premium') === 'true');
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const routes = destination ? MOCK_ROUTES(destination.name) : [];

  const handleOptimize = async () => {
    if (!destination) return;
    setIsOptimizing(true);
    const data = await getTripOptimizationInsight(destination, budget, travelers, duration);
    setOptimizationData(data);
    setIsOptimizing(false);
  };

  if (!destination) return <div className="p-8">Destination not found.</div>;

  return (
    <div className="p-6 space-y-8 pb-32 max-w-2xl mx-auto">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Safe Trip Planner</h1>
          <p className="text-sm text-slate-500">Optimizing for {destination.name}</p>
        </div>
      </header>

      {/* Premium Multi-Compare Toggle */}
      <div className="flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800">
        <div className="flex items-center gap-2">
          <LayoutPanelLeft className="text-indigo-600 dark:text-indigo-400" size={20} />
          <div>
            <div className="text-sm font-bold">Side-by-Side Comparison</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Premium Feature</div>
          </div>
        </div>
        {!isPremium ? (
          <Link to="/premium" className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1">
            <Lock size={12} /> Unlock
          </Link>
        ) : (
          <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">
            Start Comparing
          </button>
        )}
      </div>

      {/* 1. Trip Parameters */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5"><Users size={12}/> Travelers</label>
            <input 
              type="number" min="1" value={travelers} 
              onChange={(e) => setTravelers(parseInt(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5"><Calendar size={12}/> Days</label>
            <input 
              type="number" min="1" value={duration} 
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 font-bold"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5"><Wallet size={12}/> Total Budget ($)</label>
            <span className="text-xs text-indigo-500 font-bold">Min Baseline: ${destination.baseCostPerDay * duration * travelers}</span>
          </div>
          <input 
            type="range" min={destination.baseCostPerDay * duration * travelers} max={10000} step={100} value={budget} 
            onChange={(e) => setBudget(parseInt(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <div className="text-center font-black text-3xl text-indigo-600 tracking-tight">${budget}</div>
        </div>
      </section>

      {/* 2. Route Selection */}
      <section className="space-y-4">
        <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <TrendingUp size={18} className="text-indigo-500" /> Choose Your Path
        </h2>
        <div className="grid gap-3">
          {routes.map(route => (
            <div 
              key={route.id}
              onClick={() => setSelectedRoute(route.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                selectedRoute === route.id 
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 ring-2 ring-indigo-500/20' 
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
              }`}
            >
              <div className={`p-3 rounded-xl ${
                route.type === 'rail' ? 'bg-emerald-100 text-emerald-600' : 
                route.type === 'air' ? 'bg-blue-100 text-blue-600' : 
                'bg-slate-100 text-slate-600'
              }`}>
                {route.type === 'rail' ? <Train size={24}/> : route.type === 'air' ? <Plane size={24}/> : route.type === 'road' ? <Car size={24}/> : <Shuffle size={24}/>}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="font-bold capitalize">{route.type} Route</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-black">${route.price}</span>
                </div>
                <div className="flex gap-3 mt-1 text-[10px] text-slate-400 font-bold uppercase">
                  <span>{route.time}</span>
                  <span className={route.ecoScore > 80 ? 'text-emerald-500' : ''}>Eco: {route.ecoScore}</span>
                  <span>Safety: {route.safety}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <button 
        onClick={handleOptimize}
        disabled={isOptimizing || !selectedRoute}
        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all disabled:opacity-50"
      >
        {isOptimizing ? <Loader2 className="animate-spin" /> : <Sparkles />}
        {isOptimizing ? 'Simulating Scenarios...' : 'Run Safety & Experience Simulation'}
      </button>

      {/* 3. AI Insights Result */}
      {optimizationData && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          <section className="bg-indigo-600 p-6 rounded-2xl text-white space-y-4">
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-widest">
              <Sparkles size={16} /> AI Truth Simulation
            </div>
            <p className="text-lg font-medium leading-relaxed">
              {optimizationData.overview}
            </p>
            <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/20">
              <div className="space-y-1">
                <div className="text-[10px] opacity-70 font-bold uppercase">Balanced Budget Recommendation</div>
                <div className="text-2xl font-black">${optimizationData.balancedBudget}</div>
              </div>
              <Info size={24} className="opacity-50" />
            </div>
          </section>

          {/* Budget Breakdown Chart */}
          <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold mb-6 flex items-center gap-2"><Wallet size={16} /> Spending Breakdown</h3>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="h-48 w-48 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={Object.entries(optimizationData.breakdown).map(([k, v]) => ({ name: k, value: v }))} 
                      innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                    >
                      {['#4f46e5', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'].map((c, i) => <Cell key={i} fill={c} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full">
                {Object.entries(optimizationData.breakdown).map(([key, val], i) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{key}</span>
                    <span className="font-bold text-slate-800 dark:text-white">${val as number}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Experience Preview Cards */}
          <section className="space-y-4">
            <h3 className="font-bold flex items-center gap-2"><Shuffle size={16} /> Experience Preview ({optimizationData.experienceTier})</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-32 rounded-xl overflow-hidden shadow-sm">
                  <img src={optimizationData.experienceTier === 'Premium' ? EXPERIENCE_IMAGES.food.premium : optimizationData.experienceTier === 'Standard' ? EXPERIENCE_IMAGES.food.standard : EXPERIENCE_IMAGES.food.budget} alt="Food" className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] text-center block font-bold text-slate-400 uppercase">Dining Style</span>
              </div>
              <div className="space-y-2">
                <div className="h-32 rounded-xl overflow-hidden shadow-sm">
                  <img src={optimizationData.experienceTier === 'Premium' ? EXPERIENCE_IMAGES.stay.premium : optimizationData.experienceTier === 'Standard' ? EXPERIENCE_IMAGES.stay.standard : EXPERIENCE_IMAGES.stay.budget} alt="Stay" className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] text-center block font-bold text-slate-400 uppercase">Accommodation</span>
              </div>
            </div>
          </section>

          <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
            <CheckCircle2 size={18} /> Confirm This Itinerary
          </button>
        </div>
      )}
    </div>
  );
};

export default TripOptimizer;
