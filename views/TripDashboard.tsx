
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { MOCK_GUIDES, MOCK_DESTINATIONS } from '../constants';
import { Booking, TourGuide, Destination } from '../types';
import { Clock, Navigation, MessageCircle, Star, XCircle, AlertCircle, Loader2, Activity, MapPin, Wind, Zap, Receipt, Crown, ShieldCheck, History, ArrowRight } from 'lucide-react';

const IndiaSVGMap = ({ destination }: { destination: Destination }) => {
  return (
    <div className="relative w-full h-full bg-[#0a101f] overflow-hidden flex items-center justify-center group">
      {/* HUD Background elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      
      {/* 3D Perspective Wrapper */}
      <div 
        className="relative w-[85%] h-[85%] transition-transform duration-1000 ease-out flex items-center justify-center"
        style={{ transform: 'perspective(1000px) rotateX(25deg) scale(1)' }}
      >
        <svg viewBox="0 0 600 750" className="w-full h-full filter drop-shadow-[0_10px_30px_rgba(16,185,129,0.2)]">
          <defs>
            <linearGradient id="indiaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <filter id="glow">
               <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
               <feMerge>
                   <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
               </feMerge>
            </filter>
          </defs>

          {/* India Boundary Path (Abstract representation) */}
          <path 
            d="M300,40 L340,80 L390,120 L440,180 L480,250 L500,350 L460,500 L380,680 L300,720 L220,680 L140,500 L100,350 L120,250 L160,180 L210,120 L260,80 Z" 
            fill="url(#indiaGrad)" 
            stroke="#10b981" 
            strokeWidth="2"
            opacity="0.8"
            className="transition-all duration-700 hover:stroke-emerald-400"
          />

          {/* Simulated Travel Route (Curved) */}
          <path 
            d="M200,500 Q300,300 420,220" 
            fill="none" 
            stroke="#10b981" 
            strokeWidth="4" 
            strokeDasharray="10 10"
            className="animate-[dash_2s_linear_infinite]"
            filter="url(#glow)"
          />

          {/* Start Point Marker */}
          <g transform="translate(200,500)">
            <circle r="14" fill="#10b981" className="animate-ping opacity-20" />
            <circle r="6" fill="#10b981" />
          </g>

          {/* End Point Marker (Destination) */}
          <g transform="translate(420,220)">
            <circle r="18" fill="#3b82f6" className="animate-ping opacity-30" />
            <circle r="8" fill="#3b82f6" />
          </g>
        </svg>

        {/* Floating Data Labels */}
        <div className="absolute top-[200px] left-[440px] bg-slate-900/90 border border-blue-500/50 p-2 rounded-xl backdrop-blur-md shadow-2xl scale-75 md:scale-100">
           <div className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Target: {destination.name}</div>
           <div className="flex gap-4">
              <div className="flex items-center gap-1 text-[10px] font-black text-white"><Wind size={10} className="text-emerald-400"/> {destination.metrics.airQualityAQI} AQI</div>
              <div className="flex items-center gap-1 text-[10px] font-black text-white"><Zap size={10} className="text-amber-400"/> {destination.metrics.ecoStress} Stress</div>
           </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
         <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Orbital Scan Active</span>
         </div>
         <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em]">EcoBalance Satellite Visual V2.0</div>
      </div>
      
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -20; }
        }
      `}</style>
    </div>
  );
};

const TripDashboard = () => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [guide, setGuide] = useState<TourGuide | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const init = async () => {
      const active = await apiService.getActiveBooking();
      if (!active) {
        setLoading(false);
        return;
      }
      setBooking(active);
      const dest = MOCK_DESTINATIONS.find(d => d.id === active.destinationId);
      setDestination(dest || null);
      const guides = Object.values(MOCK_GUIDES).flat() as TourGuide[];
      setGuide(guides.find(g => g.id === active.guideId) || guides[0]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!booking) return;
    const target = new Date(`${booking.date}T${booking.time || '09:00'}:00`).getTime();
    const interval = setInterval(() => {
      const dist = target - new Date().getTime();
      if (dist < 0) {
        clearInterval(interval);
        return;
      }
      setTimeLeft({
        days: Math.floor(dist / (1000 * 60 * 60 * 24)),
        hours: Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((dist % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [booking]);

  const getRefundDetails = () => {
    if (!booking) return { amount: 0, percent: 0 };
    const target = new Date(`${booking.date}T${booking.time || '09:00'}:00`).getTime();
    const diffHours = (target - new Date().getTime()) / (1000 * 60 * 60);
    const percent = diffHours >= 24 ? 100 : 95;
    return { amount: Math.round(booking.contribution * (percent / 100)), percent };
  };

  const handleCancelTrip = async () => {
    if (!booking) return;
    setIsCancelling(true);
    await new Promise(r => setTimeout(r, 2500));
    await apiService.cancelBooking(booking.id, getRefundDetails().amount);
    setIsCancelling(false);
    navigate('/');
  };

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-6">
      <Loader2 className="animate-spin text-emerald-500" size={48} />
      <p className="font-black text-xs uppercase tracking-[0.3em] text-slate-400 animate-pulse">Synchronizing Satellite Feed...</p>
    </div>
  );

  if (!booking || !destination) return (
    <div className="p-10 text-center space-y-8 animate-in fade-in">
       <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-300">
         <Navigation size={40} />
       </div>
       <div className="space-y-2">
         <h2 className="text-2xl font-black">No Active Expeditions</h2>
         <p className="text-slate-500 text-sm max-w-xs mx-auto">Discover low-impact destinations and secure your next eco-conscious journey.</p>
       </div>
       <button onClick={() => navigate('/')} className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-transform active:scale-95">Start Exploring</button>
    </div>
  );

  return (
    <div className="p-6 pb-32 space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight leading-none">Trip Dashboard</h1>
          <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">
            <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,1)]" /> {booking.status} Confirmed
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {booking.isVIP && (
             <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border border-amber-200">
               <Crown size={12}/> VIP Plan
             </div>
          )}
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{booking.id}</div>
        </div>
      </header>

      {/* Countdown Timer */}
      <section className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="relative z-10 space-y-6">
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 text-center">T-Minus Departure</div>
          <div className="grid grid-cols-4 gap-4 text-center">
             <TimeBlock value={timeLeft.days} label="Days" />
             <TimeBlock value={timeLeft.hours} label="Hours" />
             <TimeBlock value={timeLeft.mins} label="Min" />
             <TimeBlock value={timeLeft.secs} label="Sec" />
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
      </section>

      {/* Interactive Visual Map */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
            <Navigation size={16} className="text-emerald-500"/> Real-time Expedition Monitoring
          </h2>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Digital Twin Active</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 h-[420px] shadow-2xl overflow-hidden relative group">
           <IndiaSVGMap destination={destination} />
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-6 shadow-sm">
           <div className="space-y-1">
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pickup Location</div>
             <div className="text-sm font-black truncate text-slate-800 dark:text-white">{booking.pickupLocation}</div>
           </div>
           <div className="space-y-1 text-right">
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Travel Duration</div>
             <div className="text-sm font-black text-slate-800 dark:text-white">{booking.duration} Days Expedition</div>
           </div>
        </div>
      </section>

      {/* Guide & Chat Card */}
      {guide && (
        <section className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-xl group transition-all hover:border-emerald-500/30">
          <div className="relative">
            <img src={guide.avatar} className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
          </div>
          <div className="flex-1">
             <div className="flex items-center gap-2">
               <h4 className="font-black text-slate-900 dark:text-white">{guide.name}</h4>
               {booking.isVIP && <div className="text-[8px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-black uppercase">Priority Assist</div>}
             </div>
             <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
               <Star size={10} className="text-amber-500 fill-amber-500"/> {guide.rating} • Assigned Expediton Lead
             </div>
             <p className="text-[10px] text-slate-500 line-clamp-1 mt-2 font-medium">"{guide.bio}"</p>
          </div>
          <Link to={`/chat/${guide.id}`} className="p-4 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-200 dark:shadow-none transition-transform active:scale-90 hover:bg-emerald-700">
            <MessageCircle size={24}/>
          </Link>
        </section>
      )}

      {/* Financial Summary */}
      <section className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
         <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><History size={16}/> Financial Summary</h3>
         <div className="space-y-2 text-xs">
            <div className="flex justify-between opacity-60"><span>Contribution ({booking.travelers} People)</span><span className="font-bold">₹{booking.contribution}</span></div>
            <div className="flex justify-between opacity-60"><span>Receipt Reference</span><span className="font-bold font-mono">{booking.receiptNumber}</span></div>
            <div className="flex justify-between text-emerald-600 font-bold pt-2 border-t border-slate-200 dark:border-slate-800">
              <span>Eco Points Earned</span>
              <span>+{booking.ecoPointsEarned}</span>
            </div>
         </div>
      </section>

      {/* Cancel Action */}
      <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setShowCancelModal(true)}
          className="w-full flex items-center justify-center gap-2 p-5 border border-rose-100 text-rose-500 rounded-3xl font-black uppercase text-xs tracking-[0.2em] hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all active:scale-[0.98]"
        >
          <XCircle size={18} /> Abort My Expedition
        </button>
      </section>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-8 space-y-6 shadow-2xl animate-in zoom-in-95 border border-white/10">
              <div className="flex justify-between items-start">
                 <div className="p-4 bg-rose-50 dark:bg-rose-900/30 rounded-2xl text-rose-500 shadow-inner">
                    <AlertCircle size={32}/>
                 </div>
                 <button onClick={() => setShowCancelModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">✕</button>
              </div>
              <div className="space-y-3">
                 <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Abort Trip?</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                   Cancellation policy: 100% refund if &gt;24h before pickup. 95% otherwise.
                 </p>
                 <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
                    <div className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Eligible Refund ({getRefundDetails().percent}%)</div>
                    <div className="text-3xl font-black text-emerald-600">₹{getRefundDetails().amount}</div>
                 </div>
              </div>
              <div className="flex flex-col gap-3">
                 <button 
                   disabled={isCancelling}
                   onClick={handleCancelTrip} 
                   className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-rose-200 dark:shadow-none disabled:opacity-50"
                 >
                    {isCancelling ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Cancellation'}
                 </button>
                 <button 
                   onClick={() => setShowCancelModal(false)} 
                   className="w-full text-slate-400 font-bold py-2 text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
                 >
                   Keep Expedition
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const TimeBlock = ({ value, label }: { value: number, label: string }) => (
  <div className="space-y-1">
    <div className="text-3xl font-black bg-white/5 p-4 rounded-2xl border border-white/10 tabular-nums shadow-inner transition-colors hover:bg-white/10">{value.toString().padStart(2, '0')}</div>
    <div className="text-[10px] font-black uppercase tracking-tighter text-slate-400">{label}</div>
  </div>
);

const MapDetailItem = ({ label, value, statusColor = "text-slate-900 dark:text-white" }: { label: string, value: string, statusColor?: string }) => (
  <div className="text-center space-y-1">
    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
    <div className={`text-xs font-black truncate max-w-[120px] mx-auto ${statusColor}`}>{value}</div>
  </div>
);

export default TripDashboard;
