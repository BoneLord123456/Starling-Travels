
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MOCK_DESTINATIONS } from '../constants';
import { getHonestPlaceAdvice } from '../services/geminiService';
import { MessageCircleWarning, ArrowLeft, Send, Sparkles, Loader2, Info, Lock, Crown, ShieldAlert } from 'lucide-react';

const AIChat = () => {
  const { destId } = useParams<{ destId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(() => localStorage.getItem('starling-premium') === 'true');
  const scrollRef = useRef<HTMLDivElement>(null);

  const destination = MOCK_DESTINATIONS.find(d => d.id === destId);

  useEffect(() => {
    const handleStorage = () => setIsPremium(localStorage.getItem('starling-premium') === 'true');
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (destination && isPremium) {
      setMessages([
        { 
          role: 'ai', 
          text: `You're asking about ${destination.name}. I've got the raw sensor data: AQI is ${destination.metrics.airQualityAQI}, Noise is ${destination.metrics.noiseDB}dB. It's classified as ${destination.status}. What's on your mind? No sugarcoating here.`,
          timestamp: new Date() 
        }
      ]);
    }
  }, [destination, isPremium]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !destination || !isPremium) return;
    
    const userMsg = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const context = `Status: ${destination.status}. Metrics: ${JSON.stringify(destination.metrics)}. Signals: ${destination.localSignals.join(', ')}`;
    const aiResponse = await getHonestPlaceAdvice(destination.name, destination.metrics, destination.status, context, input);
    
    setMessages(prev => [...prev, { role: 'ai', text: aiResponse, timestamp: new Date() }]);
    setIsLoading(false);
  };

  if (!destination) return <div className="p-8">Destination not found.</div>;

  if (!isPremium) {
    return (
      <div className="flex flex-col h-[calc(100vh-140px)] bg-white dark:bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-rose-100 dark:border-rose-900/30 m-4">
        <header className="p-4 bg-slate-900 text-white flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-white/80"><ArrowLeft size={20} /></button>
          <div className="bg-white/10 p-2 rounded-xl">
            <Lock size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm">Honest AI Mode</h3>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1">
              <Crown size={10} /> Premium Feature
            </span>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 bg-slate-50 dark:bg-slate-900/50">
          <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-500 shadow-inner">
            <Lock size={40} />
          </div>
          <div className="space-y-2 max-w-xs">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">Unfiltered Truth Locked</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Our "Honest AI" provides brutally frank assessments based on raw environmental data. 
              Only Premium Safety Intelligence members can access this conversational mode.
            </p>
          </div>

          <div className="grid gap-3 w-full max-w-xs">
            <Link 
              to="/premium" 
              className="bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-indigo-200 dark:shadow-none transition-transform hover:scale-105 active:scale-95"
            >
              <Crown size={18} />
              Upgrade to Premium
            </Link>
            <button 
              onClick={() => navigate(-1)}
              className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-rose-500 font-bold text-[10px] uppercase">
                <ShieldAlert size={12} /> Unfiltered Destination Truth
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white dark:bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-rose-100 dark:border-rose-900/30 m-4">
      {/* AI Header */}
      <header className="p-4 bg-rose-500 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-white/80"><ArrowLeft size={20} /></button>
          <div className="bg-white/20 p-2 rounded-xl">
            <MessageCircleWarning size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm">Honest AI: {destination.name}</h3>
            <span className="text-[10px] text-white/80 font-bold uppercase tracking-widest">Raw Data Analysis Active</span>
          </div>
        </div>
        <div className="bg-white/10 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tighter">Sensor Driven</div>
      </header>

      {/* Info Notice */}
      <div className="p-2 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[10px] text-center font-medium border-b border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2">
        <Info size={12} />
        This AI interprets raw AQI, dB, and PPM metrics without marketing bias.
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-rose-50/20 via-transparent to-transparent">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-slate-800 text-white rounded-tr-none shadow-lg' 
                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-tl-none border border-rose-100 dark:border-rose-900 shadow-sm'
            }`}>
              {m.role === 'ai' && <div className="text-[10px] font-bold text-rose-500 uppercase mb-1 flex items-center gap-1"><Sparkles size={10} /> Starling Truth</div>}
              {m.text}
              <div className="text-[9px] mt-2 opacity-60 text-right">
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-2 text-rose-500">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs font-bold uppercase tracking-widest">Interpreting raw units...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
        <input 
          type="text" 
          placeholder="Is that noise level safe for sleep? ..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
          className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:text-slate-100 disabled:opacity-50"
        />
        <button 
          onClick={handleSend}
          disabled={isLoading}
          className="p-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors shadow-lg shadow-rose-100 dark:shadow-none disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </div>
    </div>
  );
};

export default AIChat;
