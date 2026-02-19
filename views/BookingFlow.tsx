
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_DESTINATIONS, MOCK_GUIDES } from '../constants';
import { apiService } from '../services/apiService';
import { ArrowLeft, Users, Calendar, Clock, MapPin, CreditCard, ShieldCheck, Minus, Plus, ChevronRight, CheckCircle2, Leaf, Loader2, Info, Receipt, Crown } from 'lucide-react';
import { Booking, TripStatus } from '../types';

const BookingFlow = () => {
  const { destId } = useParams<{ destId: string }>();
  const navigate = useNavigate();
  const destination = MOCK_DESTINATIONS.find(d => d.id === destId);

  const [step, setStep] = useState(1);
  const [travelers, setTravelers] = useState(1);
  const [duration, setDuration] = useState(1);
  const [pickup, setPickup] = useState('');
  const [date, setDate] = useState('');
  const [contribution, setContribution] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const priceStats = useMemo(() => {
    if (!destination) return { total: 0, base: 0, tax: 0, platform: 500, ecoAdj: 0 };
    
    const base = destination.baseCostPerDay * duration * travelers * 80; // Scale to INR
    const ecoAdj = destination.metrics.ecoStress * 250;
    const platform = 500;
    const subtotal = base + ecoAdj + platform;
    const tax = subtotal * 0.18;
    const total = Math.round(subtotal + tax);

    return { total, base: Math.round(base), tax: Math.round(tax), platform, ecoAdj: Math.round(ecoAdj) };
  }, [destination, travelers, duration]);

  // Sync contribution with min price initially
  useMemo(() => {
    setContribution(priceStats.total);
  }, [priceStats.total]);

  const handleProcessPayment = async () => {
    if (contribution < priceStats.total) {
      setError(`Amount must be equal to or greater than ₹${priceStats.total}.`);
      return;
    }
    setError('');
    setIsProcessing(true);
    
    // Simulate Payment Gateway
    await new Promise(r => setTimeout(r, 3000));

    const guides = MOCK_GUIDES[destination!.id] || [];
    const assignedGuide = guides[0];

    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      guideId: assignedGuide.id,
      destinationId: destination!.id,
      date,
      time: '09:00',
      travelers,
      pickupLocation: pickup,
      duration,
      minPrice: priceStats.total,
      contribution: contribution,
      isVIP: contribution > priceStats.total,
      status: 'Upcoming' as TripStatus,
      carbonFootprint: travelers * duration * 12,
      ecoPointsEarned: Math.round(contribution / 100),
      receiptNumber: `EB-${Date.now()}`
    };

    await apiService.saveBooking(newBooking);
    setIsProcessing(false);
    setStep(3);
  };

  if (!destination) return <div className="p-10 text-center font-bold">Expedition data missing.</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 pb-24 transition-colors">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-transform active:scale-90">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight">Expedition Booking</h1>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{destination.name}</p>
        </div>
      </header>

      {step === 1 && (
        <div className="space-y-6 max-w-lg mx-auto animate-in slide-in-from-bottom-4 duration-500">
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={12}/> Pickup Location
              </label>
              <input 
                type="text" 
                placeholder="Enter address, hotel, or landmark..."
                className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 font-medium focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={12}/> Trip Date
                </label>
                <input 
                  type="date" 
                  className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 font-bold outline-none"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={12}/> Days (Max 30)
                </label>
                <input 
                  type="number" min="1" max="30"
                  className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 font-bold outline-none"
                  value={duration}
                  onChange={(e) => setDuration(Math.min(30, Math.max(1, parseInt(e.target.value) || 1)))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Users size={12}/> Travelers (Max 20)
              </label>
              <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <button onClick={() => setTravelers(Math.max(1, travelers - 1))} className="p-1 text-slate-500 hover:bg-white dark:hover:bg-slate-700 rounded-lg"><Minus size={16}/></button>
                <input 
                  type="number" 
                  className="bg-transparent border-none outline-none font-black text-xl w-full text-center" 
                  value={travelers} 
                  onChange={(e) => setTravelers(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                />
                <button onClick={() => setTravelers(Math.min(20, travelers + 1))} className="p-1 text-slate-500 hover:bg-white dark:hover:bg-slate-700 rounded-lg"><Plus size={16}/></button>
              </div>
            </div>
          </section>

          <section className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-black text-sm uppercase tracking-widest text-emerald-400">Price Breakdown</h3>
              <Info size={14} className="opacity-40" />
            </div>
            <div className="space-y-2 opacity-80 text-xs">
              <div className="flex justify-between"><span>Base Rate ({duration} days)</span><span>₹{priceStats.base}</span></div>
              <div className="flex justify-between"><span>Eco-Impact Adjustment</span><span>₹{priceStats.ecoAdj}</span></div>
              <div className="flex justify-between"><span>Platform Surcharge</span><span>₹{priceStats.platform}</span></div>
              <div className="flex justify-between"><span>GST (18%)</span><span>₹{priceStats.tax}</span></div>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-between items-end">
              <div className="text-[10px] font-black uppercase tracking-widest opacity-50">Minimum Payable</div>
              <div className="text-3xl font-black">₹{priceStats.total}</div>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Contribution</label>
              {contribution > priceStats.total && (
                <div className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter flex items-center gap-1 border border-amber-200 animate-pulse">
                  <Crown size={10} /> VIP Unlock
                </div>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-2xl text-slate-400">₹</span>
              <input 
                type="number" 
                className="w-full bg-slate-50 dark:bg-slate-800 pl-10 pr-4 py-4 rounded-2xl border border-slate-100 dark:border-slate-700 font-black text-3xl outline-none"
                value={contribution}
                onChange={(e) => setContribution(parseInt(e.target.value) || 0)}
              />
            </div>
            {contribution < priceStats.total ? (
              <p className="text-rose-500 text-[10px] font-black uppercase flex items-center gap-1"><Info size={12}/> Amount must be equal to or greater than minimum price.</p>
            ) : contribution === priceStats.total ? (
              <p className="text-slate-400 text-[10px] font-bold uppercase">Standard experience selected.</p>
            ) : (
              <p className="text-emerald-500 text-[10px] font-black uppercase flex items-center gap-1 animate-bounce"><Crown size={12}/> VIP Enhanced Experience Activated.</p>
            )}
          </section>

          <button 
            disabled={!pickup || !date || contribution < priceStats.total}
            onClick={() => setStep(2)}
            className="w-full bg-slate-900 dark:bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] disabled:opacity-50"
          >
            Review & Pay ₹{contribution}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="fixed inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-8 z-[100] animate-in fade-in duration-300">
           {!isProcessing ? (
             <div className="max-w-xs w-full bg-white rounded-3xl p-8 space-y-8 text-center animate-in zoom-in-95">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
                  <CreditCard size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900">Final Authorization</h3>
                  <p className="text-sm text-slate-500">Processing ₹{contribution} for your expedition at {destination.name}</p>
                </div>
                <div className="space-y-3">
                  <button onClick={handleProcessPayment} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg">Pay Now</button>
                  <button onClick={() => setStep(1)} className="w-full text-xs text-slate-400 font-bold py-2">Go Back</button>
                </div>
             </div>
           ) : (
             <div className="text-center space-y-6">
                <Loader2 className="animate-spin text-emerald-400 mx-auto" size={56} />
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white">Securing Funds...</h3>
                  <p className="text-emerald-400/60 text-xs font-bold uppercase tracking-widest">Encypting Ledger Entry</p>
                </div>
             </div>
           )}
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col h-[80vh] items-center justify-center p-8 text-center space-y-8 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl relative">
            <CheckCircle2 size={48} />
            <div className="absolute inset-0 rounded-full animate-ping bg-emerald-500 opacity-20" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Trip Secured!</h2>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
               <div className="flex items-center justify-center gap-2 text-xs font-black uppercase text-slate-400 tracking-widest">
                 <Receipt size={14}/> Booking #EB-{Date.now().toString().slice(-6)}
               </div>
               <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Your ecological expedition is booked. We've assigned an expert guide to lead your journey.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/trip-dashboard')}
            className="w-full max-w-xs bg-slate-900 dark:bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            Launch Dashboard <ChevronRight size={18}/>
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingFlow;
