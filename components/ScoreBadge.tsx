
import React from 'react';
import { DestinationStatus } from '../types';

interface ScoreBadgeProps {
  status: DestinationStatus;
  size?: 'sm' | 'md' | 'lg';
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ status, size = 'md' }) => {
  const getColors = (s: DestinationStatus) => {
    switch (s) {
      case 'Recommended': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Caution Advised': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Risky': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Not Recommended': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-4 py-2'
  };

  return (
    <div className={`inline-flex items-center gap-2 font-black uppercase tracking-widest rounded-full border shadow-sm ${getColors(status)} ${sizeClasses[size]}`}>
      <span>{status}</span>
    </div>
  );
};

export default ScoreBadge;
