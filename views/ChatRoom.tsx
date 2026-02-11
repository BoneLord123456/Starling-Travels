
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { MOCK_GUIDES } from '../constants';
import { Send, MapPin, ShieldAlert, ArrowLeft, Phone, MoreVertical } from 'lucide-react';

const ChatRoom = () => {
  const { guideId } = useParams<{ guideId: string }>();
  const [searchParams] = useSearchParams();
  const destId = searchParams.get('dest');
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { id: 'm1', sender: 'guide', text: 'Hello! Thanks for the booking. I am excited to show you the hidden gems of the city.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const guide = Object.values(MOCK_GUIDES).flat().find(g => g.id === guideId);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now().toString(), sender: 'user', text: input, timestamp: new Date() }]);
    setInput('');
    
    // Simple bot response for simulation
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'guide', text: "Got it! We'll meet at the central square at 9 AM as planned. Let me know if you have specific dietary restrictions.", timestamp: new Date() }]);
    }, 2000);
  };

  if (!guide) return <div className="p-8">Guide not found.</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white dark:bg-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 m-4">
      {/* Chat Header */}
      <header className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-slate-500"><ArrowLeft size={20} /></button>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white dark:border-slate-800 shadow-sm">
            <img src={guide.avatar} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-bold text-sm">{guide.name}</h3>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Online
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Phone size={18} /></button>
          <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><MoreVertical size={18} /></button>
        </div>
      </header>

      {/* Safety Notice */}
      <div className="p-2 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 text-[10px] text-center font-bold uppercase tracking-widest border-b border-rose-100 dark:border-rose-900/30 flex items-center justify-center gap-2">
        <ShieldAlert size={12} />
        Keep payments in-app to remain protected by Starling Safety Guarantee
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              m.sender === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none shadow-md' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm'
            }`}>
              {m.text}
              <div className={`text-[9px] mt-1 opacity-60 text-right`}>
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
        <button className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <MapPin size={20} />
        </button>
        <input 
          type="text" 
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-slate-100"
        />
        <button 
          onClick={handleSend}
          className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100 dark:shadow-none"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
