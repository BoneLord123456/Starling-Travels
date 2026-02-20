
import React, { useState, useEffect } from 'react';
import { Trophy, Users, Globe, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { User } from '../types';
import { apiService } from '../services/apiService';

const Leaderboard = () => {
  const [tab, setTab] = useState<'global' | 'friends'>('global');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [globalPlayers, setGlobalPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('ecobalance-user');
    if (saved) setCurrentUser(JSON.parse(saved));
    
    const fetchLeaderboard = async () => {
      setLoading(true);
      const data = await apiService.getLeaderboard();
      const mapped = data.map((u: any, idx: number) => ({
        rank: idx + 1,
        name: u.name,
        score: u.ecoPoints,
        trend: 'stable',
        isMe: u.name === (JSON.parse(saved || '{}').name)
      }));
      setGlobalPlayers(mapped);
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  const userName = currentUser?.name || 'Jane Starling';

  const friendPlayers = [
    { rank: 1, name: userName, score: currentUser?.ecoPoints || 0, trend: 'up', isMe: true },
  ];

  const currentList = tab === 'global' ? globalPlayers : friendPlayers;

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="text-amber-500" />
          Eco Leaderboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Compete for the title of the safest traveler.</p>
      </header>

      <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
        <button 
          onClick={() => setTab('global')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${tab === 'global' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
        >
          <Globe size={16} /> Global
        </button>
        <button 
          onClick={() => setTab('friends')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${tab === 'friends' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
        >
          <Users size={16} /> Friends
        </button>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
            <Loader2 className="animate-spin" size={32} />
            <span className="text-xs font-bold uppercase tracking-widest">Syncing Global Rankings...</span>
          </div>
        ) : currentList.length > 0 ? (
          currentList.map((player) => (
            <div 
              key={player.name} 
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${player.isMe ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 ring-2 ring-indigo-500/20' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${player.rank === 1 ? 'bg-amber-100 text-amber-600' : player.rank === 2 ? 'bg-slate-100 text-slate-500' : player.rank === 3 ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                {player.rank}
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 shadow-inner">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                  {player.name}
                  {player.isMe && <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">You</span>}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">Eco Impact Rating</div>
              </div>
              <div className="text-right">
                <div className="font-black text-indigo-600 dark:text-indigo-400">{player.score.toFixed(1)}</div>
                <div className="flex justify-end">
                  {player.trend === 'up' && <ChevronUp size={14} className="text-emerald-500" />}
                  {player.trend === 'down' && <ChevronDown size={14} className="text-rose-500" />}
                  {player.trend === 'stable' && <div className="w-3.5 h-0.5 bg-slate-300 dark:bg-slate-600 mt-1.5" />}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-12 text-slate-400 text-xs font-bold uppercase">No rankings found. Be the first!</div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl text-center space-y-2 shadow-sm">
        <h3 className="font-bold text-slate-800 dark:text-white">Your Impact Matters, {userName}!</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 px-4">Keep completing weekly challenges to climb the ranks and unlock exclusive travel safe-passes.</p>
      </div>
    </div>
  );
};

export default Leaderboard;
