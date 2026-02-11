
import React, { useState } from 'react';
import { Camera, Recycle, CheckCircle2, Info, Loader2, Sparkles, Receipt, Droplets, MapPin } from 'lucide-react';
import { analyzeWasteImage } from '../services/geminiService';
import { MOCK_DESTINATIONS } from '../constants';

const WasteSubmission = () => {
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(MOCK_DESTINATIONS[0].id);
  const [result, setResult] = useState<any>(null);

  const handleSimulateUpload = async () => {
    setIsAnalyzing(true);
    const res = await analyzeWasteImage(""); 
    setResult(res);
    
    // Save to global bottle count simulation
    const bottles = Math.floor(res.weightKg / 0.5);
    const currentBottles = parseInt(localStorage.getItem('starling-bottles') || '0');
    localStorage.setItem('starling-bottles', (currentBottles + bottles).toString());
    window.dispatchEvent(new Event('storage'));

    setIsAnalyzing(false);
    setStep(2);
  };

  const calculateBottles = (weight: number) => {
    return Math.floor(weight / 0.5);
  };

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Waste-to-Water Rewards</h1>
        <p className="text-slate-500">Collect waste during your trips and earn physical 500ml water bottles at our partner stations.</p>
      </header>

      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-2xl p-8 text-center text-white space-y-4 shadow-xl">
            <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center mx-auto border-4 border-indigo-400">
              <Camera size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Submit Your Collection</h2>
              <p className="text-indigo-100 text-sm opacity-90">1 × 500ml Bottle earned per 0.5kg waste submitted.</p>
            </div>
            <button 
              onClick={handleSimulateUpload}
              disabled={isAnalyzing}
              className="w-full bg-white text-indigo-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin" />
                  AI Analysis...
                </>
              ) : (
                'Scan Waste Now'
              )}
            </button>
          </div>

          <div className="grid gap-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Drop-off Point</h3>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Verified Destination</label>
              <select 
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full bg-transparent font-medium focus:outline-none dark:text-slate-100"
              >
                {MOCK_DESTINATIONS.map(d => (
                  <option key={d.id} value={d.id}>{d.name}, {d.country}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex gap-3">
            <Info className="text-blue-500 shrink-0" size={20} />
            <div className="space-y-1">
                <p className="text-xs text-blue-800 dark:text-blue-300 font-bold">Redeemable Locations:</p>
                <ul className="text-[10px] text-blue-700 dark:text-blue-400 space-y-1">
                    <li className="flex items-center gap-1"><MapPin size={10}/> All Partner Tourist Centers</li>
                    <li className="flex items-center gap-1"><MapPin size={10}/> Certified Eco-Stations</li>
                    <li className="flex items-center gap-1"><MapPin size={10}/> Registered Tour Guide Bases</li>
                </ul>
            </div>
          </div>
        </div>
      )}

      {step === 2 && result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
            <div className="bg-indigo-600 p-6 text-white text-center">
              <CheckCircle2 size={48} className="mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Contribution Verified!</h2>
              <p className="text-indigo-100">Rewards added to your physical inventory.</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Waste Mass</div>
                  <div className="text-2xl font-black text-slate-800 dark:text-white">{result.weightKg.toFixed(1)} kg</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Quality Score</div>
                  <div className="text-2xl font-black text-emerald-600">{result.qualityScore}%</div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl flex items-center gap-3">
                <Sparkles className="text-amber-500" size={20} />
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{result.description}</p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-800 text-center space-y-3">
                <div className="text-blue-800 dark:text-blue-300 font-black text-xs tracking-widest uppercase">Physical Reward Earned</div>
                <div className="flex items-center justify-center gap-3">
                   <Droplets className="text-blue-500" size={32} />
                   <div className="text-5xl font-black text-blue-600">{calculateBottles(result.weightKg)}</div>
                </div>
                <div className="text-sm font-bold text-blue-800 dark:text-blue-400">× 500ml Water Bottles</div>
                <div className="bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 inline-block px-4 py-1 rounded-lg font-mono text-xs text-blue-800 dark:text-blue-300 font-bold">
                  AUTHCODE: {Math.random().toString(36).substring(2, 7).toUpperCase()}
                </div>
                <p className="text-[10px] text-blue-600/70 pt-2 italic">Present this code at any Starling Eco-Station to redeem.</p>
              </div>

              <button 
                onClick={() => setStep(1)}
                className="w-full bg-slate-900 dark:bg-slate-800 text-white py-4 rounded-xl font-bold shadow-lg"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteSubmission;
