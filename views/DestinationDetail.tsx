
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MOCK_DESTINATIONS } from '../constants';
import { apiService } from '../services/apiService';
import ScoreBadge from '../components/ScoreBadge';
import { getDestinationAIOverview } from '../services/geminiService';
import { Wind, Droplets, Users, ShieldCheck, Sparkles, Loader2, Megaphone, MessageSquare, Star, UsersRound, MessageCircleWarning, Map, Lock, Crown, ArrowLeft, Volume2, Activity, Zap, Send, Thermometer } from 'lucide-react';
import { Destination, CommunityComment } from '../types';

const EcoStressGauge = ({ value, className }: { value: number; className?: string }) => {
  const rotation = (value / 100) * 180 - 90; // Arc is 180 degrees, from -90 to +90
  
  return (
    <div className={`flex flex-col items-center justify-center p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl z-40 ${className}`}>
      <div className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-2">
        <Activity size={10} className="text-emerald-500" />
        Eco Stress
      </div>
      
      <div className="relative w-32 h-16 overflow-hidden">
        {/* Vibrant Gradient Arc */}
        <svg viewBox="0 0 100 55" className="w-full h-full">
          <defs>
            <linearGradient id="vibrantGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />   {/* Vibrant Green */}
              <stop offset="50%" stopColor="#eab308" />  {/* Vibrant Yellow */}
              <stop offset="100%" stopColor="#ef4444" /> {/* Vibrant Red */}
            </linearGradient>
          </defs>
          <path 
            d="M 10 50 A 40 40 0 0 1 90 50" 
            fill="none" 
            stroke="#f1f5f9" 
            strokeWidth="12" 
            className="dark:stroke-slate-800"
            strokeLinecap="round"
          />
          <path 
            d="M 10 50 A 40 40 0 0 1 90 50" 
            fill="none" 
            stroke="url(#vibrantGaugeGradient)" 
            strokeWidth="12" 
            strokeLinecap="round"
            opacity="1"
          />
        </svg>

        {/* Needle */}
        <div 
          className="absolute bottom-0 left-1/2 w-1 h-12 -ml-0.5 bg-slate-900 dark:bg-white rounded-full origin-bottom transition-transform duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1)"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-slate-900 dark:bg-white rounded-full shadow-lg" />
        </div>
      </div>

      <div className="text-center mt-1">
        <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums leading-none">
          {value.toFixed(1)}
        </div>
        <div className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Stress Index</div>
      </div>
    </div>
  );
};

const DestinationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [destination, setDestination] = useState<Destination | undefined>();
  const [aiData, setAiData] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isPremium, setIsPremium] = useState(() => localStorage.getItem('starling-premium') === 'true');
  
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const isLive = id === 'demo-place-live';

  const fetchDestinationData = useCallback(async () => {
    if (!id) return;
    const data = await apiService.getDestinationById(id);
    if (data) {
      setDestination({...data});
    }
  }, [id]);

  useEffect(() => {
    fetchDestinationData();
    window.scrollTo(0,0);

    let interval: any;
    if (isLive) {
      interval = setInterval(fetchDestinationData, 5000); 
    }

    const handleStorage = () => setIsPremium(localStorage.getItem('starling-premium') === 'true');
    window.addEventListener('storage', handleStorage);
    
    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [id, fetchDestinationData, isLive]);

  useEffect(() => {
    if (destination && !aiData) {
      const alternatives = MOCK_DESTINATIONS
        .filter(d => d.id !== id && d.status === 'Recommended')
        .slice(0, 2);
        
      const fetchAI = async () => {
        setLoadingAI(true);
        const res = await getDestinationAIOverview(destination, alternatives);
        setAiData(res);
        setLoadingAI(false);
      };
      fetchAI();
    }
  }, [destination, aiData, id]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80";
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim() || !destination) return;
    
    setSubmittingReview(true);
    await new Promise(r => setTimeout(r, 800));
    
    const newComment: CommunityComment = {
      id: Date.now().toString(),
      user: 'You',
      comment: reviewText,
      date: new Date().toISOString().split('T')[0],
      rating: reviewRating
    };
    
    setDestination({
      ...destination,
      communityFeedback: [newComment, ...destination.communityFeedback]
    });
    
    setReviewText('');
    setReviewRating(5);
    setSubmittingReview(false);
  };

  if (!destination) return <div className="p-20 text-center flex flex-col items-center gap-4">
    <Loader2 className="animate-spin text-emerald-500" size={40} />
    <p className="text-slate-400 font-bold uppercase text-xs">Calibrating Sensors...</p>
  </div>;

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="relative h-64 md:h-80">
        <img 
          src={destination.image} 
          alt={destination.name} 
          onError={handleImageError}
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-4 left-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white transition-transform active:scale-90">
            <ArrowLeft size={20} />
          </button>
        </div>
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
          <div className="max-w-[60%]">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-black text-white drop-shadow-lg tracking-tight leading-none">{destination.name}</h1>
              {isLive && (
                <div className="bg-rose-500 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest animate-pulse shadow-lg">Live Feed</div>
              )}
            </div>
            <p className="text-white/80 font-bold text-sm tracking-wide">{destination.country}</p>
          </div>
          <ScoreBadge status={destination.status} size="lg" />
        </div>
      </div>

      <div className="p-6 space-y-8">
        
        {/* REPOSITIONED ACTION CLUSTER */}
        <section className="flex flex-col md:flex-row gap-4 items-stretch">
          
          {/* Left Section: Vibrant Gauge */}
          <div className="md:w-1/3 flex items-center justify-center">
             <EcoStressGauge value={destination.metrics.ecoStress || 15} className="w-full h-full" />
          </div>
          
          {/* Right Section: Multi-tiered Action Buttons */}
          <div className="flex-1 flex flex-col gap-3">
            <Link 
              to={`/plan/${destination.id}`}
              className="w-full flex items-center justify-center gap-2 p-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-xs uppercase tracking-[0.15em] hover:bg-slate-50 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none"
            >
              <Map size={18} />
              Optimize My Safest Trip Plan
            </Link>
            
            <div className="grid grid-cols-2 gap-3 flex-1">
              <Link 
                to={`/guides/${destination.id}`}
                className="flex items-center justify-center gap-2 p-5 bg-[#2563eb] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg"
              >
                <UsersRound size={16} />
                Hire Guide
              </Link>
              <Link 
                to={`/ai-chat/${destination.id}`}
                className={`flex items-center justify-center gap-2 p-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${
                  isPremium 
                    ? 'bg-[#5c4033] text-white hover:bg-[#4a332a]' // Truth Mode Brown
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {isPremium ? <MessageCircleWarning size={16} /> : <Lock size={16} />}
                Truth Mode
              </Link>
            </div>
          </div>
        </section>

        {/* Local Signals */}
        {destination.localSignals.length > 0 && (
          <section className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-[10px] uppercase tracking-widest">
              <Megaphone size={16} />
              <span>Real-time Local Signals</span>
            </div>
            <div className="space-y-2">
              {destination.localSignals.map((signal, idx) => (
                <div key={idx} className="flex gap-2 text-amber-900 dark:text-amber-100 text-xs bg-white/50 dark:bg-white/5 p-2 rounded-lg border border-amber-100 dark:border-amber-900/50">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                  {signal}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* AI Analysis */}
        <section className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-6 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-4 text-indigo-200 dark:text-indigo-800">
            <Sparkles size={40} />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-400 font-black uppercase text-[10px] tracking-widest">
              <Sparkles size={14} />
              <span>EcoBalance AI Insight</span>
            </div>
            
            {loadingAI ? (
              <div className="flex items-center gap-3 py-4 text-indigo-600 dark:text-indigo-400">
                <Loader2 size={24} className="animate-spin" />
                <span className="font-medium">Synthesizing sensor feed...</span>
              </div>
            ) : (
              <>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-lg">
                  {aiData?.summary || "Interpreting real-world environmental stress metrics..."}
                </p>
                {isPremium && (
                   <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl text-sm text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800 flex items-start gap-3">
                    <ShieldCheck size={18} className="shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Premium Logic:</span> Safety classification is <span className="underline">{destination.status}</span>. Sensor trends analyzed against 0-100 stress scale.
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Metrics Grid */}
        <section className="grid grid-cols-1 gap-4">
          <MetricCard 
            icon={<Volume2 size={18} />} 
            label={isLive ? "Sound Stress" : "Noise Level"} 
            value={destination.metrics.noiseDB} 
            unit={isLive ? "/100" : "dB"} 
            reference={isLive ? "Scale: 0–30 Safe" : "40–60 dB"}
            description={isLive ? "Calculated stress based on ambient acoustic pressure." : "Ambient sound pressure levels in key visitor centers."}
            thresholds={isLive ? { safe: 30, mod: 60, unsafe: 80 } : { safe: 50, mod: 75, unsafe: 90 }}
            isLiveStress={isLive}
          />
          <MetricCard 
            icon={<Zap size={18} />} 
            label={isLive ? "Soil Stress" : "Soil Health"} 
            value={destination.metrics.soilPPM} 
            unit={isLive ? "/100" : "PPM"} 
            reference={isLive ? "Scale: 0–30 Safe" : "< 50 PPM"}
            description={isLive ? "Index of chemical and industrial residue stress." : "Detection of chemical residues and industrial runoff."}
            thresholds={isLive ? { safe: 30, mod: 60, unsafe: 80 } : { safe: 50, mod: 200, unsafe: 400 }}
            isLiveStress={isLive}
          />
          <MetricCard 
            icon={<Thermometer size={18} />} 
            label="Temperature" 
            value={destination.metrics.temperature || 24} 
            unit="°C"
            reference="Comfort: 18–28°C"
            description="Ambient temperature in local degrees Celsius."
            thresholds={{ safe: 28, mod: 35, unsafe: 40 }}
            isLiveStress={false}
          />
          <MetricCard 
            icon={<Wind size={18} />} 
            label="Air Quality" 
            value={destination.metrics.airQualityAQI} 
            unit="AQI" 
            reference="0–50 AQI"
            description="Measures particulate matter and ozone in the atmosphere."
            thresholds={{ safe: 50, mod: 100, unsafe: 150 }}
            isLiveStress={false}
          />
          <MetricCard 
            icon={<Droplets size={18} />} 
            label="Water Quality" 
            value={destination.metrics.waterPPM} 
            unit="PPM"
            reference="< 100 PPM"
            description="Total dissolved solids and mineral concentration in local sources."
            thresholds={{ safe: 100, mod: 300, unsafe: 500 }}
            isLiveStress={false}
          />
          <MetricCard 
            icon={<Users size={18} />} 
            label="Crowd Density" 
            value={destination.metrics.crowdDensity} 
            unit="ppl/m²"
            reference="< 0.5 ppl/m²"
            description="Real-time density of people in key visitor districts."
            thresholds={{ safe: 0.5, mod: 2.0, unsafe: 4.0 }}
            isLiveStress={false}
          />
        </section>

        {/* Community Feedback */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <MessageSquare size={18} className="text-indigo-500" />
              Traveler Reviews
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{destination.communityFeedback.length} Verified Reviews</span>
          </div>

          <form onSubmit={handleAddReview} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-all focus-within:ring-2 focus-within:ring-indigo-500/10">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rate your experience</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    type="button" 
                    onClick={() => setReviewRating(star)}
                    className={`${star <= reviewRating ? 'text-amber-400' : 'text-slate-300'} transition-colors hover:scale-110 active:scale-90`}
                  >
                    <Star size={18} fill={star <= reviewRating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <textarea 
                placeholder="Share your honest experience..." 
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white min-h-[100px] resize-none border border-slate-100 dark:border-slate-700 font-medium"
              />
              <button 
                type="submit"
                disabled={submittingReview || !reviewText.trim()}
                className="absolute bottom-3 right-3 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 active:scale-95 shadow-md"
              >
                {submittingReview ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {destination.communityFeedback.map((fb) => (
              <div key={fb.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-[10px] text-slate-500">
                      {fb.user.substring(0, 1)}
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{fb.user}</span>
                  </div>
                  <div className="flex gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < fb.rating ? "currentColor" : "none"} />)}
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">"{fb.comment}"</p>
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{fb.date}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, unit, reference, description, thresholds, isLiveStress }: { icon: any, label: string, value: number, unit: string, reference: string, description: string, thresholds: { safe: number, mod: number, unsafe: number }, isLiveStress: boolean }) => {
  const getInterpretation = () => {
    if (value <= thresholds.safe) return { text: isLiveStress ? 'Safe' : 'Excellent', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    if (value <= thresholds.mod) return { text: 'Moderate', color: 'text-amber-500', bg: 'bg-amber-500/10' };
    if (value <= thresholds.unsafe) return { text: 'Unsafe', color: 'text-orange-500', bg: 'bg-orange-500/10' };
    return { text: isLiveStress ? 'Critical' : 'Poor', color: 'text-rose-500', bg: 'bg-rose-500/10' };
  };

  const status = getInterpretation();

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center gap-4 transition-all hover:border-indigo-500/30">
      <div className={`p-4 rounded-2xl shrink-0 self-start ${status.bg} ${status.color} shadow-inner`}>
        {icon}
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-1.5 text-sm uppercase tracking-tight">
              {label} 
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${status.bg} ${status.color} border border-current/10`}>
                {status.text}
              </span>
            </h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter opacity-70">{description}</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
              {value.toFixed(1)} <span className="text-[10px] opacity-40 font-black uppercase tracking-tighter">{unit}</span>
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">
              Ref: {reference}
            </div>
          </div>
        </div>
        
        <div className="relative w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${status.color.replace('text-', 'bg-')}`}
            style={{ width: `${Math.min(100, isLiveStress ? value : (value / (thresholds.mod * 1.5)) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default DestinationDetail;
