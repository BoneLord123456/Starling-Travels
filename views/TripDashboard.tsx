
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { MOCK_GUIDES, MOCK_DESTINATIONS } from '../constants';
import { Booking, TourGuide, Destination } from '../types';
import { Clock, MapPin, Navigation, MessageCircle, Thermometer, ShieldAlert, ChevronRight, Activity, Zap, Leaf, Award, Star, XCircle, AlertCircle, Loader2 } from 'lucide-react';

const TripDashboard = () => {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [guide, setGuide] = useState<TourGuide | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [mapDetails, setMapDetails] = useState({ distance: '', duration: '', trafficStatus: 'Normal' });

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
      const guides = Object.values(MOCK_GUIDES).flat();
      setGuide(guides.find(g => g.id === active.guideId) || null);
      setLoading(false);
    };
    init();
  }, []);

  const fetchDirections = () => {
    if (booking && destination && mapRef.current && (window as any).google) {
      const map = new (window as any).google.maps.Map(mapRef.current, {
        zoom: 12,
        center: booking.pickupCoords,
        mapId: 'DEMO_MAP_ID',
        disableDefaultUI: true,
      });

      const directionsService = new (window as any).google.maps.DirectionsService();
      const directionsRenderer = new (window as any).google.maps.DirectionsRenderer({ map });

      directionsService.route({
        origin: booking.pickupLocation,
        destination: `${destination.name}, ${destination.country}`,
        travelMode: (window as any).google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: (window as any).google.maps.TrafficModel.BEST_GUESS
        }
      }, (result: any, status: any) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
          const leg = result.routes[0].legs[0];
          setMapDetails({
            distance: leg.distance.text,
            duration: leg.duration_in_traffic ? leg.duration_in_traffic.text : leg.duration.text,
            trafficStatus: leg.duration_in_traffic && leg.duration_in_traffic.value > leg.duration.value ? 'Heavy' : 'Normal'
          });
        }
      });
    }
  };

  // Google Maps Refresh Logic
  useEffect(() => {
    if (!loading && booking && destination) {
      fetchDirections();
      const interval = setInterval(fetchDirections, 600000); // 10 minutes
      return () => clearInterval(interval);
    }
  }, [loading, booking, destination]);

  // Countdown Logic
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

  const calculateRefund = () => {
    if (!booking) return 0;
    const target = new Date(`${booking.date}T${booking.time || '09:00'}:00`).getTime();
    const diffHours = (target - new Date().getTime()) / (1000 * 60 * 60);
    return diffHours >= 24 ? booking.contribution : Math.round(booking.contribution * 0.95);
  };

  const handleCancelTrip = async () => {
    if (!booking) return;
    setIsCancelling(true);
    await new Promise(r => setTimeout(r, 2000));
    await apiService.cancelBooking(booking.id, calculateRefund());
    setIsCancelling(false);
    navigate('/');
  };

  if (loading) return <div className="p-20 text-center flex flex-col items-center gap-4"><Activity className="animate-spin text-blue-500" /> <p className="font-bold text-xs uppercase tracking-widest">Accessing Satellite Feed...</p></div>;

  if (!booking || !destination) return (
    <div className="p-10 text-center space-y-6">
       <h2 className="text-2xl font-black">No Active Expedition</h2>
       <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest shadow-xl">Explore Trips</button>
    </div>
  );

  return (
    <div className="p-6 pb-32 space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight">Expedition Dashboard</h1>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> Trip Confirmed
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${booking.comfortLevel === 'Eco-Luxury' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
          {booking.comfortLevel}
        </div>
      </header>

      {/* Countdown Card */}
      <section className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden ring-1 ring-white/10">
        <div className="relative z-10 space-y-6">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 text-center">T-Minus Departure</div>
          <div className="grid grid-cols-4 gap-4 text-center">
             <TimeBlock value={timeLeft.days} label="Days" />
             <TimeBlock value={timeLeft.hours} label="Hours" />
             <TimeBlock value={timeLeft.mins} label="Min" />
             <TimeBlock value={timeLeft.secs} label="Sec" />
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
      </section>

      {/* Map Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
            <Navigation size={16} className="text-blue-500"/> Real-time Route Monitoring
          </h2>
          <div className="text-[9px] font-bold text-slate-400 uppercase">Updates every 10 min</div>
        </div>
        <div 
          ref={mapRef} 
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 h-[400px] shadow-inner overflow-hidden relative"
        >
           {!(window as any).google && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-50 dark:bg-slate-800/50">
             <Loader2 className="animate-spin" size={24} />
             <span className="text-xs font-bold uppercase tracking-widest">Initializing Map Engine...</span>
           </div>}
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-4 shadow-sm">
           <MapDetailItem label="Distance" value={mapDetails.distance || `${booking.distanceKm} km`} />
           <MapDetailItem label="Est. Time" value={mapDetails.duration || '--'} />
           <MapDetailItem label="Traffic" value={mapDetails.trafficStatus} statusColor={mapDetails.trafficStatus === 'Heavy' ? 'text-rose-500' : 'text-emerald-500'} />
        </div>
      </section>

      {/* Guide Card */}
      {guide && (
        <section className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
          <img src={guide.avatar} className="w-16 h-16 rounded-2xl object-cover shadow-lg" />
          <div className="flex-1">
             <h4 className="font-black text-slate-900 dark:text-white">{guide.name}</h4>
             <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-tighter">
               <Star size={10} className="text-amber-500 fill-amber-500"/> {guide.rating} • Assigned Expedition Lead
             </div>
          </div>
          <Link to={`/chat/${guide.id}`} className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-transform active:scale-90">
            <MessageCircle size={20}/>
          </Link>
        </section>
      )}

      {/* Cancel Action */}
      <section className="pt-8 border-t border-slate-100 dark:border-slate-900">
        <button 
          onClick={() => setShowCancelModal(true)}
          className="w-full flex items-center justify-center gap-2 p-5 border border-rose-100 text-rose-500 rounded-3xl font-black uppercase text-xs tracking-[0.2em] hover:bg-rose-50 transition-all active:scale-[0.98]"
        >
          <XCircle size={18} /> Cancel My Trip
        </button>
      </section>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-8 space-y-6 shadow-2xl animate-in zoom-in-95 ring-1 ring-white/10">
              <div className="flex justify-between items-start">
                 <div className="p-4 bg-rose-50 dark:bg-rose-900/30 rounded-2xl text-rose-500 shadow-inner">
                    <AlertCircle size={32}/>
                 </div>
                 <button onClick={() => setShowCancelModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">✕</button>
              </div>
              <div className="space-y-3">
                 <h3 className="text-2xl font-black tracking-tight">Abort Expedition?</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                   Cancellation fee policy: 100% refund if &gt;24h before pickup. 95% refund if &lt;24h.
                 </p>
                 <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Eligible Refund</div>
                    <div className="text-2xl font-black text-emerald-600">₹{calculateRefund()}</div>
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
                   Return to Dashboard
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
    <div className="text-3xl font-black bg-white/5 p-3 rounded-2xl border border-white/10 tabular-nums shadow-inner">{value.toString().padStart(2, '0')}</div>
    <div className="text-[10px] font-black uppercase tracking-tighter text-slate-400">{label}</div>
  </div>
);

const MapDetailItem = ({ label, value, statusColor = "text-slate-900 dark:text-white" }: { label: string, value: string, statusColor?: string }) => (
  <div className="text-center space-y-1">
    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
    <div className={`text-xs font-black ${statusColor}`}>{value}</div>
  </div>
);

export default TripDashboard;
