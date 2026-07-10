import React from 'react';
import { UserStats } from '../types';

interface Props {
  stats: UserStats;
}

export const StatusBar: React.FC<Props> = ({ stats }) => {
  const current = stats.currentLevel;
  const target = stats.targetLevel;
  const levelProgress = Math.min((stats.missionsCleared % 10) * 10, 100);
  const mission = stats.currentMission;

  return (
    <header className="h-20 border-b-2 border-emerald-900/50 flex items-center justify-between px-6 mb-4 select-none bg-[#0f1520]">
      <div className="flex gap-12 items-center">
        <div className="flex flex-col gap-1.5">
          <div className="text-[10px] opacity-50 text-white uppercase tracking-widest font-mono">// NODE_PROGRESS</div>
          <div className="flex flex-col gap-2">
            <div className="text-emerald-400 font-bold tracking-widest text-sm font-mono">
              TOPIK_{current} <span className="text-emerald-500/50 mx-1">→</span> TOPIK_{target}
            </div>
            <div className="w-full h-1 bg-slate-900 overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${levelProgress}%` }} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="text-[10px] opacity-50 text-white uppercase tracking-widest font-mono">// MISSION</div>
          <div className="text-white font-mono text-sm tracking-wide">
            {mission?.description ? mission.description.toUpperCase() : 'INITIALIZING'} <span className="text-slate-500 ml-1">({mission?.progress || 0}/{mission?.goal || 0})</span>
          </div>
        </div>
      </div>

      <div className="flex gap-8 items-center">
        {stats.streak !== undefined && (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-950/20 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <span className="text-sm">🔥</span>
            <span className="text-xs font-bold tracking-widest uppercase font-mono">STREAK ×{stats.streak}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <span className="opacity-50 text-white uppercase tracking-widest text-[10px] font-mono">CREDITS</span>
          <span className="text-emerald-400 font-mono font-bold text-xl tracking-widest">
            {stats.credits.toLocaleString().padStart(7, '0')}
          </span>
        </div>
      </div>
    </header>
  );
};

