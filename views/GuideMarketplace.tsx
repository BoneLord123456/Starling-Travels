
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_DESTINATIONS, MOCK_GUIDES } from '../constants';
import { Star, ShieldCheck, Languages, MapPin, CreditCard, CheckCircle2, Loader2, ArrowLeft, Lock, Crown } from 'lucide-react';

const GuideMarketplace = () => {
  const { destId } = useParams<{ destId: string }>();
  const navigate = useNavigate();
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isPremium, setIsPremium] = useState(() => localStorage.getItem('starling-premium') === 'true');

  useEffect(() => {
    const handleStorage = () => setIsPremium(localStorage.getItem('starling-premium') === 'true');
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const destination = MOCK_DESTINATIONS.find(d => d.id === destId);
  const guides = MOCK_GUIDES[destId || ''] || [];

  const handlePay = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setIsPaid(true);
      setTimeout(() => {
        navigate(`/chat/${selectedGuide}?dest=${destId}`);
      }, 1500);
    }, 2000);
  };

  if (!destination) return <div className="p-8">Destination not found.</div>;

  return (
    <div className="p-6 space-y-8 pb-32">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Local Experts</h1>
          <p className="text-sm text-slate-500">{destination.name}, {destination.country}</p>
        </div>
      </header>

      <div className="grid gap-6">
        {guides.map(guide => {
          const isLocked = guide.isPremiumOnly && !isPremium;
          return (
            <div 
              key={guide.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all relative ${
                selectedGuide === guide.id ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-lg' : 'border-slate-200 dark:border-slate-800 shadow-sm'
              } ${isLocked ? 'opacity-60 grayscale' : 'cursor-pointer'}`}
              onClick={() => !isLocked && setSelectedGuide(guide.id)}
            >
              {guide.isPremiumOnly && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                  <Crown size={10} /> Premium Only
                </div>
              )}
              <div className="p-5">
                <div className="flex gap-4">
                  <div className="relative shrink-0">
                    <img src={guide.avatar} alt={guide.name} className="w-20 h-20 rounded-2xl object-cover" />
                    {guide.isSustainabilityCertified && (
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white dark:border-slate-900" title="Sustainability Certified">
                        <ShieldCheck size={12} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg">{guide.name}</h3>
                      <div className="text-right">
                        <div className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">${guide.pricePerDay}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">per day</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex text-amber-400">
                        <Star size={14} fill="currentColor" />
                      </div>
                      <span className="font-bold">{guide.rating}</span>
                      <span className="text-slate-400">({guide.reviewCount} reviews)</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {guide.expertise.map(exp => (
                        <span key={exp} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold uppercase text-slate-500 dark:text-slate-400">{exp}</span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {selectedGuide === guide.id && !isLocked && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                      "{guide.bio}"
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-bold uppercase">
                      <div className="flex items-center gap-1.5"><Languages size={14} /> {guide.languages.join(', ')}</div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePay(); }}
                      disabled={isPaying || isPaid}
                      className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isPaying ? <Loader2 size={18} className="animate-spin" /> : isPaid ? <CheckCircle2 size={18} /> : <CreditCard size={18} />}
                      {isPaying ? 'Processing...' : isPaid ? 'Payment Successful!' : `Book and Pay $${guide.pricePerDay}`}
                    </button>
                  </div>
                )}

                {isLocked && (
                  <div className="mt-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate('/premium'); }}
                      className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <Lock size={12} /> Unlock with Premium
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GuideMarketplace;
