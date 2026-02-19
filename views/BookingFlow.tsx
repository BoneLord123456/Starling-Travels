
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_DESTINATIONS, MOCK_GUIDES } from '../constants';
import { apiService } from '../services/apiService';
import { ArrowLeft, Users, Calendar, Clock, MapPin, CreditCard, ShieldCheck, Loader2, Minus, Plus, ChevronRight, CheckCircle2, Leaf, AlertTriangle } from 'lucide-react';
import { Booking, ComfortLevel, TripStatus } from '../types';

const BookingFlow = () => {
  const { destId } = useParams<{ destId: string }>();
  const navigate = useNavigate();
  const destination = MOCK_DESTINATIONS.find(d => d.id === destId);
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  const [step, setStep] = useState(1);
  const [travelers, setTravelers] = useState(1);
  const [pickup, setPickup] = useState('');
  const [pickupCoords, setPickupCoords] = useState<{lat: number, lng: number} | null>(null);
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState(1);
  const [comfort, setComfort] = useState<ComfortLevel>('Standard');
  const [offsetCarbon, setOffsetCarbon] = useState(false);
  const [contribution, setContribution] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mapsStatus, setMapsStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [validationError, setValidationError] = useState('');
  const [realDistanceKm, setRealDistanceKm] = useState<number | null>(null);

  // Script Loader: Handles both initial mount and re-renders
  useEffect(() => {
    // Priority 1: explicitly defined in vite.config.ts define block
    // Priority 2: Vite's native import.meta.env
    const apiKey = (process.env && process.env.VITE_GOOGLE_MAPS_API_KEY) || 
                   (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error("EcoBalance Maps Error: VITE_GOOGLE_MAPS_API_KEY is missing from environment.");
      setMapsStatus('error');
      return;
    }

    if ((window as any).google?.maps?.places) {
      setMapsStatus('ready');
      return;
    }

    const scriptId = 'google-maps-sdk';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const handleLoad = () => setMapsStatus('ready');
    const handleError = () => setMapsStatus('error');

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    return () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };
  }, []);

  // Initialize Autocomplete specifically when step 1 is active and input is mounted
  useEffect(() => {
    if (step === 1 && mapsStatus === 'ready' && pickupInputRef.current) {
      initAutocomplete();
    }
  }, [step, mapsStatus]);

  const initAutocomplete = () => {
    if (!pickupInputRef.current || !(window as any).google?.maps?.places) return;
    
    // Cleanup old instance if it exists to prevent memory leaks and duplicate UI
    if (autocompleteRef.current) {
      (window as any).google.maps.event.clearInstanceListeners(autocompleteRef.current);
    }

    autocompleteRef.current = new (window as any).google.maps.places.Autocomplete(pickupInputRef.current, {
      fields: ["formatted_address", "geometry"],
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const address = place.formatted_address || '';
        setPickup(address);
        setPickupCoords({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        });
        setValidationError('');
        calculateRealDistance(address);
      } else {
        setValidationError('Please select a valid address from the suggestions.');
      }
    });
  };

  const calculateRealDistance = (origin: string) => {
    if (!destination || !(window as any).google?.maps?.DirectionsService) return;
    const service = new (window as any).google.maps.DirectionsService();
    service.route({
      origin: origin,
      destination: `${destination.name}, ${destination.country}`,
      travelMode: (window as any).google.maps.TravelMode.DRIVING,
    }, (result: any, status: any) => {
      if (status === 'OK' && result.routes[0].legs[0]) {
        const distanceMeters = result.routes[0].legs[0].distance.value;
        setRealDistanceKm(distanceMeters / 1000);
      }
    });
  };

  const priceStats = useMemo(() => {
    if (!destination) return { total: 0, base: 0, transport: 0, guide: 0, eco: 0, offset: 0, distance: 0, tax: 0 };
    const distanceKm = realDistanceKm || 25;
    const transportRate = comfort === 'Standard' ? 60 : comfort === 'Premium' ? 140 : 400;
    const base = destination.baseCostPerDay * travelers * duration;
    const guide = 1500 * travelers * duration;
    const transport = Math.round(distanceKm * transportRate);
    const ecoStressAdj = (destination.metrics.ecoStress / 100) * base * 0.4;
    const ecoFund = base * 0.15;
    const offsetFee = offsetCarbon ? (travelers * duration * 150) : 0;
    const tax = (base + guide + transport) * 0.12;
    const minTotal = Math.round(base + guide + transport + ecoStressAdj + ecoFund + offsetFee + tax);
    
    return {
      total: minTotal,
      base: Math.round(base),
      transport,
      guide: Math.round(guide),
      eco: Math.round(ecoFund + ecoStressAdj),
      offset: offsetFee,
      tax: Math.round(tax),
      distance: Math.round(distanceKm)
    };
  }, [destination, travelers, duration, comfort, offsetCarbon, realDistanceKm]);

  useEffect(() => {
    setContribution(priceStats.total);
  }, [priceStats.total]);

  const handleProceedToPayment = () => {
    if (!pickupCoords) {
      setValidationError('Search and select a pickup location from the suggestions.');
      return;
    }
    setStep(2);
  };

  const handleFinalPay = async () => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    const guides = MOCK_GUIDES[destination!.id] || [];
    const assignedGuide = guides[Math.floor(Math.random() * guides.length)];
    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      guideId: assignedGuide.id,
      destinationId: destination!.id,
      date,
      time: '09:00',
      travelers,
      pickupLocation: pickup,
      pickupCoords: pickupCoords!,
      duration,
      comfortLevel: comfort,
      minPrice: priceStats.total,
      contribution,
      status: 'Upcoming' as TripStatus,
      carbonFootprint: Math.round(travelers * duration * (comfort === 'Eco-Luxury' ? 8 : 22)),
      ecoPointsEarned: Math.round(contribution / 50),
      distanceKm: priceStats.distance,
      offsetCarbon
    };
    await apiService.saveBooking(newBooking);
    setIsProcessing(false);
    setStep(3);
  };

  if (!destination) return <div className="p-10 text-center font-bold">Destination not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 pb-24">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-transform active:scale-90">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-black">Book My Trip</h1>
          <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{destination.name}</p>
        </div>
      </header>

      {mapsStatus === 'error' && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center gap-3 text-rose-600 mb-6">
          <AlertTriangle size={20} />
          <span className="text-sm font-bold">Maps API key missing or invalid. Check your Vercel/Environment settings.</span>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6 max-w-lg mx-auto animate-in slide-in-from-bottom-4 duration-500">
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Users size={14}/> Travelers
              </label>
              <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
                <button onClick={() => setTravelers(Math.max(1, travelers - 1))} className="p-1 text-slate-500"><Minus size={16}/></button>
                <span className="font-black text-lg w-4 text-center">{travelers}</span>
                <button onClick={() => setTravelers(travelers + 1)} className="p-1 text-slate-500"><Plus size={16}/></button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={14}/> Pickup Location
              </label>
              <div className="relative">
                <input 
                  ref={pickupInputRef}
                  type="text" 
                  placeholder={mapsStatus === 'ready' ? "Start typing an address..." : "Initializing Maps Engine..."}
                  disabled={mapsStatus !== 'ready'}
                  className={`w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border font-medium focus:ring-2 focus:ring-blue-500/20 outline-none pr-10 transition-all ${validationError ? 'border-rose-500' : 'border-slate-100 dark:border-slate-700'}`}
                  value={pickup}
                  onChange={(e) => {
                    setPickup(e.target.value);
                    if (pickupCoords) setPickupCoords(null);
                  }}
                />
                {mapsStatus === 'loading' && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-slate-400" size={16}/>}
              </div>
              {validationError && <p className="text-rose-500 text-[10px] font-black uppercase flex items-center gap-1"><AlertTriangle size={12}/> {validationError}</p>}
              {!pickupCoords && pickup.length > 3 && !validationError && (
                <p className="text-blue-500 text-[9px] font-bold uppercase animate-pulse">Select an address from the dropdown list</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={14}/> Trip Date
                </label>
                <input 
                  type="date" 
                  className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 font-bold outline-none"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={14}/> Duration (Days)
                </label>
                <input 
                  type="number" 
                  min="1"
                  className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 font-bold outline-none"
                  value={duration}
                  onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Comfort Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Standard', 'Premium', 'Eco-Luxury'] as ComfortLevel[]).map(c => (
                  <button 
                    key={c} 
                    onClick={() => setComfort(c)}
                    className={`py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider border transition-all ${comfort === c ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setOffsetCarbon(!offsetCarbon)}
              className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${offsetCarbon ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}
            >
              <div className="flex items-center gap-3">
                 <Leaf size={18} />
                 <div className="text-left">
                    <div className="text-xs font-black">Carbon Offset Program</div>
                    <div className="text-[9px] opacity-80 uppercase font-bold">Invest in reforestation</div>
                 </div>
              </div>
              <div className="text-xs font-black">+ ₹{travelers * duration * 150}</div>
            </button>
          </section>

          <section className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-black text-lg">Precise Trip Price</h3>
              <div className="text-right">
                <div className="text-3xl font-black">₹{priceStats.total}</div>
                <div className="text-[10px] font-bold uppercase opacity-70">Incl. Taxes & Eco Fees</div>
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-white/10">
              <PriceLine label="Base Cost" value={priceStats.base} />
              <PriceLine label="Guide Fee" value={priceStats.guide} />
              <PriceLine label="Transport Fee" value={priceStats.transport} hint={realDistanceKm ? `~${realDistanceKm.toFixed(1)} km` : `Est. 25 km`} />
              <PriceLine label="Eco-Conservation" value={priceStats.eco} />
              {offsetCarbon && <PriceLine label="Carbon Offset" value={priceStats.offset} />}
              <PriceLine label="GST / Taxes (12%)" value={priceStats.tax} />
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-black text-sm uppercase tracking-widest">Choose Your Contribution</h3>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-xl text-slate-400">₹</span>
              <input 
                type="number" 
                className="w-full bg-slate-50 dark:bg-slate-800 pl-10 pr-4 py-4 rounded-2xl border border-slate-100 dark:border-slate-700 font-black text-2xl outline-none"
                value={contribution}
                onChange={(e) => setContribution(parseInt(e.target.value) || 0)}
              />
            </div>
            {contribution < priceStats.total && (
              <p className="text-rose-500 text-[10px] font-black uppercase flex items-center gap-1"><ShieldCheck size={12}/> Contribution must be ≥ required minimum.</p>
            )}
          </section>

          <button 
            disabled={contribution < priceStats.total || !pickupCoords || !date || isProcessing}
            onClick={handleProceedToPayment}
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] disabled:opacity-50"
          >
            Confirm & Pay ₹{contribution}
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
                  <h3 className="text-2xl font-black text-slate-900">Final Payment</h3>
                  <p className="text-sm text-slate-500">Securing your spot at {destination.name}</p>
                </div>
                <button onClick={handleFinalPay} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg">Confirm Payment</button>
                <button onClick={() => setStep(1)} className="text-xs text-slate-400 font-bold">Go Back</button>
             </div>
           ) : (
             <div className="text-center space-y-6">
                <Loader2 className="animate-spin text-white mx-auto" size={48} />
                <h3 className="text-2xl font-black text-white">Authorizing Secure Payment...</h3>
             </div>
           )}
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col h-[80vh] items-center justify-center p-8 text-center space-y-8 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl">
            <CheckCircle2 size={48} />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Trip Secured!</h2>
            <p className="text-slate-500 dark:text-slate-400">Your ecological expedition is booked. View details on your dashboard.</p>
          </div>
          <button 
            onClick={() => navigate('/trip-dashboard')}
            className="w-full max-w-xs bg-slate-900 dark:bg-slate-800 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
          >
            Open Trip Dashboard <ChevronRight size={18}/>
          </button>
        </div>
      )}
    </div>
  );
};

const PriceLine = ({ label, value, hint }: { label: string, value: number, hint?: string }) => (
  <div className="flex justify-between text-xs opacity-80">
    <span>{label} {hint && <span className="text-[10px] opacity-60">({hint})</span>}</span>
    <span className="font-bold">₹{value}</span>
  </div>
);

export default BookingFlow;
