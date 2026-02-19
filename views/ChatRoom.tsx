
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { MOCK_GUIDES } from '../constants';
import { Send, MapPin, ShieldAlert, ArrowLeft, Phone, MoreVertical, Loader2 } from 'lucide-react';
import { TourGuide } from '../types';

const ChatRoom = () => {
  const { guideId } = useParams<{ guideId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { id: 'm1', sender: 'guide', text: 'Namaste! I have received your itinerary for the expedition. I am currently preparing the high-clearance EV for our journey.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const guide = (Object.values(MOCK_GUIDES).flat() as TourGuide[]).find(g => g.id === guideId);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), sender: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    // Typing Simulation
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          sender: 'guide', 
          text: "Understood. I've noted the pickup location. We'll be monitoring the air quality index in real-time during our trek. See you soon!", 
          timestamp: new Date() 
        }]);
      }, 2500);
    }, 800);
  };

  if (!guide) return <div className="p-8">Expedition lead not found in database.</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 m-4 animate-in fade-in duration-500">
      {/* Chat Header */}
      <header className="p-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-emerald-500 transition-colors"><ArrowLeft size={24} /></button>
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-500/20 shadow-sm">
              <img src={guide.avatar} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 dark:text-white leading-none">{guide.name}</h3>
            <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1.5 mt-1">
              Active Lead
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"><Phone size={20} /></button>
          <button className="p-2.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"><MoreVertical size={20} /></button>
        </div>
      </header>

      {/* Safety Notice */}
      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[10px] text-center font-black uppercase tracking-widest border-b border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center gap-2">
        <ShieldAlert size={14} />
        Encrypted P2P Communication Channel
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed ${
              m.sender === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-none shadow-xl shadow-emerald-500/10' 
                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-800 shadow-sm'
            }`}>
              {m.text}
              <div className={`text-[9px] mt-2 opacity-50 font-black uppercase text-right`}>
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl rounded-tl-none border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-sm">
               <Loader2 size={16} className="animate-spin text-emerald-500" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guide is typing...</span>
             </div>
           </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-3 shadow-inner">
        <button className="p-3.5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl hover:text-emerald-500 transition-all active:scale-90">
          <MapPin size={24} />
        </button>
        <input 
          type="text" 
          placeholder="Message your expedition lead..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-2xl px-5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:text-slate-100 font-medium"
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim()}
          className="p-3.5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 active:scale-95"
        >
          <Send size={24} />
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
