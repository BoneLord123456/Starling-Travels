
import React, { useState, useEffect } from 'react';
import { Crown, Check, Zap, Sparkles, ShieldCheck, Map, ArrowLeft, Star, Loader2, AlertCircle, X, CheckCircle2, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Premium = () => {
  const navigate = useNavigate();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [justCancelled, setJustCancelled] = useState(false);

  // Persistence State
  const [isPremium, setIsPremium] = useState(() => localStorage.getItem('starling-premium') === 'true');
  const [expiryDate, setExpiryDate] = useState(() => localStorage.getItem('starling-premium-expiry') || '');
  const [status, setStatus] = useState(() => localStorage.getItem('starling-premium-status') || 'inactive');

  useEffect(() => {
    const handleStorage = () => {
      setIsPremium(localStorage.getItem('starling-premium') === 'true');
      setExpiryDate(localStorage.getItem('starling-premium-expiry') || '');
      setStatus(localStorage.getItem('starling-premium-status') || 'inactive');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleUpgrade = () => {
    setIsUpgrading(true);
    setTimeout(() => {
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 30);
      const expiryStr = nextMonth.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      
      localStorage.setItem('starling-premium', 'true');
      localStorage.setItem('starling-premium-expiry', expiryStr);
      localStorage.setItem('starling-premium-status', 'active');
      
      setIsPremium(true);
      setExpiryDate(expiryStr);
      setStatus('active');
      setIsUpgrading(false);
      window.dispatchEvent(new Event('storage'));
    }, 1500);
  };

  const handleConfirmCancel = () => {
    setIsCancelling(true);
    setTimeout(() => {
      // Logic: Premium stays active but status changes to cancelled
      localStorage.setItem('starling-premium-status', 'cancelled');
      setStatus('cancelled');
      setIsCancelling(false);
      setShowCancelConfirm(false);
      setJustCancelled(true);
      window.dispatchEvent(new Event('storage'));
    }, 1200);
  };

  const handleRestartSubscription = () => {
    localStorage.setItem('starling-premium-status', 'active');
    setStatus('active');
    setJustCancelled(false);
    window.dispatchEvent(new Event('storage'));
  };

  const resetAllForDemo = () => {
    localStorage.removeItem('starling-premium');
    localStorage.removeItem('starling-premium-expiry');
    localStorage.removeItem('starling-premium-status');
    setIsPremium(false);
    setExpiryDate('');
    setStatus('inactive');
    setJustCancelled(false);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto pb-32">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Subscription</h1>
      </header>

      {/* Success Notification */}
      {justCancelled && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
          <div className="space-y-1">
            <h4 className="font-bold text-emerald-800 dark:text-emerald-400 text-sm">Cancellation Confirmed</h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-500 leading-relaxed">
              Your subscription has been cancelled. You will retain all premium benefits until <strong>{expiryDate}</strong>. No further charges will occur.
            </p>
            <button 
              onClick={() => setJustCancelled(false)}
              className="text-[10px] font-black uppercase text-emerald-600 mt-2 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {isPremium ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full w-fit">
                  <Crown size={10} /> {status === 'cancelled' ? 'Expiring Soon' : 'Active Plan'}
                </div>
                <h2 className="text-2xl font-black">Starling Premium</h2>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black">$9.99</div>
                <div className="text-[10px] font-bold uppercase opacity-80">Monthly Plan</div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Next Billing Date</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{status === 'cancelled' ? 'None (Cancelled)' : expiryDate}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Access Period End</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{expiryDate}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <History size={14} /> Payment History
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Invoice #ST-8291 (Last Month)</span>
                  <span className="font-bold text-emerald-500">Paid</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                {status === 'active' ? (
                  <button 
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full bg-rose-50 text-rose-600 dark:bg-rose-900/10 dark:text-rose-400 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors border border-rose-100 dark:border-rose-900/30"
                  >
                    Cancel Subscription
                  </button>
                ) : (
                  <button 
                    onClick={handleRestartSubscription}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg"
                  >
                    <Zap size={18} /> Resume Subscription
                  </button>
                )}
                <button 
                  onClick={resetAllForDemo}
                  className="text-[10px] font-bold text-slate-300 uppercase tracking-widest hover:text-slate-500"
                >
                  Full Reset (Demo Only)
                </button>
              </div>
            </div>
          </div>

          {status === 'cancelled' && (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-2xl flex items-start gap-3">
              <AlertCircle className="text-amber-500 shrink-0" size={20} />
              <div className="space-y-1">
                <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm">Action Required</h4>
                <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
                  Your premium safety intelligence will deactivate on {expiryDate}. After this, you will lose access to "Honest AI" and Priority Safety Alerts.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Crown size={120} />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="bg-white/20 inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">Elevated Safety</div>
            <h2 className="text-4xl font-black leading-tight">Master the Art of Safe Traveling.</h2>
            <p className="text-indigo-100 text-lg opacity-90">Unlock our most advanced AI simulations and priority alerts for pristine destinations.</p>
            
            <div className="pt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black">$9.99</span>
              <span className="text-indigo-200 font-bold">/ month</span>
            </div>
            
            <button 
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUpgrading ? <Loader2 size={20} className="animate-spin" /> : <Crown size={20} />}
              {isUpgrading ? 'Authorizing...' : 'Upgrade Now'}
            </button>
            <p className="text-center text-[10px] font-bold opacity-60 uppercase tracking-widest">No long-term contracts. Cancel easily anytime.</p>
          </div>
        </div>
      )}

      {/* Features Grid */}
      {!justCancelled && (
        <div className="grid gap-6">
          <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-widest text-xs flex items-center gap-2">
            <Star size={14} className="text-amber-500" /> Premium Benefits
          </h3>
          
          <div className="space-y-4">
            <PremiumFeature 
              icon={<Sparkles className="text-indigo-500" />} 
              title="Advanced AI Trip Optimization" 
              desc="Deep budget simulations that analyze trade-offs between cost, safety, and comfort automatically."
            />
            <PremiumFeature 
              icon={<ShieldCheck className="text-emerald-500" />} 
              title="Priority Safety Alerts" 
              desc="Get 24h early warning on rapidly declining environmental scores or surge overcrowding."
            />
            <PremiumFeature 
              icon={<Map className="text-blue-500" />} 
              title="Hidden Gem Discovery" 
              desc="Access curated lists of the top 1% safest and most sustainable secret spots globally."
            />
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl text-rose-500">
                <AlertCircle size={32} />
              </div>
              <button onClick={() => setShowCancelConfirm(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Cancel your subscription?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                We're sorry to see you go. You will continue to have access to all premium features until <strong>{expiryDate}</strong>.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200 dark:shadow-none disabled:opacity-50"
              >
                {isCancelling ? <Loader2 className="animate-spin" /> : 'Yes, Cancel Subscription'}
              </button>
              <button 
                onClick={() => setShowCancelConfirm(false)}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-4 rounded-2xl font-bold"
              >
                Keep Premium Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PremiumFeature = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
    <div className="shrink-0 mt-1">{icon}</div>
    <div className="space-y-1">
      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default Premium;
