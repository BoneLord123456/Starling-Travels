
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MOCK_DESTINATIONS } from '../constants';
import ScoreBadge from '../components/ScoreBadge';
import { getDestinationAIOverview } from '../services/geminiService';
import { Wind, Droplets, Users, Building2, ShieldCheck, Sparkles, Loader2, Megaphone, MessageSquare, Star, UsersRound, MessageCircleWarning, Map, Lock, Crown, AlertTriangle, ArrowLeft, Volume2, TreePine } from 'lucide-react';

const DestinationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [aiData, setAiData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(() => localStorage.getItem('starling-premium') === 'true');

  const destination = MOCK_DESTINATIONS.find(d => d.id === id);
  if (!destination) return <div className="p-4 text-center py-20">Destination not found</div>;

  const alternatives = MOCK_DESTINATIONS
    .filter(d => d.id !== id && d.status === 'Recommended')
    .slice(0, 2);

  useEffect(() => {
    const fetchAI = async () => {
      setLoading(true);
      const res = await getDestinationAIOverview(destination, alternatives);
      setAiData(res);
      setLoading(false);
    };
    fetchAI();
    window.scrollTo(0,0);
  }, [id]);

  useEffect(() => {
    const handleStorage = () => setIsPremium(localStorage.getItem('starling-premium') === 'true');
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="relative h-64 md:h-80">
        <img src={destination.image} alt={destination.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-4 left-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
            <ArrowLeft size={20} />
          </button>
        </div>
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1 shadow-sm">{destination.name}</h1>
            <p className="text-white/80">{destination.country}</p>
          </div>
          <ScoreBadge status={destination.status} size="lg" />
        </div>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Premium Risk Alert */}
        {destination.isRiskDropping && (
          <div className="relative overflow-hidden bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl p-5">
            {!isPremium && <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <Link to="/premium" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg">
                <Crown size={14} /> Unlock Premium Early Warning
              </Link>
            </div>}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-100 dark:bg-rose-800 rounded-xl text-rose-600 dark:text-rose-300">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="font-bold text-rose-700 dark:text-rose-400">Environmental Volatility</h4>
                <p className="text-xs text-rose-600 dark:text-rose-500 font-medium">Sensor trends indicate a likely deterioration in metrics forecasted for next month.</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Action Bar */}
        <section className="space-y-4">
          <Link 
            to={`/plan/${destination.id}`}
            className="w-full flex items-center justify-center gap-2 p-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-bold hover:bg-black transition-colors shadow-xl"
          >
            <Map size={20} />
            Optimize My Safest Trip Plan
          </Link>
          <div className="grid grid-cols-2 gap-4">
            <Link 
              to={`/guides/${destination.id}`}
              className="flex items-center justify-center gap-2 p-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg"
            >
              <UsersRound size={20} />
              Hire Guide
            </Link>
            <Link 
              to={`/ai-chat/${destination.id}`}
              className={`flex items-center justify-center gap-2 p-4 rounded-2xl font-bold transition-all shadow-lg ${
                isPremium 
                  ? 'bg-rose-500 text-white hover:bg-rose-600' 
                  : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-200'
              }`}
            >
              {isPremium ? <MessageCircleWarning size={20} /> : <Lock size={20} />}
              {isPremium ? 'Honest AI' : 'Truth Mode'}
            </Link>
          </div>
        </section>

        {/* Local Signals */}
        {destination.localSignals.length > 0 && (
          <section className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm uppercase tracking-wider">
              <Megaphone size={18} />
              <span>Real-time Local Signals</span>
            </div>
            <div className="space-y-2">
              {destination.localSignals.map((signal, idx) => (
                <div key={idx} className="flex gap-2 text-amber-900 dark:text-amber-100 text-sm bg-white/50 dark:bg-white/5 p-2 rounded-lg border border-amber-100 dark:border-amber-900/50">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                  {signal}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* AI Analysis */}
        <section className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 text-indigo-200 dark:text-indigo-800">
            <Sparkles size={40} />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-400 font-bold uppercase text-xs tracking-widest">
              <Sparkles size={16} />
              <span>EcoBalance AI Analysis</span>
            </div>
            
            {loading ? (
              <div className="flex items-center gap-3 py-4 text-indigo-600 dark:text-indigo-400">
                <Loader2 size={24} className="animate-spin" />
                <span className="font-medium">Synthesizing raw sensor data...</span>
              </div>
            ) : (
              <>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-lg">
                  {aiData?.summary || "Interpreting real-world environmental metrics..."}
                </p>
                {isPremium && (
                   <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl text-sm text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800 flex items-start gap-3">
                    <ShieldCheck size={18} className="shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Premium Logic:</span> Safety classification is <span className="underline">{destination.status}</span>. Analysis of raw AQI and PPM levels suggests minimal exposure risks for off-peak visiting.
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Metrics Grid */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <MetricCard 
            icon={<Wind size={18} />} 
            label="Air Quality" 
            value={destination.metrics.airQualityAQI} 
            unit="AQI" 
            thresholds={{ good: 50, mod: 100 }}
          />
          <MetricCard 
            icon={<Droplets size={18} />} 
            label="Water" 
            value={destination.metrics.waterPPM} 
            unit="PPM"
            thresholds={{ good: 100, mod: 300 }}
          />
          <MetricCard 
            icon={<TreePine size={18} />} 
            label="Soil" 
            value={destination.metrics.soilPPM} 
            unit="PPM"
            thresholds={{ good: 50, mod: 150 }}
          />
          <MetricCard 
            icon={<Volume2 size={18} />} 
            label="Noise" 
            value={destination.metrics.noiseDB} 
            unit="dB"
            thresholds={{ good: 50, mod: 75 }}
          />
          <MetricCard 
            icon={<Users size={18} />} 
            label="Crowds" 
            value={destination.metrics.crowdDensity} 
            unit="per m²"
            thresholds={{ good: 0.5, mod: 2.0 }}
          />
          <MetricCard 
            icon={<Building2 size={18} />} 
            label="Infra Load" 
            value={destination.metrics.infraLoad} 
            unit="%"
            thresholds={{ good: 30, mod: 70 }}
          />
        </section>

        {/* Community Feedback */}
        <section className="space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <MessageSquare size={18} className="text-indigo-500" />
            Community Insights
          </h3>
          <div className="space-y-3">
            {destination.communityFeedback.map((fb) => (
              <div key={fb.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{fb.user}</span>
                  <div className="flex gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < fb.rating ? "currentColor" : "none"} />)}
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{fb.comment}"</p>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{fb.date}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, unit, thresholds }: { icon: any, label: string, value: number, unit: string, thresholds: { good: number, mod: number } }) => {
  const getLabelAndColor = () => {
    if (value <= thresholds.good) return { text: 'Excellent', color: 'text-emerald-500', bg: 'bg-emerald-500' };
    if (value <= thresholds.mod) return { text: 'Moderate', color: 'text-amber-500', bg: 'bg-amber-500' };
    return { text: 'Critical', color: 'text-rose-500', bg: 'bg-rose-500' };
  };

  const status = getLabelAndColor();

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
      <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 mb-2`}>
        {icon}
      </div>
      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">{label}</div>
      <div className="font-black text-slate-800 dark:text-white text-xl">
        {value} <span className="text-[10px] opacity-40 font-bold">{unit}</span>
      </div>
      <div className={`text-[9px] font-black uppercase mt-1 tracking-tighter ${status.color}`}>
        {status.text}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800">
        <div 
          className={`h-full ${status.bg}`} 
          style={{ width: `${Math.min(100, (value / (thresholds.mod * 1.5)) * 100)}%` }} 
        />
      </div>
    </div>
  );
};

export default DestinationDetail;
