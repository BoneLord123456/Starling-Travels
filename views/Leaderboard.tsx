
import React, { useState } from 'react';
import { Trophy, Users, Globe, ChevronUp, ChevronDown } from 'lucide-react';

const Leaderboard = () => {
  const [tab, setTab] = useState<'global' | 'friends'>('global');

  const globalPlayers = [
    { rank: 1, name: 'EcoKing_99', score: 98.4, trend: 'up' },
    { rank: 2, name: 'GreenTraveler', score: 97.2, trend: 'down' },
    { rank: 3, name: 'SafePaths', score: 95.8, trend: 'stable' },
    { rank: 4, name: 'Jane Starling', score: 92.0, trend: 'up', isMe: true },
    { rank: 5, name: 'OceanGuardian', score: 91.5, trend: 'down' },
    { rank: 6, name: 'ForestLover', score: 89.2, trend: 'up' },
    { rank: 7, name: 'EcoNomad', score: 88.0, trend: 'stable' },
  ];

  const friendPlayers = [
    { rank: 1, name: 'Jane Starling', score: 92.0, trend: 'up', isMe: true },
    { rank: 2, name: 'TomTravels', score: 84.5, trend: 'down' },
    { rank: 3, name: 'SustainableSara', score: 79.2, trend: 'up' },
    { rank: 4, name: 'EcoBob', score: 65.0, trend: 'down' },
  ];

  const currentList = tab === 'global' ? globalPlayers : friendPlayers;

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Trophy className="text-amber-500" />
          Eco Leaderboard
        </h1>
        <p className="text-slate-500 text-sm">Compete for the title of the safest traveler.</p>
      </header>

      <div className="flex bg-slate-200 p-1 rounded-xl">
        <button 
          onClick={() => setTab('global')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${tab === 'global' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
        >
          <Globe size={16} /> Global
        </button>
        <button 
          onClick={() => setTab('friends')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${tab === 'friends' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
        >
          <Users size={16} /> Friends
        </button>
      </div>

      <div className="space-y-2">
        {currentList.map((player) => (
          <div 
            key={player.name} 
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${player.isMe ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/20' : 'bg-white border-slate-100'}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${player.rank === 1 ? 'bg-amber-100 text-amber-600' : player.rank === 2 ? 'bg-slate-100 text-slate-500' : player.rank === 3 ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
              {player.rank}
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
              <img src={`https://picsum.photos/seed/${player.name}/100`} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                {player.name}
                {player.isMe && <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">You</span>}
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Eco Impact Rating</div>
            </div>
            <div className="text-right">
              <div className="font-black text-indigo-600">{player.score.toFixed(1)}</div>
              <div className="flex justify-end">
                {player.trend === 'up' && <ChevronUp size={14} className="text-emerald-500" />}
                {player.trend === 'down' && <ChevronDown size={14} className="text-rose-500" />}
                {player.trend === 'stable' && <div className="w-3.5 h-0.5 bg-slate-300 mt-1.5" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-100 p-6 rounded-2xl text-center space-y-2 shadow-sm">
        <h3 className="font-bold text-slate-800">Your Impact Matters!</h3>
        <p className="text-sm text-slate-500 px-4">Keep completing weekly challenges to climb the ranks and unlock exclusive travel safe-passes.</p>
      </div>
    </div>
  );
};

export default Leaderboard;
